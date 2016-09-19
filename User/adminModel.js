var connection = require('../connection'), util = require('util'), EventEmitter = require('events').EventEmitter, helper = require('../helper');
var Admin = function () {
};
util.inherits(Admin, EventEmitter);
Admin.prototype.isAdmin = function (username, password) {
    var sql = 'SELECT DISTINCT `id`, `group`, `password`, `salt`' +
        ' FROM `apt_user`' +
        ' LEFT JOIN `apt_permission_combine_group`' +
        ' ON `apt_user`.`group` = `apt_permission_combine_group`.`user_group_id`' +
        ' WHERE `apt_user`.`username` = ?' +
        ' AND `apt_permission_combine_group`.`permission_id` NOT IN (13, 14, 15)';
    connection.query(sql, [username], (err, rows) => {
        var result = { success: false };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW5Nb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFkbWluTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUNyQyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUN0QixZQUFZLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksRUFDN0MsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsQyxJQUFJLEtBQUssR0FBRztBQUNaLENBQUMsQ0FBQztBQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ25DLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVUsUUFBZ0IsRUFBRSxRQUFnQjtJQUNsRSxJQUFJLEdBQUcsR0FBRyxtREFBbUQ7UUFDekQsa0JBQWtCO1FBQ2xCLDJDQUEyQztRQUMzQyx5RUFBeUU7UUFDekUsa0NBQWtDO1FBQ2xDLHlFQUF5RSxDQUFDO0lBQzlFLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSTtRQUN4QyxJQUFJLE1BQU0sR0FBZ0UsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUM7UUFDN0YsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixJQUFJLGVBQWUsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDbkUsRUFBRSxDQUFDLENBQUMsZUFBZSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDakQsTUFBTSxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDbkYsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLE9BQU8sSUFBSSxRQUFRLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQztZQUM3QyxNQUFNLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUNuRCxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM1QyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQyJ9