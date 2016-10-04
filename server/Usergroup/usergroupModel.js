var connection = require('../../connection'), util = require('util'), _ = require('lodash'), Promise = require('bluebird'), EventEmitter = require('events').EventEmitter, userGroupCombinePermission = require('../UsergroupCombinePermission/usergroupCombinePermissionModel');
var UserGroup = function () {
};
util.inherits(UserGroup, EventEmitter);
UserGroup.prototype.listGroup = function () {
    return new Promise(function (resolve, reject) {
        var sql = 'SELECT * FROM `apt_user_group`';
        connection.query(sql, function (err, rows) {
            if (err)
                throw reject();
            resolve(rows);
        });
    });
};
UserGroup.prototype.showGroupById = function (groupId) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var sql = 'SELECT DISTINCT aug.id AS group_id, aug.group_name AS group_name, apcg.permission_id, ap.code, ap.name' +
            ' FROM `apt_user_group` AS aug' +
            ' LEFT JOIN `apt_permission_combine_group` AS apcg ON aug.id = apcg.user_group_id' +
            ' LEFT JOIN `apt_permission` AS ap ON apcg.permission_id = ap.id' +
            ' WHERE aug.id = ?' +
            ' UNION' +
            ' SELECT DISTINCT aug.id AS group_id, aug.group_name AS group_name, apcg.permission_id, ap.code, ap.name' +
            ' FROM `apt_user_group` AS aug' +
            ' RIGHT JOIN `apt_permission_combine_group` AS apcg ON aug.id = apcg.user_group_id' +
            ' RIGHT JOIN `apt_permission` AS ap ON apcg.permission_id = ap.id' +
            ' WHERE aug.id = ?';
        connection.query(sql, [groupId, groupId], function (err, groups) {
            if (err || _.isUndefined(groups[0].id))
                reject();
            var permissionIds = [];
            var group = {
                'id': groups[0].group_id,
                'group_name': groups[0].group_name
            };
            groups.forEach(function (value) {
                if (value.permission_id) {
                    permissionIds.push(value.permission_id);
                }
            });
            if (permissionIds)
                group.permissionId = permissionIds;
            resolve(group);
        });
    });
};
UserGroup.prototype.validateGroup = function (group) {
    var sql, param;
    var self = this;
    if (typeof group.id != 'undefined') {
        sql = 'SELECT COUNT(*) as countGroup FROM `apt_user_group` WHERE `group_name` LIKE ? AND `id` != ?';
        param = [group.group_name, group.id];
    }
    else {
        sql = 'SELECT COUNT(*) as countGroup FROM `apt_user_group` WHERE `group_name` LIKE ?';
        param = [group.group_name];
    }
    connection.query(sql, param, function (err, rows) {
        var isExisted = false;
        if (err)
            throw err;
        if (!err && rows[0].countGroup) {
            isExisted = true;
        }
        self.emit('validate_group', isExisted);
    });
};
UserGroup.prototype.saveGroup = function (group) {
    return new Promise(function (resolveAll, rej) {
        if (!_.isEmpty(group)) {
            connection.beginTransaction(function (err) {
                if (err)
                    rej();
                if (!_.isUndefined(group.id)) {
                    var updateUserGroupPromise = new Promise(function (resolve, reject) {
                        connection.query('UPDATE `apt_user_group` SET `group_name` = ? WHERE `id` = ?', [group.groupName, +group.id], function (err) {
                            if (err)
                                reject();
                            resolve();
                        });
                    });
                    updateUserGroupPromise.then(function () {
                        if (group.allowPermission) {
                            return new Promise(function (resolve, reject) {
                                userGroupCombinePermission.once('add_allow_group_permission_error', function (err) {
                                    reject(err);
                                });
                                userGroupCombinePermission.once('add_allow_group_permission_success', function () {
                                    resolve();
                                });
                                userGroupCombinePermission.addAllowGroupPermission(+group.id, group.allowPermission);
                            });
                        }
                    }).then(function () {
                        if (group.denyPermission) {
                            return new Promise(function (resolve, reject) {
                                userGroupCombinePermission.once('remove_deny_group_permission_error', function (err) {
                                    reject(err);
                                });
                                userGroupCombinePermission.once('remove_deny_group_permission_success', function () {
                                    resolve();
                                });
                                userGroupCombinePermission.removeDenyGroupPermission(+group.id, group.denyPermission);
                            });
                        }
                    }).then(function () {
                        return new Promise(function (resolve, reject) {
                            connection.commit(function (err, res) {
                                if (err) {
                                    reject();
                                }
                                else {
                                    resolveAll(true);
                                }
                            });
                        });
                    }).catch(function (err) {
                        connection.rollback();
                        rej();
                    });
                }
                else {
                    var insertUserGroupPromise = new Promise(function (resolve, reject) {
                        connection.query('INSERT INTO `apt_user_group` (`group_name`) VALUES (?)', [group.groupName], function (err, res) {
                            if (err)
                                reject(err);
                            else
                                resolve(res.insertId);
                        });
                    });
                    insertUserGroupPromise.then(function (groupId) {
                        return new Promise(function (resolve, reject) {
                            if (group.allowPermission.length) {
                                userGroupCombinePermission.once('add_allow_group_permission_error', function (err) {
                                    reject(err);
                                });
                                userGroupCombinePermission.once('add_allow_group_permission_success', function () {
                                    resolve();
                                });
                                userGroupCombinePermission.addAllowGroupPermission(+groupId, group.allowPermission);
                            }
                            else {
                                resolve();
                            }
                        });
                    }).then(function () {
                        return new Promise(function (resolve, reject) {
                            connection.commit(function (err, res) {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolveAll(true);
                                }
                            });
                        });
                    }).catch(function (err) {
                        rej();
                        connection.rollback();
                    });
                }
            });
        }
    });
};
UserGroup.prototype.deleteGroup = function (groupId) {
    var self = this;
    if (groupId) {
        connection.beginTransaction(function (err) {
            if (err)
                throw err;
            var deleteUserGroupCombinePermissionPromise = new Promise(function (resolve, reject) {
                userGroupCombinePermission.once('remove_group_permission_error', function (err) {
                    reject(err);
                });
                userGroupCombinePermission.once('remove_group_permission_success', function () {
                    resolve();
                });
                userGroupCombinePermission.deleteGroupByGroupId(groupId);
            });
            deleteUserGroupCombinePermissionPromise.then(function () {
                return new Promise(function (resolve, reject) {
                    connection.query('DELETE FROM `apt_user_group` WHERE `id` = ?', [+groupId], function (err, res) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            }).then(function () {
                return new Promise(function (resolve, reject) {
                    connection.commit(function (err, res) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            self.emit('delete_group', { success: true });
                        }
                    });
                });
            }).catch(function (err) {
                if (err)
                    throw err;
                connection.rollback();
                self.emit('delete_group', { success: false });
            });
        });
    }
};
module.exports = new UserGroup();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcmdyb3VwTW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9Tb3VyY2UvVXNlcmdyb3VwL3VzZXJncm91cE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUN4QyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUN0QixDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUNyQixPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUM3QixZQUFZLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksRUFDN0MsMEJBQTBCLEdBQUcsT0FBTyxDQUFDLCtEQUErRCxDQUFDLENBQUM7QUFDMUcsSUFBSSxTQUFTLEdBQUc7QUFDaEIsQ0FBQyxDQUFDO0FBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDdkMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUc7SUFDNUIsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07UUFDeEMsSUFBSSxHQUFHLEdBQUcsZ0NBQWdDLENBQUM7UUFDM0MsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsVUFBVSxHQUFHLEVBQUUsSUFBSTtZQUNyQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQUMsTUFBTSxNQUFNLEVBQUUsQ0FBQztZQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUNGLFNBQVMsQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFVBQVUsT0FBTztJQUNqRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7SUFDaEIsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07UUFDeEMsSUFBSSxHQUFHLEdBQVcsd0dBQXdHO1lBQ3RILCtCQUErQjtZQUMvQixrRkFBa0Y7WUFDbEYsaUVBQWlFO1lBQ2pFLG1CQUFtQjtZQUNuQixRQUFRO1lBQ1IseUdBQXlHO1lBQ3pHLCtCQUErQjtZQUMvQixtRkFBbUY7WUFDbkYsa0VBQWtFO1lBQ2xFLG1CQUFtQixDQUFDO1FBQ3hCLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFLFVBQVUsR0FBRyxFQUFFLE1BQU07WUFDM0QsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2pELElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQztZQUN2QixJQUFJLEtBQUssR0FBRztnQkFDUixJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVE7Z0JBQ3hCLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVTthQUNyQyxDQUFDO1lBQ0YsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEtBQUs7Z0JBQzFCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO29CQUN0QixhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDNUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0gsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDO2dCQUNkLEtBQUssQ0FBQyxZQUFZLEdBQUcsYUFBYSxDQUFDO1lBQ3ZDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBQ0YsU0FBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsVUFBVSxLQUFLO0lBQy9DLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQztJQUNmLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztJQUNoQixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxFQUFFLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqQyxHQUFHLEdBQUcsNkZBQTZGLENBQUM7UUFDcEcsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDeEMsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ0osR0FBRyxHQUFHLCtFQUErRSxDQUFDO1FBQ3RGLEtBQUssR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUM5QixDQUFDO0lBQ0QsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFVBQVUsR0FBRyxFQUFFLElBQUk7UUFDNUMsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUFDLE1BQU0sR0FBRyxDQUFDO1FBQ25CLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzdCLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDckIsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDM0MsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUM7QUFDRixTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFVLEtBQUs7SUFDM0MsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsVUFBVSxFQUFFLEdBQUc7UUFDeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixVQUFVLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxHQUFHO2dCQUNyQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2YsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLElBQUksc0JBQXNCLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTt3QkFDOUQsVUFBVSxDQUFDLEtBQUssQ0FBQyw2REFBNkQsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQ3hHLFVBQVUsR0FBRzs0QkFDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0NBQUMsTUFBTSxFQUFFLENBQUM7NEJBQ2xCLE9BQU8sRUFBRSxDQUFDO3dCQUNkLENBQUMsQ0FBQyxDQUFDO29CQUNYLENBQUMsQ0FBQyxDQUFDO29CQUNILHNCQUFzQixDQUFDLElBQUksQ0FBQzt3QkFDeEIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7NEJBQ3hCLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO2dDQUN4QywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLEVBQUUsVUFBVSxHQUFHO29DQUM3RSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0NBQ2hCLENBQUMsQ0FBQyxDQUFDO2dDQUNILDBCQUEwQixDQUFDLElBQUksQ0FBQyxvQ0FBb0MsRUFBRTtvQ0FDbEUsT0FBTyxFQUFFLENBQUM7Z0NBQ2QsQ0FBQyxDQUFDLENBQUM7Z0NBQ0gsMEJBQTBCLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQzs0QkFDekYsQ0FBQyxDQUFDLENBQUM7d0JBQ1AsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7d0JBQ0osRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZCLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO2dDQUN4QywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUUsVUFBVSxHQUFHO29DQUMvRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0NBQ2hCLENBQUMsQ0FBQyxDQUFDO2dDQUNILDBCQUEwQixDQUFDLElBQUksQ0FBQyxzQ0FBc0MsRUFBRTtvQ0FDcEUsT0FBTyxFQUFFLENBQUM7Z0NBQ2QsQ0FBQyxDQUFDLENBQUM7Z0NBQ0gsMEJBQTBCLENBQUMseUJBQXlCLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQzs0QkFDMUYsQ0FBQyxDQUFDLENBQUM7d0JBQ1AsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7d0JBQ0osTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07NEJBQ3hDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLEVBQUUsR0FBRztnQ0FDaEMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQ0FDTixNQUFNLEVBQUUsQ0FBQztnQ0FDYixDQUFDO2dDQUFDLElBQUksQ0FBQyxDQUFDO29DQUNKLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQ0FDckIsQ0FBQzs0QkFDTCxDQUFDLENBQUMsQ0FBQzt3QkFDUCxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHO3dCQUNsQixVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQ3RCLEdBQUcsRUFBRSxDQUFDO29CQUNWLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osSUFBSSxzQkFBc0IsR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO3dCQUM5RCxVQUFVLENBQUMsS0FBSyxDQUFDLHdEQUF3RCxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUN4RixVQUFVLEdBQUcsRUFBRSxHQUFHOzRCQUNkLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQ0FDSixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQ2hCLElBQUk7Z0NBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDOUIsQ0FBQyxDQUFDLENBQUM7b0JBQ1gsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsc0JBQXNCLENBQUMsSUFBSSxDQUFDLFVBQVUsT0FBTzt3QkFDekMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07NEJBQ3hDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQ0FFL0IsMEJBQTBCLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxFQUFFLFVBQVUsR0FBRztvQ0FDN0UsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dDQUNoQixDQUFDLENBQUMsQ0FBQztnQ0FDSCwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUU7b0NBQ2xFLE9BQU8sRUFBRSxDQUFDO2dDQUNkLENBQUMsQ0FBQyxDQUFDO2dDQUNILDBCQUEwQixDQUFDLHVCQUF1QixDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQzs0QkFDeEYsQ0FBQzs0QkFBQyxJQUFJLENBQUMsQ0FBQztnQ0FDSixPQUFPLEVBQUUsQ0FBQzs0QkFDZCxDQUFDO3dCQUNMLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzt3QkFDSixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTs0QkFDeEMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsRUFBRSxHQUFHO2dDQUNoQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29DQUNOLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQ0FDaEIsQ0FBQztnQ0FBQyxJQUFJLENBQUMsQ0FBQztvQ0FDSixVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQ3JCLENBQUM7NEJBQ0wsQ0FBQyxDQUFDLENBQUM7d0JBQ1AsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRzt3QkFDbEIsR0FBRyxFQUFFLENBQUM7d0JBQ04sVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUMxQixDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUE7UUFDTixDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUM7QUFDRixTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLE9BQU87SUFDL0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDVixVQUFVLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxHQUFHO1lBQ3JDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFBQyxNQUFNLEdBQUcsQ0FBQztZQUNuQixJQUFJLHVDQUF1QyxHQUFHLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07Z0JBQy9FLDBCQUEwQixDQUFDLElBQUksQ0FBQywrQkFBK0IsRUFBRSxVQUFVLEdBQUc7b0JBQzFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsMEJBQTBCLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxFQUFFO29CQUMvRCxPQUFPLEVBQUUsQ0FBQztnQkFDZCxDQUFDLENBQUMsQ0FBQztnQkFDSCwwQkFBMEIsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3RCxDQUFDLENBQUMsQ0FBQztZQUNILHVDQUF1QyxDQUFDLElBQUksQ0FBQztnQkFDekMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07b0JBQ3hDLFVBQVUsQ0FBQyxLQUFLLENBQUMsNkNBQTZDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUN0RSxVQUFVLEdBQUcsRUFBRSxHQUFHO3dCQUNkLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7NEJBQ04sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNoQixDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNKLE9BQU8sRUFBRSxDQUFDO3dCQUNkLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ0osTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07b0JBQ3hDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLEVBQUUsR0FBRzt3QkFDaEMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs0QkFDTixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2hCLENBQUM7d0JBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ0osSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzt3QkFDakQsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUc7Z0JBQ2xCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFBQyxNQUFNLEdBQUcsQ0FBQztnQkFDbkIsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ2xELENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBQ0YsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDIn0=