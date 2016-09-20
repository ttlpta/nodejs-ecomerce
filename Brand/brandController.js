var validator = require('validator'), helper = require('../helper'), brand = require('./brandModel');
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
                    }
                    else {
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
        }
        else {
            res.json({ success: false });
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmRDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vU291cmNlL0JyYW5kL2JyYW5kQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQ2hDLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQzdCLEtBQUssR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDcEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLEdBQUc7SUFDMUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUNoQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDekMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixLQUFLLFdBQVc7b0JBQ1osS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFBVSxNQUFNO3dCQUNyQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNyQixDQUFDLENBQUMsQ0FBQztvQkFDSCxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ2xCLEtBQUssQ0FBQztnQkFDVixLQUFLLFVBQVU7b0JBQ1gsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNwQyxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsS0FBSzs0QkFDekMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDcEIsQ0FBQyxDQUFDLENBQUM7d0JBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNyQyxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNKLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztvQkFDakMsQ0FBQztvQkFDRCxLQUFLLENBQUM7WUFDZCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0gsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUNqQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25FLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFVBQVUsTUFBTTtnQkFDckMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0gsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUNuQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEQsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsVUFBVSxNQUFNO2dCQUN2QyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUM7WUFDSCxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyJ9