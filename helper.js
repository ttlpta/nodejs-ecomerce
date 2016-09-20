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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU291cmNlL2hlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDekM7SUFDSSxJQUFJLENBQUMsVUFBVSxHQUFHO1FBQ2QsS0FBSyxFQUFFLEVBQUU7UUFDVCxNQUFNLEVBQUUsQ0FBQyxNQUFVO1lBQ2YsSUFBSSxHQUFHLEdBQUcsU0FBUyxDQUFDO1lBQ3BCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsS0FBSztvQkFDMUIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQzt3QkFDckMsR0FBRyxJQUFJLEdBQUcsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDO29CQUM5QixDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNKLEdBQUcsSUFBSSxHQUFHLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQztvQkFDL0IsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixHQUFHLElBQUksR0FBRyxDQUFDO1lBQ2YsQ0FBQztZQUVELElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztZQUU1QixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsSUFBSSxFQUFFLENBQUMsR0FBVTtZQUNiLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxJQUFJLFNBQVMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzNCLENBQUM7UUFDRCxLQUFLLEVBQUUsQ0FB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