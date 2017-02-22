export default function (sequelize, DataTypes) {
  let model = sequelize.define('PaypalBillingPlan', {
    paypal_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('FIXED', 'INFINITE'),
      defaultValue: 'INFINITE',
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD'
    },
    setup_fee: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    regular_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    regular_fee: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    regular_cycles: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    regular_frequency: {
      type: DataTypes.ENUM('WEEK', 'DAY', 'YEAR', 'MONTH'),
      defaultValue: 'MONTH',
      allowNull: false
    },
    regular_frequency_interval: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },

    trial_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    trial_fee: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    trial_cycles: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    trial_frequency: {
      type: DataTypes.ENUM('WEEK', 'DAY', 'YEAR', 'MONTH'),
      defaultValue: 'MONTH',
      allowNull: false
    },
    trial_frequency_interval: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    }
  })
  return model
}
