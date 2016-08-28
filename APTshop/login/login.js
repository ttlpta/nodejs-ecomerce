var aptShopLoginModule = angular.module('aptShopLoginModule', []);
aptShopLoginModule.component('login', {
	templateUrl : 'login/login.html',
	controllerAs : 'loginCtrl',
	controller : ['aptShopService', function loginController(aptShopService) {
			var self = this;
			this.validateField = function (field) {
				switch (field) {
				case 'username':
					self.validateUsernameNotification = aptShopService.validate('username', self.username);
					break;
				case 'password':
					self.validatePasswordNotification = aptShopService.validate('password', self.password);
					break;
				}
			};
		}
	]
});
