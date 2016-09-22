var helper = require('../helper'),
    product = require('./productModel');
module.exports = function (app) {
    app.get('/product', function (req, res) {
        if (!helper.isUndefined(req.query.action)) {
            switch (req.query.action) {
                case 'listProduct':
                    product.once('list_product', function (products) {
                        for (var product of products) {
                            product.date_added = new Date(+product.date_added);
                        }
                        res.json(products);
                    });
                    product.listProduct();
                    break;
                case 'getProduct':
                    if (!helper.isUndefined(req.query.id)) {
                        product.once('get_product_by_id', function (product) {
                            res.json(product);
                        });
                        product.getProductById(req.query.id);
                    } else {
                        res.json({ success: false });
                    }
                    break;
            }
        }
    });
    app.post('/product', function (req, res) {
        if (!helper.isUndefined(req.body) && !helper.isEmptyObject(req.body)) {
            product.once('save_product', function (result) {
                res.json({ success: result });
            });
            product.saveProduct(req.body);
        }
    });
    app.delete('/product', function (req, res) {
        if (!helper.isUndefined(req.query.id) && req.query.id) {
            product.once('delete_product', function (result) {
                res.json({ success: result });
            });
            product.deleteProduct(req.query.id);
        } else {
            res.json({ success: false });
        }
    });
};