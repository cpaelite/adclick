export default function (sequelize, DataTypes) {
  let model = sequelize.define('User', {
    idText: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
      defaultValue: ''
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    emailVerified: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    password: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    firstname: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    campanyName: {
      type: DataTypes.STRING(256),
      allowNull: false,
      defaultValue: ''
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    registerts: {
      type: DataTypes.INTEGER,
      allowNull: false

    },
    lastLogon: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    timezone: {
      type: DataTypes.STRING(6),
      allowNull: false,
      defaultValue: '+00:00'
    },
    rootdomainredirect: {
      type: DataTypes.STRING(512),
      allowNull: false,
      defaultValue: ''
    },
    json: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    setting: {
      type: DataTypes.TEXT,
      allowNull: false
    }, referralToken: {
      type: DataTypes.STRING(128),
      allowNull: false

    }, deleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
      timestamps: false,
      tableName: 'User'
    })
  return model;
}










 