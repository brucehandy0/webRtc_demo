var db = require('../config/mongoose.js');



var User = db.model('User', {
  userId: Number,
  name: String,
  headImageUrl: String, //头像
  nickname: String, //昵称
  password: String,
  auth_token: String,
  auth_date: Number,
  un_reads: Array,
  friends: Array

})

var save = function (userName, password, headImageUrl, callBack) {

  var mtoken = vfglobal.util.generateUUID();

  var auth_date = vfglobal.util.dateAdd("m", 2, new Date()).getTime();
  var userN = new User({
    name: userName,
    password: password,
    headImageUrl: headImageUrl,
    auth_token: mtoken,
    auth_date: auth_date
  });
  userN.save(function (err) {
    if (err) {
      console.log("注册 -- 保存失败!");
    } else {
      if (callBack) {
        callBack(mtoken, auth_date);
      }
      console.log("注册 -- 保存成功!");
    }
  });
}

var register = function (req, res) {
  // console.log(req);
  var userName = req.body.userName;
  if (!userName) {
    res.json({
      code: -1,
      message: "用户名不能为空",
      data: ""
    });
    return;
  }

  var password = req.body.password;
  if (!password) {
    res.json({
      code: -1,
      message: "密码不能为空",
      data: ''
    });
    return;
  }

  // if (!userName.match('^(?!_)(?!.*?_$)[a-zA-Z0-9_]{4,15}$')) { //用户名不合法时
  //     res.json({
  //         code: -1,
  //         message: "用户名不合法",
  //         data: ''
  //     });
  //     return;
  // }
  var headImageUrl = req.body.headImageUrl;

  User.find({
    "name": userName
  }, function (err, result) {
    var user = result[0];
    if (!user) {
      var mtoken = '';
      var auth_date = '';

      save(userName, password, headImageUrl, function (token, date) {
        mtoken = token;
        auth_date = date;
        res.json({
          code: 1,
          message: "注册成功",
          data: {
            auth_token: mtoken,
            auth_date: auth_date
          }
        });
      });
    } else {
      res.json({
        code: -1,
        message: "用户已存在",
        data: ""
      });
    }
  })

}
//查询所有用户，和在线用户
var findAllUser = function (req, res) {
  if (typeof (req) == 'string') {

  }
  //查询在线人数应该在session中查找
  //查询数据
  User.find({}, ['name', 'headImageUrl', 'nickname'], function (err, result) {
    if (req) {
      res.json({
        code: 1,
        message: "查询数据成功",
        data: {
          "allUser": result,
          "onLineUsers": vfglobal.allLineUser
        }
      })
    } else {
      vfglobal.allUser = JSON.stringify(result);
      // vfglobal.emitter.emit('findAllUser_over',JSON.stringify(result));
    }
  });

}
//查询某人是否存在
var findAnyOne = function (req, res) {
  //判断req 是一个请求,还是内部调用
  //string 是内部,object是http请求
  if (typeof (req) == 'string') {

    return new Promise(function (resolve, reject) {
      User.findOne({
        "name": req
      }, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
        // console.log(result);
      })
    });

  } else {

  }


}

var mobileLogin = function (req, res) {

  var userName = req.body.userName;
  if (!userName) {
    res.json({
      code: -1,
      message: "用户名不能为空",
      data: ""
    });
    return;
  }
  var password = req.body.password;
  if (!password) {
    res.json({
      code: -1,
      message: "密码不能为空",
      data: ""
    });
    return;
  }
  User.find({
    "name": userName,
    "password": password
  }, function (err, result) {
    var user = result[0];
    if (user) {
      vfglobal.token_Map[user.auth_token] = userName;

      vfglobal.allLineUser.findIndex(function (T, number, arr) {
        if (T == userName) {
          vfglobal.allLineUser.splice(number, 1);
        }
      });
      vfglobal.allLineUser.push(userName);
      console.log(userName + "登录成功");
      req.session.user = result[0];
      res.json({
        code: 1,
        message: "登陆成功",
        data: user
      });

    } else {
      res.json({
        code: -1,
        message: "用户名或密码错误",
        data: ""
      });
    }
  });

}
//查询好友列表
var findFriends = function (req, res) {
  var userName = req.body.userName;
  User.find({
    "name": userName
  }, function (err, result) {
    var user = result[0];
    if (user) {
      res.json({
        code: 1,
        message: "好友列表",
        data: user.friends
      });
    } else {
      res.json({
        code: 0,
        message: "没有数据",
        data: ""
      });
    }

  });
}
module.exports = {
  User,
  mobileLogin,
  save,
  register,
  findAllUser,
  findFriends,
  findAnyOne
};