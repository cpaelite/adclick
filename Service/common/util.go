package common

import (
	"net/http"
	"strings"
)

func GetUerIdText(r *http.Request) string {
	if r == nil {
		return ""
	}
	return strings.Split(r.Host, ".")[0]
}
