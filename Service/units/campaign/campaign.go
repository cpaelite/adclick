package campaign

import (
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"sync"

	"AdClickTool/Service/log"
	"AdClickTool/Service/request"
	"AdClickTool/Service/units/flow"
)

const (
	//0:URL;1:Flow;2:Rule;3:Path;4:Lander;5:Offer
	TargetTypeUrl    = 0
	TargetTypeFlow   = 1
	TargetTypeRule   = 2
	TargetTypePath   = 3
	TargetTypeLander = 4
	TargetTypeOffer  = 5
)

type CampaignConfig struct {
	Id                int64
	UserId            int64
	Hash              string
	Url               string
	ImpPixelUrl       string
	TrafficSourceId   int64
	TrafficSourceName string
	CostModel         string
	CPCValue          float64
	CPAValue          float64
	CPMValue          float64
	TargetType        int64
	TargetFlowId      int64
	TargetUrl         string
	Status            int64

	// 每个campaign的link中包含的参数(traffic source会进行替换，但是由用户自己指定)
	// 例如：[["bannerid","{bannerid}"],["campaignid","{campaignid}"],["zoneid","{zoneid}"]]
	// 从TrafficSource表中读取
	ExternalId []string
	Cost       []string
	Vars       [][]string
}

func (c CampaignConfig) String() string {
	return fmt.Sprintf("Campaign %d:%d Status %d", c.Id, c.UserId, c.Status)
}

type Campaign struct {
	CampaignConfig
}

var cmu sync.RWMutex                         // protects the following
var campaigns = make(map[int64]*Campaign)    // campaignId:instance
var campaignHash2Id = make(map[string]int64) // campaignHash:campaignId
func setCampaign(ca *Campaign) error {
	if ca == nil {
		return errors.New("setCampaign error:ca is nil")
	}
	if ca.Id <= 0 {
		return fmt.Errorf("setCampaign error:ca.Id(%d) is not positive", ca.Id)
	}
	cmu.Lock()
	defer cmu.Unlock()
	campaigns[ca.Id] = ca
	campaignHash2Id[ca.Hash] = ca.Id
	return nil
}
func getCampaign(campaignId int64) *Campaign {
	cmu.RLock()
	defer cmu.RUnlock()
	return campaigns[campaignId]
}
func getCampaignByHash(campaignHash string) *Campaign {
	cmu.RLock()
	defer cmu.RUnlock()
	if campaignId, ok := campaignHash2Id[campaignHash]; ok {
		return campaigns[campaignId]
	}
	return nil
}
func delCampaign(campaignId int64) {
	cmu.Lock()
	defer cmu.Unlock()
	if c, ok := campaigns[campaignId]; ok && c != nil {
		delete(campaigns, campaignId)
		delete(campaignHash2Id, c.Hash)
	}
}

func newCampaign(c CampaignConfig) (ca *Campaign) {
	if c.TargetUrl == "" && c.TargetFlowId <= 0 {
		log.Errorf("[newCampaign]Both TargetUrl&TargetFlowId are invalid for campaign%d\n", c.Id)
		return nil
	}
	if c.TargetFlowId > 0 {
		if err := flow.InitFlow(c.TargetFlowId); err != nil {
			log.Errorf("[newCampaign]InitFlow failed with flow%d for campaign%d\n", c.TargetFlowId, c.Id)
			return nil
		}
	} else {
		_, err := url.ParseRequestURI(c.TargetUrl)
		if err != nil {
			log.Errorf("[newCampaign]TargetUrl is not a valid url(%s) for campaign%d\n", c.TargetUrl, c.Id)
			return nil
		}
	}
	ca = &Campaign{
		CampaignConfig: c,
	}
	return
}

