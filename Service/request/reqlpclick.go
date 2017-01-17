package request

import (
	"net/http"

	"AdClickTool/Service/common"
	"AdClickTool/Service/log"
)

type LPClickRequest struct {
	reqbase
}

func CreateLPClickRequest(reqId string, r *http.Request) (req *LPClickRequest) {
	breq, err := getReqCache(reqId)
	if err != nil || breq == nil {
		log.Errorf("[CreateLPClickRequest]Failed with reqId(%s) from %s with err(%v)\n",
			reqId, common.SchemeHostURI(r), err)
		return
	}

	breq.t = ReqLPClick

	return &LPClickRequest{*breq}
}
