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
    //var sql = 'INSERT INTO `apt_user` (`email`, `username`, `password`, `salt`, `permission`, `address`, `registered`) ' +
    //    'VALUES ("' + user.email + '", ' +
    //    '"' + user.username + '", ' +
    //    '"' + user.password + '", ' +
    //    '"' + user.salt + '", ' +
    //    '' + user.permission + ', ' +
    //    '"' + user.address + '", ' +
    //    '"' + user.registered + '");';

    var sql = 'INSERT INTO `apt_user` SET ?';
    connection.query(sql, user, function (err, res) {
        self.emit('list_user', res.insertId);
    });

};
module.exports = new User();