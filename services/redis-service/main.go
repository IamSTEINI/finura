package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

type Config struct {
	RedisHost            string
	RedisPort            string
	RedisPassword        string
	JWTSecret            string
	AccessPort           string
	ProxyTargetURL       string
	MaxRequestsPerMinute int
	BlockDuration        time.Duration
	SessionTTL           time.Duration
	RequestTimeout       time.Duration
}

type SessionManager struct {
	rdb *redis.Client
}

type RateLimiter struct {
	rdb *redis.Client
}

func LoadConfig() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		log.Printf("[WARN] .env not loaded: %v", err)
	}
	c := &Config{
		RedisHost:            getEnv("REDIS_HOST", "localhost"),
		RedisPort:            getEnv("REDIS_PORT", "6379"),
		RedisPassword:        os.Getenv("REDIS_PASSWORD"),
		JWTSecret:            os.Getenv("JWT_SECRET"),
		AccessPort:           getEnv("ACCESS_PORT", "8080"),
		ProxyTargetURL:       getEnv("PROXY_TARGET_URL", "http://localhost:10000"),
		MaxRequestsPerMinute: getEnvInt("MAX_REQUESTS_PER_MINUTE", 60),
		BlockDuration:        time.Duration(getEnvInt("BLOCK_DURATION_MINUTES", 5)) * time.Minute,
		SessionTTL:           time.Duration(getEnvInt("SESSION_TTL_HOURS", 24)) * time.Hour,
		RequestTimeout:       time.Duration(getEnvInt("REQUEST_TIMEOUT_SECONDS", 10)) * time.Second,
	}
	if c.JWTSecret == "" {
		return nil, errors.New("JWT_SECRET is required")
	}
	return c, nil
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getEnvInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return def
}

type Server struct {
	rdb            *redis.Client
	rateLimiter    *RateLimiter
	sessionManager *SessionManager
	jwtSecret      []byte
	config         *Config
}

type Claims struct {
	UserID    string `json:"user_id"`
	Username  string `json:"username"`
	SessionID string `json:"session_id"`
	jwt.RegisteredClaims
}

type UserSession struct {
	UserID    string    `json:"user_id"`
	Username  string    `json:"username"`
	Roles     []string  `json:"roles"`
	LoginTime time.Time `json:"login_time"`
	LastSeen  time.Time `json:"last_seen"`
	IPAddress string    `json:"ip_address"`
}

type RateLimitResult struct {
	Allowed    bool
	Remaining  int
	ResetTime  time.Time
	RetryAfter time.Duration
}

func NewServer() (*Server, error) {
	cfg, err := LoadConfig()
	if err != nil {
		return nil, err
	}
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
		Password: cfg.RedisPassword,
		PoolSize: 50,
	})
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, err
	}
	return &Server{
		rdb:            rdb,
		rateLimiter:    NewRateLimiter(rdb),
		sessionManager: NewSessionManager(rdb),
		jwtSecret:      []byte(cfg.JWTSecret),
		config:         cfg,
	}, nil
}

func main() {
	server, err := NewServer()
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
	r := chi.NewRouter()

	testSessionID := "test_session_" + strconv.FormatInt(time.Now().Unix(), 10)
	testSession := &UserSession{
		UserID:    "0",
		Username:  "TestUser",
		LoginTime: time.Now(),
		LastSeen:  time.Now(),
		IPAddress: "127.0.0.1",
		Roles:     []string{"TEST"},
	}

	err = server.sessionManager.CreateSession(context.Background(), testSessionID, testSession, server.config.SessionTTL)
	if err != nil {
		log.Printf("[ERROR] Failed to create test session: %v", err)
	} else {
		testToken, _ := server.createJWT("0", "TestUser", testSessionID, 24*time.Hour)
		log.Printf("[DEV] Test token: %s", testToken)
		log.Printf("[DEV] Test sessionID: %s", testSessionID)
	}

	r.Use(
		middleware.Logger,
		middleware.Recoverer,
		middleware.Timeout(30*time.Second),
		server.RateLimitMiddleware,
	)

	r.Mount("/noauth", publicRouter(server))
	r.Mount("/api", authRouter(server))

	log.Printf("Server listening on port %s", server.config.AccessPort)
	http.ListenAndServe(
		":"+server.config.AccessPort,
		r,
	)
}

