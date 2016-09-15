var aptProductModule = angular.module('aptProductModule', []);
aptProductModule.component('product', {
    templateUrl: 'manage/product.html',
    controllerAs: 'productCtrl',
    controller: ['$scope', function ($scope) {
        var self = this;
        this.formTitle = 'Product Information';
        this.saveProduct = function () {
            console.log($scope.image);
        };
        this.imageNames = [1];
        this.addImageInput = function(){
            self.imageNames.push(self.imageNames.length + 1);
        };
    }]
}).directive('fileImage', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.image = [];
            element.bind('change', function () {
                scope.$apply(function () {
                    scope.image.push(element[0].files[0]);
                    console.log(attrs.name);
                });
            });
        }
    };
});