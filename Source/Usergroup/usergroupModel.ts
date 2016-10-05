var connection = require('../../connection'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    userGroupCombinePermission = require('../UsergroupCombinePermission/usergroupCombinePermissionModel');
var UserGroup = function () {
};
UserGroup.prototype.listGroup = function () {
    return new Promise(function (resolve, reject) {
        var sql = 'SELECT * FROM `apt_user_group`';
        connection.query(sql, function (err, rows) {
            if (err) throw reject();
            resolve(rows);
        });
    });
};
UserGroup.prototype.showGroupById = function (params) {
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
        connection.query(sql, [params.id, params.id], function (err, groups) {
            if (err || _.isUndefined(groups[0].group_id)) reject();
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
    var sql: string, param: string[];
    if (typeof group.id != 'undefined') {
        sql = 'SELECT COUNT(*) as countGroup FROM `apt_user_group` WHERE `group_name` LIKE ? AND `id` != ?';
        param = [group.group_name, group.id]
    } else {
        sql = 'SELECT COUNT(*) as countGroup FROM `apt_user_group` WHERE `group_name` LIKE ?';
        param = [group.group_name]
    }

    return new Promise(function (resolve, reject) {
        connection.query(sql, param, function (err, rows) {
            if (err) reject();
            var isExisted = (!err && rows[0].countGroup) ? true : false;
            resolve(isExisted);
        });
    });
};
UserGroup.prototype.saveGroup = function (group) {
    return new Promise(function (resolveAll, rejectAll) {
        if (!_.isEmpty(group)) {
            connection.beginTransaction(function (err) {
                if (err) rejectAll();
                if (!_.isUndefined(group.id)) {
                    var updateUserGroupPromise = new Promise(function (resolve, reject) {
                        connection.query('UPDATE `apt_user_group` SET `group_name` = ? WHERE `id` = ?', [group.groupName, +group.id],
                            function (err) {
                                if (err) {
                                    reject(err)
                                };
                                resolve();
                            });
                    });
                    updateUserGroupPromise.then(function () {
                        return new Promise(function (resolve, reject) {
                            userGroupCombinePermission.addAllowGroupPermission(+group.id, group.allowPermission)
                                .then(function () {
                                    resolve();
                                })
                                .catch(function (err) {
                                    reject(err);
                                });
                        });
                    }).then(function () {
                        return new Promise(function (resolve, reject) {
                            userGroupCombinePermission.removeDenyGroupPermission(+group.id, group.denyPermission)
                                .then(function () {
                                    resolve();
                                })
                                .catch(function (err) {
                                    reject(err);
                                });
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
                        connection.rollback();
                        rejectAll();
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
                                userGroupCombinePermission.addAllowGroupPermission(+group.id, group.allowPermission)
                                    .then(function () {
                                        resolve();
                                    })
                                    .catch(function () {
                                        reject(err);
                                    });
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
                        console.log(err);
                        rejectAll();
                        connection.rollback();
                    });
                }
            })
        }
    });
};
UserGroup.prototype.deleteGroup = function (params) {
    if (params.id) {
        return new Promise(function (resolveAll, rejectAll) {
            connection.beginTransaction(function (err) {
                if (err) rejectAll();
                var deleteUserGroupCombinePermissionPromise = new Promise(function (resolve, reject) {
                    userGroupCombinePermission.deleteGroupByGroupId(params.id)
                        .then(function () {
                            resolve();
                        })
                        .catch(function () {
                            reject(err);
                        });
                });
                deleteUserGroupCombinePermissionPromise.then(function () {
                    return new Promise(function (resolve, reject) {
                        connection.query('DELETE FROM `apt_user_group` WHERE `id` = ?', [+params.id],
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
                                resolveAll(true);
                            }
                        });
                    });
                }).catch(function (err) {
                    connection.rollback();
                    rejectAll()
                });
            });
        });
    }
};
module.exports = new UserGroup();