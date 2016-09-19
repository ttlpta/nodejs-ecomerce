var connection = require('./connection');
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
    isEmptyObject: function (obj) {
        return typeof obj != 'object' || (Object.keys(obj).length === 0 && obj.constructor === Object);
    },
    isUndefined: function (arg) {
        return typeof arg == 'undefined';
    }
};
module.exports = new Helper();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN6QztJQUNJLElBQUksQ0FBQyxVQUFVLEdBQUc7UUFDZCxLQUFLLEVBQUUsRUFBRTtRQUNULE1BQU0sRUFBRSxDQUFDLE1BQVU7WUFDZixJQUFJLEdBQUcsR0FBRyxTQUFTLENBQUM7WUFDcEIsRUFBRSxDQUFDLENBQUMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxLQUFLO29CQUMxQixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUNyQyxHQUFHLElBQUksR0FBRyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUM7b0JBQzlCLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ0osR0FBRyxJQUFJLEdBQUcsR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDO29CQUMvQixDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEdBQUcsSUFBSSxHQUFHLENBQUM7WUFDZixDQUFDO1lBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO1lBRTVCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzNCLENBQUM7UUFDRCxJQUFJLEVBQUUsQ0FBQyxHQUFVO1lBQ2IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLElBQUksU0FBUyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDM0IsQ0FBQztRQUNELEtBQUssRUFBRSxDQUFDLFVBQWM7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