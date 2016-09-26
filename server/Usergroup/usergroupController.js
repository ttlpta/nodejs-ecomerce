var userGroup = require('./usergroupModel');
module.exports = function (app) {
    app.get('/admin/usergroup', function (req, res) {
        if (typeof req.query.action != 'undefined') {
            switch (req.query.action) {
                case 'listUserGroup':
                    userGroup.once('list_group', function (groups) {
                        res.json(groups);
                    });
                    userGroup.listGroup();
                    break;
                case 'showUserGroup':
                    userGroup.once('show_group', function (result) {
                        if (result.success) {
                            var groups = result.group;
                            var permissionIds = [];
                            var group = {
                                'id': groups[0].group_id,
                                'group_name': groups[0].group_name
                            };
                            groups.forEach(function (value) {
                                if (value.permission_id) {
                                    permissionIds.push(value.permission_id);
                                }
                            });
                            if (permissionIds)
                                group.permissionId = permissionIds;
                            res.json(group);
                        }
                        else {
                            res.json(result);
                        }
                    });
                    userGroup.showGroupById(req.query.id);
                    break;
            }
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
    app.post('/admin/usergroup', function (req, res) {
        if (typeof req.body != 'undefined') {
            userGroup.once('save_group', function (result) {
                res.json(result);
            });
            userGroup.saveGroup(req.body);
        }
    });
    app.delete('/admin/usergroup', function (req, res) {
        if (typeof req.query.id != 'undefined' && req.query.id) {
            var groupId = req.query.id;
            userGroup.once('delete_group', function (result) {
                res.json(result);
            });
            userGroup.deleteGroup(groupId);
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlcmdyb3VwQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL1NvdXJjZS9Vc2VyZ3JvdXAvdXNlcmdyb3VwQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUM1QyxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsR0FBRztJQUM1QixHQUFHLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDM0MsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDdkIsS0FBSyxlQUFlO29CQUNoQixTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFVLE1BQU07d0JBQ3pDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3JCLENBQUMsQ0FBQyxDQUFDO29CQUNILFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDdEIsS0FBSyxDQUFDO2dCQUNWLEtBQUssZUFBZTtvQkFDaEIsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFBVSxNQUFNO3dCQUN6QyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs0QkFDakIsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQzs0QkFDMUIsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDOzRCQUN2QixJQUFJLEtBQUssR0FBRztnQ0FDUixJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVE7Z0NBQ3hCLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFB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