var connection = require('../../connection'), util = require('util'), Promise = require('bluebird'), EventEmitter = require('events').EventEmitter, userGroupCombinePermission = require('../UsergroupCombinePermission/usergroupCombinePermissionModel');
var UserGroup = function () {
};
util.inherits(UserGroup, EventEmitter);
UserGroup.prototype.listGroup = function () {
    var self = this;
    var sql = 'SELECT * FROM `apt_user_group`';
    connection.query(sql, function (err, rows) {
        if (err)
            throw err;
        self.emit('list_group', rows);
    });
};
UserGroup.prototype.showGroupById = function (groupId) {
    var self = this;
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
    connection.query(sql, [groupId, groupId], function (err, rows) {
        if (err)
            throw err;
        var result;
        if (typeof rows != 'undefined' && rows) {
            result = { success: true, group: rows };
        }
        else {
            result = { success: false, errorCode: 6 };
        }
        self.emit('show_group', result);
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
    var self = this;
    if (group.groupName) {
        connection.beginTransaction(function (err) {
            if (err)
                throw err;
            if (typeof group.id != 'undefined') {
                var updateUserGroupPromise = new Promise(function (resolve, reject) {
                    connection.query('UPDATE `apt_user_group` SET `group_name` = ? WHERE `id` = ?', [group.groupName, +group.id], function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
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
                                reject(err);
                            }
                            else {
                                self.emit('save_group', { success: true });
                            }
                        });
                    });
                }).catch(function (err) {
                    if (err)
                        throw err;
                    connection.rollback();
                    self.emit('save_group', { success: false });
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
                                self.emit('save_group', { success: true });
                            }
                        });
                    });
                }).catch(function (err) {
                    if (err)
                        throw err;
                    connection.rollback();
                    self.emit('save_group', { success: false });
                });
            }
        });
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcmdyb3VwTW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9Tb3VyY2UvVXNlcmdyb3VwL3VzZXJncm91cE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUN4QyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUN0QixPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUM3QixZQUFZLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksRUFDN0MsMEJBQTBCLEdBQUcsT0FBTyxDQUFDLCtEQUErRCxDQUFDLENBQUM7QUFDMUcsSUFBSSxTQUFTLEdBQUc7QUFDaEIsQ0FBQyxDQUFDO0FBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDdkMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUc7SUFDNUIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLElBQUksR0FBRyxHQUFHLGdDQUFnQyxDQUFDO0lBQzNDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLFVBQVUsR0FBRyxFQUFFLElBQUk7UUFDckMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQUMsTUFBTyxHQUFHLENBQUM7UUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUM7QUFDRixTQUFTLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxVQUFVLE9BQU87SUFDakQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLElBQUksR0FBRyxHQUFHLHdHQUF3RztRQUM5RywrQkFBK0I7UUFDL0Isa0ZBQWtGO1FBQ2xGLGlFQUFpRTtRQUNqRSxtQkFBbUI7UUFDbkIsUUFBUTtRQUNSLHlHQUF5RztRQUN6RywrQkFBK0I7UUFDL0IsbUZBQW1GO1FBQ25GLGtFQUFrRTtRQUNsRSxtQkFBbUIsQ0FBQztJQUN4QixVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRSxVQUFVLEdBQUcsRUFBRSxJQUFJO1FBQ3pELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUFDLE1BQU0sR0FBRyxDQUFDO1FBQ25CLElBQUksTUFBTSxDQUFDO1FBQ1gsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksV0FBVyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDckMsTUFBTSxHQUFHLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUM7UUFDMUMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxHQUFHLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFDLENBQUM7UUFDNUMsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBQ0YsU0FBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsVUFBVSxLQUFLO0lBQy9DLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQztJQUNmLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztJQUNoQixFQUFFLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxFQUFFLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqQyxHQUFHLEdBQUcsNkZBQTZGLENBQUM7UUFDcEcsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDeEMsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ0osR0FBRyxHQUFHLCtFQUErRSxDQUFDO1FBQ3RGLEtBQUssR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUM5QixDQUFDO0lBQ0QsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFVBQVUsR0FBRyxFQUFFLElBQUk7UUFDNUMsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUFDLE1BQU0sR0FBRyxDQUFDO1FBQ25CLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzdCLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDckIsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDM0MsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUM7QUFDRixTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxVQUFVLEtBQUs7SUFDM0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEdBQUc7WUFDckMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUFDLE1BQU0sR0FBRyxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLEVBQUUsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLHNCQUFzQixHQUFHLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07b0JBQzlELFVBQVUsQ0FBQyxLQUFLLENBQUMsNkRBQTZELEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUN4RyxVQUFVLEdBQUc7d0JBQ1QsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs0QkFDTixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2hCLENBQUM7d0JBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ0osT0FBTyxFQUFFLENBQUM7d0JBQ2QsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDWCxDQUFDLENBQUMsQ0FBQztnQkFDSCxzQkFBc0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO3dCQUN4QixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTs0QkFDeEMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxFQUFFLFVBQVUsR0FBRztnQ0FDN0UsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUNoQixDQUFDLENBQUMsQ0FBQzs0QkFDSCwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLEVBQUU7Z0NBQ2xFLE9BQU8sRUFBRSxDQUFDOzRCQUNkLENBQUMsQ0FBQyxDQUFDOzRCQUNILDBCQUEwQixDQUFDLHVCQUF1QixDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7d0JBQ3pGLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNKLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO3dCQUN2QixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTs0QkFDeEMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLFVBQVUsR0FBRztnQ0FDL0UsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUNoQixDQUFDLENBQUMsQ0FBQzs0QkFDSCwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsc0NBQXNDLEVBQUU7Z0NBQ3BFLE9BQU8sRUFBRSxDQUFDOzRCQUNkLENBQUMsQ0FBQyxDQUFDOzRCQUNILDBCQUEwQixDQUFDLHlCQUF5QixDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7d0JBQzFGLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNKLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO3dCQUN4QyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxFQUFFLEdBQUc7NEJBQ2hDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0NBQ04sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUNoQixDQUFDOzRCQUFDLElBQUksQ0FBQyxDQUFDO2dDQUNKLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7NEJBQzdDLENBQUM7d0JBQ0wsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRztvQkFDbEIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO3dCQUFDLE1BQU0sR0FBRyxDQUFDO29CQUNuQixVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7Z0JBQzlDLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLElBQUksc0JBQXNCLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtvQkFDOUQsVUFBVSxDQUFDLEtBQUssQ0FBQyx3REFBd0QsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFDeEYsVUFBVSxHQUFHLEVBQUUsR0FBRzt3QkFDZCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7NEJBQ0osTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNoQixJQUFJOzRCQUNBLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzlCLENBQUMsQ0FBQyxDQUFDO2dCQUNYLENBQUMsQ0FBQyxDQUFDO2dCQUNILHNCQUFzQixDQUFDLElBQUksQ0FBQyxVQUFVLE9BQU87b0JBQ3pDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO3dCQUN4QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7NEJBRS9CLDBCQUEwQixDQUFDLElBQUksQ0FBQyxrQ0FBa0MsRUFBRSxVQUFVLEdBQUc7Z0NBQzdFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDaEIsQ0FBQyxDQUFDLENBQUM7NEJBQ0gsMEJBQTBCLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxFQUFFO2dDQUNsRSxPQUFPLEVBQUUsQ0FBQzs0QkFDZCxDQUFDLENBQUMsQ0FBQzs0QkFDSCwwQkFBMEIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7d0JBQ3hGLENBQUM7d0JBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ0osT0FBTyxFQUFFLENBQUM7d0JBQ2QsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQ0osTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07d0JBQ3hDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLEVBQUUsR0FBRzs0QkFDaEMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQ0FDTixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQ2hCLENBQUM7NEJBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQ0osSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQzs0QkFDN0MsQ0FBQzt3QkFDTCxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHO29CQUNsQixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7d0JBQUMsTUFBTSxHQUFHLENBQUM7b0JBQ25CLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztnQkFDOUMsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0FBQ0wsQ0FBQyxDQUFDO0FBQ0YsU0FBUyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsVUFBVSxPQUFPO0lBQy9DLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztJQUNoQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ1YsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsR0FBRztZQUNyQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQUMsTUFBTSxHQUFHLENBQUM7WUFDbkIsSUFBSSx1Q0FBdUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO2dCQUMvRSwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsK0JBQStCLEVBQUUsVUFBVSxHQUFHO29CQUMxRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2hCLENBQUMsQ0FBQyxDQUFDO2dCQUNILDBCQUEwQixDQUFDLElBQUksQ0FBQyxpQ0FBaUMsRUFBRTtvQkFDL0QsT0FBTyxFQUFFLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsMEJBQTBCLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0QsQ0FBQyxDQUFDLENBQUM7WUFDSCx1Q0FBdUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3pDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO29CQUN4QyxVQUFVLENBQUMsS0FBSyxDQUFDLDZDQUE2QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFDdEUsVUFBVSxHQUFHLEVBQUUsR0FBRzt3QkFDZCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOzRCQUNOLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDaEIsQ0FBQzt3QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDSixPQUFPLEVBQUUsQ0FBQzt3QkFDZCxDQUFDO29CQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNYLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNKLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO29CQUN4QyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxFQUFFLEdBQUc7d0JBQ2hDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7NEJBQ04sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNoQixDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNKLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7d0JBQy9DLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHO2dCQUNsQixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQ25CLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztZQUNoRCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztBQUNMLENBQUMsQ0FBQztBQUNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQyJ9