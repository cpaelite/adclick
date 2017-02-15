export default function(sequelize, DataTypes) {
  let model = sequelize.define('Offer', {
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
    AffiliateNetworkId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    AffiliateNetworkName: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    postbackUrl: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    payoutMode: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    payoutValue: {
      type: DataTypes.DECIMAL(10, 5),
      allowNull: false,
      defaultValue: 0
    },
    deleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    timestamps: false,
    tableName: 'Offer'
  })
  return model
}
