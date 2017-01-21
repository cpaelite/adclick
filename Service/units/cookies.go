package units

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"AdClickTool/Service/common"
	"AdClickTool/Service/log"
	"AdClickTool/Service/request"
)

//const (
//	TrackingStepLandingPage = "lp"
//	TrackingStepImpression  = "imp"
//	TrackingStepOffer       = "offer"
//	TrackingStepPostback    = "pb"
//)

//TODO 可能的bug：如果第一步请求了offer，但是第二步请求landing page的click，这种case没有处理

func cookie(step string, req request.Request) (c *http.Cookie) {
	c = &http.Cookie{}
	defer func() {
		log.Infof("new cookie:%+v\n", *c)
	}()
	req.AddCookie("reqId", req.Id())
	req.AddCookie("campaignId", fmt.Sprintf("%d", req.CampaignId()))
	switch step {
	case request.ReqImpression:
		req.AddCookie("step", request.ReqImpression)
	case request.ReqLPOffer:
		req.AddCookie("step", request.ReqLPOffer)
	case request.ReqLPClick:
		req.AddCookie("step", request.ReqLPClick)
	case request.ReqS2SPostback:
		// 应该不需要写入cookie
	default:
		return
	}
	c.Domain = req.TrackingDomain()
	// 同一用户的所有cookie共享，所以不应该限制Path
	c.Path = "/"
	c.Name = "tstep"
	c.HttpOnly = true // 客户端无法访问该Cookie
	// 关闭浏览器，就无法继续跳转到后续页面，所以Cookie失效即可
	//c.Expires = time.Now().Add(time.Hour * 1)
	c.Value = base64.URLEncoding.EncodeToString([]byte(req.CookieString()))
	return
}

func SetCookie(w http.ResponseWriter, step string, req request.Request) {
	http.SetCookie(w, cookie(step, req))
}

func ParseCookie(step string, r *http.Request) (req request.Request, err error) {
	switch step {
	case request.ReqImpression:
		return nil, fmt.Errorf("[ParseCookie]Do not parse cookie in step(%s) with url(%s)\n",
			step, common.SchemeHostURI(r))
	case request.ReqLPOffer:
	//OK
	case request.ReqLPClick:
	//OK
	case request.ReqS2SPostback:
	//OK
	default:
		return nil, fmt.Errorf("[ParseCookie]Unsupported step(%s) with url(%s)\n",
			step, common.SchemeHostURI(r))
	}
	c, err := r.Cookie("tstep")
	if err != nil || c == nil {
		return nil, fmt.Errorf("[ParseCookie]Desired cookie(tstep) is empty with error(%v) in step(%s) with url(%s)\n",
			err, step, common.SchemeHostURI(r))
	}
	vb, err := base64.URLEncoding.DecodeString(c.Value)
	if err != nil || len(vb) == 0 {
		return nil, fmt.Errorf("[ParseCookie]Cookie(%s) decode error(%v) in step(%s) with url(%s)\n",
			c.Value, err, step, common.SchemeHostURI(r))
	}
	vs := string(vb)
	cInfo, err := url.ParseQuery(vs)
	if err != nil || cInfo == nil {
		return nil, fmt.Errorf("[ParseCookie]Cookie(%s) parseQuery error(%v) in step(%s) with url(%s)\n",
			c.Value, err, step, common.SchemeHostURI(r))
	}

	reqId := cInfo.Get("reqid")
	campaignId := cInfo.Get("campaignId")
	es := cInfo.Get("step")
	if reqId == "" || campaignId == "" || es == "" {
		return nil, fmt.Errorf("[ParseCookie]Cookie(%s) does not have valid parameters in step(%s) with url(%s)\n",
			c.Value, step, common.SchemeHostURI(r))
	}
	switch step {
	case request.ReqLPClick:
		switch es {
		case request.ReqLPOffer:
		default:
			return nil, fmt.Errorf("[ParseCookie]Request step(%s) does not match last step(%s) for request(%s)\n",
				step, es, req.Id())
		}
	case request.ReqLPOffer:
		switch es {
		case request.ReqImpression:
		default:
			return nil, fmt.Errorf("[ParseCookie]Request step(%s) does not match last step(%s) for request(%s)\n",
				step, es, req.Id())
		}
	case request.ReqS2SPostback:
		switch es {
		case request.ReqLPOffer:
		case request.ReqLPClick:
		default:
			return nil, fmt.Errorf("[ParseCookie]Request step(%s) does not match last step(%s) for request(%s)\n",
				step, es, req.Id())
		}
	}
	req, err = request.CreateRequest(reqId, step, r)
	if req == nil || err != nil {
		return nil, fmt.Errorf("[ParseCookie]CreateRequest error(%v) in step(%s) with url(%s)\n",
			c.Value, err, step, common.SchemeHostURI(r))
	}

	log.Infof("[ParseCookie]Cookie(%s) for request(%s) in step(%s) with url(%s)\n",
		vs, req.Id(), step, common.SchemeHostURI(r))

	cid, err := strconv.ParseInt(campaignId, 10, 64)
	if err != nil || cid <= 0 {
		return nil, fmt.Errorf("[ParseCookie]Parse campaignId(%s) failed with error(%v) for request(%s)\n",
			campaignId, err, req.Id())
	}
	req.SetCampaignId(cid)
	return
}
