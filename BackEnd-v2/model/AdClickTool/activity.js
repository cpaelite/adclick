export default function (sequelize, DataTypes) {
    return sequelize.define('Activity', {
        name: {
            type: DataTypes.STRING(64),
            allowNull: false
        },
        startDay: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        endDay: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userLimit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        couponLimit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        open: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        desc: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
            tableName: 'Activity',
            timestamps: false
        });
}


//  `name` varchar(64) NOT NULL COMMENT '运营推广活动的名称',
//   `startDay` int(11) NOT NULL COMMENT '可以激活的时间段开始时间点',
//   `endDay` int(11) NOT NULL COMMENT '可以激活的时间段结束时间点',
//   `userLimit` int(11) NOT NULL DEFAULT '1' COMMENT '该活动的优惠码，每个用户最多可以用几张，0为无限制',
//   `couponLimit` int(11) NOT NULL DEFAULT '1' COMMENT '该活动的优惠码，可以同时被多少用户使用，0为无限制',
//   `open` int(11) NOT NULL DEFAULT '0' COMMENT '0:关闭;1:开启',
//   `desc` text NOT NULL COMMENT 'HTML格式的描述信息'