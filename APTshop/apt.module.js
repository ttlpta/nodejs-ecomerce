var aptShopModule = angular.module('aptShopModule',
		['ngResource', 'ngRoute', 'aptShopHomeModule', 'aptShopLoginModule', 'aptShopRegisterModule', 'ngCookies', 'base64']);
aptShopModule.provider('aptShopAuthenticate', [function () {
			this.$get = ['$cookies', '$base64', function ($cookies, $base64) {
					var $auth = {};
					$auth.isLogin = function () {
						return (typeof $cookies.get('apt_session_user') != 'undefined')
					};
					$auth.getCurrentUser = function () {
						if (typeof $cookies.get('apt_session_user') == 'undefined') {
							return {};
						}
						return JSON.parse($base64.decode($cookies.get('apt_session_user')));
					};

					return $auth;
				}
			];
		}
	]).run(function ($rootScope, $location, $http, aptShopAuthenticate, $cookies) {
	$rootScope.abc = 'aaaa';
	$rootScope.$on('$locationChangeStart',
		function () {
		var path = $location.path().replace('/', '');
		switch (path) {
		case 'home':
			$rootScope.title = 'Home';
			break;
		case 'login':
			$rootScope.title = 'Login';
			break;
		case 'register':
			$rootScope.title = 'Register';
			break;
		case 'confirmRegisted':
			var param = $location.search();
			if (!aptShopAuthenticate.isLogin()) {
				$http.get("/confirmRegisted", {
					params : param
				}).then(function (response) {
					if (response.data.success) {
						$cookies.put('apt_session_user', response.data.hash);
						$rootScope.$emit('isLogging', true);
						$location.search({}).path('/home');
					} else {
						$location.search({}).path('/login');
					}
				});
			} else {
				$rootScope.$emit('isLogging', true);
				$location.search({}).path('/home');
			}
			break;
		}
	});

}).service('aptShopService', ['$http', function ($http) {
	this.validate = function (fieldName, fieldValue, rules, fieldLabel) {
		var self = this;
		var param = {};
		this.notification = '';
		var ruleArr = rules.split("|");
		fieldLabel = (typeof fieldLabel == 'undefined') ? fieldName : fieldLabel;
		if(jQuery.inArray('required', ruleArr) != -1){
			return (!fieldValue) ? fieldLabel + ' is required' : '';
		}
		
		if(jQuery.inArray('existed', ruleArr) != -1){
			console.log('adasdasdasdasds');
			param[fieldName] = fieldValue;
			$http.get("/validateUser", {
					params : param
				}).then(function (response) {
					console.log('asdasd');
					return (response.data.isExisted) ? 'existed' : '';
				});
		}
		console.log(this.notification);
		// switch (fieldName) {
		// case 'username':
			// if (fieldValue && jQuery.inArray('existed', ruleArr) != -1) {
				// $http.get("/validateUser", {
					// params : {
						// username : fieldValue
					// }
				// }).then(function (response) {
					// self.notification = (response.data.isExisted) ?
					// errorMsg[response.data.errorCode] : '';
				// });
			// } else if (!fieldValue && jQuery.inArray('required', ruleArr) != -1) {
				// self.notification = 'Username is required';
			// } else {
				// self.notification = '';
			// }
			// break;
		// case 'email':
			// if (fieldValue) {
				// $http.get("/validateUser", {
					// params : {
						// email : fieldValue
					// }
				// }).then(function (response) {
					// self.notification = (response.data.isNotValid) ?
					// errorMsg[response.data.errorCode] : '';
				// });
			// } else {
				// self.notification = 'Email is required';
			// }
			// break;
		// case 'password':
			// self.notification = (!fieldValue) ? 'Password is required' : '';
			// break;
		// case 'confpass':
			// if (!fieldValue) {
				// self.notification = 'Confirm password is required';
			// } else {
				// self.notification = '';
			// }
			// break;
		// case 'phone':
			// self.notification = (!fieldValue) ? 'Phone number is required' : '';
			// break;
		// }

		// return this.notification;
	};
}]);
