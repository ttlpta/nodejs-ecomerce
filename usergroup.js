var connection = require('./connection'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    helper = require('./helper');
var UserGroup = function () {
};
util.inherits(UserGroup, EventEmitter);
UserGroup.prototype.listGroup = function () {
    var self = this;
    var sql = 'SELECT * FROM `apt_user_group`';
    connection.query(sql, function (err, rows) {
        self.emit('list_group', rows);
    });
};
module.exports = new UserGroup();