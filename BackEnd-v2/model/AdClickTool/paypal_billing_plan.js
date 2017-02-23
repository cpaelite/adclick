export default function (sequelize, DataTypes) {
  let model = sequelize.define('PaypalBillingPlan', {
    paypalId: {
      type: DataTypes.STRING,
      allowNull: false,
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
    setupFee: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    regularName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    regularFee: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    regularCycles: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    regularFrequency: {
      type: DataTypes.ENUM('WEEK', 'DAY', 'YEAR', 'MONTH'),
      defaultValue: 'MONTH',
      allowNull: false
    },
    regularFrequencyInterval: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },

    trialName: {
      type: DataTypes.STRING,
    },
    trialFee: {
      type: DataTypes.DECIMAL(10,2),
    },
    trialCycles: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    trialFrequency: {
      type: DataTypes.ENUM('WEEK', 'DAY', 'YEAR', 'MONTH'),
      defaultValue: 'MONTH',
    },
    trialFrequencyInterval: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    }
  }, {
    timestamps: false,
    tableName: 'PaypalBillingPlan'
  })
  return model
}
