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
                self.notification = validateAddUserErrorCode['5'];
                return;
            }
            self.user.registered = new Date();
            self.user.$save(function (data) {
                if (+data.lastInsertId > 0) {
                    alert('Insert user succress');
                    location.reload();
                } else {
                    self.notification = validateAddUserErrorCode[data.errorCode];
                }
            });
        };
        this.editUser = function (userId) {
            self.formTitle = 'Edit user ' + userId;
            self.user = userService.get({id: userId});
        };
        this.validateField = function (field) {
            var param = {};
            if (field == 'username' && self.user.username) {
                param.username = self.user.username;
                if (!$.isEmptyObject(param)) {
                    $http.get("/admin/validateUser", {params: param}).then(function (response) {
                        if (response.data.isExisted) {
                            self.notification = validateAddUserErrorCode[response.data.errorCode];
                        } else {
                            self.notification = '';
                        }
                    });
                }
            } else if (field == 'email' && self.user.email) {
                param.email = self.user.email;
            }
        }
    }]

});