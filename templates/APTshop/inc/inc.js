aptShopModule.component('aptHeader', {
    templateUrl: 'inc/header.html',
    controllerAs: 'headerCtrl',
    controller: ['aptShopAuthenticate', '$rootScope', '$http', function (aptShopAuthenticate, $rootScope, $http) {
        var self = this;
        $rootScope.$on('refresh_header', function () {
            self.isLogin = aptShopAuthenticate.isLogin();
            self.username = aptShopAuthenticate.getCurrentUser().username;
        });
        this.isLogin = aptShopAuthenticate.isLogin();
        this.username = aptShopAuthenticate.getCurrentUser().username;
        $http.get('/categories', {params: {action: 'listCat'}}).then(function (result) {
            var categories = result.data;
            self.parentCategories = [];
            categories.forEach(function (cat) {
                if (cat.level == 1) {
                    self.parentCategories.push(cat);
                }
            });
            self.subCategories = function (id) {
                var subCategories = [];
                categories.forEach(function (cat) {
                    if (cat.parent_id == id) {
                        subCategories.push(cat);
                    }
                });
                return subCategories;
            };
        });

    }]
}).component('aptFooter', {
    templateUrl: 'inc/footer.html'
}).component('aptBrand', {
    templateUrl: 'inc/brand.html'
});
