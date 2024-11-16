const mysql = require('mysql2/promise');


var pool = mysql.createPool({
    connectionLimit : 10,
    host: "localhost",
    user: "root",
    password: "root",
    database: "node_app",
    debug: false
});

module.exports = pool;
 
 