package user

// 获取所有User，包含被删除以及被停止服务的User
func GetAllUsers() []UserConfig {
	return nil
}

// 获取未被删除、未停止服务的User
func GetAvailableUsers() []UserConfig {
	return nil
}

func GetUserInfo(userId int64) (c UserConfig) {
	return
}

func GetUserId(userIdText string) (userId int64) {
	return
}
