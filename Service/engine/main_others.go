//+build !windows

package main

import (
	"flag"
	"fmt"
	"net/http"

	"AdClickTool/Service/common"
	"AdClickTool/Service/config"
	"AdClickTool/Service/db"
	"AdClickTool/Service/gracequit"
	"AdClickTool/Service/log"
	"AdClickTool/Service/tracking"
	"AdClickTool/Service/units"

	"github.com/facebookgo/grace/gracehttp"
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

	// 启动汇总协程
	gracequit.StartGoroutine(func(c gracequit.StopSigChan) {
		tracking.Gathering(c)
	})

	if err := units.Init(); err != nil {
		panic(err.Error())
	}

	http.HandleFunc("/status", Status1)
	http.HandleFunc("/status/", Status2)
	http.HandleFunc(config.String("DEFAULT", "lpofferrequrl"), OnLPOfferRequest)
	http.HandleFunc(config.String("DEFAULT", "lpclickurl"), OnLandingPageClick)
	reqServer := &http.Server{Addr: ":" + config.GetBindPort(), Handler: http.DefaultServeMux}
	log.Info("Start listening request at", config.GetBindPort())
	log.Error(gracehttp.Serve(reqServer))
	log.Infof("http server stopped. stopping other goroutines...")
	// 只需要在HTTP服务器退出的时候，等待协程退出
	gracequit.StopAll()
	log.Infof("other goroutines stopped successfully")
}

func Status1(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "It works1!"+common.SchemeHostPath(r)+" *"+r.RequestURI+" *"+common.GetCampaignHash(r))
}

func Status2(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "http://www.baidu.com", http.StatusFound)
}

func OnLPOfferRequest(w http.ResponseWriter, r *http.Request) {
	units.OnLPOfferRequest(w, r)
}

func OnLandingPageClick(w http.ResponseWriter, r *http.Request) {
	units.OnLandingPageClick(w, r)
}
