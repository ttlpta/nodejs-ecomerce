var permission = require('./permissionModel');
module.exports = function (app) {
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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVybWlzc2lvbkNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9Tb3VyY2UvUGVybWlzc2lvbi9wZXJtaXNzaW9uQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUM5QyxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsR0FBRztJQUM1QixHQUFHLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDOUMsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDMUIsS0FBSyxnQkFBZ0I7b0JBQ3BCLFVBQVUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxXQUFXO3dCQUN2RCxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUN2QixDQUFDLENBQUMsQ0FBQztvQkFDSCxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQzVCLEtBQUssQ0FBQztZQUNSLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDLENBQUMifQ==