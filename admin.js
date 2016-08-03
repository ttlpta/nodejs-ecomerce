var mysql = require('mysql'), util = require('util'), EventEmitter = require('events').EventEmitter;
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs'
});
connection.connect();
var Admin = function () {
};
util.inherits(Admin, EventEmitter);
Admin.prototype.isAdmin = function (username, password) {
    var self = this;
    var sql = 'SELECT COUNT(*) as countAdmin FROM `apt_user` ' +
        'WHERE `username` ="' + username + '" AND `password`= "' + password + '" AND `permission`= 1';
    connection.query(sql, function (err, rows) {
        var result = false;
        if (!err && rows[0].countAdmin) {
            result = true;
        }
        self.emit('authenticate_admin', result);
    });

};
module.exports = new Admin();

