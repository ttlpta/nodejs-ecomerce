var aptProductsModule = angular.module('aptProductsModule', ['aptProductHelper']);
aptProductsModule.component('products', {
    templateUrl: 'products/products.html',
    controllerAs: 'productsCtrl',
    controller: ['$location', 'productService', function ($location, productService) {
        var self = this;
        var catIdFromHashUrl = function (hashUrl) {
            var params = hashUrl.split('.');
            return params[params.length - 1];
        };
        var catId = catIdFromHashUrl($location.hash());
        this.products = productService.query({ id: catId });
    }]
});