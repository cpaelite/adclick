package affiliate

import (
	"database/sql"

	"AdClickTool/Service/db"
	"AdClickTool/Service/log"
	"strings"
)

// dbgetter 默认的拿数据库的东西
// 方便测试的地方替换这个接口
var dbgetter = func() *sql.DB {
	return db.GetDB("DB")
}

func DBGetAvailableAffliateNetworks() []AffiliateNetworkConfig {
	d := dbgetter()
	sql := "SELECT id, userId, name, hash, postbackUrl, appendClickId, duplicatedPostback, ipWhiteList" +
		" FROM AffiliateNetwork WHERE deleted=0"
	rows, err := d.Query(sql)
	if err != nil {
		log.Errorf("[affiliate][DBGetAvailableAffliateNetworks]Query: %s failed:%v", sql, err)
		return nil
	}

	var c AffiliateNetworkConfig
	var arr []AffiliateNetworkConfig
	var ipWhiteList string
	for rows.Next() {
		err := rows.Scan(&c.Id, &c.UserId, &c.Name, &c.Hash, &c.PostbackUrl,
			&c.AppendClickId, &c.DuplicatePostback, &ipWhiteList)
		if err != nil {
			log.Errorf("[affiliate][DBGetUserAffliateNetworks] scan failed:%v", err)
			return nil
		}

		c.IpWhiteList = parseIpWhiteList(ipWhiteList)
		arr = append(arr, c)
	}

	return arr
}

func DBGetUserAffliateNetworks(userId int64) []AffiliateNetworkConfig {
	d := dbgetter()
	sql := "SELECT id, userId, name, hash, postbackUrl, appendClickId, duplicatedPostback, ipWhiteList" +
		" FROM AffiliateNetwork WHERE userId=? AND deleted=0"
	rows, err := d.Query(sql, userId)
	if err != nil {
		log.Errorf("[affiliate][DBGetUserAffliateNetworks]Query: %s failed:%v", sql, err)
		return nil
	}

	var c AffiliateNetworkConfig
	var arr []AffiliateNetworkConfig
	var ipWhiteList string
	for rows.Next() {
		err := rows.Scan(&c.Id, &c.UserId, &c.Name, &c.Hash, &c.PostbackUrl,
			&c.AppendClickId, &c.DuplicatePostback, &ipWhiteList)
		if err != nil {
			log.Errorf("[affiliate][DBGetUserAffliateNetworks] scan failed:%v", err)
			return nil
		}

		c.IpWhiteList = parseIpWhiteList(ipWhiteList)
		arr = append(arr, c)
	}

	return arr
}

func DBGetAffiliateNetwork(id int64) AffiliateNetworkConfig {
	d := dbgetter()
	sql := "SELECT id, userId, name, hash, postbackUrl, appendClickId, duplicatedPostback, ipWhiteList" +
		" FROM AffiliateNetwork WHERE id=?"
	row := d.QueryRow(sql, id)

	var c AffiliateNetworkConfig
	var ipWhiteList string

	err := row.Scan(&c.Id, &c.UserId, &c.Name, &c.Hash, &c.PostbackUrl,
		&c.AppendClickId, &c.DuplicatePostback, &ipWhiteList)
	if err != nil {
		log.Errorf("[affiliate][DBGetAffiliateNetwork] scan failed:%v", err)
		return nil
	}

	c.IpWhiteList = parseIpWhiteList(ipWhiteList)

	return c
}

func DBGetAffiliateNetworkByHash(hash string) AffiliateNetworkConfig {
	d := dbgetter()
	sql := "SELECT id, userId, name, hash, postbackUrl, appendClickId, duplicatedPostback, ipWhiteList" +
		" FROM AffiliateNetwork WHERE hash=?"
	row := d.QueryRow(sql, hash)

	var c AffiliateNetworkConfig
	var ipWhiteList string

	err := row.Scan(&c.Id, &c.UserId, &c.Name, &c.Hash, &c.PostbackUrl,
		&c.AppendClickId, &c.DuplicatePostback, &ipWhiteList)
	if err != nil {
		log.Errorf("[affiliate][DBGetAffiliateNetwork] scan failed:%v", err)
		return nil
	}

	c.IpWhiteList = parseIpWhiteList(ipWhiteList)

	return c
}

func parseIpWhiteList(s string) []string {
	return strings.Split(s, "\n")
}
