package campaign

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"

	"AdClickTool/Service/request"
	"AdClickTool/Service/units/flow"
)

const (
	//0:URL;1:Flow;2:Rule;3:Path;4:Lander;5:Offer
	DstTypeUrl    = 0
	DstTypeFlow   = 1
	DstTypeRule   = 2
	DstTypePath   = 3
	DstTypeLander = 4
	DstTypeOffer  = 5
)

type CampaignConfig struct {
	Id              int64
	UserId          int64
	Hash            string
	Url             string
	ImpPixelUrl     string
	TrafficSourceId int64
	CostModel       string
	CostValue       float64
	DstType         int64
	DstFlowId       int64
	DstUrl          string
	Status          int64
}

func (c CampaignConfig) String() string {
	return fmt.Sprintf("Campaign %d:%d Status %d", c.Id, c.UserId, c.Status)
}

type Campaign struct {
	CampaignConfig
	f *flow.Flow
}

func NewCampaign(c CampaignConfig) (ca *Campaign) {
	ca = &Campaign{
		CampaignConfig: c,
	}
	if ca.DstFlowId > 0 {
		fc := flow.GetFlow(ca.DstFlowId)
		if fc.Id > 0 {
			ca.f = flow.NewFlow(fc)
		}
	}
	return
}

func (ca *Campaign) SetFlow(f *flow.Flow) {
	ca.f = f
}

var gr = &http.Request{
	Method: "GET",
	URL: &url.URL{
		Path: "",
	},
}

func (ca *Campaign) OnLPOfferRequest(w http.ResponseWriter, req request.Request) error {
	if ca == nil {
		return errors.New("[Campaign][OnLPOfferRequest]Nil ca")
	}

	if ca.DstType == DstTypeUrl {
		if ca.DstUrl != "" {
			http.Redirect(w, gr, req.ParseUrlTokens(ca.DstUrl), http.StatusFound)
			return nil
		}
	} else {
		if ca.f != nil {
			req.SetFlowId(ca.DstFlowId)
			return ca.f.OnLPOfferRequest(w, req)
		}
	}

	return fmt.Errorf("[Campaign][OnLPOfferRequest]Invalid dstination for request(%s) in campaign(%d)", req.Id(), ca.Id)
}
