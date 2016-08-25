aptShopModule.component('aptHeader', {
    templateUrl : 'inc/header.html',
    controllerAs : 'headerCtrl',
    controller: ['aptShopAuthenticate', function headerController(aptShopAuthenticate) {
        this.isLogin = aptShopAuthenticate.isLogin();
        this.username = aptShopAuthenticate.visitor.username;
    }]
}).component('aptFooter', {
    templateUrl: 'inc/footer.html'
}).component('aptBrand', {
    templateUrl: 'inc/brand.html'
});
