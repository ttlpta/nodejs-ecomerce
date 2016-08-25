var aptShopHomeModule = angular.module('aptShopHomeModule', []);
aptShopHomeModule.component('home', {
    templateUrl: 'home/home.html',
    controllerAs: 'homeCtrl',
    controller: ['$location', function homeController($location) {

    }]
});