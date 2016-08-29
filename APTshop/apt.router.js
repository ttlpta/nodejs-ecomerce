aptShopModule.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/home', {
                template: '<home></home>'
            })
            .when('/confirmRegisted', {
                template: ''
            })
            .when('/login', {
                template: '<login></login>'
            })
            .when('/register', {
                template: '<register></register>'
            })
            .when('/forgotPassword', {
                template: '<forgot></forgot>'
            })
            .otherwise('/home');
    }
]);
