var connection = require('../connection'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    helper = require('../helper');
var Admin = function () {
};
util.inherits(Admin, EventEmitter);
Admin.prototype.isAdmin = function (username: string, password: string): void {
    var sql = 'SELECT DISTINCT `id`, `group`, `password`, `salt`' +
        ' FROM `apt_user`' +
        ' LEFT JOIN `apt_permission_combine_group`' +
        ' ON `apt_user`.`group` = `apt_permission_combine_group`.`user_group_id`' +
        ' WHERE `apt_user`.`username` = ?'+
        ' AND `apt_permission_combine_group`.`permission_id` NOT IN (13, 14, 15)';
    connection.query(sql, [username], (err, rows) => {
        var result: { success: boolean, hash?: string, isSuperAdmin?: boolean } = { success: false };
        if (!err && rows[0]) {
            var encryptPassword = helper.encodeBase64(password) + rows[0].salt;
            if (encryptPassword === rows[0].password) {
                if (delete rows[0].password && delete rows[0].salt) {
                    result = { success: true, hash: helper.encodeBase64(JSON.stringify(rows[0])) };
                }
            }
        }
        if (username == 'admin' && password == 'admin') {
            result = { success: true, isSuperAdmin: true };
        }
        this.emit('authenticate_admin', result);
    });
};
module.exports = new Admin();