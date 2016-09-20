var connection = require('../connection'),
    util = require('util'),
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
Brand.prototype.listBrand = function (): void {
    var sql = helper.buildQuery
        .select('*')
        .from('apt_brand')
        .render();
    connection.query(sql, (err, rows) => {
        if (err) throw err;
        this.emit('list_brand', rows);
    });
};
Brand.prototype.getBrandById = function (brandId: number): void {
    var sql = helper.buildQuery
        .select('*')
        .from('apt_brand')
        .where({ id: brandId })
        .render();
    connection.query(sql, (err, rows) => {
        if (err) throw err;
        this.emit('get_brand_by_id', helper.getFirstItemArray(rows));
    });
};
Brand.prototype.saveBrand = function (brand: BrandModel): void {
    if (!helper.isUndefined(brand.id)) {
        connection.query('UPDATE `apt_brand` SET ? WHERE `id` = ?', [brand, brand.id], (err, res) => {
            if (err) throw err;
            this.emit('save_brand', (res.changedRows) ? true : false);
        });
    } else {
        connection.query('INSERT INTO `apt_brand` SET ?', brand, (err, res) => {
            if (err) throw err;
            this.emit('save_brand', (res.insertId) ? true : false);
        });
    }

};
Brand.prototype.deleteBrand = function (brandId: number): void {
    connection.query('DELETE FROM `apt_brand` WHERE `id` = ?', [brandId], (err, res) => {
        if (err) throw err;
        this.emit('delete_brand', (res.affectedRows) ? true : false);
    });
};
module.exports = new Brand();