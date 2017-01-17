package request

import (
	"encoding/base64"
	"errors"
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"sync"

	"AdClickTool/Service/common"
	"AdClickTool/Service/db"
	"AdClickTool/Service/log"
	"AdClickTool/Service/util/xxtea"
)

const cacheSvrTitle = "REQCACHE"

var mu sync.RWMutex // protects the following
var reqCache = make(map[string]string)

func get(token string) (caStr string) {
	if token == "" {
		return ""
	}
	mu.RLock()
	defer mu.RUnlock()
	caStr, _ = reqCache[token]
	return
}
func del(token string) {
	if token == "" {
		return
	}
	mu.Lock()
	defer mu.Unlock()
	delete(reqCache, token)
}
func set(token, caStr string) error {
	if token == "" {
		return errors.New("token is empty")
	}
	mu.Lock()
	defer mu.Unlock()
	reqCache[token] = caStr
	return nil
}

func gentToken(req *reqbase) (token string) {
	//TODO 修改成特定的规则
	if req.Id() != "" {
		return req.Id()
	}
	return common.GenRandId()
}
func setReqCache(req *reqbase) (err error) {
	if req == nil {
		return errors.New("req is nil for setReqCache")
	}
	if req.Id() == "" {
		return errors.New("req.Id() is empty for setReqCache")
	}

	strategy := 1
	switch strategy {
	case 1: //方案1：使用中心Cache服务器。
		{
			svr := db.GetRedisClient(cacheSvrTitle)
			if svr == nil {
				return fmt.Errorf("[setReqCache]%s redis client does not exist", cacheSvrTitle)
			}
			err = svr.Append(req.Id(), req2cacheStr(req)).Err()
		}
	case 2: //方案2：使用程序内部的Cache。外部通过userIdText做分流。
		{
			err = set(req.Id(), req2cacheStr(req))
		}
	}
	return
}

func getReqCache(reqId string) (req *reqbase, err error) {
	strategy := 1
	switch strategy {
	case 1: //方案1：使用中心Cache服务器。
		{
			svr := db.GetRedisClient(cacheSvrTitle)
			if svr == nil {
				return nil, fmt.Errorf("[getReqCache]%s redis client does not exist", cacheSvrTitle)
			}
			req = cacheStr2Req(svr.Get(reqId).String())
		}
	case 2: //方案2：使用程序内部的Cache。外部通过userIdText做分流。
		{
			req = cacheStr2Req(get(reqId))
		}
	}
	return
}

func delReqCache(token string) {
	strategy := 1
	switch strategy {
	case 1: //方案1：使用中心Cache服务器。
		{
			svr := db.GetRedisClient(cacheSvrTitle)
			if svr == nil {
				log.Errorf("[getReqCache]%s redis client does not exist\n", cacheSvrTitle)
			}
			if err := svr.Del(token).Err(); err != nil {
				log.Errorf("[delReqCache]delReqCache token(%s) with err(%s)\n", token, err.Error())
			}
		}
	case 2: //方案2：使用程序内部的Cache。外部通过userIdText做分流。
		{
			del(token)
		}
	case 3: //方案3：有效内容包装在token中。内容太多token太长。开发简便。
		{
			// do nothing
		}
	}
	return
}

