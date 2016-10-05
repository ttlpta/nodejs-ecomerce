var connection = require('../connection'),
    _ = require('lodash');
function Helper() {
    this.buildQuery = {
        query: '',
        select: (params: any): any => {
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

            this.buildQuery.query = sql;

            return this.buildQuery;
        },
        from: (tbl: string) => {
            this.buildQuery.query += ' FROM `' + tbl + '`';
            return this.buildQuery;
        },
        where: (conditions: any) => {
            if (typeof conditions == 'object') {
                conditions = this.buildQuery._perpareCondition(conditions);
            }
            this.buildQuery.query += (conditions) ? ' WHERE ' + conditions : '';
            return this.buildQuery;
        },
        orderBy: (field, sort) => {
            this.buildQuery.query += ' ORDER BY `' + field + '` ' + sort;
            return this.buildQuery;
        },
        limit: (limit, offset) => {
            this.buildQuery.query += connection.format(' LIMIT ? OFFSET ?', [limit, offset]);
            return this.buildQuery;
        },
        render: () => {
            return this.buildQuery.query;
        },
        _perpareCondition: (conditions) => {
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
    encodeBase64: function (str: string): string {
        return new Buffer(str).toString('base64');
    },
    decodeBase64: function (hash: string): string {
        return new Buffer(hash, 'base64').toString('ascii');
    },
    randomString: function (length: number): string {
        if (typeof length == 'undefined') {
            length = 20;
        }
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },
    sendEmail: function (to: string, subject: string, content: string, callback: void) {
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
    getFirstItemArray: function (arr: any[]): any {
        return arr[0];
    },
    handleRequest: function (handle) {
        return function (req, res) {
            var bodyObject: Object = req.body || {};
            var params = _.extend({}, bodyObject, req.file, req.query, req.params);
            if ((req.method === 'DELETE' || req.method === 'POST') && (_.isUndefined(params) || _.isEmpty(params))) {
                res.status(204).end();
            }
            handle(params).then(function (result) {
                if (req.method === 'DELETE' || req.method === 'POST') {
                    res.status((result) ? 204 : 400).end();
                } else {
                    res.json(result);
                }
            })
            .catch(function () {
                res.status(400).end();
            });
        }
    }
};
module.exports = new Helper();