var aptUserModule = angular.module('aptUserModule', ['aptUserHelper', 'aptUserGroupHelper']);
aptUserModule.component('user', {
    templateUrl: 'user/user.html',
    controllerAs: 'userCtrl',
    controller: ['$http', 'userService', 'validateAddUserErrorCode', 'userGroupService',
        function userController($http, userService, errorMsg, userGroupService) {
            var self = this;
            this.user = new userService();
            this.groups = userGroupService.query();
            this.currentPage = 1;
            this.limitItemPerPage = '10';
            this.orderBy = 'id';
            this.sort = 'asc';
            var _listUser = function () {
                return userService.query({
                    offset: (self.currentPage - 1) * self.limitItemPerPage,
                    limit: self.limitItemPerPage,
                    orderBy: self.orderBy,
                    sort: self.sort
                }, function () {
                    _preparePagination();
                });
            };
            this.users = _listUser();
            this.formTitle = 'Add user';
            this.saveUser = function () {
                if (!_isValidatedUser())
                    return false;
                self.user.registered = new Date();
                self.user.$save(function (data) {
                    if (+data.userId > 0) {
                        alert('Insert user success');
                        self.users = _listUser();
                    } else {
                        self.notification = errorMsg[data.errorCode];
                    }
                    self.changeAddUserForm();
                });
            };
            this.showUser = function (userId) {
                self.validateUsernameNotification = '';
                self.validateEmailNotification = '';
                self.validatePasswordNotification = '';
                self.validateConfirmPassNotification = '';
                self.validateGroupNotification = '';
                self.formTitle = 'Edit user ' + userId;
                self.user = userService.get({action: 'showUser', id: userId}, function (result) {
                    if (result.success == false) {
                        alert(errorMsg[result.errorCode]);
                        location.reload();
                    }
                });
            };
            this.deleteUser = function (userId) {
                var confirm = window.confirm("Are you sure?");
                if (confirm) {
                    userService.delete({id: userId}, function (result) {
                        if (result.success) {
                            self.users = _listUser();
                        } else {
                            alert(result.errorMsg);
                        }
                    });
                }
            };
            this.validateField = function (field) {
                var param = {};
                switch (field) {
                    case 'username':
                        if (param.username = self.user.username) {
                            if (self.user.id) {
                                param.userId = self.user.id;
                            }
                            $http.get("/validateUser", {params: param}).then(function (response) {
                                self.validateUsernameNotification = (response.data.isExisted) ?
                                    errorMsg[response.data.errorCode] : '';
                            });
                        } else {
                            self.validateUsernameNotification = 'Username is required';
                        }
                        break;
                    case 'email':
                        if (param.email = self.user.email) {
                            if (self.user.id) {
                                param.userId = self.user.id;
                            }
                            $http.get("/validateUser", {params: param}).then(function (response) {
                                self.validateEmailNotification = (response.data.isNotValid) ?
                                    errorMsg[response.data.errorCode] : '';
                            });
                        } else {
                            self.validateEmailNotification = 'Email is required';
                        }
                        break;
                    case 'password':
                        if (!self.user.id && !self.user.password) {
                            self.validatePasswordNotification = 'Password is required';
                        } else {
                            self.validatePasswordNotification = '';
                        }
                        break;
                    case 'confpass':
                        if (self.confpass) {
                            self.validateConfirmPassNotification = (self.user.password != self.confpass) ?
                                errorMsg['5'] : '';
                        } else if (!self.user.id && !self.confpass) {
                            self.validateConfirmPassNotification = 'Retype Password is required';
                        } else {
                            self.validateConfirmPassNotification = '';
                        }
                        break;
                    case 'group':
                        self.validateGroupNotification = (!self.user.group.length) ? 'Group is required' : '';
                        break;
                }
            };
            this.movePage = function (action) {
                switch (action) {
                    case 'previous':
                        self.currentPage = +self.currentPage - 1;
                        break;
                    case 'next':
                        self.currentPage = +self.currentPage + 1;
                        break;
                    case 'specific':
                        if (isNaN(self.currentPage)) {
                            return;
                        }
                        break;
                }
                var offset = (self.currentPage - 1) * self.limitItemPerPage;
                self.users = _listUser();
            };
            this.changeLimitItemPerPage = function () {
                self.users = _listUser();
            };
            this.sortItem = function (field) {
                self.orderBy = field;
                self.sort = (self.sort === 'asc') ? 'desc' : 'asc';
                self.users = _listUser()
            };
            this.changeAddUserForm = function () {
                self.formTitle = 'Add user';
                self.user = new userService();
            };
            var _preparePagination = function () {
                $http.get("/user", {params: {action: 'getTotalUser'}}).then(function (response) {
                    self.totalUser = response.data.total;
                    self.totalPage = Math.ceil(response.data.total / self.limitItemPerPage);
                });
            };
            var _isValidatedUser = function () {
                return (!self.validateUsernameNotification
                && !self.validateEmailNotification
                && !self.validateConfirmPassNotification
                && !self.validatePasswordNotification
                && !self.validateGroupNotification);
            };
        }]
});
