var helper = require('../helper'),
    product = require('./productModel');
module.exports = function (app) {
    app.get('/product', helper.handleRequest(product.listProduct));
    app.get('/product/:id', helper.handleRequest(product.getProductById));
    app.post('/product', helper.handleRequest(product.saveProduct));
    app.delete('/product/:id', helper.handleRequest(product.deleteProduct));
};