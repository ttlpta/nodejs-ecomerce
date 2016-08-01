function Helper() {
}
Helper.prototype = {
    encodeBase64: function (str) {
        return new Buffer(str).toString('base64');
    },
    decodeBase64: function(hash){
        return new Buffer(hash, 'base64').toString('ascii');
    }
};
module.exports = new Helper();
