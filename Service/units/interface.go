package units

import (
	"fmt"
	"net/http"

	"AdClickTool/Service/common"
	"AdClickTool/Service/log"
	"AdClickTool/Service/request"
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
	if !started {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
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
