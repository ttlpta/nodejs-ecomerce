var aptShopForgotModule = angular.module('aptShopForgotModule', []);
aptShopForgotModule.component('forgot', {
    templateUrl: 'forgot/forgot.html',
    controllerAs: 'forgotCtrl',
    controller: ['$http', 'aptShopService', function forgotController($http, aptShopService) {
        var self = this;
        this.isSent = false;
        this.validateField = function () {
            aptShopService.validate('email', self.email, 'required|email')
                .then(function (notification) {
                    self.validateEmailNotification = notification;
                });
        };
        this.forgotEmail = function () {
            if (!_isValidatedUser())
                return false;

            $http.post('/forgotPassword', {email: self.email}).then(function (response) {
                if (response.data.success) {
                    self.isSent = true;
                } else {
                    self.notification = "Something error happen...:( Please resend the email!";
                }
            });
        };
        var _isValidatedUser = function () {
            return !self.validateEmailNotification;
        };
    }]
}).component('updatePassword', {
    templateUrl: 'forgot/update.html',
    controllerAs: 'updateCtrl',
    controller: ['$http', 'aptShopService', function ($http, aptShopService) {

    }]
});