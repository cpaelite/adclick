//+build windows

package main

import (
	"flag"
	"fmt"
	"net/http"
	"time"

	"AdClickTool/Service/common"
	"AdClickTool/Service/config"
	"AdClickTool/Service/db"
	"AdClickTool/Service/gracequit"
	"AdClickTool/Service/log"
	"AdClickTool/Service/tracking"
	"AdClickTool/Service/units"

	"AdClickTool/Service/request"
)

func main() {
	flag.Parse()

	if err := config.LoadConfig(true); err != nil {
		panic(err.Error())
	}

	logAdapter := config.String("LOG", "adapter")
	logConfig := config.String("LOG", "jsonconfig")
	logAsync := config.Bool("LOG", "async")
	if logAdapter == "" {
		logAdapter = "console"
	}
	if logConfig == "" {
		logConfig = `{"level":7}`
	}
	log.Init(logAdapter, logConfig, logAsync)

	// 启动保存协程
	gracequit.StartGoroutine(func(c gracequit.StopSigChan) {
		tracking.Saving(db.GetDB("DB"), c)
	})

	// 启动Conversion保存
	gracequit.StartGoroutine(func(c gracequit.StopSigChan) {
		tracking.SavingConversions(db.GetDB("DB"), c)
	})

	// 启动汇总协程
	gracequit.StartGoroutine(func(c gracequit.StopSigChan) {
		tracking.Gathering(c)
	})

	// 启动AdIPStatis表的汇总协程
	tracking.InitIPGatherSaver(&gracequit.G, db.GetDB("DB"))

	// 启动AdReferrerStatis表的汇总协程
	tracking.InitRefGatherSaver(&gracequit.G, db.GetDB("DB"))

	// 启动AdReferrerDomainStatis表的汇总协程
	tracking.InitDomainGatherSaver(&gracequit.G, db.GetDB("DB"))

	if err := units.Init(); err != nil {
		panic(err.Error())
	}

	http.HandleFunc("/status", Status1)
	http.HandleFunc("/status/", Status2)
	http.HandleFunc(config.String("DEFAULT", "lpofferrequrl"), OnLPOfferRequest)
	http.HandleFunc(config.String("DEFAULT", "lpclickurl"), OnLandingPageClick)
	reqServer := &http.Server{Addr: ":" + config.GetBindPort(), Handler: http.DefaultServeMux}
	log.Info("Start listening request at", config.GetBindPort())
	log.Error(reqServer.ListenAndServe())

	// 只需要在HTTP服务器退出的时候，等待协程退出
	gracequit.StopAll()
}

func Status1(w http.ResponseWriter, r *http.Request) {
	log.Info("Status1:", common.SchemeHostURI(r))
	c, err := r.Cookie("tstep")
	if err != nil {
		log.Error(err.Error())
	}
	if c != nil {
		log.Infof("Cookies tstep:%+v\n", *c)
	}
	req, _ := request.CreateRequest(common.GenRandId(), request.ReqLPOffer, r)
	req.SetCampaignId(time.Now().Unix())
	units.SetCookie(w, request.ReqLPOffer, req)
	fmt.Fprint(w, "It works1!"+common.SchemeHostURI(r)+
		" *"+r.RequestURI+
		" *"+common.GetCampaignHash(r)+
		" *"+fmt.Sprintf("%v", r.URL.IsAbs()))
}

func Status2(w http.ResponseWriter, r *http.Request) {
	log.Info("Status2:", common.SchemeHostURI(r))
	c, err := r.Cookie("tstep")
	if err != nil {
		log.Error(err.Error())
	}
	if c != nil {
		log.Infof("Cookies tstep:%+v\n", *c)
	}
}

func OnLPOfferRequest(w http.ResponseWriter, r *http.Request) {
	units.OnLPOfferRequest(w, r)
}

func OnLandingPageClick(w http.ResponseWriter, r *http.Request) {
	units.OnLandingPageClick(w, r)
}
