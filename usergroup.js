var connection = require('./connection'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    userGroupCombinePermission = require('./usergroupCombinePermission');
var UserGroup = function () {
    this.groupNameValidated = false;
};
util.inherits(UserGroup, EventEmitter);
UserGroup.prototype.listGroup = function () {
    var self = this;
    var sql = 'SELECT * FROM `apt_user_group`';
    connection.query(sql, function (err, rows) {
        self.emit('list_group', rows);
    });
};
UserGroup.prototype.showGroup = function (groupId) {
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
        var result = {};
        if (err) throw err;
        if (typeof rows != 'undefined' && rows) {
            result = {success: true, group: rows};
        } else {
            result = {success: false, errorCode: 6};
        }
        self.emit('show_group', result);
    });
};
UserGroup.prototype.validateGroup = function (group) {
    var sql, param;
    var self = this;
    if (typeof group.groupId != 'undefined') {
        sql = 'SELECT COUNT(*) as countGroup FROM `apt_user_group` WHERE `group_name` LIKE ? AND `id` != ?';
        param = [group.groupName, group.groupId]
    } else {
        sql = 'SELECT COUNT(*) as countGroup FROM `apt_user_group` WHERE `group_name` LIKE ?';
        param = [group.groupName]
    }
    connection.query(sql, param, function (err, rows) {
        var isExisted = false;
        if (!err && rows[0].countGroup) {
            isExisted = true;
        }
        self.emit('validate_group', isExisted);
    });
};
UserGroup.prototype.saveGroup = function (group) {
    var self = this;
    connection.beginTransaction(function (err) {
        if (err) throw err;
        if (typeof group.id != 'undefined') {
            if (group.groupName) {
                connection.query('UPDATE `apt_user_group` SET `group_name` = ? WHERE `id` = ?', [group.groupName, +group.id],
                    function (err, res) {
                        if (err) {
                            connection.rollback(function () {
                                throw err;
                            });
                        } else {
							if (group.allowPermission) {
								userGroupCombinePermission.once('add_allow_group_permission_error', function () {
									connection.rollback();
								});
								userGroupCombinePermission.once('add_allow_group_permission_success', function () {
									if (group.denyPermission) {
										console.log('dasdasds');
										userGroupCombinePermission.once('remove_deny_group_permission_error', function () {
											connection.rollback();
										});
										userGroupCombinePermission.once('remove_deny_group_permission_success', function () {
											connection.commit(function (err, res) {
												if (err) {
													connection.rollback(function () {
														throw err;
													});
												} else {
													self.emit('save_group');
												}
											});
										});
										userGroupCombinePermission.removeDenyGroupPermission(+group.id, group.denyPermission);
									} else {
										connection.commit(function (err, res) {
												if (err) {
													connection.rollback(function () {
														throw err;
													});
												} else {
													self.emit('save_group');
												}
											});
									}
								});
								userGroupCombinePermission.addAllowGroupPermission(+group.id, group.allowPermission);
							}
                        }
					});
            }
        } else {
			connection.query('INSERT INTO `apt_user_group` (`group_name`) VALUES (?)', [group.groupName],
				function (err, res) {
					if (err) {
						connection.rollback(function () {
							throw err;
						});
					} else if(res.insertId){
						if (group.allowPermission) {
							var groupId = +res.insertId;
							userGroupCombinePermission.once('add_allow_group_permission_error', function () {
								connection.rollback();
							});
							userGroupCombinePermission.once('add_allow_group_permission_success', function () {
								connection.commit(function (err, res) {
										if (err) {
											connection.rollback(function () {
												throw err;
											});
										} else {
											self.emit('save_group');
										}
									});
							});
							userGroupCombinePermission.addAllowGroupPermission(groupId, group.allowPermission);
						}
					}
				});
		}
    });
};
module.exports = new UserGroup();