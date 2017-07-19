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

router.get('/getLibs',function(req,res,next){
  JsLib.find({},function(err,data){
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
function analyData(data,rank) {
    if(data.indexOf('html') == -1) return false;
    var $ = cheerio.load(data);// 传递 HTML
    var sitesArr = $('.info-wrap .domain-link a').toArray();//将所有a链接存为数组
  

    for (var i = 0; i < 20; i++) {
        var url = sitesArr[i].attribs.href;
        sites.push(url);//保存网址，添加wwww前缀
    }
    // console.log(sites);

    getScript(sites);
}


// 获取JS库文件地址
function getScript(urls) {
    var scriptArr = [];
    var src = [];

    for (var j = 0; j < urls.length; j++) {
        (function(i){
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
          
            scriptFile.forEach(function(item,index){
                if (item.attribs.src != null) {
                    src.push(item.attribs.src);
                }
            });

            var jsLib = new JsLib({
              name: options.url,
              num: src.length
            });
            jsLib.save(function(err,data){
              if(err) console.log(err);
            });
            console.log('当前存储是第'+ i + '个网站，域名是： ' + jsLib.name)
          })
      })(j)
    };
}

module.exports = router;
