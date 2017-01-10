package lander

import (
	"fmt"
	"net/http"
	"net/url"

	"AdClickTool/Service/log"
	"AdClickTool/Service/request"
)

type LanderConfig struct {
	Id             int64
	UserId         int64
	Url            string
	NumberOfOffers int64
	Weight         uint64
}

func (c LanderConfig) String() string {
	return fmt.Sprintf("Lander %d:%d", c.Id, c.UserId)
}

type Lander struct {
	LanderConfig
}

func NewLander(c LanderConfig) (l *Lander) {
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
