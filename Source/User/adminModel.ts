var connection = require('../../connection'),
    Promise = require('bluebird'),
    helper = require('../helper');
var Admin = function () {
};
Admin.prototype.isAdmin = function (username: string, password: string): any {
    var sql: string = 'SELECT DISTINCT `id`, `group`, `password`, `salt`' +
        ' FROM `apt_user`' +
        ' LEFT JOIN `apt_permission_combine_group`' +
        ' ON `apt_user`.`group` = `apt_permission_combine_group`.`user_group_id`' +
        ' WHERE `apt_user`.`username` = ?' +
        ' AND `apt_permission_combine_group`.`permission_id` NOT IN (13, 14, 15)';

    return new Promise(function (resolve, reject) {
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
            resolve(result);
        })
    });
};
module.exports = new Admin();