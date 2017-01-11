package flow

import (
	"errors"
	"fmt"
	"net/http"

	"AdClickTool/Service/request"
	"AdClickTool/Service/units/rule"
)

type FlowConfig struct {
	Id           int64
	UserId       int64
	RedirectMode int64
	Status       int64
}

func (c FlowConfig) String() string {
	return fmt.Sprintf("Flow %d:%d Status %d", c.Id, c.UserId, c.Status)
}

type Flow struct {
	FlowConfig
	defaultRule *rule.Rule
	rules       []*rule.Rule
}

func NewFlow(c FlowConfig) (f *Flow) {
	f = &Flow{
		FlowConfig: c,
		rules:      make([]*rule.Rule, 0),
	}
	d, r := rule.GetFlowRules(f.Id)
	f.defaultRule = rule.NewRule(d) // default始终有效
	f.rules = make([]*rule.Rule, 0, len(r))
	for _, rc := range r {
		nr := rule.NewRule(rc)
		if nr == nil {
			continue
		}
		if nr.Status == rule.StatusRunning {
			f.rules = append(f.rules, nr)
		}
	}
	return
}

func (f *Flow) OnLPOfferRequest(w http.ResponseWriter, req request.Request) error {
	if f == nil {
		return errors.New("[Flow][OnLPOfferRequest]Nil f")
	}

	for _, r := range f.rules {
		if r == nil {
			continue
		}
		if r.Status != rule.StatusRunning {
			continue
		}
		if r.Accept(req) {
			return r.OnLPOfferRequest(w, req)
		}
	}

	if f.defaultRule == nil {
		return fmt.Errorf("[Flow][OnLPOfferRequest]DefaultRule is nil for request(%s) in flow(%d)", req.Id(), f.Id)
	}
	return f.defaultRule.OnLPOfferRequest(w, req)
}
