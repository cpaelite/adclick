package timezone

import (
	"regexp"
	"strconv"
	"strings"
	"time"

	"AdClickTool/Service/log"
)

var reg = regexp.MustCompile(`^(\+|\-)((0[0-9]|10|11)\:[0-5][0-9]|12\:00)$`)

func offsetValid(offset string) bool {
	return reg.Match([]byte(offset))
}

// offset:+08:00/+05:45/-08:00
// return:seconds east of UTC
func zoneOffset(offset string) int {
	ts := strings.Split(offset[1:], ":")
	var h, m int64
	var err error
	if h, err = strconv.ParseInt(ts[0], 10, 64); err != nil {
		log.Errorf("zoneOffset(%s) hour error:%s\n", offset, err.Error())
		return 0
	}
	if m, err = strconv.ParseInt(ts[1], 10, 64); err != nil {
		log.Errorf("zoneOffset(%s) minute error:%s\n", offset, err.Error())
		return 0
	}
	os := (h*60 + m) * 60
	if strings.HasPrefix(offset, "-") {
		return int(os * -1)
	}
	return int(os)
}

func TimeInZone(t time.Time, zoneName, offset string) (zt time.Time) {
	if !offsetValid(offset) {
		return t
	}

	return t.In(time.FixedZone(zoneName, zoneOffset(offset)))
}
