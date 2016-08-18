var express = require('express'), app = express(), 
bodyParser = require('body-parser');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/admin/asserts'));
app.use(express.static(__dirname + '/APTshop/asserts'));
// Login module
require('./User/adminController')(app);
// User module
require('./User/userController')(app);
// User Group module
require('./Usergroup/usergroupController')(app);
// Permission module
require('./Permission/permissionController')(app);
var server = app.listen(8081, function () {
    console.log('Running....');
});