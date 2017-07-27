var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var index = require('./routes/index');
var ejs = require("ejs");

var app = express();

// 设置模板引擎
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 设置主页面路由
app.use('/', index);

// 404页面设置
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
 
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// 通过mongoose模块，监听http请求，判断数据库是否连接成功
mongoose.connect('mongodb://localhost:27017/web-crawl',function(err){
  if (err) {
    console.log('数据库连接失败')
  }else{
    console.log('数据库连接成功');
    // 连接到数据库才开始监听 
    app.listen(8000);
    console.log('Running at port: 8000')
  }
})

module.exports = app;
