export default function(sequelize, DataTypes) {
  let model = sequelize.define('PaypalBillingExecute', {
    paypal_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    payer: {
      // JSON detail
      type: DataTypes.TEXT
    },
    plan: {
      // JSON detail
      type: DataTypes.TEXT
    },
    agreement_detail: {
      // JSON detail
      type: DataTypes.TEXT
    },
    shipping_address: {
      // JSON detail
      type: DataTypes.TEXT
    },
    start_date: {
      // JSON detail
      type: DataTypes.DATE,
      allowNull: false
    },
    links: {
      // JSON detail
      type: DataTypes.TEXT
    }
  })

  return model;
}
