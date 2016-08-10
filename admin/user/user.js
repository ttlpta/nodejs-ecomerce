var aptUserModule = angular.module('aptUserModule', []);
aptUserModule.component('user', {
    templateUrl: 'user/user.html',
    controllerAs: 'userCtrl',
    controller: ['$http', 'userService', 'validateAddUserErrorCode',
        function userController($http, userService, errorMsg) {
            var self = this;
            this.user = new userService();
            this.currentPage = 1;
            this.limitItemPerPage = 3;
            this.users = userService.query({offset: this.currentPage - 1, limit: this.limitItemPerPage}, function () {
                $http.get("/admin/user", {params: {action: 'getTotalUser'}}).then(function (response) {
                    self.totalUser = response.data.total;
                    self.totalPage = Math.ceil(response.data.total / self.limitItemPerPage);
                });
            });
            this.formTitle = 'Add user';
            this.saveUser = function () {
                if (!self.isValidatedUser())
                    return false;
                self.user.registered = new Date();
                self.user.$save(function (data) {
                    if (+data.userId > 0) {
                        alert('Insert user success');
                        self.users = userService.query({offset: self.currentPage - 1, limit: self.limitItemPerPage}, function () {
                            $http.get("/admin/user", {params: {action: 'getTotalUser'}}).then(function (response) {
                                self.totalUser = response.data.total;
                                self.totalPage = Math.ceil(response.data.total / self.limitItemPerPage);
                            });
                        });
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
                self.validatePermissionNotification = '';
                self.formTitle = 'Edit user ' + userId;
                self.user = userService.get({action: 'showUser', id: userId}, function (result) {
                    if (typeof result.success != 'undefined' && result.success == false) {
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
                            self.users = userService.query({offset: self.currentPage - 1, limit: self.limitItemPerPage}, function () {
                                $http.get("/admin/user", {params: {action: 'getTotalUser'}}).then(function (response) {
                                    self.totalUser = response.data.total;
                                    self.totalPage = Math.ceil(response.data.total / self.limitItemPerPage);
                                });
                            });
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
                            $http.get("/admin/validateUser", {params: param}).then(function (response) {
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
                            $http.get("/admin/validateUser", {params: param}).then(function (response) {
                                self.validateEmailNotification = (response.data.isExisted) ?
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
                    case 'permission':
                        self.validatePermissionNotification = (!self.user.permission.length) ? 'Group is required' : '';
                        break;
                }
            };

            this.isValidatedUser = function () {
                return (!self.validateUsernameNotification
                && !self.validateEmailNotification
                && !self.validateConfirmPassNotification
                && !self.validatePasswordNotification
                && !self.validatePermissionNotification);
            };

            this.changeAddUserForm = function () {
                self.formTitle = 'Add user';
                self.user = new userService();
            };

            this.previousPage = function () {
                self.currentPage = self.currentPage - 1;
                var offset = (self.currentPage - 1) * self.limitItemPerPage;
                self.users = userService.query({offset: offset, limit: self.limitItemPerPage});
            };

            this.nextPage = function () {
                self.currentPage = self.currentPage + 1;
                var offset = (self.currentPage - 1) * self.limitItemPerPage;
                self.users = userService.query({offset: offset, limit: self.limitItemPerPage});
            };

            this.gotoPage = function () {
                if(!isNaN(self.currentPage)){
                    var offset = (self.currentPage - 1) * self.limitItemPerPage;
                    self.users = userService.query({offset: offset, limit: self.limitItemPerPage});
                }
            }
        }]
});
