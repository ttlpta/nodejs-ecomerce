var aptLoginModule = angular.module('aptLoginModule', ['aptLoginHelper']);
aptLoginModule.component('login', {
    templateUrl: 'login/login.html',
    controllerAs: 'loginCrl',
    controller: ['adminAuthenticate', '$location',
        function (adminAuthenticate, $location) {
            adminAuthenticate.isLogin(function (isLogin) {
                if (isLogin) {
                    $location.path('dashboard');
                }
            });
            var self = this;
            this.login = function () {
                adminAuthenticate.login(self.username, self.password, function (response) {
                    if (response.success) {
                        $location.path('dashboard');
                    } else {
                        self.message = response.message;
                    }
                });
            }
        }
    ]
});
