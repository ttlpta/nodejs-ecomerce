var aptUserGroupHelper = angular.module('aptUserGroupHelper', []);
aptUserGroupHelper.factory('userGroupService', ['$resource',
    function ($resource) {
        return $resource('/admin/usergroup', {}, {
            query: {
                method: 'GET',
                params: {action: 'listUserGroup'},
                isArray: true
            }
        });
    }
]).factory('permissionService', ['$resource',
    function ($resource) {
        return $resource('/admin/permission', {}, {
            query: {
                method: 'GET',
                params: {action: 'listPermission'},
                isArray: true
            }
        });
    }
]).constant('validateAddGroupErrorCode', {
    '1': 'Group name is existed'
});
