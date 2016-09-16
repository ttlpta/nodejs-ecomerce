var aptAdminModule = angular.module('aptAdminModule',
    ['ngRoute', 'ngResource', 'ngCookies', 'aptLoginModule',
        'aptDashboardModule', 'aptUserModule', 'aptUserGroupModule',
        'aptCategoriesModule', 'aptProductModule', 'aptBrandModule'
    ]);
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
    var socket = io();
    $rootScope.userOnline = [];
    socket.on('user_online', function (data) {
        $rootScope.$apply(function () {
            $rootScope.userOnline.push(data);
        });
    });
    socket.on('user_offline', function (data) {
        $rootScope.$apply(function () {
            for (var i = 0; i < $rootScope.userOnline.length; i++) {
                if ($rootScope.userOnline[i].id == data.id) {
                    $rootScope.userOnline.splice(i, 1);
                }
            }
        });
    });
    $rootScope.$on('$locationChangeStart',
        function () {
            var isAuth = adminAuthenticate.isAuthenticated();
            if (typeof isAuth == 'undefined' || false == isAuth) {
                $location.path('login');
            } else if (!adminAuthenticate.isSuperAdmin()) {
                var path = $location.path().replace('/', '');
                if (path == 'usergroup') {
                    alert('You do not have permission to access');
                    $location.path('user');
                }
            }
        });
});

