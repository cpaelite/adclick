package db

import (
	"database/sql"
	"fmt"
	"sync"

	"AdClickTool/Service/config"
	"AdClickTool/Service/log"

	_ "github.com/go-sql-driver/mysql"
)

const defaultMaxOpenConns = 100
const defaultMaxIdleConns = 100

var mux sync.Mutex
var dbSingletonMap = make(map[string]*sql.DB)

func GetDB(title string) (db *sql.DB) {
	mux.Lock()
	defer mux.Unlock()
	if db, ok := dbSingletonMap[title]; ok {
		return db
	}
	dbname := config.String(title, "dbname")
	host := config.String(title, "host")
	port := config.Int(title, "port")
	user := config.String(title, "user")
	pass := config.String(title, "pass")
	maxopen := config.Int(title, "max_open_conns")
	maxidle := config.Int(title, "max_idle_conns")

	db = connect(dbname, host, port, user, pass, maxopen, maxidle)
	if db != nil {
		if err := db.Ping(); err != nil {
			log.Errorf("NewDB %s failed:%s\n", title, err.Error())
			return nil
		}
	}
	dbSingletonMap[title] = db
	return
}

func connect(dbname string, host string, port int, user, pass string, maxopen, maxidle int) *sql.DB {
	dataSourceName := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8", user, pass, host, port, dbname)
	db, err := sql.Open("mysql", dataSourceName)
	if err != nil {
		log.Errorf("mysql(%s) connect error:%s\n", dbname, err.Error())
		return nil
	}
	if db == nil {
		log.Errorf("mysql(%s) connect error\n", dbname)
		return nil
	}

	if maxopen <= 0 {
		maxopen = defaultMaxOpenConns
	}
	db.SetMaxOpenConns(maxopen)
	if maxidle <= 0 {
		maxidle = defaultMaxIdleConns
	}
	db.SetMaxIdleConns(maxidle)

	if err = db.Ping(); err != nil {
		log.Errorf("mysql(%s) ping error:%s\n", dbname, err.Error())
		return nil
	} else {
		log.Infof("mysql(%s) connect success!", dbname)
	}
	return db

}
