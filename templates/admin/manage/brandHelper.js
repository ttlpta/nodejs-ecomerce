var aptBrandHelper = angular.module('aptBrandHelper', []);
aptBrandHelper.factory('brandService', ['$resource', function ($resource) {
    return $resource('/brand/:id', {}, {
        query: {
            method: 'GET',
            isArray: true
        }
    });
}]);