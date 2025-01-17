export default function(sequelize, DataTypes) {
  let model = sequelize.define('Lander', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hash: {
      type: DataTypes.STRING(39),
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: ''
    },
    numberOfOffers: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'Lander',
    timestamps: false,
    classMethods: {
      associate(models) {
        model.hasMany(models.AdStatis, {
          foreignKey: 'LanderID'
        })
      }
    }
  })
  return model
}
