package common

import (
	"fmt"
	"strconv"
	"strings"
)

const (
	UrlTokenClickId       = "cid"
	UrlTokenPayout        = "payout"
	UrlTokenTransactionId = "txid"
)

// TrafficSourceParams {"Parameter":"X","Placeholder":"X","Name":"X","Track":N(0,1)}
type TrafficSourceParams struct {
	Parameter   string
	Placeholder string
	Name        string
	Track       int64
}

func (p TrafficSourceParams) Encode() string {
	return fmt.Sprintf("%s:%s:%s:%d",
		p.Name,
		p.Parameter,
		p.Placeholder,
		p.Track)
}

func (p *TrafficSourceParams) Decode(str string) {
	if str == "" {
		return
	}
	s := strings.Split(str, ":")
	if len(s) >= 4 {
		p.Parameter = s[0]
		p.Placeholder = s[1]
		p.Name = s[2]
		p.Track, _ = strconv.ParseInt(s[3], 10, 64)
	}
}

func EncodeParams(params []TrafficSourceParams) (str string) {
	for _, p := range params {
		str = str + ";" + p.Encode()
	}
	return
}

func DecodeParams(str string) (params []TrafficSourceParams) {
	for _, s := range strings.Split(str, ";") {
		var p TrafficSourceParams
		p.Decode(s)
		params = append(params, p)
	}
	return
}
