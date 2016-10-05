var categories = require('./categoriesModel'),
    _ = require('lodash'),
    helper = require('../helper');
module.exports = function (app) {
    app.post('/categories', helper.handleRequest(categories.saveCategory));
    app.get('/categories', helper.handleRequest(categories.listCat));
    app.get('/categories/:id', helper.handleRequest(categories.showCatById));
    app.delete('/categories/:id', helper.handleRequest(categories.deleteCat));
};