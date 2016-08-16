var connection = require('./connection'),
    util = require('util'),
    Promise = require('bluebird'),
    EventEmitter = require('events').EventEmitter,
    userGroupCombinePermission = require('./usergroupCombinePermission');
var UserGroup = function () {
};
util.inherits(UserGroup, EventEmitter);
UserGroup.prototype.listGroup = function () {
    var self = this;
    var sql = 'SELECT * FROM `apt_user_group`';
    connection.query(sql, function (err, rows) {
        if (err) throw  err;
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
        if (err) throw err;
        var result;
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
    var self = this;
	if (group.groupName) {
		connection.beginTransaction(function (err) {
			if (err) throw err;
			if (typeof group.id != 'undefined') {
				var updateUserGroupPromise = new Promise(function (resolve, reject) {
					connection.query('UPDATE `apt_user_group` SET `group_name` = ? WHERE `id` = ?', [group.groupName, +group.id],
						function (err) {
							if (err) {
								reject(err);
							} else {
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
							} else {
								self.emit('save_group', {success: true});
							}
						});
					});
				}).catch(function (err) {
					if (err) throw err;
					connection.rollback();
					self.emit('save_group', {success: false});
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
					if (group.allowPermission) {
						return new Promise(function (resolve, reject) {
							userGroupCombinePermission.once('add_allow_group_permission_error', function (err) {
								reject(err);
							});
							userGroupCombinePermission.once('add_allow_group_permission_success', function () {
								resolve();
							});
							userGroupCombinePermission.addAllowGroupPermission(+groupId, group.allowPermission);
						});
					}
				}).then(function () {
					return new Promise(function (resolve, reject) {
						connection.commit(function (err, res) {
							if (err) {
								reject(err);
							} else {
								self.emit('save_group', {success: true});
							}
						});
					});
				}).catch(function (err) {
					if (err) throw err;
					connection.rollback();
					self.emit('save_group', {success: false});
				});
			}
		})
	};
};
UserGroup.prototype.deleteGroup = function (groupId) {
	var self = this;
	if (groupId){
		connection.beginTransaction(function (err) {
			if (err) throw err;
			var deteteUserGroupCombinePermissionPromise = new Promise(function (resolve, reject) {
				userGroupCombinePermission.once('remove_group_permission_error', function(err){
					reject(err);
				});
				userGroupCombinePermission.once('remove_group_permission_success', function(){
					resolve();
				});
				userGroupCombinePermission.deleteGroupByGroupId(groupId);
			});
			deteteUserGroupCombinePermissionPromise.then(function(){
				return new Promise(function(resolve, reject){
					connection.query('DELETE FROM `apt_user_group` WHERE `id` = ?', [+groupId],
						function(err, res){
							if (err) {
								reject(err);
							} else {
								resolve();
							}
						});
				});
			}).then(function(){
				return new Promise(function (resolve, reject) {
					connection.commit(function (err, res) {
						if (err) {
							reject(err);
						} else {
							self.emit('delete_group', {success: true});
						}
					});
				});
			}).catch(function(err){
				if (err) throw err;
				connection.rollback();
				self.emit('delete_group', {success: false});
			});
		});
	}
}
module.exports = new UserGroup();