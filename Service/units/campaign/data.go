package campaign

import (
	"database/sql"
	"encoding/json"

	"AdClickTool/Service/db"
	"AdClickTool/Service/log"
)

// dbgetter 默认的拿数据库的东西
// 方便测试的地方替换这个接口
var dbgetter = func() *sql.DB {
	return db.GetDB("DB")
}

func DBGetAllCampaigns() []CampaignConfig {
	return nil
}

func dbGetCampaignTrafficConfig(trafficSourceId int64) (
	trafficSource TrafficSourceConfig,
	err error,
) {
	d := dbgetter()
	sql := "SELECT id, userId, name, postbackUrl, pixelRedirectUrl, impTracking, externalId, cost, params FROM TrafficSource WHERE id=?"
	row := d.QueryRow(sql, trafficSourceId)
	var e, c, v string
	err = row.Scan(&trafficSource.Id,
		&trafficSource.UserId,
		&trafficSource.Name,
		&trafficSource.PostbackURL,
		&trafficSource.PixelRedirectURL,
		&trafficSource.ImpTracking,
		&e, &c, &v)
	if err != nil {
		log.Errorf("Scan from sql:%v failed:%v", sql, err)
		return
	}

	err = json.Unmarshal([]byte(e), &trafficSource.ExternalId)
	if err != nil {
		log.Errorf("Unmarshal:%s to ExternalId failed:%v", e, err)
	}

	err = json.Unmarshal([]byte(c), &trafficSource.Cost)
	if err != nil {
		log.Errorf("Unmarshal:%s to Cost failed:%v", c, err)
	}

	err = json.Unmarshal([]byte(v), &trafficSource.Vars)
	if err != nil {
		log.Errorf("Unmarshal:%s to TrafficSourceParams failed:%v", v, err)
	}
	return
}

func DBGetAvailableCampaigns() []CampaignConfig {
	d := dbgetter()
	sql := "SELECT id, name, userId, hash, url, impPixelUrl, trafficSourceId, trafficSourceName, costModel, cpcValue, cpaValue, cpmValue, postbackUrl, pixelRedirectUrl, targetType, targetFlowId, targetUrl, status FROM TrackingCampaign WHERE deleted=0"
	rows, err := d.Query(sql)
	if err != nil {
		log.Errorf("[campaign][DBGetAvailableCampaigns]Query: %s failed:%v", sql, err)
		return nil
	}
	defer rows.Close()

	var c CampaignConfig
	var arr []CampaignConfig
	for rows.Next() {
		if err := rows.Scan(&c.Id, &c.Name, &c.UserId, &c.Hash, &c.Url, &c.ImpPixelUrl, &c.TrafficSourceId, &c.TrafficSourceName, &c.CostModel, &c.CPCValue, &c.CPAValue, &c.CPMValue, &c.PostbackUrl, &c.PixelRedirectUrl, &c.TargetType, &c.TargetFlowId, &c.TargetUrl, &c.Status); err != nil {
			log.Errorf("[campaign][DBGetAvailableCampaigns] scan failed:%v", err)
			return nil
		}

		c.TrafficSource, err = dbGetCampaignTrafficConfig(c.TrafficSourceId)
		if err != nil {
			log.Errorf("[campaign][DBGetAvailableCampaigns] dbGetCampaignTrafficConfig failed:%v", err)
		}
		arr = append(arr, c)
	}
	return arr
}

func DBGetUserCampaigns(userId int64) []CampaignConfig {
	d := dbgetter()
	sql := "SELECT id, name, userId, hash, url, impPixelUrl, trafficSourceId, trafficSourceName, costModel, cpcValue, cpaValue, cpmValue, postbackUrl, pixelRedirectUrl, targetType, targetFlowId, targetUrl, status FROM TrackingCampaign WHERE userId=? AND deleted=0"
	rows, err := d.Query(sql, userId)
	if err != nil {
		log.Errorf("[campaign][DBGetUserCampaigns]Query: %s failed:%v", sql, err)
		return nil
	}
	defer rows.Close()

	var c CampaignConfig
	var arr []CampaignConfig
	for rows.Next() {
		if err := rows.Scan(&c.Id, &c.Name, &c.UserId, &c.Hash, &c.Url, &c.ImpPixelUrl, &c.TrafficSourceId, &c.TrafficSourceName, &c.CostModel, &c.CPCValue, &c.CPAValue, &c.CPMValue, &c.PostbackUrl, &c.PixelRedirectUrl, &c.TargetType, &c.TargetFlowId, &c.TargetUrl, &c.Status); err != nil {
			log.Errorf("[campaign][DBGetUserCampaigns] scan failed:%v", err)
			return nil
		}

		c.TrafficSource, err = dbGetCampaignTrafficConfig(c.TrafficSourceId)
		if err != nil {
			log.Errorf("[campaign][DBGetUserCampaigns] dbGetCampaignTrafficConfig failed:%v", err)
		}
		arr = append(arr, c)
	}
	return arr
}

func DBGetCampaign(campaignId int64) (c CampaignConfig) {
	d := dbgetter()
	sql := "SELECT id, name, userId, hash, url, impPixelUrl, trafficSourceId, trafficSourceName, costModel, cpcValue, cpaValue, cpmValue, postbackUrl, pixelRedirectUrl, targetType, targetFlowId, targetUrl, status FROM TrackingCampaign WHERE id=?"
	row := d.QueryRow(sql, campaignId)

	if err := row.Scan(&c.Id, &c.Name, &c.UserId, &c.Hash, &c.Url, &c.ImpPixelUrl, &c.TrafficSourceId, &c.TrafficSourceName, &c.CostModel, &c.CPCValue, &c.CPAValue, &c.CPMValue, &c.PostbackUrl, &c.PixelRedirectUrl, &c.TargetType, &c.TargetFlowId, &c.TargetUrl, &c.Status); err != nil {
		log.Errorf("[campaign][DBGetCampaign] scan failed:%v", err)
		return
	}

	var err error
	c.TrafficSource, err = dbGetCampaignTrafficConfig(c.TrafficSourceId)
	if err != nil {
		log.Errorf("[campaign][DBGetCampaign] dbGetCampaignTrafficConfig failed:%v", err)
	}
	return c
}

func DBGetCampaignByHash(campaignHash string) (c CampaignConfig) {
	d := dbgetter()
	sql := "SELECT id, name, userId, hash, url, impPixelUrl, trafficSourceId, trafficSourceName, costModel, cpcValue, cpaValue, cpmValue, postbackUrl, pixelRedirectUrl, targetType, targetFlowId, targetUrl, status FROM TrackingCampaign WHERE hash=?"
	row := d.QueryRow(sql, campaignHash)

	if err := row.Scan(&c.Id, &c.Name, &c.UserId, &c.Hash, &c.Url, &c.ImpPixelUrl, &c.TrafficSourceId, &c.TrafficSourceName, &c.CostModel, &c.CPCValue, &c.CPAValue, &c.CPMValue, &c.PostbackUrl, &c.PixelRedirectUrl, &c.TargetType, &c.TargetFlowId, &c.TargetUrl, &c.Status); err != nil {
		log.Errorf("[campaign][DBGetCampaign] campaignHash:%s scan failed:%v", campaignHash, err)
		return
	}

	var err error
	c.TrafficSource, err = dbGetCampaignTrafficConfig(c.TrafficSourceId)
	if err != nil {
		log.Errorf("[campaign][DBGetCampaign] dbGetCampaignTrafficConfig:%v failed:%v", c.TrafficSourceId, err)
	}
	return c
}
