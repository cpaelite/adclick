package request

import (
	"net/http"
)

type OfferPBRequest struct {
	reqbase
}

func CreateOfferPBRequest(id string, r *http.Request) (req *OfferPBRequest) {
	breq := newReqBase(id, ReqOfferPB, r)
	if breq == nil {
		return nil
	}

	return &OfferPBRequest{*breq}
}
