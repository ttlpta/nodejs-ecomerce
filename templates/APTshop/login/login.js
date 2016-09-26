var aptShopLoginModule = angular.module('aptShopLoginModule', []);
aptShopLoginModule.component('login', {
    templateUrl: 'login/login.html',
    controllerAs: 'loginCtrl',
    controller: ['aptShopService', '$http', '$cookies', '$rootScope', '$location',
        function loginController(aptShopService, $http, $cookies, $rootScope, $location) {
            var self = this;
            this.validateField = function (field) {
                switch (field) {
                    case 'username':
                        aptShopService.validate('username', self.username, 'required', 'Username')
                            .then(function (notification) {
                                self.validateUsernameNotification = notification;
                            });
                        break;
                    case 'password':
                        aptShopService.validate('password', self.password, 'required', 'Password')
                            .then(function (notification) {
                                self.validatePasswordNotification = notification;
                            });
                        break;
                }
            };
            this.login = function () {
                if (!_isValidatedUser())
                    return false;
                var param = {username: self.username, password: self.password};
                $http.post('/userLogin', param).then(function (response) {
                    if (response.data.success) {
                        $cookies.put('apt_session_user', response.data.hash);
                        $rootScope.$emit('refresh_header');
                        $location.search({}).path('/home');
                    } else {
                        self.notification = "Wrong username or password";
                    }
                });
            };
            var _isValidatedUser = function () {
                return (!self.validateUsernameNotification
                && !self.validatePasswordNotification);
            };
        }
    ]
});
