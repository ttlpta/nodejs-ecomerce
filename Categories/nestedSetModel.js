var connection = require('../connection'),
    util = require('util'),
    Promise = require('bluebird'),
    EventEmitter = require('events').EventEmitter,
    helper = require('../helper');
var nestSetModel = function () {
};
util.inherits(nestSetModel, EventEmitter);
nestSetModel.prototype.insertNode = function (data, parentId) {
    this.insertRight(data, parentId);
};
nestSetModel.prototype.insertRight = function (data, parent) {
    var self = this;
    var updateLeftSql = 'UPDATE `apt_categories` SET `left` = `left` + 2 WHERE `left` > ' + parent.right;
    var updateRightSql = 'UPDATE `apt_categories` SET `right` = `right` + 2 WHERE `right` >= ' + parent.right;
    var insertRightPromise = new Promise(function (resolve) {
        connection.query(updateLeftSql, function (err) {
            if (err) throw err;
            resolve();
        });
    });
    insertRightPromise.then(function () {
        return new Promise(function (resolve) {
            connection.query(updateRightSql, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function () {
            data = Object.assign({
                'left': parent.right,
                'right': parent.right + 1,
                'level': parent.level + 1
            }, data);
            connection.query('INSERT INTO `apt_categories` SET ?', data, function (err, res) {
                if (err) throw err;
                self.emit('insert_node', res.insertId);
            });
        });
    });
};
nestSetModel.prototype.getNodeInfo = function (id) {
    var query = helper.buildQuery.select('*').from('apt_categories').where({id: id}).render();
    var self = this;
    connection.query(query, function (err, row) {
        if (err) throw err;
        self.emit('get_node_info', row);
    });
};
module.exports = new nestSetModel();