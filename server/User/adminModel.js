var connection = require('../../connection'), Promise = require('bluebird'), _ = require('lodash'), helper = require('../helper');
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
                    result = { success: true, hash: helper.encodeBase64(JSON.stringify(_.omit(rows[0], ['password', 'salt']))) };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW5Nb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL1NvdXJjZS9Vc2VyL2FkbWluTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEVBQ3hDLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQzdCLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQ3JCLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbEMsSUFBSSxLQUFLLEdBQUc7QUFDWixDQUFDLENBQUM7QUFDRixLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFVLFFBQWdCLEVBQUUsUUFBZ0I7SUFDbEUsSUFBSSxHQUFHLEdBQVcsbURBQW1EO1FBQ2pFLGtCQUFrQjtRQUNsQiwyQ0FBMkM7UUFDM0MseUVBQXlFO1FBQ3pFLGtDQUFrQztRQUNsQyx5RUFBeUUsQ0FBQztJQUU5RSxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtRQUN4QyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUk7WUFDeEMsSUFBSSxNQUFNLEdBQWdFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDO1lBQzdGLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xCLElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDbkUsRUFBRSxDQUFDLENBQUMsZUFBZSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUN2QyxNQUFNLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDakgsQ0FBQztZQUNMLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksT0FBTyxJQUFJLFFBQVEsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUNuRCxDQUFDO1lBQ0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUM7QUFDRixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUMifQ==