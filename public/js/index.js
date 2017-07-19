/**
 *  @xin chou
 * Create on: 2017-07-18
 */

 
$(function () {
    var query = $('.query'),
        rank = $('.rank'),
        show = $('.show'),
        libShow = $('#libShow');

    var checkLib = (function(){

      function _query(){
        query.click(function(){
            $.post(
                '/query',
                {
                    rank: rank.val(),
                },
                function(data){
                    console.log(data);
                }
            )
        });
      }

      function _showLibs(){
        show.click(function(){
            $.get(
                '/getLibs',
                {
                    rank: rank.val(),
                },
                function(data){
                    console.log('一共返回'+ data.length + '条数据');
                    console.log(data)
                    var libHtml = '';
                    data.forEach(function(item,i) {
                        libHtml += '<tr><td>';
                        libHtml += (i+1) + '</td><td>';
                        libHtml += item.name + '</td><td>';
                        libHtml += item.num + '</td></tr>';
                    });
                    libShow.html(libHtml);
                }
            )
        });
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