func publicRouter(s *Server) http.Handler {
	r := chi.NewRouter()
	// r.HandleFunc("/*", s.ApiHandler)
	r.Post("/login", s.Login)
	r.Post("/refresh", s.RefreshSession)
	return r
}

func authRouter(s *Server) http.Handler {
	r := chi.NewRouter()
	r.Use(s.AuthMiddleware)
	r.Post("/logout", s.Logout)

	proxy := newReverseProxy(s.config.ProxyTargetURL)
	r.Handle("/*", proxy)
	return r
}

type reverseProxy struct {
	proxy *httputil.ReverseProxy
}

func newReverseProxy(target string) *reverseProxy {
	tgt, err := url.Parse(target)
	if err != nil {
		log.Fatalf("Invalid PROXY_TARGET_URL: %v", err)
	}
	director := func(req *http.Request) {
		if req.URL.Path == "/login" {
			req.URL.Scheme = tgt.Scheme
			req.URL.Host = tgt.Host
			req.Host = tgt.Host
			return
		}

		path := chi.URLParam(req, "*")
		req.URL.Scheme = tgt.Scheme
		req.URL.Host = tgt.Host
		req.URL.Path = joinPath(tgt.Path, path)
		req.Host = tgt.Host
	}
	transport := &http.Transport{
		MaxIdleConns:    100,
		IdleConnTimeout: 90 * time.Second,
	}
	return &reverseProxy{proxy: &httputil.ReverseProxy{
		Director:  director,
		Transport: transport,
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			log.Printf("[PROXY ERROR] %v", err)
			http.Error(w, "Bad Gateway", http.StatusBadGateway)
		},
	}}
}

func (rp *reverseProxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	rp.proxy.ServeHTTP(w, r)
}

func joinPath(base, path string) string {
	base = strings.TrimRight(base, "/")
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	return base + path
}

func NewSessionManager(rdb *redis.Client) *SessionManager {
	return &SessionManager{rdb: rdb}
}

func (sm *SessionManager) CreateSession(ctx context.Context, sessionID string, session *UserSession, ttl time.Duration) error {
	sessionData, err := json.Marshal(session)
	if err != nil {
		return fmt.Errorf("failed to marshal session: %w", err)
	}

	key := fmt.Sprintf("session:%s", sessionID)
	err = sm.rdb.Set(ctx, key, sessionData, ttl).Err()
	if err != nil {
		return fmt.Errorf("failed to store session: %w", err)
	}

	return nil
}

func (sm *SessionManager) GetSession(ctx context.Context, sessionID string) (*UserSession, error) {
	key := fmt.Sprintf("session:%s", sessionID)

	data, err := sm.rdb.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, errors.New("session not found")
		}
		return nil, fmt.Errorf("failed to get session: %w", err)
	}

	var session UserSession
	err = json.Unmarshal([]byte(data), &session)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal session: %w", err)
	}

	return &session, nil
}

func (sm *SessionManager) UpdateSession(ctx context.Context, sessionID string, ttl time.Duration) error {
	session, err := sm.GetSession(ctx, sessionID)
	if err != nil {
		return err
	}

	session.LastSeen = time.Now()
	return sm.CreateSession(ctx, sessionID, session, ttl)
}

func (sm *SessionManager) DeleteSession(ctx context.Context, sessionID string) error {
	key := fmt.Sprintf("session:%s", sessionID)
	return sm.rdb.Del(ctx, key).Err()
}

func NewRateLimiter(rdb *redis.Client) *RateLimiter {
	return &RateLimiter{rdb: rdb}
}

