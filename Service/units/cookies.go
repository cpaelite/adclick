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
	req.AddCookie("reqid", req.Id())
	req.AddCookie("cid", fmt.Sprintf("%d", req.CampaignId()))
	req.AddCookie("fid", fmt.Sprintf("%d", req.FlowId()))
	req.AddCookie("rid", fmt.Sprintf("%d", req.RuleId()))
	req.AddCookie("pid", fmt.Sprintf("%d", req.PathId()))
	req.AddCookie("lid", fmt.Sprintf("%d", req.LanderId()))
	req.AddCookie("oid", fmt.Sprintf("%d", req.OfferId()))
	switch step {
	case request.ReqLPOffer:
		req.AddCookie("step", request.ReqLPOffer)
	case request.ReqLPClick:
		req.AddCookie("step", request.ReqLPClick)
	case request.ReqS2SPostback:
		//TODO 应该不需要写入cookie
	default:
		return
	}
	c.Domain = req.TrackingDomain()
	// 同一用户的所有cookie共享，所以不应该限制Path
	//c.Path = req.TrackingPath()
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
	case request.ReqLPOffer:
		return nil, fmt.Errorf("[ParseCookie]Do not parse cookie in step(%s) with url(%s)\n",
			step, common.SchemeHostURI(r))
	case request.ReqLPClick:
	case request.ReqImpression:
	case request.ReqS2SPostback:
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

	req, err = request.CreateRequest("", cInfo.Get("reqid"), step, r)
	if req == nil || err != nil {
		return nil, fmt.Errorf("[ParseCookie]CreateRequest error(%v) in step(%s) with url(%s)\n",
			c.Value, err, step, common.SchemeHostURI(r))
	}

	log.Infof("[ParseCookie]Cookie(%s) for request(%s) in step(%s) with url(%s)\n",
		vs, req.Id(), step, common.SchemeHostURI(r))

	es := cInfo.Get("step")
	switch step {
	case request.ReqLPClick:
		switch es {
		case request.ReqImpression:
		case request.ReqLPOffer:
		default:
			return nil, fmt.Errorf("[ParseCookie]Request step(%s) does not match last step(%s) for request(%s)\n",
				step, es, req.Id())
		}
	case request.ReqImpression:
		switch es {
		case request.ReqLPClick:
		case request.ReqLPOffer:
		default:
			return nil, fmt.Errorf("[ParseCookie]Request step(%s) does not match last step(%s) for request(%s)\n",
				step, es, req.Id())
		}
	case request.ReqS2SPostback:
		switch es {
		case request.ReqLPClick:
		case request.ReqImpression:
		case request.ReqLPOffer:
		default:
			return nil, fmt.Errorf("[ParseCookie]Request step(%s) does not match last step(%s) for request(%s)\n",
				step, es, req.Id())
		}
	}
	cid, err := strconv.ParseInt(cInfo.Get("cid"), 10, 64)
	if err != nil || cid <= 0 {
		return nil, fmt.Errorf("[ParseCookie]Parse cid(%s) failed with error(%v) for request(%s)\n",
			cInfo.Get("cid"), err, req.Id())
	}
	fid, err := strconv.ParseInt(cInfo.Get("fid"), 10, 64)
	if err != nil || fid <= 0 {
		return nil, fmt.Errorf("[ParseCookie]Parse fid(%s) failed with error(%v) for request(%s)\n",
			cInfo.Get("fid"), err, req.Id())
	}
	rid, err := strconv.ParseInt(cInfo.Get("rid"), 10, 64)
	if err != nil || rid <= 0 {
		return nil, fmt.Errorf("[ParseCookie]Parse rid(%s) failed with error(%v) for request(%s)\n",
			cInfo.Get("rid"), err, req.Id())
	}
	pid, err := strconv.ParseInt(cInfo.Get("pid"), 10, 64)
	if err != nil || pid <= 0 {
		return nil, fmt.Errorf("[ParseCookie]Parse pid(%s) failed with error(%v) for request(%s)\n",
			cInfo.Get("pid"), err, req.Id())
	}
	lid, err := strconv.ParseInt(cInfo.Get("lid"), 10, 64)
	if err != nil {
		return nil, fmt.Errorf("[ParseCookie]Parse lid(%s) failed with error(%v) for request(%s)\n",
			cInfo.Get("lid"), err, req.Id())
	}
	oid, err := strconv.ParseInt(cInfo.Get("oid"), 10, 64)
	if err != nil {
		return nil, fmt.Errorf("[ParseCookie]Parse oid(%s) failed with error(%v) for request(%s)\n",
			cInfo.Get("oid"), err, req.Id())
	}
	if lid <= 0 && oid <= 0 {
		return nil, fmt.Errorf("[ParseCookie]Both landerId&offerId are 0 for request(%s)\n", req.Id())
	}
	req.SetCampaignId(cid)
	req.SetFlowId(fid)
	req.SetRuleId(rid)
	req.SetPathId(pid)
	req.SetLanderId(lid)
	req.SetOfferId(oid)
	return
}
