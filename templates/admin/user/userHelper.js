var aptUserHelper = angular.module('aptUserHelper', []);
aptUserHelper.factory('userService', ['$resource',
	function ($resource) {
		return $resource('/user/:id', {}, {
			query : {
				method : 'GET',
				isArray : true
			}
		});
	}
]);
