aptShopModule.config(['$routeProvider', '$controllerProvider',
    function ($routeProvider, $controllerProvider) {
        $routeProvider
            .when('/home', {
                template: '<home></home>'
            })
			.when('/confirmRegisted', {
				template: '<login></login>',
				controller : 'confirmRegistedCtrl'
            })
            .when('/login', {
                template: '<login></login>'
            })
            .when('/register', {
                template: '<register></register>'
            })
            .otherwise('/home');
    }
]);
aptShopModule.controller('confirmRegistedCtrl', function ($scope) {
    console.log('asdasd');
});
