export default function (sequelize, DataTypes) {
    let model = sequelize.define('TrafficSourceSyncTask', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        thirdPartyTrafficSourceId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        executor: {
            type: DataTypes.STRING(32)
        },
        message: {
            type: DataTypes.TEXT
        },
        tzShift: {
            type: DataTypes.STRING(6)
        },
        tzId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 35
        },
        tzParam: {
            type: DataTypes.TEXT
        },
        statisFrom: {
            type: DataTypes.DATE,
            allowNull: false
        },
        statisTo: {
            type: DataTypes.DATE,
            allowNull: false
        },
        meshSize: {
            type: DataTypes.INTEGER,
            defaultValue: 2
        },
        createdAt: {
            type: DataTypes.INTEGER
        },
        startedAt: {
            type: DataTypes.INTEGER
        },
        endedAt: {
            type: DataTypes.INTEGER
        },
        deleted: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
            timestamps: false,
            tableName: 'TrafficSourceSyncTask',
            classMethods: {
                associate(models) {
                    model.hasMany(models.ThirdPartyTrafficSource, {
                        foreignKey: 'thirdPartyTrafficSourceId'
                    })
                }
            }
        })
    return model;
}










// CREATE TABLE `TrafficSourceSyncTask` (




//   `from` datetime NOT NULL COMMENT '报表开始时间',
//   `to` datetime NOT NULL COMMENT '报表截止时间',
//   `meshSize` int(11) NOT NULL DEFAULT '2' COMMENT '获取报告的粒度，必须要大于该TS能支持的最细粒度，0:minute;1:hour;2:day;3:week;4:month;5:year',
//   `createdAt` int(11) NOT NULL COMMENT '创建的时间戳，精确到秒',
//   `startedAt` int(11) NOT NULL COMMENT '任务开始的时间戳，精确到秒',
//   `endedAt` int(11) NOT NULL COMMENT '任务出错或者完成的时间戳，精确到秒',
//   `deleted` int(11) NOT NULL DEFAULT '0' COMMENT '0:未删除;1:已删除',
//   PRIMARY KEY (`id`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8;