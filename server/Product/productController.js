var helper = require('../helper'), product = require('./productModel');
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
                    }
                    else {
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
        }
        else {
            res.json({ success: false });
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9Tb3VyY2UvUHJvZHVjdC9wcm9kdWN0Q29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQzdCLE9BQU8sR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUN4QyxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsR0FBRztJQUMxQixHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLEtBQUssYUFBYTtvQkFDZCxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxVQUFVLFFBQVE7d0JBQzNDLEdBQUcsQ0FBQyxDQUFDLElBQUksT0FBTyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7NEJBQzNCLE9BQU8sQ0FBQyxVQUFVLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQ3ZELENBQUM7d0JBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDdkIsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUN0QixLQUFLLENBQUM7Z0JBQ1YsS0FBSyxZQUFZO29CQUNiLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLE9BQU87NEJBQy9DLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ3RCLENBQUMsQ0FBQyxDQUFDO3dCQUNILE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDekMsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDSixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7b0JBQ2pDLENBQUM7b0JBQ0QsS0FBSyxDQUFDO1lBQ2QsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUNILEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDbkMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxVQUFVLE1BQU07Z0JBQ3pDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNsQyxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUNILEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDckMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BELE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxNQUFNO2dCQUMzQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyJ9