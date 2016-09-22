var aptProductModule = angular.module('aptProductModule', ['aptProductHelper', 'aptBrandHelper', 'aptCategoriesHelper']);
aptProductModule.component('product', {
    templateUrl: 'manage/product.html',
    controllerAs: 'productCtrl',
    controller: ['$scope', 'brandService', 'catService', 'productService', '$location',
        function ($scope, Brand, Category, Product, $location) {
            var self = this;
            this.products = Product.query();
            this.product = new Product();
            this.saveProduct = function () {
                var allImageProduct = [];
                var imgName = function (imgSrc) {
                    var imgSrcArr = imgSrc.split('/');
                    return imgSrcArr[imgSrcArr.length - 1];
                };
                $('.imageDisplay img').each(function () {
                    allImageProduct.push(imgName($(this).attr('src')));
                });
                self.product.images_path = JSON.stringify(allImageProduct);
                if (!self.product.id) {
                    self.product.date_added = Number(new Date());
                }
                self.product.date_modified = Number(new Date());
                self.product.$save(function (data) {
                    if (data.success) {
                        self.products = Product.query();
                    }
                    _changeAddProductForm();
                });
            };
            this.editProduct = function (productId) {
                self.formTitle = 'Edit Product ' + productId;
                Product.get({
                    action: 'getProduct',
                    id: productId
                }, function (result) {
                    if (result.success == false) {
                        location.reload();
                    } else if (result.id) {
                        result.brand_id = result.brand_id.toString();
                        result.category_id = result.category_id.toString();
                        var _buildImageSource = function (imagePathArr) {
                            var fullImagePathArr = [];
                            imagePathArr.forEach(function (imagePath) {
                                fullImagePathArr.push($location.protocol() + '://' + $location.host() + '/uploads/product-image/' + imagePath);
                            });
                            return fullImagePathArr;
                        };
                        self.imageNames = _buildImageSource(JSON.parse(result.images_path));
                        var _convertProductStatus = function (product) {
                            var statusString = ['availabe', 'stop', 'out-of-stock']
                            return (statusString.indexOf(product.status) + 1).toString();
                        };
                        result.status = _convertProductStatus(result);
                        self.product = result;
                    }
                });
            };
            this.deleteProduct = function (productId) {
                var delConfirm = confirm('Are you sure?');
                if (delConfirm) {
                    Product.delete({
                        id: productId
                    }, function (result) {
                        if (result.success) {
                            _changeAddProductForm();
                        }
                    });
                }
            };
            this.imageNames = [''];
            this.addImageInput = function () {
                self.imageNames.push('');
            };
            this.delImageInput = function (index) {
                self.imageNames.splice(self.imageNames.indexOf(index), 1);
            };
            this.brands = Brand.query();
            this.categories = Category.query();
            this.changeToAddProduct = function(){
                _changeAddProductForm();
            };
            _changeAddProductForm = function () {
                self.imageNames = [''];
                $('.img-product').val('');
                // $('.imageDisplay img').attr('ng-src', '');
                // $('.imageDisplay img').attr('src', '');
                self.products = Product.query();
                self.product = new Product();
            };
        }]
});