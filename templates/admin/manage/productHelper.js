var aptProductHelper = angular.module('aptProductHelper', []);
aptProductHelper.factory('productService', ['$resource', function ($resource) {
    return $resource('/product/:id', {}, {
        query: {
            method: 'GET',
            isArray: true
        }
    });
}]);