export default function(sequelize, DataTypes) {
  let model = sequelize.define('PaypalBillingAgreement', {
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.DATE
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    paypalPlanId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    approvalUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    executeUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createReq: {
      type: DataTypes.TEXT
    },
    createResp: {
      type: DataTypes.TEXT
    },
    cancelReq: {
      type: DataTypes.TEXT
    },
    cancelResp: {
      type: DataTypes.TEXT
    },

  }, {
    timestamps: false,
    tableName: 'PaypalBillingAgreement'
  })
  return model;
}
