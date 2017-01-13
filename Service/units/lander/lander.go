package lander

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"sync"

	"AdClickTool/Service/log"
	"AdClickTool/Service/request"
)

type LanderConfig struct {
	Id             int64
	UserId         int64
	Url            string
	NumberOfOffers int64
}

func (c LanderConfig) String() string {
	return fmt.Sprintf("Lander %d:%d", c.Id, c.UserId)
}

type Lander struct {
	LanderConfig
}

var cmu sync.RWMutex // protects the following
var landers = make(map[int64]*Lander)

func setLander(l *Lander) error {
	if l == nil {
		return errors.New("setPath error:l is nil")
	}
	if l.Id <= 0 {
		return fmt.Errorf("setPath error:l.Id(%d) is not positive", l.Id)
	}
	cmu.Lock()
	defer cmu.Unlock()
	landers[l.Id] = l
	return nil
}
func getLander(lId int64) *Lander {
	cmu.RLock()
	defer cmu.RUnlock()
	return landers[lId]
}
func delLander(lId int64) {
	cmu.Lock()
	defer cmu.Unlock()
	delete(landers, lId)
}

func InitLander(landerId int64) error {
	l := getLander(landerId)
	if l == nil {
		l = newLander(DBGetLander(landerId))
	}
	if l == nil {
		return fmt.Errorf("[InitLander]Failed because newLander failed with lander(%d)", landerId)
	}
	return setLander(l)
}

func GetLander(landerId int64) (l *Lander) {
	l = getLander(landerId)
	if l == nil {
		l = newLander(DBGetLander(landerId))
	}
	if l != nil {
		if err := setLander(l); err != nil {
			return nil
		}
	}
	return
}

func newLander(c LanderConfig) (l *Lander) {
	if c.Id <= 0 {
		return nil
	}
	_, err := url.ParseRequestURI(c.Url)
	if err != nil {
		log.Errorf("[NewLander]Invalid url for lander(%+v), err(%s)\n", c, err.Error())
		return nil
	}
	l = &Lander{
		LanderConfig: c,
	}
	return
}

var gr = &http.Request{
	Method: "GET",
	URL: &url.URL{
		Path: "",
	},
}

func (l *Lander) OnLPOfferRequest(w http.ResponseWriter, req request.Request) error {
	if l == nil {
		return fmt.Errorf("[Lander][OnLPOfferRequest]Nil l for request(%s)", req.Id())
	}
	http.Redirect(w, gr, req.ParseUrlTokens(l.Url), http.StatusFound)
	return nil
}
