export default function(sequelize, DataTypes) {
  let model = sequelize.define('TrafficSource', {
    userId : {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    hash: {
      type: DataTypes.STRING(39),
      allowNull: false
    },
    postbackUrl: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    impTracking: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    externalId: {
      type: DataTypes.STRING(124),
      defaultValue: ''
    },
    cost: {
      type: DataTypes.STRING(124),
      allowNull: false
    },
    params: {
      type: DataTypes.TEXT
    },
    deleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    timestamps: false,
    tableName: 'TrafficSource'
  })
  return model
}
