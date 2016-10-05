var connection = require('../../connection'),
    util = require('util'),
    Promise = require('bluebird'),
    EventEmitter = require('events').EventEmitter,
    _ = require('lodash');
helper = require('../helper');
var nestSetModel = function () {
};
util.inherits(nestSetModel, EventEmitter);
nestSetModel.prototype.insertNode = function (data, parent) {
    return this.insertRight(data, parent);
};
nestSetModel.prototype.insertRight = function (data, parent) {
    var self = this;
    var updateLeftSql = 'UPDATE `apt_categories` SET `left` = `left` + 2 WHERE `left` > ' + parent.right;
    var updateRightSql = 'UPDATE `apt_categories` SET `right` = `right` + 2 WHERE `right` >= ' + parent.right;
    return new Promise(function (resolveAll, rejectAll) {
        var insertRightPromise = new Promise(function (resolve, reject) {
            connection.query(updateLeftSql, function (err) {
                if (err) reject(err);
                resolve();
            });
        });
        insertRightPromise.then(function () {
            return new Promise(function (resolve, reject) {
                connection.query(updateRightSql, function (err) {
                    if (err) reject(err);
                    resolve();
                });
            });
        }).then(function () {
            return new Promise(function (resolve, reject) {
                data = Object.assign({
                    left: parent.right,
                    right: parent.right + 1,
                    level: parent.level + 1
                }, data);
                connection.query('INSERT INTO `apt_categories` SET ?', data, function (err, res) {
                    if (err) reject(err);
                    resolveAll((res.insertId) ? true : false);
                });
            });
        }).catch(function (err) {
            rejectAll(err);
        });
    });
};

nestSetModel.prototype.getNodeInfo = function (id) {
    var query = helper.buildQuery.select('*').from('apt_categories').where({
        id: id
    }).render();
    return new Promise(function (resolve, reject) {
        connection.query(query, function (err, row) {
            if (err) reject(err)
            resolve(row);
        });
    });
};
nestSetModel.prototype.updateNode = function (data, moveNodeInfo) {
    var self = this;
    return new Promise(function (resolve, reject) {
        connection.query('UPDATE `apt_categories` SET ? WHERE `id` = ?', [data, data.id], function (err, row) {
            if (err) reject();
            if (+data.parent_id != +moveNodeInfo.parent_id) {
                self.once('move_node', function (success) {
                    resolve(success);
                });
                self.moveNode(moveNodeInfo, data.parent_id);
            } else {
                resolve((row.affectedRows) ? true : false);
            }
        });
    });
};

