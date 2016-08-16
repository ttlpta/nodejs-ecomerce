var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var helper = require('./helper');
var user = require('./user');
var userGroup = require('./usergroup');
var permission = require('./permission');
user.setMaxListeners(0);
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/admin/asserts'));
// Admin Login module
app.post('/admin/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var admin = require('./admin');
    admin.once('authenticate_admin', function (auth) {
        var result;
        if (auth.success) {
            result = {success: true, hash: auth.hash};
            if (typeof auth.isSuperAdmin != 'undefined') {
                result = {success: true, hash: 'superAdmin'};
            }
        } else {
            result = {success: false};
        }
        res.json(result);
    });
    admin.isAdmin(username, password);
});
// Admin User module
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
                user.listUser(req.query.limit, req.query.offset, req.query.orderBy, req.query.sort);
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
// Admin User Group module
app.get('/admin/usergroup', function (req, res) {
    if (typeof req.query.action != 'undefined') {
        switch (req.query.action) {
            case 'listUserGroup':
                userGroup.once('list_group', function (groups) {
                    res.json(groups);
                });
                userGroup.listGroup();
                break;
            case 'showUserGroup':
                userGroup.once('show_group', function (result) {
                    if (result.success) {
                        var groups = result.group;
                        var permissionIds = [];
                        var group = {
                            'id': groups[0].group_id,
                            'group_name': groups[0].group_name
                        };
                        groups.forEach(function (value) {
                            if (value.permission_id) {
                                permissionIds.push(value.permission_id);
                            }
                        });
                        if (permissionIds)
                            group.permissionId = permissionIds;
                        res.json(group);
                    } else {
                        res.json(result);
                    }
                });
                userGroup.showGroupById(req.query.id);
                break;
        }
    }
});
app.get('/admin/validateGroupUser', function (req, res) {
    if (typeof req.query.group_name != 'undefined') {
        userGroup.once('validate_group', function (isExisted) {
            if (isExisted) {
                res.json({isExisted: true, errorCode: 1});
            } else {
                res.json({isExisted: false});
            }
        });
        userGroup.validateGroup(req.query);
    }
});
app.post('/admin/usergroup', function (req, res) {
    if (typeof req.body != 'undefined') {
        userGroup.once('save_group', function (result) {
            res.json(result);
        });
        userGroup.saveGroup(req.body);
    }
});
app.delete('/admin/usergroup', function (req, res) {
	if (typeof req.query.id != 'undefined' && req.query.id) {
        var groupId = req.query.id;
        userGroup.once('delete_group', function (result) {
            res.json(result);
        });
        userGroup.deleteGroup(groupId);
    }
});
// Admin Permission module
app.get('/admin/permission', function (req, res) {
    if (typeof req.query.action != 'undefined') {
        switch (req.query.action) {
            case 'listPermission':
                permission.once('list_permission', function (permissions) {
                    res.json(permissions);
                });
                permission.listPermission();
                break;
        }
    }
});
var server = app.listen(8081, function () {
    console.log('Running....');
});