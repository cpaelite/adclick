export default function(sequelize, DataTypes) {
  let model = sequelize.define('UserBillDetail', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.TEXT
    },
    address1: {
      type: DataTypes.TEXT
    },
    address2: {
      type: DataTypes.TEXT
    },
    city: {
      type: DataTypes.TEXT
    },
    zip: {
      type: DataTypes.TEXT
    },
    region: {
      type: DataTypes.TEXT
    },
    country: {
      type: DataTypes.TEXT
    },
    taxId: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: false,
    tableName: 'UserBillDetail'
  });
  return model;
}
