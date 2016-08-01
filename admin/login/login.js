var aptLoginModule = angular.module('aptLoginModule', []);
aptLoginModule.component('login', {
    templateUrl: 'login/login.html',
    controllerAs: 'loginCrl',
    controller: ['adminAuthenticate', '$location',
        function loginController(adminAuthenticate, $location) {
            var isAuth = adminAuthenticate.isAuthenticated();
            if (typeof isAuth != 'undefined' && true == isAuth) {
                $location.path('dashboard');
            }
            var self = this;
            this.message = '';
            this.login = function () {
                adminAuthenticate.login(self.username, self.password, function (response) {
                    if (response.success) {
                        $location.path('dashboard');
                    } else {
                        self.message = response.message;
                    }
                });
            }
        }]
});