func (rl *RateLimiter) CheckLimit(ctx context.Context, key string, limit int, window time.Duration) (*RateLimitResult, error) {
	now := time.Now()
	windowStart := now.Add(-window)

	pipe := rl.rdb.Pipeline()

	pipe.ZRemRangeByScore(ctx, key, "0", fmt.Sprintf("%d", windowStart.UnixNano()))

	countCmd := pipe.ZCard(ctx, key)

	pipe.ZAdd(ctx, key, redis.Z{
		Score:  float64(now.UnixNano()),
		Member: fmt.Sprintf("%d-%d", now.UnixNano(), now.Unix()),
	})

	pipe.Expire(ctx, key, window+time.Minute)

	_, err := pipe.Exec(ctx)
	if err != nil {
		return nil, fmt.Errorf("redis pipeline error: %w", err)
	}

	currentCount := int(countCmd.Val())
	resetTime := now.Add(window)
	remaining := limit - currentCount
	if remaining < 0 {
		remaining = 0
	}

	result := &RateLimitResult{
		Allowed:   currentCount <= limit,
		Remaining: remaining,
		ResetTime: resetTime,
	}

	if !result.Allowed {
		oldestCmd := rl.rdb.ZRange(ctx, key, 0, 0)
		if oldestEntries, err := oldestCmd.Result(); err == nil && len(oldestEntries) > 0 {
			parts := strings.Split(oldestEntries[0], "-")
			if len(parts) >= 2 {
				if oldestNano, err := strconv.ParseInt(parts[0], 10, 64); err == nil {
					oldestTime := time.Unix(0, oldestNano)
					result.RetryAfter = window - now.Sub(oldestTime)
					if result.RetryAfter < 0 {
						result.RetryAfter = 0
					}
				}
			}
		}

		if result.RetryAfter == 0 {
			result.RetryAfter = time.Minute
		}
	}

	return result, nil
}

func (rl *RateLimiter) IsBlocked(ctx context.Context, ip string) (bool, error) {
	blockKey := fmt.Sprintf("ratelimit:block:%s", ip)
	exists, err := rl.rdb.Exists(ctx, blockKey).Result()
	if err != nil {
		return false, fmt.Errorf("failed to check block status: %w", err)
	}
	return exists == 1, nil
}

func (rl *RateLimiter) BlockIP(ctx context.Context, ip string, duration time.Duration) error {
	blockKey := fmt.Sprintf("ratelimit:block:%s", ip)
	err := rl.rdb.Set(ctx, blockKey, time.Now().Unix(), duration).Err()
	if err != nil {
		return fmt.Errorf("failed to block IP: %w", err)
	}
	log.Printf("[SECURITY] IP %s blocked for %v", ip, duration)
	return nil
}

func getClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		ips := strings.Split(xff, ",")
		return strings.TrimSpace(ips[0])
	}

	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}

	ip := r.RemoteAddr
	if colon := strings.LastIndex(ip, ":"); colon != -1 {
		ip = ip[:colon]
	}
	return ip
}

