package main

import (
	"flag"
	"fmt"
	"net/http"
	"runtime/debug"

	"AdClickTool/Service/common"
	"AdClickTool/Service/config"
	"AdClickTool/Service/db"
	"AdClickTool/Service/gracequit"
	"AdClickTool/Service/log"
	"AdClickTool/Service/servehttp"
	"AdClickTool/Service/tracking"
	"AdClickTool/Service/units"
	"AdClickTool/Service/units/blacklist"
	"AdClickTool/Service/units/user"
	"time"
)

func main() {
	defer func() {
		log.Alert("Quit main()")
		log.Alert(string(debug.Stack()))
	}()
	help := flag.Bool("help", false, "show help")
	flag.Parse()
	if *help {
		flag.PrintDefaults()
		return
	}

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
	defer func() {
		log.Flush()
	}()

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
		secondsAdStatis := config.Int("TRACKING", "adstatis-interval")
		interval := time.Duration(secondsAdStatis) * time.Second
		if interval == 0 {
			log.Warnf("config: TRACKING:adstatis-interval not found. Using default interval: 10 minutes")
			interval = 10 * 60 * time.Second
		}
		tracking.Gathering(c, interval)
	})

	secondsIpReferrerDomain := config.Int("TRACKING", "ip-interval")
	interval := time.Duration(secondsIpReferrerDomain) * time.Second
	if interval == 0 {
		log.Warnf("config: TRACKING:ip-interval not found. Using default interval: 10 minutes")
		interval = 10 * 60 * time.Second
	}

	// 启动AdIPStatis表的汇总协程
	tracking.InitIPGatherSaver(&gracequit.G, db.GetDB("DB"), interval)

	// 启动AdReferrerStatis表的汇总协程
	tracking.InitRefGatherSaver(&gracequit.G, db.GetDB("DB"), interval)

	// 启动AdReferrerDomainStatis表的汇总协程
	tracking.InitDomainGatherSaver(&gracequit.G, db.GetDB("DB"), interval)

	// redis 要能够连接
	redisClient := db.GetRedisClient("MSGQUEUE")
	if redisClient == nil {
		log.Errorf("Connect redis server failed.")
		return
	}
	log.Debugf("Connect redis success: redisClient:%p", redisClient)

	collector := new(user.CollectorCampChangedUsers)
	collector.Start()

	if err := units.Init(); err != nil {
		panic(err.Error())
	}
	collector.Stop()
	reloader := new(user.Reloader)
	go reloader.Running()

	log.Infof("collected users:%+v", collector.Users)
	log.Debugf("redisClient:%p", db.GetRedisClient("MSGQUEUE"))
	for _, uid := range collector.Users {
		user.ReloadUser(uid)
	}

	for _, uid := range collector.BlacklistUsers {
		blacklist.ReloadUserBlacklist(uid)
	}

	http.HandleFunc("/status", Status1)
	http.HandleFunc("/status/", Status2)
	http.HandleFunc(config.String("DEFAULT", "lpofferrequrl"), units.OnLPOfferRequest)
	http.HandleFunc(config.String("DEFAULT", "lpclickurl"), units.OnLandingPageClick)
	http.HandleFunc(config.String("DEFAULT", "impressionurl"), units.OnImpression)
	reqServer := &http.Server{Addr: ":" + config.GetEnginePort(), Handler: http.DefaultServeMux}
	log.Info("Start listening request at", config.GetEnginePort())
	log.Error(servehttp.Serve(reqServer))
	log.Infof("http server stopped. stopping other goroutines...")
	// 只需要在HTTP服务器退出的时候，等待协程退出

	log.Infof("stopping background goroutines...")
	gracequit.StopAll()
	log.Infof("background goroutines stopped")
}

func Status1(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "It works1!"+common.SchemeHostPath(r)+" *"+r.RequestURI+" *"+common.GetCampaignHash(r))
}

func Status2(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "http://www.baidu.com", http.StatusFound)
}