nestSetModel.prototype.moveNode = function (moveNodeInfo, newParentId) {
    var self = this;
    var moveNodePromise = new Promise(function (resolve, reject) {
        var here = this;
        if (_.isEmpty(moveNodeInfo))
            reject();
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
                if (err)
                    throw err;
                resolve();
            });
        });
    }).then(function () {
        var slqUpdateRight = 'UPDATE `apt_categories`' +
            'SET `right` = (`right` -  ' + this.widthMoveNode + ') ' +
            'WHERE `right` > ' + this.rightMoveNode;
        return new Promise(function (resolve) {
            connection.query(slqUpdateRight, function (err) {
                if (err)
                    throw err;
                resolve();
            });
        });
    }).then(function () {
        var slqUpdateLeft = 'UPDATE `apt_categories`' +
            'SET `left` = (`left` -  ' + this.widthMoveNode + ') ' +
            'WHERE `left` > ' + this.rightMoveNode;
        return new Promise(function (resolve) {
            connection.query(slqUpdateLeft, function (err) {
                if (err)
                    throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function (resolve, reject) {
            var here = this;
            self.getNodeInfo(newParentId).then(function (result) {
                if (!_.isEmpty(result)) {
                    var parentNodeInfo = helper.getFirstItemArray(result);
                    here.rightParentNode = parentNodeInfo.right;
                    here.levelParentNode = parentNodeInfo.level;
                    here.idParentNode = parentNodeInfo.id;
                    resolve();
                } else {
                    reject();
                }
            }).catch(function () {
                reject();
            });
        })
    }).then(function () {
        return new Promise(function (resolve) {
            var slqUpdateLeft = 'UPDATE `apt_categories`' +
                'SET `left` = (`left` +  ' + this.widthMoveNode + ') ' +
                'WHERE `left` >= ' + this.rightParentNode + ' AND `right` > 0';
            connection.query(slqUpdateLeft, function (err) {
                if (err)
                    throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function (resolve) {
            var slqUpdateRight = 'UPDATE `apt_categories`' +
                'SET `right` = (`right` +  ' + this.widthMoveNode + ') ' +
                'WHERE `right` >= ' + this.rightParentNode;
            connection.query(slqUpdateRight, function (err) {
                if (err)
                    throw err;
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
                if (err)
                    throw err;
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
                if (err)
                    throw err;
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
                if (err)
                    throw err;
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
        self.getNodeInfo(id).then(function (result) {
            if (_.isEmpty(result)) {
                reject();
            } else {
                resolve(helper.getFirstItemArray(result));
            }
        }).catch(function () {
            reject();
        });
    });
    removeOnePromise.then(function (deleteNode) {
        return new Promise(function (resolve) {
            this.deleteNode = deleteNode;
            connection.query(helper.buildQuery
                .select('*')
                .from('apt_categories')
                .where({
                    parent_id: deleteNode.id
                })
                .orderBy('left', 'asc')
                .render(),
                function (err, res) {
                    if (err) throw err;
                    resolve(res.reverse());
                });
        });
    }).then(function (childNodesInfo) {
        if (childNodesInfo.length > 0) {
            for (var i = 0; i < childNodesInfo.length; i++) {
                self.once('move_node_after', function (success) {
                    if (success) {
                        if (i == childNodesInfo.length) {
                            self.removeBrand(id);
                        }
                    }
                });
                self.moveNodeAfter(childNodesInfo[i], this.deleteNode.parent_id, this.deleteNode.id);
            }
        } else {
            self.removeBrand(id);
        }
    });
};
nestSetModel.prototype.removeBrand = function (deletedId) {
    var self = this;
    var removeBrandPromise = new Promise(function (resolve, reject) {
        self.getNodeInfo(deletedId).then(function (result) {
            if (_.isEmpty(result)) {
                reject();
            } else {
                resolve(helper.getFirstItemArray(result));
            }
        }).catch(function () {
            reject();
        });
    });
    removeBrandPromise.then(function (delNode) {
        return new Promise(function (resolve) {
            this.rightDelNode = delNode.right;
            this.leftDelNode = delNode.left;
            this.widthDelNode = self.widthNode(+this.leftDelNode, +this.rightDelNode);
            connection.query('DELETE FROM `apt_categories`' +
                ' WHERE `left` BETWEEN ? AND ?',
                [+this.leftDelNode, +this.rightDelNode],
                function (err) {
                    if (err)
                        throw err;
                    resolve();
                });
        });
    }).then(function () {
        return new Promise(function (resolve) {
            connection.query('UPDATE `apt_categories`' +
                ' SET `left` = (`left` - ?)' +
                ' WHERE `left` > ?',
                [+this.widthDelNode, +this.rightDelNode],
                function (err) {
                    if (err)
                        throw err;
                    resolve();
                });
        });
    }).then(function () {
        return new Promise(function () {
            connection.query('UPDATE `apt_categories`' +
                ' SET `right` = (`right` - ?)' +
                ' WHERE `right` > ?',
                [+this.widthDelNode, +this.rightDelNode],
                function (err) {
                    if (err)
                        throw err;
                    self.emit('remove_one', true);
                });
        });
    });
};
nestSetModel.prototype.moveNodeAfter = function (moveNodeInfo, newParentId, brotherId) {
    var self = this;
    var moveNodePromise = new Promise(function (resolve) {
        this.lftMoveNode = moveNodeInfo.left;
        this.rgtMoveNode = moveNodeInfo.right;
        this.levelMoveNode = moveNodeInfo.level;
        this.widthMoveNode = self.widthNode(this.lftMoveNode, this.rgtMoveNode);
        var sqlReset = 'UPDATE `apt_categories`' +
            ' SET `right` = (`right` -  ' + this.rgtMoveNode + '), `left` = (`left` -  ' + this.lftMoveNode + ')' +
            ' WHERE `left` BETWEEN ' + this.lftMoveNode + ' AND ' + this.rgtMoveNode;
        connection.query(sqlReset, function (err) {
            if (err) throw err;
            resolve();
        });
    });
    moveNodePromise
        .then(function () {
            return new Promise(function (resolve) {
                var sqlUpdateRight = 'UPDATE `apt_categories`' +
                    ' SET `right` = (`right` -  ' + this.widthMoveNode + ')' +
                    ' WHERE `right` > ' + this.rgtMoveNode;
                connection.query(sqlUpdateRight, function (err) {
                    if (err)
                        throw err;
                    resolve();
                });
            });
        })
        .then(function () {
            return new Promise(function (resolve) {
                var sqlUpdateLeft = 'UPDATE `apt_categories`' +
                    ' SET `left` = (`left` -  ' + this.widthMoveNode + ')' +
                    ' WHERE `left` > ' + this.rgtMoveNode;
                connection.query(sqlUpdateLeft, function (err) {
                    if (err) throw err;
                    resolve();
                });
            });
        })
        .then(function () {
            return new Promise(function (resolve, reject) {
                self.getNodeInfo(brotherId).then(function (result) {
                    if (_.isEmpty(result)) {
                        reject();
                    } else {
                        resolve(helper.getFirstItemArray(result));
                    }
                }).catch(function () {
                    reject();
                });
            });
        })
        .then(function (infoBrotherNode) {
            var rgtBrotherNode = infoBrotherNode.right;
            var sqlUpdateLeft = 'UPDATE `apt_categories`' +
                ' SET `left` = (`left` +  ' + this.widthMoveNode + ')' +
                ' WHERE `left` > ' + rgtBrotherNode + ' AND `right` > 0';
            return new Promise(function (resolve) {
                this.rgtBrotherNode = rgtBrotherNode;
                connection.query(sqlUpdateLeft, function (err) {
                    if (err) throw err;
                    resolve();
                });
            });
        })
        .then(function () {
            var sqlUpdateRight = 'UPDATE `apt_categories`' +
                ' SET `right` = (`right` +  ' + this.widthMoveNode + ')' +
                ' WHERE `right` > ' + this.rgtBrotherNode;
            return new Promise(function (resolve) {
                connection.query(sqlUpdateRight, function (err) {
                    if (err) throw err;
                    resolve();
                });
            });
        })
        .then(function () {
            return new Promise(function (resolve, reject) {
                self.getNodeInfo(newParentId).then(function (result) {
                    if (_.isEmpty(result)) {
                        reject();
                    } else {
                        resolve(helper.getFirstItemArray(result));
                    }
                }).catch(function () {
                    reject();
                });
            });
        })
        .then(function () {
            return new Promise(function (resolve, reject) {
                var here = this;
                self.getNodeInfo(newParentId).then(function (result) {
                    if (_.isEmpty(result)) {
                        reject();
                    } else {
                        var parentNodeInfo = helper.getFirstItemArray(result);
                        here.rightParentNode = parentNodeInfo.right;
                        here.levelParentNode = parentNodeInfo.level;
                        here.idParentNode = parentNodeInfo.id;
                        resolve();
                    }
                }).catch(function () {
                    reject();
                });
            })
        })
        .then(function () {
            return new Promise(function (resolve) {
                var sqlUpdateLeft = 'UPDATE `apt_categories`' +
                    ' SET `left` = (`left` +  ' + this.widthMoveNode + ') ' +
                    ' WHERE `left` >= ' + this.rightParentNode + ' AND `right` > 0';
                connection.query(sqlUpdateLeft, function (err) {
                    if (err) throw err;
                    resolve();
                });
            });
        })
        .then(function () {
            return new Promise(function (resolve) {
                var sqlUpdateRight = 'UPDATE `apt_categories`' +
                    ' SET `right` = (`right` +  ' + this.widthMoveNode + ') ' +
                    ' WHERE `right` >= ' + this.rightParentNode;
                connection.query(sqlUpdateRight, function (err) {
                    if (err)
                        throw err;
                    resolve();
                });
            });
        })
        .then(function () {
            return new Promise(function (resolve) {
                var newLevelMoveNode = this.levelParentNode + 1;
                var sqlUpdateLevel = 'UPDATE `apt_categories`' +
                    ' SET `level` = (`level`  -  ' + this.levelMoveNode + ' + ' + newLevelMoveNode + ') ' +
                    ' WHERE `right` <= 0';
                connection.query(sqlUpdateLevel, function (err) {
                    if (err)
                        throw err;
                    resolve();
                });
            });
        })
        .then(function () {
            return new Promise(function (resolve) {
                var newParent = this.idParentNode;
                var newLeft = this.rgtBrotherNode + 1;
                var newRight = this.rgtBrotherNode + 1 + this.widthMoveNode;
                var sqlUpdateParent = 'UPDATE `apt_categories`' +
                    ' SET `parent_id` = ' + newParent + ', `left` = ' + newLeft + ', `right` = ' + newRight +
                    ' WHERE id = ' + moveNodeInfo.id;
                connection.query(sqlUpdateParent, function (err) {
                    if (err)
                        throw err;
                    resolve();
                });
            });
        })
        .then(function () {
            return new Promise(function () {
                var newLeft = this.rightParentNode;
                var newRight = this.rightParentNode + this.widthMoveNode - 1;
                var sqlUpdateNode = 'UPDATE `apt_categories`' +
                    ' SET `right` = (`right` +  ' + newRight + '),`left` = (`left` +  ' + newLeft + ') ' +
                    ' WHERE `right` < 0';
                connection.query(sqlUpdateNode, function (err) {
                    if (err)
                        throw err;
                    self.emit('move_node_after', true);
                });
            });
        })
        .catch(function () {
            self.emit('move_node_after', false);
        });
};
nestSetModel.prototype.widthNode = function (left, right) {
    return right - left + 1;
};
module.exports = new nestSetModel();
