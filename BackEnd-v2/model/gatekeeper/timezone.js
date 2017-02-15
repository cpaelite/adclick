export default function(sequelize, DataTypes) {
    let model = sequelize.define('Timezone', {
        zone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false,
        tableName: 'timezones',
        classMethods: {
            associate(models) {
                model.hasMany(models.Statistic, {foreignKey: 'timezone_id'})
            }
        }
    })
    return model;
}
