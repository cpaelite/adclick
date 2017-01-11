package request

import (
	"net/http"
)

type LPOfferRequest struct {
	reqbase
}

func CreateLPOfferRequest(id string, r *http.Request) (req *LPOfferRequest) {
	breq := newReqBase(id, ReqLPOffer, r)
	if breq == nil {
		return nil
	}

	return &LPOfferRequest{*breq}
}
