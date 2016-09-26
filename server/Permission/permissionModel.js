var connection = require('../../connection'), util = require('util'), EventEmitter = require('events').EventEmitter, helper = require('../helper');
var Permissions = function () {
};
util.inherits(Permissions, EventEmitter);
Permissions.prototype.listPermission = function () {
    var self = this;
    var sql = 'SELECT * FROM `apt_permission`';
    connection.query(sql, function (err, rows) {
        if (err)
            throw err;
        self.emit('list_permission', rows);
    });
};
module.exports = new Permissions();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVybWlzc2lvbk1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vU291cmNlL1Blcm1pc3Npb24vcGVybWlzc2lvbk1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUN4QyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUN0QixZQUFZLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksRUFDN0MsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsQyxJQUFJLFdBQVcsR0FBRztBQUNsQixDQUFDLENBQUM7QUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUN6QyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRztJQUNuQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7SUFDaEIsSUFBSSxHQUFHLEdBQUcsZ0NBQWdDLENBQUM7SUFDM0MsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsVUFBVSxHQUFHLEVBQUUsSUFBSTtRQUNyQyxFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUM7WUFBQyxNQUFNLEdBQUcsQ0FBQztRQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBQ0YsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDIn0=