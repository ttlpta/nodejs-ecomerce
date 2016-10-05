var connection = require('../../connection'), _ = require('lodash'), Promise = require('bluebird'), userGroupCombinePermission = require('../UsergroupCombinePermission/usergroupCombinePermissionModel');
var UserGroup = function () {
};
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
UserGroup.prototype.showGroupById = function (params) {
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
        connection.query(sql, [params.id, params.id], function (err, groups) {
            if (err || _.isUndefined(groups[0].group_id))
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
    if (typeof group.id != 'undefined') {
        sql = 'SELECT COUNT(*) as countGroup FROM `apt_user_group` WHERE `group_name` LIKE ? AND `id` != ?';
        param = [group.group_name, group.id];
    }
    else {
        sql = 'SELECT COUNT(*) as countGroup FROM `apt_user_group` WHERE `group_name` LIKE ?';
        param = [group.group_name];
    }
    return new Promise(function (resolve, reject) {
        connection.query(sql, param, function (err, rows) {
            if (err)
                reject();
            var isExisted = (!err && rows[0].countGroup) ? true : false;
            resolve(isExisted);
        });
    });
};
UserGroup.prototype.saveGroup = function (group) {
    return new Promise(function (resolveAll, rejectAll) {
        if (!_.isEmpty(group)) {
            connection.beginTransaction(function (err) {
                if (err)
                    rejectAll();
                if (!_.isUndefined(group.id)) {
                    var updateUserGroupPromise = new Promise(function (resolve, reject) {
                        connection.query('UPDATE `apt_user_group` SET `group_name` = ? WHERE `id` = ?', [group.groupName, +group.id], function (err) {
                            if (err) {
                                reject(err);
                            }
                            ;
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
                                }
                                else {
                                    resolveAll(true);
                                }
                            });
                        });
                    }).catch(function (err) {
                        connection.rollback();
                        rejectAll();
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
                                userGroupCombinePermission.addAllowGroupPermission(+group.id, group.allowPermission)
                                    .then(function () {
                                    resolve();
                                })
                                    .catch(function () {
                                    reject(err);
                                });
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
                        console.log(err);
                        rejectAll();
                        connection.rollback();
                    });
                }
            });
        }
    });
};
UserGroup.prototype.deleteGroup = function (params) {
    if (params.id) {
        return new Promise(function (resolveAll, rejectAll) {
            connection.beginTransaction(function (err) {
                if (err)
                    rejectAll();
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
                        connection.query('DELETE FROM `apt_user_group` WHERE `id` = ?', [+params.id], function (err, res) {
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
                                resolveAll(true);
                            }
                        });
                    });
                }).catch(function (err) {
                    connection.rollback();
                    rejectAll();
                });
            });
        });
    }
};
module.exports = new UserGroup();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcmdyb3VwTW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9Tb3VyY2UvVXNlcmdyb3VwL3VzZXJncm91cE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUN4QyxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUNyQixPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUM3QiwwQkFBMEIsR0FBRyxPQUFPLENBQUMsK0RBQStELENBQUMsQ0FBQztBQUMxRyxJQUFJLFNBQVMsR0FBRztBQUNoQixDQUFDLENBQUM7QUFDRixTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRztJQUM1QixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtRQUN4QyxJQUFJLEdBQUcsR0FBRyxnQ0FBZ0MsQ0FBQztRQUMzQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxVQUFVLEdBQUcsRUFBRSxJQUFJO1lBQ3JDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFBQyxNQUFNLE1BQU0sRUFBRSxDQUFDO1lBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBQ0YsU0FBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsVUFBVSxNQUFNO0lBQ2hELE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO1FBQ3hDLElBQUksR0FBRyxHQUFXLHdHQUF3RztZQUN0SCwrQkFBK0I7WUFDL0Isa0ZBQWtGO1lBQ2xGLGlFQUFpRTtZQUNqRSxtQkFBbUI7WUFDbkIsUUFBUTtZQUNSLHlHQUF5RztZQUN6RywrQkFBK0I7WUFDL0IsbUZBQW1GO1lBQ25GLGtFQUFrRTtZQUNsRSxtQkFBbUIs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