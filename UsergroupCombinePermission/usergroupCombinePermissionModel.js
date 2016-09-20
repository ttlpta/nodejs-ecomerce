var connection = require('../connection'), util = require('util'), EventEmitter = require('events').EventEmitter;
var UserGroupCombinePermission = function () {
};
util.inherits(UserGroupCombinePermission, EventEmitter);
UserGroupCombinePermission.prototype.addAllowGroupPermission = function (groupId, allowPermissionIds) {
    if (allowPermissionIds) {
        var insertValues = '(' + allowPermissionIds.join(',' + groupId + '),(') + ',' + groupId + ')';
        var sql = 'INSERT IGNORE INTO `apt_permission_combine_group` (`permission_id`, `user_group_id`) ' +
            'VALUES ' + insertValues;
        var self = this;
        connection.query(sql, function (err, res) {
            if (err) {
                self.emit('add_allow_group_permission_error', err);
            }
            else {
                self.emit('add_allow_group_permission_success');
            }
        });
    }
};
UserGroupCombinePermission.prototype.removeDenyGroupPermission = function (groupId, denyPermissionIds) {
    if (denyPermissionIds) {
        var deleteValues = denyPermissionIds.join(',');
        var sql = 'DELETE FROM `apt_permission_combine_group` WHERE `user_group_id` = ? ' +
            'AND `permission_id` IN ( ' + deleteValues + ' )';
        var self = this;
        connection.query(sql, [+groupId], function (err, res) {
            if (err) {
                self.emit('remove_deny_group_permission_error', err);
            }
            else {
                self.emit('remove_deny_group_permission_success');
            }
        });
    }
};
UserGroupCombinePermission.prototype.deleteGroupByGroupId = function (groupId) {
    var sql = 'DELETE FROM `apt_permission_combine_group` WHERE `user_group_id` = ? ';
    var self = this;
    connection.query(sql, [+groupId], function (err, res) {
        if (err) {
            self.emit('remove_group_permission_error', err);
        }
        else {
            self.emit('remove_group_permission_success');
        }
    });
};
module.exports = new UserGroupCombinePermission();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcmdyb3VwQ29tYmluZVBlcm1pc3Npb25Nb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL1NvdXJjZS9Vc2VyZ3JvdXBDb21iaW5lUGVybWlzc2lvbi91c2VyZ3JvdXBDb21iaW5lUGVybWlzc2lvbk1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFDckMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFDdEIsWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLENBQUM7QUFDbEQsSUFBSSwwQkFBMEIsR0FBRztBQUNqQyxDQUFDLENBQUM7QUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3hELDBCQUEwQixDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsR0FBRyxVQUFVLE9BQU8sRUFBRSxrQkFBa0I7SUFDaEcsRUFBRSxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLElBQUksWUFBWSxHQUFHLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUMsT0FBTyxHQUFFLEdBQUcsQ0FBQztRQUMzRixJQUFJLEdBQUcsR0FBRyx1RkFBdUY7WUFDN0YsU0FBUyxHQUFHLFlBQVksQ0FBQztRQUM3QixJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFDaEIsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztZQUNwQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsa0NBQWtDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDdkQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLElBQUksQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQztZQUNwRCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBQ0YsMEJBQTBCLENBQUMsU0FBUyxDQUFDLHlCQUF5QixHQUFHLFVBQVUsT0FBTyxFQUFFLGlCQUFpQjtJQUNqRyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFDMUIsSUFBSSxZQUFZLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLElBQUksR0FBRyxHQUFHLHVFQUF1RTtZQUN2RiwyQkFBMkIsR0FBQyxZQUFZLEdBQUMsSUFBSSxDQUFDO1FBQ3hDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztZQUNoRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDekQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUN0RCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBQ0YsMEJBQTBCLENBQUMsU0FBUyxDQUFDLG9CQUFvQixHQUFHLFVBQVMsT0FBTztJQUMzRSxJQUFJLEdBQUcsR0FBRyx1RUFBdUUsQ0FBQztJQUNsRixJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7SUFDaEIsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDbkQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNULElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQStCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ1AsSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQzlDLENBQUM7SUFDRixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQztBQUNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSwwQkFBMEIsRUFBRSxDQUFDIn0=