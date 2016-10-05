var connection = require('../../connection'), util = require('util'), _ = require('lodash'), EventEmitter = require('events').EventEmitter;
var UserGroupCombinePermission = function () {
};
util.inherits(UserGroupCombinePermission, EventEmitter);
UserGroupCombinePermission.prototype.addAllowGroupPermission = function (groupId, allowPermissionIds) {
    return new Promise(function (resolve, reject) {
        if (!_.isEmpty(allowPermissionIds)) {
            var insertValues = '(' + allowPermissionIds.join(',' + groupId + '),(') + ',' + groupId + ')';
            var sql = 'INSERT IGNORE INTO `apt_permission_combine_group` (`permission_id`, `user_group_id`) ' +
                'VALUES ' + insertValues;
            connection.query(sql, function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        }
        else {
            resolve();
        }
    });
};
UserGroupCombinePermission.prototype.removeDenyGroupPermission = function (groupId, denyPermissionIds) {
    return new Promise(function (resolve, reject) {
        if (!_.isEmpty(denyPermissionIds)) {
            var deleteValues = denyPermissionIds.join(',');
            var sql = 'DELETE FROM `apt_permission_combine_group` WHERE `user_group_id` = ? ' +
                'AND `permission_id` IN ( ' + deleteValues + ' )';
            connection.query(sql, [+groupId], function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        }
        else {
            resolve();
        }
    });
};
UserGroupCombinePermission.prototype.deleteGroupByGroupId = function (groupId) {
    var sql = 'DELETE FROM `apt_permission_combine_group` WHERE `user_group_id` = ? ';
    return new Promise(function (resolve, reject) {
        connection.query(sql, [+groupId], function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};
module.exports = new UserGroupCombinePermission();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcmdyb3VwQ29tYmluZVBlcm1pc3Npb25Nb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL1NvdXJjZS9Vc2VyZ3JvdXBDb21iaW5lUGVybWlzc2lvbi91c2VyZ3JvdXBDb21iaW5lUGVybWlzc2lvbk1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUN4QyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUN0QixDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUNyQixZQUFZLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksQ0FBQztBQUNsRCxJQUFJLDBCQUEwQixHQUFHO0FBQ2pDLENBQUMsQ0FBQztBQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDeEQsMEJBQTBCLENBQUMsU0FBUyxDQUFDLHVCQUF1QixHQUFHLFVBQVUsT0FBTyxFQUFFLGtCQUFrQjtJQUNoRyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtRQUN4QyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsSUFBSSxZQUFZLEdBQVcsR0FBRyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ3RHLElBQUksR0FBRyxHQUFXLHVGQUF1RjtnQkFDckcsU0FBUyxHQUFHLFlBQVksQ0FBQztZQUM3QixVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO2dCQUNwQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUNOLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEIsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixPQUFPLEVBQUUsQ0FBQztnQkFDZCxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUNGLDBCQUEwQixDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsR0FBRyxVQUFVLE9BQU8sRUFBRSxpQkFBaUI7SUFDakcsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07UUFDeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksWUFBWSxHQUFXLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2RCxJQUFJLEdBQUcsR0FBVyx1RUFBdUU7Z0JBQ3JGLDJCQUEyQixHQUFHLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDdEQsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7Z0JBQ2hELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ04sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQixDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLE9BQU8sRUFBRSxDQUFDO2dCQUNkLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE9BQU8sRUFBRSxDQUFDO1FBQ2QsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBRVAsQ0FBQyxDQUFDO0FBQ0YsMEJBQTBCLENBQUMsU0FBUyxDQUFDLG9CQUFvQixHQUFHLFVBQVUsT0FBTztJQUN6RSxJQUFJLEdBQUcsR0FBVyx1RUFBdUUsQ0FBQztJQUMxRixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtRQUN4QyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztZQUNoRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNOLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoQixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osT0FBTyxFQUFFLENBQUM7WUFDZCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSwwQkFBMEIsRUFBRSxDQUFDIn0=