aptAdminModule.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/dashboard', {
                template: '<dashboard></dashboard>'
            })
            .when('/login', {
                template: '<login></login>'
            })
            .when('/user', {
                template: '<user></user>'
            })
            .when('/usergroup', {
                template: '<usergroup></usergroup>'
            })
            .otherwise('/login');
    }
]);