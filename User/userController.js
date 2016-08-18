var validator = require('validator'),
user = require('./userModel'),
mailer = require("nodemailer");
user.setMaxListeners(0);
module.exports = function(app){
	app.get('/user', function (req, res) {
		if (typeof req.query.action != 'undefined') {
			switch (req.query.action) {
				case 'listUser':
					user.once('list_user', function (users) {
						this.users = [];
						var here = this;
						users.forEach(function (value) {
							value.address = value.street + ',' + value.city + ',' + value.country + ',' + value.state + ',' + value.zipcode;
							here.users.push(value);
						});
						res.json(this.users);
					});
					user.listUser(req.query.limit, req.query.offset, req.query.orderBy, req.query.sort);
					break;
				case 'showUser':
					var userId = req.query.id;
					user.once('show_user', function (result) {
						if (result.success) {
							result.user.group = result.user.group.toString();
							res.json(result.user);
						} else {
							res.json(result);
						}
					});
					user.showUser(userId);
					break;
				case 'getTotalUser':
					user.once('total_user', function (result) {
						res.json(result);
					});
					user.totalUser();
					break;
			}
		}
	});
	app.get('/validateUser', function (req, res) {
		if (typeof req.query.username != 'undefined') {
			user.once('validate_user', function (isExisted) {
				if (isExisted) {
					res.json({isExisted: true, errorCode: 3});
				} else {
					res.json({isExisted: false});
				}
			});
			user.validateUser(req.query);
		}
		if (typeof req.query.email != 'undefined') {
			if (validator.isEmail(req.query.email)) {
				user.once('validate_user', function (isExisted) {
					if (isExisted) {
						res.json({isNotValid: true, errorCode: 2});
					} else {
						res.json({isNotValid: false});
					}
				});
				user.validateUser(req.query);
			} else {
				res.json({isNotValid: true, errorCode: 7});
			}
		}
	});
	app.post('/user', function (req, res) {
		if (typeof req.body != 'undefined') {
			user.once('save_user', function (userId) {
				res.json({userId: userId});
			});
			user.saveUser(req.body);
		}
	});
	app.delete('/user', function (req, res) {
		if (typeof req.query.id != 'undefined' && req.query.id) {
			var userId = req.query.id;
			user.once('delete_user', function (result) {
				res.json(result);
			});
			user.deleteUser(userId);
		}
	});
	app.get('/user/confirm', function(req, res){
		if (typeof req.query.salt != 'undefined') {
			var salt = req.query.salt;
			res.end(salt);
		}
	});
};
