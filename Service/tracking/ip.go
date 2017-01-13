package tracking

import (
	"AdClickTool/Service/gracequit"
	"database/sql"
)

// AdIPStatis表的支持工作
// 使用方式：tracking.IP.AddClick(k, 1)

// IPStatisKey AdIPStatis表里面的Unique Key部分
type IPStatisKey struct {
	UserID     int
	Timestamp  int
	CampaignID int
	IP         string
}

var ipStatisSQL = `INSERT INTO AdIPStatis
(UserID,
Timestamp,
CampaignID,
IP,

Visits,
Clicks,
Conversions,
Cost,
Revenue,
Impressions)
VALUES
(?,?,?,?,?,?,?,?,?,?)
ON DUPLICATE KEY UPDATE
Visits = Visits+?,
Clicks = Clicks+?,
Conversions = Conversions+?,
Cost = Cost+?,
Revenue = Revenue+?,
Impressions = Impressions+?`

// IP 默认的AdIPStatis汇总存储
var IP gatherSaver

// InitIPGatherSaver 初始化tracking.IP
func InitIPGatherSaver(g *gracequit.GraceQuit, db *sql.DB) {
	ip := newGatherSaver(g, ipStatisSQL)
	ip.Start(db)
}
