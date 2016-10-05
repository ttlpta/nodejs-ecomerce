var connection = require('../../connection'),
    util = require('util'),
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter,
    helper = require('../helper');
var Brand = function () {

};
interface BrandModel {
    id: number;
    name: string;
    logo_image: string;
};
util.inherits(Brand, EventEmitter);
Brand.prototype.listBrand = function () {
    var sql: string = helper.buildQuery
        .select('*')
        .from('apt_brand')
        .render();
    return new Promise(function (resolve, reject) {
        connection.query(sql, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
};
Brand.prototype.getBrandById = function (params) {
    var sql: string = helper.buildQuery
        .select('*')
        .from('apt_brand')
        .where({ id: params.id })
        .render();
    return new Promise(function (resolve, reject) {
        connection.query(sql, (err, rows) => {
            if (err) reject(err);
            resolve(helper.getFirstItemArray(rows));
        });
    });
};
Brand.prototype.saveBrand = function (brand: BrandModel) {
    return new Promise(function (resolve, reject) {
        if (!_.isUndefined(brand.id)) {
            connection.query('UPDATE `apt_brand` SET ? WHERE `id` = ?', [brand, brand.id], (err, res) => {
                if (err) reject(err);
                resolve((res.changedRows) ? true : false);
            });
        } else {
            connection.query('INSERT INTO `apt_brand` SET ?', brand, (err, res) => {
                if (err) reject(err);
                resolve((res.insertId) ? true : false);
            });
        }
    });
};
Brand.prototype.deleteBrand = function (params) {
    return new Promise(function (resolve, reject) {
        connection.query('DELETE FROM `apt_brand` WHERE `id` = ?', [params.id], (err, res) => {
            if (err) reject(err);
            resolve((res.affectedRows) ? true : false);
        });
    });
};
module.exports = new Brand();