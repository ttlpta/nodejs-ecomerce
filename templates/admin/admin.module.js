var aptAdminModule = angular.module('aptAdminModule',
    ['ngRoute', 'ngResource', 'ngCookies', 'aptLoginModule',
        'aptDashboardModule', 'aptUserModule', 'aptUserGroupModule',
        'aptCategoriesModule', 'aptProductModule', 'aptBrandModule'
    ]);
aptAdminModule.provider('adminAuthenticate', [function () {
    this.$get = ['$http', '$cookies', function ($http, $cookies) {
        var $auth = {};
        $auth.isLogin = function (callback) {
            if (typeof $cookies.get('apt_session_admin') != 'undefined') {
                $http.get('/admin/checkAdminIsLogin', {params: {sessionId: $cookies.get('apt_session_admin')}})
                    .then(function (response) {
                        callback(response.data.success)
                    });
            } else {
                callback(false);
            }
        };
        $auth.login = function (username, password, callback) {
            if (!username || !password) {
                callback({success: false, message: 'Password / Username is required'});
            } else {
                $http.post('/admin/login', {username: username, password: password})
                    .then(function (response) {
                        if (response.data.success) {
                            $cookies.put('apt_session_admin', response.data.sessionId);
                            callback({success: true});
                        } else {
                            callback({success: false, message: 'Password / Username is incorrect'});
                        }
                    }).catch(function () {
                        callback({success: false, message: 'Error has happened'});
                    });
            }
        };
        $auth.isSuperAdmin = function (callback) {
            if (typeof $cookies.get('apt_session_admin') != 'undefined') {
                $http.get('/admin/checkIsSuperAdmin', {params: {sessionId: $cookies.get('apt_session_admin')}})
                    .then(function (response) {
                        callback(response.data.success)
                    });
            } else {
                callback(false);
            }
        };
        return $auth;
    }];
}]).run(function ($rootScope, $location, adminAuthenticate) {
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
            var path = $location.path().replace('/', '');
            if (path !== 'login') {
                adminAuthenticate.isLogin(function (isLogin) {
                    if (!isLogin) {
                        $location.path('login');
                    }
                });
            }
        });
}).directive('fileImage', ['$http', '$location', function ($http, $location) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            element.bind('change', function () {
                scope.$apply(function () {
                    var imagePath = element[0].files[0];
                    if (typeof imagePath != 'undefined') {
                        var fd = new FormData();
                        fd.append('file', imagePath);
                        $http.post('../imageUpload/'+attr.name, fd, {
                            transformRequest: angular.identity,
                            headers: {'Content-Type': undefined}
                        }).then(function (response) {
                            if (response.data.success) {
                                scope.srcImg = $location.protocol() + '://' + $location.host() + '/' + response.data.srcImage;
                            } else {
                                scope.imageUploadStatus = 'Upload image fail';
                            }
                        });
                    }
                });
            });
        }
    };
}]);

