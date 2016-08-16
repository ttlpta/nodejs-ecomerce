var connection = require('./connection'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    helper = require('./helper');
var Permissions = function () {
};
util.inherits(Permissions, EventEmitter);
Permissions.prototype.listPermission = function () {
    var self = this;
    var sql = 'SELECT * FROM `apt_permission`';
    connection.query(sql, function (err, rows) {
        if(err) throw err;
        self.emit('list_permission', rows);
    });
};
module.exports = new Permissions();