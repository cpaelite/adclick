package units

import (
	"fmt"
	"net/http"

	"AdClickTool/Service/common"
	"AdClickTool/Service/log"
	"AdClickTool/Service/request"
	"AdClickTool/Service/tracking"
	"AdClickTool/Service/units/campaign"
	"AdClickTool/Service/units/user"
)

func Init() (err error) {
	err = user.InitAllUsers()
	if err != nil {
		return
	}
	started = true
	return nil
}

/**
 * Request处理
**/
var page404 = `<html><head><title>Error: Page not found. If you want to change the content of this page, go to your account Settings / Root domain.</title></head><body><h3>Error 404</h3><p>Page not found. If you want to change the content of this page, go to your account Settings / Root domain.</p></body></html>`

func OnLPOfferRequest(w http.ResponseWriter, r *http.Request) {
	requestId := common.GenRandId()
	log.Infof("[Units][OnLPOfferRequest]Received request %s:%s\n", requestId, common.SchemeHostURI(r))
	if !started {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	userIdText := common.GetUerIdText(r)
	if userIdText == "" {
		log.Errorf("[Units][OnLPOfferRequest]Null userIdText for %s:%s\n", requestId, common.SchemeHostURI(r))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	u := user.GetUserByIdText(userIdText)
	if u == nil {
		log.Errorf("[Units][OnLPOfferRequest]Invalid userIdText for %s:%s\n", requestId, common.SchemeHostURI(r))
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	campaignHash := common.GetCampaignHash(r)
	if campaignHash == "" {
		log.Errorf("[Units][OnLPOfferRequest]Invalid campaignHash for %s:%s\n", requestId, common.SchemeHostURI(r))
		if u.RootDomainRedirect == "" {
			w.Header().Set("Content-Type", "text/plain")
			fmt.Fprint(w, page404)
			w.WriteHeader(http.StatusNotFound)
		} else {
			http.Redirect(w, r, u.RootDomainRedirect, http.StatusMovedPermanently)
		}
		return
	}

	req, err := request.CreateRequest(requestId, request.ReqLPOffer, r)
	if req == nil || err != nil {
		log.Errorf("[Units][OnLPOfferRequest]CreateRequest failed for %s;%s;%v\n", requestId, common.SchemeHostURI(r), err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	req.SetCampaignHash(campaignHash)

	if err := u.OnLPOfferRequest(w, req); err != nil {
		log.Errorf("[Units][OnLPOfferRequest]user.OnLPOfferRequest failed for %s;%s\n", req.String(), err.Error())
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	SetCookie(w, request.ReqLPOffer, req)
}

func OnLandingPageClick(w http.ResponseWriter, r *http.Request) {
	if !started {
		//TODO add error log
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	req, err := ParseCookie(request.ReqLPClick, r)
	if err != nil || req == nil {
		//TODO add error log
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if req.CampaignId() <= 0 ||
		req.FlowId() <= 0 ||
		req.RuleId() <= 0 ||
		req.PathId() <= 0 ||
		req.LanderId() <= 0 {
		log.Errorf("[Units][OnLandingPageClick]CampaignId|FlowId|RuleId|PathId|LanderId is 0 for %s:%s\n",
			req.Id(), common.SchemeHostURI(r))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	log.Infof("[Units][OnLandingPageClick]Received request %s:%s\n", req.Id(), common.SchemeHostURI(r))

	userIdText := common.GetUerIdText(r)
	if userIdText == "" {
		log.Errorf("[Units][OnLandingPageClick]Null userIdText for %s:%s\n", req.Id(), common.SchemeHostURI(r))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	u := user.GetUserByIdText(userIdText)
	if u == nil {
		log.Errorf("[Units][OnLandingPageClick]Invalid userIdText for %s:%s\n", req.Id(), common.SchemeHostURI(r))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if err := u.OnLandingPageClick(w, req); err != nil {
		log.Errorf("[Units][OnLandingPageClick]user.OnLandingPageClick failed for %s;%s\n", req.String(), err.Error())
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	SetCookie(w, request.ReqLPClick, req)
}

func OnImpression(w http.ResponseWriter, r *http.Request) {
	// TODO: Impression Pixel Tracking
	// URL格式：http://zx1jg.voluumtrk.com/impression/be8da5d9-7955-4400-95e3-05c9231a6e92?keyword={keyword}&keyword_id={keyword_id}&creative_id={creative_id}&campaign_id={campaign_id}&country={country}&bid={bid}&click_id={click_id}
	// 1. 通过链接拿到user和campaign，以及trafficsource
	// 2. 通过IP拿到其它信息，如Language, Model, Country, City, ....
	// 3. 根据参数解析v1-v10
	// 4. 增加统计信息，结束

	requestId := common.GenRandId()
	log.Infof("[Units][OnImpression]Received request %s:%s\n", requestId, common.SchemeHostURI(r))

	// w.Header().
	// req.AddCookie("reqid", requestId)

	userIdText := common.GetUerIdText(r)
	if userIdText == "" {
		log.Errorf("[Units][OnImpression]Null userIdText for %s:%s\n", requestId, common.SchemeHostURI(r))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	u := user.GetUserByIdText(userIdText)
	if u == nil {
		log.Errorf("[Units][OnImpression]Invalid userIdText for %s:%s\n", requestId, common.SchemeHostURI(r))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	campaignHash := common.GetCampaignHash(r)
	if campaignHash == "" {
		log.Errorf("[Units][OnImpression]Invalid campaignHash for %s:%s\n", requestId, common.SchemeHostURI(r))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	req := request.CreateImpressionRequest(requestId, r)
	if req == nil {
		log.Errorf("[Units][OnImpression]CreateRequest failed for %s;%s\n", requestId, common.SchemeHostURI(r))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	req.SetCampaignHash(campaignHash)
	// if err := u.OnImpression(w, req); err != nil {
	// 	log.Errorf("[Units][OnImpression]user.OnImpression failed for %s;%s\n", req.String(), err.Error())
	// 	w.WriteHeader(http.StatusInternalServerError)
	// 	return
	// }

	// 能过campaign拿到traffic source，然后拿到其参数配置格式
	ca := campaign.GetCampaignByHash(campaignHash)
	if ca == nil {
		log.Errorf("[Units][OnImpression]Invalid campaignHash for %s:%s:%s\n", requestId, common.SchemeHostURI(r), campaignHash)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// 统计分析代码
	var key tracking.AdStatisKey
	key.UserID = u.UserConfig.Id
	key.CampaignID = ca.Id
	key.FlowID = ca.TargetFlowId
	key.LanderID = 0
	key.OfferID = 0
	key.TrafficSourceID = ca.TrafficSourceId
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

	tracking.AddImpression(key, 1)

	// TODO: 以后AdStatis表里面增加v1-v10的group by的时候
	// 就在这里解析这些参数
	// params := ca.ParseVars(r.FormValue)
	// 解析v1-v10
	// r.ParseForm()

	SetCookie(w, request.ReqImpression, req)
}

func OnOfferPostback(w http.ResponseWriter, r *http.Request) {
	if !started {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
}

/**
 * 注册数据库更新消息回调
**/
func RegisterToMQ() error {
	return nil
}
func OnNotifyDBChanged(w http.ResponseWriter, r *http.Request) {
	//TODO 是否通过HTTP通信，有待确认
}
