var connection = require('./connection'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;
var UserGroupCombinePermission = function () {
};
util.inherits(UserGroupCombinePermission, EventEmitter);
UserGroupCombinePermission.prototype.addGroupPermission = function (groupId, allowPermissionIds) {
    if (allowPermissionIds) {
        var insertValues = '(' + allowPermissionIds.join(',' + groupId + '),(') + ','+groupId +')';
        var sql = 'INSERT IGNORE INTO `apt_permission_combine_group` (`permission_id`, `user_group_id`) ' +
            'VALUES ' + insertValues;
        var self = this;
        connection.query(sql, function (err, res) {
            if (err) {
                self.emit('add_group_permission_error');
            } else {
                self.emit('add_group_permission_success');
            }
        });
    }

};
module.exports = new UserGroupCombinePermission();