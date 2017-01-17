package db

import (
	"fmt"
	"sync"

	"AdClickTool/Service/config"
	"AdClickTool/Service/log"

	"gopkg.in/redis.v5"
)

var redisMux sync.RWMutex
var redisClients map[string]*redis.Client

func GetRedisClient(title string) *redis.Client {
	redisMux.RLock()
	if client, ok := redisClients[title]; ok {
		redisMux.RUnlock()
		return client
	}
	redisMux.RUnlock()

	host := config.String(title, "host")
	port := config.Int(title, "port")
	if host == "" {
		host = "localhost"
	}
	if port == int(0) {
		port = int(6379)
	}
	client := newRedisClient(host, port)
	if client == nil {
		log.Errorf("[GetRedisClient]New redis client %s failed:client is nil\n", title)
		return nil
	}

	redisMux.Lock()
	redisClients[title] = client
	redisMux.Unlock()
	return client
}

func newRedisClient(host string, port int) *redis.Client {
	addr := host + ":" + fmt.Sprintf("%d", port)
	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: "",
		DB:       0,
		PoolSize: 10,
	})

	_, err := client.Ping().Result()
	if err != nil {
		log.Errorf("[redisClient][NewRedisClient] %s fail: %v", addr, err)
		return nil
	}

	return client
}
