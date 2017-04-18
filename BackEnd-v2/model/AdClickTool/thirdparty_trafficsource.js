export default function (sequelize, DataTypes) {
  let model = sequelize.define('ThirdPartyTrafficSource', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    trustedTrafficSourceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(256),
      defaultValue: ""
    },
    token: {
      type: DataTypes.TEXT
    },
    userName: {
      type: DataTypes.TEXT
    },
    password: {
      type: DataTypes.TEXT
    },
    createdAt: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
      timestamps: false,
      tableName: 'ThirdPartyTrafficSource',
      classMethods: {
        associate(models) {
          model.belongsTo(models.TemplateTrafficSource, {
            foreignKey: 'trustedTrafficSourceId'
          })
        }
      }
    })
  return model;
}



