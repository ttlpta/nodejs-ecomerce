var express = require('express'), app = express(),
    bodyParser = require('body-parser');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/admin/asserts'));
app.use(express.static(__dirname + '/APTshop/asserts'));
app.use(express.static(__dirname + '/uploads/product-image'));
var server = require('http').Server(app);
var io = require('socket.io')(server);
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