var connection = require('../../connection'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;
var UserGroupCombinePermission = function () {
};
util.inherits(UserGroupCombinePermission, EventEmitter);
UserGroupCombinePermission.prototype.addAllowGroupPermission = function (groupId, allowPermissionIds) {
    if (allowPermissionIds) {
        var insertValues = '(' + allowPermissionIds.join(',' + groupId + '),(') + ','+groupId +')';
        var sql = 'INSERT IGNORE INTO `apt_permission_combine_group` (`permission_id`, `user_group_id`) ' +
            'VALUES ' + insertValues;
        var self = this;
        connection.query(sql, function (err, res) {
            if (err) {
                self.emit('add_allow_group_permission_error', err);
            } else {
                self.emit('add_allow_group_permission_success');
            }
        });
    }
};
UserGroupCombinePermission.prototype.removeDenyGroupPermission = function (groupId, denyPermissionIds) {
    if (denyPermissionIds) {
		var deleteValues = denyPermissionIds.join(',');
        var sql = 'DELETE FROM `apt_permission_combine_group` WHERE `user_group_id` = ? ' +
		'AND `permission_id` IN ( '+deleteValues+' )';
        var self = this;
        connection.query(sql, [+groupId], function (err, res) {
            if (err) {
                self.emit('remove_deny_group_permission_error', err);
            } else {
                self.emit('remove_deny_group_permission_success');
            }
        });
    }
};
UserGroupCombinePermission.prototype.deleteGroupByGroupId = function(groupId){
	var sql = 'DELETE FROM `apt_permission_combine_group` WHERE `user_group_id` = ? ';
	var self = this;
	connection.query(sql, [+groupId], function (err, res) {
		if (err) {
			self.emit('remove_group_permission_error', err);
		} else {
			self.emit('remove_group_permission_success');
		}
	});
};
module.exports = new UserGroupCombinePermission();