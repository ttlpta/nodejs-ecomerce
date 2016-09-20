var connection = require('../connection'), util = require('util'), Promise = require('bluebird'), EventEmitter = require('events').EventEmitter, helper = require('../helper');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVzdGVkU2V0TW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9Tb3VyY2UvQ2F0ZWdvcmllcy9uZXN0ZWRTZXRNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQ3JDLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQ3RCLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQzdCLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxFQUM3QyxNQUFNLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2xDLElBQUksWUFBWSxHQUFHO0FBQ25CLENBQUMsQ0FBQztBQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQzFDLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVUsSUFBSSxFQUFFLE1BQU07SUFDdEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbkMsQ0FBQyxDQUFDO0FBQ0YsWUFBWSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsVUFBVSxJQUFJLEVBQUUsTUFBTTtJQUN2RCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7SUFDaEIsSUFBSSxhQUFhLEdBQUcsaUVBQWlFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNyRyxJQUFJLGNBQWMsR0FBRyxxRUFBcUUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQzFHLElBQUksa0JBQWtCLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPO1FBQ2xELFVBQVUsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLFVBQVUsR0FBRztZQUN6QyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7Z0JBQ0osTUFBTSxHQUFHLENBQUM7WUFDZCxPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDSCxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7UUFDcEIsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTztZQUNoQyxVQUFVLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxVQUFVLEdBQUc7Z0JBQzFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFDSixNQUFNLEdBQUcsQ0FBQztnQkFDZCxPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDSixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUM7WUFDZixJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDakIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLO2dCQUNsQixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDO2dCQUN2QixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDO2FBQzFCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDVCxVQUFVLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxFQUFFLElBQUksRUFBRSxVQUFVLEdBQUcsRUFBRSxHQUFHO2dCQUMzRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQ0osTUFBTSxHQUFHLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUNGLFlBQVksQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVUsRUFBRTtJQUM3QyxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDbkUsRUFBRSxFQUFFLEVBQUU7S0FDVCxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDWixJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7SUFDaEIsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUN0QyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDSixNQUFNLEdBQUcsQ0FBQztRQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBQ0YsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsVUFBVSxJQUFJLEVBQUUsWUFBWTtJQUM1RCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7SUFDaEIsVUFBVSxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsVUFBVSxHQUFHLEVBQUUsR0FBRztRQUNoRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDSixNQUFNLEdBQUcsQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsT0FBTztnQkFDcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQ2hFLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFVBQVUsWUFBWSxFQUFFLFdBQVc7SUFDakUsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLElBQUksZUFBZSxHQUFHLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07UUFDdkQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbkMsTUFBTSxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7UUFDeEMsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUN4QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0UsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztJQUVILGVBQWUsQ0FBQyxJQUFJLENBQUM7UUFDakIsSUFBSSxRQUFRLEdBQUcseUJBQXlCO1lBQ3BDLDRCQUE0QixHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcseUJBQXlCLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJO1lBQ3hHLHVCQUF1QixHQUFHLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDL0UsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTztZQUNoQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxVQUFVLEdBQUc7Z0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFDSixNQUFNLEdBQUcsQ0FBQztnQkFDZCxPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDSixJQUFJLGNBQWMsR0FBRyx5QkFBeUI7WUFDMUMsNEJBQTRCLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJO1lBQ3hELGtCQUFrQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDNUMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTztZQUNoQyxVQUFVLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxVQUFVLEdBQUc7Z0JBQzFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFDSixNQUFNLEdBQUcsQ0FBQztnQkFDZCxPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDSixJQUFJLGFBQWEsR0FBRyx5QkFBeUI7WUFDekMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJO1lBQ3RELGlCQUFpQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDM0MsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTztZQUNoQyxVQUFVLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxVQUFVLEdBQUc7Z0JBQ3pDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFDSixNQUFNLEdBQUcsQ0FBQztnQkFDZCxPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDSixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtZQUN4QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7WUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsVUFBVSxNQUFNO2dCQUN2QyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDL0IsTUFBTSxFQUFFLENBQUM7Z0JBQ2IsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixJQUFJLGNBQWMsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3RELElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQztvQkFDNUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDO29CQUM1QyxJQUFJLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQyxFQUFFLENBQUM7b0JBQ3RDLE9BQU8sRUFBRSxDQUFDO2dCQUNkLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDSixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPO1lBQ2hDLElBQUksYUFBYSxHQUFHLHlCQUF5QjtnQkFDekMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJO2dCQUN0RCxrQkFBa0IsR0FBRyxJQUFJLENBQUMsZUFBZSxHQUFHLGtCQUFrQixDQUFDO1lBQ25FLFVBQVUsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLFVBQVUsR0FBRztnQkFDekMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUNKLE1BQU0sR0FBRyxDQUFDO2dCQUNkLE9BQU8sRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNKLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU87WUFDaEMsSUFBSSxjQUFjLEdBQUcseUJBQXlCO2dCQUMxQyw0QkFBNEIsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUk7Z0JBQ3hELG1CQUFtQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDL0MsVUFBVSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsVUFBVSxHQUFHO2dCQUMxQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQ0osTUFBTSxHQUFHLENBQUM7Z0JBQ2QsT0FBTyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ0osTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTztZQUNoQyxJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO1lBQ2hELElBQUksY0FBYyxHQUFHLHlCQUF5QjtnQkFDMUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLEdBQUcsZ0JBQWdCLEdBQUcsSUFBSTtnQkFDaEYsb0JBQW9CLENBQUM7WUFDekIsVUFBVSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsVUFBVSxHQUFHO2dCQUMxQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQ0osTUFBTSxHQUFHLENBQUM7Z0JBQ2QsT0FBTyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ0osTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTztZQUNoQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQ2xDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDbkMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztZQUM3RCxJQUFJLGVBQWUsR0FBRyx5QkFBeUI7Z0JBQzNDLGtCQUFrQixHQUFHLFNBQVMsR0FBRyxhQUFhLEdBQUcsT0FBTyxHQUFHLGNBQWMsR0FBRyxRQUFRO2dCQUNwRixjQUFjLEdBQUcsWUFBWSxDQUFDLEVBQUUsQ0FBQztZQUNyQyxVQUFVLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxVQUFVLEdBQUc7Z0JBQzNDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFDSixNQUFNLEdBQUcsQ0FBQztnQkFDZCxPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDSixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUM7WUFDZixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBQ25DLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7WUFDN0QsSUFBSSxhQUFhLEdBQUcseUJBQXlCO2dCQUN6Qyw0QkFBNEIsR0FBRyxRQUFRLEdBQUcsd0JBQXdCLEdBQUcsT0FBTyxHQUFHLElBQUk7Z0JBQ25GLG1CQUFtQixDQUFDO1lBQ3hCLFVBQVUsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLFVBQVUsR0FBRztnQkFDekMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUNKLE1BQU0sR0FBRyxDQUFDO2dCQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsQyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUNGLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVUsRUFBRTtJQUMzQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7SUFDaEIsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNO1FBQ3hELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLFVBQVUsTUFBTTtZQUN2QyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxFQUFFLENBQUM7WUFDYixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzlDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDekIsQ0FBQyxDQUFDLENBQUM7SUFDSCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxVQUFVO1FBQ3RDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU87WUFDaEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDN0IsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVTtpQkFDekIsTUFBTSxDQUFDLEdBQUcsQ0FBQztpQkFDWCxJQUFJLENBQUMsZ0JBQWdCLENBQUM7aUJBQ3RCLEtBQUssQ0FBQztnQkFDSCxTQUFTLEVBQUUsVUFBVSxDQUFDLEVBQUU7YUFDM0IsQ0FBQztpQkFDRCxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQztpQkFDdEIsTUFBTSxFQUFFLEVBQ2IsVUFBVSxHQUFHLEVBQUUsR0FBRztnQkFDZCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsY0FBYztRQUM1QixFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxPQUFPO29CQUMxQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO3dCQUNWLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs0QkFDN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDekIsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekYsQ0FBQztRQUNMLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBQ0YsWUFBWSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsVUFBVSxTQUFTO0lBQ3BELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztJQUNoQixJQUFJLGtCQUFrQixHQUFHLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07UUFDMUQsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsVUFBVSxNQUFNO1lBQ3ZDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixNQUFNLEVBQUUsQ0FBQztZQUNiLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDOUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoQyxDQUFDLENBQUMsQ0FBQztJQUNILGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLE9BQU87UUFDckMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTztZQUNoQyxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDbEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUUsVUFBVSxDQUFDLEtBQUssQ0FBQyw4QkFBOEI7Z0JBQzNDLCtCQUErQixFQUMvQixDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFDdkMsVUFBVSxHQUFHO2dCQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFDSixNQUFNLEdBQUcsQ0FBQztnQkFDZCxPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDSixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPO1lBQ2hDLFVBQVUsQ0FBQyxLQUFLLENBQUMseUJBQXlCO2dCQUN0Qyw0QkFBNEI7Z0JBQzVCLG1CQUFtQixFQUNuQixDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFDeEMsVUFBVSxHQUFHO2dCQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFDSixNQUFNLEdBQUcsQ0FBQztnQkFDZCxPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDSixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUM7WUFDZixVQUFVLENBQUMsS0FBSyxDQUFDLHlCQUF5QjtnQkFDdEMsOEJBQThCO2dCQUM5QixvQkFBb0IsRUFDcEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQ3hDLFVBQVUsR0FBRztnQkFDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQ0osTUFBTSxHQUFHLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBQ0YsWUFBWSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsVUFBVSxZQUFZLEVBQUUsV0FBVyxFQUFFLFNBQVM7SUFDakYsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLElBQUksZUFBZSxHQUFHLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTztRQUMvQyxJQUFJLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7UUFDckMsSUFBSSxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUN4QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDeEUsSUFBSSxRQUFRLEdBQUcseUJBQXlCO1lBQ3BDLDZCQUE2QixHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcseUJBQXlCLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHO1lBQ3JHLHdCQUF3QixHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDN0UsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsVUFBVSxHQUFHO1lBQ3BDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFBQyxNQUFNLEdBQUcsQ0FBQztZQUN2QixPQUFPLEVBQUUsQ0FBQztRQUNWLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDSCxlQUFlO1NBQ1YsSUFBSSxDQUFDO1FBQ0YsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTztZQUNoQyxJQUFJLGNBQWMsR0FBRyx5QkFBeUI7Z0JBQzFDLDZCQUE2QixHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRztnQkFDeEQsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUMzQyxVQUFVLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxVQUFVLEdBQUc7Z0JBQzFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFDSixNQUFNLEdBQUcsQ0FBQztnQkFDZCxPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUM7U0FDRCxJQUFJLENBQUM7UUFDRixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPO1lBQ2hDLElBQUksYUFBYSxHQUFHLHlCQUF5QjtnQkFDekMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHO2dCQUN0RCxrQkFBa0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQzFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLFVBQVUsR0FBRztnQkFDekMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUFDLE1BQU0sR0FBRyxDQUFDO2dCQUN2QixPQUFPLEVBQUUsQ0FBQztZQUNWLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUM7U0FDRCxJQUFJLENBQUM7UUFDRixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtZQUN4QyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxVQUFVLE1BQU07Z0JBQ3ZDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMvQixNQUFNLEVBQUUsQ0FBQztnQkFDYixDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDOUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztTQUNELElBQUksQ0FBQyxVQUFVLGVBQWU7UUFDM0IsSUFBSSxjQUFjLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQztRQUMzQyxJQUFJLGFBQWEsR0FBRyx5QkFBeUI7WUFDekMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHO1lBQ3RELGtCQUFrQixHQUFHLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQztRQUM3RCxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPO1lBQ2hDLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1lBQ2pDLFVBQVUsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLFVBQVUsR0FBRztnQkFDekMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUFDLE1BQU0sR0FBRyxDQUFDO2dCQUMzQixPQUFPLEVBQUUsQ0FBQztZQUNWLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUM7U0FDRCxJQUFJLENBQUM7UUFDRixJQUFJLGNBQWMsR0FBRyx5QkFBeUI7WUFDMUMsNkJBQTZCLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHO1lBQ3hELG1CQUFtQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDOUMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTztZQUNoQyxVQUFVLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxVQUFVLEdBQUc7Z0JBQzFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFBQyxNQUFNLEdBQUcsQ0FBQztnQkFDdkIsT0FBTyxFQUFFLENBQUM7WUFDVixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO1NBQ0QsSUFBSSxDQUFDO1FBQ0YsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU07WUFDeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsVUFBVSxNQUFNO2dCQUN2QyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDL0IsTUFBTSxFQUFFLENBQUM7Z0JBQ2IsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUM7U0FDRCxJQUFJLENBQUM7UUFDRixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTTtZQUN4QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7WUFDaEIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsVUFBVSxNQUFNO2dCQUN2QyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDL0IsTUFBTSxFQUFFLENBQUM7Z0JBQ2IsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixJQUFJLGNBQWMsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3RELElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQztvQkFDNUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDO29CQUM1QyxJQUFJLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQyxFQUFFLENBQUM7b0JBQ3RDLE9BQU8sRUFBRSxDQUFDO2dCQUNkLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDLENBQUM7U0FDRCxJQUFJLENBQUM7UUFDRixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPO1lBQ2hDLElBQUksYUFBYSxHQUFHLHlCQUF5QjtnQkFDekMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJO2dCQUN2RCxtQkFBbUIsR0FBRyxJQUFJLENBQUMsZUFBZSxHQUFHLGtCQUFrQixDQUFDO1lBQ3BFLFVBQVUsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLFVBQVUsR0FBRztnQkFDekMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUFDLE1BQU0sR0FBRyxDQUFDO2dCQUN2QixPQUFPLEVBQUUsQ0FBQztZQUNWLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUM7U0FDRCxJQUFJLENBQUM7UUFDRixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPO1lBQ2hDLElBQUksY0FBYyxHQUFHLHlCQUF5QjtnQkFDMUMsNkJBQTZCLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJO2dCQUN6RCxvQkFBb0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBQ2hELFVBQVUsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLFVBQVUsR0FBRztnQkFDMUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUNKLE1BQU0sR0FBRyxDQUFDO2dCQUNkLE9BQU8sRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztTQUNELElBQUksQ0FBQztRQUNGLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU87WUFDaEMsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztZQUNoRCxJQUFJLGNBQWMsR0FBRyx5QkFBeUI7Z0JBQzFDLDhCQUE4QixHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxHQUFHLGdCQUFnQixHQUFHLElBQUk7Z0JBQ3JGLHFCQUFxQixDQUFDO1lBQzFCLFVBQVUsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLFVBQVUsR0FBRztnQkFDMUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUNKLE1BQU0sR0FBRyxDQUFDO2dCQUNkLE9BQU8sRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztTQUNELElBQUksQ0FBQztRQUNGLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU87WUFDaEMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztZQUNsQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztZQUN0QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQzVELElBQUksZUFBZSxHQUFHLHlCQUF5QjtnQkFDM0MscUJBQXFCLEdBQUcsU0FBUyxHQUFHLGFBQWEsR0FBRyxPQUFPLEdBQUcsY0FBYyxHQUFHLFFBQVE7Z0JBQ3ZGLGNBQWMsR0FBRyxZQUFZLENBQUMsRUFBRSxDQUFDO1lBQ3JDLFVBQVUsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLFVBQVUsR0FBRztnQkFDM0MsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUNKLE1BQU0sR0FBRyxDQUFDO2dCQUNkLE9BQU8sRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztTQUNELElBQUksQ0FBQztRQUNGLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQztZQUNmLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDbkMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztZQUM3RCxJQUFJLGFBQWEsR0FBRyx5QkFBeUI7Z0JBQ3pDLDZCQUE2QixHQUFHLFFBQVEsR0FBRyx3QkFBd0IsR0FBRyxPQUFPLEdBQUcsSUFBSTtnQkFDcEYsb0JBQW9CLENBQUM7WUFDekIsVUFBVSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsVUFBVSxHQUFHO2dCQUN6QyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7b0JBQ0osTUFBTSxHQUFHLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN2QyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO1NBQ0QsS0FBSyxDQUFDO1FBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4QyxDQUFDLENBQUMsQ0FBQztBQUNYLENBQUMsQ0FBQztBQUNGLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFVBQVUsSUFBSSxFQUFFLEtBQUs7SUFDcEQsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLENBQUMsQ0FBQztBQUNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQyJ9