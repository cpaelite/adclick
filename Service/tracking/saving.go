package tracking

import (
	"AdClickTool/Service/log"
	"database/sql"
	"fmt"
	"time"
)

// Saving 一直执行保存操作
// db参数暂时传过来
func Saving(db *sql.DB, stop chan struct{}) {
	for {
		select {
		case m := <-toSave:
			fmt.Println("Saving...", len(m))
			err := doSave(db, m)
			if err != nil {
				panic(err)
			}
		case <-stop:
			// 收所有的数据，防止的未写入数据库的
			for {
				select {
				case m := <-toSave:
					fmt.Println("Saving...", len(m))
					err := doSave(db, m)
					if err != nil {
						panic(err)
					}
				default:
					goto allreceived
				}
			}
		allreceived:
			return
		}
	}
}

var savedCount int

func doSave(db *sql.DB, m map[string]*adStaticTableFields) error {
	// TODO: 按表名重新归整数据
	// 这样可以Prepare一下，存储更加快
	start := time.Now()
	defer func() {
		log.Infof("[tracking][doSave] save %d records take: %v", len(m), time.Now().Sub(start))
	}()

	// 提交Prepare可以避免重复解析SQL语句
	stmt, err := db.Prepare(insertSQL)
	if err != nil {
		log.Errorf("[tracking][doSave] Prepare[%s] failed:%v", insertSQL, err)
		return err
	}
	defer stmt.Close()

	for keyMD5, fields := range m {
		_, err := stmt.Exec(
			fields.UserID,
			fields.CampaignID,
			fields.FlowID,
			fields.LanderID,
			fields.AffiliateNetworkID,
			fields.OfferID,
			fields.TrafficSourceID,
			fields.Language,
			fields.Model,
			fields.Country,
			fields.City,
			fields.Region,
			fields.ISP,
			fields.MobileCarrier,
			fields.Domain,
			fields.DeviceType,
			fields.Brand,
			fields.OS,
			fields.OSVersion,
			fields.Browser,
			fields.BrowserVersion,
			fields.ConnectionType,
			fields.Timestamp,
			fields.Visits,
			fields.Clicks,
			fields.Conversions,
			fields.Cost,
			fields.Revenue,
			fields.Impressions,
			keyMD5,
			fields.V1,
			fields.V2,
			fields.V3,
			fields.V4,
			fields.V5,
			fields.V6,
			fields.V7,
			fields.V8,
			fields.V9,
			fields.V10,

			fields.Visits,
			fields.Clicks,
			fields.Conversions,
			fields.Cost,
			fields.Revenue,
			fields.Impressions,
		)

		savedCount++

		if err != nil {
			return err
		}
	}

	return nil
}

var insertSQL = `INSERT INTO AdStatis
(
UserID,
CampaignID,
FlowID,
LanderID,
OfferID,
AffiliateNetworkID,
TrafficSourceID,
Language,
Model,
Country,
City,
Region,
ISP,
MobileCarrier,
Domain,
DeviceType,
Brand,
OS,
OSVersion,
Browser,
BrowserVersion,
ConnectionType,
Timestamp,
Visits,
Clicks,
Conversions,
Cost,
Revenue,
Impressions,
KeysMD5,
V1,
V2,
V3,
V4,
V5,
V6,
V7,
V8,
V9,
V10)

VALUES (
    ?,?,?,?,?,?,?,?,?,?,
    ?,?,?,?,?,?,?,?,?,?,
    ?,?,?,?,?,?,?,?,?,?,
	?,?,?,?,?,?,?,?,?,?
)

ON DUPLICATE KEY UPDATE
Visits = Visits+?, 
Clicks = Clicks+?, 
Conversions = Conversions+?, 
Cost = Cost+?, 
Revenue = Revenue+?,
Impressions = Impressions+?
`
