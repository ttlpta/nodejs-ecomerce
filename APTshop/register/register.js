var aptShopRegisterModule = angular.module('aptShopRegisterModule', ['aptShopRegisterHelper']);
aptShopRegisterModule.component('register', {
	templateUrl : 'register/register.html',
	controllerAs : 'registerCtrl',
	controller : ['validateRegisterErrorCode', '$http', '$resource', '$location', 'aptShopService',
		function registerController(errorMsg, $http, $resource, $location, aptShopService) {
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
						self.user = new User();
					}
				});
			};
			this.validateField = function (field) {
				switch (field) {
				case 'username':
					self.validateUsernameNotification = aptShopService.validate('username', self.user.username, 'required|existed');
					break;
				case 'email':
					self.validateEmailNotification = aptShopService.validate('email', self.user.email, 'required|existed');
					break;
				case 'password':
					self.validatePasswordNotification = aptShopService.validate('password', self.user.password, 'required');
					break;
				case 'confpass':
					if (self.confpass != self.user.password) {
						self.validateConfirmPassNotification = 'Confirm password is incorrect with password';
					} else {
						self.validateConfirmPassNotification = aptShopService.validate('confpass', self.confpass, 'required');
					}
					break;
				case 'phone':
					self.validatePhoneNotification = aptShopService.validate('phone', self.user.phone, 'required');
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
		}
	]
});
