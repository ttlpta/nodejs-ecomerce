var mysql = require('mysql'), util = require('util'), EventEmitter = require('events').EventEmitter;
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
    connection.query('INSERT INTO `apt_user` SET ?', user, function (err, res) {
        self.emit('save_user', res.insertId);
    });
};
User.prototype.showUser = function (userId) {
    var self = this;
    connection.query('SELECT * FROM `apt_user` WHERE `permission` != 1 AND `id` =' + userId, function (err, rows) {
        self.emit('show_user', rows);
    });
};
module.exports = new User();