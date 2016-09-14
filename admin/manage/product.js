var aptProductModule = angular.module('aptProductModule', []);
aptProductModule.component('product', {
    templateUrl: 'manage/product.html',
    controllerAs: 'productCtrl',
    controller: ['$location', function ($location) {
        this.formTitle = 'Product Information'
    }]
});