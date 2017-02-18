export default function(sequelize, DataTypes) {
    let model = sequelize.define('Provider', {
        zone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        timestamps: false,
        tableName: 'providers',
        classMethods: {
            associate(models) {
                model.hasMany(models.Statistic, {foreignKey: 'provider_id'})
                model.hasMany(models.Campaign, {foreignKey: 'provider_id'})
            }
        }
    })
    return model
}
