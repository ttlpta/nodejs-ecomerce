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
});
