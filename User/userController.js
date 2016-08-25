var validator = require('validator'),
    helper = require('../helper'),
    Promise = require('bluebird'),
    user = require('./userModel');
user.setMaxListeners(0);
module.exports = function (app) {
    app.get('/user', function (req, res) {
        if (typeof req.query.action != 'undefined') {
            switch (req.query.action) {
                case 'listUser':
                    user.once('list_user', function (users) {
                        var listUsers = [];
                        users.forEach(function (value) {
                            value.address = value.street + ',' + value.city + ',' + value.country + ',' + value.state + ',' + value.zipcode;
                            listUsers.push(value);
                        });
                        res.json(listUsers);
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
            var saveUserPromise = new Promise(function (resolve, reject) {
                user.once('save_user', function (userId) {
                    if (+userId) {
                        resolve(+userId);
                    } else {
                        reject();
                    }
                });
                user.saveUser(Object.assign(req.body, {group: 3}));
            });
            saveUserPromise.then(function (userId) {
                return new Promise(function (resolve, reject) {
                    user.once('show_user', function (result) {
                        if (result.success) {
                            resolve(result);
                        } else {
                            reject();
                        }
                    });
                    user.showUser(userId);
                });
            }).then(function (result) {
                return new Promise(function (resolve, reject) {
                    helper.sendEmail(result.user.email,
                        '[Apt Shop] Confirm your password',
                        'Click this url to confirm your registed : ' +
                        '' + req.protocol + '://' + req.hostname + '/APTshop/#/confirmRegisted?id=' + result.user.id + '&salt=' + result.user.salt
                        , function (error, response) {
                            if (error) {
                                reject();
                                throw error;
                            } else {
                                res.json({success: true});
                            }
                        });
                });
            }).catch(function () {
                res.json({success: false, errorCode: 8});
            });
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
    app.get('/confirmRegisted', function (req, res) {
        if (typeof req.query.id != 'undefined' && typeof req.query.salt != 'undefined') {
            var id = req.query.id;
            var salt = req.query.salt;
            user.once('get_user', function (user) {
                if (user && delete user.salt) {
                    res.json({success: true, hash: helper.encodeBase64(JSON.stringify(user))});
                } else
                    res.json({success: false});
            });
            user.getUser({salt: salt, id: id});
        } else {
            res.json({success: false});
        }
    });
};
