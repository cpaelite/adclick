package tracking

import "time"

type adStatisValues struct {
	Visits      int
	Clicks      int
	Conversions int
	Cost        float64
	Payout      float64
}

// adStaticTableFields AdStatic表所有的字段
type adStaticTableFields struct {
	AdStatisKey
	adStatisValues
}

type events struct {
	keyMd5    string
	keyFields AdStatisKey
	action    func(d *adStatisValues)
}

var userStatis map[string]*adStaticTableFields
var toSave chan map[string]*adStaticTableFields
var gatherChan chan events
var flushEvent chan struct{}

func init() {
	gatherChan = make(chan events, 1024)
	userStatis = make(map[string]*adStaticTableFields)
	toSave = make(chan map[string]*adStaticTableFields)
	flushEvent = make(chan struct{})
}

func getData(keyMD5 string, keyFields AdStatisKey) *adStaticTableFields {
	d, ok := userStatis[keyMD5]
	if !ok {
		d = &adStaticTableFields{}
		d.AdStatisKey = keyFields
		userStatis[keyMD5] = d
	}
	return d
}

// 此函数只能在下面的gathering里面调用
func flush() {
	toSave <- userStatis
	userStatis = make(map[string]*adStaticTableFields)
}

// Gathering 统计信息汇总
func Gathering() {
	ticker := time.NewTicker(60 * time.Second)
	for {
		select {
		case a := <-gatherChan:
			d := getData(a.keyMd5, a.keyFields)
			a.action(&d.adStatisValues)

		case <-ticker.C:
			// TODO: 配置多长时间写一次数据库
			flush()

		case <-flushEvent:
			flush()
			// TODO: case stop: 收到停止信号，要把所有的数据收集好，然后停止
		}
	}
}
