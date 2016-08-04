var mysql = require('mysql'), util = require('util'), EventEmitter = require('events').EventEmitter, helper = require('./helper');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs'
});
connection.connect();
var User = function () {
};
util.inherits(User, EventEmitter);
User.prototype.listUser = function () {
    var self = this;
    var sql = 'SELECT * FROM `apt_user` WHERE `permission` != 1';
    connection.query(sql, function (err, rows) {
        self.emit('list_user', rows);
    });

};
User.prototype.saveUser = function (user) {
    var self = this;
    user.salt = helper.randomString();
    user.password = helper.encodeBase64(user.password) + user.salt;
    connection.query('INSERT INTO `apt_user` SET ?', user, function (err, res) {
        self.emit('save_user', res.insertId);
    });
};
User.prototype.showUser = function (userId) {
    var self = this;
    connection.query('SELECT * FROM `apt_user` WHERE `permission` != 1 AND `id` = ?', [userId], function (err, rows) {
        self.emit('show_user', rows[0]);
    });
};
User.prototype.validateUser = function (user) {
    var self = this;
    this.existedField = [];
    connection.query('SELECT COUNT(*) as countUser FROM `apt_user` WHERE `permission` != 1 AND `username` = ?',
        [user.username], function (err, rows) {
            if (!err && rows[0].countUser) {
                self.existedField.push('username');
                this.emit('validate_user', self.existedField);
            }
        });
    connection.query('SELECT COUNT(*) as countUser FROM `apt_user` WHERE `permission` != 1 AND `email` = ?',
        [user.email], function (err, rows) {
            if (!err && rows[0].countUser) {
                self.existedField.push('email');
                this.emit('validate_user', self.existedField);
            }
        });
};
module.exports = new User();