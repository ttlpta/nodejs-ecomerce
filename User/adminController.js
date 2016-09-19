var admin = require('./adminModel'), helper = require('../helper'), session = require('express-session');
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
                loginResult = { success: true, sessionId: req.sessionID };
            }
            else {
                req.session.destroy();
                loginResult = { success: false };
            }
            res.json(loginResult);
        });
        admin.isAdmin(req.body.username, req.body.password);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW5Db250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWRtaW5Db250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFDL0IsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFDN0IsT0FBTyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3pDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxHQUFHO0lBQzFCLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQ1osTUFBTSxFQUFFLFdBQVc7UUFDbkIsTUFBTSxFQUFFLEtBQUs7UUFDYixpQkFBaUIsRUFBRSxJQUFJO0tBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ0osR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUN2QyxLQUFLLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLFVBQVUsTUFBTTtZQUM3QyxJQUFJLFdBQVcsQ0FBQztZQUNoQixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDakIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxZQUFZLElBQUksV0FBVyxDQUFDLEdBQUcsWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQzVGLFdBQVcsR0FBRyxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUMsQ0FBQztZQUM1RCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdEIsV0FBVyxHQUFHLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBQyxDQUFDO1lBQ25DLENBQUM7WUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3hELENBQUMsQ0FBQyxDQUFDO0lBQ0gsR0FBRyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQ2xELElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JHLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFDLENBQUMsQ0FBQztJQUNyQyxDQUFDLENBQUMsQ0FBQztJQUNILEdBQUcsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUNsRCxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ0wsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQzttQkFDOUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDLFNBQVM7bUJBQ3BDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLFlBQVk7U0FDdEMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMifQ==