var aptBrandModule = angular.module('aptBrandModule', ['aptBrandHelper']);
aptBrandModule.component('brand', {
    templateUrl: 'manage/brand.html',
    controllerAs: 'brandCtrl',
    controller: ['brandService', function (Brand) {
        var self = this;
        this.formTitle = 'Add New Brand';
        self.brands = Brand.query();
        this.saveBrand = function () {
            self.brand.$save(function (data) {
                if (data.success) {
                    self.brands = Brand.query();
                }
                _changeAddBrandForm();
            });
        };
        var _changeAddBrandForm = function () {
            self.formTitle = 'Add New Brand';
            self.brand = new Brand();
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
                        $http.post('../brand/upload', fd, {
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
}]);;
