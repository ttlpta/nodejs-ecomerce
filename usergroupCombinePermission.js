var connection = require('./connection'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;
var UsergroupCombinePermission = function () {
};
util.inherits(UsergroupCombinePermission, EventEmitter);
UsergroupCombinePermission.prototype.addGroupPermission = function(groupId, permissionId){
    var sql = 'INSERT INTO `apt_permission_combine_group` (`user_group_id`, `permission_id`) VALUES (?, ?)';
    var self = this;
    connection.query(sql, [+groupId, +permissionId], function (err, rows){
        if(err){
            self.emit('add_group_permisson_error', err);
        } else {
            self.emit('add_group_permisson_success', rows);
        }
    });
};
module.exports = new UsergroupCombinePermission();