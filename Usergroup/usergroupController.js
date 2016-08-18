var userGroup = require('./usergroupModel'); 
module.exports = function(app){
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
                    } else {
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
					res.json({isExisted: true, errorCode: 1});
				} else {
					res.json({isExisted: false});
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
