export default function(sequelize, DataTypes) {
  let model = sequelize.define('UserPaymentMethod', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    paypalAgreementId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    info: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    changedAt: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'UserPaymentMethod',
    timestamps: false
  })
  return model;
}
