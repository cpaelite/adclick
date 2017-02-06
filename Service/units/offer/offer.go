package offer

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"sync"

	"AdClickTool/Service/log"
	"AdClickTool/Service/request"
	"AdClickTool/Service/units/affiliate"
)

type OfferConfig struct {
	Id                   int64
	Name                 string
	UserId               int64
	Url                  string
	AffiliateNetworkId   int64
	AffiliateNetworkName string
	PostbackUrl          string
	PayoutMode           int64
	PayoutValue          float64
}

func (c OfferConfig) String() string {
	return fmt.Sprintf("Offer %d:%d", c.Id, c.UserId)
}

type Offer struct {
	OfferConfig
}

var cmu sync.RWMutex // protects the following
var offers = make(map[int64]*Offer)

func setOffer(o *Offer) error {
	if o == nil {
		return errors.New("setOffer error:o is nil")
	}
	if o.Id <= 0 {
		return fmt.Errorf("setOffer error:o.Id(%d) is not positive", o.Id)
	}
	cmu.Lock()
	defer cmu.Unlock()
	offers[o.Id] = o
	return nil
}
func getOffer(oId int64) *Offer {
	cmu.RLock()
	defer cmu.RUnlock()
	return offers[oId]
}
func delOffer(oId int64) {
	cmu.Lock()
	defer cmu.Unlock()
	delete(offers, oId)
}

func InitOffer(offerId int64) error {
	o := getOffer(offerId)
	if o == nil {
		o = newOffer(DBGetOffer(offerId))
	}
	if o == nil {
		return fmt.Errorf("[InitOffer]Failed because newOffer failed with offer(%d)", offerId)
	}
	return setOffer(o)
}

func GetOffer(offerId int64) (o *Offer) {
	if offerId == 0 {
		return nil
	}

	o = getOffer(offerId)
	if o == nil {
		o = newOffer(DBGetOffer(offerId))
		if o != nil {
			if err := setOffer(o); err != nil {
				return nil
			}
		}
	}
	return
}

func newOffer(c OfferConfig) (o *Offer) {
	if c.Id <= 0 {
		return nil
	}
	_, err := url.ParseRequestURI(c.Url)
	if err != nil {
		log.Errorf("[newOffer]Invalid url for offer(%+v), err(%s)\n", c, err.Error())
		return nil
	}
	err = affiliate.InitAffiliateNetwork(c.AffiliateNetworkId)
	if err != nil {
		log.Errorf("[newOffer]InitAffiliateNetwork failed with %+v, err(%s)\n", c, err.Error())
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
	req.SetOfferId(o.Id)
	req.SetOfferName(o.Name)
	req.SetAffiliateId(o.AffiliateNetworkId)
	req.SetAffiliateName(o.AffiliateNetworkName)
	req.Redirect(w, gr, req.ParseUrlTokens(o.Url))
	return nil
}

func (o *Offer) OnLandingPageClick(w http.ResponseWriter, req request.Request) error {
	if o == nil {
		return fmt.Errorf("[Offer][OnLandingPageClick]Nil o for request(%s)", req.Id())
	}
	req.SetOfferId(o.Id)
	req.SetOfferName(o.Name)
	req.SetAffiliateId(o.AffiliateNetworkId)
	req.SetAffiliateName(o.AffiliateNetworkName)
	// 加载AffiliateNetwork配置，如果Append click ID to offer URLs勾选，添加click ID(requestid)
	appended := ""
	if aff := affiliate.GetAffiliateNetwork(o.AffiliateNetworkId); aff.AppendClickId == 1 {
		appended = req.Id()
	}
	req.Redirect(w, gr, req.ParseUrlTokens(o.Url)+appended)
	return nil
}

func (o *Offer) OnImpression(w http.ResponseWriter, req request.Request) error {
	return nil
}

func (o *Offer) OnS2SPostback(w http.ResponseWriter, req request.Request) error {
	if o == nil {
		return fmt.Errorf("[Offer][OnS2SPostback]Nil o for request(%s)", req.Id())
	}
	return nil
}

func (o *Offer) OnConversionPixel(w http.ResponseWriter, req request.Request) error {
	return nil
}

func (o *Offer) OnConversionScript(w http.ResponseWriter, req request.Request) error {
	return nil
}
