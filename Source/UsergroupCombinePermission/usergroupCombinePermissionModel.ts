var connection = require('../../connection'),
    util = require('util'),
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter;
var UserGroupCombinePermission = function () {
};
util.inherits(UserGroupCombinePermission, EventEmitter);
UserGroupCombinePermission.prototype.addAllowGroupPermission = function (groupId, allowPermissionIds) {
    return new Promise(function (resolve, reject) {
        if (!_.isEmpty(allowPermissionIds)) {
            var insertValues: string = '(' + allowPermissionIds.join(',' + groupId + '),(') + ',' + groupId + ')';
            var sql: string = 'INSERT IGNORE INTO `apt_permission_combine_group` (`permission_id`, `user_group_id`) ' +
                'VALUES ' + insertValues;
            connection.query(sql, function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
};
UserGroupCombinePermission.prototype.removeDenyGroupPermission = function (groupId, denyPermissionIds) {
    return new Promise(function (resolve, reject) {
        if (!_.isEmpty(denyPermissionIds)) {
            var deleteValues: string = denyPermissionIds.join(',');
            var sql: string = 'DELETE FROM `apt_permission_combine_group` WHERE `user_group_id` = ? ' +
                'AND `permission_id` IN ( ' + deleteValues + ' )';
            connection.query(sql, [+groupId], function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });

};
UserGroupCombinePermission.prototype.deleteGroupByGroupId = function (groupId) {
    var sql: string = 'DELETE FROM `apt_permission_combine_group` WHERE `user_group_id` = ? ';
    return new Promise(function (resolve, reject) {
        connection.query(sql, [+groupId], function (err, res) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};
module.exports = new UserGroupCombinePermission();