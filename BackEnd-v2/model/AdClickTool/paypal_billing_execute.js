export default function(sequelize, DataTypes) {
  let model = sequelize.define('PaypalBillingExecute', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    agreementId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    executedAt: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    executeReq: {
      type: DataTypes.TEXT
    },
    executeResp: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: false,
    tableName: 'PaypalBillingExecute'
  })

  return model;
}
