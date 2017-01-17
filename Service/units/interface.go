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

	req, err := request.CreateRequest("", requestId, request.ReqLPOffer, r)
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

	if req.OfferId() > 0 {
		// Clicks增加
		timestamp := tracking.Timestamp()
		tracking.AddClick(MakeAdStatisKey(req, timestamp), 1)
		tracking.IP.AddClick(MakeIPKey(req, timestamp), 1)
		tracking.Domain.AddClick(MakeDomainKey(req, timestamp), 1)
		tracking.Ref.AddClick(MakeReferrerKey(req, timestamp), 1)

	} else {
		// Visits增加
		timestamp := tracking.Timestamp()
		tracking.AddVisit(MakeAdStatisKey(req, timestamp), 1)
		tracking.IP.AddVisit(MakeIPKey(req, timestamp), 1)
		tracking.Domain.AddVisit(MakeDomainKey(req, timestamp), 1)
		tracking.Ref.AddVisit(MakeReferrerKey(req, timestamp), 1)
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

	// 统计信息的添加
	timestamp := tracking.Timestamp()
	tracking.AddClick(MakeAdStatisKey(req, timestamp), 1)
	tracking.IP.AddClick(MakeIPKey(req, timestamp), 1)
	tracking.Domain.AddClick(MakeDomainKey(req, timestamp), 1)
	tracking.Ref.AddClick(MakeReferrerKey(req, timestamp), 1)

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

	// 统计信息的添加
	timestamp := tracking.Timestamp()
	tracking.AddImpression(MakeAdStatisKey(req, timestamp), 1)
	tracking.IP.AddImpression(MakeIPKey(req, timestamp), 1)
	tracking.Domain.AddImpression(MakeDomainKey(req, timestamp), 1)
	tracking.Ref.AddImpression(MakeReferrerKey(req, timestamp), 1)

	SetCookie(w, request.ReqImpression, req)
}

func OnS2SPostback(w http.ResponseWriter, r *http.Request) {
	if !started {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	userIdText := common.GetUerIdText(r)
	if userIdText == "" {
		log.Errorf("[Units][OnS2SPostback]Null userIdText for %s\n", common.SchemeHostURI(r))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	u := user.GetUserByIdText(userIdText)
	if u == nil {
		log.Errorf("[Units][OnS2SPostback]Invalid userIdText for %s\n", common.SchemeHostURI(r))
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	clickId := r.URL.Query().Get(common.UrlTokenClickId)
	payout := r.URL.Query().Get(common.UrlTokenPayout)
	txId := r.URL.Query().Get(common.UrlTokenTransactionId)
	log.Infof("[Units][OnS2SPostback]Received postback with %s(%s;%s;%s)\n", common.SchemeHostURI(r), clickId, payout, txId)

	req, err := request.CreateRequest(clickId, "", request.ReqS2SPostback, r)
	if req == nil || err != nil {
		log.Errorf("[Units][OnS2SPostback]CreateRequest failed for %s;%v\n", common.SchemeHostURI(r), err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if err := u.OnS2SPostback(w, req); err != nil {
		log.Errorf("[Units][OnS2SPostback]user.OnLPOfferRequest failed for %s;%s\n", req.String(), err.Error())
		w.WriteHeader(http.StatusBadRequest)
		return
	}
}

func OnConversionPixel(w http.ResponseWriter, r *http.Request) {
	if !started {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

}

func OnConversionScript(w http.ResponseWriter, r *http.Request) {
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
