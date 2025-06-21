package main

import (
	"context"
	"fmt"
	"github.com/redis/go-redis/v9"	
)

func main() {
	ctx := context.Background()
	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	err := rdb.Ping(ctx).Err()
	if err !=nil {
		panic(err)
	}

	fmt.Println("[+] Redis connected")

	err = rdb.Set(ctx, "finura_test_value", "Hello from GO!", 0).Err()
	if err!= nil {
		panic(err)
	}

	ftv, err := rdb.Get(ctx, "finura_test_value").Result()
	if err!= nil {
		panic(err)
	}

	fmt.Println("finura_test_value: ", ftv)

}