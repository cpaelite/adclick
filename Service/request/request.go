package request

import (
	"fmt"
	"net/http"
	"time"

	"AdClickTool/Service/common"
)

const (
	ReqLPOffer          = "lpofferreq"
	ReqLPClick          = "landingpageclick"
	ReqImpression       = "impression"
	ReqS2SPostback      = "s2spostback"
	ReqConversionPixel  = "conversionpixel"
	ReqConversionScript = "conversionscript"
)

const (
	VarsMaxNum = 10
)

type Request interface {
	Id() string
	Type() string
	String() string

	ParseUrlTokens(url string) string

	ExternalId() string
	SetExternalId(id string)
	Cost() string
	SetCost(cost string)
	Vars(n uint) string       // n:1~VarsMaxNum
	SetVars(n uint, v string) // n:1~VarsMaxNum

	ClickId() string
	SetClickId(id string)
	TrafficSourceId() int64
	SetTrafficSourceId(id int64)
	TrafficSourceName() string
	SetTrafficSourceName(name string)
	UserId() int64
	SetUserId(id int64)
	UserIdText() string
	SetUserIdText(idText string)
	CampaignHash() string
	SetCampaignHash(hash string)
	CampaignId() int64
	SetCampaignId(id int64)
	FlowId() int64
	SetFlowId(id int64)
	RuleId() int64
	SetRuleId(id int64)
	PathId() int64
	SetPathId(id int64)
	LanderId() int64
	SetLanderId(id int64)
	OfferId() int64
	SetOfferId(id int64)

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
	TrackingPath() string
	Referrer() string
	ReferrerDomain() string
	Brand() string
	OS() string
	OSVersion() string
	Browser() string
	BrowserVersion() string
	ConnectionType() string
	IsBot() bool

	AddCookie(key, value string)
	DelCookie(key string)
	CookieString() string

	AddUrlParam(key, value string)
	DelUrlParam(key string)
	UrlParamString() string // 不包括"?"和"/"部分

	CacheSave(expire time.Time) (token string)
	CacheClear() bool
}

func CreateRequest(token, reqId, reqType string, r *http.Request) (req Request, err error) {
	if (token == "" && reqId == "") || reqType == "" {
		return nil, fmt.Errorf("[CreateRequest]Either (token&&reqId) or reqType is empty for request for %s", common.SchemeHostURI(r))
	}
	switch reqType {
	case ReqLPOffer:
		req = CreateLPOfferRequest(reqId, r)
		if req == nil {
			return nil, fmt.Errorf("CreateRequest failed for %s;%s;%s%s", reqType, reqId, r.Host, r.RequestURI)
		}
		return req, nil
	case ReqLPClick:
		req = CreateLPClickRequest(reqId, r)
		if req == nil {
			return nil, fmt.Errorf("CreateRequest failed for %s;%s;%s%s", reqType, reqId, r.Host, r.RequestURI)
		}
		return req, nil
	case ReqS2SPostback:
		req = CreateS2SPostbackRequest(token, r)
		if req == nil {
			return nil, fmt.Errorf("CreateRequest failed for %s;%s;%s%s", reqType, reqId, r.Host, r.RequestURI)
		}
		return req, nil
	case ReqConversionPixel:
		//TODO
	case ReqConversionScript:
		//TODO
	}
	//TODO add error
	return nil, nil
}
