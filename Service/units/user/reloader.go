package user

import (
	"AdClickTool/Service/db"
	"AdClickTool/Service/log"
	"fmt"
	"strconv"

	"gopkg.in/redis.v5"
)

// 关于用户campaign改变通知的实现方案
// 分成两个阶段：
// 1. 服务器启动阶段，也就是加载所有用户信息期间。
// 在这段时间内，如果用户信息又有新的改动，应该在加载完之后，重新加载所有有更新的用户
// 2. 服务器正常运行时间
// 在这段时间，收到一个更新一个即可。
// 关于redis断线重连：
// 目前试下来，redis客户端是能够支持断线重新连接的

var subscribe = "channel_campaign_changed_users"

// CollectorCampChangedUsers 收集服务器启动期间改变了Campaign的用户
type CollectorCampChangedUsers struct {
	Users  []int64 // 收集到的需要修改campaign的用户
	pubsub *redis.PubSub
}

// Stop 停止收集
func (c *CollectorCampChangedUsers) Stop() {
	c.pubsub.Close()
}

// Run 启动收集协程
func (c *CollectorCampChangedUsers) Start() {
	go func() {
		redis := db.GetRedisClient("MSGQUEUE")
		var err error
		c.pubsub, err = redis.PSubscribe(subscribe)
		if err != nil {
			log.Errorf("collector: PSubscribe %v failed:%v", subscribe, err)
			return
		}

		for {
			received, err := c.pubsub.ReceiveMessage()
			if err != nil {
				log.Warnf("collector: receive from %v failed:%v. stop collecting.", subscribe, err)
				return
			}

			log.Infof("collector: user:%v campaign changed", received.Payload)
			user, err := strconv.ParseInt(received.Payload, 10, 64)
			if err != nil {
				log.Errorf("user:%v is not an integer", received.Payload)
			} else {
				c.Users = append(c.Users, user)
			}
		}
	}()
}

// Reloader 当用户的campaign信息有更新的时候，要重新加载这个用户的campaign信息
type Reloader struct {
}

// Running 在后台持续更新用户数据
// 应该在加载所有的用户信息之后，启动这个
// 防止加载过程中有更新
func (r Reloader) Running() {
	redis := db.GetRedisClient("MSGQUEUE")
	log.Infof("reloader: running with redis:%v...", redis)

	// redis.S
	pubsub, err := redis.PSubscribe(subscribe)
	if err != nil {
		log.Errorf("reloader: PSubscribe %v failed:%v", subscribe, err)
		return
	}

	for {
		received, err := pubsub.ReceiveMessage()
		if err != nil {
			log.Errorf("reloader: receive from %v failed:%v", subscribe, err)
			continue
		}

		log.Infof("reloader: user:%v campaign changed", received.Payload)
		// 直接加载这个用户信息即可
		user, err := strconv.ParseInt(received.Payload, 10, 64)
		if err != nil {
			log.Errorf("reloader: user:%v is not an integer", received.Payload)
		} else {
			ReloadUser(user)
		}
	}
}

// ReloadUser 重新加载用户信息
func ReloadUser(user int64) error {
	userConfig := DBGetUserInfo(user)

	nu := newUser(userConfig)
	if nu == nil {
		return fmt.Errorf("[reloader]ReloadUser failed for user%d", user)
	}
	setUser(user, nu)
	return nil
}
