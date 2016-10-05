var connection = require('../../connection'), util = require('util'), Promise = require('bluebird'), _ = require('lodash'), helper = require('../helper'), nestSet = require('./nestedSetModel');
var Category = function () {
};
Category.prototype.saveCategory = function (params) {
    return new Promise(function (resolveAll, rejectAll) {
        var savePromise = new Promise(function (resolve, reject) {
            var nodeId = _.isUndefined(params.id) ? params.parent_id : params.id;
            nestSet.getNodeInfo(nodeId).then(function (result) {
                if (_.isEmpty(result)) {
                    reject();
                }
                else {
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
            }
            else {
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
            .render(), function (err, res) {
            if (err)
                reject();
            resolve(res);
        });
    });
};
Category.prototype.showCatById = function (params) {
    return new Promise(function (resolve, reject) {
        connection.query(helper.buildQuery.select('*')
            .from('apt_categories')
            .where(params)
            .render(), function (err, res) {
            if (err)
                reject(err);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2F0ZWdvcmllc01vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vU291cmNlL0NhdGVnb3JpZXMvY2F0ZWdvcmllc01vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUN4QyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUN0QixPQUFPLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUM3QixDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUNyQixNQUFNLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUM3QixPQUFPLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDMUMsSUFBSSxRQUFRLEdBQUc7QUFDZixDQUFDLENBQUM7QUFDRixRQUFRLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxVQUFVLE1BQU07SUFDOUMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsVUFBVSxFQUFFLFNBQVM7UUFDOUMsSUFBSSxXQUFXLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtZQUNuRCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDckUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxNQUFNO2dCQUM3QyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDcEIsTUFBTSxFQUFFLENBQUM7Z0JBQ2IsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7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