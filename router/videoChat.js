// rooms为所有房间的一个字典，key为房间号，value为一个数组，数组中存放所有的socket连接
var rooms = {};

/*
socket 连接对象
data 聊天的目标人id
callback 回调，返回一个房间号
*/

var scanVideoChat = function (socket) {
  var errorCb = function (rtc) {
    return function (error) {
      if (error) {
        rtc.emit("error", error);
      }
    };
  };

  //加入一个房间
  socket.on("__join", function (data) {
    console.log('加入了房间' + data.room);
    var room = data.room;
    var ids = [],
      i, len,
      curSocket,
      curRoom;

    curRoom = rooms[room] = rooms[room] || [];
    //curRoom 里遍历所有的socket
    for (i = 0, m = curRoom.length; i < m; i++) {
      curSocket = curRoom[i];
      if (curSocket.id === socket.id) {
        vfglobal.MyLog('is equel ============')
        continue;
      }
      //其他新人加入房间的信息
      ids.push(curSocket.id);
      curSocket.emit('_new_peer', {
        "socketId": socket.id
      });
    }
    curRoom.push(socket);
    socket.room = room;
    //发送所有的sockets
    //?????
    socket.emit("_peers", {
      "connections": ids,
      "you": socket.id
    });


  });


  socket.on("__ice_candidate", function (data) {
    var targetSocket = vfglobal.io.sockets.sockets[data.socketId];
    // console.log("服务器收到__ice");
    if (targetSocket) {
      targetSocket.emit("_ice_candidate", {
        "id": data.id,
        "label": data.label,
        "candidate": data.candidate,
        "socketId": socket.id,
        "ownSocketId": data.ownSocketId
      });
    }
  });


  //??
  socket.on("__offer", function (data) {
    var targetSocket = vfglobal.io.sockets.sockets[data.socketId];
    // console.log("服务器收到__offer");
    if (targetSocket) {
      targetSocket.emit('_offer', {
        "sdp": data.sdp,
        "socketId": socket.id
      });
    }
  });
  socket.on('__answer', function (data) {
    // console.log("服务器收到__answer");
    var targetSocket = vfglobal.io.sockets.sockets[data.socketId];
    if (targetSocket) {
      targetSocket.emit('_answer', {
        "sdp": data.sdp,
        "socketId": socket.id
      });
    }
  });

  // 挂断连接
  socket.on('closeRoom', function (data) {
    var i,
      room = socket.room,
      curRoom;
    if (room) {
      curRoom = rooms[room];
      for (i = 0; i < curRoom.length; i++) {
        if (curRoom[i].id === socket.id) {
          continue;
        }
        var targetSocket = curRoom[i];
        targetSocket.emit('_remove_peer', {
          "socketId": socket.id
        });
      }
    }
  });


  // 拒绝接听
  socket.on('cancelVideoChat', function (data) {
    var i,
      room = data.room,
      curRoom;
    if (room) {
      curRoom = rooms[room];
      for (i = 0; i < curRoom.length; i++) {
        var targetSocket = curRoom[i];
        // 给通话发起者发消息，对方拒绝通话
        targetSocket.emit('cancelVideoChat', {

        });
      }
    }
  });

};


module.exports = {
  scanVideoChat
};