aptShopModule.component('aptHeader', {
    templateUrl: 'inc/header.html',
    controllerAs: 'headerCtr',
    controller: function headerController(){
        alert('adasds');
        //this.currentCat = $location.path().replace('/','');
        //this.$onInit = function() {
        //    console.log(this);
        //};
    }
}).component('aptFooter', {
    templateUrl: 'inc/footer.html'
}).directive('mainMenuArea', function() {
    return {
        templateUrl: 'inc/mainMenu.html',
        link: function(scope, element, attrs) {
            console.log($(element));
            $(element).sticky({topSpacing:0});
        }
    };
});
