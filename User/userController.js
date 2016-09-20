var validator = require('validator'), helper = require('../helper'), Promise = require('bluebird'), user = require('./userModel');
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
        if (!helper.isUndefined(req.query.action)) {
            switch (req.query.action) {
                case 'listUser':
                    var condition = (typeof req.query.username != 'undefined') ? '`username` LIKE "%' + req.query.username + '%"' : '';
                    user.once('list_user', function (users) {
                        var listUsers = [];
                        for (var user of users) {
                            user.address = user.street + ',' + user.city + ',' + user.country + ',' + user.state + ',' + user.zipcode;
                            listUsers.push(user);
                        }
                        res.json(listUsers);
                    });
                    user.listUser(req.query.limit, req.query.offset, req.query.orderBy, req.query.sort, condition);
                    break;
                case 'showUser':
                    if (helper.isUndefined(req.query.id) || !req.query.id) {
                        res.json({ success: false, errorCode: 6 });
                    }
                    else {
                        user.once('show_user', function (result) {
                            if (result.success) {
                                result.user.group = result.user.group.toString();
                                res.json(result.user);
                            }
                            else {
                                res.json(result);
                            }
                        });
                        user.showUserById(req.query.id);
                    }
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
                    }
                    else {
                        res.json({
                            isNotValid: false
                        });
                    }
                });
                user.validateUser(req.query);
            }
            else {
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
                    }
                    else {
                        res.json({
                            isNotValid: false
                        });
                    }
                });
                user.validateUser(req.query);
            }
            else {
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
            }
            else {
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
            }
            else {
                res.json({
                    isNotValid: false
                });
            }
        }
    });
    app.post('/user', function (req, res) {
        if (typeof req.body != 'undefined' && !helper.isEmptyObject(req.body)) {
            user.once('save_user', function (userId) {
                res.json({
                    userId: userId
                });
            });
            req.body.registered = new Date();
            user.saveUser(req.body);
        }
    });
    app.post('/registerUser', function (req, res) {
        if (typeof req.body != 'undefined') {
            var saveUserPromise = new Promise(function (resolve, reject) {
                user.once('save_user', function (userId) {
                    if (+userId) {
                        resolve(+userId);
                    }
                    else {
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
                        }
                        else {
                            reject();
                        }
                    });
                    user.showUserById(userId);
                });
            }).then(function (result) {
                return new Promise(function (resolve, reject) {
                    helper.sendEmail(result.user.email, '[Apt Shop] Confirm your password', 'Click this url to confirm your registed : ' +
                        '' + req.protocol + '://' + req.hostname + '/APTshop/#/confirmRegisted?id=' + result.user.id + '&salt=' + result.user.salt, function (error, response) {
                        if (error) {
                            reject();
                            throw error;
                        }
                        else {
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
                    }
                    else
                        res.json({
                            success: false
                        });
                }
                else {
                    res.json({
                        success: false
                    });
                }
            });
            user.getUser({
                salt: salt,
                id: id
            });
        }
        else {
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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9Tb3VyY2UvVXNlci91c2VyQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQ2hDLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQzdCLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQzdCLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsR0FBRyxFQUFFLEVBQUU7SUFDOUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsVUFBVSxNQUFNO1FBQ2hDLE1BQU0sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxJQUFJO1lBQ3ZDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFO1lBQ3pCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNqRSxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRTtZQUNwQixFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUks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