var mysql = require('mysql');
var mysqlDB = mysql.createConnection({
    host:'47.94.175.209',
    user:'li',
    password:'Lihanqing1993.',
    database:'App2'
});

mysqlDB.connect();
var sql = 'SELECT * FROM banner';
// mysqlDB.query(sql,function (err,result) {
//     if(err){
//         console.log(err.message);
//         return;
//     }
//     console.log('--------------------------SELECT----------------------------');
//     console.log(result);
// })

// mysqlDB.end();

module.exports = mysqlDB;
