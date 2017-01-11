package user

import (
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
}

func InitAllUsers() error {
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
		return fmt.Errorf("[Units][OnLPOfferRequest]Invalid campaign hash(%s) for %d\n", campaignHash, req.Id())
	}
	if ca.UserId != u.Id {
		return fmt.Errorf("[Units][OnLPOfferRequest]Campaign with hash(%s) does not belong to user %d for %d\n", campaignHash, u.Id, req.Id())
	}
	return ca.OnLPOfferRequest(w, req)
}

func (u *User) OnLandingPageClick(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func (u *User) OnOfferPostback(w http.ResponseWriter, r *http.Request) error {
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
	_, err := url.ParseRequestURI(c.RootDomainRedirect)
	if err != nil {
		log.Errorf("[NewUser]Invalid url for user(%+v), err(%s)\n", c, err.Error())
		return nil
	}
	err = campaign.InitUserCampaigns(c.Id)
	if err != nil {
		log.Errorf("[NewUser]InitUserCampaigns failed for user(%+v), err(%s)\n", c, err.Error())
		return nil
	}
	u = &User{
		UserConfig: c,
	}
	return
}
