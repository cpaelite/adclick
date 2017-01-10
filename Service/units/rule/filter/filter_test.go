package filter

import (
	"AdClickTool/Service/config"
	"AdClickTool/Service/log"
	"AdClickTool/Service/units/rule/simplejson"
	"flag"
	"fmt"
	"strings"
	"testing"
)

//TODO 修改、测试

//时间段    date year month day hour wday
//广告位    slotid
//地理位置  country city
//设备     os
//上游渠道  partnerid
//广告类型  adtype
var testfilter []byte = []byte(`[
            [
                ["date", "between", "2016-07-01,2016-12-30"],
                ["hour", "in", "0..24"],
				["country", "in", "CN,TW,JP,USA"],
				["slotid","in","1,2,3"],
				["apptype","in","IN-APP,BROWSER"],
				["devicetype","in","MOBILE,DESKTOP"],
				["connectiontype","in","ETHERNET,WIFI,CELLUARNETWORK"],
				["size","in","300*250,728*90,160*600"],
				["datacenter","in","US-WEST"]
            ],
			[
				["datacenter","in","CHINA"]
			]
        ]`)

func TestAdFilter(t *testing.T) {
	flag.Set("config", "/Users/robin/development.ini")
	flag.Parse()
	if err := config.LoadConfig(true); err != nil {
		panic(err.Error())
	}
	log.Init("console", `{"level":7}`, false)
	raw := fakeRawFilter(testfilter)
	nf, err := NewAdFilter(getAdInfoData(), raw)
	if err != nil {
		fmt.Println(err.Error())
		t.Fail()
	}

	//t.Logf("testfilter2 %+v", nf.Marshal())

	slotInfo := getSlotInfo()
	req2 := util.NewRtbRequest("123344",
		getHttpReq(),
		slotInfo,
		util.VenderTypeSdk,
		getOpenrtbReq())
	//nf.Execute(req2)
	//bjson, _ := req2.SlotInfo().Marshal()
	//t.Logf("req2.SlotInfo %+v\n", string(bjson))

	//t.Logf("accept: %+v", nf.Accept(req2))

	if !nf.Accept(req2) {
		t.Fail()
	}
}

type adinfo struct {
	j *simplejson.Json
}

func (info *adinfo) Get(key string) interface{} {
	strs := strings.Split(key, ".")
	if info.j == nil {
		return nil
	}
	return info.j.GetPath(strs...).Interface()
}

func getAdInfoData() *adinfo {
	data := `{
		"id":"123456",
		"name":"test01",
		"advtType":"",
		"advtId":""
	}`
	j, _ := simplejson.NewJson([]byte(data))
	return &adinfo{j}
}
