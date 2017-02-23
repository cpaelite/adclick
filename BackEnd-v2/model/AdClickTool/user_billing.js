export default function(sequelize, DataTypes) {
  let model = sequelize.define('UserBilling', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nextPlanId: {
      type: DataTypes.INTEGER
    },
    nextPaymentMethod: {
      type: DataTypes.INTEGER
    },
    planStart: {
      type: DataTypes.INTEGER
    },
    planEnd: {
      type: DataTypes.INTEGER
    },
    billedEvents: {
      type: DataTypes.INTEGER
    },
    totalEvents: {
      type: DataTypes.INTEGER
    },
    includedEvents: {
      type: DataTypes.INTEGER
    },
    freeEvents: {
      type: DataTypes.INTEGER
    },
    overageEvents: {
      type: DataTypes.INTEGER
    },
    expired: {
      type: DataTypes.INTEGER
    }
  }, {
    timestamps: false,
    tableName: 'UserBilling'
  })
  return model;
}
