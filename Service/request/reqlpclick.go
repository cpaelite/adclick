package request

import (
	"net/http"
)

type LPClickRequest struct {
	reqbase
}

func CreateLPClickRequest(id string, r *http.Request) (req *LPClickRequest) {
	breq := newReqBase(id, ReqLPClick, r)
	if breq == nil {
		return nil
	}

	return &LPClickRequest{*breq}
}
