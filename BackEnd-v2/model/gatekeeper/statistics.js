export default function(sequelize, DataTypes) {
    let model = sequelize.define('Statistic', {
        cost: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        impression: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        date: {
            type: DataTypes.DATE
        },
        click: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        provider_id: {
            type: DataTypes.INTEGER
        },
        timezone_id: {
            type: DataTypes.INTEGER
        },
        campaign_id: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: false,
        tableName: 'statistics',
        classMethods: {
            associate(models) {
                model.belongsTo(models.Provider, {foreignKey: 'provider_id'});
                model.belongsTo(models.Campaign, {foreignKey: 'campaign_id'});
                model.belongsTo(models.Timezone, {foreignKey: 'timezone_id'})
            }
        }
    })
    return model;
}
