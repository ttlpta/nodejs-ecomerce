var connection = require('../../connection'), util = require('util'), Promise = require('bluebird'), EventEmitter = require('events').EventEmitter, _ = require('lodash');
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
                if (err)
                    reject(err);
                resolve();
            });
        });
        insertRightPromise.then(function () {
            return new Promise(function (resolve, reject) {
                connection.query(updateRightSql, function (err) {
                    if (err)
                        reject(err);
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
                    if (err)
                        reject(err);
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
            if (err)
                reject(err);
            resolve(row);
        });
    });
};
nestSetModel.prototype.updateNode = function (data, moveNodeInfo) {
    var self = this;
    return new Promise(function (resolve, reject) {
        connection.query('UPDATE `apt_categories` SET ? WHERE `id` = ?', [data, data.id], function (err, row) {
            if (err)
                reject();
            if (+data.parent_id != +moveNodeInfo.parent_id) {
                self.once('move_node', function (success) {
                    resolve(success);
                });
                self.moveNode(moveNodeInfo, data.parent_id);
            }
            else {
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
                }
                else {
                    reject();
                }
            }).catch(function () {
                reject();
            });
        });
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
            }
            else {
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
                .render(), function (err, res) {
                if (err)
                    throw err;
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
        }
        else {
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
            }
            else {
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
                ' WHERE `left` BETWEEN ? AND ?', [+this.leftDelNode, +this.rightDelNode], function (err) {
                if (err)
                    throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function (resolve) {
            connection.query('UPDATE `apt_categories`' +
                ' SET `left` = (`left` - ?)' +
                ' WHERE `left` > ?', [+this.widthDelNode, +this.rightDelNode], function (err) {
                if (err)
                    throw err;
                resolve();
            });
        });
    }).then(function () {
        return new Promise(function () {
            connection.query('UPDATE `apt_categories`' +
                ' SET `right` = (`right` - ?)' +
                ' WHERE `right` > ?', [+this.widthDelNode, +this.rightDelNode], function (err) {
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
            if (err)
                throw err;
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
                if (err)
                    throw err;
                resolve();
            });
        });
    })
        .then(function () {
        return new Promise(function (resolve, reject) {
            self.getNodeInfo(brotherId).then(function (result) {
                if (_.isEmpty(result)) {
                    reject();
                }
                else {
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
                if (err)
                    throw err;
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
                if (err)
                    throw err;
                resolve();
            });
        });
    })
        .then(function () {
        return new Promise(function (resolve, reject) {
            self.getNodeInfo(newParentId).then(function (result) {
                if (_.isEmpty(result)) {
                    reject();
                }
                else {
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
                }
                else {
                    var parentNodeInfo = helper.getFirstItemArray(result);
                    here.rightParentNode = parentNodeInfo.right;
                    here.levelParentNode = parentNodeInfo.level;
                    here.idParentNode = parentNodeInfo.id;
                    resolve();
                }
            }).catch(function () {
                reject();
            });
        });
    })
        .then(function () {
        return new Promise(function (resolve) {
            var sqlUpdateLeft = 'UPDATE `apt_categories`' +
                ' SET `left` = (`left` +  ' + this.widthMoveNode + ') ' +
                ' WHERE `left` >= ' + this.rightParentNode + ' AND `right` > 0';
            connection.query(sqlUpdateLeft, function (err) {
                if (err)
                    throw err;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVzdGVkU2V0TW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9Tb3VyY2UvQ2F0ZWdvcmllcy9uZXN0ZWRTZXRNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFDeEMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFDdEIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFDN0IsWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLEVBQzdDLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUIsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM5QixJQUFJLFlBQVksR0FBRztBQUNuQixDQUFDLENBQUM7QUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztBQUMxQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFVLElBQUksRUFBRSxNQUFNO0lBQ3RELE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMxQyxDQUFDLENBQUM7QUFDRixZQUFZLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLElBQUksRUFBRSxNQUFNO0lBQ3ZELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztJQUNoQixJQUFJLGFBQWEsR0FBRyxpRUFBaUUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ3JHLElBQUksY0FBYyxHQUFHLHFFQUFxRSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDMUcsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsVUFBVSxFQUFFLFNBQVM7UUFDOUMsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO1lB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