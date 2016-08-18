var aptShopModule = angular.module('aptShopModule',
    ['ngResource', 'ngRoute', 'aptShopHomeModule', 'aptShopLoginModule', 'aptShopRegisterModule']);
aptShopModule.run(function ($rootScope, $location) {
    $rootScope.$on('$locationChangeStart',
        function () {
            var path = $location.path().replace('/', '');
            switch (path) {
                case 'login':
                    $rootScope.title = 'Login';
                    break;
                case 'register':
                    $rootScope.title = 'Register';
                    break;
            }
        });
});


