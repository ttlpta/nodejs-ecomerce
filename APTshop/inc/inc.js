aptShopModule.component('aptHeader', {
    templateUrl: 'inc/header.html',
    controllerAs: 'headerCtrl',
    controller: ['aptShopAuthenticate', '$rootScope', function headerController(aptShopAuthenticate, $rootScope) {
        var self = this;
        $rootScope.$on('isLogging', function (e, data) {
            if (data) {
                self.isLogin = aptShopAuthenticate.isLogin();
                self.username = aptShopAuthenticate.getCurrentUser().username;
            }
        });
        this.isLogin = aptShopAuthenticate.isLogin();
        this.username = aptShopAuthenticate.getCurrentUser().username;
    }]
}).component('aptFooter', {
    templateUrl: 'inc/footer.html'
}).component('aptBrand', {
    templateUrl: 'inc/brand.html'
});
