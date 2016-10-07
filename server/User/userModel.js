var connection = require('../../connection'), util = require('util'), Promise = require('bluebird'), _ = require('lodash'), EventEmitter = require('events').EventEmitter, helper = require('../helper');
function User() { }
;
var _User = new User();
User.prototype.listUser = function (params) {
    return new Promise(function (resolve, reject) {
        var sql = helper.buildQuery
            .select(['id', 'email', 'username', 'group', 'street', 'city', 'country', 'state', 'zipcode'])
            .from('apt_user');
        var condition = (typeof params.username != 'undefined') ? '`username` LIKE "%' + params.username + '%"' : '';
        if (condition) {
            sql = sql.where(condition);
        }
        sql = sql.orderBy(params.orderBy, params.sort).limit(+params.limit, +params.offset).render();
        connection.query(sql, (err, users) => {
            if (err)
                reject();
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
                if (err)
                    reject(err);
                resolve((res.changedRows) ? true : false);
            });
        }
        else {
            connection.query('INSERT INTO `apt_user` SET ?', user, function (err, res) {
                if (err)
                    reject(err);
                resolve(res.insertId);
            });
        }
    });
};
User.prototype.showUserById = function (params) {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT `id`, `salt`, `email`, `username`, `group`, `street`, `registered`, `city`, `country`, `state`, `zipcode`' +
            'FROM `apt_user` WHERE `id` = ?', [params.userId], (err, rows) => {
            if (err)
                reject();
            resolve((!_.isUndefined(rows[0].id)) ? rows[0] : {});
        });
    });
};
User.prototype.deleteUser = function (params) {
    return new Promise(function (resolve, reject) {
        connection.query('DELETE FROM `apt_user` WHERE `id` = ?', [params.userId], function (err, res) {
            resolve({ success: (res.affectedRows) ? true : false });
        });
    });
};
User.prototype.validateUser = function (field) {
    return new Promise(function (resolve, reject) {
        var sql, param;
        if (!_.isUndefined(field.username)) {
            if (!_.isUndefined(field.userId)) {
                sql = 'SELECT COUNT(*) as countUser FROM `apt_user` WHERE `username` LIKE ? AND `id` != ?';
                param = [field.username, field.userId];
            }
            else {
                sql = 'SELECT COUNT(*) as countUser FROM `apt_user` WHERE `username` LIKE ?';
                param = [field.username];
            }
        }
        if (!_.isUndefined(field.email)) {
            if (!_.isUndefined(field.userId)) {
                sql = 'SELECT COUNT(*) as countUser FROM `apt_user` WHERE `email` = ? AND `id` != ?';
                param = [field.email, field.userId];
            }
            else {
                sql = 'SELECT COUNT(*) as countUser FROM `apt_user` WHERE `email` = ?';
                param = [field.email];
            }
        }
        connection.query(sql, param, function (err, rows) {
            resolve((!err && rows[0].countUser));
        });
    });
};
User.prototype.totalUser = function () {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT COUNT(*) as total FROM `apt_user`', function (err, rows) {
            if (err)
                reject();
            resolve(rows[0]);
        });
    });
};
User.prototype.userLogin = function (params) {
    var self = this;
    var sql = connection.format('SELECT `id`, `group`, `password`, `salt`' +
        ' FROM `apt_user` WHERE `username` = ? AND `group` !=  5', params.username);
    return new Promise(function (resolve, reject) {
        connection.query(sql, function (err, rows) {
            if (err)
                reject(err);
            if (rows[0]) {
                var encryptPassword = helper.encodeBase64(params.password) + rows[0].salt;
                if (encryptPassword === rows[0].password) {
                    var result = {
                        success: true,
                        hash: helper.encodeBase64(JSON.stringify(_.omit(rows[0], ['password', 'salt'])))
                    };
                    resolve(result);
                }
                else {
                    reject();
                }
            }
            else {
                reject();
            }
        });
    });
};
User.prototype.getUser = function (options) {
    return new Promise(function (resolve, reject) {
        var condition = _perpareCondition(options);
        if (condition) {
            connection.query('SELECT * FROM `apt_user` WHERE ' + condition, function (err, rows) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        }
        else {
            reject();
        }
    });
};
User.prototype.registerUser = function (user) {
    return new Promise((resolve, reject) => {
        _User.saveUser(user).then(function (userId) {
            if (userId) {
                helper.sendEmail(user.email, '[Apt Shop] Confirm your password', 'Click this url to confirm your registed : ' +
                    'http://localhost/APTshop/#/confirmRegisted?id=' + userId + '&salt=' + user.salt, function (error, response) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(true);
                    }
                });
            }
            else {
                reject();
            }
        }).catch(function () {
            reject();
        });
    });
};
User.prototype.confirmRegisted = function (params) {
    return new Promise(function (resolve, reject) {
        _User.getUser(params).then(function (users) {
            var user = helper.getFirstItemArray(users);
            if (+user.group == 5) {
                console.log('result');
                user.group = 2;
                _User.saveUser(user).then(function (result) {
                    console.log(result);
                    if (result) {
                        _User.userLogin(_.pick(user, ['username', 'password'])).then(function (result) {
                            resolve(result);
                        }).catch(function (err) {
                            reject(err);
                        });
                    }
                    else {
                        reject();
                    }
                }).catch(function (err) {
                    reject(err);
                });
            }
            else {
                reject();
            }
        }).catch(function () {
            reject();
        });
    });
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
module.exports = _User;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlck1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vU291cmNlL1VzZXIvdXNlck1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUN4QyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUN0QixPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUM3QixDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUNyQixZQUFZLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksRUFDN0MsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsQyxrQkFBa0IsQ0FBQztBQUFBLENBQUM7QUFDcEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFVLE1BQTJGO0lBQzNILE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO1FBQ3hDLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVO2FBQ3RCLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDN0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksU0FBUyxHQUFXLENBQUMsT0FBTyxNQUFNLENBQUMsUUFBUSxJQUFJLFdBQVcsQ0FBQyxHQUFHLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNySCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ1osR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMs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