func (s *Server) RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := getClientIP(r)
		ctx := r.Context()

		blocked, err := s.rateLimiter.IsBlocked(ctx, ip)
		if err != nil {
			log.Printf("[ERROR] Failed to check block status for IP %s: %v", ip, err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		if blocked {
			log.Printf("[BLOCKED] Request from blocked IP: %s to %s", ip, r.URL.Path)
			w.Header().Set("Retry-After", fmt.Sprintf("%.0f", s.config.BlockDuration.Seconds()))
			http.Error(w, "IP temporarily blocked due to rate limit violations", http.StatusTooManyRequests)
			return
		}

		rateLimitKey := fmt.Sprintf("ratelimit:%s", ip)
		result, err := s.rateLimiter.CheckLimit(ctx, rateLimitKey, s.config.MaxRequestsPerMinute, time.Minute)
		if err != nil {
			log.Printf("[ERROR] Rate limit check failed for IP %s: %v", ip, err)
			next.ServeHTTP(w, r)
			return
		}

		w.Header().Set("X-RateLimit-Limit", strconv.Itoa(s.config.MaxRequestsPerMinute))
		w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(result.Remaining))
		w.Header().Set("X-RateLimit-Reset", strconv.FormatInt(result.ResetTime.Unix(), 10))

		if !result.Allowed {
			log.Printf("[RATE_LIMITED] IP %s exceeded rate limit (%d requests/minute) for path %s", ip, s.config.MaxRequestsPerMinute, r.URL.Path)

			if err := s.rateLimiter.BlockIP(ctx, ip, s.config.BlockDuration); err != nil {
				log.Printf("[ERROR] Failed to block IP %s: %v", ip, err)
			}

			w.Header().Set("Retry-After", fmt.Sprintf("%.0f", result.RetryAfter.Seconds()))
			http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (s *Server) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := getClientIP(r)
		ctx := r.Context()

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			log.Printf("[AUTH] Missing Authorization header from IP %s for path %s", ip, r.URL.Path)
			http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
			return
		}

		tokenString, err := extractBearerToken(authHeader)
		if err != nil {
			log.Printf("[AUTH] Invalid Authorization header from IP %s for path %s", ip, r.URL.Path)
			http.Error(w, "Invalid Authorization header format", http.StatusUnauthorized)
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return s.jwtSecret, nil
		})

		if err != nil || !token.Valid {
			log.Printf("[AUTH] Invalid/expired JWT from IP %s for path %s: %v", ip, r.URL.Path, err)
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		session, err := s.sessionManager.GetSession(ctx, claims.SessionID)
		if err != nil {
			log.Printf("[AUTH] Session validation failed for user %s from IP %s for path %s: %v", claims.UserID, ip, r.URL.Path, err)
			http.Error(w, "Session expired or invalid", http.StatusUnauthorized)
			return
		}
		if session.UserID != claims.UserID {
			log.Printf("[AUTH] Session mismatch for user %s from IP %s for path %s", claims.UserID, ip, r.URL.Path)
			http.Error(w, "Session validation failed", http.StatusUnauthorized)
			return
		}
		if err := s.sessionManager.UpdateSession(ctx, claims.SessionID, s.config.SessionTTL); err != nil {
			log.Printf("[WARN] Failed to update session for user %s: %v", claims.UserID, err)
		}

		ctx = context.WithValue(ctx, "user", claims)
		ctx = context.WithValue(ctx, "session", session)
		ctx = context.WithValue(ctx, "session_id", claims.SessionID)

		log.Printf("[AUTH] Successful authentication for user %s (%s) from IP %s accessing %s", claims.UserID, claims.Username, ip, r.URL.Path)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func extractBearerToken(authHeader string) (string, error) {
	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return "", errors.New("invalid authorization header format")
	}
	return parts[1], nil
}

func (s *Server) createJWT(userID, username, sessionID string, ttl time.Duration) (string, error) {
	claims := &Claims{
		UserID:    userID,
		Username:  username,
		SessionID: sessionID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *Server) createRefreshToken(userID, username, sessionID string, ttl time.Duration) (string, error) {
	claims := jwt.MapClaims{
		"user_id":    userID,
		"username":   username,
		"session_id": sessionID,
		"type":       "refresh",
		"exp":        time.Now().Add(ttl).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.config.JWTSecret))
}

func (s *Server) RefreshSession(w http.ResponseWriter, r *http.Request) {
	ip := getClientIP(r)

	allowedIPs := map[string]bool{
		"127.0.0.1": true,
		"::1":       true,
		"[::1]":     true,
	}
	if !allowedIPs[ip] {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
		return
	}

	refreshTokenStr, err := extractBearerToken(authHeader)
	if err != nil {
		http.Error(w, "Invalid Authorization header format", http.StatusUnauthorized)
		return
	}

	token, err := jwt.Parse(refreshTokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return s.jwtSecret, nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid or expired refresh token", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || claims["type"] != "refresh" {
		http.Error(w, "Invalid refresh token", http.StatusUnauthorized)
		return
	}

	userID, _ := claims["user_id"].(string)
	username, _ := claims["username"].(string)
	sessionID, _ := claims["session_id"].(string)

	accessToken, err := s.createJWT(userID, username, sessionID, s.config.SessionTTL)
	if err != nil {
		http.Error(w, "Failed to create access token", http.StatusInternalServerError)
		return
	}

	log.Printf("[SESSION REFRESH] User %s (%s) refreshed session successfully", userID, username)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token":      accessToken,
		"session_id": sessionID,
		"expires_in": int(s.config.SessionTTL.Seconds()),
		"user_id":    userID,
		"username":   username,
	})
}

func (s *Server) Login(w http.ResponseWriter, r *http.Request) {
	ip := getClientIP(r)

	allowedIPs := map[string]bool{
		"127.0.0.1": true,
		"::1":       true,
		"[::1]":     true,
	}
	if !allowedIPs[ip] {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var data struct {
		UserID   string   `json:"user_id"`
		Username string   `json:"username"`
		Roles    []string `json:"roles"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	if data.UserID == "" || data.Username == "" {
		http.Error(w, "user_id and username are required", http.StatusBadRequest)
		return
	}

	if len(data.Roles) == 0 {
		http.Error(w, "roles are required", http.StatusBadRequest)
		return
	}

	sessionKey := fmt.Sprintf("user_session:%s", data.UserID)
	ctx := r.Context()

	oldSessionID, err := s.rdb.Get(ctx, sessionKey).Result()
	if err == nil && oldSessionID != "" {
		_ = s.sessionManager.DeleteSession(ctx, oldSessionID)
		log.Printf("[SESSION DELETED] %s", oldSessionID)
	}

	sessionID := fmt.Sprintf("%s_%d", data.UserID, time.Now().UnixNano())

	session := &UserSession{
		UserID:    data.UserID,
		Username:  data.Username,
		LoginTime: time.Now(),
		LastSeen:  time.Now(),
		IPAddress: ip,
		Roles:     data.Roles,
	}

	if err := s.sessionManager.CreateSession(ctx, sessionID, session, s.config.SessionTTL); err != nil {
		log.Printf("[ERROR] Failed to create session for user %s: %v", data.UserID, err)
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	_ = s.rdb.Set(ctx, sessionKey, sessionID, s.config.SessionTTL).Err()

	token, err := s.createJWT(data.UserID, data.Username, sessionID, s.config.SessionTTL)
	if err != nil {
		log.Printf("[ERROR] Failed to create JWT for user %s: %v", data.UserID, err)
		http.Error(w, "Failed to create authentication token", http.StatusInternalServerError)
		return
	}

	refreshTokenTTL := time.Hour * 24 * 30
	refreshToken, err := s.createRefreshToken(data.UserID, data.Username, sessionID, refreshTokenTTL)
	if err != nil {
		log.Printf("[ERROR] Failed to create refresh token for user %s: %v", data.UserID, err)
		http.Error(w, "Failed to create refresh token", http.StatusInternalServerError)
		return
	}
	log.Printf("[+] User %s (%s) logged in successfully from IP %s", data.UserID, data.Username, ip)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token":         token,
		"refresh_token": refreshToken,
		"session_id":    sessionID,
		"expires_in":    int(s.config.SessionTTL.Seconds()),
		"user_id":       data.UserID,
		"username":      data.Username,
	})
}

func (s *Server) Logout(w http.ResponseWriter, r *http.Request) {
	ip := getClientIP(r)
	allowedIPs := map[string]bool{
		"127.0.0.1": true,
		"::1":       true,
		"[::1]":     true,
	}
	if !allowedIPs[ip] {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	sessionID, ok := r.Context().Value("session_id").(string)
	if !ok {
		http.Error(w, "Session context missing", http.StatusInternalServerError)
		return
	}

	ctx := r.Context()
	if err := s.sessionManager.DeleteSession(ctx, sessionID); err != nil {
		log.Printf("[ERROR] Failed to delete session %s: %v", sessionID, err)
		http.Error(w, "Failed to logout", http.StatusInternalServerError)
		return
	}

	log.Printf("[+] Session %s logged out successfully", sessionID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Logged out successfully",
	})
}

func (s *Server) ApiHandler(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(*Claims)
	if !ok {
		http.Error(w, "Authentication context missing", http.StatusInternalServerError)
		return
	}

	session, ok := r.Context().Value("session").(*UserSession)
	if !ok {
		http.Error(w, "Session context missing", http.StatusInternalServerError)
		return
	}

	path := chi.URLParam(r, "*")

	response := map[string]interface{}{
		"message":    fmt.Sprintf("API endpoint %s accessed successfully", path),
		"path":       path,
		"method":     r.Method,
		"user_id":    claims.UserID,
		"username":   claims.Username,
		"session_id": claims.SessionID,
		"login_time": session.LoginTime,
		"last_seen":  session.LastSeen,
		"ip_address": session.IPAddress,
	}

	log.Printf("[REDIS-MIDDLEWARE] User %s accessed %s %s", claims.UserID, r.Method, path)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
