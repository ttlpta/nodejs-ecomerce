var connection = require('../connection'), util = require('util'), Promise = require('bluebird'), EventEmitter = require('events').EventEmitter, userGroupCombinePermission = require('../UsergroupCombinePermission/usergroupCombinePermissionModel');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcmdyb3VwTW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9Tb3VyY2UvVXNlcmdyb3VwL3VzZXJncm91cE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFDckMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFDdEIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFDN0IsWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLEVBQzdDLDBCQUEwQixHQUFHLE9BQU8sQ0FBQywrREFBK0QsQ0FBQyxDQUFDO0FBQzFHLElBQUksU0FBUyxHQUFHO0FBQ2hCLENBQUMsQ0FBQztBQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3ZDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHO0lBQzVCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztJQUNoQixJQUFJLEdBQUcsR0FBRyxnQ0FBZ0MsQ0FBQztJQUMzQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxVQUFVLEdBQUcsRUFBRSxJQUFJO1FBQ3JDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUFDLE1BQU8sR0FBRyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBQ0YsU0FBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsVUFBVSxPQUFPO0lBQ2pELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztJQUNoQixJQUFJLEdBQUcsR0FBRyx3R0FBd0c7UUFDOUcsK0JBQStCO1FBQy9CLGtGQUFrRjtRQUNsRixpRUFBaUU7UUFDakUsbUJBQW1CO1FBQ25CLFFBQVE7UUFDUix5R0FBeUc7UUFDekcs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