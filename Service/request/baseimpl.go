package request

import (
	"fmt"
	"net/http"

	"AdClickTool/Service/log"
	"AdClickTool/Service/util/ip"
	"AdClickTool/Service/util/ip2location"
	"AdClickTool/Service/util/useragent"

	"golang.org/x/text/language"
)

type reqbase struct {
	id string
	t  string
	ip string
	ua string

	userId       int64
	userIdText   string
	campaignHash string
	campaignId   int64
	flowId       int64
	ruleId       int64
	pathId       int64
	landerId     int64
	offerId      int64

	deviceType     string
	domain         string
	language       string
	model          string
	brand          string
	country        string
	region         string
	city           string
	carrier        string
	isp            string
	os             string
	osVersion      string
	browser        string
	browserVersion string
	connectionType string
	bot            bool

	cookie map[string]string

	urlParam map[string]string
}

func newReqBase(id, t string, r *http.Request) (req *reqbase) {
	req = &reqbase{
		id: id,
		t:  t,
		ip: ip.GetIP(r),
		ua: r.UserAgent(),
	}
	//TODO carrier/connectiontype/brand/model/deviceType未采集到

	// parse location from ip
	location := ip2location.Get_all(req.ip)
	req.country = location.Country_short
	req.region = location.Region
	req.city = location.City
	//req.carrier = location.Carrier()
	req.isp = location.Isp
	//req.connectionType = location.ConnectionType()

	// parse mobile info from ua
	ua := useragent.New(r.UserAgent())
	log.Info(ua)
	req.os = ua.OS()
	req.osVersion = ua.OSInfo().Version
	req.browser, req.browserVersion = ua.Browser()
	req.bot = ua.Bot()
	if ua.Mobile() {
		//req.brand = ua.MobileBrand()
		//req.model = ua.Model()
	} else {
		req.brand = "UNKNOWN"
		req.model = "UNKNOWN"
	}

	req.domain = r.Referer()
	tag, _, err := language.ParseAcceptLanguage(r.Header.Get("Accept-Language"))
	if err != nil || len(tag) == 0 {
		req.language = "UNKNOWN"
	} else {
		req.language = tag[0].String() // 只用取quality最高的language就可以了
	}

	return req
}

func (r *reqbase) Id() string {
	return r.id
}
func (r *reqbase) Type() string {
	return r.t
}
func (r *reqbase) String() string {
	return fmt.Sprintf("[Request][%s][%s][%d][%d]", r.Type(), r.Id(), r.UserId(), r.CampaignId())
}

func (r *reqbase) UserId() int64 {
	return r.userId
}
func (r *reqbase) SetUserId(id int64) {
	r.userId = id
}
func (r *reqbase) UserIdText() string {
	return r.userIdText
}
func (r *reqbase) SetUserIdText(idText string) {
	r.userIdText = idText
}
func (r *reqbase) CampaignHash() string {
	return r.campaignHash
}
func (r *reqbase) SetCampaignHash(hash string) {
	r.campaignHash = hash
}
func (r *reqbase) CampaignId() int64 {
	return r.campaignId
}
func (r *reqbase) SetCampaignId(id int64) {
	r.campaignId = id
}
func (r *reqbase) FlowId() int64 {
	return r.flowId
}
func (r *reqbase) SetFlowId(id int64) {
	r.flowId = id
}
func (r *reqbase) RuleId() int64 {
	return r.ruleId
}
func (r *reqbase) SetRuleId(id int64) {
	r.ruleId = id
}
func (r *reqbase) PathId() int64 {
	return r.pathId
}
func (r *reqbase) SetPathId(id int64) {
	r.pathId = id
}
func (r *reqbase) LanderId() int64 {
	return r.landerId
}
func (r *reqbase) SetLanderId(id int64) {
	r.landerId = id
}
func (r *reqbase) OfferId() int64 {
	return r.offerId
}
func (r *reqbase) SetOfferId(id int64) {
	r.offerId = id
}

func (r *reqbase) DeviceType() string {
	return r.deviceType
}
func (r *reqbase) UserAgent() string {
	return r.ua
}
func (r *reqbase) RemoteIp() string {
	return r.ip
}
func (r *reqbase) Language() string {
	return r.language
}
func (r *reqbase) Model() string {
	return r.model
}
func (r *reqbase) Country() string {
	return r.country
}
func (r *reqbase) City() string {
	return r.city
}
func (r *reqbase) Region() string {
	return r.region
}
func (r *reqbase) Carrier() string {
	return r.carrier
}
func (r *reqbase) ISP() string {
	return r.isp
}
func (r *reqbase) Domain() string {
	return r.domain
}
func (r *reqbase) Brand() string {
	return r.brand
}
func (r *reqbase) OS() string {
	return r.os
}
func (r *reqbase) OSVersion() string {
	return r.osVersion
}
func (r *reqbase) Browser() string {
	return r.browser
}
func (r *reqbase) BrowserVersion() string {
	return r.browserVersion
}
func (r *reqbase) ConnectionType() string {
	return r.connectionType
}
func (r *reqbase) IsBot() bool {
	return r.bot
}

func (r *reqbase) AddCookie(key string, value string) {
	r.cookie[key] = value
}
func (r *reqbase) DelCookie(key string) {
	delete(r.cookie, key)
}
func (r *reqbase) CookieString() (encode string) {
	encode = ""
	for k, v := range r.cookie {
		encode += fmt.Sprintf("%s=%s&", k, v)
	}
	return encode[:len(encode)-1]
}

func (r *reqbase) AddUrlParam(key string, value string) {
	r.urlParam[key] = value
}
func (r *reqbase) DelUrlParam(key string) {
	delete(r.urlParam, key)
}
func (r *reqbase) UrlParamString() (encode string) {
	encode = ""
	for k, v := range r.urlParam {
		encode += fmt.Sprintf("%s=%s&", k, v)
	}
	return encode[:len(encode)-1]
}

func (r *reqbase) ParseUrlTokens(url string) string {
	//TODO
	return url
}
