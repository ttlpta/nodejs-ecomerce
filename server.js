var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var helper = require('./helper');
var user = require('./user');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/admin/asserts'));
app.post('/admin/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var admin = require('./admin');
    admin.once('authenticate_admin', function (isAdmin) {
        var result;
        if (isAdmin) {
            var hash = helper.encodeBase64(username + '-' + password);
            result = {success: isAdmin, hash: hash};
        } else {
            result = {success: false};
        }
        res.end(JSON.stringify(result));
    });
    admin.isAdmin(username, password);
});
app.get('/admin/user', function (req, res) {
    user.setMaxListeners(0);
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
                    res.end(JSON.stringify(this.users));
                });
                user.listUser();
                break;
            case 'showUser':
                var userId = req.query.id;
                user.once('show_user', function (users) {
                    users.permission = users.permission.toString();
                    res.end(JSON.stringify(users));
                });
                user.showUser(userId);
                break;
        }
    }
});
app.post('/admin/user', function (req, res) {
    if (typeof req.body != 'undefined') {
        if (!user.usernameValidated) {
            res.end(JSON.stringify({lastInsertId: 0, errorCode: 3}));
        } else if (!user.emailValidated) {
            res.end(JSON.stringify({lastInsertId: 0, errorCode: 2}));
        } else if (!req.body.username || !req.body.email || !req.body.password || !req.body.permission) {
            res.end(JSON.stringify({lastInsertId: 0, errorCode: 1}));
        } else {
            user.once('save_user', function (lastUsersId) {
                res.end(JSON.stringify({lastInsertId: lastUsersId}));
            });
            user.saveUser(req.body);
        }
    }
});
app.get('/admin/validateUser', function (req, res) {
    if (typeof req.query.username != 'undefined') {
        var username = req.query.username;
        user.once('validate_user', function (isExisted) {
            if (isExisted) {
                res.end(JSON.stringify({isExisted: true, errorCode: 3}));
            } else {
                res.end(JSON.stringify({isExisted: false}));
            }
        });
        user.validateUser({'username': username});
    }
    if (typeof req.query.email != 'undefined') {
        var email = req.query.email;
        user.once('validate_user', function (isExisted) {
            if (isExisted) {
                res.end(JSON.stringify({isExisted: true, errorCode: 2}));
            } else {
                res.end(JSON.stringify({isExisted: false}));
            }
        });
        user.validateUser({'email': email});
    }
});
var server = app.listen(8081, function () {
    console.log('Running....');
});