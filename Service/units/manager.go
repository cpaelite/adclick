package units

import (
	"sync"

	"AdClickTool/Service/log"
	"AdClickTool/Service/units/user"
)

/**
 * User管理
**/
var mu sync.RWMutex                // protects the following
var users map[int64]*user.User     // userId:User
var userIdText2Id map[string]int64 // userIdText:userId

func getUser(userId int64) *user.User {
	if userId == 0 {
		return nil
	}
	mu.RLock()
	defer mu.RUnlock()
	if u, ok := users[userId]; ok {
		return u
	}
	return nil
}
func getUserByIdText(idText string) *user.User {
	if idText == "" {
		return nil
	}
	mu.RLock()
	defer mu.RUnlock()
	if id, ok := userIdText2Id[idText]; ok {
		if u, ok := users[id]; ok {
			return u
		}
	}
	return nil
}
func setUser(userId int64, u *user.User) {
	if u == nil {
		log.Error("SetUser u is nil for", userId)
		return
	}
	if userId == 0 {
		log.Error("SetUser userId is 0 for", u.String())
		return
	}

	mu.Lock()
	defer mu.Unlock()
	users[userId] = u
	userIdText2Id[u.IdText] = userId
}
func delUser(userId int64) {
	if userId == 0 {
		return
	}

	mu.Lock()
	defer mu.Unlock()
	if u := users[userId]; u != nil {
		delete(users, userId)
		delete(userIdText2Id, u.IdText)
	}
}
func initUser() {
	mu.Lock()
	defer mu.Unlock()
	users = make(map[int64]*user.User)
	userIdText2Id = make(map[string]int64)
}

// 是否已经准备好所有User信息，启动成功
var started = false
