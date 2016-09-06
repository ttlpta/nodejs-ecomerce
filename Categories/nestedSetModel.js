var connection = require('../connection'),
    util = require('util'),
    Promise = require('bluebird'),
    EventEmitter = require('events').EventEmitter,
    helper = require('../helper');
var nestSetModel = function () {
};
util.inherits(nestSetModel, EventEmitter);
nestSetModel.prototype.insertNode = function (data, parent) {
    this.insertRight(data, parent);
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
                left: parent.right,
                right: parent.right + 1,
                level: parent.level + 1
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
nestSetModel.prototype.updateNode = function (data, moveNodeInfo) {
    var self = this;
    connection.query('UPDATE `apt_categories` SET ? WHERE `id` = ?', [data, data.id], function (err, row) {
        if (err) throw err;
        console.log(+data.parent_id);
        console.log(+moveNodeInfo.parent_id);
        if (+data.parent_id != +parent.id) {
            //self.once('move_node', function (success) {
            //    self.emit('update_node', success);
            //});
            console.log('asdasdsad');
            //self.moveNode(data.id, parent.id);
        }
        self.emit('update_node', row.changedRows);
    });
};
nestSetModel.prototype.moveNode = function (nodeId, newParentId) {
    var self = this;
    var moveNodePromise = new Promise(function (resolve, reject) {
        var here = this;
        self.once('get_node_info', function (result) {
            if (helper.isEmptyObject(result)) {
                reject();
            } else {
                var moveNodeInfo = helper.getFirstItemArray(result);
                console.log(moveNodeInfo);
                here.levelMoveNode = moveNodeInfo.level;
                here.leftMoveNode = moveNodeInfo.left;
                here.rightMoveNode = moveNodeInfo.right;
                here.widthMoveNode = self.widthNode(here.leftMoveNode, here.rightMoveNode);
                //resolve();
            }
        });
        self.getNodeInfo(nodeId);
    });

    moveNodePromise.then(function () {
        var sqlReset = 'UPDATE `apt_categories`' +
            'SET `right` = (`right` -  ' + this.rightMoveNode + '), left = (left -  ' + this.leftMoveNode + ')' +
            'WHERE lft BETWEEN ' + this.leftMoveNode + ' AND ' + this.rightMoveNode;
        return new Promise(function (resolve) {
            connection.query(sqlReset, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        var slqUpdateRight = 'UPDATE `apt_categories`' +
            'SET `right` = (`right` -  ' + this.widthMoveNode + ')' +
            'WHERE `right` > ' + this.rightMoveNode;

        return new Promise(function (resolve) {
            connection.query(slqUpdateRight, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        var slqUpdateLeft = 'UPDATE `apt_categories`' +
            'SET `left` = (`left` -  ' + this.widthMoveNode + ')' +
            'WHERE `left` > ' + this.rightMoveNode;
        return new Promise(function (resolve) {
            connection.query(slqUpdateLeft, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function (resolve, reject) {
            self.once('get_node_info', function (result) {
                if (helper.isEmptyObject(result)) {
                    reject();
                } else {
                    var here = this;
                    var parentNodeInfo = helper.getFirstItemArray(result);
                    here.rightParentNode = parentNodeInfo.right;
                    here.levelParentNode = parentNodeInfo.level;
                    here.idParentNode = parentNodeInfo.id;
                    resolve();
                }
            });
            self.getNodeInfo(newParentId);
        })
    }).then(function () {
        return new Promise(function (resolve) {
            var slqUpdateLeft = 'UPDATE `apt_categories`' +
                'SET `left` = (`left` +  ' + this.widthMoveNode + ')' +
                'WHERE `left` >= ' + this.rightParentNode + 'AND `right` > 0';
            connection.query(slqUpdateLeft, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function (resolve) {
            var slqUpdateRight = 'UPDATE `apt_categories`' +
                'SET `right` = (`right` +  ' + this.widthMoveNode + ')' +
                'WHERE `right` >= ' + this.rightParentNode;
            connection.query(slqUpdateRight, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function (resolve) {
            var newLevelMoveNode = this.levelParentNode + 1;
            var slqUpdateLevel = 'UPDATE `apt_categories`' +
                'SET level = (level  -  ' + this.levelMoveNode + ' + ' + newLevelMoveNode + ')' +
                'WHERE rgt <= 0';
            connection.query(slqUpdateLevel, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function (resolve) {
            var newParent = this.idParentNode;
            var newLeft = this.rightParentNode;
            var newRight = this.rightParentNode + this.widthMoveNode - 1;
            var slqUpdateParent = 'UPDATE `apt_categories`' +
                'SET parent_id = ' + newParent + ', `left` = ' + newLeft + ', `right` = ' + newRight +
                'WHERE id = ' + nodeId;
            connection.query(slqUpdateParent, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function () {
            var newLeft = this.rightParentNode;
            var newRight = this.rightParentNode + this.widthMoveNode - 1;
            var slqUpdateNode = 'UPDATE `apt_categories`' +
                'SET `right` = (`right` +  ' + newRight + '),`left` = (`left` +  ' + newLeft + ')' +
                'WHERE `right` < 0';
            connection.query(slqUpdateNode, function (err) {
                if (err) throw err;
                self.emit('move_node', true);
            });
        });
    }).catch(function () {
        self.emit('move_node', false);
    });
};
nestSetModel.prototype.widthNode = function (left, right) {
    return right - left + 1;
};
module.exports = new nestSetModel();