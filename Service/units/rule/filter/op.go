package filter

import (
	"regexp"
	"strconv"
	"strings"

	"AdClickTool/Service/request"
)

type OperationFunction func(key interface{}, expr interface{}, req request.Request) bool

var logicOpFunctions map[string]OperationFunction

var actionOpFunctions map[string]OperationFunction

func LOF(op string) OperationFunction {
	return logicOpFunctions[op]
}

func AOF(op string) OperationFunction {
	return actionOpFunctions[op]
}

// 目前逻辑操作符支持以下几种
// =,>,<,!=,>=,<=,in,not in,between,not between,has,any
func init() {
	logicOpFunctions = map[string]OperationFunction{
		"=": func(value interface{}, expr interface{}, req request.Request) bool {
			fv, _ := strconv.ParseFloat(value.(string), 64)
			switch expr.(type) {
			case string:
				return value.(string) == expr.(string)
			case float64:
				return fv == expr.(float64)
			default:
				return false
			}
		},
		">": func(value interface{}, expr interface{}, req request.Request) bool {
			fv, _ := strconv.ParseFloat(value.(string), 64)
			switch expr.(type) {
			case float64:
				return fv > expr.(float64)
			case string:
				fe, _ := strconv.ParseFloat(expr.(string), 64)
				return fv > fe
			default:
				return false
			}
		},
		"<": func(value interface{}, expr interface{}, req request.Request) bool {
			fv, _ := strconv.ParseFloat(value.(string), 64)
			switch expr.(type) {
			case float64:
				return fv < expr.(float64)
			case string:
				fe, _ := strconv.ParseFloat(expr.(string), 64)
				return fv < fe
			default:
				return false
			}
		},
		"!=": func(value interface{}, expr interface{}, req request.Request) bool {
			fv, _ := strconv.ParseFloat(value.(string), 64)
			switch expr.(type) {
			case float64:
				return fv != expr.(float64)
			case string:
				return value.(string) != expr.(string)
			default:
				return false
			}
		},
		">=": func(value interface{}, expr interface{}, req request.Request) bool {
			fv, _ := strconv.ParseFloat(value.(string), 64)
			switch expr.(type) {
			case float64:
				return fv >= expr.(float64)
			case string:
				fe, _ := strconv.ParseFloat(expr.(string), 64)
				return fv >= fe
			default:
				return false
			}
		},
		"<=": func(value interface{}, expr interface{}, req request.Request) bool {
			fv, _ := strconv.ParseFloat(value.(string), 64)
			switch expr.(type) {
			case float64:
				return fv <= expr.(float64)
			case string:
				fe, _ := strconv.ParseFloat(expr.(string), 64)
				return fv <= fe
			default:
				return false
			}
		},
		"in": func(value interface{}, expr interface{}, req request.Request) bool {
			//glog.V(5).Infof("v:%s, e:%s", value.(string), expr.(string))
			_, fnd := expr.(string)
			if !fnd {
				return false
			}

			ss := strings.Split(expr.(string), ",")
			for _, s := range ss {
				if s == value.(string) {
					return true
				}
				if strings.Contains(s, "..") {
					lh := strings.Split(s, "..")
					low, _ := strconv.Atoi(lh[0])
					high, _ := strconv.Atoi(lh[1])
					v, _ := strconv.Atoi(value.(string))
					if v >= low && v <= high {
						return true
					}
				}
			}
			return false
		},
		"not in": func(value interface{}, expr interface{}, req request.Request) bool {
			_, fnd := expr.(string)
			if !fnd {
				return false
			}

			ss := strings.Split(expr.(string), ",")
			for _, s := range ss {
				if s == value.(string) {
					return false
				}
				if strings.Contains(s, "..") {
					lh := strings.Split(s, "..")
					low, _ := strconv.Atoi(lh[0])
					high, _ := strconv.Atoi(lh[1])
					v, _ := strconv.Atoi(value.(string))
					if v >= low && v <= high {
						return false
					}
				}
			}
			return true
		},
		"~": func(value interface{}, expr interface{}, req request.Request) bool {
			_, fnd := expr.(string)
			if !fnd {
				return false
			}
			matched, err := regexp.MatchString(expr.(string), value.(string))
			return err == nil && matched
		},
		"between": func(value interface{}, expr interface{}, req request.Request) bool {
			_, fnd := expr.(string)
			if !fnd {
				return false
			}

			m, e := regexp.MatchString("^[0-9]+,[0-9]+$", expr.(string))
			if e == nil && m { // num
				ss := strings.Split(expr.(string), ",")
				low, _ := strconv.Atoi(ss[0])
				high, _ := strconv.Atoi(ss[1])
				v, _ := strconv.Atoi(value.(string))
				return v >= low && v <= high
			} else { // string
				ss := strings.Split(expr.(string), ",")
				if len(ss) != 2 {
					return false
				}
				return value.(string) >= ss[0] && value.(string) <= ss[1]
			}
		},
		"not between": func(value interface{}, expr interface{}, req request.Request) bool {
			_, fnd := expr.(string)
			if !fnd {
				return false
			}

			m, e := regexp.MatchString("^[0-9]+,[0-9]+$", expr.(string))
			if e == nil && m { // num
				ss := strings.Split(expr.(string), ",")
				low, _ := strconv.Atoi(ss[0])
				high, _ := strconv.Atoi(ss[1])
				v, _ := strconv.Atoi(value.(string))
				return v < low || v > high
			} else { // string
				ss := strings.Split(expr.(string), ",")
				if len(ss) != 2 {
					return false
				}
				return value.(string) < ss[0] || value.(string) > ss[1]
			}
		},

		"has": func(value interface{}, expr interface{}, req request.Request) bool {
			//glog.V(5).Infof("v:%s, e:%s", value.(string), expr.(string))
			_, fndList := value.(string)
			if !fndList {
				return false
			}

			_, fnd := expr.(string)
			if !fnd {
				return false
			}

			list := strings.Split(value.(string), ",")
			ss := strings.Split(expr.(string), ",")

			//  list has all items of ss
			for _, s := range ss {
				has := false
				for _, item := range list {
					if s == item {
						has = true
					}
				}
				if !has {
					return false
				}
			}
			return true
		},
		"any": func(value interface{}, expr interface{}, req request.Request) bool {
			//glog.V(5).Infof("v:%s, e:%s", value.(string), expr.(string))
			_, fndList := value.(string)
			if !fndList {
				return false
			}

			_, fnd := expr.(string)
			if !fnd {
				return false
			}

			list := strings.Split(value.(string), ",")
			ss := strings.Split(expr.(string), ",")

			//  list has one items of ss
			for _, s := range ss {
				for _, item := range list {
					if s == item {
						return true
					}
				}
			}
			return false
		},
	}

	// AdClick中不需要action，所以注释掉
	//TODO 重构时删除
	actionOpFunctions = map[string]OperationFunction{
	/*
		"=": func(value interface{}, expr interface{}, req request.Request) bool {
			if vs, ok := value.(string); ok {
				if !req.Set(vs, expr) {
					log.Errorf("assign %s to %+#v failed\n", vs, expr)
					return false
				}
				log.Debugf("assign %s to %+#v success\n", vs, expr)
				return true
			} else {
				log.Errorf("assign failed because value(%+#v) is not string\n", value)
			}
			return false
		},
		"+": func(value interface{}, expr interface{}, req request.Request) bool {
			if vs, ok := value.(string); ok {
				if !req.Set(vs, expr) {
					log.Errorf("append %s to %+#v failed\n", vs, expr)
					return false
				}
				return true
			} else {
				log.Errorf("append failed because value(%+#v) is not string\n", value)
			}
			return false
		},
		"-": func(value interface{}, expr interface{}, req request.Request) bool {
			if vs, ok := expr.(string); ok {
				keys := strings.Split(vs, ",")
				if !req.Del(keys) {
					log.Errorf("remove %+#v failed\n", vs, expr)
					return false
				}
				return true
			} else {
				log.Errorf("remove failed because value(%+#v) is not string\n", expr)
			}
			return false
		},
	*/
	}
}
