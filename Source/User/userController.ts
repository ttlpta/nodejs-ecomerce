var validator = require('validator'),
    helper = require('../helper'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    os = require('os'),
    user = require('./userModel');
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

    app.get('/user', helper.handleRequest(user.listUser));
    app.get('/user/:userId', helper.handleRequest(user.showUserById));
    app.get('/get-total-user', helper.handleRequest(user.totalUser));
    app.post('/user', helper.handleRequest(user.saveUser));
    app.delete('/user/:userId', helper.handleRequest(user.deleteUser));

    // Front-end Call
    app.post('/register-user', helper.handleRequest(user.registerUser));
    app.get('/confirmRegisted', function (req, res) {
        if (!_.isUndefined(req.query.id) || !_.isUndefined(req.query.salt)) {
            user.confirmRegisted(req.query).then(function (result) {
                if (result.success) {
                    req.session.hash = result.hash;
                    res.json({ success: true, sessionId: req.sessionID, current_user: result.current_user });
                }
            }).catch(function () {
                res.status(400).end();
            });
        } else {
            res.status(400).end();
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

    // Validate all request
    app.get('/validate-user', function (req, res) {
        if (!_.isUndefined(req.query.username)) {
            if (validator.isAlphanumeric(req.query.username)) {
                user.validateUser(req.query).then(function (isExisted: boolean) {
                    var result = (isExisted) ?
                        {
                            isNotValid: true,
                            rule: 'existed',
                            message: 'Username is existed'
                        } :
                        {
                            isNotValid: false
                        };
                    res.json(result);
                });
            } else {
                res.json({
                    isNotValid: true,
                    rule: 'alphanumberic',
                    message: 'Username contains special character or space'
                });
            }
        }
        if (!_.isUndefined(req.query.email)) {
            if (validator.isEmail(req.query.email)) {
                user.validateUser(req.query).then(function (isExisted: boolean) {
                    var result = (isExisted) ?
                        {
                            isNotValid: true,
                            rule: 'existed',
                            message: 'Email is existed'
                        } :
                        {
                            isNotValid: false
                        };
                    res.json(result);
                });
            } else {
                res.json({
                    isNotValid: true,
                    rule: 'email',
                    message: 'Email is wrong format'
                });
            }
        }
        if (!_.isUndefined(req.query.phone)) {
            if (!validator.isMobilePhone(req.query.phone, 'vi-VN')) {
                res.json({
                    isNotValid: true,
                    rule: 'phone-number',
                    message: 'Phone number is wrong format'
                });
            } else {
                res.json({
                    isNotValid: false
                });
            }
        }
        if (!_.isUndefined(req.query.password)) {
            if (!validator.isAlphanumeric(req.query.password)) {
                res.json({
                    isNotValid: true,
                    rule: 'alphanumberic',
                    message: 'Password is wrong format'
                });
            } else {
                res.json({
                    isNotValid: false
                });
            }

        }
    });
};
