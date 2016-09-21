var connection = require('../connection'), util = require('util'), EventEmitter = require('events').EventEmitter, helper = require('../helper');
var Product = function () {
};
;
util.inherits(Product, EventEmitter);
Product.prototype.listProduct = function () {
    var sql = "SELECT `apt_product`.*, `apt_brand`.`name` as 'brand_name', `apt_categories`.`name` as 'category_name'" +
        " FROM `apt_product`, `apt_brand`, `apt_categories`" +
        " WHERE `apt_product`.brand_id = `apt_brand`.id AND `apt_product`.category_id = `apt_categories`.id";
    connection.query(sql, (err, rows) => {
        if (err)
            throw err;
        this.emit('list_product', rows);
    });
};
Product.prototype.saveProduct = function (product) {
    connection.query('INSERT INTO `apt_product` SET ?', product, (err, res) => {
        if (err)
            throw err;
        this.emit('save_product', (res.insertId) ? true : false);
    });
};
Product.prototype.getProductById = function (productId) {
    var sql = helper.buildQuery
        .select('*')
        .from('apt_product')
        .where({ id: productId })
        .render();
    connection.query(sql, (err, rows) => {
        if (err)
            throw err;
        this.emit('get_product_by_id', helper.getFirstItemArray(rows));
    });
};
module.exports = new Product();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdE1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vU291cmNlL1Byb2R1Y3QvcHJvZHVjdE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFDckMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFDdEIsWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLEVBQzdDLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbEMsSUFBSSxPQUFPLEdBQUc7QUFDZCxDQUFDLENBQUM7QUFjRCxDQUFDO0FBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDckMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUc7SUFDNUIsSUFBSSxHQUFHLEdBQUcsd0dBQXdHO1FBQzlHLG9EQUFvRDtRQUNwRCxvR0FBb0csQ0FBQztJQUN6RyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJO1FBQzVCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUFDLE1BQU0sR0FBRyxDQUFDO1FBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBQ0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsVUFBVSxPQUFxQjtJQUMzRCxVQUFVLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO1FBQ2xFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUFDLE1BQU0sR0FBRyxDQUFDO1FBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQztJQUM3RCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUNGLE9BQU8sQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLFVBQVUsU0FBaUI7SUFDMUQsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVU7U0FDdEIsTUFBTSxDQUFDLEdBQUcsQ0FBQztTQUNYLElBQUksQ0FBQyxhQUFhLENBQUM7U0FDbkIsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDO1NBQ3hCLE1BQU0sRUFBRSxDQUFDO0lBQ2QsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSTtRQUM1QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFBQyxNQUFNLEdBQUcsQ0FBQztRQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25FLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBQ0YsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDIn0=