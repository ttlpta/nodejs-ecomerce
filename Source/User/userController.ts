var validator = require('validator'),
    helper = require('../helper'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    user = require('./userModel');
user.setMaxListeners(0);
module.exports = function (app, io) {
    io.on('connection', function (socket) {
        socket.on('user_is_logging', function (data) {
            socket.user = data;
            socket.broadcast.emit('user_online', JSON.parse(data));
        });
        socket.on('forceDisconnect', function () {
            if (typeof this.user != 'undefined') {
                socket.broadcast.emit('user_offline', JSON.parse(this.user));
            }
        });
        socket.on('disconnect', function () {
            if (typeof this.user != 'undefined') {
                socket.broadcast.emit('user_offline', JSON.parse(this.user));
            }
        });
    });

    app.get('/user', function (req, res) {
        var condition: string = (typeof req.query.username != 'undefined') ? '`username` LIKE "%' + req.query.username + '%"' : '';
        user.listUser(req.query.limit, req.query.offset, req.query.orderBy, req.query.sort, condition)
            .then(function (users) {
                res.json(users);
            });
    });

    app.get('/user/:id', function (req, res) {
        if (_.isInteger(+req.params.id)) {
            user.showUserById(req.params.id).then(function (result) {
                res.json(result);
            });
        } else {
            res.status(403).end();
        }
    });

    app.get('/get-total-user', function (req, res) {
        user.totalUser().then(function (totalUser) {
            res.json(totalUser);
        });
    });

    app.get('/validateUser', function (req, res) {
        var EXISTED_CODE = 2;
        var WRONG_FORMAT_CODE = 3;
        var CONTAIN_SPECIAL_CODE = 4;
        if (typeof req.query.username != 'undefined') {
            if (validator.isAlphanumeric(req.query.username)) {
                user.once('validate_user', function (isExisted) {
                    if (isExisted) {
                        res.json({
                            isNotValid: true,
                            errorCode: EXISTED_CODE
                        });
                    } else {
                        res.json({
                            isNotValid: false
                        });
                    }
                });
                user.validateUser(req.query);
            } else {
                res.json({
                    isNotValid: true,
                    errorCode: CONTAIN_SPECIAL_CODE
                });
            }

        }
        if (typeof req.query.email != 'undefined') {
            if (validator.isEmail(req.query.email)) {
                user.once('validate_user', function (isExisted) {
                    if (isExisted) {
                        res.json({
                            isNotValid: true,
                            errorCode: EXISTED_CODE
                        });
                    } else {
                        res.json({
                            isNotValid: false
                        });
                    }
                });
                user.validateUser(req.query);
            } else {
                res.json({
                    isNotValid: true,
                    errorCode: WRONG_FORMAT_CODE
                });
            }
        }
        if (typeof req.query.phone != 'undefined') {
            if (!validator.isMobilePhone(req.query.phone, 'vi-VN')) {
                res.json({
                    isNotValid: true,
                    errorCode: WRONG_FORMAT_CODE
                });
            } else {
                res.json({
                    isNotValid: false
                });
            }

        }
        if (typeof req.query.password != 'undefined') {
            if (!validator.isAlphanumeric(req.query.password)) {
                res.json({
                    isNotValid: true,
                    errorCode: CONTAIN_SPECIAL_CODE
                });
            } else {
                res.json({
                    isNotValid: false
                });
            }

        }
    });

    app.post('/user', function (req, res) {
        if (!_.isUndefined(req.body) && !_.isEmpty(req.body)) {
            req.body.registered = new Date();
            user.saveUser(req.body).then(function (userId) {
                res.status((userId) ? 204 : 403).end();
            });
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
                user.saveUser(Object.assign(req.body, {
                    group: 3
                }));
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
                    user.showUserById(userId);
                });
            }).then(function (result) {
                return new Promise(function (resolve, reject) {
                    helper.sendEmail(result.user.email,
                        '[Apt Shop] Confirm your password',
                        'Click this url to confirm your registed : ' +
                        '' + req.protocol + '://' + req.hostname + '/APTshop/#/confirmRegisted?id=' + result.user.id + '&salt=' + result.user.salt, function (error, response) {
                            if (error) {
                                reject();
                                throw error;
                            } else {
                                res.json({
                                    success: true
                                });
                            }
                        });
                });
            }).catch(function () {
                res.json({
                    success: false,
                    errorCode: 8
                });
            });
        }
    });

    app.delete('/user/:id', function (req, res) {
        if (_.isInteger(+req.params.id)) {
            user.deleteUser(req.params.id).then(function (result) {
                res.status((result) ? 204 : 403).end();
            });
        } else {
            res.status(403).end();
        }
    });

    app.get('/confirmRegisted', function (req, res) {
        if (typeof req.query.id != 'undefined' && typeof req.query.salt != 'undefined') {
            var id = req.query.id;
            var salt = req.query.salt;
            user.once('get_user', function (userDatas) {
                var userData = helper.getFirstItemArray(userDatas);
                if (+userData.group == user.UNCONFIRM) {
                    if (userData && delete userData.salt) {
                        userData.group = user.CUSTOMER;
                        user.once('save_user', function () {
                            res.json({
                                success: true,
                                hash: helper.encodeBase64(JSON.stringify(userData))
                            });
                        });
                        user.saveUser(userData);
                    } else
                        res.json({
                            success: false
                        });
                } else {
                    res.json({
                        success: false
                    });
                }
            });
            user.getUser({
                salt: salt,
                id: id
            });
        } else {
            res.json({
                success: false
            });
        }
    });

    app.post('/userLogin', function (req, res) {
        if (typeof req.body != 'undefined') {
            user.once('user_login', function (result) {
                if (false != result) {
                    res.json({
                        success: true,
                        hash: helper.encodeBase64(JSON.stringify(result))
                    });
                } else {
                    res.json({
                        success: false
                    });
                }

            });
            user.userLogin(req.body);
        }
    });

    app.post('/forgotPassword', function (req, res) {
        if (typeof req.body != 'undefined') {
            user.once('get_user', function (results) {
                var userData = helper.getFirstItemArray(results);
                if (typeof userData != 'undefined') {
                    helper.sendEmail(userData.email,
                        '[Apt Shop] Update your new password',
                        'Click this url to update your password : ' +
                        '' + req.protocol + '://' + req.hostname + '/APTshop/#/updatePassword?id=' + userData.id, function (error) {
                            if (error) {
                                throw error;
                            } else {
                                res.json({
                                    success: true
                                });
                            }
                        });
                } else {
                    res.json({
                        success: false
                    });
                }
            });
            user.getUser(req.body);
        }
    });
};
