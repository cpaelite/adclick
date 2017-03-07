export default function(sequelize, DataTypes) {
  let model = sequelize.define('TemplatePlan', {
    name: {
      type: DataTypes.STRING(64),
    },
    desc: {
      type: DataTypes.TEXT
    },
    paypalPlanId: {
      type: DataTypes.INTEGER
    },
    normalPrice: {
      type: DataTypes.INTEGER
    },
    onSalePrice: {
      type: DataTypes.INTEGER
    },
    eventsLimit: {
      type: DataTypes.INTEGER
    },
    supportType: {
      type: DataTypes.STRING(10)
    },
    retentionLimit: {
      type: DataTypes.INTEGER
    },
    domainLimit: {
      type: DataTypes.INTEGER
    },
    userLimit: {
      type: DataTypes.INTEGER
    },
    volumeDiscount: {
      type: DataTypes.INTEGER
    },
    overageCPM: {
      type: DataTypes.INTEGER
    },
    regularFrequency: {
      type: DataTypes.ENUM('WEEK','DAY','YEAR','MONTH'),
      defaultValue: 'MONTH'
    },
    regularFrequencyInterval: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    hidden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    orderLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    timestamps: false,
    tableName: 'TemplatePlan',
    classMethods: {
      associate(models) {
        model.hasMany(models.UserBilling, {
          foreignKey: 'planId'
        })
      }
    }
  })
  return model;
}
