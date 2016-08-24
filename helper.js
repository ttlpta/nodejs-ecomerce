function Helper() {
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
    }
};
module.exports = new Helper();
