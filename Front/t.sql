CREATE TABLE `Filters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `items` text NOT NULL COMMENT '所有filter的表达式 json stringify',
  `deleted` int(11) NOT NULL DEFAULT '0' COMMENT '0:未删除;1:已删除',
  PRIMARY KEY (`id`)
);

ALTER TABLE `TrafficSource`
ADD `token` varchar(128),
ADD `account` varchar(128),
ADD `password` varchar(128),
ADD `integrations` int(11) NOT NULL DEFAULT 0,
ADD `trafficTemplateId` int(11) NOT NULL DEFAULT 0;

ALTER TABLE `TrackingCampaign`
ADD `type` int(11) NOT NULL DEFAULT 0 COMMENT '0:TRACKING;1:DSP TRACKING',
ADD `status` int(11) NOT NULL DEFAULT 0 COMMENT '0:停止;1:运行',
ADD `bidPrice` BIGINT(64) NOT NULL DEFAULT 0 COMMENT 'max bid price 10e6$';
