package path

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

func DBGetAvailablePaths() []PathConfig {
	d := dbgetter()
	sql := "SELECT id, userId, redirectMode, directLink, status FROM Path WHERE deleted=0"
	rows, err := d.Query(sql)
	if err != nil {
		log.Errorf("[path][DBGetAvailablePaths]Query: %s failed:%v", sql, err)
		return nil
	}
	defer rows.Close()

	var c PathConfig
	var arr []PathConfig
	for rows.Next() {
		if err := rows.Scan(&c.Id, &c.UserId, &c.RedirectMode, &c.DirectLink, &c.Status); err != nil {
			log.Errorf("[path][DBGetAvailablePaths] scan failed:%v", err)
			return nil
		}
		arr = append(arr, c)
	}
	return arr
}

func DBGetUserPaths(userId int64) []PathConfig {
	d := dbgetter()
	sql := "SELECT id, userId, redirectMode, directLink, status FROM Path WHERE userId=? AND deleted=0"
	rows, err := d.Query(sql)
	if err != nil {
		log.Errorf("[path][DBGetUserPaths]Query: %s failed:%v", sql, err)
		return nil
	}
	defer rows.Close()

	var c PathConfig
	var arr []PathConfig
	for rows.Next() {
		if err := rows.Scan(&c.Id, &c.UserId, &c.RedirectMode, &c.DirectLink, &c.Status); err != nil {
			log.Errorf("[path][DBGetAvailablePaths] scan failed:%v", err)
			return nil
		}
		arr = append(arr, c)
	}
	return arr
}

func DBGetPath(pathId int64) (c PathConfig) {
	d := dbgetter()
	sql := "SELECT id, userId, redirectMode, directLink, status FROM Path WHERE pathId=?"
	row := d.QueryRow(sql, pathId)

	if err := row.Scan(&c.Id, &c.UserId, &c.RedirectMode, &c.DirectLink, &c.Status); err != nil {
		log.Errorf("[path][DBGetPath] pathId:%v scan failed:%v", pathId, err)
		return
	}
	return
}

func DBGetPathLanders(pathId int64) (landers []PathLander) {
	d := dbgetter()
	sql := "SELECT landerId, weight FROM Lander2Path WHERE pathId=?"
	rows, err := d.Query(sql, pathId)
	if err != nil {
		log.Errorf("[path][DBGetPathLanders]Query sql:%v with pathId:%v failed:%v", sql, pathId, err)
		return nil
	}
	defer rows.Close()

	var pl PathLander
	for rows.Next() {
		err := rows.Scan(&pl.LanderId, &pl.Weight)
		if err != nil {
			log.Errorf("[path][DBGetPathLanders]Query Scan from sql:%v with pathId:%v failed:%v", sql, pathId, err)
			return nil
		}
		landers = append(landers, pl)
	}
	return
}

func DBGetPathOffers(pathId int64) (offers []PathOffer) {
	d := dbgetter()
	sql := "SELECT offerId, weight FROM Offer2Path WHERE pathId=?"
	rows, err := d.Query(sql, pathId)
	if err != nil {
		log.Errorf("[path][DBGetPathOffers]Query sql:%v with pathId:%v failed:%v", sql, pathId, err)
		return nil
	}
	defer rows.Close()

	var po PathOffer
	for rows.Next() {
		err := rows.Scan(&po.OfferId, &po.Weight)
		if err != nil {
			log.Errorf("[path][DBGetPathOffers]Query Scan from sql:%v with pathId:%v failed:%v", sql, pathId, err)
			return nil
		}
		offers = append(offers, po)
	}
	return
}
