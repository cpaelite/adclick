export default function (sequelize, DataTypes) {
    let model = sequelize.define('TrafficSourceStatis', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        taskId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.INTEGER
        },
        campaignId: {
            type: DataTypes.STRING(256),
            defaultValue: ""
        },
        campaignName: {
            type: DataTypes.STRING(256),
            defaultValue: ""
        },
        websiteId: {
            type: DataTypes.STRING(256),
            defaultValue: ""
        },
        v1: {
            type: DataTypes.STRING(255),
            defaultValue: ""
        },
        v2: {
            type: DataTypes.STRING(255),
            defaultValue: ""
        },
        v3: {
            type: DataTypes.STRING(255),
            defaultValue: ""
        },
        v4: {
            type: DataTypes.STRING(255),
            defaultValue: ""
        },
        v1: {
            type: DataTypes.STRING(255),
            defaultValue: ""
        },
        v5: {
            type: DataTypes.STRING(255),
            defaultValue: ""
        },
        v6: {
            type: DataTypes.STRING(255),
            defaultValue: ""
        },
        v7: {
            type: DataTypes.STRING(255),
            defaultValue: ""
        },
        v8: {
            type: DataTypes.STRING(255),
            defaultValue: ""
        },
        v9: {
            type: DataTypes.STRING(255),
            defaultValue: ""
        },
        v10: {
            type: DataTypes.STRING(255),
            defaultValue: ""
        },
        impression: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        click: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        cost: {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        time: {
            type: DataTypes.STRING(20),
            defaultValue: ""
        },
        dimensions: {
            type: DataTypes.STRING(256),
            defaultValue: "campaignId"
        }
    }, {
            timestamps: false,
            tableName: 'TrafficSourceStatis',
            classMethods: {
                associate(models) {
                    model.hasMany(models.TrafficSourceSyncTask, {
                        foreignKey: 'taskId'
                    })
                }
            }
        })
    return model;
}






