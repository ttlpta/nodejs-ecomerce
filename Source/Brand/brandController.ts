var validator = require('validator'),
    helper = require('../helper'),
    brand = require('./brandModel');
module.exports = function (app) {
    app.get('/brand', helper.handleRequest(brand.listBrand));
    app.get('/brand/:id', helper.handleRequest(brand.getBrandById));
    app.post('/brand', helper.handleRequest(brand.saveBrand));
    app.delete('/brand/:id', helper.handleRequest(brand.deleteBrand));
};