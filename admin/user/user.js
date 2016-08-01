var aptUserModule = angular.module('aptUserModule', []);
aptUserModule.component('user', {
    templateUrl: 'user/user.html',
    controllerAs: 'userCtrl',
    controller: ['$http', 'userService', function userController($http, userService) {
        var self = this;
        this.users = userService.query();
        this.user = new userService();
        this.addUser = function () {
            self.user.username = self.lastname + ' ' + self.firstname;
            self.street = self.street || '';
            self.city = self.city || '';
            self.country = self.country || '';
            self.state = self.state || '';
            self.zip = self.zip || '';
            self.user.address = self.street + '-' + self.city + '-' + self.country + '-' + self.state + '-' + self.zip;
            self.user.$save(function(user) {
            });
        };
    }]

});