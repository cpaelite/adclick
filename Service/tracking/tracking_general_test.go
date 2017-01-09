package tracking

import (
	"database/sql"
	"fmt"
	"math/rand"
	"testing"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

func TestTracking(t *testing.T) {
	// 初始化数据库
	user := "root"
	pass := ""
	host := "localhost"
	port := 3306
	dbname := "tracking"

	dataSourceName := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8", user, pass, host, port, dbname)
	t.Logf("connecting db...")
	db, err := sql.Open("mysql", dataSourceName)
	if err != nil {
		t.Errorf("mysql(%s) connect error:%s\n", dbname, err.Error())
		return
	}

	// 启动保存
	go Saving(db)

	// 启动汇总
	go Gathering()

	// 调用一些API
	apis1 := []func(key AdStatisKey, count int){
		AddVisit,
		AddClick,
		AddConversion,
	}

	apis2 := []func(key AdStatisKey, count float64){
		AddCost,
		AddPayout,
	}

	begin := time.Now()
	count := 100000
	for i := 0; i < count; i++ {
		key := randStatisKey()

		f1 := apis1[rand.Int()%len(apis1)]
		f2 := apis2[rand.Int()%len(apis2)]

		f1(key, 1)
		f2(key, 1.0)
	}
	end := time.Now()
	t.Logf("flush %v rows take:%v", count, end.Sub(begin))
	flushEvent <- struct{}{}
	time.Sleep(5 * time.Second)
}
