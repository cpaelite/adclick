export default function(sequelize, DataTypes) {
  let model = sequelize.define('TrackingCampaign', {
    userId: {
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
    url: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    impPixelUrl: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    trafficSourceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    trafficSourceName: {
      type: DataTypes.STRING(256),
      allowNull: false,
      defaultValue: ''
    },
    country: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: ''
    },
    costModel: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cpcValue: {
      type: DataTypes.DECIMAL(10, 5),
      allowNull: false,
      defaultValue: 0
    },
    cpaValue: {
      type: DataTypes.DECIMAL(10, 5),
      allowNull: false,
      defaultValue: 0
    },
    cpmValue: {
      type: DataTypes.DECIMAL(10, 5),
      allowNull: false,
      defaultValue: 0
    },
    postbackUrl: {
      type: DataTypes.STRING(512),
      allowNull: false,
      defaultValue: ''
    },
    pixelRedirectUrl: {
      type: DataTypes.STRING(512),
      allowNull: false,
      defaultValue: ''
    },
    redirectMode: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    targetType: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    targetFlowId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    targetUrl: {
      type: DataTypes.STRING(512),
      allowNull: false,
      defaultValue: ''
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'TrackingCampaign',
    timestamps: false
  })
  return model
}
