export default function (sequelize, DataTypes) {
    let model = sequelize.define('AdStatisReport', {
        UserID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        CampaignID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        CampaignName: {
            type: DataTypes.STRING(256),
            defaultValue: ''
        },
        FlowID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        FlowName: {
            type: DataTypes.STRING(256),
            defaultValue: ''
        },
        LanderID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        LanderName: {
            type: DataTypes.STRING(256),
            defaultValue: ''
        },
        OfferID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        OfferName: {
            type: DataTypes.STRING(256),
            defaultValue: ''
        },
        OfferUrl: {
            type: DataTypes.STRING(256),
            defaultValue: ''
        },
        OfferCountry: {
            type: DataTypes.STRING(40),
            defaultValue: ''
        },
        AffiliateNetworkID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        AffilliateNetworkName: {
            type: DataTypes.STRING(256),
            defaultValue: ''
        },
        TrafficSourceID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        TrafficSourceName: {
            type: DataTypes.STRING(256)
        },
        Language: {
            type: DataTypes.STRING(20)
        },
        model: {
            type: DataTypes.STRING(45)
        },
        Country: {
            type: DataTypes.STRING(40)
        },
        City: {
            type: DataTypes.STRING(45)
        },
        Region: {
            type: DataTypes.STRING(45)
        },
        ISP: {
            type: DataTypes.STRING(64)
        },
        MobileCarrier: {
            type: DataTypes.STRING(64)
        },
        Domain: {
            type: DataTypes.STRING(45)
        },
        DeviceType: {
            type: DataTypes.STRING(16),
            defaultValue: ''
        },
        Brand: {
            type: DataTypes.STRING(32)
        },
        OS: {
            type: DataTypes.STRING(16)
        },
        OSVersion: {
            type: DataTypes.STRING(32)
        },
        Browser: {
            type: DataTypes.STRING(32)
        },
        BrowserVersion: {
            type: DataTypes.STRING(64)
        },
        ConnectionType: {
            type: DataTypes.STRING(16)
        },
        Timestamp: {
            type: DataTypes.BIGINT(22),
            primaryKey: true
        },
        Visits: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        Clicks: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        Conversions: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        Cost: {
            type: DataTypes.BIGINT(20),
            defaultValue: 0,
            allowNull: false
        },
        Revenue: {
            type: DataTypes.BIGINT(20),
            defaultValue: 0,
            allowNull: false
        },
        Impressions: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        KeysMD5: {
            type: DataTypes.CHAR(32),
            defaultValue: '',
            unique: true
        },
        V1: {
            type: DataTypes.STRING(255),
            defaultValue: 0
        },
        V2: {
            type: DataTypes.STRING(255),
            defaultValue: 0
        },
        V3: {
            type: DataTypes.STRING(255),
            defaultValue: 0
        },
        V4: {
            type: DataTypes.STRING(255),
            defaultValue: 0
        },
        V5: {
            type: DataTypes.STRING(255),
            defaultValue: 0
        },
        V6: {
            type: DataTypes.STRING(255),
            defaultValue: 0
        },
        V7: {
            type: DataTypes.STRING(255),
            defaultValue: 0
        },
        V8: {
            type: DataTypes.STRING(255),
            defaultValue: 0
        },
        V9: {
            type: DataTypes.STRING(255),
            defaultValue: 0
        },
        V10: {
            type: DataTypes.STRING(255),
            defaultValue: 0
        },
        tsCampaignId: {
            type: DataTypes.STRING(255),
            defaultValue: 0
        },
        tsWebsiteId: {
            type: DataTypes.STRING(255),
            defaultValue: 0
        }
    }, {
            tableName: 'adstatis',
            timestamps: false
        })
    return model
}





