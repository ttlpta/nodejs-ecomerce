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
                case 'getBrand':
                    if (!helper.isUndefined(req.query.id)) {
                        brand.once('get_brand_by_id', function (brand) {
                            res.json(brand);
                        });
                        brand.getBrandById(req.query.id);
                    } else {
                        res.json({ success: false });
                    }
                    break;
            }
        }
    });
    app.post('/brand', function (req, res) {
        if (!helper.isUndefined(req.body) && !helper.isEmptyObject(req.body)) {
            brand.once('save_brand', function (result) {
                res.json({ success: result });
            });
            brand.saveBrand(req.body);
        }
    });
    app.delete('/brand', function (req, res) {
        if (!helper.isUndefined(req.query.id) && req.query.id) {
            brand.once('delete_brand', function (result) {
                res.json({ success: result });
            });
            brand.deleteBrand(req.query.id);
        } else {
            res.json({ success: false });
        }
    });
};