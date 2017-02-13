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
	"time"
)

const CacheSvrTitle = "REQCACHE"

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
func setReqCache(req *reqbase, expire time.Duration) (err error) {
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
			svr := db.GetRedisClient(CacheSvrTitle)
			if svr == nil {
				return fmt.Errorf("[setReqCache]%s redis client does not exist", CacheSvrTitle)
			}
			v := req2cacheStr(req)
			err = svr.Set(req.Id(), v, expire).Err()
			log.Infof("[request][setReqCache] key:%s value:%s err:%v\n", req.Id(), v, err)
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
			svr := db.GetRedisClient(CacheSvrTitle)
			if svr == nil {
				return nil, fmt.Errorf("[getReqCache]%s redis client does not exist", CacheSvrTitle)
			}
			cmd := svr.Get(reqId)
			req = cacheStr2Req(cmd.Val())
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
			svr := db.GetRedisClient(CacheSvrTitle)
			if svr == nil {
				log.Errorf("[getReqCache]%s redis client does not exist\n", CacheSvrTitle)
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
	ku.Add("cost", fmt.Sprintf("%f", req.cost))
	ku.Add("vars", strings.Join(req.vars, ";"))
	ku.Add("txId", req.txid)
	ku.Add("payout", fmt.Sprintf("%f", req.payout))

	ku.Add("tsId", fmt.Sprintf("%d", req.trafficSourceId))
	ku.Add("tsName", req.trafficSourceName)
	ku.Add("uId", fmt.Sprintf("%d", req.userId))
	ku.Add("uIdText", req.userIdText)
	ku.Add("cHash", req.campaignHash)
	ku.Add("cId", fmt.Sprintf("%d", req.campaignId))
	ku.Add("cName", req.campaignName)
	ku.Add("fId", fmt.Sprintf("%d", req.flowId))
	ku.Add("rId", fmt.Sprintf("%d", req.ruleId))
	ku.Add("pId", fmt.Sprintf("%d", req.pathId))
	ku.Add("lId", fmt.Sprintf("%d", req.landerId))
	ku.Add("lName", req.landerName)
	ku.Add("oId", fmt.Sprintf("%d", req.offerId))
	ku.Add("oName", req.offerName)
	ku.Add("affId", fmt.Sprintf("%d", req.affiliateId))
	ku.Add("affName", req.affiliateName)

	ku.Add("impTs", fmt.Sprintf("%d", req.impTimeStamp))
	ku.Add("visitTs", fmt.Sprintf("%d", req.visitTimeStamp))
	ku.Add("clickTs", fmt.Sprintf("%d", req.clickTimeStamp))
	ku.Add("pbTs", fmt.Sprintf("%d", req.postbackTimeStamp))

	ku.Add("dType", req.deviceType)
	ku.Add("trkDomain", req.trackingDomain)
	ku.Add("trkPath", req.trackingPath)
	ku.Add("ref", req.referrer)
	ku.Add("refDomain", req.referrerdomain)
	ku.Add("language", req.language)
	ku.Add("model", req.model)
	ku.Add("brand", req.brand)
	ku.Add("countryCode", req.countryCode)
	ku.Add("countryName", req.countryName)
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
	ku.Add("cpaValue", fmt.Sprintf("%f", req.cpaValue))
	//	req.tsExternalId
	if req.tsExternalId != nil {
		ku.Add("tsEId", req.tsExternalId.Encode())
	}
	//	req.tsCost
	if req.tsCost != nil {
		ku.Add("tsCost", req.tsCost.Encode())
	}
	//	req.tsVars
	if len(req.tsVars) > 0 {
		ku.Add("tsVars", common.EncodeParams(req.tsVars))
	}

	return base64.URLEncoding.EncodeToString([]byte(ku.Encode()))
}

func cacheStr2Req(caStr string) (req *reqbase) {
	if caStr == "" {
		return nil
	}
	bt, err := base64.URLEncoding.DecodeString(caStr)
	if err != nil {
		log.Errorf("DecodeString:%s failed:%v", caStr, err)
		return
	}
	//bc := xxtea.XxteaDecrypt(bt)
	bd, err := url.ParseQuery(string(bt))
	if err != nil {
		log.Errorf("ParseQuery:%s failed:%v", caStr, err)
		return
	}

	req = &reqbase{
		id: bd.Get("id"),
		t:  bd.Get("t"),
		ip: bd.Get("ip"),
		ua: bd.Get("ua"),

		externalId: bd.Get("externalId"),
		vars:       strings.Split(bd.Get("vars"), ";"),
		txid:       bd.Get("txId"),

		trafficSourceName: bd.Get("tsname"),
		campaignHash:      bd.Get("cHash"),
		campaignName:      bd.Get("cName"),
		landerName:        bd.Get("lName"),
		offerName:         bd.Get("oName"),
		affiliateName:     bd.Get("affName"),
		userIdText:        bd.Get("uIdText"),

		deviceType:     bd.Get("dType"),
		trackingDomain: bd.Get("trkDomain"),
		trackingPath:   bd.Get("trkPath"),
		referrer:       bd.Get("referrer"),
		language:       bd.Get("language"),
		model:          bd.Get("model"),
		brand:          bd.Get("brand"),
		countryCode:    bd.Get("countryCode"),
		countryName:    bd.Get("countryName"),
		region:         bd.Get("region"),
		city:           bd.Get("city"),
		carrier:        bd.Get("carrier"),
		isp:            bd.Get("isp"),
		os:             bd.Get("os"),
		osVersion:      bd.Get("osv"),
		browser:        bd.Get("browser"),
		browserVersion: bd.Get("browserv"),
		connectionType: bd.Get("connType"),
		cookie:         make(map[string]string),
		urlParam:       make(map[string]string),
	}

	req.cost, _ = strconv.ParseFloat(bd.Get("cost"), 64)
	req.payout, _ = strconv.ParseFloat(bd.Get("payout"), 64)
	req.impTimeStamp, _ = strconv.ParseInt(bd.Get("impTs"), 10, 64)
	req.visitTimeStamp, _ = strconv.ParseInt(bd.Get("visitTs"), 10, 64)
	req.clickTimeStamp, _ = strconv.ParseInt(bd.Get("clickTs"), 10, 64)
	req.postbackTimeStamp, _ = strconv.ParseInt(bd.Get("pbTs"), 10, 64)
	req.trafficSourceId, _ = strconv.ParseInt(bd.Get("tsId"), 10, 64)
	req.userId, _ = strconv.ParseInt(bd.Get("uId"), 10, 64)
	req.campaignId, _ = strconv.ParseInt(bd.Get("cId"), 10, 64)
	req.flowId, _ = strconv.ParseInt(bd.Get("fId"), 10, 64)
	req.ruleId, _ = strconv.ParseInt(bd.Get("rId"), 10, 64)
	req.pathId, _ = strconv.ParseInt(bd.Get("pId"), 10, 64)
	req.landerId, _ = strconv.ParseInt(bd.Get("lId"), 10, 64)
	req.offerId, _ = strconv.ParseInt(bd.Get("oId"), 10, 64)
	req.affiliateId, _ = strconv.ParseInt(bd.Get("affId"), 10, 64)
	req.bot, _ = strconv.ParseBool(bd.Get("bot"))
	req.cpaValue, _ = strconv.ParseFloat(bd.Get("cpaValue"), 64)
	req.tsExternalId = &common.TrafficSourceParams{}
	req.tsExternalId.Decode(bd.Get("tsEId"))
	req.tsCost = &common.TrafficSourceParams{}
	req.tsCost.Decode(bd.Get("tsCost"))
	req.tsVars = common.DecodeParams(bd.Get("tsVars"))
	return
}
