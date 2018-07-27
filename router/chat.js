var vfMessage = require("../entity/Message.js");
var vfUser = require("../entity/User.js");
var timeoutCallback = require("timeout-callback");
var request = require("./request.js");
var fs = require("fs");
var path = require("path");

var videoChat = require("./videoChat");
// https://github.com/aheckmann/gm/issues/455
//Node.js 对图片进行裁切、缩放 (gm)
var gm = require("gm").subClass({
  imageMagick: true
});


var chat = function (io) {
  // var vfUser = require("../entity/User.js");
  // var vfGroup = require('../entity/Group.js');
  // var vfGroupUser = require('../entity/GroupUser.js');

  //拦截操作 通过 token
  // io.set("authorization", function (handshakeData, callback) {

  // })

  io.on("connection",async function (socket) {
    // console.log("---来了");
    var token = socket.handshake.query.auth_token;
    var userName = vfglobal.token_Map[token];
    
    // console.log(typeof(userName));
    // if(typeof(userName) == "undefined"){
    //   io.disconnect();
    //   console.log(io);
    //   return false
    // }else{
    //   console.log(userName + "连接了socket服务器");
    // }
  
    console.log(userName + "连接了socket服务器");
    //socketID 每次连接都会变
    vfglobal.socket_Map[userName] = socket;
    vfglobal.socket_MapID[userName] = socket.id;

    //当一个人上线后，查询他的未读信息
    try {
      var someBody = await vfUser.findAnyOne(userName);
    } catch (e) {
      console.log('error'+e);
    }   
    var un_reads = someBody.un_reads;

    console.log(someBody);
    console.log('---------');
    console.log(un_reads);
// un_reads[0]
//     if(){

//     }

    // var len = un_reads
    // for(){

    // }
    // try{
    //   var someMes = await vfMessage.findMsgByMsgId(un_reads[0]);
    // }catch(e){
    //   console.log(e);
    // }
    // console.log(someMes);

    //

    // socket.broadcast.emit("onLine", { "userName": userName });
    io.sockets.emit("onLine", {
      "userName": userName
    });
    // 整个系统 级的聊天
    socket.on("liaotian", function (msg, callback) {
      //把接收到的msg原样广播
      // console.log(msg);
      //给除了自己以外的客户端广播消息
      // socket.broadcast.emit("liaotian", msg);
      //给所有客户端广播消息
      io.sockets.emit("liaotian", msg);

    });

    // 单聊
    socket.on("chat", function (message, callback) {
      var messageBody = message.bodies;
      // console.log(message);

      if (messageBody.type == "img") {
        //
      } else if (messageBody.type == "audio") {
        //
      } else {
        //文字消息
        sendMessage(message, callback);
      }
    });


    /*保存数据库，消息应答，消息转发*/
    function sendMessage(message, callback, fileData) {

      //callback 中将message传到msg中，so message==msg
      vfMessage.save(message, function (msg) { //将数据保存到数据库
        //已经不管用了
        if (callback) { //ack 回调 服务器已收到消息
          callback(msg);
        }
        var to_user = msg.to_user;

        var voIo = vfglobal.socket_Map[message.to_user];
        // console.log(voIo);
        if (voIo) {
          msg.bodies.fileData = fileData;
          // msg.bodies.fileData = undefined;
          voIo.emit("chat", msg);
          //发送超时 为解决
        } else {
          vfUser.User.update({
            "name": message.to_user
          }, {
            $push: {
              un_reads: message.msg_id
            }
          }, function () {
            console.log("存到un_reads字段");
          });
        }


      });
    }


    //添加好友
    socket.on("addFriend", async function (message, callback) {
      //所有消息数据存到数据库
      vfMessage.friendMessageSave(message, function (msg) {});

      //测试emitter 相关
      // vfUser.findAllUser();

      // var ff = function (r) {
      //   console.log(r);
      //   //清楚监听
      //   // vfglobal.emitter.removeListener('findAllUser_over',ff);
      // }
      // vfglobal.emitter.once('findAllUser_over', ff);

      // 
      // console.log('---------------------');
      // console.log(socket);
      //判断是否有此用户，如果有，继续逻辑，没有返回查无此人

      try {
        var someBody = await vfUser.findAnyOne(message.to_user);
      } catch (e) {
        console.log('error occurs');
      }

      if (!someBody) {
        try{
          message.type = 'no_body';
          socket.emit("addFriend",message);//信息原路返回,就是自己发给自己
        } catch(e){
          console.log('no_body错误了');
        }
        return false;
      }

      //判断type,
      if (message.type == "ack") {
        //
      } else if (message.type == "syn") {
        //好友关系存入数据库，
        vfUser.User.update({
          "name": message.to_user
        }, {
          $addToSet: {
            friends: message.from_user
          }
        }, function () {
          console.log("存到friends1字符");
        });
        //对方同意了，也要存到数据库
        vfUser.User.update({
          "name": message.from_user
        }, {
          $addToSet: {
            friends: message.to_user
          }
        }, function () {
          console.log("存到friends2字符");
        });
      } else if (message.type == "no") {
        //
      }

      //socketID 只有在线的人有，不在线的  数据库存入un_reads字段，等到上线在发送消息
      // var ToSocketID = vfglobal.socket_Map[message.to_user];
      var voIo = vfglobal.socket_Map[message.to_user];
      if (voIo) {
        // console.log(ToSocketID);
        // io.sockets.socket[ToSocketID].emit("addFriend", message);
        voIo.emit("addFriend", message);
      } else {
        vfUser.User.update({
          "name": message.to_user
        }, {
          $push: {
            un_reads: message.msg_id
          }
        }, function () {
          console.log("存到un_reads字段");
        });
        
        //对方未上线,等待对方上线同意后,即可成为好友
        message.type = 'un_line';
        socket.emit("addFriend",message);
      }

    });

    //视频聊天
    /* 创建视频聊天房间 */
    videoChat.scanVideoChat(socket);

    socket.on("videoChat", function (data, callback) {
      // 生成一个房间号
      console.log(data);

      var room = vfglobal.util.generateUUID();
      if (callback) {
        // 将房间号发送给聊天的双方
        callback(room);

        var targetSocket = vfglobal.socket_Map[data.to_user];
        console.info(targetSocket);
        if (targetSocket) {

          targetSocket.emit(
            "videoChat", {
              "from_user": data.from_user,
              "room": room
            },
            timeoutCallback(function (timeout, data) { //用其自身连接给自己发消息
              //超时 暂未处理
            })
          );


        }
      }
    });
  });

};


module.exports = chat;