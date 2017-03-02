export default function (sequelize, DataTypes) {
    let coupon = sequelize.define('Coupon', {
        code: {
            type: DataTypes.STRING(32),
            allowNull: false,
            unique: true
        },
        activity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
            tableName: 'Coupon',
            timestamps: false,
            classMethods: {
                associate(models) {
                    coupon.hasOne(models.Activity, {
                        foreignKey: 'activity'
                    })
                }
            }
        });

    return coupon;
}

// `code` varchar(32) NOT NULL COMMENT '优惠码',
//   `activity` int(11) NOT NULL COMMENT '该优惠码属于哪一次活动',
//   `value` int(11) NOT NULL COMMENT '赠送events数量',