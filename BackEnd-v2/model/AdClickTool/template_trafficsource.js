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
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    apiTimezones: {
      type: DataTypes.STRING(256),
      allowNull: false,
      defaultValue: '+00:00'
    },
    apiTimezoneIds: {
      type: DataTypes.STRING(512),
      allowNull: false,
      defaultValue: '35'
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

        }
      }
    })
  return model;
}












 