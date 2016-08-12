var aptUserGroupModule = angular.module('aptUserGroupModule', ['aptUserGroupHelper']);
aptUserModule.component('usergroup', {
    templateUrl: 'usergroup/usergroup.html',
    controllerAs: 'userGroupCrl',
    controller: ['userGroupService', 'permissionService', 'validateAddGroupErrorCode', '$http',
        function userGroupController(userGroupService, permissionService, errorMsg, $http) {
            var self = this;
            this.groups = userGroupService.query();
            this.permissions = permissionService.query();
            this.formTitle = 'Add User Group';
            this.group = new userGroupService();
            this.showGroup = function (groupId) {
                self.validateGroupnameNotification = '';
                self.formTitle = 'Edit User Group ' + groupId;
                self.group = userGroupService.get({action: 'showUserGroup', id: groupId}, function (result) {
                    if (typeof result.success != 'undefined' && result.success == false) {
                        alert(errorMsg[result.errorCode]);
                        location.reload();
                    }
                });
            };
            this.validateField = function (field) {
                var param = {};
                switch (field) {
                    case 'groupname':
                        if (param.groupName = self.group.group_name) {
                            if (self.group.id) {
                                param.groupId = self.group.id;
                            }
                            $http.get("/admin/validateGroupUser", {params: param}).then(function (response) {
                                self.validateGroupnameNotification = (response.data.isExisted) ?
                                    errorMsg[response.data.errorCode] : '';
                            });
                        } else {
                            self.validateGroupnameNotification = 'Group name is required';
                        }
                        break;
                }
            };
            this.checkedPermission = function (permissionCode, permissionCodeOfGroup) {
                return (typeof permissionCodeOfGroup != 'undefined' && permissionCodeOfGroup.indexOf(permissionCode) != -1)
            };
            var _isValidatedGroup = function () {
                return !self.validateGroupnameNotification;
            };
        }]
});