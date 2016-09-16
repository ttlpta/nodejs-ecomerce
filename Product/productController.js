var fs = require('fs');
var multer = require('multer');
module.exports = function (app) {
    var imageStorage = 'uploads/product-image/';
    var upload = multer({
        dest: imageStorage,
        fileFilter: function (req, file, cb) {
            var allowType = ['image/jpeg', 'image/png'];
            cb(null, allowType.indexOf(file.mimetype) != -1);
        }
    });
    app.post('/photos/upload', upload.single('file'), function (req, res) {
        var extension = req.file.originalname.split(".");
        var file = './' + imageStorage + req.file.filename + '.' + extension[extension.length - 1];
        fs.rename(req.file.path, file, function (err) {
            if (err) {
                res.json({success: false});
                throw err;
            } else {
                res.json({
                    success: true,
                    srcImage: imageStorage + req.file.filename + '.' + extension[extension.length - 1]
                });
            }
        });
    });
};