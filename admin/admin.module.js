var aptAdminModule = angular.module('aptAdminModule', ['ngRoute', 'ngResource', 'ngCookies', 'aptLoginModule', 'aptDashboardModule', 'aptUserModule']);
aptAdminModule.provider('adminAuthenticate', [function () {
    this.$get = ['$http', '$cookies', function ($http, $cookies) {
        var $auth = {};
        $auth.isAuthenticated = function () {
            if (typeof $cookies.get('apt_session_admin') != 'undefined') {
                return true;
            }
            return false;
        };
        $auth.login = function (username, password, callback) {
            if (!username || !password) {
                callback({success: false, message: 'password/username is required'});
            } else {
                $http.post('/admin/login', {username: username, password: password})
                    .then(function (response) {
                        if (response.data.success) {
                            $cookies.put('apt_session_admin', response.data.hash);
                            callback({success: true});
                        } else {
                            callback({success: false, errorCode: '1'})
                        }
                    }, function () {
                        callback({success: false, errorCode: '1'});
                    });
            }
        };

        return $auth;
    }];
}]).factory('userService', ['$resource',
    function ($resource) {
        return $resource('/admin/user', {}, {
            query: {
                method: 'GET',
                params: {action: 'listUser'},
                isArray: true
            },
            get: {
                method: 'GET',
                params: {action: 'showUser'}
            },
            delete: {
                method: 'DELETE',
                params: {action: 'delete'}
            },
            save: {
                method: 'POST'
            }
        });
    }
]).constant('validateAddUserErrorCode', {
    '1': 'You are missing some fields',
    '2': 'Email is existed',
    '3': 'Username is existed',
    '4': 'Username && Email are existed',
    '5': 'Confirm password is correct'

}).constant('loginErrorCode', {
    '1': 'Password/Username is incorrect'
});
aptAdminModule.run(function ($rootScope, $location, adminAuthenticate) {
    $rootScope.$on('$locationChangeStart',
        function () {
            var isAuth = adminAuthenticate.isAuthenticated();
            if (typeof isAuth == 'undefined' || false == isAuth) {
                $location.path('login');
            }
        });
});

