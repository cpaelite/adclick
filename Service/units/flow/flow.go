package flow

import (
	"errors"
	"fmt"
	"net/http"
	"sync"

	"AdClickTool/Service/request"
	"AdClickTool/Service/units/rule"
)

type FlowConfig struct {
	Id           int64
	UserId       int64
	RedirectMode int64
}

func (c FlowConfig) String() string {
	return fmt.Sprintf("Flow %d:%d", c.Id, c.UserId)
}

const (
	FlowRuleStatusPaused  = 0
	FlowRuleStatusRunning = 1
)

type FlowRule struct {
	RuleId int64
	Status int64
}

type Flow struct {
	FlowConfig
	defaultRule FlowRule
	rules       []FlowRule
}

var cmu sync.RWMutex // protects the following
var flows = make(map[int64]*Flow)

func setFlow(f *Flow) error {
	if f == nil {
		return errors.New("setFlow error:f is nil")
	}
	if f.Id <= 0 {
		return fmt.Errorf("setFlow error:f.Id(%d) is not positive", f.Id)
	}
	cmu.Lock()
	defer cmu.Unlock()
	flows[f.Id] = f
	return nil
}
func getFlow(fId int64) *Flow {
	cmu.RLock()
	defer cmu.RUnlock()
	return flows[fId]
}
func delFlow(fId int64) {
	cmu.Lock()
	defer cmu.Unlock()
	delete(flows, fId)
}

func InitFlow(fId int64) error {
	f := getFlow(fId)
	if f == nil {
		f = newFlow(DBGetFlow(fId))
	}
	if f == nil {
		return fmt.Errorf("[InitFlow]Failed because newFlow failed with flow(%d)", fId)
	}
	return setFlow(f)
}

func newFlow(c FlowConfig) (f *Flow) {
	d, r := DBGetFlowRuleIds(c.Id)
	if d.RuleId <= 0 {
		return nil
	}
	err := rule.InitRule(d.RuleId) // default始终有效
	if err != nil {
		return nil
	}
	for _, rc := range r {
		if rc.Status != FlowRuleStatusRunning {
			continue
		}
		err = rule.InitRule(rc.RuleId)
		if err != nil {
			return nil
		}
	}
	f = &Flow{
		FlowConfig:  c,
		defaultRule: d,
		rules:       r,
	}
	return
}

func GetFlow(flowId int64) (f *Flow) {
	f = getFlow(flowId)
	if f == nil {
		f = newFlow(DBGetFlow(flowId))
	}
	if f != nil {
		if err := setFlow(f); err != nil {
			return nil
		}
	}
	return
}

func (f *Flow) OnLPOfferRequest(w http.ResponseWriter, req request.Request) error {
	if f == nil {
		return errors.New("[Flow][OnLPOfferRequest]Nil f")
	}

	var r *rule.Rule
	for _, fr := range f.rules {
		if fr.Status != FlowRuleStatusRunning {
			continue
		}
		r = rule.GetRule(fr.RuleId)
		if r == nil {
			panic(fmt.Sprintf("[Flow][OnLPOfferRequest]Nil r for rule(%d)", fr.RuleId))
		}
		if r.Accept(req) {
			req.SetRuleId(r.Id)
			return r.OnLPOfferRequest(w, req)
		}
	}

	if f.defaultRule.RuleId <= 0 {
		return fmt.Errorf("[Flow][OnLPOfferRequest]DefaultRule.ID is 0 for request(%s) in flow(%d)", req.Id(), f.Id)
	}
	req.SetRuleId(f.defaultRule.RuleId)
	return rule.GetRule(f.defaultRule.RuleId).OnLPOfferRequest(w, req)
}

func (f *Flow) OnLandingPageClick(w http.ResponseWriter, req request.Request) error {
	if f == nil {
		return errors.New("[Flow][OnLPOfferRequest]Nil f")
	}

	found := false
	for _, fr := range f.rules {
		if fr.RuleId == req.RuleId() {
			found = true
			break
		}
	}

	if !found && f.defaultRule.RuleId == req.RuleId() {
		found = true
	}

	if !found {
		return fmt.Errorf("[Flow][OnLandingPageClick]Target Rule(%d) not found for request(%s) in flow(%d)", req.RuleId(), req.Id(), f.Id)
	}

	return rule.GetRule(req.RuleId()).OnLandingPageClick(w, req)
}

func (f *Flow) OnImpression(w http.ResponseWriter, req request.Request) error {
	return nil
}

func (f *Flow) OnOfferPostback(w http.ResponseWriter, req request.Request) error {
	return nil
}
