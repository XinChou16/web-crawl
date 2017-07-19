var fs = require('fs'); // 文件模块
var express = require('express');
var path =require('path');
var request =require('request'); 
var cheerio =require('cheerio');
var router = express.Router();

var url = 'http://www.qq.com';

router.post('/queryLibs',function(req,res,next) {
    res.json('clcik')
    request(url, function (err, response, body) {
        console.log('error:', err); 
        analyData(body);
        // console.log(response.text);
    });

    function analyData(data) {
        if(data.indexOf('html') == -1) return false;// 判断data是否乱码

        var $ = cheerio.load(data);
        var scriptFile = $('script[type="text/javascript"]').toArray();// 页面所有script引用
        var src = [];// scripts引用地址
        var scriptArr = [];
        console.log(scriptFile[1])
        // 将scripts引用地址保存到src数组
        if (scriptFile){
            scriptFile.forEach(function(item,index){
                if (item.attribs.src){
                    src.push(item.attribs.src);
                }
            });
        }
        // 保存信息
        scriptArr.push({
            domain: url,
            libsNum: src.length,
            libsSrc: src
        })
        console.log(scriptArr);
    };
})


