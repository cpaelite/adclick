var mysql = require('mysql');

var db_config = {
    host: 'dev.cmjwzbzhppgn.us-west-1.rds.amazonaws.com',
    user: 'root',
    password: 'R%LKsIJF412',
    database: 'AdClickTool'
}

var connection = mysql.createPool(db_config);

module.exports.connection = connection;
