var aptUserGroupModule = angular.module('aptUserGroupModule', ['aptUserGroupHelper']);
aptUserModule.component('usergroup', {
    templateUrl: 'usergroup/usergroup.html',
    controllerAs: 'userGroupCrl',
    controller: ['userGroupService', 'permissionService', function userGroupController(userGroupService, permissionService) {
        this.groups = userGroupService.query();
        this.permissions = permissionService.query();
    }]
});