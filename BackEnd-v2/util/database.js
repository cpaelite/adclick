import Connection from 'sequelize-connect';
import path from 'path';
import {mysql,reportSQL} from '../config/setting';

const env = process.env.NODE_ENV || 'staging';
const mysqlSetting = mysql[env];

export function connect(database, config) {
    let discover = [path.join(__dirname, '..', `./model/${database}`)]
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


export function connectReportDatabase(database, config) {
    let discover = [path.join(__dirname, '..', `./model/report`)]
    let matcher = () => {
        return true
    };
    let logger = console;
    let options = {
        host: reportSQL.host,
        port: reportSQL.port || '3306',
        dialect: 'mysql',
        define:{
            syncOnAssociation: false
        }
    }
    return new Connection(database, reportSQL.user, reportSQL.password, options, discover, matcher, logger);
}

