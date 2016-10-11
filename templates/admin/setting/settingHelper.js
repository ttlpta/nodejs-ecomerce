var aptSettingHelper = angular.module('aptSettingHelper', []);
aptProductHelper.factory('settingService', ['$resource', function ($resource) {
    return $resource('/product/:id', {}, {
        query: {
            method: 'GET',
            isArray: true
        }
    });
}]);