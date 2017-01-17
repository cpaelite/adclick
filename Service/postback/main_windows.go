//+build windows

package main

import (
	"flag"
	"fmt"
	"net/http"

	"AdClickTool/Service/common"
	"AdClickTool/Service/config"
	"AdClickTool/Service/log"
	"AdClickTool/Service/units"
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
	http.HandleFunc(config.String("DEFAULT", "s2spostback"), OnS2SPostback)
	http.HandleFunc(config.String("DEFAULT", "conversionpixelurl"), OnConversionPixel)
	http.HandleFunc(config.String("DEFAULT", "conversionscripturl"), OnConversionScript)

	log.Error(StartServe())
}

func StartServe() error {
	reqServer := &http.Server{Addr: ":" + config.GetBindPort(), Handler: http.DefaultServeMux}
	log.Info("Start listening postback at", config.GetBindPort())
	return reqServer.ListenAndServe()
}

func Status(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "It works!"+common.GetUerIdText(r))
}

func OnS2SPostback(w http.ResponseWriter, r *http.Request) {
	//TODO 去除重复的clickId和transactionId的conversions
	if r.Method != http.MethodGet {
		http.NotFound(w, r)
		return
	}
	units.OnS2SPostback(w, r)
}

const base64GifPixel = "R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs="

func OnConversionPixel(w http.ResponseWriter, r *http.Request) {
	//TODO 去除重复的clickId和transactionId的conversions
	if r.Method != http.MethodGet {
		http.NotFound(w, r)
		return
	}
	units.OnConversionPixel(w, r)

	w.WriteHeader(http.StatusNoContent)

	/* 备忘
	w.Header().Set("Content-Type", "image/gif")
	output, _ := base64.StdEncoding.DecodeString(base64GifPixel)
	w.Write(output)
	*/
}

func OnConversionScript(w http.ResponseWriter, r *http.Request) {
	//TODO 去除重复的clickId和transactionId的conversions
	if r.Method != http.MethodGet {
		http.NotFound(w, r)
		return
	}
	units.OnConversionScript(w, r)

	w.WriteHeader(http.StatusNoContent)
}
