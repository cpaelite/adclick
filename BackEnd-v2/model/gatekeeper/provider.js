export default function(sequelize, DataTypes) {
    let model = sequelize.define('Provider', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        timestamps: false,
        tableName: 'providers',
        classMethods: {
            associate(models) {
                model.hasMany(models.ApiToken, {foreignKey: 'provider_id'})
                model.hasMany(models.Statistic, {foreignKey: 'provider_id'})
                model.hasMany(models.Campaign, {foreignKey: 'provider_id'})
            }
        }
    })
    return model
}
