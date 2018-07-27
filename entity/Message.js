var db = require('../config/mongoose.js');

var Message = db.model('Message', {
  msg_id: String,            //消息id uuid
  timestamp: Number,        //发送(服务器)时间
  sendtime: Number,        //客户端发送时间
  from_user: String,       //发送人
  to_user: String,         //要发送的人
  // chat_type: String,      //聊天的类型 chat(单聊)    groupChat (群聊)
  chat_type: String,      //聊天的类型 chat(单聊)    groupChat (群聊)  reqFri （好友请求）
  type: String,            //这个只有添加好友才有值， 值 ack，syn或空 ，no,拒绝 no_body 查无此人,un_line，对方未在线
  group_id: String,        //群聊 房间id (群聊时房间id)
  group_name: String,      //群聊 房间id (群聊时房间name)
  ext: String,            //扩展
  bodies: String ,         //内容 json 文本 存储
                          //类型1-->文本类型  { "type":"txt","msg":"hello from test2"}
                          //类型2-->图片类型  { "type":"img","imgUrl":"hello from test2","imageName","图片名称"  //消息内容}
})


//
var save = function (message, callBack) {
  var msg_id = vfglobal.util.generateUUID();
  var timestamp = new Date().getTime();
  var bodies = JSON.stringify(message.bodies);
  var msg = new Message({
    msg_id: msg_id,
    timestamp: timestamp,
    sendtime: message.sendtime,
    from_user: message.from_user,
    to_user: message.to_user,
    chat_type: message.chat_type,
    group_id: message.group_id,
    group_name: message.group_name,
    ext: message.ext,
    bodies: bodies,
    type: null,
  });
  //保存
  msg.save(function (err) {
    if (err) {
      vfglobal.MyLog("保存聊天记录失败");
    } else {
      if (callBack) {
        message.msg_id = msg_id;
        message.timestamp = timestamp;
        callBack(message);
      }
    }
  });
}
//好友消息保存
var friendMessageSave = function (message, callBack) {
  // var msg_id = vfglobal.util.generateUUID();

  var timestamp = new Date().getTime();
  var bodies = JSON.stringify(message.bodies);
  var msg = new Message({
    msg_id: message.msg_id,//客户端生成
    timestamp: timestamp,
    sendtime: message.sendtime,
    from_user: message.from_user,
    to_user: message.to_user,
    chat_type: message.chat_type,
    group_id: message.group_id,
    group_name: message.group_name,
    ext: message.ext,
    bodies: bodies,
    type: message.type,
  });
  //保存
  msg.save(function (err) {
    if (err) {
      vfglobal.MyLog("保存聊天记录失败");
    } else {
      if (callBack) {
        // message.msg_id = msg_id;
        message.timestamp = timestamp;
        callBack(message);
      }
    }
  });
}

//根据msg_id 查找此信息
var findMsgByMsgId = function(req, res){
  console.log(typeof (req));
  if (typeof (req) == 'string') {
    return new Promise(function (resolve, reject) {
      Message.findOne({
        "msg_id": req
      }, function (err, result) {
        console.log(result);
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      })
    });
    //http请求
  } else {

  }
}

module.exports = {
  Message,
  save,
  friendMessageSave,
  findMsgByMsgId
};