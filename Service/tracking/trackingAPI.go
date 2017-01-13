package tracking

import (
	"crypto/md5"
	"fmt"
	"time"
)

// AdStatisKey AdStatic表里面用来当作unique key的所有的字段
// Timestamp不用给，里面会赋值
type AdStatisKey struct {
	UserID          int
	CampaignID      int
	FlowID          int
	LanderID        int
	OfferID         int
	TrafficSourceID int
	Language        string
	Model           string
	Country         string
	City            string
	Region          string
	ISP             string
	MobileCarrier   string
	Domain          string
	DeviceType      string
	Brand           string
	OS              string
	OSVersion       string
	Browser         string
	BrowserVersion  string
	ConnectionType  string
	Timestamp       int
}

func statisKeyMD5(k *AdStatisKey) string {
	h := md5.New()
	// io.WriteString(h, txt)
	fmt.Fprintf(h, "%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v,%v",
		k.UserID,
		k.CampaignID,
		k.FlowID,
		k.LanderID,
		k.OfferID,
		k.TrafficSourceID,
		k.Language,
		k.Model,
		k.Country,
		k.City,
		k.Region,
		k.ISP,
		k.MobileCarrier,
		k.Domain,
		k.DeviceType,
		k.Brand,
		k.OS,
		k.OSVersion,
		k.Browser,
		k.BrowserVersion,
		k.ConnectionType,
		k.Timestamp,
	)
	return fmt.Sprintf("%X", h.Sum(nil))
}

// AddVisit 增加visit统计信息
func AddVisit(key AdStatisKey, count int) {
	f := func(d *adStatisValues) {
		d.Visits += count
	}
	addTrackEvent(key, f)
}

// AddClick 增加click统计信息
func AddClick(key AdStatisKey, count int) {
	f := func(d *adStatisValues) {
		d.Clicks += count
	}
	addTrackEvent(key, f)
}

// AddConversion 增加conversion统计信息
func AddConversion(key AdStatisKey, count int) {
	f := func(d *adStatisValues) {
		d.Conversions += count
	}
	addTrackEvent(key, f)
}

// AddImpression 增加impression统计信息
func AddImpression(key AdStatisKey, count int) {
	f := func(d *adStatisValues) {
		d.Impressions += count
	}
	addTrackEvent(key, f)
}

// AddCost 增加cost统计信息
func AddCost(key AdStatisKey, count float64) {
	f := func(d *adStatisValues) {
		d.Cost += count
	}
	addTrackEvent(key, f)
}

// AddPayout 增加payout统计信息
func AddPayout(key AdStatisKey, count float64) {
	f := func(d *adStatisValues) {
		d.Revenue += count
	}
	addTrackEvent(key, f)
}

func addTrackEvent(key AdStatisKey, action func(d *adStatisValues)) {
	currentMillisecond := time.Now().UnixNano() / int64(time.Millisecond)
	key.Timestamp = int(currentMillisecond - (currentMillisecond % 3600000))

	gatherChan <- events{
		keyMd5:    statisKeyMD5(&key),
		keyFields: key,
		action:    action,
	}
}