// CREATE TABLE `adstatis` (
//   `UserID` int(11) NOT NULL COMMENT '用户ID',
//   `CampaignID` int(11) NOT NULL COMMENT 'Campaign的ID',
//   `CampaignName` varchar(256) DEFAULT '',
//   `FlowID` int(11) NOT NULL DEFAULT '0' COMMENT 'Flow的ID',
//   `FlowName` varchar(256) DEFAULT '',
//   `LanderID` int(11) NOT NULL DEFAULT '0' COMMENT 'Lander的ID',
//   `LanderName` varchar(256) DEFAULT '',
//   `OfferID` int(11) NOT NULL DEFAULT '0' COMMENT 'Offer的ID',
//   `OfferName` varchar(256) DEFAULT '',
//   `OfferUrl` varchar(256) DEFAULT '',
//   `OfferCountry` varchar(40) DEFAULT '',
//   `AffiliateNetworkID` int(11) NOT NULL DEFAULT '0',
//   `AffilliateNetworkName` varchar(256) DEFAULT '',
//   `TrafficSourceID` int(11) NOT NULL DEFAULT '0' COMMENT 'TrafficSource的ID',
//   `TrafficSourceName` varchar(256) DEFAULT NULL,
//   `Language` varchar(20) DEFAULT NULL COMMENT '语言，如：English',
//   `Model` varchar(45) DEFAULT NULL COMMENT '手机型号，如Samsung Galaxy S4',
//   `Country` varchar(40) DEFAULT NULL COMMENT '国家，如Canada',
//   `City` varchar(45) DEFAULT NULL COMMENT '城市，如Toronto',
//   `Region` varchar(45) DEFAULT NULL COMMENT '地区，如California',
//   `ISP` varchar(64) DEFAULT NULL COMMENT 'ISP或者Carrier，互联网服务提供商，如Bell Canada',
//   `MobileCarrier` varchar(64) DEFAULT NULL COMMENT '移动运营商',
//   `Domain` varchar(45) DEFAULT NULL COMMENT 'Referer Domain，如onclkds.com',
//   `DeviceType` varchar(16) DEFAULT '' COMMENT 'Mobile Phone, Desktop, Unknown, Tablet',
//   `Brand` varchar(32) DEFAULT NULL COMMENT '设备品牌，如Samsung',
//   `OS` varchar(16) DEFAULT NULL COMMENT '系统类型，如',
//   `OSVersion` varchar(32) DEFAULT NULL COMMENT '系统版本号，如Android 6.0',
//   `Browser` varchar(32) DEFAULT NULL COMMENT '浏览器，如Chrome Mobile',
//   `BrowserVersion` varchar(64) DEFAULT NULL COMMENT '浏览器版本号，如Chrome Mobile 55',
//   `ConnectionType` varchar(16) DEFAULT NULL COMMENT '网络连接类型，Broadband, Cable, Xdsl, Mobile, Satellite',
//   `Timestamp` bigint(22) DEFAULT NULL COMMENT 'unix时间戳，精确到小时，如1483869600',
//   `Visits` int(11) NOT NULL DEFAULT '0' COMMENT '累计的展示次数',
//   `Clicks` int(11) NOT NULL DEFAULT '0' COMMENT '累计的点击次数',
//   `Conversions` int(11) NOT NULL DEFAULT '0' COMMENT '累计的成功转换次数',
//   `Cost` bigint(20) NOT NULL DEFAULT '0' COMMENT '累计的开销(实际的值x1000000)',
//   `Revenue` bigint(20) NOT NULL DEFAULT '0' COMMENT '累计的收益(实际的值x1000000)',
//   `Impressions` int(11) NOT NULL DEFAULT '0',
//   `KeysMD5` char(32) DEFAULT '' COMMENT '`UserID`, `CampaignID`, `FlowID`, `LanderID`, `OfferID`, `TrafficSourceID`, `Language`, `Model`, `Country`, `City`, `Region`, `ISP`, `Domain`, `Brand`, `OS`, `OSVersion`, `Brower`, `BrowerVersion`, `ConnectionType`, `Timestamp` 这些字段用,拼接到一块儿之后算出来的MD5',
//   `V1` varchar(255) DEFAULT '',
//   `V2` varchar(255) DEFAULT '',
//   `V3` varchar(255) DEFAULT '',
//   `V4` varchar(255) DEFAULT '',
//   `V5` varchar(255) DEFAULT '',
//   `V6` varchar(255) DEFAULT '',
//   `V7` varchar(255) DEFAULT '',
//   `V8` varchar(255) DEFAULT '',
//   `V9` varchar(255) DEFAULT '',
//   `V10` varchar(255) DEFAULT '',
//   `tsCampaignId` varchar(256) DEFAULT '' COMMENT 'TrafficSource的Campaign',
//   `tsWebsiteId` varchar(256) DEFAULT '' COMMENT 'TrafficSource的webset',
//   `id` bigint(20) DEFAULT NULL
// ) ENGINE=Columnstore DEFAULT CHARSET=utf8;