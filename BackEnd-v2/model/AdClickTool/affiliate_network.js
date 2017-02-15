export default function(sequelize, DataTypes) {
  let model = sequelize.define('AffiliateNetwork', {
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
    postbackUrl: {
      type: DataTypes.STRING(512),
      allowNull: false,
      defaultValue: ''
    },
    appendClickId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    duplicatedPostback: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ipWhiteList: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    deleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    timestamps: false,
    tableName: 'AffiliateNetwork'
  })
  return model
}
