package request

import (
	"net/http"
)

type LPOfferRequest struct {
	reqbase
}

func CreateLPOfferRequest(reqId string, r *http.Request) (req *LPOfferRequest) {
	breq, err := getReqCache(reqId)
	if err == nil && breq != nil {
		breq.t = ReqLPOffer
		breq.trackingPath = r.URL.Path
		return &LPOfferRequest{*breq}
	}

	breq = newReqBase(reqId, ReqLPOffer, r)
	if breq == nil {
		return nil
	}

	return &LPOfferRequest{*breq}
}
