package campaign

import (
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

// TrafficSourceParams {"Parameter":"X","Placeholder":"X","Name":"X","Track":N(0,1)}
type TrafficSourceParams struct {
	Parameter   string
	Placeholder string
	Name        string
	Track       int
}

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
	ExternalId TrafficSourceParams
	Cost       TrafficSourceParams
	Vars       []TrafficSourceParams
}

// ParseVars 根据Vars解析出10个参数，分别是，v1-v10
func (c *CampaignConfig) ParseVars(getter func(k string) string) []string {
	vars := []string{}
	for _, param := range c.Vars {
		v := getter(param.Parameter)
		vars = append(vars, v)
	}
	return vars
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
		if f == nil {
			return fmt.Errorf("[Campaign][OnLPOfferRequest]Nil f(%d) for request(%s) in campaign(%d)", ca.TargetFlowId, req.Id(), ca.Id)
		}
		req.SetFlowId(ca.TargetFlowId)
		return f.OnLPOfferRequest(w, req)
	}

	return fmt.Errorf("[Campaign][OnLPOfferRequest]Invalid dstination for request(%s) in campaign(%d)", req.Id(), ca.Id)
}

func (ca *Campaign) OnLandingPageClick(w http.ResponseWriter, req request.Request) error {
	if ca == nil {
		return errors.New("[Campaign][OnLandingPageClick]Nil ca")
	}

	if ca.TargetType == TargetTypeFlow {
		f := flow.GetFlow(ca.TargetFlowId)
		if f == nil {
			return fmt.Errorf("[Campaign][OnLandingPageClick]Nil f(%d) for request(%s) in campaign(%d)", ca.TargetFlowId, req.Id(), ca.Id)
		}
		req.SetFlowId(ca.TargetFlowId)
		return f.OnLandingPageClick(w, req)
	}

	return fmt.Errorf("[Campaign][OnLandingPageClick]Invalid dstination(%d) for request(%s) in campaign(%d)", ca.TargetType, req.Id(), ca.Id)
}

func (ca *Campaign) OnImpression(w http.ResponseWriter, req request.Request) error {
	return nil
}

func (ca *Campaign) OnOfferPostback(w http.ResponseWriter, req request.Request) error {
	return nil
}
