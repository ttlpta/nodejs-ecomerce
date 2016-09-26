var connection = require('../../connection'), util = require('util'), Promise = require('bluebird'), EventEmitter = require('events').EventEmitter, helper = require('../helper');
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
            if (err)
                throw err;
            resolve();
        });
    });
    insertRightPromise.then(function () {
        return new Promise(function (resolve) {
            connection.query(updateRightSql, function (err) {
                if (err)
                    throw err;
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
                if (err)
                    throw err;
                self.emit('insert_node', res.insertId);
            });
        });
    });
};
nestSetModel.prototype.getNodeInfo = function (id) {
    var query = helper.buildQuery.select('*').from('apt_categories').where({
        id: id
    }).render();
    var self = this;
    connection.query(query, function (err, row) {
        if (err)
            throw err;
        self.emit('get_node_info', row);
    });
};
nestSetModel.prototype.updateNode = function (data, moveNodeInfo) {
    var self = this;
    connection.query('UPDATE `apt_categories` SET ? WHERE `id` = ?', [data, data.id], function (err, row) {
        if (err)
            throw err;
        if (+data.parent_id != +moveNodeInfo.parent_id) {
            self.once('move_node', function (success) {
                self.emit('update_node', success);
            });
            self.moveNode(moveNodeInfo, data.parent_id);
        }
        else {
            self.emit('update_node', (row.affectedRows) ? true : false);
        }
    });
};
nestSetModel.prototype.moveNode = function (moveNodeInfo, newParentId) {
    var self = this;
    var moveNodePromise = new Promise(function (resolve, reject) {
        var here = this;
        if (helper.isEmptyObject(moveNodeInfo))
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
            self.once('get_node_info', function (result) {
                if (helper.isEmptyObject(result)) {
                    reject();
                }
                else {
                    var parentNodeInfo = helper.getFirstItemArray(result);
                    here.rightParentNode = parentNodeInfo.right;
                    here.levelParentNode = parentNodeInfo.level;
                    here.idParentNode = parentNodeInfo.id;
                    resolve();
                }
            });
            self.getNodeInfo(newParentId);
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
        self.once('get_node_info', function (result) {
            if (helper.isEmptyObject(result)) {
                reject();
            }
            else {
                resolve(helper.getFirstItemArray(result));
            }
        });
        self.getNodeInfo(id);
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
        self.once('get_node_info', function (result) {
            if (helper.isEmptyObject(result)) {
                reject();
            }
            else {
                resolve(helper.getFirstItemArray(result));
            }
        });
        self.getNodeInfo(deletedId);
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
            self.once('get_node_info', function (result) {
                if (helper.isEmptyObject(result)) {
                    reject();
                }
                else {
                    resolve(helper.getFirstItemArray(result));
                }
            });
            self.getNodeInfo(brotherId);
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
            self.once('get_node_info', function (result) {
                if (helper.isEmptyObject(result)) {
                    reject();
                }
                else {
                    resolve(helper.getFirstItemArray(result));
                }
            });
            self.getNodeInfo(newParentId);
        });
    })
        .then(function () {
        return new Promise(function (resolve, reject) {
            var here = this;
            self.once('get_node_info', function (result) {
                if (helper.isEmptyObject(result)) {
                    reject();
                }
                else {
                    var parentNodeInfo = helper.getFirstItemArray(result);
                    here.rightParentNode = parentNodeInfo.right;
                    here.levelParentNode = parentNodeInfo.level;
                    here.idParentNode = parentNodeInfo.id;
                    resolve();
                }
            });
            self.getNodeInfo(newParentId);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVzdGVkU2V0TW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9Tb3VyY2UvQ2F0ZWdvcmllcy9uZXN0ZWRTZXRNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFDeEMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFDdEIsT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFDN0IsWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLEVBQzdDLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDbEMsSUFBSSxZQUFZLEdBQUc7QUFDbkIsQ0FBQyxDQUFDO0FBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDMUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBVSxJQUFJLEVBQUUsTUFBTTtJQUN0RCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNuQyxDQUFDLENBQUM7QUFDRixZQUFZLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLElBQUksRUFBRSxNQUFNO0lBQ3ZELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztJQUNoQixJQUFJLGFBQWEsR0FBRyxpRUFBaUUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ3JHLElBQUksY0FBYyxHQUFHLHFFQUFxRSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDMUcsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU87UUFDbEQsVUFBVSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsVUFBVSxHQUFHO1lBQ3pDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFDSixNQUFNLEdBQUcsQ0FBQztZQUNkLE9BQU8sRUFBRSxD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