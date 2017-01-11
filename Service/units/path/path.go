package path

import (
	"fmt"
	"math/rand"
	"net/http"

	"AdClickTool/Service/log"
	"AdClickTool/Service/request"
	"AdClickTool/Service/units/lander"
	"AdClickTool/Service/units/offer"
)

const (
	StatusPaused  = 0
	StatusRunning = 1
)

type PathConfig struct {
	Id           int64
	UserId       int64
	RedirectMode int64
	DirectLink   int64
	Weight       uint64
	Status       int64
}

func (c PathConfig) String() string {
	return fmt.Sprintf("Path %d:%d Status %d", c.Id, c.UserId, c.Status)
}

type Path struct {
	PathConfig
	landers []*lander.Lander
	lwSum   uint64 // lander总权重
	offers  []*offer.Offer
	owSum   uint64 // offer总权重
}

func NewPath(c PathConfig) (p *Path) {
	p = &Path{
		PathConfig: c,
		landers:    make([]*lander.Lander, 0),
		offers:     make([]*offer.Offer, 0),
	}
	for _, c := range lander.GetPathLanders(p.Id) {
		nl := lander.NewLander(c)
		if nl == nil {
			log.Errorf("[NewPath]NewLander failed with %+v\n", c)
			continue
		}
		p.landers = append(p.landers, nl)
		p.lwSum += nl.Weight
	}
	for _, c := range offer.GetPathOffers(p.Id) {
		ol := offer.NewOffer(c)
		if ol == nil {
			log.Errorf("[NewPath]NewOffer failed with %+v\n", c)
			continue
		}
		p.offers = append(p.offers, ol)
		p.owSum += ol.Weight
	}

	return
}

func (p *Path) OnLPOfferRequest(w http.ResponseWriter, req request.Request) error {
	if p == nil {
		return fmt.Errorf("[Path][OnLPOfferRequest]Nil p for request(%s)", req.Id())
	}

	x := rand.Intn(int(p.lwSum))
	lx := 0
	for _, l := range p.landers {
		if l == nil {
			continue
		}
		lx += int(l.Weight)
		if x < lx {
			return l.OnLPOfferRequest(w, req)
		}
	}

	y := rand.Intn(int(p.owSum))
	oy := 0
	for _, o := range p.offers {
		if o == nil {
			continue
		}
		oy += int(o.Weight)
		if y < oy {
			return o.OnLPOfferRequest(w, req)
		}
	}

	return fmt.Errorf(
		"[Path][OnLPOfferRequest]Request(%s) does not match any lander(%d:%d) or offer(%d:%d) in path(%d)",
		req.Id(), lx, x, oy, y, p.Id)
}
