var admin = require('./adminModel'),
    helper = require('../helper'),
    session = require('express-session');
module.exports = function (app) {
    app.use(session({
        secret: '123456789',
        resave: false,
        saveUninitialized: true
    }));
    app.post('/admin/login', function (req, res) {
        admin.once('authenticate_admin', function (result) {
            var loginResult;
            if (result.success) {
                req.session.hash = (typeof result.isSuperAdmin != 'undefined') ? 'superAdmin' : result.hash;
                loginResult = {success: true, sessionId: req.sessionID};
            } else {
                req.session.destroy();
                loginResult = {success: false};
            }
            res.json(loginResult);
        });
        admin.isAdmin(req.body.username, req.body.password);
    });
    app.get('/admin/checkAdminIsLogin', function (req, res) {
        var loginResult = (!helper.isUndefined(req.query.sessionId) && req.query.sessionId == req.sessionID);
        res.json({success: loginResult});
    });
    app.get('/admin/checkIsSuperAdmin', function (req, res) {
        res.json({
            success: !helper.isUndefined(req.query.sessionId)
            && req.query.sessionId == req.sessionID
            && req.session.hash == 'superAdmin'
        });
    });
};