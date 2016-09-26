var admin = require('./adminModel'),
    _ = require('lodash'),
    helper = require('../helper'),
    session = require('express-session');
module.exports = function (app) {
    app.use(session({
        secret: '123456789',
        resave: false,
        saveUninitialized: true
    }));
    app.post('/admin/login', function (req, res) {
        admin.isAdmin(req.body.username, req.body.password).then(function (result) {
            var loginResult;
            if (result.success) {
                req.session.hash = (!_.isUndefined(result.isSuperAdmin)) ? 'superAdmin' : result.hash;
                loginResult = { success: true, sessionId: req.sessionID };
            } else {
                req.session.destroy();
                loginResult = { success: false };
            }
            res.json(loginResult);
        });
    });
    app.get('/admin/checkAdminIsLogin', function (req, res) {
        var loginResult = (!helper.isUndefined(req.query.sessionId) && req.query.sessionId == req.sessionID);
        res.json({ success: loginResult });
    });
    app.get('/admin/checkIsSuperAdmin', function (req, res) {
        res.json({
            success: !helper.isUndefined(req.query.sessionId)
            && req.query.sessionId == req.sessionID
            && req.session.hash == 'superAdmin'
        });
    });
};