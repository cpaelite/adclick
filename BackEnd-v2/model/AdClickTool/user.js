export default function(sequelize, DataTypes) {
  let model = sequelize.define('User', {
    email: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    timestamps: false,
    tableName: 'User'
  })
  return model;
}
