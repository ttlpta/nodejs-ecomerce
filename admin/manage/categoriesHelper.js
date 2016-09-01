var aptCategoriesHelper = angular.module('aptCategoriesHelper', []);
aptCategoriesHelper.factory('catService', ['$resource', function ($resource) {
    return $resource('/categories', {}, {
        query: {
            method: 'GET',
            params: {
                action: 'listCat'
            },
            isArray: true
        }
    });
}]);