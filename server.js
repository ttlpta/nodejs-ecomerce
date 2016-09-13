var express = require('express'), app = express(),
    bodyParser = require('body-parser');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/admin/asserts'));
app.use(express.static(__dirname + '/APTshop/asserts'));
var multer = require('multer');
var upload = multer({
    dest: 'uploads/',
    fileFilter: function (req, file, cb) {
        var allowType = ['image/jpeg', 'image/png'];
        cb(null, allowType.indexOf(file.mimetype) != -1);
    }
});
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');

app.post('/photos/upload', upload.single('file'), function (req, res) {
    var extension = req.file.originalname.split(".");
    var file = __dirname + '/uploads/' + req.file.filename + '.' + extension[extension.length - 1];
    fs.rename(req.file.path, file, function (err) {
        if (err) {
            console.log(err);
            res.send(500);
        } else {
            res.json({
                message: 'File uploaded successfully',
                filename: req.file.filename
            });
        }
    });
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

server.listen(80, function () {
    console.log('Running....');
});