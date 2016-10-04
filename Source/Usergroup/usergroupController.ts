var userGroup = require('./usergroupModel'),
	helper = require('../helper');
module.exports = function (app) {
	app.get('/admin/usergroup', helper.handleRequest(userGroup.listGroup));
	app.get('/admin/usergroup/:id', helper.handleRequest(userGroup.showGroupById));
	app.post('/admin/usergroup', helper.handleRequest(userGroup.saveGroup))
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
				} else {
					res.json({ isExisted: false });
				}
			});
			userGroup.validateGroup(req.query);
		}
	});
};
