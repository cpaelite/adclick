package tracking

import (
	"AdClickTool/Service/log"
	"database/sql"
	"fmt"
	"time"
)

// Saving 一直执行保存操作
// db参数暂时传过来
func Saving(db *sql.DB) {
	for {
		select {
		case m := <-toSave:
			fmt.Println("Saving...", len(m))
			err := doSave(db, m)
			if err != nil {
				panic(err)
			}
			// TODO: case exit, do exit
		}
	}
}

func doSave(db *sql.DB, m map[string]*adStaticTableFields) error {
	// TODO: 按表名重新归整数据
	// 这样可以Prepare一下，存储更加快
	start := time.Now()
	defer func() {
		log.Infof("[tracking][doSave] save %d records take: %v", len(m), time.Now().Sub(start))
	}()

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
			fields.OfferID,
			fields.TrafficSourceID,
			fields.Language,
			fields.Model,
			fields.Country,
			fields.City,
			fields.Region,
			fields.ISP,
			fields.Domain,
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
			fields.Payout,
			keyMD5,

			fields.Visits,
			fields.Clicks,
			fields.Conversions,
			fields.Cost,
			fields.Payout,
		)

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
TrafficSourceID,
Language,
Model,
Country,
City,
Region,
ISP,
Domain,
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
Payout,
KeysMD5)

VALUES (
    ?,?,?,?,?,?,?,?,?,?,
    ?,?,?,?,?,?,?,?,?,?,
    ?,?,?,?,?,?
)

ON DUPLICATE KEY UPDATE
visits = visits+?, 
clicks = clicks+?, 
conversions = conversions+?, 
cost = cost+?, 
payout = payout+?`
