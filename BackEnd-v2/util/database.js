import Connection from 'sequelize-connect';
import path from 'path';
import {
    mysql
} from '../config/setting';

const env = process.env.NODE_ENV || 'staging';
const mysqlSetting = mysql[env];

export function connect(database, config) {
    let discover = [path.join(__dirname, '..', `./model/adclicktool`)]
    let matcher = () => {
        return true
    };
    let logger = console;
    let options = {
        host: mysqlSetting.host,
        port: mysqlSetting.port || '3306',
        dialect: 'mysql'
    }

    return new Connection(database, mysqlSetting.user, mysqlSetting.password, options, discover, matcher, logger);
}