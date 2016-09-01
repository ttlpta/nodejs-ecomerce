var aptCategoriesModule = angular.module('aptCategoriesModule', ['aptCategoriesHelper']);
aptCategoriesModule.component('categories', {
    templateUrl: 'manage/categories.html',
    controllerAs: 'categoriesCtrl',
    controller: ['catService', function (catService) {
        this.formTitle = 'Add Category';
        var self = this;
        this.category = new catService();
        this.validateField = function () {
            self.validateNameNotification = (self.category.name) ? '' : 'Category name is require';
        };
        this.saveCategory = function () {
            self.category.$save(function (data) {

            });
        };
        var _isValidatedUser = function () {
            return !self.validateNameNotification;
        };
    }]
});
