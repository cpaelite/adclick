package request

import (
	"fmt"
	"net/http"

	"AdClickTool/Service/common"
)

const (
	ReqLPOffer    = "lpofferreq"
	ReqLPClick    = "landingpageclick"
	ReqImpression = "impression"
	ReqOfferPB    = "offerpostback"
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
}

func CreateRequest(id, t string, r *http.Request) (req Request, err error) {
	if id == "" || t == "" {
		return nil, fmt.Errorf("[CreateRequest]Either id or t is empty for request for %s", common.SchemeHostURI(r))
	}
	switch t {
	case ReqLPOffer:
		req = CreateLPOfferRequest(id, r)
		if req == nil {
			return nil, fmt.Errorf("CreateRequest failed for %s;%s;%s%s", t, id, r.Host, r.RequestURI)
		}
		return req, nil
	case ReqLPClick:
		req = CreateLPClickRequest(id, r)
		if req == nil {
			return nil, fmt.Errorf("CreateRequest failed for %s;%s;%s%s", t, id, r.Host, r.RequestURI)
		}
		return req, nil
	case ReqOfferPB:
		req = CreateOfferPBRequest(id, r)
		if req == nil {
			return nil, fmt.Errorf("CreateRequest failed for %s;%s;%s%s", t, id, r.Host, r.RequestURI)
		}
		return req, nil
	}
	//TODO add error
	return nil, nil
}
