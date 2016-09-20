var categories = require('./categoriesModel'), helper = require('../helper');
module.exports = function (app) {
    app.post('/categories', function (req, res) {
        if (!helper.isUndefined(req.body) && !helper.isEmptyObject(req.body)) {
            if (req.body.parent_id && req.body.name) {
                categories.once('save_category', function (success) {
                    res.json({ success: success });
                });
                categories.saveCategory(req.body, req.body.parent_id);
            }
        }
    });
    app.get('/categories', function (req, res) {
        if (!helper.isEmptyObject(req.query)) {
            switch (req.query.action) {
                case 'listCat':
                    categories.once('list_category', function (result) {
                        res.json(result);
                    });
                    categories.listCat;
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
                res.json({ success: result });
            });
            categories.deleteCat(req.query.id);
        }
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2F0ZWdvcmllc0NvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9Tb3VyY2UvQ2F0ZWdvcmllcy9jYXRlZ29yaWVzQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsRUFDekMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsR0FBRztJQUMxQixHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO1FBQ3RDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxVQUFVLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxVQUFVLE9BQU87b0JBQzlDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsVUFBVSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDMUQsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUNILEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDckMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixLQUFLLFNBQVM7b0JBQ1YsVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsVUFBVSxNQUFNO3dCQUM3QyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNyQixDQUFDLENBQUMsQ0FBQztvQkFDSCxVQUFVLENBQUMsT0FBTyxDQUFBO29CQUNsQixVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3JCLEtBQUssQ0FBQztnQkFDVixLQUFLLFNBQVM7b0JBQ1YsVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsVUFBVSxNQUFNO3dCQUM3QyxNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQy9DLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3JCLENBQUMsQ0FBQyxDQUFDO29CQUNILFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDckMsS0FBSyxDQUFDO1lBQ2QsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUNILEdBQUcsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7UUFDeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsVUFBVSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLE1BQU07Z0JBQy9DLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztZQUNILFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMifQ==