package request

import (
	"net/http"

	"AdClickTool/Service/common"
	"AdClickTool/Service/log"
)

type S2SPostbackRequest struct {
	reqbase
}

func CreateS2SPostbackRequest(reqId string, r *http.Request) Request {
	breq, err := getReqCache(reqId)
	if err != nil || breq == nil {
		log.Errorf("[CreateS2SPostbackRequest]Failed with reqId(%s) from %s with err(%v)\n",
			reqId, common.SchemeHostURI(r), err)
		return nil
	}

	breq.t = ReqS2SPostback

	return &S2SPostbackRequest{*breq}
}
