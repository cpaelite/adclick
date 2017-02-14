package user

import (
	"AdClickTool/Service/db"
	"AdClickTool/Service/log"
	"database/sql"
)

// dbgetter 默认的拿数据库的东西
// 方便测试的地方替换这个接口
var dbgetter = func() *sql.DB {
	return db.GetDB("DB")
}

// 获取所有User，包含被删除以及被停止服务的User
func DBGetAllUsers() []UserConfig {
	return nil
}

// 获取未被删除、未停止服务的User
func DBGetAvailableUsers() []UserConfig {
	d := dbgetter()
	sql := "SELECT id, idText, rootDomainRedirect FROM User WHERE deleted=0"
	rows, err := d.Query(sql)
	if err != nil {
		log.Errorf("[flow][DBGetAvailableUsers]Query: %s failed:%v", sql, err)
		return nil
	}
	defer rows.Close()

	var c UserConfig
	var arr []UserConfig
	for rows.Next() {
		if err := rows.Scan(&c.Id, &c.IdText, &c.RootDomainRedirect); err != nil {
			log.Errorf("[user][DBGetAvailableUsers] scan failed:%v", err)
			return nil
		}
		arr = append(arr, c)
	}
	return arr
}

func DBGetUserInfo(userId int64) (c UserConfig) {
	d := dbgetter()
	sql := "SELECT id, idText, rootDomainRedirect FROM User WHERE id=?"
	row := d.QueryRow(sql, userId)

	if err := row.Scan(&c.Id, &c.IdText, &c.RootDomainRedirect); err != nil {
		log.Errorf("[user][DBGetUserInfo] scan failed:%v", err)
		return
	}
	return c
}
