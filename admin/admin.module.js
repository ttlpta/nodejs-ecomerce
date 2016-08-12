var aptAdminModule = angular.module('aptAdminModule',
    ['ngRoute', 'ngResource', 'ngCookies', 'aptLoginModule', 'aptDashboardModule', 'aptUserModule', 'aptUserGroupModule']);
aptAdminModule.provider('adminAuthenticate', [function () {
    this.$get = ['$http', '$cookies', function ($http, $cookies) {
        var $auth = {};
        $auth.isAuthenticated = function () {
            return (typeof $cookies.get('apt_session_admin') != 'undefined')
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
        $auth.isSuperAdmin = function () {
            return (this.isAuthenticated() && $cookies.get('apt_session_admin') == 'superAdmin');
        };

        return $auth;
    }];
}]);
aptAdminModule.run(function ($rootScope, $location, adminAuthenticate) {
    $rootScope.$on('$locationChangeStart',
        function () {
            var isAuth = adminAuthenticate.isAuthenticated();
            if (typeof isAuth == 'undefined' || false == isAuth) {
                $location.path('login');
            } else if (!adminAuthenticate.isSuperAdmin()) {
                var path = $location.path().replace('/', '');
                if (path == 'usergroup') {
                    $location.path('user');
                }
            }
        });
});

