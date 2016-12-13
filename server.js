var express = require('express'),
    app = express(),
    _ = require('lodash'),
    bodyParser = require('body-parser');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/templates'));
app.use(express.static(__dirname + '/templates/APTshop'));
app.use(express.static(__dirname + '/templates/admin/asserts'));
app.use(express.static(__dirname + '/templates/APTshop/asserts'));
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var multer = require('multer');
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
    if (!_.isUndefined(req.file)) {
        var extension = req.file.originalname.split(".");
        var file = './' + imageStorage + req.file.filename + '.' + extension[extension.length - 1];
        fs.rename(req.file.path, file, function (err) {
            if (err) {
                res.json({ success: false });
                throw err;
            }
            else {
                res.json({
                    success: true,
                    srcImage: imageStorage + req.file.filename + '.' + extension[extension.length - 1]
                });
            }
        });
    }
    else {
        res.json({ success: false });
    }
});
require('./server/User/adminController')(app);
require('./server/User/userController')(app, io);
require('./server/Usergroup/usergroupController')(app);
require('./server/Permission/permissionController')(app);
require('./server/Categories/categoriesController')(app);
require('./server/Product/productController')(app);
require('./server/Brand/brandController')(app);
server.listen(80, function () {
    console.log('Running1....');
});