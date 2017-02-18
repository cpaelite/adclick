export default function(sequelize, DataTypes) {
    let model = sequelize.define('CampaignMap', {
        OurCampId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        Timestamp: {
            type: DataTypes.BIGINT(22),
            allowNull: false,
            primaryKey: true
        },
        TheirCampId: {
            type: DataTypes.STRING(128),
            allowNull: false,
            primaryKey: true
        }
    }, {
      timestamps: false,
      tableName: 'CampaignMap'  
    })
    return model;
}
