package user

// 获取所有User，包含被删除以及被停止服务的User
func DBGetAllUsers() []UserConfig {
	return nil
}

// 获取未被删除、未停止服务的User
func DBGetAvailableUsers() []UserConfig {
	return nil
}

func DBGetUserInfo(userId int64) (c UserConfig) {
	return
}
