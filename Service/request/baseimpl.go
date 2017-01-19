package request

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"AdClickTool/Service/common"
	"AdClickTool/Service/log"
	"AdClickTool/Service/tracking"
	"AdClickTool/Service/util/ip"
	"AdClickTool/Service/util/ip2location"
	"AdClickTool/Service/util/useragent"

	"strconv"

	"golang.org/x/text/language"
)

type reqbase struct {
	id string
	t  string
	ip string
	ua string

	externalId string
	cost       float64 // 从traffic source里面的Cost字段传过来的cost
	vars       []string

	trafficSourceId   int64
	trafficSourceName string
	userId            int64
	userIdText        string
	campaignHash      string
	campaignId        int64
	flowId            int64
	ruleId            int64
	pathId            int64
	landerId          int64
	offerId           int64

	deviceType     string
	trackingDomain string
	trackingPath   string
	referrer       string
	referrerdomain string
	language       string
	model          string
	brand          string
	countryCode    string
	countryName    string
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
		id:             id,
		t:              t,
		ip:             ip.GetIP(r),
		ua:             r.UserAgent(),
		trackingPath:   r.URL.Path,
		trackingDomain: strings.Split(r.Host, ":")[0],
		vars:           make([]string, VarsMaxNum),
		cookie:         make(map[string]string),
		urlParam:       make(map[string]string),
	}

	// parse traffic source externalId/cost/vars
	switch t {
	case ReqLPOffer:
		fallthrough
	case ReqImpression:
		// 从url参数中获取，由外部调用ParseTSParams处理
	case ReqLPClick:
		// 从user cookie中获取，由外部调用ParseTSParams处理
	case ReqS2SPostback:
		// 从Cache中获取，实际上不会运行到这里，由S2SPostbackRequest生成时处理掉了
		panic("newReqBase actually does not run for ReqS2SPostback")
	}

	//TODO connectiontype/brand/model/deviceType未采集到
	// chuck说connectiontype实际上用得少，可以先不做

	// parse location from ip
	location := ip2location.Get_all(req.ip)
	req.countryCode = location.Country_short
	req.countryName = location.Country_long
	req.region = location.Region
	req.city = location.City
	req.carrier = location.Mobilebrand
	req.isp = location.Isp
	req.connectionType = location.Netspeed

	// parse mobile info from ua
	ua := useragent.New(r.UserAgent())
	log.Info(ua.UA())
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

	req.referrer = r.Referer()
	if rurl, err := url.Parse(req.referrer); err == nil && rurl != nil {
		req.referrerdomain = rurl.Host
	}
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
func (r *reqbase) TrackingPath() string {
	return r.trackingPath
}

func (r *reqbase) ExternalId() string {
	return r.externalId
}

//func (r *reqbase) SetExternalId(id string) {
//	r.externalId = id
//}

func (r *reqbase) Cost() float64 {
	return r.cost
}

//func (r *reqbase) SetCost(cost string) {
//	r.cost = cost
//}

func (r *reqbase) Vars(n uint) string {
	if n > VarsMaxNum {
		return ""
	}
	return r.vars[n-1]
}

//func (r *reqbase) SetVars(n uint, v string) {
//	if n > VarsMaxNum {
//		return
//	}
//	r.vars[n-1] = v
//}

func (r *reqbase) ParseTSParams(
	externalId common.TrafficSourceParams,
	cost common.TrafficSourceParams,
	params []common.TrafficSourceParams,
	values QueryHolder) {
	if r == nil {
		return
	}
	r.externalId = values.Get(externalId.Parameter)

	if len(cost.Parameter) != 0 {
		costStr := values.Get(cost.Parameter)
		var err error
		r.cost, err = strconv.ParseFloat(costStr, 64)
		if err != nil {
			log.Errorf("Parse Cost from:%v failed:%v", costStr, err)
		}
	}

	for i, p := range params {
		if i >= VarsMaxNum {
			break
		}
		r.vars[i] = values.Get(p.Parameter)
	}
}

