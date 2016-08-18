var admin = require('./adminModel');
module.exports = function(app){
	app.post('/admin/login', function (req, res) {
		var username = req.body.username;
		var password = req.body.password;
		admin.once('authenticate_admin', function (auth) {
			if (typeof auth.isSuperAdmin != 'undefined')
				auth.hash = 'superAdmin';
			res.json(auth);
		});
		admin.isAdmin(username, password);
	});
};
