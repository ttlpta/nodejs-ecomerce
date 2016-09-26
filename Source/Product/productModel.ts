var connection = require('../../connection'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    helper = require('../helper');
var Product = function () {
};
interface ProductModel {
    id: number;
    name: string;
    category_id: number;
    image_path: string;
    price: string;
    model: string;
    quantity: string;
    promotion_id: string;
    brand_id: string;
    status: string;
    date_added: string;
    date_modified: string;
};
util.inherits(Product, EventEmitter);
Product.prototype.listProduct = function (): void {
    var sql = "SELECT `apt_product`.*, `apt_brand`.`name` as 'brand_name', `apt_categories`.`name` as 'category_name'" +
        " FROM `apt_product`, `apt_brand`, `apt_categories`" +
        " WHERE `apt_product`.brand_id = `apt_brand`.id AND `apt_product`.category_id = `apt_categories`.id";
    connection.query(sql, (err, rows) => {
        if (err) throw err;
        this.emit('list_product', rows);
    });
};
Product.prototype.saveProduct = function (product: ProductModel): void {
    if (!helper.isUndefined(product.id)) {
        connection.query('UPDATE `apt_product` SET ? WHERE `id` = ?', [product, product.id], (err, res) => {
            if (err) throw err;
            this.emit('save_product', (res.changedRows) ? true : false);
        });
    } else {
        connection.query('INSERT INTO `apt_product` SET ?', product, (err, res) => {
            if (err) throw err;
            this.emit('save_product', (res.insertId) ? true : false);
        });
    }
};
Product.prototype.getProductById = function (productId: number): void {
    var sql = helper.buildQuery
        .select('*')
        .from('apt_product')
        .where({ id: productId })
        .render();
    connection.query(sql, (err, rows) => {
        if (err) throw err;
        this.emit('get_product_by_id', helper.getFirstItemArray(rows));
    });
};
Product.prototype.deleteProduct = function (productId: number): void {
    connection.query('DELETE FROM `apt_product` WHERE `id` = ?', [productId], (err, res) => {
        if (err) throw err;
        this.emit('delete_product', (res.affectedRows) ? true : false);
    });
};
module.exports = new Product();