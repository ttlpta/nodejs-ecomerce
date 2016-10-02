var connection = require('../../connection'),
    util = require('util'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter,
    helper = require('../helper');
var User = function () {
};
util.inherits(User, EventEmitter);
User.prototype.listUser = function (limit: number, offset: number, orderBy: string, sort: string, condition: string): any {
    return new Promise(function (resolve, reject) {
        var sql = helper.buildQuery
            .select(['id', 'email', 'username', 'group', 'street', 'city', 'country', 'state', 'zipcode'])
            .from('apt_user');
        if (condition) {
            sql = sql.where(condition);
        }
        sql = sql.orderBy(orderBy, sort).limit(+limit, +offset).render();
        connection.query(sql, (err, users) => {
            if (err) throw err;
            var listUsers = [];
            for (var user of users) {
                user.address = user.street + ',' + user.city + ',' + user.country + ',' + user.state + ',' + user.zipcode;
                user = _.omit(user, ['street', 'city', 'country', 'state', 'zipcode']);
                listUsers.push(user);
            }
            resolve(listUsers);
        });
    });
};
User.prototype.saveUser = function (user) {
    return new Promise(function (resolve, reject) {
        if (!_.isUndefined(user.password)) {
            user.salt = helper.randomString();
            user.password = helper.encodeBase64(user.password) + user.salt;
        }
        if (!_.isUndefined(user.id)) {
            connection.query('UPDATE `apt_user` SET ? WHERE `id` = ?', [user, user.id], function (err, res) {
                resolve((res.changedRows) ? user.id : 0);
            });
        } else {
            connection.query('INSERT INTO `apt_user` SET ?', user, function (err, res) {
                if (err) throw err;
                resolve(res.insertId);
            });
        }
    });
};
User.prototype.showUserById = function (userId) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT `id`, `salt`, `email`, `username`, `group`, `street`, `registered`, `city`, `country`, `state`, `zipcode`' +
            'FROM `apt_user` WHERE `id` = ?', [userId], (err, rows) => {
                if (err) throw err;
                resolve((!_.isUndefined(rows[0].id)) ? rows[0] : {});
            });
    });
};
User.prototype.deleteUser = function (userId) {
    return new Promise(function (resolve, reject) {
        connection.query('DELETE FROM `apt_user` WHERE `id` = ?', [userId], function (err, res) {
            resolve({ success: (res.affectedRows) ? true : false });
        });
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
    return new Promise(function (resolve, reject) {
        connection.query('SELECT COUNT(*) as total FROM `apt_user`', function (err, rows) {
            resolve(rows[0]);
        });
    });
};
User.prototype.userLogin = function (data) {
    var self = this;
    var sql = connection.format('SELECT `id`, `password`, `salt`, `email`, `username`, `group`, `street`,' +
        ' `registered`, `city`, `country`, `state`, `zipcode` FROM `apt_user` WHERE `username` = ? AND `group` !=  5', data.username);
    connection.query(sql, function (err, rows) {
        if (rows[0]) {
            var encryptPassword = helper.encodeBase64(data.password) + rows[0].salt;
            if (encryptPassword === rows[0].password && delete rows[0].password) {
                self.emit('user_login', rows[0]);
            } else {
                self.emit('user_login', false);
            }
        } else {
            self.emit('user_login', false);
        }
    });
};
User.prototype.getUser = function (options) {
    var self = this;
    var condition = _perpareCondition(options);
    if (condition) {
        connection.query('SELECT `id`, `salt`, `email`, `username`, `group`, `street`,' +
            ' `registered`, `city`, `country`, `state`, `zipcode`' +
            'FROM `apt_user` WHERE ' + condition, function (err, rows) {
                var result = {};
                if (rows) {
                    result = rows;
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
var _perpareCondition = function (conditions) {
    var condition = '';
    for (var index in conditions) {
        if (condition) {
            condition += ' AND ';
        }
        condition += connection.format('`' + index + '` = ?', [conditions[index]]);
    }

    return condition;
};
module.exports = new User();