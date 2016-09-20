var connection = require('../connection'), util = require('util'), EventEmitter = require('events').EventEmitter, helper = require('../helper');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVybWlzc2lvbk1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vU291cmNlL1Blcm1pc3Npb24vcGVybWlzc2lvbk1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFDckMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFDdEIsWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLEVBQzdDLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbEMsSUFBSSxXQUFXLEdBQUc7QUFDbEIsQ0FBQyxDQUFDO0FBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDekMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUc7SUFDbkMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLElBQUksR0FBRyxHQUFHLGdDQUFnQyxDQUFDO0lBQzNDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLFVBQVUsR0FBRyxFQUFFLElBQUk7UUFDckMsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDO1lBQUMsTUFBTSxHQUFHLENBQUM7UUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQyJ9