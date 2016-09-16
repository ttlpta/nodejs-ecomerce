var aptBrandHelper = angular.module('aptBrandHelper', []);
aptBrandHelper.factory('brandService', ['$resource', function ($resource) {
    return $resource('/brand', {}, {
        query: {
            method: 'GET',
            params: {
                action: 'listBrand'
            },
            isArray: true
        }
    });
}]);