/**
 *  @xin chou
 * Create on: 2017-07-18
 */

 
$(function () {
    var query = $('.query'),
        rank = $('.rank'),
        show = $('.show'),
        queryLib = $('.queryLib'),
        libShow = $('#libShow'),
        libName = $('.libName'),
        displayResult = $('.displayResult');

    var checkLib = (function(){

      function _query(){
        query.click(function(){
            $.post(
                '/query',
                {
                    rank: rank.val(),
                },
                function(data){
                    // console.log(data);
                }
            )
        });
        queryLib.click(function(){
            var inputLibName = libName.val();
            if (inputLibName.length == 0) {
                alert('请输入库名~');
                return;
            }
            $.post(
                '/queryLib',
                {
                    libName: inputLibName,
                },
                function(data){
                    if(data.length == 0){
                        alert('没有查询到名为' + inputLibName + '的库');
                        libName.val('');
                        libName.focus();
                        libShow.html('')
                        return;
                    }
                    var libHtml = '';
                    for (var i = 0; i < data.length; i++) {
                        libHtml += '<tr><td>';
                        libHtml += (i+1) + '</td><td>';
                        libHtml += data[i].name + '</td><td>';
                        libHtml += data[i].num + '</td></tr>';
                    }
                    libShow.html(libHtml);
                }
            )
        });
      }

      function _showLibs(){
            $.get(
                '/ge',
                {
                    rank: rank.val(),
                },
                function(data){
                    console.log('一共返回'+ data.length + '条数据');
                    // console.log(data)
                    var libHtml = '';
                    var end = data.length;
                    
                    if (end > 20) {
                        end = 20;
                    }
                    for (var i = 0; i < end; i++) {
                        libHtml += '<tr><td>';
                        libHtml += (i+1) + '</td><td>';
                        libHtml += data[i].name + '</td><td>';
                        libHtml += data[i].num + '</td></tr>';
                    }
                    displayResult.show();
                    libShow.html(libHtml);// 点击显示按钮，显示前20项数据
                    _paging(data);
                }
            )
      }

      //翻页器
      function _paging(libObj) {
        var ele = $('#page');
        var pages = Math.ceil(libObj.length/20);
        console.log('总页数' + pages);
        ele.bootstrapPaginator({    
            currentPage: 1,    
            totalPages: pages,    
            size:"normal",    
            bootstrapMajorVersion: 3,    
            alignment:"left",    
            numberOfPages:pages,    
            itemTexts: function (type, page, current) {        
                switch (type) {            
                    case "first": return "首页";            
                    case "prev": return "上一页";            
                    case "next": return "下一页";            
                    case "last": return "末页";            
                    case "page": return page;
                }
            },
            onPageClicked:  function(event, originalEvent, type, page){
                // console.log('当前选中第：' + page + '页');
                var pHtml = '';
                var endPage;
                var startPage = (page-1) * 20;
                if (page < pages) {
                     endPage = page * 20;
                }else{
                     endPage = libObj.length;
                }
                for (var i = startPage; i < endPage; i++) {
                    pHtml += '<tr><td>';
                    pHtml += (i+1) + '</td><td>';
                    pHtml += libObj[i].name + '</td><td>';
                    pHtml += libObj[i].num + '</td></tr>';
                }
                libShow.html(pHtml);
            }
        })
      }

        function init() {
          _query();
         _showLibs();
        }

        return {
            init: init
        }

    })();

    checkLib.init();

})
