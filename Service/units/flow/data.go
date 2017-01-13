package flow

func DBGetAllFlows() []FlowConfig {
	return nil
}

func DBGetAvailableFlows() []FlowConfig {
	return nil
}

func DBGetUserFlows(userId int64) []FlowConfig {
	return nil
}

func DBGetFlow(flowId int64) (c FlowConfig) {
	return
}

func DBGetFlowRuleIds(flowId int64) (defaultRuleId FlowRule, ruleIds []FlowRule) {
	return
}
