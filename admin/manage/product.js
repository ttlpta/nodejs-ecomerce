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
}).directive('fileImage', ['$http', '$location', '$parse', function ($http, $location) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            element.bind('change', function () {
                scope.$apply(function () {
                    var imagePath = element[0].files[0];
                    if (typeof imagePath != 'undefined') {
                        var fd = new FormData();
                        fd.append('file', imagePath);
                        $http.post('../photos/upload', fd, {
                            transformRequest: angular.identity,
                            headers: {'Content-Type': undefined}
                        }).then(function (response) {
                            if (response.data.success) {
                                scope.srcImg = $location.protocol() + '://' + $location.host() + '/' + response.data.srcImage;
                            } else {
                                scope.imageUploadStatus = 'Upload image fail';
                            }
                        });
                    }
                });
            });
        }
    };
}]);