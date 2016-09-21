var aptProductHelper = angular.module('aptProductHelper', []);
aptProductHelper.factory('productService', ['$resource', function ($resource) {
    return $resource('/product', {}, {
        query: {
            method: 'GET',
            params: {
                action: 'listProduct'
            },
            isArray: true
        }
    });
}]);