var connection = require('./connection');
function Helper() {
    var self = this;
    this.buildQuery = {
        query: '',
        select: function (params) {
            var sql = 'SELECT ';
            if (params !== '*') {
                params.forEach(function (value) {
                    if (params[params.length - 1] == value) {
                        sql += '`' + value + '` ';
                    } else {
                        sql += '`' + value + '`, ';
                    }
                });
            } else {
                sql += '*';
            }

            self.buildQuery.query = sql;

            return self.buildQuery;
        },
        from: function (tbl) {
            self.buildQuery.query += ' FROM `' + tbl + '`';
            return self.buildQuery;
        },
        where: function (conditions) {
            if (typeof conditions == 'object') {
                conditions = self.buildQuery._perpareCondition(conditions);
            }
            self.buildQuery.query += (conditions) ? ' WHERE ' + conditions : '';
            return self.buildQuery;
        },
        orderBy: function (field, sort) {
            self.buildQuery.query += ' ORDER BY `' + field + '` ' + sort;
            return self.buildQuery;
        },
        limit: function (limit, offset) {
            self.buildQuery.query += connection.format(' LIMIT ? OFFSET ?', [limit, offset]);
            return self.buildQuery;
        },
        render: function () {
            return self.buildQuery.query;
        },
        _perpareCondition: function (conditions) {
            var condition = '';
            for (var index in conditions) {
                if (condition) {
                    condition += ' AND ';
                }
                condition += connection.format('`' + index + '` = ?', [conditions[index]]);
            }

            return condition;
        }
    }
}
Helper.prototype = {
    encodeBase64: function (str) {
        return new Buffer(str).toString('base64');
    },
    decodeBase64: function (hash) {
        return new Buffer(hash, 'base64').toString('ascii');
    },
    randomString: function (length) {
        if (typeof length == 'undefined') {
            length = 20;
        }
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },
    sendEmail: function (to, subject, content, callback) {
        var mailer = require("nodemailer");
        var smtpTransport = mailer.createTransport("SMTP", {
            service: "Gmail",
            auth: {
                user: 'tuananhdev200898@gmail.com',
                pass: 'ttlpta840465'
            }
        });
        var mailOptions = {
            to: to,
            subject: subject,
            text: content
        };
        smtpTransport.sendMail(mailOptions, callback);
    },
    getFirstItemArray: function (arr) {
        return arr[0];
    },
    isEmptyObject: function (obj) {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    },
    isUndefined: function (arg) {
        return typeof arg == 'undefined';
    }
};
module.exports = new Helper();
