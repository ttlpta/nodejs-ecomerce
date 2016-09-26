var connection = require('../../connection'), util = require('util'), EventEmitter = require('events').EventEmitter;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcmdyb3VwQ29tYmluZVBlcm1pc3Npb25Nb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL1NvdXJjZS9Vc2VyZ3JvdXBDb21iaW5lUGVybWlzc2lvbi91c2VyZ3JvdXBDb21iaW5lUGVybWlzc2lvbk1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUN4QyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUN0QixZQUFZLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksQ0FBQztBQUNsRCxJQUFJLDBCQUEwQixHQUFHO0FBQ2pDLENBQUMsQ0FBQztBQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDeEQsMEJBQTBCLENBQUMsU0FBUyxDQUFDLHVCQUF1QixHQUFHLFVBQVUsT0FBTyxFQUFFLGtCQUFrQjtJQUNoRyxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxZQUFZLEdBQUcsR0FBRyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBQyxPQUFPLEdBQUUsR0FBRyxDQUFDO1FBQzNGLElBQUksR0FBRyxHQUFHLHVGQUF1RjtZQUM3RixTQUFTLEdBQUcsWUFBWSxDQUFDO1FBQzdCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1lBQ3BDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN2RCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1lBQ3BELENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7QUFDTCxDQUFDLENBQUM7QUFDRiwwQkFBMEIsQ0FBQyxTQUFTLENBQUMseUJBQXlCLEdBQUcsVUFBVSxPQUFPLEVBQUUsaUJBQWlCO0lBQ2pHLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekMsSUFBSSxHQUFHLEdBQUcsdUVBQXVFO1lBQ3ZGLDJCQUEyQixHQUFDLFlBQVksR0FBQyxJQUFJLENBQUM7UUFDeEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1lBQ2hELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN6RCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQ3RELENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7QUFDTCxDQUFDLENBQUM7QUFDRiwwQkFBMEIsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEdBQUcsVUFBUyxPQUFPO0lBQzNFLElBQUksR0FBRyxHQUFHLHVFQUF1RSxDQUFDO0lBQ2xGLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztJQUNoQixVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUNuRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQywrQkFBK0IsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDOUMsQ0FBQztJQUNGLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBQ0YsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLDBCQUEwQixFQUFFLENBQUMifQ==