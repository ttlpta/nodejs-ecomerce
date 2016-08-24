var aptShopRegisterModule = angular.module('aptShopRegisterModule', ['aptShopRegisterHelper']);
aptShopRegisterModule.component('register', {
    templateUrl: 'register/register.html',
    controllerAs: 'registerCtrl',
    controller: ['validateRegisterErrorCode', '$http', '$resource', '$location',
        function registerController(errorMsg, $http, $resource, $location) {
        var self = this;
        var User = $resource('/registerUser');
		this.isRegisted = false;
        this.user = new User();
        this.register = function () {
            if (!_isValidatedUser())
                return false;
            self.user.registered = new Date();
            self.user.$save(function (data) {
                if (data.success) {
                    self.isRegisted = true;
                } else {
                    self.notification = errorMsg[data.errorCode];
                }
            });
        };
        this.validateField = function (field) {
            switch (field) {
                case 'username':
                    if (self.user.username) {
                        $http.get("/validateUser", {params: {username: self.user.username}}).then(function (response) {
                            self.validateUsernameNotification = (response.data.isExisted) ?
                                errorMsg[response.data.errorCode] : '';
                        });
                    } else {
                        self.validateUsernameNotification = 'Username is required';
                    }
                    break;
                case 'email':
                    if (self.user.email) {
                        $http.get("/validateUser", {params: {email: self.user.email}}).then(function (response) {
                            self.validateEmailNotification = (response.data.isNotValid) ?
                                errorMsg[response.data.errorCode] : '';
                        });
                    } else {
                        self.validateEmailNotification = 'Email is required';
                    }
                    break;
                case 'password':
                    self.validatePasswordNotification = (!self.user.password) ? 'Password is required' : '';
                    break;
                case 'confpass':
                    if (!self.confpass) {
                        self.validateConfirmPassNotification = 'Confirm password is required';
                    } else if (self.confpass != self.user.password) {
                        self.validateConfirmPassNotification = 'Confirm password is incorrect with password';
                    } else if (self.confpass) {
                        self.validateConfirmPassNotification = '';
                    }
                    break;
                case 'phone':
                    self.validatePhoneNotification = (!self.user.phone) ? 'Phone number is required' : '';
                    break;
            }
        };
        var _isValidatedUser = function () {
            return (!self.validateUsernameNotification
            && !self.validateEmailNotification
            && !self.validateConfirmPassNotification
            && !self.validatePasswordNotification
            && !self.validatePhoneNotification);
        };
    }]
});