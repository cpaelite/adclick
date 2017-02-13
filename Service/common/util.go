package common

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

func GetUerIdText(r *http.Request) string {
	if r == nil {
		return ""
	}
	return strings.Split(r.Host, ".")[0]
}
func GetCampaignHash(r *http.Request) string {
	if r == nil {
		return ""
	}
	s := strings.Split(r.URL.Path, "/")
	if len(s) == 0 {
		return ""
	}
	return s[len(s)-1]
}

func HostPath(r *http.Request) string {
	return r.Host + r.RequestURI
}
func SchemeHost(r *http.Request) string {
	scheme := r.URL.Scheme
	if scheme == "" {
		if r.TLS == nil {
			scheme = "http"
		} else {
			scheme = "https"
		}
	}
	return scheme + "://" + r.Host
}
func SchemeHostPath(r *http.Request) string {
	scheme := r.URL.Scheme
	if scheme == "" {
		if r.TLS == nil {
			scheme = "http"
		} else {
			scheme = "https"
		}
	}
	return scheme + "://" + r.Host + r.URL.Path
}
func SchemeHostURI(r *http.Request) string {
	scheme := r.URL.Scheme
	if scheme == "" {
		if r.TLS == nil {
			scheme = "http"
		} else {
			scheme = "https"
		}
	}
	return scheme + "://" + r.Host + r.RequestURI
}

func GenRandId() string {
	//TODO 生成全局唯一id，加上机器mac地址？
	s := fmt.Sprintf("%d%s", time.Now().UnixNano(), randString(6))

	md5h := md5.New()
	md5h.Write([]byte(s))
	cipherStr := md5h.Sum(nil)

	return hex.EncodeToString(cipherStr)
}

func GenUUID(n uint, params ...string) (rs string) {
	s := randString(4)
	for _, param := range params {
		s += param
	}
	md5h := md5.New()
	md5h.Write([]byte(s))
	cipherByte := md5h.Sum(nil)

	rs = hex.EncodeToString(cipherByte)
	if len(rs) < 32 {
		rs += randString(32 - len(rs))
	}
	return rs[:8] + "-" + rs[8:16] + "-" + rs[16:24] + "-" + rs[24:32]
}

func randString(n int) string {
	var letterBytes = []byte("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

	b := make([]byte, n)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}
	return string(b)
}
