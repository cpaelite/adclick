package flow

import (
	"AdClickTool/Service/db"
	"AdClickTool/Service/log"
	"AdClickTool/Service/units/rule"
	"database/sql"
)

// dbgetter 默认的拿数据库的东西
// 方便测试的地方替换这个接口
var dbgetter = func() *sql.DB {
	return db.GetDB("DB")
}

func DBGetAllFlows() []FlowConfig {
	return nil
}

func DBGetAvailableFlows() []FlowConfig {
	d := dbgetter()
	sql := "SELECT id, userId, redirectMode FROM Flow WHERE deleted=0"
	rows, err := d.Query(sql)
	if err != nil {
		log.Errorf("[flow][DBGetAvailableFlows]Query: %s failed:%v", sql, err)
		return nil
	}

	var c FlowConfig
	var arr []FlowConfig
	for rows.Next() {
		if err := rows.Scan(&c.Id, &c.UserId, &c.RedirectMode); err != nil {
			log.Errorf("[lander][DBGetAvailableFlows] scan failed:%v", err)
			return nil
		}
		arr = append(arr, c)
	}
	return arr
}

func DBGetUserFlows(userId int64) []FlowConfig {
	d := dbgetter()
	sql := "SELECT id, userId, redirectMode FROM Flow WHERE userId=? AND deleted=0"
	rows, err := d.Query(sql, userId)
	if err != nil {
		log.Errorf("[flow][DBGetUserFlows]Query: %s with userId:%v failed:%v", sql, userId, err)
		return nil
	}

	var c FlowConfig
	var arr []FlowConfig
	for rows.Next() {
		if err := rows.Scan(&c.Id, &c.UserId, &c.RedirectMode); err != nil {
			log.Errorf("[lander][DBGetUserFlows] scan failed:%v", err)
			return nil
		}
		arr = append(arr, c)
	}
	return arr
}

func DBGetFlow(flowId int64) (c FlowConfig) {
	d := dbgetter()
	sql := "SELECT id, userId, redirectMode FROM Flow WHERE flowId=?"
	row := d.QueryRow(sql, flowId)

	if err := row.Scan(&c.Id, &c.UserId, &c.RedirectMode); err != nil {
		log.Errorf("[lander][DBGetUserFlows] scan failed:%v", err)
		return c
	}
	return c
}

func DBGetFlowRuleIds(flowId int64) (defaultRuleId FlowRule, ruleIds []FlowRule) {
	d := dbgetter()
	sql := "SELECT ruleId, status FROM Rule2Flow WHERE flowId=? AND deleted=0"

	rows, err := d.Query(sql, flowId)
	if err != nil {
		log.Errorf("[flow][DBGetFlowRuleIds]Query: %s with flowId:%v failed:%v", sql, flowId, err)
		return
	}

	var c FlowRule
	for rows.Next() {
		if err := rows.Scan(&c.RuleId, &c.Status); err != nil {
			log.Errorf("[flow][DBGetFlowRuleIds] scan failed:%v", err)
			return
		}
		ruleIds = append(ruleIds, c)
	}

	// 从中找出哪个是default的
	for idx, fr := range ruleIds {
		r := rule.DBGetRule(fr.RuleId)
		if r.Type == 0 {
			defaultRuleId = fr
			ruleIds = append(ruleIds[0:idx], ruleIds[idx+1:]...)
			break
		}
	}
	return
}
