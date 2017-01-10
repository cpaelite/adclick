CREATE TABLE `AdStatis` (
  `UserID` int(11) DEFAULT NULL COMMENT '用户ID',
  `CampaignID` int(11) DEFAULT NULL COMMENT 'Campaign的ID',
  `FlowID` int(11) DEFAULT NULL COMMENT 'Flow的ID',
  `LanderID` int(11) DEFAULT NULL COMMENT 'Lander的ID',
  `OfferID` int(11) DEFAULT NULL COMMENT 'Offer的ID',
  `TrafficSourceID` int(11) DEFAULT NULL COMMENT 'TrafficSource的ID',
  `Language` varchar(20) DEFAULT NULL COMMENT '语言，如：English',
  `Model` varchar(45) DEFAULT NULL COMMENT '手机型号，如Samsung Galaxy S4',
  `Country` varchar(40) DEFAULT NULL COMMENT '国家，如Canada',
  `City` varchar(45) DEFAULT NULL COMMENT '城市，如Toronto',
  `Region` varchar(45) DEFAULT NULL COMMENT '地区，如California',
  `ISP` varchar(64) DEFAULT NULL COMMENT 'ISP或者Carrier，互联网服务提供商，如Bell Canada',
  `Domain` varchar(45) DEFAULT NULL COMMENT 'Referer Domain，如onclkds.com',
  `Brand` varchar(32) DEFAULT NULL COMMENT '设备品牌，如Samsung',
  `OS` varchar(16) DEFAULT NULL COMMENT '系统类型，如',
  `OSVersion` varchar(32) DEFAULT NULL COMMENT '系统版本号，如Android 6.0',
  `Browser` varchar(32) DEFAULT NULL COMMENT '浏览器，如Chrome Mobile',
  `BrowserVersion` varchar(64) DEFAULT NULL COMMENT '浏览器版本号，如Chrome Mobile 55',
  `ConnectionType` varchar(16) DEFAULT NULL COMMENT '网络连接类型，Broadband, Cable, Xdsl, Mobile, Satellite',
  `Timestamp` bigint(22) DEFAULT NULL COMMENT 'unix时间戳，精确到小时，如1483869600',
  `Visits` int(11) DEFAULT NULL COMMENT '累计的展示次数',
  `Clicks` int(11) DEFAULT NULL COMMENT '累计的点击次数',
  `Conversions` int(11) DEFAULT NULL COMMENT '累计的成功转换次数',
  `Cost` double DEFAULT NULL COMMENT '累计的开销',
  `Payout` double DEFAULT NULL COMMENT '累计的收益',
  `KeysMD5` char(32) DEFAULT NULL COMMENT '`UserID`, `CampaignID`, `FlowID`, `LanderID`, `OfferID`, `TrafficSourceID`, `Language`, `Model`, `Country`, `City`, `Region`, `ISP`, `Domain`, `Brand`, `OS`, `OSVersion`, `Brower`, `BrowerVersion`, `ConnectionType`, `Timestamp` 这些字段用,拼接到一块儿之后算出来的MD5',
  UNIQUE KEY `md5_unique_key` (`KeysMD5`),
  KEY `index_for_select` (`UserID`,`Timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;





-- CREATE TABLE `CampaignsStatis` (
--     `userid` int(11) NOT NULL COMMENT '指向 User.id',
--     `timeStamp` bigint(20) NOT NULL COMMENT 'hourly time stamp',
--     `compaignID` int(11) NOT NULL COMMENT '指向 StatisCampaign.id',
    
--     `visits` int(11) NOT NULL DEFAULT 0,
--     `clicks` int(11) NOT NULL DEFAULT 0,
--     `conversions` int(11) NOT NULL DEFAULT 0,
--     `cost` double NOT NULL DEFAULT 0,
--     `payout` double NOT NULL DEFAULT 0, -- Payout is the revenue amount de ned for each conversion.
--     `errors` int(11) NOT NULL DEFAULT 0,
--     UNIQUE KEY `idx_timeStamp_compainID`(`userid`, `timeStamp`, `compaignID`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- CREATE TABLE `FlowsStatis` (
-- 	`id` int(11) NOT NULL AUTO_INCREMENT COMMENT '流水ID',
--     `userid` int(11) NOT NULL COMMENT '指向 User.id',
--     `timeStamp` bigint(20) NOT NULL COMMENT 'hourly time stamp',
--     `flowID` int(11) NOT NULL COMMENT '指向 Flow.id',
    
--     `visits` int(11) NOT NULL DEFAULT 0,
--     `clicks` int(11) NOT NULL DEFAULT 0,
--     `conversions` int(11) NOT NULL DEFAULT 0,
--     `cost` double NOT NULL DEFAULT 0,
--     `payout` double NOT NULL DEFAULT 0,
--     `errors` int(11) NOT NULL DEFAULT 0,
--     PRIMARY KEY (`id`),
--     UNIQUE KEY `idx_timeStamp_flowID`(`userid`, `timeStamp`, `flowID`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- CREATE TABLE `LandersStatis` (
-- 	`id` int(11) NOT NULL AUTO_INCREMENT COMMENT '流水ID',
-- 	`userid` int(11) NOT NULL COMMENT '指向 User.id',
--     `timeStamp` bigint(20) NOT NULL COMMENT 'hourly time stamp',
--     `landerID` int(11) NOT NULL COMMENT '指向 Lander.id',
    
--     `visits` int(11) NOT NULL DEFAULT 0,
--     `clicks` int(11) NOT NULL DEFAULT 0,
--     `conversions` int(11) NOT NULL DEFAULT 0,
--     `cost` double NOT NULL DEFAULT 0,
--     `payout` double NOT NULL DEFAULT 0,
--     `errors` int(11) NOT NULL DEFAULT 0,
--     PRIMARY KEY (`id`),
--     UNIQUE KEY `idx_timeStamp_landerID`(`userid`, `timeStamp`, `landerID`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- CREATE TABLE `OffersStatis` (
-- 	`id` int(11) NOT NULL AUTO_INCREMENT COMMENT '流水ID',
--     `userid` int(11) NOT NULL COMMENT '指向 User.id',
--     `timeStamp` bigint(20) NOT NULL COMMENT 'hourly time stamp',
--     `offerID` int(11) NOT NULL COMMENT '指向 Offer.id',
    
--     `visits` int(11) NOT NULL DEFAULT 0,
--     `clicks` int(11) NOT NULL DEFAULT 0,
--     `conversions` int(11) NOT NULL DEFAULT 0,
--     `cost` double NOT NULL DEFAULT 0,
--     `payout` double NOT NULL DEFAULT 0,
--     `errors` int(11) NOT NULL DEFAULT 0,
--     PRIMARY KEY (`id`),
--     UNIQUE KEY `idx_timeStamp_offerID`(`userid`, `timeStamp`, `offerID`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- CREATE TABLE `TrafficSourcesStatis` (
-- 	`id` int(11) NOT NULL AUTO_INCREMENT COMMENT '流水ID',
--     `userid` int(11) NOT NULL COMMENT '指向 User.id',
--     `timeStamp` bigint(20) NOT NULL COMMENT 'hourly time stamp',
--     `trafficSourceID` int(11) NOT NULL COMMENT '指向 TrafficSource.id',
    
--     `visits` int(11) NOT NULL DEFAULT 0,
--     `clicks` int(11) NOT NULL DEFAULT 0,
--     `conversions` int(11) NOT NULL DEFAULT 0,
--     `cost` double NOT NULL DEFAULT 0,
--     `payout` double NOT NULL DEFAULT 0,
--     `errors` int(11) NOT NULL DEFAULT 0,
--     PRIMARY KEY (`id`),
--     UNIQUE KEY `idx_timeStamp_trafficSourceID`(`userid`, `timeStamp`, `trafficSourceID`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- CREATE TABLE `AffiliateNetworksStatis` (
-- 	`id` int(11) NOT NULL AUTO_INCREMENT COMMENT '流水ID',
--     `userid` int(11) NOT NULL COMMENT '指向 User.id',
--     `timeStamp` bigint(20) NOT NULL COMMENT 'hourly time stamp',
--     `affilicateNetworkID` int(11) NOT NULL COMMENT '指向 AffilicateNetwork.id',
    
--     `visits` int(11) NOT NULL DEFAULT 0,
--     `clicks` int(11) NOT NULL DEFAULT 0,
--     `conversions` int(11) NOT NULL DEFAULT 0,
--     `cost` double NOT NULL DEFAULT 0,
--     `payout` double NOT NULL DEFAULT 0,
--     `errors` int(11) NOT NULL DEFAULT 0,
--     PRIMARY KEY (`id`),
--     UNIQUE KEY `idx_timeStamp_affilicateNetwork`(`userid`, `timeStamp`, `affilicateNetworkID`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


