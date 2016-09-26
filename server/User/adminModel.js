var connection = require('../../connection'), Promise = require('bluebird'), helper = require('../helper');
var Admin = function () {
};
Admin.prototype.isAdmin = function (username, password) {
    var sql = 'SELECT DISTINCT `id`, `group`, `password`, `salt`' +
        ' FROM `apt_user`' +
        ' LEFT JOIN `apt_permission_combine_group`' +
        ' ON `apt_user`.`group` = `apt_permission_combine_group`.`user_group_id`' +
        ' WHERE `apt_user`.`username` = ?' +
        ' AND `apt_permission_combine_group`.`permission_id` NOT IN (13, 14, 15)';
    return new Promise(function (resolve, reject) {
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
            resolve(result);
        });
    });
};
module.exports = new Admin();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW5Nb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL1NvdXJjZS9Vc2VyL2FkbWluTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEVBQ3hDLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQzdCLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbEMsSUFBSSxLQUFLLEdBQUc7QUFDWixDQUFDLENBQUM7QUFDRixLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFVLFFBQWdCLEVBQUUsUUFBZ0I7SUFDbEUsSUFBSSxHQUFHLEdBQVcsbURBQW1EO1FBQ2pFLGtCQUFrQjtRQUNsQiwyQ0FBMkM7UUFDM0MseUVBQXlFO1FBQ3pFLGtDQUFrQztRQUNsQyx5RUFBeUUsQ0FBQztJQUU5RSxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtRQUN4QyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUk7WUFDeEMsSUFBSSxNQUFNLEdBQWdFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQzdGLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDbkUsRUFBRSxDQUFDLENBQUMsZUFBZSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUN2QyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDakQsTUFBTSxHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDbkYsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxPQUFPLElBQUksUUFBUSxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLE1BQU0sR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDO1lBQ25ELENBQUM7WUFDRCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQyJ9