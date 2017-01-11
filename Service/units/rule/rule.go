package rule

import (
	"fmt"
	"math/rand"
	"net/http"

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
}

func (c RuleConfig) String() string {
	return fmt.Sprintf("Rule %d:%d Status %d", c.Id, c.UserId, c.Status)
}
func (c RuleConfig) Detail() string {
	return fmt.Sprintf("Rule %d:%d Status %d Json %s", c.Id, c.UserId, c.Status, c.Json)
}

type Rule struct {
	RuleConfig
	f     filter.Filter
	paths []*path.Path
	pwSum uint64
}

func NewRule(c RuleConfig) (r *Rule) {
	f, err := filter.NewFilter(c.Json)
	if err != nil || f == nil {
		log.Errorf("[NewRule]NewFilter failed for rule(%+v) with err(%v)\n", c, err)
		return nil
	}
	r = &Rule{
		RuleConfig: c,
		f:          f,
		paths:      make([]*path.Path, 0),
	}
	for _, pc := range path.GetRulePaths(r.Id) {
		np := path.NewPath(pc)
		if np == nil {
			log.Errorf("[NewRule]NewPath failed with %+v\n", c)
			continue
		}
		if np.Status == path.StatusRunning {
			r.paths = append(r.paths, np)
			r.pwSum += np.Weight
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
		if p == nil {
			continue
		}
		if p.Status != path.StatusRunning {
			continue
		}
		cx += int(p.Weight)
		if x < cx {
			return p.OnLPOfferRequest(w, req)
		}
	}
	return fmt.Errorf("[Rule][OnLPOfferRequest]Request(%s) does not match any path(%d:%d) in rule(%d)", req.Id(), cx, x, r.Id)
}
