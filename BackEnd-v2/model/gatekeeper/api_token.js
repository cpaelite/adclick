export default function(sequelize, DataTypes) {
  let model = sequelize.define('ApiToken', {
    token: {
      type: DataTypes.STRING
    },
    userId: {
      type: DataTypes.STRING
    },
    username: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    },
    provider_id: {
        type: DataTypes.INTEGER
    }
  }, {
    tableName: 'api_tokens',
    timestamps: false,
    classMethods: {
      associate(models) {
        model.belongsTo(models.Provider, {foreignKey: 'provider_id'})
      }
    }
  })
  return model;
}
