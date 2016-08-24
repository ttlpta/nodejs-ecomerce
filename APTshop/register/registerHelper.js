var aptShopRegisterHelper = angular.module('aptShopRegisterHelper', []);
aptShopRegisterHelper.constant('validateRegisterErrorCode', {
    '1': 'You are missing some fields',
    '2': 'Email is existed',
    '3': 'Username is existed',
    '4': 'Username && Email are existed',
    '5': 'Confirm password is incorrect',
    '6': 'User do not exist',
    '7': 'Please fill a valid email',
    '8': 'Register fail. Please try again!',
});
