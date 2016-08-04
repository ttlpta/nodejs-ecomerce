var aptUserModule = angular.module('aptUserModule', []);
aptUserModule.component('user', {
    templateUrl: 'user/user.html',
    controllerAs: 'userCtrl',
    controller: ['$http', 'userService', 'validateAddUserErrorCode', function userController($http, userService, validateAddUserErrorCode) {
        var self = this;
        this.users = userService.query();
        this.user = new userService();
        this.formTitle = 'Add user';
        this.addUser = function () {
            if (self.user.password != self.confpass) {
                alert('Confirm password is correct');
                return;
            }
            self.user.registered = new Date();
            self.user.$save(function (data) {
                if (+data.lastInsertId > 0) {
                    alert('Insert user succress');
                    location.reload();
                } else {
                    console.log(data.errorCode);
                    self.notification = validateAddUserErrorCode[data.errorCode];
                }
            });
        };
        this.editUser = function (userId) {
            self.formTitle = 'Edit user '+userId;
            self.user = userService.get({id: userId});
        };
    }]

});