var aptProductModule = angular.module('aptProductModule', ['aptProductHelper']);
aptProductModule.component('product', {
    templateUrl: 'manage/product.html',
    controllerAs: 'productCtrl',
    controller: ['$scope', function ($scope) {
        var self = this;
        this.formTitle = 'Product Information';
        this.saveProduct = function () {
        };
        this.imageNames = [1];
        this.addImageInput = function () {
            self.imageNames.push(self.imageNames[length - 1] + 1);
        };
        this.delImageInput = function (index) {
            self.imageNames.splice(self.imageNames.indexOf(index), 1);
        };
    }]
});