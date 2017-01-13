package rule

// 都是获取deleted=0的记录

func DBGetAvailableRules() []RuleConfig {
	return nil
}

func DBGetUserRules(userId int64) []RuleConfig {
	return nil
}

func DBGetRule(ruleId int64) (c RuleConfig) {
	return
}

func DBGetRulePaths(ruleId int64) (paths []RulePath) {
	return
}
