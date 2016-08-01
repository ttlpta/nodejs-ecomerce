aptAdminModule.component('aptHeader', {
    templateUrl: 'inc/header.html',
    controllerAs: 'headerCtr',
    controller: ['$route', '$routeParams', '$location', function headerController($route, $routeParams, $location){
        var path = $location.path().replace('/','');
        this.currentCat = path;
    }]
});
aptAdminModule.component('aptSidebar', {
    templateUrl: 'inc/sidebar.html'
});
aptAdminModule.component('aptFooter', {
    templateUrl: 'inc/footer.html'
});