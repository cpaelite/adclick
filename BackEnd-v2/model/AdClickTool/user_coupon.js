export default function (sequelize, DataTypes) {
    let coupon = sequelize.define('UserCouponLog', {
        couponId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        activateDay: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0
        }
    }, {
            tableName: 'UserCouponLog',
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

// `couponId` int(11) NOT NULL,
//   `activateDay` int(11) NOT NULL COMMENT '用户激活优惠码的时间戳',
//   `userId` int(11) NOT NULL DEFAULT '0',
//   `status` int(11) NOT NULL DEFAULT '0' COMMENT '0:新建;1:已发放;2:已兑现',