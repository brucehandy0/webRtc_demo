var mongoose = require("mongoose"); //引入mongoose模块

mongoose.Promise = global.Promise;  
var monDB = mongoose.createConnection("mongodb://127.0.0.1:27017/chat",{useMongoClient:true});
monDB.on("error", function(error) {
    console.log("mon数据库连接失败：" + error);
});
monDB.on("open", function() {
    console.log("——mon数据库连接成功！——" + new Date().toLocaleString());
});
module.exports = monDB;