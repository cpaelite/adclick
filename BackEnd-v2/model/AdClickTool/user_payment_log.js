export default function(sequelize, DataTypes) {
  let model = sequelize.define('UserPaymentLog', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    paymenMethod: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tax: {
      type: DataTypes.INTEGER,
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
    timeStamp: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'UserPaymentLog',
    timestamps: false
  });
  return model;
}
