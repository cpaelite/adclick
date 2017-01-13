package tracking

import (
	"AdClickTool/Service/gracequit"
	"database/sql"
)

// AdReferrerDomainStatis表的支持工作
// 使用方式：tracking.Domain.AddClick(k, 1)

// ReferrerDomainStatisKey AdReferrerDomainStatis表里面的Unique Key部分
type ReferrerDomainStatisKey struct {
	UserID         int
	Timestamp      int
	CampaignID     int
	ReferrerDomain string
}

var referrerDomainStatisSQL = `INSERT INTO AdReferrerDomainStatis
(UserID,
Timestamp,
CampaignID,
ReferrerDomain,

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

// Domain 默认的AdIPStatis汇总存储
var Domain gatherSaver

// InitDomainGatherSaver 初始化tracking.Domain
func InitDomainGatherSaver(g *gracequit.GraceQuit, db *sql.DB) {
	Domain := newGatherSaver(g, referrerDomainStatisSQL)
	Domain.Start(db)
}
