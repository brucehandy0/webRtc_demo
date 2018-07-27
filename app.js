var express = require("express");
var vfutils = require("./utils/utils.js");
var MyLog = require("./utils/MyLog.js");
var redis   = require("redis");
var app = express();
var path = require("path");

var bodyParser = require("body-parser");
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true}));

//session公式：
var session = require("express-session");
//模板引擎
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//静态服务
app.use(express.static("./public"));
app.use(session({
    secret: "keyboard cat",
    resave: true,   // 即使 session 没有被修改，也保存 session 值，默认为 true
    cookie: {maxAge: 35 * 60 * 1000},  //session和相应的cookie失效过期
    saveUninitialized: true,//强制没有“初始化”的session保存到storage中，没有初始化的session指的是：刚被创建没有被修改
    rolling: true   //add 刷新页面 session 过期时间重置
}));

//socket.io公式：
var http = require("http").Server(app);
var io = require("socket.io")(http, {
    // below are engine.IO options
    pingInterval: 5000,
    pingTimeout: 3000,
    cookie: false,
    reconnection: true
});

let EventEmitter = require('events');
const emitter = new EventEmitter();

global.vfglobal = {
    // 在线用户
    allLineUser:[],
    //所有用户
    allUser: [],
    //所有的 token : user
    token_Map: {},
    //保存所有的 user ：socket 连接
    socket_Map: {},
    //保存登录socket.id
    socket_MapID:{},
    //前端是否登录
    isLogin: -1,
    //util
    util: vfutils,
    MyLog:MyLog,
    //io
    io : io,
    redis:redis,
    emitter:emitter,
    findAllUser_over_ff:'' //临时变量
};


// console.log(global.vfglobal.util.generateUUID);



require("./router/router.js")(app);
require("./router/chat.js")(io);

//监听
http.listen(3000);


