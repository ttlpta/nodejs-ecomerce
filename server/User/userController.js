var validator = require('validator'), helper = require('../helper'), Promise = require('bluebird'), _ = require('lodash'), os = require('os'), user = require('./userModel');
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
        }
        else {
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
                }
                else {
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
                    helper.sendEmail(userData.email, '[Apt Shop] Update your new password', 'Click this url to update your password : ' +
                        '' + req.protocol + '://' + req.hostname + '/APTshop/#/updatePassword?id=' + userData.id, function (error) {
                        if (error) {
                            throw error;
                        }
                        else {
                            res.json({
                                success: true
                            });
                        }
                    });
                }
                else {
                    res.json({
                        success: false
                    });
                }
            });
            user.getUser(req.body);
        }
    });
    app.get('/validate-user', function (req, res) {
        if (!_.isUndefined(req.query.username)) {
            if (validator.isAlphanumeric(req.query.username)) {
                user.validateUser(req.query).then(function (isExisted) {
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
            }
            else {
                res.json({
                    isNotValid: true,
                    rule: 'alphanumberic',
                    message: 'Username contains special character or space'
                });
            }
        }
        if (!_.isUndefined(req.query.email)) {
            if (validator.isEmail(req.query.email)) {
                user.validateUser(req.query).then(function (isExisted) {
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
            }
            else {
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
            }
            else {
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
            }
            else {
                res.json({
                    isNotValid: false
                });
            }
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9Tb3VyY2UvVXNlci91c2VyQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQ2hDLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQzdCLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQzdCLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQ3JCLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQ2xCLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLEdBQUcsRUFBRSxFQUFFO0lBQzlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFVBQVUsTUFBTTtRQUNoQyxNQUFNLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsSUFBSTtZQUN2QyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNuQixNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzNELENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRTtZQUN6QixFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakUsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVB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