//+build windows

package main

import (
	"flag"
	"fmt"
	"net/http"

	"AdClickTool/Service/common"
	"AdClickTool/Service/config"
	"AdClickTool/Service/log"
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

	http.HandleFunc("/", Status)
	reqServer := &http.Server{Addr: ":" + config.GetBindPort(), Handler: http.DefaultServeMux}
	log.Info("Start listening request at", config.GetBindPort())
	log.Error(reqServer.ListenAndServe())
}

func Status(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "It works!"+common.GetUerIdText(r))
}

func OnLPOfferRequest(w http.ResponseWriter, r *http.Request) {

}

func OnLandingPageClick(w http.ResponseWriter, r *http.Request) {

}
