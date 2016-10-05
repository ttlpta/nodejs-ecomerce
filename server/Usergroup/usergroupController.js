var userGroup = require('./usergroupModel'), helper = require('../helper');
module.exports = function (app) {
    app.get('/admin/usergroup', helper.handleRequest(userGroup.listGroup));
    app.get('/admin/usergroup/:id', helper.handleRequest(userGroup.showGroupById));
    app.post('/admin/usergroup', helper.handleRequest(userGroup.saveGroup));
    app.delete('/admin/usergroup/:id', helper.handleRequest(userGroup.deleteGroup));
    app.get('/admin/validate-group-user', function (req, res) {
        if (typeof req.query.group_name != 'undefined') {
            userGroup.validateGroup(req.query).then(function (isExisted) {
                var result = (isExisted) ?
                    { isExisted: true, message: 'Group name is existed' } :
                    { isExisted: false };
                res.json(result);
            }).catch(function () {
                res.status(400).end();
            });
        }
        else {
            res.status(400).end();
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcmdyb3VwQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL1NvdXJjZS9Vc2VyZ3JvdXAvdXNlcmdyb3VwQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFDMUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMvQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsR0FBRztJQUM3QixHQUFHLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDdkUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO0lBQy9FLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtJQUN2RSxHQUFHLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFFaEYsR0FBRyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQ3ZELEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNoRCxTQUFTLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxTQUFTO2dCQUMxRCxJQUFJLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQztvQkFDdkIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRTtvQkFDckQsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUE7Z0JBQ3JCLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUNSLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDUCxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7SUFDRixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyJ9