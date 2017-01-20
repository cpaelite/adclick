package rule

import (
	"AdClickTool/Service/db"
	"AdClickTool/Service/log"
	"database/sql"
)

// dbgetter 默认的拿数据库的东西
// 方便测试的地方替换这个接口
var dbgetter = func() *sql.DB {
	return db.GetDB("DB")
}

// 都是获取deleted=0的记录

func DBGetAvailableRules() []RuleConfig {
	d := dbgetter()
	sql := "SELECT id, userId, json, status, `type` FROM Rule WHERE deleted=0"
	rows, err := d.Query(sql)
	if err != nil {
		log.Errorf("[rule][DBGetAvailableRules]Query: %s failed:%v", sql, err)
		return nil
	}
	defer rows.Close()

	var c RuleConfig
	var arr []RuleConfig
	for rows.Next() {
		if err := rows.Scan(&c.Id, &c.UserId, &c.Json, &c.Status, &c.Type); err != nil {
			log.Errorf("[rule][DBGetAvailableRules] scan failed:%v", err)
			return nil
		}
		arr = append(arr, c)
	}
	return arr
}

func DBGetUserRules(userId int64) []RuleConfig {
	d := dbgetter()
	sql := "SELECT id, userId, json, status, `type` FROM Rule WHERE userId=? AND deleted=0"
	rows, err := d.Query(sql, userId)
	if err != nil {
		log.Errorf("[rule][DBGetUserRules]Query: %s failed:%v", sql, err)
		return nil
	}
	defer rows.Close()

	var c RuleConfig
	var arr []RuleConfig
	for rows.Next() {
		if err := rows.Scan(&c.Id, &c.UserId, &c.Json, &c.Status, &c.Type); err != nil {
			log.Errorf("[rule][DBGetUserRules] scan failed:%v", err)
			return nil
		}
		arr = append(arr, c)
	}
	return arr
}

func DBGetRule(ruleId int64) (c RuleConfig) {
	d := dbgetter()
	sql := "SELECT id, userId, json, status, `type` FROM Rule WHERE id=?"
	row := d.QueryRow(sql, ruleId)

	if err := row.Scan(&c.Id, &c.UserId, &c.Json, &c.Status, &c.Type); err != nil {
		log.Errorf("[rule][DBGetRule] ruleId:%v scan failed:%v", ruleId, err)
		return
	}
	return
}

func DBGetRulePaths(ruleId int64) (paths []RulePath) {
	d := dbgetter()
	sql := "SELECT pathId, weight, status FROM Path2Rule WHERE ruleId = ? AND deleted=0"
	rows, err := d.Query(sql, ruleId)
	if err != nil {
		log.Errorf("[rule][DBGetRulePaths]Query sql:%v failed:%v", sql, err)
		return
	}
	defer rows.Close()

	var rp RulePath
	for rows.Next() {
		err = rows.Scan(&rp.PathId, &rp.Weight, &rp.Status)
		if err != nil {
			log.Errorf("[rule][DBGetRulePaths]Scan RulePath failed:%v", err)
			return nil
		}
	}
	return paths
}