func req2cacheStr(req *reqbase) (caStr string) {
	if req == nil {
		return ""
	}
	ku, _ := url.ParseQuery("")
	ku.Add("id", req.id)
	ku.Add("t", req.t)
	ku.Add("ip", req.ip)
	ku.Add("ua", req.ua)

	ku.Add("externalId", req.externalId)
	ku.Add("cost", req.cost)
	ku.Add("vars", strings.Join(req.vars, ";"))

	ku.Add("tsId", fmt.Sprintf("%d", req.trafficSourceId))
	ku.Add("tsName", req.trafficSourceName)
	ku.Add("uId", fmt.Sprintf("%d", req.userId))
	ku.Add("uIdText", req.userIdText)
	ku.Add("cHash", req.campaignHash)
	ku.Add("cId", fmt.Sprintf("%d", req.campaignId))
	ku.Add("fId", fmt.Sprintf("%d", req.flowId))
	ku.Add("rId", fmt.Sprintf("%d", req.ruleId))
	ku.Add("pId", fmt.Sprintf("%d", req.pathId))
	ku.Add("lId", fmt.Sprintf("%d", req.landerId))
	ku.Add("oId", fmt.Sprintf("%d", req.offerId))

	ku.Add("dType", req.deviceType)
	ku.Add("trkDomain", req.trackingDomain)
	ku.Add("trkPath", req.trackingPath)
	ku.Add("ref", req.referrer)
	ku.Add("refDomain", req.referrerdomain)
	ku.Add("language", req.language)
	ku.Add("model", req.model)
	ku.Add("brand", req.brand)
	ku.Add("country", req.country)
	ku.Add("region", req.region)
	ku.Add("city", req.city)
	ku.Add("carrier", req.carrier)
	ku.Add("isp", req.isp)
	ku.Add("os", req.os)
	ku.Add("osv", req.osVersion)
	ku.Add("browser", req.browser)
	ku.Add("browserv", req.browserVersion)
	ku.Add("connType", req.connectionType)
	ku.Add("bot", fmt.Sprintf("%v", req.bot))

	return base64.URLEncoding.EncodeToString(xxtea.XxteaEncrypt([]byte(ku.Encode())))
}

func cacheStr2Req(caStr string) (req *reqbase) {
	if caStr == "" {
		return nil
	}
	bt, err := base64.URLEncoding.DecodeString(caStr)
	if err != nil {
		return
	}
	bc := xxtea.XxteaDecrypt(bt)
	bd, err := url.ParseQuery(string(bc))
	if err != nil {
		return
	}

	req = &reqbase{
		id: bd.Get("id"),
		t:  bd.Get("t"),
		ip: bd.Get("ip"),
		ua: bd.Get("ua"),

		externalId: bd.Get("externalId"),
		cost:       bd.Get("cost"),
		vars:       strings.Split(bd.Get("vars"), ";"),

		trafficSourceName: bd.Get("tsname"),
		userIdText:        bd.Get("uIdText"),

		deviceType:     bd.Get("dType"),
		trackingDomain: bd.Get("trkDomain"),
		trackingPath:   bd.Get("trkPath"),
		referrer:       bd.Get("referrer"),
		language:       bd.Get("language"),
		model:          bd.Get("model"),
		brand:          bd.Get("brand"),
		country:        bd.Get("country"),
		region:         bd.Get("region"),
		city:           bd.Get("city"),
		carrier:        bd.Get("carrier"),
		isp:            bd.Get("isp"),
		os:             bd.Get("os"),
		osVersion:      bd.Get("osv"),
		browser:        bd.Get("browser"),
		browserVersion: bd.Get("browserv"),
		connectionType: bd.Get("connType"),
	}

	req.trafficSourceId, _ = strconv.ParseInt(bd.Get("tsId"), 10, 64)
	req.userId, _ = strconv.ParseInt(bd.Get("uId"), 10, 64)
	req.campaignId, _ = strconv.ParseInt(bd.Get("cId"), 10, 64)
	req.flowId, _ = strconv.ParseInt(bd.Get("fId"), 10, 64)
	req.ruleId, _ = strconv.ParseInt(bd.Get("rId"), 10, 64)
	req.pathId, _ = strconv.ParseInt(bd.Get("pId"), 10, 64)
	req.landerId, _ = strconv.ParseInt(bd.Get("lId"), 10, 64)
	req.offerId, _ = strconv.ParseInt(bd.Get("oId"), 10, 64)
	req.bot, _ = strconv.ParseBool(bd.Get("bot"))
	return
}
