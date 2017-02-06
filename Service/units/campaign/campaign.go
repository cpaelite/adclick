package campaign

import (
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"sync"

	"AdClickTool/Service/common"
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

// TrafficSourceConfig 对应数据库里面的TrafficSource
type TrafficSourceConfig struct {
	Id               int64
	UserId           int64
	Name             string
	PostbackURL      string
	PixelRedirectURL string
	ImpTracking      int64

	ExternalId common.TrafficSourceParams
	Cost       common.TrafficSourceParams
	Vars       []common.TrafficSourceParams
}

type CampaignConfig struct {
	Id                int64
	Name              string
	UserId            int64
	Hash              string
	Url               string
	ImpPixelUrl       string
	TrafficSourceId   int64
	TrafficSourceName string
	CostModel         int
	CPCValue          float64
	CPAValue          float64
	CPMValue          float64
	PostbackUrl       string
	PixelRedirectUrl  string
	RedirectMode      int64
	TargetType        int64
	TargetFlowId      int64
	TargetUrl         string
	Status            int64

	// 每个campaign的link中包含的参数(traffic source会进行替换，但是由用户自己指定)
	// 例如：[["bannerid","{bannerid}"],["campaignid","{campaignid}"],["zoneid","{zoneid}"]]
	TrafficSource TrafficSourceConfig
}

// ParseVars 根据Vars解析出10个参数，分别是，v1-v10
func (c *CampaignConfig) ParseVars(getter func(k string) string) []string {
	vars := []string{}
	for _, param := range c.TrafficSource.Vars {
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
	log.Debugf("[setCampaign]ca.Id(%d),ca.Hash(%s)\n", ca.Id, ca.Hash)
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
			log.Errorf("[newCampaign]InitFlow failed with flow(%d) for campaign(%d), err(%s)\n", c.TargetFlowId, c.Id, err.Error())
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
	if cId == 0 {
		return nil
	}

	ca = getCampaign(cId)
	if ca == nil {
		ca = newCampaign(DBGetCampaign(cId))
		if ca != nil {
			if err := setCampaign(ca); err != nil {
				return nil
			}
		}
	}

	return
}
func GetCampaignByHash(cHash string) (ca *Campaign) {
	if len(cHash) == 0 {
		return nil
	}

	defer func() {
		log.Infof("[GetCampaignByHash]cHash(%s), ca(%+v)\n", cHash, ca)
	}()
	ca = getCampaignByHash(cHash)
	if ca == nil {
		log.Warnf("GetCampaignByHash(%v) failed: not cached, reloading from db...", cHash)
		ca = newCampaign(DBGetCampaignByHash(cHash))
		if ca != nil {
			if err := setCampaign(ca); err != nil {
				return nil
			}
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

	req.SetTSExternalID(&ca.TrafficSource.ExternalId)
	req.SetTSCost(&ca.TrafficSource.Cost)
	req.SetTSVars(ca.TrafficSource.Vars)
	req.SetCPAValue(ca.CPAValue)
	req.SetRedirectMode(ca.RedirectMode)

	if ca.TargetType == TargetTypeUrl {
		if ca.TargetUrl != "" {
			req.Redirect(w, gr, req.ParseUrlTokens(ca.TargetUrl))
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

	// 不要用Campaign现在的设置，因为有可能中途被改变
	f := flow.GetFlow(req.FlowId())
	if f == nil {
		return fmt.Errorf("[Campaign][OnLandingPageClick]Nil f(%d) for request(%s) in campaign(%d)", req.FlowId(), req.Id(), ca.Id)
	}
	return f.OnLandingPageClick(w, req)
}

func (ca *Campaign) OnImpression(w http.ResponseWriter, req request.Request) error {
	return nil
}

func (ca *Campaign) OnS2SPostback(w http.ResponseWriter, req request.Request) error {
	if ca == nil {
		return errors.New("[Campaign][OnS2SPostback]Nil ca")
	}

	f := flow.GetFlow(req.FlowId())
	if f == nil {
		return fmt.Errorf("[Campaign][OnS2SPostback]Nil f(%d) for request(%s) in campaign(%d)", ca.TargetFlowId, req.Id(), ca.Id)
	}
	err := f.OnS2SPostback(w, req)
	if err != nil {
		return err
	}

	return ca.PostbackToTrafficSource(req)
}

func (ca *Campaign) OnConversionPixel(w http.ResponseWriter, req request.Request) error {
	return nil
}

func (ca *Campaign) OnConversionScript(w http.ResponseWriter, req request.Request) error {
	return nil
}

func (ca *Campaign) getPostbackUrl() string {
	if len(ca.PostbackUrl) > 0 {
		return ca.PostbackUrl
	}
	return ca.TrafficSource.PostbackURL
}

func (ca *Campaign) PostbackToTrafficSource(req request.Request) error {
	//TODO 需要检查用户是否已经针对该campaign单独设置了PostbackUrl
	url := req.ParseUrlTokens(ca.getPostbackUrl())
	if len(url) == 0 {
		// 有可能不需要postback
		return nil
	}

	err := func() error {
		resp, err := http.Get(url)
		if err != nil {
			return err
		}

		body, err := ioutil.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			return err
		}
		log.Debugf("[campaign][PostbackToTrafficSource] req:%v success:[%s]",
			req.Id(), body)
		return nil
	}()

	if err != nil {
		log.Debugf("[campaign][PostbackToTrafficSource] postback failed:[%v]", err)
	}

	return nil
}
