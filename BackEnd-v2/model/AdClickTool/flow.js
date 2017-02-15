export default function(sequelize, DataTypes) {
  let model = sequelize.define('Flow', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hash: {
      type: DataTypes.STRING(39),
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: ''
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    redirectMode: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'Flow',
    timestamps: false
  })
  return model
}
