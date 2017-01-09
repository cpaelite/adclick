CREATE TABLE AdClickTool.`User` (
  `id` int(11) NOT NULL,
  `idText` varchar(8) NOT NULL COMMENT '用在click,postback等url中，用于区别用户',
  `username` varchar(256) NOT NULL,
  `password` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idText` (`idText`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE AdClickTool.`TrackingCampaign` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `url` varchar(512) NOT NULL COMMENT '根据campaign内容生成的tracking url',
  `impPixelUrl` varchar(512) NOT NULL DEFAULT '',
  `trafficSourceId` int(11) NOT NULL,
  `country` varchar(3) NOT NULL DEFAULT '' COMMENT 'ISO-ALPHA-3',
  `costModel` int(11) NOT NULL COMMENT 'Do-not-track-costs, cpc, cpa, cpm, auto?',
  `costValue` decimal(10,5) NOT NULL DEFAULT 0,
  `dstFlowId` int(11) NOT NULL,
  `dstUrl` varchar(512) NOT NULL DEFAULT '',
  `status` int(11) NOT NULL COMMENT '0:停止;1:运行',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户生成的每个Campaign的配置信息';

CREATE TABLE AdClickTool.`Flow` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `country` varchar(3) NOT NULL DEFAULT '' COMMENT 'ISO-ALPHA-3',
  `type` int(11) NOT NULL COMMENT '0:匿名;1:普通(标示Campaign里选择Flow时是否可见)',
  `redirectMode` int(11) NOT NULL COMMENT '0:302;1:Meta refresh;2:Double meta refresh',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户生成的每个Flow的配置信息';

CREATE TABLE AdClickTool.`Rule` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `type` int(11) NOT NULL COMMENT '0:匿名;1:普通(标示是否是Flow里默认Path的Rule)',
  `json` text NOT NULL COMMENT '按照既定规则生成的rule信息',
  `status` int(11) NOT NULL COMMENT '0:停止;1:运行;用来标记该Rule本身是否有效',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户生成的每个Rule的配置信息';

CREATE TABLE AdClickTool.`Rule2Flow` (
  `userId` int(11) NOT NULL,
  `ruleId` int(11) NOT NULL COMMENT '必须非0',
  `flowId` int(11) NOT NULL COMMENT '必须非0',
  `status` int(11) NOT NULL COMMENT '0:停止;1:运行;用来标记Rule在特定Flow中是否有效',
  PRIMARY KEY (`userId`,`flowId`,`ruleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE AdClickTool.`Path` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `redirectMode` int(11) NOT NULL COMMENT '0:302;1:Meta refresh;2:Double meta refresh',
  `directLink` int(11) NOT NULL COMMENT '0:No;1:Yes',
  `status` int(11) NOT NULL COMMENT '0:停止;1:运行;用来标记该Path本身是否有效',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户生成的每个Path的配置信息';

CREATE TABLE AdClickTool.`Path2Rule` (
  `userId` int(11) NOT NULL,
  `pathId` int(11) NOT NULL COMMENT '必须非0',
  `ruleId` int(11) NOT NULL COMMENT '必须非0',
  `weight` int(11) NOT NULL COMMENT '>0',
  `status` int(11) NOT NULL COMMENT '0:停止;1:运行;用来标记Path在特定Rule中是否有效',
  PRIMARY KEY (`userId`,`ruleId`,`pathId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE AdClickTool.`Lander` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `url` varchar(512) NOT NULL,
  `country` varchar(3) NOT NULL DEFAULT '' COMMENT 'ISO-ALPHA-3',
  `numberOfOffers` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户生成的每个Lander的配置信息';

CREATE TABLE AdClickTool.`Lander2Path` (
  `userId` int(11) NOT NULL,
  `landerId` int(11) NOT NULL COMMENT '必须非0',
  `pathId` int(11) NOT NULL COMMENT '必须非0',
  `weight` int(11) NOT NULL COMMENT '>0',
  PRIMARY KEY (`userId`,`landerId`,`pathId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE AdClickTool.`Offer` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `url` varchar(512) NOT NULL,
  `country` varchar(3) NOT NULL DEFAULT '' COMMENT 'ISO-ALPHA-3',
  `AffiliateNetworkId` int(11) NOT NULL COMMENT '标记属于哪家AffiliateNetwork',
  `postbackUrl` varchar(512) NOT NULL,
  `payoutMode` int(11) NOT NULL COMMENT '0:Auto;1:Manual',
  `payoutValue` decimal(10,5) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户生成的每个Lander的配置信息';

CREATE TABLE AdClickTool.`Offer2Path` (
  `userId` int(11) NOT NULL,
  `offerId` int(11) NOT NULL COMMENT '必须非0',
  `pathId` int(11) NOT NULL COMMENT '必须非0',
  `weight` int(11) NOT NULL COMMENT '>0',
  PRIMARY KEY (`userId`,`offerId`,`pathId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE AdClickTool.`Tags` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `type` int(11) NOT NULL COMMENT '1:Campaign;2:Lander;3:Offer',
  `targetId` int(11) NOT NULL COMMENT '必须非0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE AdClickTool.`TrafficSource` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `postbackUrl` varchar(512) NOT NULL,
  `pixelRedirectUrl` varchar(512) NOT NULL,
  `impTracking` int(11) NOT NULL COMMENT '0:No;1:Yes',
  `externalId` varchar(124) NOT NULL COMMENT '按照既定规则生成的ExternalId params信息:Parameter,Placeholder,Name',
  `cost` varchar(124) NOT NULL COMMENT '按照既定规则生成的Cost params信息:Parameter,Placeholder,Name',
  `params` text NOT NULL COMMENT '按照既定规则生成的params信息:{Key:Value}',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE AdClickTool.`TemplateTrafficSource` (
  `id` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `postbackUrl` varchar(512) NOT NULL DEFAULT '',
  `pixelRedirectUrl` varchar(512) NOT NULL DEFAULT '',
  `externalId` varchar(124) NOT NULL COMMENT '按照既定规则生成的ExternalId params信息:Parameter,Placeholder,Name',
  `cost` varchar(124) NOT NULL COMMENT '按照既定规则生成的Cost params信息:Parameter,Placeholder,Name',
  `params` text NOT NULL COMMENT '按照既定规则生成的params信息:{Parameter,Placeholder,Name,Track(0,1)}',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE AdClickTool.`AffiliateNetwork` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `postbackUrl` varchar(512) NOT NULL DEFAULT '',
  `appendClickId` int(11) NOT NULL COMMENT '0:No;1:Yes',
  `duplicatedPostback` int(11) NOT NULL COMMENT '0:No;1:Yes',
  `ipWhiteList` text NOT NULL COMMENT 'IP白名单，数组存储成JSON',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE AdClickTool.`TemplateAffiliateNetwork` (
  `id` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `postbackParams` text NOT NULL COMMENT '回调url中参数的写法:{cid:%subid1%;p:%commission%}',
  `desc` text NOT NULL COMMENT '关于该AfflicateNetwork的描述，HTML',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
