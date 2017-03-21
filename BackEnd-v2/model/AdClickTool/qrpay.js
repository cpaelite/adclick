export default function(sequelize, DataTypes) {
  let model = sequelize.define('QRPay', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    channel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    tradeNumber: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    goodsType: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    goodsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    goodsVolume: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    callbackAt: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createReq: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createResp: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    callback: {
      type: DataTypes.TEXT,
      allowNull: false
    },
  }, {
    timestamps: false,
    tableName: 'QRPay'
  })
  return model
}
