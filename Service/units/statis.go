package units

import (
	"AdClickTool/Service/tracking"
	"time"
)

// RequestInfo 里面有请求的所有信息
type RequestInfo interface {
	Id() string
	Type() string
	String() string
	TrackingPath() string
	ExternalId() string
	SetExternalId(id string)
	Cost() string
	Vars(n uint) string
	ClickId() string
	TrafficSourceId() int64
	TrafficSourceName() string
	UserId() int64
	UserIdText() string
	CampaignHash() string
	CampaignId() int64
	FlowId() int64
	RuleId() int64
	PathId() int64
	LanderId() int64
	OfferId() int64
	DeviceType() string
	UserAgent() string
	RemoteIp() string
	Language() string
	Model() string
	Country() string
	City() string
	Region() string
	Carrier() string
	ISP() string
	TrackingDomain() string
	Referrer() string
	ReferrerDomain() string
	Brand() string
	OS() string
	OSVersion() string
	Browser() string
	BrowserVersion() string
	ConnectionType() string
}

// MakeConversion 根据RequestInfo build出来一个Conversion
func MakeConversion(req RequestInfo) tracking.Conversion {
	var conv tracking.Conversion
	conv.UserID = req.UserId()
	conv.PostbackTimestamp = time.Now().UnixNano() / int64(time.Millisecond)
	// TODO: 这里需要拿到之前的时间
	conv.VisitTimestamp = time.Now().UnixNano() / int64(time.Millisecond)
	conv.ExternalID = req.ExternalId()
	conv.ClickID = req.ClickId()
	// conv.TransactionID =
	// conv.Revenue = req.Payout()
	conv.Cost = req.Cost()
	// conv.CampaignName = req.CampaignName()
	conv.CampaignID = req.CampaignId()
	conv.FlowID = req.FlowId()
	// conv.LanderName =
	conv.LanderID = req.LanderId()
	// conv.OfferName =
	conv.OfferID = req.OfferId()
	conv.Country = req.Country()
	// conv.CountryCode = req.Country
	// conv.TrafficSourceName
	conv.TrafficSourceID = req.TrafficSourceId()
	// conv.AffiliateNetworkName =
	// conv.AffiliateNetworkID
	// conv.Device = req.Device
	conv.OS = req.OS()
	conv.OSVersion = req.OSVersion()
	conv.Brand = req.Brand()
	conv.Model = req.Model()
	conv.Browser = req.Browser()
	conv.BrowserVersion = req.BrowserVersion()
	conv.ISP = req.ISP()
	conv.MobileCarrier = req.Carrier()
	conv.VisitorIP = req.RemoteIp()
	conv.VisitorReferrer = req.Referrer()

	// 解析v1-v10
	v := []*string{&key.V1, &key.V2, &key.V3, &key.V4, &key.V5, &key.V6, &key.V7, &key.V8, &key.V9, &key.V10}
	for i := 0; i < len(v); i++ {
		*v[i] = req.Vars(uint(i))
	}
	return conv
}

// MakeAdStatisKey 根据RequestInfo build出来一个AdStatisKey
func MakeAdStatisKey(req RequestInfo, timestamp int64) tracking.AdStatisKey {
	// 统计分析代码
	var key tracking.AdStatisKey
	key.UserID = req.UserId()
	key.CampaignID = req.CampaignId()
	key.FlowID = req.FlowId()
	key.LanderID = req.LanderId()
	key.OfferID = req.OfferId()
	key.TrafficSourceID = req.TrafficSourceId()
	key.Language = req.Language()
	key.Model = req.Model()
	key.Country = req.Country()
	key.City = req.City()
	key.Region = req.Region()
	key.ISP = req.ISP()
	key.MobileCarrier = req.Carrier()
	key.Domain = req.TrackingDomain()
	key.DeviceType = req.DeviceType()
	key.Brand = req.Brand()
	key.OS = req.OS()
	key.OSVersion = req.OSVersion()
	key.Browser = req.Browser()
	key.BrowserVersion = req.BrowserVersion()
	key.ConnectionType = req.ConnectionType()
	key.Timestamp = timestamp

	// 解析v1-v10
	v := []*string{&key.V1, &key.V2, &key.V3, &key.V4, &key.V5, &key.V6, &key.V7, &key.V8, &key.V9, &key.V10}
	for i := 0; i < len(v); i++ {
		*v[i] = req.Vars(uint(i))
	}
	return key
}

// MakeIPKey 根据RequestInfo制作一个IPStatisKey
func MakeIPKey(req RequestInfo, timestamp int64) tracking.IPStatisKey {
	var ipKey tracking.IPStatisKey
	ipKey.UserID = req.UserId()
	ipKey.Timestamp = timestamp
	ipKey.CampaignID = req.CampaignId()
	ipKey.IP = req.RemoteIp()
	return ipKey
}

// MakeReferrerKey 根据RequestInfo制作一个ReferrerStatisKey
func MakeReferrerKey(req RequestInfo, timestamp int64) tracking.ReferrerStatisKey {
	var referrerKey tracking.ReferrerStatisKey
	referrerKey.UserID = req.UserId()
	referrerKey.Timestamp = timestamp
	referrerKey.CampaignID = req.CampaignId()
	referrerKey.Referrer = req.Referrer()
	return referrerKey
}

// MakeDomainKey 根据RequestInfo制作一个ReferrerDomainStatisKey
func MakeDomainKey(req RequestInfo, timestamp int64) tracking.ReferrerDomainStatisKey {
	var domain tracking.ReferrerDomainStatisKey
	domain.UserID = req.UserId()
	domain.Timestamp = timestamp
	domain.CampaignID = req.CampaignId()
	domain.ReferrerDomain = req.ReferrerDomain()
	return domain
}
