var aptProductHelper = angular.module('aptProductHelper', []);
aptProductHelper.factory('productService', ['$resource', function ($resource) {
    return $resource('/category/:id/product', {}, {
        query: {
            method: 'GET',
            isArray: true
        }
    });
}]);