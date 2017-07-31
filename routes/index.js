var express = require('express');
var mongoose = require('mongoose');
var request = require('request');
var cheerio =require('cheerio');
var router = express.Router();
var JsLib = require('../model/jsLib');
var schedule = require('node-schedule');

var sites = [];
var src = [];
var flag = 0;
var counter = 1;

/* 显示主页 */
router.get('/', function(req, res, next) {
  res.render('index');
});

// 显示爬虫数据
router.post('/',function(req,res,next){

  JsLib.find({})
  .sort({'num': -1})
  .exec(function(err,data){
    res.json(data);
  })
})

// 前台库的查询
router.post('/queryLib',function(req,res,next){
  var libName = req.body.libName;

  JsLib.find({
    name: libName
  }).exec(function(err,data){
    if (err) console.log('查询出现错误' + err);
    res.json(data);
  })
})

// 爬虫get
router.get('/crawl',function(req,res,next) {
  scheduleRun();
  res.json('爬虫成功')
})

function scheduleRun(){
  var rule = new schedule.RecurrenceRule();
  var times = [1,21,41];

  rule.minute = times; 
  schedule.scheduleJob(rule,function(){
    crawlSite();
    console.log('第'+counter +'次爬虫时间为:' + new Date());
    counter++;
  })
}
scheduleRun();

function crawlSite() {
  for (var i = 1; i < 3; i++) {
    (function(i){
      var options = {
        url: 'http://www.alexa.cn/siterank/' + i,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
        }
      };
      request(options, function (err, response, body) {
          if(err) console.log('请求出现错误: '+err);
          if(body === 'undefined') return;
          analyData(body);
      })
    })(i)
  }
}

function analyData(data) {
  var $ = cheerio.load(data);// 传递 HTML
  var sitesArr = $('.info-wrap .domain-link a').toArray();//将所有a链接存为数组
  
  for (var i = 0; i < 20; i++) { 
      var url = sitesArr[i].attribs.href;
      if(url){
        sites.push(url);
      }
  }
  // console.log(sites);
  // console.log('一共爬取' + sites.length +'个网站');
  // console.log('存储数据中...')

  getScript(sites);
  sites = [];// 清空缓存数组
}


// 获取JS库文件地址
function getScript(urls) {
  var scriptArr = [];
  var jsSrc = [];
  for (var j = 0; j < urls.length; j++) {
      (function(i,callback){
        var options = {
            url: urls[i],
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
            }
          }

        request(options, function (err, res, body) {
          if(err) console.log('请求出现错误: '+err);
          if(body === 'undefined') return;
          var $ = cheerio.load(body);
          var scriptFile = $('script').toArray();
          callback(scriptFile,options.url);
        })
    })(j,storeLib)
  };
}


// 提取网站script中的src
function storeLib(scriptFile,url){
  flag++;
  scriptFile.forEach(function(item,index){
    if (item.attribs.src != null) {
        var jsLink = item.attribs.src;
        var libName = jsLink.match(/[^\/\\]+$/g).join('');
        var libFilter = libName.split(/[-|.|,]/ig)[0];
        
        src.push(libFilter);
    }
  })
  // console.log('正在爬取第' + flag + '个网站，网站主页是' + url)
  if (flag == 20) {
    var libObj = sortJsLib(src)
    
    store2db(libObj);
    src = [];
    flag = 0;
  }
} 


// 将缓存数据存储到数据库
function store2db(libObj){
  // console.log(libObj.length);
  for (var i = 0; i < libObj.length; i++) {
    (function(i){
      var value = libObj[i].lib;
      var numValue = libObj[i].num;
      
      JsLib.find({'name': value},function(err,data){
        if(err) {console.log('查找出现错误' + err); return;}
        if (data.length == 0){//保存  
          var jslib = new JsLib({
              name: value,
              num: numValue
          })
          jslib.save();
        }else{//更新
          JsLib.update({name: value},{$set:{'num': numValue}},function(err,data){
            if(err) return;
            // console.log('更新数据成功');
          })
        }

      })
    
    })(i)
  }
}

// JS库判断是否重复方法
function sortJsLib(arr){
    var libObj = {};
    var result = [];
    for (var i = 0, len = arr.length; i < len; i++) {
        
        if (libObj[arr[i]]) {
            libObj[arr[i]] ++;
        } else {
            libObj[arr[i]] = 1;
        }
    }
   
    for(var o in libObj){
      if(libObj[o] > 1 && o.length > 3 && o.indexOf('=') == -1){
        result.push({
            lib: o,
            num: libObj[o]
        })
      }
    }

    return result;
}

module.exports = router;