func (r *reqbase) TrafficSourceId() int64 {
	return r.trafficSourceId
}
func (r *reqbase) SetTrafficSourceId(id int64) {
	r.trafficSourceId = id
}
func (r *reqbase) TrafficSourceName() string {
	return r.trafficSourceName
}
func (r *reqbase) SetTrafficSourceName(name string) {
	r.trafficSourceName = name
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
func (r *reqbase) CountryCode() string { // ISO-ALPHA-3
	return r.countryCode
}
func (r *reqbase) CountryName() string {
	return r.countryName
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
func (r *reqbase) TrackingDomain() string {
	return r.trackingDomain
}
func (r *reqbase) Referrer() string {
	return r.referrer
}
func (r *reqbase) ReferrerDomain() string {
	return r.referrerdomain
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
	//TODO 替换UrlToken
	return url
}

func (r *reqbase) CacheSave(expire time.Time) bool {
	//TODO 加入expire支持
	if err := setReqCache(r); err != nil {
		log.Errorf("[reqbase][CacheSave]setReqCache failed for expire(%s) with err(%s) for request(%s)\n",
			expire.String(), err.Error(), r.String())
		return false
	}
	return true
}
func (r *reqbase) CacheClear() bool {
	delReqCache(r.id)
	return true
}

func (r *reqbase) AdStatisKey(timestamp int64) (key tracking.AdStatisKey) {
	if r == nil {
		return
	}
	key.UserID = r.UserId()
	key.CampaignID = r.CampaignId()
	key.FlowID = r.FlowId()
	key.LanderID = r.LanderId()
	key.OfferID = r.OfferId()
	key.TrafficSourceID = r.TrafficSourceId()
	key.Language = r.Language()
	key.Model = r.Model()
	key.Country = r.CountryCode()
	key.City = r.City()
	key.Region = r.Region()
	key.ISP = r.ISP()
	key.MobileCarrier = r.Carrier()
	key.Domain = r.TrackingDomain()
	key.DeviceType = r.DeviceType()
	key.Brand = r.Brand()
	key.OS = r.OS()
	key.OSVersion = r.OSVersion()
	key.Browser = r.Browser()
	key.BrowserVersion = r.BrowserVersion()
	key.ConnectionType = r.ConnectionType()
	key.Timestamp = timestamp

	// 解析v1-v10
	v := []*string{&key.V1, &key.V2, &key.V3, &key.V4, &key.V5, &key.V6, &key.V7, &key.V8, &key.V9, &key.V10}
	for i := 0; i < len(v); i++ {
		*v[i] = r.Vars(uint(i))
	}
	return
}
func (r *reqbase) IPKey(timestamp int64) tracking.IPStatisKey {
	var ipKey tracking.IPStatisKey
	if r == nil {
		return ipKey
	}
	ipKey.UserID = r.UserId()
	ipKey.Timestamp = timestamp
	ipKey.CampaignID = r.CampaignId()
	ipKey.IP = r.RemoteIp()
	return ipKey
}
func (r *reqbase) ReferrerKey(timestamp int64) tracking.ReferrerStatisKey {
	var referrerKey tracking.ReferrerStatisKey
	if r == nil {
		return referrerKey
	}
	referrerKey.UserID = r.UserId()
	referrerKey.Timestamp = timestamp
	referrerKey.CampaignID = r.CampaignId()
	referrerKey.Referrer = r.Referrer()
	return referrerKey
}
func (r *reqbase) DomainKey(timestamp int64) tracking.ReferrerDomainStatisKey {
	var domain tracking.ReferrerDomainStatisKey
	if r == nil {
		return domain
	}
	domain.UserID = r.UserId()
	domain.Timestamp = timestamp
	domain.CampaignID = r.CampaignId()
	domain.ReferrerDomain = r.ReferrerDomain()
	return domain
}
