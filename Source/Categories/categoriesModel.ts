var connection = require('../../connection'),
    util = require('util'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    helper = require('../helper'),
    nestSet = require('./nestedSetModel');
var Category = function () {
};
Category.prototype.saveCategory = function (params) {
    return new Promise(function (resolveAll, rejectAll) {
        var savePromise = new Promise(function (resolve, reject) {
            var nodeId = _.isUndefined(params.id) ? params.parent_id : params.id;
            nestSet.getNodeInfo(nodeId).then(function (result) {
                if (_.isEmpty(result)) {
                    reject();
                } else {
                    resolve(helper.getFirstItemArray(result));
                }
            }).catch(function (err) {
                reject();
            });
        });
        savePromise.then(function (nodeInfo) {
            if (_.isUndefined(params.id)) {
                nestSet.insertNode(params, nodeInfo).then(function (insertId) {
                    resolveAll((insertId) ? true : false);
                }).catch(function (err) {
                    rejectAll();
                });
            } else {
                nestSet.updateNode(params, nodeInfo).then(function (success) {
                    resolveAll(success);
                }).catch(function (err) {
                    rejectAll();
                });
            }
        }).catch(function () {
            rejectAll();
        });
    });
};
Category.prototype.listCat = function () {
    return new Promise(function (resolve, reject) {
        connection.query(helper.buildQuery.select('*')
            .from('apt_categories')
            .where('`level` > 0')
            .orderBy('left', 'asc')
            .render(),
            function (err, res) {
                if (err) reject();
                resolve(res);
            });
    });
};
Category.prototype.showCatById = function (params) {
    return new Promise(function (resolve, reject) {
        connection.query(helper.buildQuery.select('*')
            .from('apt_categories')
            .where(params)
            .render(),
            function (err, res) {
                if (err) reject(err);
                resolve(helper.getFirstItemArray(res));
            });
    });
};
Category.prototype.deleteCat = function (params) {
    return new Promise(function (resolve, reject) {
        nestSet.once('remove_one', function (success) {
            resolve(success);
        });
        nestSet.removeOne(params.id);
    });
};
module.exports = new Category();
