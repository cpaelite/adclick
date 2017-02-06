package path

import (
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"sync"

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
	Status       int64
}

func (c PathConfig) String() string {
	return fmt.Sprintf("Path %d:%d Status %d", c.Id, c.UserId, c.Status)
}

type PathLander struct {
	LanderId int64
	Weight   uint64
}
type PathOffer struct {
	OfferId int64
	Weight  uint64
}

type Path struct {
	PathConfig
	landers []PathLander
	lwSum   uint64 // lander总权重
	offers  []PathOffer
	owSum   uint64 // offer总权重
}

func (p *Path) RandOwSum() int {
	if p.owSum == 0 {
		return 0
	}
	return rand.Intn(int(p.owSum))
}

func (p *Path) RandLwSum() int {
	if p.lwSum == 0 {
		return 0
	}
	return rand.Intn(int(p.lwSum))
}

var cmu sync.RWMutex // protects the following
var paths = make(map[int64]*Path)

func setPath(p *Path) error {
	if p == nil {
		return errors.New("setPath error:p is nil")
	}
	if p.Id <= 0 {
		return fmt.Errorf("setPath error:p.Id(%d) is not positive", p.Id)
	}
	cmu.Lock()
	defer cmu.Unlock()
	paths[p.Id] = p
	return nil
}
func getPath(pId int64) *Path {
	cmu.RLock()
	defer cmu.RUnlock()
	return paths[pId]
}
func delPath(pId int64) {
	cmu.Lock()
	defer cmu.Unlock()
	delete(paths, pId)
}

func InitPath(pathId int64) error {
	p := getPath(pathId)
	if p == nil {
		p = newPath(DBGetPath(pathId))
	}
	if p == nil {
		return fmt.Errorf("[InitPath]Failed because newPath failed with path(%d)", pathId)
	}
	return setPath(p)
}

func GetPath(pathId int64) (p *Path) {
	if pathId == 0 {
		return nil
	}

	p = getPath(pathId)
	if p == nil {
		p = newPath(DBGetPath(pathId))
		if p != nil {
			if err := setPath(p); err != nil {
				return nil
			}
		}
	}
	return
}

func newPath(c PathConfig) (p *Path) {
	var err error
	var lwSum, owSum uint64
	landers := DBGetPathLanders(c.Id)
	for _, c := range landers {
		err = lander.InitLander(c.LanderId)
		if err != nil {
			log.Errorf("[NewPath]NewLander failed with %+v\n", c)
			return nil
		}
		lwSum += c.Weight
	}
	offers := DBGetPathOffers(c.Id)
	for _, c := range offers {
		err = offer.InitOffer(c.OfferId)
		if err != nil {
			log.Errorf("[NewPath]NewOffer failed with %+v\n", c)
			return nil
		}
		owSum += c.Weight
	}

	if owSum == 0 {
		log.Errorf("path:%v have %v offers and owSum=%v", c.Id, len(offers), owSum)
	}

	p = &Path{
		PathConfig: c,
		landers:    landers,
		offers:     offers,
		lwSum:      lwSum,
		owSum:      owSum,
	}

	return
}

func (p *Path) OnLPOfferRequest(w http.ResponseWriter, req request.Request) error {
	if p == nil {
		return fmt.Errorf("[Path][OnLPOfferRequest]Nil p for request(%s)", req.Id())
	}

	req.SetRedirectMode(p.RedirectMode)

	x := p.RandLwSum() // rand.Intn(int(p.lwSum))
	lx := 0
	if p.DirectLink == 0 {
		for _, l := range p.landers {
			if l.LanderId <= 0 {
				continue
			}
			lx += int(l.Weight)
			if x < lx {
				req.SetLanderId(l.LanderId)
				return lander.GetLander(l.LanderId).OnLPOfferRequest(w, req)
			}
		}
	}

	y := p.RandOwSum() // rand.Intn(int(p.owSum))
	oy := 0
	for _, o := range p.offers {
		if o.OfferId <= 0 {
			continue
		}
		oy += int(o.Weight)
		if y < oy {
			req.SetOfferId(o.OfferId)
			return offer.GetOffer(o.OfferId).OnLPOfferRequest(w, req)
		}
	}

	return fmt.Errorf(
		"[Path][OnLPOfferRequest]Request(%s) does not match any lander(%d:%d) or offer(%d:%d) in path(%d)",
		req.Id(), lx, x, oy, y, p.Id)
}

func (p *Path) OnLandingPageClick(w http.ResponseWriter, req request.Request) error {
	if p == nil {
		return fmt.Errorf("[Path][OnLPOfferRequest]Nil p for request(%s)", req.Id())
	}

	req.SetRedirectMode(p.RedirectMode)

	// 不需要find，因为可能中途已被移除
	/*
		found := false
		for _, l := range p.landers {
			if l.LanderId == req.LanderId() {
				found = true
				break
			}
		}

		if !found {
			return fmt.Errorf("[Path][OnLandingPageClick]Target Lander(%d) not found for request(%s) in path(%d)",
				req.LanderId(), req.Id(), p.Id)
		}
	*/

	pp := strings.Split(req.TrackingPath(), "/")
	switch len(pp) {
	case 2: // path为/click，按照权重选择一个Offer
		y := rand.Intn(int(p.owSum))
		oy := 0
		for _, o := range p.offers {
			if o.OfferId <= 0 {
				continue
			}
			oy += int(o.Weight)
			if y < oy {
				req.SetOfferId(o.OfferId)
				return offer.GetOffer(o.OfferId).OnLandingPageClick(w, req)
			}
		}
	case 3: // path为/click/N，按照指定顺序(1~)选择一个Offer
		i, err := strconv.ParseInt(pp[2], 10, 64)
		if err != nil || i == 0 || i > int64(len(p.offers)) {
			return fmt.Errorf("[Path][OnLandingPageClick]Target offer path(%s)(i:%d) parse failed err(%v) for request(%s) in path(%d)(offers:%d)",
				req.TrackingPath(), i, req.Id(), p.Id, len(p.offers))
		}
		//TODO 是否需要加上lander的NumberOfOffers的检查？
		req.SetOfferId(p.offers[i-1].OfferId)
		return offer.GetOffer(p.offers[i-1].OfferId).OnLandingPageClick(w, req)
	}

	return fmt.Errorf("[Path][OnLandingPageClick]Target offer path(%s) not found for request(%s) in path(%d)",
		req.TrackingPath(), req.Id(), p.Id)
}

func (p *Path) OnImpression(w http.ResponseWriter, req request.Request) error {
	return nil
}

func (p *Path) OnS2SPostback(w http.ResponseWriter, req request.Request) error {
	if p == nil {
		return fmt.Errorf("[Path][OnLPOfferRequest]Nil p for request(%s)", req.Id())
	}

	// 不需要find，因为可能中途已被移除
	if req.LanderId() != 0 {
		l := lander.GetLander(req.LanderId())
		if l != nil {
			// 不一定肯定存在Lander
			l.OnS2SPostback(w, req)
		}
	}

	o := offer.GetOffer(req.OfferId())
	if o != nil {
		// 但是Offer是一定存在的
		return o.OnS2SPostback(w, req)
	}

	return fmt.Errorf("[Path][OnS2SPostback]Target offer id(%d) not found for request(%s) in path(%d)",
		req.OfferId(), req.Id(), p.Id)
}

func (p *Path) OnConversionPixel(w http.ResponseWriter, req request.Request) error {
	return nil
}

func (p *Path) OnConversionScript(w http.ResponseWriter, req request.Request) error {
	return nil
}
