var aptProductsModule = angular.module('aptProductsModule', []);
aptProductsModule.component('products', {
    templateUrl: 'products/products.html',
    controllerAs: 'productsCtrl',
    controller: ['$location', function ($location) {
        console.log($location.hash());
    }]
});