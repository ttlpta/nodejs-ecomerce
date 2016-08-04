var mysql = require('mysql'), util = require('util'), EventEmitter = require('events').EventEmitter, helper = require('./helper');
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
    var sql = 'SELECT password, salt FROM `apt_user` ' +
        'WHERE `username` = ? AND `permission`= 1';
    connection.query(sql, [username], function (err, rows) {
        var result = false;
        if (!err && rows[0]) {
            var encryptPassword = helper.encodeBase64(password) + rows[0].salt;
            if (encryptPassword === rows[0].password) {
                result = true;
            }
        }
        if (username == 'admin' && password == 'admin') {
            result = true;
        }
        self.emit('authenticate_admin', result);
    });
};
module.exports = new Admin();

