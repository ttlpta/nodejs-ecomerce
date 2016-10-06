var connection = require('../../connection'),
    util = require('util'),
    _ = require('lodash'),
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
Product.prototype.listProduct = function () {
    var sql = "SELECT `apt_product`.*, `apt_brand`.`name` as 'brand_name', `apt_categories`.`name` as 'category_name'" +
        " FROM `apt_product`, `apt_brand`, `apt_categories`" +
        " WHERE `apt_product`.brand_id = `apt_brand`.id AND `apt_product`.category_id = `apt_categories`.id";
    return new Promise(function (resolve, reject) {
        connection.query(sql, (err, rows) => {
            if (err) reject(err);
            var products = [];
            for (var product of rows) {
                product.date_added = new Date(+product.date_added);
                products.push(product);
            }
            resolve(products);
        });
    });
};
Product.prototype.saveProduct = function (product: ProductModel) {
    return new Promise(function (resolve, reject) {
        if (!_.isUndefined(product.id)) {
            connection.query('UPDATE `apt_product` SET ? WHERE `id` = ?', [product, product.id], (err, res) => {
                if (err) reject(err);
                resolve((res.changedRows) ? true : false);
            });
        } else {
            connection.query('INSERT INTO `apt_product` SET ?', product, (err, res) => {
                if (err) reject(err);
                resolve((res.insertId) ? true : false);
            });
        }
    });
};
Product.prototype.getProductById = function (params: { id: number }) {
    var sql = helper.buildQuery
        .select('*')
        .from('apt_product')
        .where(params)
        .render();
    return new Promise(function (resolve, reject) {
        connection.query(sql, (err, rows) => {
            if (err) reject(err);
            resolve(helper.getFirstItemArray(rows));
        });
    });
};
Product.prototype.deleteProduct = function (params: { id: number }) {
    return new Promise(function (resolve, reject) {
        connection.query('DELETE FROM `apt_product` WHERE `id` = ?', [params.id], (err, res) => {
            if (err) reject(err);
            resolve((res.affectedRows) ? true : false);
        });
    });
};
module.exports = new Product();