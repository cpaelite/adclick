export default function(sequelize, DataTypes) {
    let model = sequelize.define('Campaign', {
        name: {
            type: DataTypes.STRING
        },
        campaign_identity: {
            type: DataTypes.STRING
        },
        provider_id: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: false,
        tableName: 'campaigns',
        classMethods: {
            associate(models) {
                model.belongsTo(models.Provider, {foreignKey: 'provider_id'})
                model.hasMany(models.Statistic, {foreignKey: 'campaign_id'})
            }
        }
    })

    return model
}