func InitUserCampaigns(userId int64) error {
	cs := DBGetUserCampaigns(userId)
	var ca *Campaign
	for _, c := range cs {
		ca = newCampaign(c)
		if ca == nil {
			return fmt.Errorf("[InitUserCampaigns]Failed for user(%d) with config(%+v)", userId, c)
		}
		if err := setCampaign(ca); err != nil {
			return err
		}
	}
	return nil
}
func GetCampaign(cId int64) (ca *Campaign) {
	ca = getCampaign(cId)
	if ca == nil {
		ca = newCampaign(DBGetCampaign(cId))
	}
	if ca != nil {
		if err := setCampaign(ca); err != nil {
			return nil
		}
	}

	return
}
func GetCampaignByHash(cHash string) (ca *Campaign) {
	ca = getCampaignByHash(cHash)
	if ca == nil {
		ca = newCampaign(DBGetCampaignByHash(cHash))
	}
	if ca != nil {
		if err := setCampaign(ca); err != nil {
			return nil
		}
	}

	return
}
func UpdateCampaign(cId int64) error {
	//TODO 做更细致的更新动作
	if cId <= 0 {
		return errors.New("UpdateCampaign error:campaign.Id is not postive")
	}
	c := DBGetCampaign(cId)
	ca := newCampaign(c)
	if ca == nil {
		return fmt.Errorf("UpdateCampaign error:newCampaign failed for %+v", c)
	}

	return setCampaign(ca)
}
func DelCampaign(campaignId int64) error {
	delCampaign(campaignId)
	return nil
}

const (
	TrackingStepLandingPage = "lp"
	TrackingStepImpression  = "imp"
	TrackingStepOffer       = "offer"
	TrackingStepPostback    = "pb"
)

func cookie(step string, req request.Request) (c *http.Cookie) {
	c = &http.Cookie{}
	defer func() {
		log.Infof("cookie:%+v\n", *c)
	}()
	req.AddCookie("reqid", req.Id())
	switch step {
	case TrackingStepLandingPage:
		req.AddCookie("step", TrackingStepLandingPage)
		req.AddCookie("fid", fmt.Sprintf("%d", req.FlowId()))
		req.AddCookie("rid", fmt.Sprintf("%d", req.RuleId()))
		req.AddCookie("pid", fmt.Sprintf("%d", req.PathId()))
		req.AddCookie("lid", fmt.Sprintf("%d", req.LanderId()))
	case TrackingStepImpression:
		req.AddCookie("step", TrackingStepImpression)
	case TrackingStepOffer:
		req.AddCookie("step", TrackingStepOffer)
		req.AddCookie("fid", fmt.Sprintf("%d", req.FlowId()))
		req.AddCookie("rid", fmt.Sprintf("%d", req.RuleId()))
		req.AddCookie("pid", fmt.Sprintf("%d", req.PathId()))
		req.AddCookie("oid", fmt.Sprintf("%d", req.OfferId()))
	case TrackingStepPostback:
	default:
		return
	}
	c.Domain = req.TrackingDomain()
	c.Path = req.TrackingPath()
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

var gr = &http.Request{
	Method: "GET",
	URL: &url.URL{
		Path: "",
	},
}

func (ca *Campaign) OnLPOfferRequest(w http.ResponseWriter, req request.Request) (err error) {
	if ca == nil {
		return errors.New("[Campaign][OnLPOfferRequest]Nil ca")
	}

	if ca.TargetType == TargetTypeUrl {
		if ca.TargetUrl != "" {
			http.Redirect(w, gr, req.ParseUrlTokens(ca.TargetUrl), http.StatusFound)
			return nil
		}
	} else {
		f := flow.GetFlow(ca.TargetFlowId)
		if f != nil {
			req.SetFlowId(ca.TargetFlowId)
			defer func() {
				if err == nil {
					if req.LanderId() > 0 {
						SetCookie(w, TrackingStepLandingPage, req)
					} else {
						SetCookie(w, TrackingStepOffer, req)
					}
				}
			}()
			return f.OnLPOfferRequest(w, req)
		}
	}

	return fmt.Errorf("[Campaign][OnLPOfferRequest]Invalid dstination for request(%s) in campaign(%d)", req.Id(), ca.Id)
}
