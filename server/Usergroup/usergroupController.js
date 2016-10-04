var userGroup = require('./usergroupModel'), helper = require('../helper');
module.exports = function (app) {
    app.get('/admin/usergroup', helper.handleRequest(userGroup.listGroup));
    app.get('/admin/usergroup/:id', helper.handleRequest(userGroup.showGroupById));
    app.post('/admin/usergroup', helper.handleRequest(userGroup.saveGroup));
    app.delete('/admin/usergroup', function (req, res) {
        if (typeof req.query.id != 'undefined' && req.query.id) {
            var groupId = req.query.id;
            userGroup.once('delete_group', function (result) {
                res.json(result);
            });
            userGroup.deleteGroup(groupId);
        }
    });
    app.get('/admin/validateGroupUser', function (req, res) {
        if (typeof req.query.group_name != 'undefined') {
            userGroup.once('validate_group', function (isExisted) {
                if (isExisted) {
                    res.json({ isExisted: true, errorCode: 1 });
                }
                else {
                    res.json({ isExisted: false });
                }
            });
            userGroup.validateGroup(req.query);
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcmdyb3VwQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL1NvdXJjZS9Vc2VyZ3JvdXAvdXNlcmdyb3VwQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFDMUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMvQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsR0FBRztJQUM3QixHQUFHLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDdkUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO0lBQy9FLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtJQUN2RSxHQUFHLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDaEQsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxXQUFXLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELElBQUksT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzNCLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFVBQVUsTUFBTTtnQkFDOUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsQixDQUFDLENBQUMsQ0FBQztZQUNILFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEMsQ0FBQztJQUNGLENBQUMsQ0FBQyxDQUFDO0lBRUgsR0FBRyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQ3JELEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNoRCxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsU0FBUztnQkFDbkQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDZixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDN0MsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDUCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQ2hDLENBQUM7WUFDRixDQUFDLENBQUMsQ0FBQztZQUNILFNBQVMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BDLENBQUM7SUFDRixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMsQ0FBQyJ9