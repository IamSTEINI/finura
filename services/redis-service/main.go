package main

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

// ! TYPE: USERSESSION (Claims im JWT)
type Claims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

type Server struct {
	rdb       *redis.Client
	mu        sync.Mutex
	jwtSecret []byte
}

func NewServer() *Server {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("[!] Failed to load .env: %v", err)
	}

	REDIS_HOST := os.Getenv("REDIS_HOST")
	REDIS_PORT := os.Getenv("REDIS_PORT")
	REDIS_PASSWORD := os.Getenv("REDIS_PASSWORD")
	JWT_SECRET := os.Getenv("JWT_SECRET")
	if JWT_SECRET == "" {
		log.Fatalf("[!] JWT_SECRET is not set in .env")
	}

	rdb := redis.NewClient(&redis.Options{
		Addr:     REDIS_HOST + ":" + REDIS_PORT,
		Password: REDIS_PASSWORD,
	})

	log.Printf("[+] Connected to Redis at %s:%s", REDIS_HOST, REDIS_PORT)

	return &Server{
		rdb:       rdb,
		jwtSecret: []byte(JWT_SECRET),
	}
}

func (s *Server) createJWT(userID, username string, ttl time.Duration) (string, error) {
	claims := &Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", err
	}
	return signedToken, nil
}

func (s *Server) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr
		if !s.RateLimit(context.Background(), ip, 10, time.Minute) {
			http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
			return
		}

		tokenString, err := extractBearerToken(authHeader)
		if err != nil {
			http.Error(w, "Invalid Authorization header", http.StatusUnauthorized)
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return s.jwtSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "user", claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func extractBearerToken(authHeader string) (string, error) {
	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return "", errors.New("invalid auth header format")
	}
	return parts[1], nil
}

func (s *Server) RateLimit(ctx context.Context, ip string, limit int, window time.Duration) bool {
	key := "ratelimit:" + ip
	s.mu.Lock()
	defer s.mu.Unlock()
	count, err := s.rdb.Incr(ctx, key).Result()
	if err != nil {
		log.Printf("[!] RateLimit Redis error: %v", err)
		return false
	}
	if count == 1 {
		s.rdb.Expire(ctx, key, window)
	}
	allowed := count <= int64(limit)
	if !allowed {
		log.Printf("[!] Rate limit exceeded for IP %s: %d/%d", ip, count, limit)
	}
	return allowed
}

// EXAMPLE CODE
func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var data struct {
		UserID   string `json:"user_id"`
		Username string `json:"username"`
	}
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil || data.UserID == "" || data.Username == "" {
		http.Error(w, "Invalid login data", http.StatusBadRequest)
		return
	}

	token, err := s.createJWT(data.UserID, data.Username, 30*time.Minute)
	if err != nil {
		http.Error(w, "Failed to create token", http.StatusInternalServerError)
		return
	}

	log.Printf("[+] User %s logged in", data.UserID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

func (s *Server) handleProtected(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value("user").(*Claims)
	if !ok {
		http.Error(w, "User claims missing", http.StatusInternalServerError)
		return
	}
	w.Write([]byte("Hello " + claims.Username + ", you reached me !"))
}

// OPEN ROUTE
func (s *Server) handlePublic(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("PUBLIC"))
}

func main() {
	server := NewServer()

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Post("/login", server.handleLogin)
	r.Get("/public", server.handlePublic)

	r.Group(func(r chi.Router) {
		r.Use(server.AuthMiddleware)

		r.Get("/protected", server.handleProtected)
	})

	log.Println("[+] Starting server on :8080")
	err := http.ListenAndServe(":8080", r)
	if err != nil {
		log.Fatalf("[!] Server failed: %v", err)
	}
}
