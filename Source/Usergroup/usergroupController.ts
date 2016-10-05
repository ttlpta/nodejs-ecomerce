var userGroup = require('./usergroupModel'),
	helper = require('../helper');
module.exports = function (app) {
	app.get('/admin/usergroup', helper.handleRequest(userGroup.listGroup));
	app.get('/admin/usergroup/:id', helper.handleRequest(userGroup.showGroupById));
	app.post('/admin/usergroup', helper.handleRequest(userGroup.saveGroup))
	app.delete('/admin/usergroup/:id', helper.handleRequest(userGroup.deleteGroup));

	app.get('/admin/validate-group-user', function (req, res) {
		if (typeof req.query.group_name != 'undefined') {
			userGroup.validateGroup(req.query).then(function (isExisted) {
				var result = (isExisted) ?
					{ isExisted: true, message: 'Group name is existed' } :
					{ isExisted: false }
				res.json(result);
			}).catch(function () {
				res.status(400).end();
			});
		} else {
			res.status(400).end();
		}
	});
};
