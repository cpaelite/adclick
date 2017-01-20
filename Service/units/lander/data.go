package lander

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

func DBGetAllLanders() []LanderConfig {
	return nil
}

func DBGetAvailableLanders() []LanderConfig {
	d := dbgetter()
	sql := "SELECT id, name, userId, url, numberOfOffers FROM Lander WHERE deleted=0"
	rows, err := d.Query(sql)
	if err != nil {
		log.Errorf("[lander][DBGetAllLanders]Query: %s failed:%v", sql, err)
		return nil
	}
	defer rows.Close()

	var l LanderConfig
	var arr []LanderConfig
	for rows.Next() {
		if err := rows.Scan(&l.Id, &l.Name, &l.UserId, &l.Url, &l.NumberOfOffers); err != nil {
			log.Errorf("[lander][DBGetAllLanders] scan failed:%v", err)
			return nil
		}
		arr = append(arr, l)
	}
	return arr

}

func DBGetUserLanders(userId int64) []LanderConfig {
	d := dbgetter()
	sql := "SELECT id, name, userId, url, numberOfOffers FROM Lander WHERE userId=? and deleted=0"
	rows, err := d.Query(sql, userId)
	if err != nil {
		log.Errorf("[lander][DBGetAllLanders]Query: %s failed:%v", sql, err)
		return nil
	}
	defer rows.Close()

	var l LanderConfig
	var arr []LanderConfig
	for rows.Next() {
		if err := rows.Scan(&l.Id, &l.Name, &l.UserId, &l.Url, &l.NumberOfOffers); err != nil {
			log.Errorf("[lander][DBGetAllLanders] scan failed:%v", err)
			return nil
		}
		arr = append(arr, l)
	}
	return arr
}

func DBGetLander(landerId int64) (c LanderConfig) {
	d := dbgetter()
	sql := "SELECT id, name, userId, url, numberOfOffers FROM Lander WHERE id=? and deleted=0"
	row := d.QueryRow(sql, landerId)
	if err := row.Scan(&c.Id, &c.Name, &c.UserId, &c.Url, &c.NumberOfOffers); err != nil {
		log.Errorf("[lander][DBGetAllLanders] scan failed:%v", err)
		return c
	}
	return c
}
