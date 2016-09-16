var validator = require('validator'),
    helper = require('../helper'),
    brand = require('./brandModel');
module.exports = function (app) {
    app.get('/brand', function (req, res) {
        if (typeof req.query.action != 'undefined') {
            switch (req.query.action) {
                case 'listBrand':
                    brand.once('list_brand', function (brands) {
                        res.json(brands);
                    });
                    brand.listBrand();
                    break;
            }
        }
    });
    app.post('/brand', function (req, res) {
        if (!helper.isUndefined(req.body) && !helper.isEmptyObject(req.body)) {
            user.once('save_brand', function (userId) {
                res.json({
                    userId: userId
                });
            });
            brand.saveBrand(req.body);
        }
    });
};