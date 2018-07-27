var router = function (app) {
  var vfUser = require("../entity/User.js");

  //主页
  app.get("/", function (req, res, next) {
    res.render("index");
  });



  //userName,password,  headImageUrl(这个可以有)
  app.post("/register", function (req, res, next) {
    vfUser.register(req, res);
  });
  //参数userName，password
  app.post("/mobileLogin", function (req, res) {
    vfUser.mobileLogin(req, res);
  });

  app.get("/allUsers", function (req, res, next) {
    vfUser.findAllUser(req, res, vfglobal.allLineUser);
  });

  //前台登陆，检查此人是否有用户名，并且昵称不能重复
  app.get("/check", function (req, res, next) {
    var userName = req.query.yonghuming;
    if (!userName) {
      res.send("必须填写用户名");
      return;
    }
    if (vfglobal.allUser.indexOf(userName) != -1) {
      res.send("用户名已经被占用");
      return;
    }
    vfglobal.isLogin = 1;
    vfglobal.allLineUser.push(userName);
    //付给session
    req.session.userName = userName;
    res.redirect("/chat");
  });
  
  //
  app.get("/chat", function (req, res, next) {


    res.set('Content-Type', 'text/html');
    // res.setEncoding('utf8');
    // res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    // console.log(req.session);
    //这个页面必须保证有用户名了，
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    res.render("chat", {
        "user": JSON.stringify(req.session.user),
    });
  });

  //用户名
  app.post("/findFriends", function (req, res, next) {
    vfUser.findFriends(req, res);
  });


};


module.exports = router;