package request

import (
	"net/http"

	"AdClickTool/Service/common"
	"AdClickTool/Service/log"
)

type S2SPostbackRequest struct {
	reqbase
}

func CreateS2SPostbackRequest(clickId string, r *http.Request) (req *S2SPostbackRequest) {
	breq, err := getReqCache(clickId)
	if err != nil || breq == nil {
		log.Errorf("[CreateS2SPostbackRequest]Failed with clickId(%s) from %s with err(%v)\n",
			clickId, common.SchemeHostURI(r), err)
		return
	}

	breq.t = ReqS2SPostback

	return &S2SPostbackRequest{*breq}
}
