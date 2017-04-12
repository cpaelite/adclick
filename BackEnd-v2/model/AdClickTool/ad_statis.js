export default function (sequelize, DataTypes) {
  let model = sequelize.define('AdStatis', {
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CampaignID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CampaignName: {
      type: DataTypes.STRING(256),
      defaultValue: ''
    },
    FlowID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    FlowName: {
      type: DataTypes.STRING(256),
      defaultValue: ''
    },
    LanderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    LanderName: {
      type: DataTypes.STRING(256),
      defaultValue: ''
    },
    OfferID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    OfferName: {
      type: DataTypes.STRING(256),
      defaultValue: ''
    },
    OfferUrl: {
      type: DataTypes.STRING(256),
      defaultValue: ''
    },
    OfferCountry: {
      type: DataTypes.STRING(40),
      defaultValue: ''
    },
    AffiliateNetworkID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    AffilliateNetworkName: {
      type: DataTypes.STRING(256),
      defaultValue: ''
    },
    TrafficSourceID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    TrafficSourceName: {
      type: DataTypes.STRING(256)
    },
    Language: {
      type: DataTypes.STRING(20)
    },
    model: {
      type: DataTypes.STRING(45)
    },
    Country: {
      type: DataTypes.STRING(40)
    },
    City: {
      type: DataTypes.STRING(45)
    },
    Region: {
      type: DataTypes.STRING(45)
    },
    ISP: {
      type: DataTypes.STRING(64)
    },
    MobileCarrier: {
      type: DataTypes.STRING(64)
    },
    Domain: {
      type: DataTypes.STRING(45)
    },
    DeviceType: {
      type: DataTypes.STRING(16),
      defaultValue: ''
    },
    Brand: {
      type: DataTypes.STRING(32)
    },
    OS: {
      type: DataTypes.STRING(16)
    },
    OSVersion: {
      type: DataTypes.STRING(32)
    },
    Browser: {
      type: DataTypes.STRING(32)
    },
    BrowserVersion: {
      type: DataTypes.STRING(64)
    },
    ConnectionType: {
      type: DataTypes.STRING(16)
    },
    Timestamp: {
      type: DataTypes.BIGINT(22),
      primaryKey: true
    },
    Visits: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    Clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    Conversions: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    Cost: {
      type: DataTypes.BIGINT(20),
      defaultValue: 0,
      allowNull: false
    },
    Revenue: {
      type: DataTypes.BIGINT(20),
      defaultValue: 0,
      allowNull: false
    },
    Impressions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    KeysMD5: {
      type: DataTypes.CHAR(32),
      defaultValue: '',
      unique: true
    },
    V1: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    V2: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    V3: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    V4: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    V5: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    V6: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    V7: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    V8: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    V9: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    V10: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    tsCampaignId: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    tsWebsiteId: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    }
  }, {
      tableName: 'AdStatis',
      timestamps: false,

      classMethods: {
        associate(models) {
          model.belongsTo(models.Lander, {
            foreignKey: 'LanderID'
          })
          model.belongsTo(models.TrackingCampaign, {
            foreignKey: 'CampaignID'
          })
          model.belongsTo(models.Flow, {
            foreignKey: 'FlowID'
          })
          model.belongsTo(models.Offer, {
            foreignKey: 'OfferID'
          })
          model.belongsTo(models.AffiliateNetwork, {
            foreignKey: 'AffiliateNetworkID'
          })
          model.belongsTo(models.TrafficSource, {
            foreignKey: 'TrafficSourceID'
          })
        }
      }
    })
  return model
}
