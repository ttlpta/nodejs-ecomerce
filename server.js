var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var helper = require('./helper');
var user = require('./user');
user.setMaxListeners(0);
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
                user.listUser(req.query.limit, req.query.offset);
                break;
            case 'showUser':
                var userId = req.query.id;
                user.once('show_user', function (result) {
                    if (result.success) {
                        result.user.permission = result.user.permission.toString();
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
app.post('/admin/user', function (req, res) {
    if (typeof req.body != 'undefined') {
        user.once('save_user', function (userId) {
            res.json({userId: userId});
        });
        user.saveUser(req.body);
    }
});

app.delete('/admin/user', function (req, res) {
    if (typeof req.query.id != 'undefined' && req.query.id) {
        var userId = req.query.id;
        user.once('delete_user', function (result) {
            res.json(result);
        });
        user.deleteUser(userId);
    }
});

app.get('/admin/validateUser', function (req, res) {
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
        user.once('validate_user', function (isExisted) {
            if (isExisted) {
                res.json({isExisted: true, errorCode: 2});
            } else {
                res.json({isExisted: false});
            }
        });
        user.validateUser(req.query);
    }
});
var server = app.listen(8081, function () {
    console.log('Running....');
});