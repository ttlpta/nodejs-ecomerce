var connection = require('../connection'), _ = require('lodash');
function Helper() {
    this.buildQuery = {
        query: '',
        select: (params) => {
            var sql = 'SELECT ';
            if (params !== '*') {
                params.forEach(function (value) {
                    if (params[params.length - 1] == value) {
                        sql += '`' + value + '` ';
                    }
                    else {
                        sql += '`' + value + '`, ';
                    }
                });
            }
            else {
                sql += '*';
            }
            this.buildQuery.query = sql;
            return this.buildQuery;
        },
        from: (tbl) => {
            this.buildQuery.query += ' FROM `' + tbl + '`';
            return this.buildQuery;
        },
        where: (conditions) => {
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
    };
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
    handleRequest: function (handle) {
        return function (req, res) {
            var bodyObject = req.body || {};
            var params = _.extend({}, bodyObject, req.file, req.query, req.params);
            if ((req.method === 'DELETE' || req.method === 'POST') && (_.isUndefined(params) || _.isEmpty(params))) {
                res.status(204).end();
            }
            handle(params).then(function (result) {
                if (req.method === 'DELETE' || req.method === 'POST') {
                    res.status((result) ? 204 : 400).end();
                }
                else {
                    res.json(result);
                }
            })
                .catch(function () {
                res.status(400).end();
            });
        };
    }
};
module.exports = new Helper();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vU291cmNlL2hlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQ3JDLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUI7SUFDSSxJQUFJLENBQUMsVUFBVSxHQUFHO1FBQ2QsS0FBSyxFQUFFLEVBQUU7UUFDVCxNQUFNLEVBQUUsQ0FBQyxNQUFXO1lBQ2hCLElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQztZQUNwQixFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDakIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEtBQUs7b0JBQzFCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ3JDLEdBQUcsSUFBSSxHQUFHLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQztvQkFDOUIsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDSixHQUFHLElBQUksR0FBRyxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7b0JBQy9CLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osR0FBRyxJQUFJLEdBQUcsQ0FBQztZQUNmLENBQUM7WUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7WUFFNUIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDM0IsQ0FBQztRQUNELElBQUksRUFBRSxDQUFDLEdBQVc7WUFDZCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssSUFBSSxTQUFTLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUMvQyxNQUFNLENBQUMsSUFBSSxDQUFD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