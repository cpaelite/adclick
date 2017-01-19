package offer

import (
	"AdClickTool/Service/db"
	"AdClickTool/Service/log"
	"database/sql"
)

func DBGetAllOffers() []OfferConfig {
	return nil
}

func DBGetAvailableOffers() []OfferConfig {
	d := dbgetter()
	sql := `SELECT id, name, userId, url, AffiliateNetworkId,AffiliateNetworkName, postbackUrl, payoutMode, payoutValue FROM Offer WHERE deleted=0`
	rows, err := d.Query(sql)
	if err != nil {
		log.Errorf("[offer][DBGetAvailableOffers]Query %s failed:%v", sql, err)
		return nil
	}
	var c OfferConfig
	var arr []OfferConfig
	for rows.Next() {
		err := rows.Scan(&c.Id,
			&c.Name,
			&c.UserId,
			&c.Url,
			&c.AffiliateNetworkId,
			&c.AffiliateNetworkName,
			&c.PostbackUrl,
			&c.PayoutMode,
			&c.PayoutValue,
		)

		if err != nil {
			log.Errorf("[offer][DBGetAvailableOffers]Scan %s failed:%v", sql, err)
			return nil
		}

		arr = append(arr, c)
	}
	return nil
}

func DBGetUserOffers(userId int64) []OfferConfig {
	d := dbgetter()
	sql := `SELECT id, name, userId, url, AffiliateNetworkId, AffiliateNetworkName, postbackUrl, payoutMode, payoutValue FROM Offer WHERE userId=? and deleted=0`
	rows, err := d.Query(sql, userId)
	if err != nil {
		log.Errorf("[offer][DBGetAvailableOffers]Query %s with userId:%v failed:%v", sql, userId, err)
		return nil
	}
	var c OfferConfig
	var arr []OfferConfig
	for rows.Next() {
		err := rows.Scan(&c.Id,
			&c.Name,
			&c.UserId,
			&c.Url,
			&c.AffiliateNetworkId,
			&c.AffiliateNetworkName,
			&c.PostbackUrl,
			&c.PayoutMode,
			&c.PayoutValue,
		)

		if err != nil {
			log.Errorf("[offer][DBGetUserOffers]Scan failed:%v", err)
			return nil
		}

		arr = append(arr, c)
	}
	return arr
}

func DBGetOffer(offerId int64) (c OfferConfig) {
	d := dbgetter()
	sql := `SELECT id, name, userId, url, AffiliateNetworkId, AffiliateNetworkName, postbackUrl, payoutMode, payoutValue FROM Offer WHERE id=? and deleted=0`
	row := d.QueryRow(sql, offerId)
	err := row.Scan(&c.Id,
		&c.Name,
		&c.UserId,
		&c.Url,
		&c.AffiliateNetworkId,
		&c.AffiliateNetworkName,
		&c.PostbackUrl,
		&c.PayoutMode,
		&c.PayoutValue,
	)

	if err != nil {
		log.Errorf("[offer][DBGetOffer]Scan failed:%v", err)
		return c
	}

	return c
}

// dbgetter 默认的拿数据库的东西
// 方便测试的地方替换这个接口
var dbgetter = func() *sql.DB {
	return db.GetDB("DB")
}
