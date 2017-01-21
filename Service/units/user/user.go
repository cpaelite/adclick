package user

import (
	"fmt"
	"net/http"
	"net/url"
	"sync"

	"AdClickTool/Service/log"
	"AdClickTool/Service/request"
	"AdClickTool/Service/tracking"
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
}

func InitAllUsers() error {
	//TODO 所有Units，无效的和deleted的都需要load到内存中来，以免丢数据；
	//TODO 然后该判断Status和deleted的地方都需要加上判断
	initUser()

	for _, u := range DBGetAvailableUsers() {
		nu := newUser(u)
		if nu == nil {
			return fmt.Errorf("[InitAllUsers]newUser failed for user%d", u.Id)
		}
		setUser(u.Id, nu)
	}

	return nil
}

func GetUser(uId int64) (u *User) {
	return getUser(uId)
}
func GetUserByIdText(uIdText string) (u *User) {
	return getUserByIdText(uIdText)
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
	ca := campaign.GetCampaignByHash(campaignHash)
	if ca == nil {
		return fmt.Errorf("[Units][OnLPOfferRequest]Invalid campaign hash(%s) for %s\n", campaignHash, req.Id())
	}
	if ca.UserId != u.Id {
		return fmt.Errorf("[Units][OnLPOfferRequest]Campaign with hash(%s) does not belong to user %d for %s\n", campaignHash, u.Id, req.Id())
	}
	req.SetCampaignId(ca.Id)
	req.SetCampaignName(ca.Name)
	err := ca.OnLPOfferRequest(w, req)
	if err != nil {
		return err
	}

	// 统计Cost信息
	// CPC: Campaign的次数*每次的成本
	// CPA: postback的次数*每次的成本
	// CPM: Impression的次数*每次
	// Auto: Campaign里面的Cost参数
	// '0:Do-not-track-costs;1:cpc;2:cpa;3:cpm;4:auto?'
	switch ca.CostModel {
	case 0:
		// Do nothing
	case 1:
		cost := ca.CPCValue
		TrackingCost(req, cost)
	case 2:
		// 在PostBack里面处理
	case 3:
		// 在Impression里面已经处理
	case 4:
		cost := req.Cost()
		TrackingCost(req, cost)
	}

	return nil
}

// TrackingCost 添加Cost统计信息
func TrackingCost(req request.Request, cost float64) {
	timestamp := tracking.Timestamp()
	tracking.AddCost(req.AdStatisKey(timestamp), cost)
	tracking.IP.AddCost(req.IPKey(timestamp), cost)
	tracking.Domain.AddCost(req.DomainKey(timestamp), cost)
	tracking.Ref.AddCost(req.ReferrerKey(timestamp), cost)
}

// TrackingRevenue 添加Revenue统计信息
func TrackingRevenue(req request.Request, Revenue float64) {
	timestamp := tracking.Timestamp()
	tracking.AddPayout(req.AdStatisKey(timestamp), Revenue)
	tracking.IP.AddRevenue(req.IPKey(timestamp), Revenue)
	tracking.Domain.AddRevenue(req.DomainKey(timestamp), Revenue)
	tracking.Ref.AddRevenue(req.ReferrerKey(timestamp), Revenue)
}

// TrackingConversion 添加Revenue统计信息
func TrackingConversion(req request.Request, count int) {
	timestamp := tracking.Timestamp()
	tracking.AddConversion(req.AdStatisKey(timestamp), count)
	tracking.IP.AddConversion(req.IPKey(timestamp), count)
	tracking.Domain.AddConversion(req.DomainKey(timestamp), count)
	tracking.Ref.AddConversion(req.ReferrerKey(timestamp), count)
}

func (u *User) OnLandingPageClick(w http.ResponseWriter, req request.Request) error {
	campaignId := req.CampaignId()
	ca := campaign.GetCampaign(campaignId)
	if ca == nil {
		return fmt.Errorf("[Units][OnLandingPageClick]Invalid campaign id(%d) for %s\n", campaignId, req.Id())
	}
	if ca.UserId != u.Id {
		return fmt.Errorf("[Units][OnLandingPageClick]Campaign with id(%d) does not belong to user %d for %s\n", campaignId, u.Id, req.Id())
	}
	return ca.OnLandingPageClick(w, req)
}

func (u *User) OnImpression(w http.ResponseWriter, req request.Request) error {
	return nil
}

func (u *User) OnS2SPostback(w http.ResponseWriter, req request.Request) error {
	campaignId := req.CampaignId()
	ca := campaign.GetCampaign(campaignId)
	if ca == nil {
		return fmt.Errorf("[Units][OnS2SPostback]Invalid campaign id(%d) for %s\n", campaignId, req.Id())
	}
	if ca.UserId != u.Id {
		return fmt.Errorf("[Units][OnS2SPostback]Campaign with id(%d) does not belong to user %d for %s\n", campaignId, u.Id, req.Id())
	}
	var err = ca.OnS2SPostback(w, req)
	if err != nil {
		return err
	}

	if ca.CostModel == 2 {
		cost := ca.CPAValue
		TrackingCost(req, cost)
	}

	return nil
}

func (u *User) OnConversionPixel(w http.ResponseWriter, req request.Request) error {
	return nil
}

func (u *User) OnConversionScript(w http.ResponseWriter, req request.Request) error {
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

/**
 * User管理
**/
var mu sync.RWMutex                // protects the following
var users map[int64]*User          // userId:User
var userIdText2Id map[string]int64 // userIdText:userId

func getUser(userId int64) *User {
	if userId == 0 {
		return nil
	}
	mu.RLock()
	defer mu.RUnlock()
	if u, ok := users[userId]; ok {
		return u
	}
	return nil
}
func getUserByIdText(idText string) *User {
	if idText == "" {
		return nil
	}
	mu.RLock()
	defer mu.RUnlock()
	if id, ok := userIdText2Id[idText]; ok {
		if u, ok := users[id]; ok {
			return u
		}
	}
	return nil
}
func setUser(userId int64, u *User) {
	if u == nil {
		log.Error("SetUser u is nil for", userId)
		return
	}
	if userId == 0 {
		log.Error("SetUser userId is 0 for", u.String())
		return
	}

	mu.Lock()
	defer mu.Unlock()
	users[userId] = u
	userIdText2Id[u.IdText] = userId
}
func delUser(userId int64) {
	if userId == 0 {
		return
	}

	mu.Lock()
	defer mu.Unlock()
	if u := users[userId]; u != nil {
		delete(users, userId)
		delete(userIdText2Id, u.IdText)
	}
}
func initUser() {
	mu.Lock()
	defer mu.Unlock()
	users = make(map[int64]*User)
	userIdText2Id = make(map[string]int64)
}
func newUser(c UserConfig) (u *User) {
	if c.RootDomainRedirect != "" {
		_, err := url.ParseRequestURI(c.RootDomainRedirect)
		if err != nil {
			log.Errorf("[NewUser]Invalid url for user(%+v), err(%s)\n", c, err.Error())
			return nil
		}
	}

	if err := campaign.InitUserCampaigns(c.Id); err != nil {
		log.Errorf("[NewUser]InitUserCampaigns failed for user(%+v), err(%s)\n", c, err.Error())
		return nil
	}
	u = &User{
		UserConfig: c,
	}
	return
}
