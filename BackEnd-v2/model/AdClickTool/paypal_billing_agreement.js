export default function(sequelize, DataTypes) {
  let model = sequelize.define('PaypalBillingAgreement', {
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    start_date: {
      type: DataTypes.DATE
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    approval_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    execute_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  })
  return model;
}
