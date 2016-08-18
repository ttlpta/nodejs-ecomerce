var permission = require('./permissionModel'); 
module.exports = function(app){
	app.get('/admin/permission', function (req, res) {
		if (typeof req.query.action != 'undefined') {
			switch (req.query.action) {
				case 'listPermission':
					permission.once('list_permission', function (permissions) {
						res.json(permissions);
					});
					permission.listPermission();
					break;
			}
		}
	});
};