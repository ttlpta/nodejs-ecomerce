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
        if (+data.parent_id != +moveNodeInfo.parent_id) {
            self.once('move_node', function (success) {
                self.emit('update_node', success);
            });
            self.moveNode(moveNodeInfo, data.parent_id);
        } else {
            self.emit('update_node', (row.affectedRows) ? true : false);
        }
    });
};

nestSetModel.prototype.moveNode = function (moveNodeInfo, newParentId) {
    var self = this;
    var moveNodePromise = new Promise(function (resolve, reject) {
        var here = this;
        if (helper.isEmptyObject(moveNodeInfo)) reject();
        here.levelMoveNode = moveNodeInfo.level;
        here.leftMoveNode = moveNodeInfo.left;
        here.rightMoveNode = moveNodeInfo.right;
        here.widthMoveNode = self.widthNode(here.leftMoveNode, here.rightMoveNode);
        resolve();
    });

    moveNodePromise.then(function () {
        var sqlReset = 'UPDATE `apt_categories`' +
            'SET `right` = (`right` -  ' + this.rightMoveNode + '), `left` = (`left` -  ' + this.leftMoveNode + ') ' +
            'WHERE `left` BETWEEN ' + this.leftMoveNode + ' AND ' + this.rightMoveNode;
        return new Promise(function (resolve) {
            connection.query(sqlReset, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        var slqUpdateRight = 'UPDATE `apt_categories`' +
            'SET `right` = (`right` -  ' + this.widthMoveNode + ') ' +
            'WHERE `right` > ' + this.rightMoveNode;
        return new Promise(function (resolve) {
            connection.query(slqUpdateRight, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        var slqUpdateLeft = 'UPDATE `apt_categories`' +
            'SET `left` = (`left` -  ' + this.widthMoveNode + ') ' +
            'WHERE `left` > ' + this.rightMoveNode;
        return new Promise(function (resolve) {
            connection.query(slqUpdateLeft, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function (resolve, reject) {
            var here = this;
            self.once('get_node_info', function (result) {
                if (helper.isEmptyObject(result)) {
                    reject();
                } else {
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
                'SET `left` = (`left` +  ' + this.widthMoveNode + ') ' +
                'WHERE `left` >= ' + this.rightParentNode + ' AND `right` > 0';
            connection.query(slqUpdateLeft, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function (resolve) {
            var slqUpdateRight = 'UPDATE `apt_categories`' +
                'SET `right` = (`right` +  ' + this.widthMoveNode + ') ' +
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
                'SET level = (level  -  ' + this.levelMoveNode + ' + ' + newLevelMoveNode + ') ' +
                'WHERE `right` <= 0';
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
                ' WHERE id = ' + moveNodeInfo.id;
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
                'SET `right` = (`right` +  ' + newRight + '),`left` = (`left` +  ' + newLeft + ') ' +
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
nestSetModel.prototype.removeOne = function (id) {
    var self = this;
    var removeOnePromise = new Promise(function (resolve, reject) {
        self.once('get_node_info', function (result) {
            if (helper.isEmptyObject(result)) {
                reject();
            } else {
                resolve(helper.getFirstItemArray(result));
            }
        });
        self.getNodeInfo(id);
    });
    removeOnePromise.then(function (deleteNode) {
        return new Promise(function (resolve) {
            connection.query(helper.buildQuery
                    .select(['id'])
                    .from('apt_categories')
                    .where({parent_id: deleteNode.id})
                    .orderBy('left', 'asc')
                    .render(),
                function (err, res) {
                    if (err) throw err;
                    resolve(res.reverse());
                });
        });
    }).then(function (childNodesInfo) {
        if (childNodesInfo.length > 0) {
            childNodesInfo.forEach(function (nodeInfo) {
                var parentId = deleteNode.parent_id;
                self.once('move_node_after', function (success) {
                    if (success) {
                        count++;
                    }
                    if (count == childNodesInfo.length) {
                        self.emit('remove_one');
                    }
                });
                self.moveNodeAfter(nodeInfo, parentId, deleteNode.id);
            });
        } else {
            self.removeBrand(id);
        }
    });
};
nestSetModel.prototype.removeBrand = function (deletedId) {
    var self = this;
    var removeBrandPromise = new Promise(function (resolve, reject) {
        self.once('get_node_info', function (result) {
            if (helper.isEmptyObject(result)) {
                reject();
            } else {
                resolve(helper.getFirstItemArray(result));
            }
        });
        self.getNodeInfo(deletedId);
    });
    removeBrandPromise.then(function (delNode) {
        return new Promise(function (resolve) {
            this.rightDelNode = delNode.right;
            this.leftDelNode = delNode.left;
            this.widthDelNode = self.widthNode(+this.rightDelNode, +this.leftDelNode);
            connection.query('DELETE FROM `apt_categories`' +
                ' WHERE `left` BETWEEN ? AND ?',
                [+this.rightDelNode, +this.leftDelNode],
                function (err) {
                    if (err) throw err;
                    resolve();
                }
            );
        });
    }).then(function () {
        return new Promise(function (resolve) {
            connection.query('UPDATE `apt_categories`' +
                ' SET left = (left - ?)' +
                ' WHERE left > ?',
                [+this.widthDelNode, +this.rightDelNode],
                function (err) {
                    if (err) throw err;
                    resolve();
                }
            );
        });
    }).then(function () {
        return new Promise(function (resolve) {
            connection.query('UPDATE `apt_categories`' +
                ' SET right = (right - ?)' +
                ' WHERE right > ?',
                [+this.widthDelNode, +this.rightDelNode],
                function (err) {
                    if (err) throw err;
                    resolve();
                }
            );
        });
    });
};
nestSetModel.prototype.moveNodeAfter = function (moveNodeInfo, newParentId, brotherId) {
    var lftMoveNode = moveNodeInfo.left;
    var rgtMoveNode = moveNodeInfo.right;
    var widthMoveNode = this.widthNode(lftMoveNode, rgtMoveNode);
    var self = this;
    var moveNodePromise = new Promise(function (resolve) {
        var sqlReset = 'UPDATE `apt_categories`' +
            'SET `right` = (`right` -  ' + rgtMoveNode + '), lft = (lft -  ' + lftMoveNode + ')' +
            ' WHERE `left` BETWEEN ' + lftMoveNode + ' AND ' + rgtMoveNode;
        connection.query(sqlReset, function (err) {
            if (err) throw err;
            resolve();
        });
    });
    moveNodePromise.then(function () {
        return new Promise(function (resolve) {
            var slqUpdateRight = 'UPDATE `apt_categories`' +
                ' SET `right` = (`right` -  ' + widthMoveNode + ')' +
                ' WHERE `right` > ' + rgtMoveNode;
            connection.query(slqUpdateRight, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function (resolve) {
            var slqUpdateLeft = 'UPDATE `apt_categories`' +
                ' SET `left` = (`left` -  ' + widthMoveNode + ')' +
                ' WHERE `left` > ' + rgtMoveNode;
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
                    resolve(helper.getFirstItemArray(result));
                }
            });
            self.getNodeInfo(brotherId);
        });
    }).then(function (infoBrotherNode) {
        var rgtBrotherNode = infoBrotherNode.right;
        var slqUpdateLeft = 'UPDATE `apt_categories`' +
            'SET `left` = (`left` +  ' + widthMoveNode + ')' +
            ' WHERE `left` > ' + rgtBrotherNode + ' AND `right` > 0';
        return new Promise(function (resolve) {
            this.rgtBrotherNode = rgtBrotherNode;
            connection.query(slqUpdateLeft, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        var slqUpdateRight = 'UPDATE `apt_categories`' +
            ' SET `right` = (`right` +  ' + widthMoveNode + ')' +
            ' WHERE `right` > ' + this.rgtBrotherNode;
        return new Promise(function (resolve) {
            connection.query(slqUpdateRight, function (err) {
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
                    resolve(helper.getFirstItemArray(result));
                }
            });
            self.getNodeInfo(newParentId);
        });
    }).then(function () {
        return new Promise(function (resolve, reject) {
            var here = this;
            self.once('get_node_info', function (result) {
                if (helper.isEmptyObject(result)) {
                    reject();
                } else {
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
                'SET `left` = (`left` +  ' + this.widthMoveNode + ') ' +
                'WHERE `left` >= ' + this.rightParentNode + ' AND `right` > 0';
            connection.query(slqUpdateLeft, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function (resolve) {
            var slqUpdateRight = 'UPDATE `apt_categories`' +
                'SET `right` = (`right` +  ' + this.widthMoveNode + ') ' +
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
                'SET level = (level  -  ' + this.levelMoveNode + ' + ' + newLevelMoveNode + ') ' +
                'WHERE `right` <= 0';
            connection.query(slqUpdateLevel, function (err) {
                if (err) throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function (resolve) {
            var newParent = this.idParentNode;
            var newLeft = this.rgtBrotherNode + 1;
            var newRight = this.rgtBrotherNode + 1 + widthMoveNode;
            var slqUpdateParent = 'UPDATE `apt_categories`' +
                'SET parent_id = ' + newParent + ', `left` = ' + newLeft + ', `right` = ' + newRight +
                ' WHERE id = ' + moveNodeInfo.id;
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
                'SET `right` = (`right` +  ' + newRight + '),`left` = (`left` +  ' + newLeft + ') ' +
                'WHERE `right` < 0';
            connection.query(slqUpdateNode, function (err) {
                if (err) throw err;
                self.emit('move_node_after', true);
            });
        });
    }).catch(function () {
        self.emit('move_node_after', false);
    });
};
nestSetModel.prototype.widthNode = function (left, right) {
    return right - left + 1;
};
module.exports = new nestSetModel();