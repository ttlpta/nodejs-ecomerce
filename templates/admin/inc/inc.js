aptAdminModule.component('aptHeader', {
    templateUrl: 'inc/header.html',
    controllerAs: 'headerCtr',
    controller: ['$route', '$routeParams', '$location', function ($route, $routeParams, $location) {
        var currentModule = $location.path().replace('/', '');
        this.isUserModule = jQuery.inArray(currentModule, ['user', 'usergroup', 'useronline']) != -1;
        this.isManageModule = jQuery.inArray(currentModule, ['categories']) != -1;
    }]
});
aptAdminModule.component('aptSidebar', {
    templateUrl: 'inc/sidebar.html'
});
aptAdminModule.component('aptFooter', {
    templateUrl: 'inc/footer.html'
});