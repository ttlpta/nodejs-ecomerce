var aptUserGroupModule = angular.module('aptUserGroupModule', ['aptUserGroupHelper']);
aptUserModule.component('usergroup', {
    templateUrl: 'usergroup/usergroup.html',
    controllerAs: 'userGroupCrl',
    controller: ['userGroupService', 'permissionService', 'validateAddGroupErrorCode', '$http',
        function userGroupController(userGroupService, permissionService, errorMsg, $http) {
            var self = this;
            this.groups = userGroupService.query();
            this.groupPermissionCodes = {};
            this.permissions = permissionService.query(function(result){
                result.forEach(function (value) {
                    self.groupPermissionCodes[value.id] = 2;
                })
            });
            this.formTitle = 'Add User Group';
            this.group = new userGroupService();
            this.showGroup = function (groupId) {
                self.validateGroupnameNotification = '';
                self.formTitle = 'Edit User Group ' + groupId;
                self.group = userGroupService.get({action: 'showUserGroup', id: groupId}, function (result) {
                    if (result.success == false) {
                        alert(errorMsg[result.errorCode]);
                        location.reload();
                    } else {
                        result.permissionId.forEach(function(permissionId){
                            self.groupPermissionCodes[permissionId] = 1;
                        });
                    }
                });
            };

            this.saveGroup = function () {
                if(!_isValidatedGroup())
                    return;
                var allowPermissionId = [];
                angular.forEach(self.groupPermissionCodes, function (value, key) {
                    if (+value == 1) {
                        allowPermissionId.push(key);
                    }
                });
                var group = new userGroupService();
                group.id = self.group.id;
                group.groupName = self.group.group_name;
                group.permission = allowPermissionId;
                group.$save(function (data) {
                    console.log(data);
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
            this.checkAllPermission = function (action) {
            };
            this.changeAddGroupForm = function (){
                self.formTitle = 'Add group';
                self.group = new userGroupService();
            };

            var _isValidatedGroup = function () {
                return !self.validateGroupnameNotification;
            };
        }]
});