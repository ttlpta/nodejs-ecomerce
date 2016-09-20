var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs'
});
connection.connect();
module.exports = connection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ubmVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlNvdXJjZS9jb25uZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUM7SUFDcEMsSUFBSSxFQUFFLFdBQVc7SUFDakIsSUFBSSxFQUFFLE1BQU07SUFDWixRQUFRLEVBQUUsRUFBRTtJQUNaLFFBQVEsRUFBRSxRQUFRO0NBQ3JCLENBQUMsQ0FBQztBQUNILFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyJ9