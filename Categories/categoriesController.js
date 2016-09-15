var categories = require('./categoriesModel'),
    helper = require('../helper');
module.exports = function (app) {
    app.post('/categories', function (req, res) {
        if (!helper.isUndefined(req.body) && !helper.isEmptyObject(req.body)) {
            if (req.body.parent_id && req.body.name) {
                categories.once('save_category', function (success) {
                    res.json({success: success});
                });
                categories.saveCategory(req.body, req.body.parent_id);
            }
        }
    });
    app.get('/categories', function (req, res) {
        if (!helper.isEmptyObject(req.query)) {
            switch (req.query.action) {
                case 'listCat' :
                    categories.once('list_category', function (result) {
                        res.json(result);
                    });
                    categories.listCat
                    categories.listCat();
                    break;
                case 'editCat':
                    categories.once('show_category', function (result) {
                        result.parent_id = result.parent_id.toString();
                        res.json(result);
                    });
                    categories.showCatById(req.query.id);
                    break;
            }
        }
    });
    app.delete('/categories', function (req, res) {
        if (!helper.isEmptyObject(req.query)) {
            categories.once('delete_category', function (result) {
                res.json({success: result});
            });
            categories.deleteCat(req.query.id);
        }
    });
};