package db

import (
	"HaiwaiAdx/config"
	"HaiwaiAdx/log"
	"fmt"
	"sync"

	"gopkg.in/redis.v5"
)

var redisMux sync.Mutex
var redisClient *redis.Client

func GetRedisClient() *redis.Client {
	redisMux.Lock()
	defer redisMux.Unlock()

	if redisClient == nil {
		host := config.String("REDIS", "host")
		port := config.Int("REDIS", "port")
		if host == "" {
			host = "localhost"
		}

		if port == int(0) {
			port = int(6379)
		}
		redisClient = NewRedisClient(host, port)
	}
	return redisClient
}

func NewRedisClient(host string, port int) *redis.Client {

	addr := host + ":" + fmt.Sprintf("%d", port)
	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: "",
		DB:       0,
		PoolSize: 10,
	})

	_, err := client.Ping().Result()
	if err != nil {
		log.Infof("[redisClient][NewRedisClient] %s fail: %v", addr, err)
		return nil
	}

	return client
}
