var connection = require('../../connection'), util = require('util'), EventEmitter = require('events').EventEmitter, helper = require('../helper');
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
    if (!helper.isUndefined(product.id)) {
        connection.query('UPDATE `apt_product` SET ? WHERE `id` = ?', [product, product.id], (err, res) => {
            if (err)
                throw err;
            this.emit('save_product', (res.changedRows) ? true : false);
        });
    }
    else {
        connection.query('INSERT INTO `apt_product` SET ?', product, (err, res) => {
            if (err)
                throw err;
            this.emit('save_product', (res.insertId) ? true : false);
        });
    }
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
Product.prototype.deleteProduct = function (productId) {
    connection.query('DELETE FROM `apt_product` WHERE `id` = ?', [productId], (err, res) => {
        if (err)
            throw err;
        this.emit('delete_product', (res.affectedRows) ? true : false);
    });
};
module.exports = new Product();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdE1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vU291cmNlL1Byb2R1Y3QvcHJvZHVjdE1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUN4QyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUN0QixZQUFZLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksRUFDN0MsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNsQyxJQUFJLE9BQU8sR0FBRztBQUNkLENBQUMsQ0FBQztBQWNELENBQUM7QUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNyQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRztJQUM1QixJQUFJLEdBQUcsR0FBRyx3R0FBd0c7UUFDOUcsb0RBQW9EO1FBQ3BELG9HQUFvRyxDQUFDO0lBQ3pHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUk7UUFDNUIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQUMsTUFBTSxHQUFHLENBQUM7UUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUM7QUFDRixPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLE9BQXFCO0lBQzNELEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLFVBQVUsQ0FBQyxLQUFLLENBQUMsMkNBQTJDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7WUFDMUYsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUFDLE1BQU0sR0FBRyxDQUFDO1lBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQztRQUNoRSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNKLFVBQVUsQ0FBQyxLQUFLLENBQUMsaUNBQWlDLEVBQUUsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7WUFDbEUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUFDLE1BQU0sR0FBRyxDQUFDO1lBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQztRQUM3RCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7QUFDTCxDQUFDLENBQUM7QUFDRixPQUFPLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxVQUFVLFNBQWlCO0lBQzFELElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVO1NBQ3RCLE1BQU0sQ0FBQyxHQUFHLENBQUM7U0FDWCxJQUFJLENBQUMsYUFBYSxDQUFDO1NBQ25CLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQztTQUN4QixNQUFNLEVBQUUsQ0FBQztJQUNkLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUk7UUFDNUIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQUMsTUFBTSxHQUFHLENBQUM7UUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUNGLE9BQU8sQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFVBQVUsU0FBaUI7SUFDekQsVUFBVSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7UUFDL0UsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQUMsTUFBTSxHQUFHLENBQUM7UUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDbkUsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUM7QUFDRixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUMifQ==