aptShopModule.component('aptHeader', {
    templateUrl: 'inc/header.html',
    controllerAs: 'headerCtrl',
    controller: ['aptShopAuthenticate', '$rootScope', function headerController(aptShopAuthenticate, $rootScope) {
        var self = this;
        $rootScope.$on('refresh_header', function () {
            self.isLogin = aptShopAuthenticate.isLogin();
            self.username = aptShopAuthenticate.getCurrentUser().username;
        });
        this.isLogin = aptShopAuthenticate.isLogin();
        this.username = aptShopAuthenticate.getCurrentUser().username;
    }]
}).component('aptFooter', {
    templateUrl: 'inc/footer.html'
}).component('aptBrand', {
    templateUrl: 'inc/brand.html'
});
