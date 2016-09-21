var express = require('express'), app = express(), helper = require('./helper');
    bodyParser = require('body-parser');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/admin/asserts'));
app.use(express.static(__dirname + '/APTshop/asserts'));
app.use(express.static(__dirname + '/uploads/product-image'));
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var multer = require('multer');
//Upload image
var upload = multer({
    dest: 'uploads/',
    fileFilter: function (req, file, cb) {
        var allowType = ['image/jpeg', 'image/png'];
        cb(null, allowType.indexOf(file.mimetype) != -1);
    }
});
app.post('/imageUpload/:type', upload.single('file'), function (req, res) {
    var imageStorage;
    switch (req.params.type) {
        case 'image':
            imageStorage = 'uploads/product-image/';
            break;
        case 'logo':
            imageStorage = 'uploads/logos/';
            break;
    }
    if (!helper.isUndefined(req.file)) {
        var extension = req.file.originalname.split(".");
        var file = './' + imageStorage + req.file.filename + '.' + extension[extension.length - 1];
        fs.rename(req.file.path, file, function (err) {
            if (err) {
                res.json({ success: false });
                throw err;
            } else {
                res.json({
                    success: true,
                    srcImage: imageStorage + req.file.filename + '.' + extension[extension.length - 1]
                });
            }
        });
    } else {
        res.json({ success: false });
    }

});
// Login module
require('./User/adminController')(app);
// User module
require('./User/userController')(app, io);
// User Group module
require('./Usergroup/usergroupController')(app);
// Permission module
require('./Permission/permissionController')(app);
// Categories module
require('./Categories/categoriesController')(app);
// Product module
require('./Product/productController')(app);
// Brand module
require('./Brand/brandController')(app);
server.listen(80, function () {
    console.log('Running....');
});