CREATE TABLE `Filters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `name` varchar(256) NOT NULL,
  `items` text NOT NULL COMMENT '所有filter的表达式 json stringify',
  `deleted` int(11) NOT NULL DEFAULT '0' COMMENT '0:未删除;1:已删除',
  PRIMARY KEY (`id`)
)
