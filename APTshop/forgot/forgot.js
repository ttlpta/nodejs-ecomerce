var aptShopForgotModule = angular.module('aptShopForgotModule', []);
aptShopForgotModule.component('forgot', {
	templateUrl : 'forgot/forgot.html',
	controllerAs : 'forgotCtrl',
	controller : ['$http', 'aptShopService', function forgotController($http, aptShopService) {
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

				$http.post('/forgotPassword', {
					email : self.email
				}).then(function (response) {
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
		}
	]
}).component('updatePassword', {
	templateUrl : 'forgot/update.html',
	controllerAs : 'updateCtrl',
	controller : ['$http', 'aptShopService', '$location', function ($http, aptShopService, $location) {
			var self = this;
			this.validateField = function (field) {
				switch (field) {
				case 'password':
					aptShopService.validate('password', self.password, 'required|alphanumberic', 'Password').then(function (notification) {
						self.validatePasswordNotification = notification;
					});
					break;
				case 'confirm':
					if (self.confpass) {
						self.validateConfirmNotification = (self.confpass != self.password) ?
						'Confirm password is incorrect with password' : '';
					} else {
						aptShopService.validate('confpass', self.confpass, 'required', 'Confirm Password')
						.then(function (notification) {
							self.validateConfirmNotification = notification;
						});
					}
					break;
				}
			};
			this.updatePassword = function () {
				var userId = $location.search().id;
				if (userId && self.password) {
					$http.post('/updatePassword', {
						password : self.password, id : userId
					}).then(function (response) {
						if (response.data.success) {
							self.isSent = true;
						} else {
							self.notification = "Something error happen...:( Please resend the email!";
						}
					});
				}
			};

			var _isValidatedUser = function () {
				return (!self.validatePasswordNotification && !self.validateConfirmNotification);
			};
		}
	]
});
