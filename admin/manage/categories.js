var aptCategoriesModule = angular.module('aptCategoriesModule', ['aptCategoriesHelper']);
aptCategoriesModule.component('categories', {
    templateUrl: 'manage/categories.html',
    controllerAs: 'categoriesCtrl',
    controller: ['catService', function (catService) {
        this.formTitle = 'Add Category';
        var self = this;
        var _initForm = function () {
            self.category = new catService({parent_id: '1'});
            self.categories = catService.query();
        };
        _initForm();
        this.validateField = function () {
            self.validateNameNotification = (self.category.name) ? '' : 'Category name is require';
        };
        this.saveCategory = function () {
            if (!_isValidatedUser())
                return;
            self.category.$save(function (data) {
                if (data.success) {
                    _initForm();
                }
            });
        };
        this.editCat = function (catId, catName) {
            self.formTitle = 'Edit Category ' + catName;
            self.category = catService.get({
                action: 'editCat',
                id: catId
            }, function (result) {
                self.category = result;
            });
        };
        this.changeToAddCat = function () {
            self.formTitle = 'Add Category';
            _initForm();
        };
        var _isValidatedUser = function () {
            return !self.validateNameNotification;
        };
    }]
});
