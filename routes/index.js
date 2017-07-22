var express = require('express');
var mongoose = require('mongoose');
var request = require('request');
var cheerio =require('cheerio');
var router = express.Router();
var JsLib = require('../model/jsLib')

/* 显示主页 */
router.get('/', function(req, res, next) {
  res.render('index');
});

// 显示库
router.get('/getLibs',function(req,res,next){
  JsLib.find({})
  .sort({'libsNum': -1})
  .exec(function(err,data){
    res.json(data);res.json('data');
  })
})

// 库的查询
router.post('/queryLib',function(req,res,next){
  var libName = req.body.libName;

  JsLib.find({
    name: libName
  }).exec(function(err,data){
    if (err) console.log('查询出现错误' + err);
    res.json(data);
  })
})

router.post('/query',function(req,res,next) {
  var rank = req.body.rank;
  var len = Math.round(rank/20);
  
  for (var i = 1; i < len+1; i++) {
    (function(i){
      var options = {
        url: 'http://www.alexa.cn/siterank/' + i,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
        }
      };
      request(options, function (err, response, body) {
          analyData(body,rank);
      })
    })(i)
  }
  res.json('保存成功')
})
 
var sites = [];
var flag = 0;
function analyData(data,rank) {
    if(data.indexOf('html') == -1) return false;
    var $ = cheerio.load(data);// 传递 HTML
    var sitesArr = $('.info-wrap .domain-link a').toArray();//将所有a链接存为数组

    console.log('网站爬取中``')
    for (var i = 0; i < 10; i++) { 
        var url = sitesArr[i].attribs.href;
        sites.push(url);//保存网址，添加wwww前缀
    }
    console.log(sites);
    console.log('一共爬取' + sites.length +'个网站');

    getScript(sites);
}


// 获取JS库文件地址
function getScript(urls) {
  var scriptArr = [];
  var src = [];
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
          if(err) console.log('出现错误: '+err);
          var $ = cheerio.load(body);
          var scriptFile = $('script').toArray();
          callback(scriptFile,options.url);
        })
    })(j,storeLib)
  };

  function storeLib(scriptFile,url){
    flag++;// 是否存储数据的标志
    scriptFile.forEach(function(item,index){
      if (item.attribs.src != null) {
          obtainLibName(item.attribs.src,index);
      }
    })
  
      
    function obtainLibName(jsLink,i){
      var reg = /[^\/\\]+$/g;
      var libName = jsLink.match(reg).join('');
      var libFilter = libName.slice(0,libName.indexOf('.'));

        src.push(libFilter);
    }

    // console.log(src.length);
    // console.log(calcNum(src).length)
    (function(len,urlLength,src){
      // console.log('length is '+ len)
      if (len == 20 ) {// len长度为url的长度才向src和数据库里存储数据
        // calcNum(src);//存储数据到数据库
        console.log('存储数据中...')
        var libSrc = calcNum(src);
        // store2db(libSrc);
        console.log('一共存储' + libSrc.length + '条数据到数据库');
      }
    })(flag,urls.length,src)
  } 
}// getScript END

// 将缓存数据存储到数据库
function store2db(libObj){
  console.log(libObj);
  for (var i = 0; i < libObj.length; i++) {
    var jsLib = new JsLib({
      name: libObj[i].lib,
      libsNum: libObj[i].num
    });

    JsLib.find({name: libObj[i].lib})
    .exec(function(err,data){
      if(err) console.log(err);
      if (data.length == 0){
        jsLib.save(function(err,data){
          if(err) console.log('保存数据出错' + err);
        });
      }
      // else{
      //   JsLib.findOneAndUpdate({
      //     name: data.lib
      //   },{
      //     $set:{libsNum: data.num}
      //   }).exec(function(err,doc){
      //     if(err){
      //       console.log('更新数据出错' + err);
      //     }
      //   })
      // }
    })
  }
}
// JS库排序算法
function calcNum(arr){
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
        result.push({
            lib: o,
            num: libObj[o]
        })
    }

    result.sort(function(a,b){
        return b.num - a.num;
    });

    return result;
}


module.exports = router;
