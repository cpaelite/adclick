package user

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"sync"

	"AdClickTool/Service/log"
	"AdClickTool/Service/request"
	"AdClickTool/Service/units/campaign"
	"AdClickTool/Service/units/flow"
	"AdClickTool/Service/units/lander"
	"AdClickTool/Service/units/offer"
	"AdClickTool/Service/units/path"
	"AdClickTool/Service/units/rule"
)

type UserConfig struct {
	Id                 int64
	IdText             string
	Status             int64
	RootDomainRedirect string
}

func (c UserConfig) String() string {
	return fmt.Sprintf("User %d:%s Status %d", c.Id, c.IdText, c.Status)
}

type User struct {
	UserConfig

	cmu             sync.RWMutex                 // protects the following
	campaigns       map[int64]*campaign.Campaign // campaignId:instance
	campaignHash2Id map[string]int64             // campaignHash:campaignId
}

func NewUser(c UserConfig) (u *User) {
	_, err := url.ParseRequestURI(c.RootDomainRedirect)
	if err != nil {
		log.Errorf("[NewUser]Invalid url for user(%+v), err(%s)\n", c, err.Error())
		return nil
	}
	u = &User{
		UserConfig:      c,
		campaigns:       make(map[int64]*campaign.Campaign),
		campaignHash2Id: make(map[string]int64),
	}
	return
}

func (u User) String() string {
	return ""
}

func (u *User) Create() error {
	return nil
}

func (u *User) Destroy() error {
	return nil
}

func (u *User) Update(c UserConfig) error {
	return nil
}

func (u *User) OnLPOfferRequest(w http.ResponseWriter, req request.Request) error {
	campaignHash := req.CampaignHash()
	ca := u.getCampaignByHash(campaignHash)
	if ca == nil {
		return fmt.Errorf("[Units][OnLPOfferRequest]Invalid campaign hash(%s) for %d\n", campaignHash, req.Id())
	}
	return ca.OnLPOfferRequest(w, req)
}

func (u *User) OnLandingPageClick(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func (u *User) OnOfferPostback(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func (u *User) setCampaign(ca *campaign.Campaign) error {
	if ca == nil {
		return errors.New("setCampaign error:ca is nil")
	}
	if ca.Id <= 0 {
		return fmt.Errorf("setCampaign error:ca.Id(%d) is not positive", ca.Id)
	}
	u.cmu.Lock()
	defer u.cmu.Unlock()
	u.campaigns[ca.Id] = ca
	u.campaignHash2Id[ca.Hash] = ca.Id
	return nil
}
func (u *User) getCampaign(campaignId int64) *campaign.Campaign {
	u.cmu.RLock()
	defer u.cmu.RUnlock()
	return u.campaigns[campaignId]
}
func (u *User) getCampaignByHash(campaignHash string) *campaign.Campaign {
	u.cmu.RLock()
	defer u.cmu.RUnlock()
	if campaignId, ok := u.campaignHash2Id[campaignHash]; ok {
		return u.campaigns[campaignId]
	}
	return nil
}
func (u *User) delCampaign(campaignId int64) {
	u.cmu.Lock()
	defer u.cmu.Unlock()
	if c, ok := u.campaigns[campaignId]; ok && c != nil {
		delete(u.campaigns, campaignId)
		delete(u.campaignHash2Id, c.Hash)
	}
}

func (u *User) AddCampaign(c campaign.CampaignConfig) error {
	if c.Id <= 0 {
		return errors.New("AddCampaign error:campaign.Id is not postive")
	}
	if c.UserId != u.Id {
		return fmt.Errorf("AddCampaign error:campaign.Id(%d) not equal to User.Id(%d)", c.UserId, u.Id)
	}
	ca := campaign.NewCampaign(c)
	if ca == nil {
		return fmt.Errorf("AddCampaign error:NewCampaign failed for %+v", c)
	}

	return u.setCampaign(ca)
}
func (u *User) UpdateCampaign(c campaign.CampaignConfig) error {
	//TODO 做更细致的更新动作
	if c.Id <= 0 {
		return errors.New("UpdateCampaign error:campaign.Id is not postive")
	}
	if c.UserId != u.Id {
		return fmt.Errorf("UpdateCampaign error:campaign.Id(%d) not equal to User.Id(%d)", c.UserId, u.Id)
	}
	ca := campaign.NewCampaign(c)
	if ca == nil {
		return fmt.Errorf("UpdateCampaign error:NewCampaign failed for %+v", c)
	}

	return u.setCampaign(ca)
}
func (u *User) DelCampaign(campaignId int64) error {
	u.delCampaign(campaignId)
	return nil
}

func (u *User) AddFlow(c flow.FlowConfig) error {
	return nil
}
func (u *User) UpdateFlow(c flow.FlowConfig) error {
	return nil
}
func (u *User) DelFlow(flowId int64) error {
	return nil
}

func (u *User) AddRule(c rule.RuleConfig) error {
	return nil
}
func (u *User) UpdateRule(c rule.RuleConfig) error {
	return nil
}
func (u *User) DelRule(ruleId int64) error {
	return nil
}

func (u *User) AddPath(c path.PathConfig) error {
	return nil
}
func (u *User) UpdatePath(c path.PathConfig) error {
	return nil
}
func (u *User) DelPath(pathId int64) error {
	return nil
}

func (u *User) AddLander(c lander.LanderConfig) error {
	return nil
}
func (u *User) UpdateLander(c lander.LanderConfig) error {
	return nil
}
func (u *User) DelLander(landerId int64) error {
	return nil
}

func (u *User) AddOffer(c offer.OfferConfig) error {
	return nil
}
func (u *User) UpdateOffer(c offer.OfferConfig) error {
	return nil
}
func (u *User) DelOffer(offerId int64) error {
	return nil
}
