var connection = require('../connection'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    helper = require('../helper');
var Brand = function () {
};
util.inherits(Brand, EventEmitter);
Brand.prototype.listBrand = function () {
    var self = this;
    var sql = helper.buildQuery
        .select('*')
        .from('apt_brand')
        .render();
    connection.query(sql, function (err, rows) {
        if (err) throw err;
        self.emit('list_brand', rows);
    });
};
module.exports = new Brand();