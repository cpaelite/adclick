// Package tracking 负责对gather, saver模块的封装
// 提供一个更简单的模块，用于汇总数据，写到数据库
package tracking

import (
	"AdClickTool/Service/gracequit"
	"AdClickTool/Service/tracking/gather"
	"AdClickTool/Service/tracking/saver"
	"database/sql"
	"time"
)

// StatisValue statis表里面的值部分
type StatisValue struct {
	Visits      int
	Clicks      int
	Conversions int
	Cost        float64
	Revenue     float64
	Impressions int
}

func valueNewer() interface{} {
	return &StatisValue{}
}

//
type gatherSaver struct {
	saver  *saver.Saver
	gather *gather.Gather
	g      *gracequit.GraceQuit
}

func newGatherSaver(g *gracequit.GraceQuit, insertSQL string) gatherSaver {
	// saver只负责汇总之后的数据的保存
	// 所以其chan buffer不需要太大
	s := saver.NewSaver(2, insertSQL)
	return gatherSaver{
		saver: s,
		// gather负责消息的汇总
		// 其buffer需要大一些
		gather: gather.NewGather(1024, valueNewer, s, 10*60*time.Second),
		g:      g,
	}
}

// StartStatis 开启
func (gs gatherSaver) Start(db *sql.DB) {
	// 先启动保存协程，再启动汇总协程
	gs.g.StartGoroutine(func(stop gracequit.StopSigChan) {
		gs.saver.Running(db, stop)
	})

	gs.g.StartGoroutine(func(stop gracequit.StopSigChan) {
		gs.gather.Gathering(stop)
	})
}

// AddVisit 增加Visits
func (gs gatherSaver) AddVisit(key interface{}, count int) {
	action := func(i interface{}) {
		v := i.(*StatisValue)
		v.Visits += count
	}
	gs.addEvent(key, action)
}

// AddClicks 增加Clicks
func (gs gatherSaver) AddClick(key interface{}, count int) {
	action := func(i interface{}) {
		v := i.(*StatisValue)
		v.Clicks += count
	}
	gs.addEvent(key, action)
}

// AddConversion 增加Conversion
func (gs gatherSaver) AddConversion(key interface{}, count int) {
	action := func(i interface{}) {
		v := i.(*StatisValue)
		v.Conversions += count
	}
	gs.addEvent(key, action)
}

// AddCost 增加Cost
func (gs gatherSaver) AddCost(key interface{}, count float64) {
	action := func(i interface{}) {
		v := i.(*StatisValue)
		v.Cost += count
	}
	gs.addEvent(key, action)
}

// AddRevenue 增加Revenue
func (gs gatherSaver) AddRevenue(key interface{}, count float64) {
	action := func(i interface{}) {
		v := i.(*StatisValue)
		v.Revenue += count
	}
	gs.addEvent(key, action)
}

// AddImpression 增加Impression
func (gs gatherSaver) AddImpression(key interface{}, count int) {
	action := func(i interface{}) {
		v := i.(*StatisValue)
		v.Impressions += count
	}
	gs.addEvent(key, action)
}

func (gs gatherSaver) addEvent(key interface{}, action func(i interface{})) {
	e := gather.Event{
		Key:    key,
		Action: action,
	}
	gs.gather.GatherChan <- e
}
