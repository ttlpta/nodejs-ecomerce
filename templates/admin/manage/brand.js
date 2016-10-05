var aptBrandModule = angular.module('aptBrandModule', ['aptBrandHelper']);
aptBrandModule.component('brand', {
    templateUrl: 'manage/brand.html',
    controllerAs: 'brandCtrl',
    controller: ['brandService', '$scope', '$location', function (Brand, $scope, $location) {
        var self = this;
        this.brand = new Brand();
        this.brands = Brand.query();
        $scope.$watch('srcImg', function (newValue, oldValue) {
            if (typeof newValue != 'undefined') {
                var imgName = function (imgSrc) {
                    var imgSrcArr = imgSrc.split('/');
                    return imgSrcArr[imgSrcArr.length - 1];
                };
                self.brand.logo_image = imgName(newValue);
                self.srcImg = newValue;
            }
        });
        this.saveBrand = function () {
            self.brand.$save(function (data) {
                self.brands = Brand.query();
                _changeAddBrandForm();
            });
        };
        this.editBrand = function (brandId) {
            self.formTitle = 'Edit Brand ' + brandId;
            self.brand = Brand.get({
                action: 'getBrand',
                id: brandId
            }, function (result) {
                if (result.success == false) {
                    location.reload();
                } else if (result.id) {
                    self.srcImg = _buildImageSource(result.logo_image);
                }
            });
        };
        this.deleteBrand = function (brandId) {
            var delConfirm = confirm('Are you sure?');
            if (delConfirm) {
                Brand.delete({
                    id: brandId
                }, function (result) {
                    self.brands = Brand.query();
                });
            }
        };
        this.changeToAddBrand = function () {
            _changeAddBrandForm();
        };
        var _changeAddBrandForm = function () {
            self.srcImg = '';
            $('#logo').val('');
            self.brand = new Brand();
            self.formTitle = 'Add New Brand';
        };
        var _buildImageSource = function (logo_image) {
            return $location.protocol() + '://' + $location.host() + '/uploads/logos/' + logo_image;
        };
    }]
});
