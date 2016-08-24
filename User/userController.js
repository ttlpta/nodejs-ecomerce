var validator = require('validator'),
helper = require('../helper'),
user = require('./userModel');
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
	app.post('/registerUser', function (req, res) {
		if (typeof req.body != 'undefined') {
			user.once('save_user', function (userId) {
				if (+userId) {
					user.once('show_user', function (result) {
						if (result.success) {
							var salt = result.user.salt;
							helper.sendEmail(
								result.user.email,
								'[Apt Shop] Confirm your password',
								result.user.salt
							, function (error, response) {
								if (error){
									res.json({success : false, errorCode : 8});
									throw error;
								} else {
									res.json({success : true});
								}
							});
						} else {
							res.json({success : false, errorCode : 8});
						}
					});
					user.showUser(userId);
				} else {
					res.json({success : false, errorCode : 8});
				}
			});
			var userData = req.body;
			userData.group = 3;
			user.saveUser(userData);
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
	app.get('/confirmRegisted', function(req, res){
		res.send(req.query);
		if (typeof req.query.id != 'undefined' && typeof req.query.salt != 'undefined') {
			var id = req.query.id;
			var salt = req.query.salt;
			user.once('get_user', function (user) {
				res.send({user: user});
			});
			user.getUser({salt: salt, id: id});
		}
	});
};
