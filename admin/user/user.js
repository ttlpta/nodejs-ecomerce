var aptUserModule = angular.module('aptUserModule', []);
aptUserModule.component('user', {
    templateUrl: 'user/user.html',
    controllerAs: 'userCtrl',
    controller: ['$http', 'userService', 'validateAddUserErrorCode', function userController($http, userService, validateAddUserErrorCode) {
        var self = this;
        this.users = userService.query();
        this.user = new userService();
        this.addUser = function () {
            if (self.user.password != self.confpass) {
                alert('Confirm password is correct');
                return;
            }
            var firstname = self.firstname || '';
            self.user.username = self.lastname + firstname;
            self.user.address = _buildAddress([self.street, self.city, self.country, self.state, self.zip]);
            self.user.registered = new Date();
            self.user.$save(function (data) {
                if (+data.lastInsertId > 0) {
                    alert('Insert user succress');
                    location.reload();
                } else {
                    alert(validateAddUserErrorCode[data.errorCode]);
                }
            });
        };
        this.editUser = function (userId) {
            self.user = userService.get({id: userId});
            console.log(self.user);
        };
        function _buildAddress(address) {
            var addressStr = '';
            angular.forEach(address, function (value, key) {
                if (value) {
                    addressStr += value + ' ';
                }
            });
            return addressStr;
        }
    }]

});