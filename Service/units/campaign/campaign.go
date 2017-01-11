package campaign

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"sync"

	"AdClickTool/Service/request"
	"AdClickTool/Service/units/flow"
)

const (
	//0:URL;1:Flow;2:Rule;3:Path;4:Lander;5:Offer
	DstTypeUrl    = 0
	DstTypeFlow   = 1
	DstTypeRule   = 2
	DstTypePath   = 3
	DstTypeLander = 4
	DstTypeOffer  = 5
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
	CostValue         float64
	DstType           int64
	DstFlowId         int64
	DstUrl            string
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
	if c.DstFlowId > 0 {
		if err := flow.InitFlow(c.DstFlowId); err != nil {
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
		ca = getCampaign(c.Id)
		if ca == nil {
			ca = newCampaign(c)
		}
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

func (ca *Campaign) OnLPOfferRequest(w http.ResponseWriter, req request.Request) error {
	if ca == nil {
		return errors.New("[Campaign][OnLPOfferRequest]Nil ca")
	}

	if ca.DstType == DstTypeUrl {
		if ca.DstUrl != "" {
			http.Redirect(w, gr, req.ParseUrlTokens(ca.DstUrl), http.StatusFound)
			return nil
		}
	} else {
		f := flow.GetFlow(ca.DstFlowId)
		if f != nil {
			req.SetFlowId(ca.DstFlowId)
			return f.OnLPOfferRequest(w, req)
		}
	}

	return fmt.Errorf("[Campaign][OnLPOfferRequest]Invalid dstination for request(%s) in campaign(%d)", req.Id(), ca.Id)
}
