package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"
	"github.com/redis/go-redis/v9"
)

func generateSessionID() (string, error) {
	rand_b := make([]byte, 16)
	if _, err := rand.Read(rand_b); err != nil {
		return "", err
	}
	return hex.EncodeToString(rand_b), nil
}

func main() {
	ctx := context.Background()

	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	if err := rdb.Ping(ctx).Err(); err !=nil {
		panic(err)
	}

	fmt.Println("[+] Connected to localhost redis")

	sessionID, err := generateSessionID()
	if err != nil {panic(err)}
	
	fmt.Println("[~] Session ID: ", sessionID)

	exUserId := "73572785263785"

	err = rdb.Set(ctx, "session:"+sessionID, exUserId, 30*time.Minute).Err()
	if err != nil {panic(err)}
	
	val, err := rdb.Get(ctx, "session:"+sessionID).Result()
	if err != nil {panic(err)}

	fmt.Printf("LOADED SESSION (%s): %s\n", sessionID, val)

	fmt.Println("Logging out...")
	err = rdb.Del(ctx, "session:"+sessionID).Err()
	if err != nil {panic(err)}

	fmt.Println("DELETED SESSION")
}