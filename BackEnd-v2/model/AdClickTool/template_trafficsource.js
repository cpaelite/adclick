export default function (sequelize, DataTypes) {
  let model = sequelize.define('TemplateTrafficSource', {
    name: {
      type: DataTypes.STRING(256)
    },
    postbackUrl: {
      type: DataTypes.STRING(512),
      defaultValue: ""
    },
    pixelRedirectUrl: {
      type: DataTypes.STRING(512),
      defaultValue: ""
    },
    externalId: {
      type: DataTypes.STRING(256)
    },
    cost: {
      type: DataTypes.STRING(124)
    },
    campaignId: {
      type: DataTypes.STRING(256)
    },
    websiteId: {
      type: DataTypes.STRING(256)
    },
    params: {
      type: DataTypes.TEXT
    },
    apiReport: {
      type: DataTypes.INTEGER
    },
    apiUrl: {
      type: DataTypes.TEXT
    },
    apiParams: {
      type: DataTypes.TEXT
    },
    apiMode: {
      type: DataTypes.INTEGER
    },
    apiInterval: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    apiMeshSize: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    apiTimezones: {
      type: DataTypes.TEXT
    },
    deleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
      timestamps: false,
      tableName: 'TemplateTrafficSource',
      classMethods: {
        associate(models) {
           model.hasMany(models.ThirdPartyTrafficSource, {
            foreignKey: 'trustedTrafficSourceId'
          })
        }
      }
    })
  return model;
}












