var connection = require('../connection'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    helper = require('../helper');
var User = function () {
};
util.inherits(User, EventEmitter);
User.prototype.listUser = function (limit, offset, orderBy, sort) {
    var self = this;
    var sql = 'SELECT `id`, `email`, `username`, `group`, `street`, `registered`, `city`, `country`, `state`, `zipcode`' +
        ' FROM `apt_user` ORDER BY `' + orderBy + '` ' + sort + ' LIMIT ? OFFSET ? ';
    connection.query(sql, [+limit, +offset], function (err, rows) {
		if(err) throw err;
        self.emit('list_user', rows);
    });
};
User.prototype.saveUser = function (user) {
    var self = this;
    if (typeof user.id != 'undefined') {
        if (typeof user.password != 'undefined') {
            user.salt = helper.randomString();
            user.password = helper.encodeBase64(user.password) + user.salt;
        }
        connection.query('UPDATE `apt_user` SET ? WHERE `id` = ?', [user, user.id], function (err, res) {
            self.emit('save_user', (res.changedRows) ? user.id : 0);
        });
    } else {
        user.salt = helper.randomString();
        user.password = helper.encodeBase64(user.password) + user.salt;
        connection.query('INSERT INTO `apt_user` SET ?', user, function (err, res) {
			if (err) throw err;
            self.emit('save_user', res.insertId);
        });
    }
};
User.prototype.showUser = function (userId) {
    var self = this;
    connection.query('SELECT `id`, `salt`, `email`, `username`, `group`, `street`, `registered`, `city`, `country`, `state`, `zipcode`' +
        'FROM `apt_user` WHERE `id` = ?', [userId], function (err, rows) {
        var result = {};
        if (typeof rows[0] != 'undefined' && rows[0]) {
            result = {success: true, user: rows[0]};
        } else {
            if (err) throw err;
            result = {success: false, errorCode: 6};
        }
        self.emit('show_user', result);
    }); 
};
User.prototype.deleteUser = function (userId) {
    var self = this;
    connection.query('DELETE FROM `apt_user` WHERE `id` = ?', [userId], function (err, res) {
        var result = {};
        if (res.affectedRows)
            result = {success: true};
        else
            result = {success: false, errorMsg: err};
        self.emit('delete_user', result);
    });
};
User.prototype.validateUser = function (field) {
    var self = this;
    if (typeof field.username != 'undefined') {
        var sql, param;
        if (typeof field.userId != 'undefined') {
            sql = 'SELECT COUNT(*) as countUser FROM `apt_user` WHERE `username` LIKE ? AND `id` != ?';
            param = [field.username, field.userId]
        } else {
            sql = 'SELECT COUNT(*) as countUser FROM `apt_user` WHERE `username` LIKE ?';
            param = [field.username]
        }
        connection.query(sql, param, function (err, rows) {
            var isExisted = false;
            if (!err && rows[0].countUser) {
                isExisted = true;
            }
            self.emit('validate_user', isExisted);
        });
    }
    if (typeof field.email != 'undefined') {
        if (typeof field.userId != 'undefined') {
            sql = 'SELECT COUNT(*) as countUser FROM `apt_user` WHERE `email` = ? AND `id` != ?';
            param = [field.email, field.userId]
        } else {
            sql = 'SELECT COUNT(*) as countUser FROM `apt_user` WHERE `email` = ?';
            param = [field.email]
        }
        connection.query(sql, param, function (err, rows) {
            var isExisted = false;
            if (!err && rows[0].countUser) {
                isExisted = true;
            }
            self.emit('validate_user', isExisted);
        });
    }

};
User.prototype.totalUser = function () {
    var self = this;
    connection.query('SELECT COUNT(*) as total FROM `apt_user`', function (err, rows) {
        self.emit('total_user', rows[0]);
    });
};
User.prototype.getUser = function(options) {
	var self = this;
	var condition = _perpareCondition(options);
	if (condition) {
		connection.query('SELECT `id`, `salt`, `email`, `username`, `group`, `street`, `registered`, `city`, `country`, `state`, `zipcode`' +
		'FROM `apt_user` WHERE '+condition, function (err, rows) {
			var result = {};
			if (rows[0]) {
				result = {user: rows[0]};
			} else {
				if (err) throw err;
				result = [];
			}
			self.emit('get_user', result);
		});
	} else {
		self.emit('get_user', []);
	}
};
var _perpareCondition = function(options){
	var condition = '';
	for (var index in options) {
		if (condition) {
			condition += ' AND ';
		}
		condition += connection.format('`'+index+'` = ?', [options[index]]);
	}
	
	return condition;
};
module.exports = new User();