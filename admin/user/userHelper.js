var aptUserHelper = angular.module('aptUserHelper', []);
aptUserHelper.factory('userService', ['$resource',
    function ($resource) {
        return $resource('/user', {}, {
            query: {
                method: 'GET',
                params: {action: 'listUser'},
                isArray: true
            }
        });
    }
]).constant('validateAddUserErrorCode', {
    '1': 'You are missing some fields',
    '2': 'Email is existed',
    '3': 'Username is existed',
    '4': 'Username && Email are existed',
    '5': 'Confirm password is incorrect',
    '6': 'User do not exist',
    '7': 'Please fill a valid email'
});
