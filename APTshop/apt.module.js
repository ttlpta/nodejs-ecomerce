var aptShopModule = angular.module('aptShopModule',
    ['ngResource', 'ngRoute', 'aptShopHomeModule', 'aptShopLoginModule', 'aptShopRegisterModule', 'ngCookies', 'base64']);
aptShopModule.provider('aptShopAuthenticate', [function () {
    this.$get = ['$cookies', '$base64', function ($cookies, $base64) {
        var $auth = {};
        $auth.isLogin = function () {
            return (typeof $cookies.get('apt_session_user') != 'undefined')
        };
        $auth.getCurrentUser = function () {
            if (typeof $cookies.get('apt_session_user') == 'undefined') {
                return {};
            }
            return JSON.parse($base64.decode($cookies.get('apt_session_user')));
        };

        return $auth;
    }];
}]).run(function ($rootScope, $location, $http, aptShopAuthenticate, $cookies) {
    $rootScope.$on('$locationChangeStart',
        function () {
            var path = $location.path().replace('/', '');
            switch (path) {
                case 'home':
                    $rootScope.title = 'Home';
                    break;
                case 'login':
                    $rootScope.title = 'Login';
                    break;
                case 'register':
                    $rootScope.title = 'Register';
                    break;
                case 'confirmRegisted':
                    var param = $location.search();
                    if (!aptShopAuthenticate.isLogin()) {
                        $http.get("/confirmRegisted", {params: param}).then(function (response) {
                            if (response.data.success) {
                                $cookies.put('apt_session_user', response.data.hash);
                                $rootScope.$emit('isLogging', true);
                                $location.search({}).path('/home');
                            } else {
                                $location.search({}).path('/login');
                            }
                        });
                    } else {
                        $rootScope.$emit('isLogging', true);
                        $location.search({}).path('/home');
                    }
                    break;
            }
        });
});




