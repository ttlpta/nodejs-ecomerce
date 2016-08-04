var express = require('express');
var app = express();
var bodyParser = require('body-parser');
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
    admin.on('authenticate_admin', function (isAdmin) {
        var result;
        if (isAdmin) {
            var hash = require('./helper.js').encodeBase64(username + '-' + password);
            result = {success: isAdmin, hash: hash};
        } else {
            result = {success: false};
        }
        res.end(JSON.stringify(result));
    });
    admin.isAdmin(username, password);
});

app.get('/admin/user', function (req, res) {
    var user = require('./user');
    if (typeof req.query.action != 'undefined') {
        switch (req.query.action) {
            case 'listUser':
                user.on('list_user', function (users) {
                    res.end(JSON.stringify(users));
                });
                user.listUser();
                break;
            case 'showUser':
                var userId = req.query.id;
                user.on('show_user', function (users) {
                    res.end(JSON.stringify(users));
                });
                user.showUser(userId);
                break;
        }
    }
});
app.post('/admin/user', function (req, res) {
    var user = require('./user');
    if (typeof req.body != 'undefined') {
        console.log(req.body);
        if (!req.body.username || !req.body.email || !req.body.password || !req.body.permission) {
            res.end(JSON.stringify({lastInsertId: 0, errorCode: 1}));
        } else {
            user.on('save_user', function (lastUsersId) {
                res.end(JSON.stringify({lastInsertId: lastUsersId}));
            });
            user.saveUser(req.body);
        }
    }
});

var server = app.listen(8081, function () {
    console.log('Running....');
});