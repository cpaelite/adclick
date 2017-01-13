package campaign

import (
	"AdClickTool/Service/db"
	"AdClickTool/Service/log"
	"database/sql"
	"strings"
)

// dbgetter 默认的拿数据库的东西
// 方便测试的地方替换这个接口
var dbgetter = func() *sql.DB {
	return db.GetDB("DB")
}

func DBGetAllCampaigns() []CampaignConfig {
	return nil
}

func splitTwice(s, by1, by2 string) [][]string {
	once := strings.Split(s, by1)
	twice := make([][]string, len(once))
	for idx, step1 := range once {
		twice[idx] = strings.Split(step1, by2)
	}
	return twice
}

func dbGetCampaignTrafficConfig(trafficSourceId int64) (
	ExternalId []string,
	Cost []string,
	Vars [][]string,
	err error,
) {
	d := dbgetter()
	sql := "SELECT externalId, cost, params FROM TrafficSource WHERE id=?"
	row := d.QueryRow(sql, trafficSourceId)
	var e, c, v string
	if err := row.Scan(&e, &c, &v); err != nil {
		return nil, nil, nil, err
	}

	ExternalId = strings.Split(e, ",")
	Cost = strings.Split(c, ",")
	Vars = splitTwice(v, ",", ":")
	return
}

func DBGetAvailableCampaigns() []CampaignConfig {
	d := dbgetter()
	sql := "SELECT id, userId, hash, url, impPixelUrl, trafficSourceId, trafficSourceName, costModel, cpcValue, cpaValue, cpmValue, targetType, targetFlowId, targetUrl, status FROM TrackingCampaign WHERE deleted=0"
	rows, err := d.Query(sql)
	if err != nil {
		log.Errorf("[campaign][DBGetAvailableCampaigns]Query: %s failed:%v", sql, err)
		return nil
	}

	var c CampaignConfig
	var arr []CampaignConfig
	for rows.Next() {
		if err := rows.Scan(&c.Id, &c.UserId, &c.Hash, &c.Url, &c.ImpPixelUrl, &c.TrafficSourceId, &c.TrafficSourceName, &c.CostModel, &c.CPCValue, &c.CPAValue, &c.CPMValue, &c.TargetType, &c.TargetFlowId, &c.TargetUrl, &c.Status); err != nil {
			log.Errorf("[campaign][DBGetAvailableCampaigns] scan failed:%v", err)
			return nil
		}

		c.ExternalId, c.Cost, c.Vars, err = dbGetCampaignTrafficConfig(c.TrafficSourceId)
		if err != nil {
			log.Errorf("[campaign][DBGetAvailableCampaigns] dbGetCampaignTrafficConfig failed:%v", err)
		}
		arr = append(arr, c)
	}
	return arr
}

func DBGetUserCampaigns(userId int64) []CampaignConfig {
	d := dbgetter()
	sql := "SELECT id, userId, hash, url, impPixelUrl, trafficSourceId, trafficSourceName, costModel, cpcValue, cpaValue, cpmValue, targetType, targetFlowId, targetUrl, status FROM TrackingCampaign WHERE userId=? AND deleted=0"
	rows, err := d.Query(sql, userId)
	if err != nil {
		log.Errorf("[campaign][DBGetUserCampaigns]Query: %s failed:%v", sql, err)
		return nil
	}

	var c CampaignConfig
	var arr []CampaignConfig
	for rows.Next() {
		if err := rows.Scan(&c.Id, &c.UserId, &c.Hash, &c.Url, &c.ImpPixelUrl, &c.TrafficSourceId, &c.TrafficSourceName, &c.CostModel, &c.CPCValue, &c.CPAValue, &c.CPMValue, &c.TargetType, &c.TargetFlowId, &c.TargetUrl, &c.Status); err != nil {
			log.Errorf("[campaign][DBGetUserCampaigns] scan failed:%v", err)
			return nil
		}

		c.ExternalId, c.Cost, c.Vars, err = dbGetCampaignTrafficConfig(c.TrafficSourceId)
		if err != nil {
			log.Errorf("[campaign][DBGetUserCampaigns] dbGetCampaignTrafficConfig failed:%v", err)
		}
		arr = append(arr, c)
	}
	return arr
}

func DBGetCampaign(campaignId int64) (c CampaignConfig) {
	d := dbgetter()
	sql := "SELECT id, userId, hash, url, impPixelUrl, trafficSourceId, trafficSourceName, costModel, cpcValue, cpaValue, cpmValue, targetType, targetFlowId, targetUrl, status FROM TrackingCampaign WHERE campaignId=?"
	row := d.QueryRow(sql, campaignId)

	if err := row.Scan(&c.Id, &c.UserId, &c.Hash, &c.Url, &c.ImpPixelUrl, &c.TrafficSourceId, &c.TrafficSourceName, &c.CostModel, &c.CPCValue, &c.CPAValue, &c.CPMValue, &c.TargetType, &c.TargetFlowId, &c.TargetUrl, &c.Status); err != nil {
		log.Errorf("[campaign][DBGetCampaign] scan failed:%v", err)
		return
	}

	var err error
	c.ExternalId, c.Cost, c.Vars, err = dbGetCampaignTrafficConfig(c.TrafficSourceId)
	if err != nil {
		log.Errorf("[campaign][DBGetCampaign] dbGetCampaignTrafficConfig failed:%v", err)
	}
	return c
}

func DBGetCampaignByHash(campaignHash string) (c CampaignConfig) {
	d := dbgetter()
	sql := "SELECT id, userId, hash, url, impPixelUrl, trafficSourceId, trafficSourceName, costModel, cpcValue, cpaValue, cpmValue, targetType, targetFlowId, targetUrl, status FROM TrackingCampaign WHERE hash=?"
	row := d.QueryRow(sql, campaignHash)

	if err := row.Scan(&c.Id, &c.UserId, &c.Hash, &c.Url, &c.ImpPixelUrl, &c.TrafficSourceId, &c.TrafficSourceName, &c.CostModel, &c.CPCValue, &c.CPAValue, &c.CPMValue, &c.TargetType, &c.TargetFlowId, &c.TargetUrl, &c.Status); err != nil {
		log.Errorf("[campaign][DBGetCampaign] scan failed:%v", err)
		return
	}

	var err error
	c.ExternalId, c.Cost, c.Vars, err = dbGetCampaignTrafficConfig(c.TrafficSourceId)
	if err != nil {
		log.Errorf("[campaign][DBGetCampaign] dbGetCampaignTrafficConfig failed:%v", err)
	}
	return c
}
