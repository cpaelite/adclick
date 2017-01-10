package offer

import (
	"fmt"
	"net/http"
	"net/url"

	"AdClickTool/Service/log"
	"AdClickTool/Service/request"
)

type OfferConfig struct {
	Id                  int64
	UserId              int64
	Url                 string
	AffilicateNetworkId int64
	PostbackUrl         string
	PayoutMode          int64
	PayoutValue         float64
	Weight              uint64
}

func (c OfferConfig) String() string {
	return fmt.Sprintf("Offer %d:%d", c.Id, c.UserId)
}

type Offer struct {
	OfferConfig
}

func NewOffer(c OfferConfig) (o *Offer) {
	if c.Id <= 0 {
		return nil
	}
	_, err := url.ParseRequestURI(c.Url)
	if err != nil {
		log.Errorf("[NewOffer]Invalid url for offer(%+v), err(%s)\n", c, err.Error())
		return nil
	}
	o = &Offer{
		OfferConfig: c,
	}
	return
}

var gr = &http.Request{
	Method: "GET",
	URL: &url.URL{
		Path: "",
	},
}

func (o *Offer) OnLPOfferRequest(w http.ResponseWriter, req request.Request) error {
	if o == nil {
		return fmt.Errorf("[Offer][OnLPOfferRequest]Nil o for request(%s)", req.Id())
	}
	http.Redirect(w, gr, req.ParseUrlTokens(o.Url), http.StatusFound)
	return nil
}
