var connection = require('../../connection'),
    util = require('util'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    EventEmitter = require('events').EventEmitter,
    userGroupCombinePermission = require('../UsergroupCombinePermission/usergroupCombinePermissionModel');
var UserGroup = function () {
};
util.inherits(UserGroup, EventEmitter);
UserGroup.prototype.listGroup = function () {
    return new Promise(function (resolve, reject) {
        var sql = 'SELECT * FROM `apt_user_group`';
        connection.query(sql, function (err, rows) {
            if (err) throw reject();
            resolve(rows);
        });
    });
};
UserGroup.prototype.showGroupById = function (groupId) {
    var self = this;
    return new Promise(function (resolve, reject) {
        var sql: string = 'SELECT DISTINCT aug.id AS group_id, aug.group_name AS group_name, apcg.permission_id, ap.code, ap.name' +
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
            if (err || _.isUndefined(groups[0].id)) reject();
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
        param = [group.group_name, group.id]
    } else {
        sql = 'SELECT COUNT(*) as countGroup FROM `apt_user_group` WHERE `group_name` LIKE ?';
        param = [group.group_name]
    }
    connection.query(sql, param, function (err, rows) {
        var isExisted = false;
        if (err) throw err;
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
                if (err) rej();
                if (!_.isUndefined(group.id)) {
                    var updateUserGroupPromise = new Promise(function (resolve, reject) {
                        connection.query('UPDATE `apt_user_group` SET `group_name` = ? WHERE `id` = ?', [group.groupName, +group.id],
                            function (err) {
                                if (err) reject();
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
                                } else {
                                    resolveAll(true);
                                }
                            });
                        });
                    }).catch(function (err) {
                        connection.rollback();
                        rej();
                    });
                } else {
                    var insertUserGroupPromise = new Promise(function (resolve, reject) {
                        connection.query('INSERT INTO `apt_user_group` (`group_name`) VALUES (?)', [group.groupName],
                            function (err, res) {
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
                            } else {
                                resolve();
                            }
                        });
                    }).then(function () {
                        return new Promise(function (resolve, reject) {
                            connection.commit(function (err, res) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolveAll(true);
                                }
                            });
                        });
                    }).catch(function (err) {
                        rej();
                        connection.rollback();
                    });
                }
            })
        }
    });
};
UserGroup.prototype.deleteGroup = function (groupId) {
    var self = this;
    if (groupId) {
        connection.beginTransaction(function (err) {
            if (err) throw err;
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
                    connection.query('DELETE FROM `apt_user_group` WHERE `id` = ?', [+groupId],
                        function (err, res) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                });
            }).then(function () {
                return new Promise(function (resolve, reject) {
                    connection.commit(function (err, res) {
                        if (err) {
                            reject(err);
                        } else {
                            self.emit('delete_group', { success: true });
                        }
                    });
                });
            }).catch(function (err) {
                if (err) throw err;
                connection.rollback();
                self.emit('delete_group', { success: false });
            });
        });
    }
};
module.exports = new UserGroup();