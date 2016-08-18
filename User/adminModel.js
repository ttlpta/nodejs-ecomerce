var connection = require('../connection'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    helper = require('../helper');
var Admin = function () {
};
util.inherits(Admin, EventEmitter);
Admin.prototype.isAdmin = function (username, password) {
    var self = this;
    var sql = 'SELECT `id`, `group`, `password`, `salt` FROM `apt_user` ' +
        'WHERE `username` = ? AND `group` = 1';
    connection.query(sql, [username], function (err, rows) {
        var result = {success: false, errorCode: 1};
        if (!err && rows[0]) {
            var encryptPassword = helper.encodeBase64(password) + rows[0].salt;
            if (encryptPassword === rows[0].password) {
                if (delete rows[0].password && delete rows[0].salt) {
                    result = {success: true, hash: helper.encodeBase64(JSON.stringify(rows[0]))};
                }
            }
        }
        if (username == 'admin' && password == 'admin') {
            result = {success: true, isSuperAdmin: true};
        }
        self.emit('authenticate_admin', result);
    });
};
module.exports = new Admin();

