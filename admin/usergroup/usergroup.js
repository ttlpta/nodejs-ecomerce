var aptUserGroupModule = angular.module('aptUserGroupModule', ['aptUserGroupHelper']);
aptUserModule.component('usergroup', {
    templateUrl: 'usergroup/usergroup.html',
    controllerAs: 'userGroupCrl',
    controller: ['userGroupService', 'permissionService', 'validateAddGroupErrorCode', '$http',
        function userGroupController(userGroupService, permissionService, errorMsg, $http) {
            var self = this;
            var ALLOW_PERMISSION = 1;
            var DENY_PERMISSION = 2;
            this.formTitle = 'Add User Group';
            this.groupPermissionCodes = {};
            var _init = function(){
                self.group = new userGroupService();
                self.groups = userGroupService.query();
                self.permissions = permissionService.query(function (permissions) {
                    _setDefaultStatusPermission(permissions);
                });
            };
            _init();
            this.showGroup = function (groupId) {
                _removeValidateNotice();
                self.formTitle = 'Edit User Group ' + groupId;
                self.group = userGroupService.get({action: 'showUserGroup', id: groupId}, function (result) {
                    if (result.success == false) {
                        alert(errorMsg[result.errorCode]);
                        location.reload();
                    } else {
                        _setDefaultStatusPermission(self.permissions);
                        result.permissionId.status = ALLOW_PERMISSION;
                        angular.forEach(result.permissionId, _setStatusPermission);
                    }
                });
            };
            this.validateField = function (field) {
                switch (field) {
                    case 'groupname':
                        if (self.group.group_name) {
                            $http.get("/admin/validateGroupUser", {params: self.group}).then(function (response) {
                                self.validateGroupnameNotification = (response.data.isExisted) ?
                                    errorMsg[response.data.errorCode] : '';
                            });
                        } else {
                            self.validateGroupnameNotification = 'Group name is required';
                        }
                        break;
                }
            };
            this.changeAddGroupForm = function () {
                self.formTitle = 'Add group';
                _init();
            };
            this.saveGroup = function () {
                if (!_isValidatedGroup())
                    return;
                var allowPermissionId = [];
                var denyPermissionId = [];
                angular.forEach(self.groupPermissionCodes, function (value, key) {
                    if (+value == 1) {
                        allowPermissionId.push(key);
                    } else if (+value == 2) {
                        denyPermissionId.push(key);
                    }
                });
                var group = new userGroupService();
                group.id = self.group.id;
                group.groupName = self.group.group_name;
                group.allowPermission = allowPermissionId;
                group.denyPermission = denyPermissionId;
                group.$save().then(function (result) {
                    if (result.success) {
                        self.changeAddGroupForm();
                    }
                });
            };
            this.deleteGroup = function (groupId) {
				var confirm = window.confirm("Are you sure?");
                if (confirm) {
                    userGroupService.delete({id: groupId}, function (result) {
                        if(result.success){
							_init();
						} else {
							alert('Error');
							location.reload();
						}
                    });
                }
			};
			var _isValidatedGroup = function () {
                return !self.validateGroupnameNotification;
            };
            var _setDefaultStatusPermission = function (permissions) {
                permissions.status = DENY_PERMISSION;
                angular.forEach(permissions, _setStatusPermission);
            };
            var _setStatusPermission = function (permission, permissionKey, permissionObj) {
                var permissionId = (typeof permission == 'object') ? permission.id : permission;
                self.groupPermissionCodes[permissionId] = permissionObj.status;
            };
            var _removeValidateNotice = function () {
                self.validateGroupnameNotification = '';
            }
        }]
});
