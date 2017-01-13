package rule

import (
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"sync"

	"AdClickTool/Service/log"
	"AdClickTool/Service/request"
	"AdClickTool/Service/units/path"
	"AdClickTool/Service/units/rule/filter"
)

const (
	StatusPaused  = 0
	StatusRunning = 1
)

type RuleConfig struct {
	Id     int64
	UserId int64
	Json   string
	Status int64

	Type int
}

func (c RuleConfig) String() string {
	return fmt.Sprintf("Rule %d:%d Status %d", c.Id, c.UserId, c.Status)
}
func (c RuleConfig) Detail() string {
	return fmt.Sprintf("Rule %d:%d Status %d Json %s", c.Id, c.UserId, c.Status, c.Json)
}

const (
	RulePathStatusPaused  = 0
	RulePathStatusRunning = 1
)

type RulePath struct {
	PathId int64
	Weight uint64
	Status int64
}

type Rule struct {
	RuleConfig
	f     filter.Filter
	paths []RulePath
	pwSum uint64
}

var cmu sync.RWMutex // protects the following
var rules = make(map[int64]*Rule)

func setRule(r *Rule) error {
	if r == nil {
		return errors.New("setRule error:r is nil")
	}
	if r.Id <= 0 {
		return fmt.Errorf("setRule error:r.Id(%d) is not positive", r.Id)
	}
	cmu.Lock()
	defer cmu.Unlock()
	rules[r.Id] = r
	return nil
}
func getRule(rId int64) *Rule {
	cmu.RLock()
	defer cmu.RUnlock()
	return rules[rId]
}
func delRule(rId int64) {
	cmu.Lock()
	defer cmu.Unlock()
	delete(rules, rId)
}

func InitRule(ruleId int64) error {
	r := getRule(ruleId)
	if r == nil {
		r = newRule(DBGetRule(ruleId))
	}
	if r == nil {
		return fmt.Errorf("[InitRule]Failed because newRule failed with rule(%d)", ruleId)
	}
	return setRule(r)
}

func newRule(c RuleConfig) (r *Rule) {
	f, err := filter.NewFilter(c.Json)
	if err != nil || f == nil {
		log.Errorf("[newRule]NewFilter failed for rule(%+v) with err(%v)\n", c, err)
		return nil
	}
	var pwSum uint64
	paths := DBGetRulePaths(c.Id)
	for _, p := range paths {
		if p.Status != RulePathStatusRunning {
			continue
		}
		pwSum += p.Weight
		err := path.InitPath(p.PathId)
		if err != nil {
			log.Errorf("[newRule]InitPath failed for p%d:r%d with error(%s)\n", p.PathId, r.Id, err.Error())
			return nil
		}
	}
	r = &Rule{
		RuleConfig: c,
		f:          f,
		paths:      paths,
		pwSum:      pwSum,
	}
	return
}

func GetRule(ruleId int64) (r *Rule) {
	r = getRule(ruleId)
	if r == nil {
		r = newRule(DBGetRule(ruleId))
	}
	if r != nil {
		if err := setRule(r); err != nil {
			return nil
		}
	}
	return
}

func (r *Rule) Accept(req request.Request) bool {
	if r == nil {
		return false
	}
	if r.f == nil {
		return false
	}
	return r.f.Accept(req)
}

func (r *Rule) OnLPOfferRequest(w http.ResponseWriter, req request.Request) error {
	if r == nil {
		return fmt.Errorf("[Rule][OnLPOfferRequest]Nil r for request(%s)", req.Id())
	}
	if !r.Accept(req) {
		return fmt.Errorf("[Rule][OnLPOfferRequest]Request(%s) not accepted by rule(%d)", req.Id(), r.Id)
	}
	x := rand.Intn(int(r.pwSum))
	cx := 0
	for _, p := range r.paths {
		if p.PathId <= 0 {
			continue
		}
		if p.Status != path.StatusRunning {
			continue
		}
		cx += int(p.Weight)
		if x < cx {
			return path.GetPath(p.PathId).OnLPOfferRequest(w, req)
		}
	}
	return fmt.Errorf("[Rule][OnLPOfferRequest]Request(%s) does not match any path(%d:%d) in rule(%d)", req.Id(), cx, x, r.Id)
}
