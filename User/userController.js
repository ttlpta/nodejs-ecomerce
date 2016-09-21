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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9Tb3VyY2UvVXNlci91c2VyQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQ2hDLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQzdCLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQzdCLElBQUksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsR0FBRyxFQUFFLEVBQUU7SUFDOUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsVUFBVSxNQUFNO1FBQ2hDLE1BQU0sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxJQUFJO1lBQ3ZDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFO1lBQ3pCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNqRSxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRTtZQUNwQixFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakUsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDSCxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQy9CLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLEtBQUssVUFBVTtvQkFDWCxJQUFJLFNBQVMsR0FBVyxDQUFDLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksV0FBVyxDQUFDLEdBQUcsb0JBQW9CLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztvQkFDM0gsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxLQUFLO3dCQUNsQyxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7d0JBQ25CLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQzs0QkFDMUcsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDekIsQ0FBQzt3QkFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUN4QixDQUFDLENBQUMsQ0FBQztvQkFDSCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUMvRixLQUFLLENBQUM7Z0JBQ1YsS0FBSyxVQUFVO29CQUNYLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDcEQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQy9DLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ0osSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxNQUFNOzRCQUNuQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQ0FDakIsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQzFCLENBQUM7NEJBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQ0osR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFDckIsQ0FBQzt3QkFDTCxDQUFDLENBQUMsQ0FBQzt3QkFDSCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3BDLENBQUM7b0JBQ0QsS0FBSyxDQUFDO2dCQUNWLEtBQUssY0FBYztvQkFDZixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFVLE1BQU07d0JBQ3BDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3JCLENBQUMsQ0FBQyxDQUFDO29CQUNILElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDakIsS0FBSyxDQUFDO1lBQ2QsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUNILEdBQUcsQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDdkMsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLElBQUksb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUMzQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxVQUFVLFNBQVM7b0JBQzFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ1osR0FBRyxDQUFDLElBQUksQ0FBQzs0QkFDTCxVQUFVLEVBQUUsSUFBSTs0QkFDaEIsU0FBUyxFQUFFLFlBQVk7eUJBQzFCLENBQUMsQ0FBQztvQkFDUCxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNKLEdBQUcsQ0FBQyxJQUFJLENBQUM7NEJBQ0wsVUFBVSxFQUFFLEtBQUs7eUJBQ3BCLENBQUMsQ0FBQztvQkFDUCxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixHQUFHLENBQUMsSUFBSSxDQUFDO29CQUNMLFVBQVUsRUFBRSxJQUFJO29CQUNoQixTQUFTLEVBQUUsb0JBQW9CO2lCQUNsQyxDQUFDLENBQUM7WUFDUCxDQUFDO1FBRUwsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN4QyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxVQUFVLFNBQVM7b0JBQzFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ1osR0FBRyxDQUFDLElBQUksQ0FBQzs0QkFDTCxVQUFVLEVBQUUsSUFBSTs0QkFDaEIsU0FBUyxFQUFFLFlBQVk7eUJBQzFCLENBQUMsQ0FBQztvQkFDUCxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNKLEdBQUcsQ0FBQyxJQUFJLENBQUM7NEJBQ0wsVUFBVSxFQUFFLEtBQUs7eUJBQ3BCLENBQUMsQ0FBQztvQkFDUCxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixHQUFHLENBQUMsSUFBSSxDQUFDO29CQUNMLFVBQVUsRUFBRSxJQUFJO29CQUNoQixTQUFTLEVBQUUsaUJBQWlCO2lCQUMvQixDQUFDLENBQUM7WUFDUCxDQUFDO1FBQ0wsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN4QyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxHQUFHLENBQUMsSUFBSSxDQUFDO29CQUNMLFVBQVUsRUFBRSxJQUFJO29CQUNoQixTQUFTLEVBQUUsaUJBQWlCO2lCQUMvQixDQUFDLENBQUM7WUFDUCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osR0FBRyxDQUFDLElBQUksQ0FBQztvQkFDTCxVQUFVLEVBQUUsS0FBSztpQkFDcEIsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUVMLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDM0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxHQUFHLENBQUMsSUFBSSxDQUFDO29CQUNMLFVBQVUsRUFBRSxJQUFJO29CQUNoQixTQUFTLEVBQUUsb0JBQW9CO2lCQUNsQyxDQUFDLENBQUM7WUFDUCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osR0FBRyxDQUFDLElBQUksQ0FBQztvQkFDTCxVQUFVLEVBQUUsS0FBSztpQkFDcEIsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUVMLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUNILEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDaEMsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxJQUFJLFdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLE1BQU07Z0JBQ25DLEdBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQ0wsTUFBTSxFQUFFLE1BQU07aUJBQ2pCLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ0gsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDSCxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQ3hDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLElBQUksSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksZUFBZSxHQUFHLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07Z0JBQ3ZELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsTUFBTTtvQkFDbkMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO3dCQUNWLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNyQixDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNKLE1BQU0sRUFBRSxDQUFDO29CQUNiLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7b0JBQ2xDLEtBQUssRUFBRSxDQUFDO2lCQUNYLENBQUMsQ0FBQyxDQUFDO1lBQ1IsQ0FBQyxDQUFDLENBQUM7WUFDSCxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsTUFBTTtnQkFDakMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07b0JBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsTUFBTTt3QkFDbkMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7NEJBQ2pCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDcEIsQ0FBQzt3QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDSixNQUFNLEVBQUUsQ0FBQzt3QkFDYixDQUFDO29CQUNMLENBQUMsQ0FBQyxDQUFDO29CQUNILElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlCLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsTUFBTTtnQkFDcEIsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07b0JBQ3hDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQzlCLGtDQUFrQyxFQUNsQyw0Q0FBNEM7d0JBQzVDLEVBQUUsR0FBRyxHQUFHLENBQUMsUUFBUSxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxHQUFHLGdDQUFnQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLEtBQUssRUFBRSxRQUFRO3dCQUNqSixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUNSLE1BQU0sRUFBRSxDQUFDOzRCQUNULE1BQU0sS0FBSyxDQUFDO3dCQUNoQixDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNKLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0NBQ0wsT0FBTyxFQUFFLElBQUk7NkJBQ2hCLENBQUMsQ0FBQzt3QkFDUCxDQUFDO29CQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNYLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUNMLEdBQUcsQ0FBQyxJQUFJLENBQUM7b0JBQ0wsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsU0FBUyxFQUFFLENBQUM7aUJBQ2YsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDSCxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksV0FBVyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRCxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLE1BQU07Z0JBQ3JDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVCLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUNILEdBQUcsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUMxQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLFdBQVcsSUFBSSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDN0UsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDdEIsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBVSxTQUFTO2dCQUNyQyxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ25ELEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDcEMsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBQ25DLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQzt3QkFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7NEJBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0NBQ0wsT0FBTyxFQUFFLElBQUk7Z0NBQ2IsSUFBSSxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQzs2QkFDdEQsQ0FBQyxDQUFDO3dCQUNQLENBQUMsQ0FBQyxDQUFDO3dCQUNILElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzVCLENBQUM7b0JBQUMsSUFBSTt3QkFDRixHQUFHLENBQUMsSUFBSSxDQUFDOzRCQUNMLE9BQU8sRUFBRSxLQUFLO3lCQUNqQixDQUFDLENBQUM7Z0JBQ1gsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixHQUFHLENBQUMsSUFBSSxDQUFDO3dCQUNMLE9BQU8sRUFBRSxLQUFLO3FCQUNqQixDQUFDLENBQUM7Z0JBQ1AsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDVCxJQUFJLEVBQUUsSUFBSTtnQkFDVixFQUFFLEVBQUUsRUFBRTthQUNULENBQUMsQ0FBQztRQUNQLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ0wsT0FBTyxFQUFFLEtBQUs7YUFDakIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0gsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUNyQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFVLE1BQU07Z0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDO3dCQUNMLE9BQU8sRUFBRSxJQUFJO3dCQUNiLElBQUksRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3BELENBQUMsQ0FBQztnQkFDUCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLEdBQUcsQ0FBQyxJQUFJLENBQUM7d0JBQ0wsT0FBTyxFQUFFLEtBQUs7cUJBQ2pCLENBQUMsQ0FBQztnQkFDUCxDQUFDO1lBRUwsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDSCxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDMUMsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBVSxPQUFPO2dCQUNuQyxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2pELEVBQUUsQ0FBQyxDQUFDLE9BQU8sUUFBUSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQ2pDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssRUFDM0IscUNBQXFDLEVBQ3JDLDJDQUEyQzt3QkFDM0MsRUFBRSxHQUFHLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEdBQUcsK0JBQStCLEdBQUcsUUFBUSxDQUFDLEVBQUUsRUFBRSxVQUFVLEtBQUs7d0JBQ3JHLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQ1IsTUFBTSxLQUFLLENBQUM7d0JBQ2hCLENBQUM7d0JBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ0osR0FBRyxDQUFDLElBQUksQ0FBQztnQ0FDTCxPQUFPLEVBQUUsSUFBSTs2QkFDaEIsQ0FBQyxDQUFDO3dCQUNQLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixHQUFHLENBQUMsSUFBSSxDQUFDO3dCQUNMLE9BQU8sRUFBRSxLQUFLO3FCQUNqQixDQUFDLENBQUM7Z0JBQ1AsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDIn0=