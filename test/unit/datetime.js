define(["jquery", "moment"], function ($, moment) {
   
   var f = 'DD.MM.YYYY HH:mm', mode;
   
   module("datetime", {
        setup: function(){
            fx = $('#async-fixture');
            $.support.transition = false;
            mode = $.fn.editable.defaults.mode;
            $.fn.editable.defaults.mode = 'popup';
        },
        teardown: function() {
            //restore mode
            $.fn.editable.defaults.mode = mode;
        }        
    });
    
    function frmt(date, format) {
        return date.format(format);  
    }
     
    asyncTest("container should contain datetimepicker with value and save new entered date", function () {
        var d = '15.05.1984 20:30',
            e = $('<a href="#" data-type="datetime" data-pk="1" data-url="post-datetime">'+d+'</a>').appendTo(fx).editable({
                format: f,
                datetimepicker: {
                    
                }        
            }),
            nextD = '16.05.1984 21:35';
        
          $.mockjax({
              url: 'post-datetime',
              response: function(settings) {
                  equal(settings.data.value, nextD, 'submitted value correct');            
              }
          });

        //testing func, run twice!
        var func = function() {
            var df = $.Deferred();
            equal(frmt(e.data('editable').value, 'DD.MM.YYYY HH:mm'), d, 'value correct');
                
            e.click();
            var p = tip(e);
            ok(p.find('.bootstrap-datetimepicker-widget').is(':visible'), 'datetimepicker exists');
            equal(p.find('.bootstrap-datetimepicker-widget').length, 1, 'datetimepicker single');
            ok(p.find('.bootstrap-datetimepicker-widget').find('.datepicker-days').is(':visible'), 'datepicker days visible');        
            
            equal(frmt(e.data('editable').value, f), d, 'day set correct');
            ok(p.find('td.day.active').is(':visible'), 'active day is visible');
            equal(p.find('td.day.active').text(), 15, 'day shown correct');
            equal(p.find('th.dow').eq(0).text(), 'Mo', 'weekStart correct');

            //set new day
            p.find('.day.active').next().click();

            //switch to timepicker
            p.find('.picker-switch a[data-action=togglePicker]').click();
            
            //hours appeared?
            ok(p.find('.timepicker-hour').is(':visible'), 'datetimepicker hours visible');

            //set hours 21
            p.find('.timepicker a.btn[data-action="incrementHours"]').click();

            //minutes appeared?
            ok(p.find('.timepicker-minute').is(':visible'), 'datetimepicker minutes visible');

            p.find('.timepicker span[data-action="showMinutes"]').click();
            //set minutes 21:35
            p.find('.timepicker-minutes td.minute')[7].click();

            //submit
            p.find('form').submit();
        
            setTimeout(function() {          
               ok(!p.is(':visible'), 'popover closed');
               equal(frmt(e.data('editable').value, f), nextD, 'new date saved to value');
               equal(e.text(), nextD, 'new text shown');
               df.resolve();            
            }, timeout);
            
            return df.promise();
        };
        
        $.when(func()).then(function() {
           e.editable('setValue', d, true);
           $.when(func()).then(function() {
              e.remove();    
              start();  
           });
        });
        
     });  
     
     asyncTest("viewformat, init by text", function () {
        var dview = '15/05/1984 11:50',
            d = '1984-05-15 11:50',
            e = $('<a href="#" data-type="datetime" data-pk="1" data-url="post-datetime1">'+dview+'</a>').appendTo(fx).editable({
                format: 'YYYY-MM-DD HH:mm',
                viewformat: 'DD/MM/YYYY HH:mm',
                datetimepicker: {
                    
                }
            }),
            nextD = '1984-05-16 11:50',
            nextDview = '16/05/1984 11:50';
        
          equal(frmt(e.data('editable').value, 'YYYY-MM-DD HH:mm'), d, 'value correct');
                        
          $.mockjax({
              url: 'post-datetime1',
              response: function(settings) {
                  equal(settings.data.value, nextD, 'submitted value correct');            
              }
          });
                        
        e.click();
        var p = tip(e);
        ok(p.find('.bootstrap-datetimepicker-widget').is(':visible'), 'datetimepicker exists');
        
        equal(frmt(e.data('editable').value, 'YYYY-MM-DD HH:mm'), d, 'day set correct');
        equal(p.find('td.day.active').text(), 15, 'day shown correct');
        equal(p.find('th.dow').eq(0).text(), 'Mo', 'weekStart correct');

        //set new day
        p.find('td.day.active').next().click();
        p.find('form').submit();
    
        setTimeout(function() {          
           ok(!p.is(':visible'), 'popover closed')
           equal(frmt(e.data('editable').value, 'YYYY-MM-DD HH:mm'), nextD, 'new date saved to value')
           equal(e.text(), nextDview, 'new text shown in correct format')            
           e.remove();    
           start();  
        }, timeout); 
        
     });       
  

    test("datetimepicker options can be defined in data-datetimepicker string", function () {
        var  e = $('<a href="#" data-type="datetime" data-datetimepicker="{stepping:5}" data-pk="1" data-url="/post"></a>').appendTo('#qunit-fixture').editable({
            });
       
        equal(e.data('editable').input.options.datetimepicker.stepping, 5, 'options applied correct');
    });   
  
  
     test("viewformat, init by value", function () {
        var dview = '15/05/1984 15:45',
            d = '1984-05-15 15:45',
            e = $('<a href="#" data-type="datetime" data-pk="1" data-format="YYYY-MM-DD HH:mm" data-viewformat="DD/MM/YYYY HH:mm"  data-value="'+d+'"></a>').appendTo('#qunit-fixture').editable();
        
        equal(frmt(e.data('editable').value, 'YYYY-MM-DD HH:mm'), d, 'value correct');
        equal(e.text(), dview, 'text correct');
     });    
     
     
     test("input should contain today if element is empty", function () {
        var e = $('<a href="#" data-type="datetime"></a>').appendTo('#qunit-fixture').editable();
        e.click();
        var p = tip(e),
            today = new Date();
        
        equal(p.find('td.day.active').text(), today.getDate(), 'day shown correct');
        
        p.find('.editable-cancel').click();
        ok(!p.is(':visible'), 'popover closed');      
      });
      
    asyncTest("clear button (showbuttons: true)", function () {
        var d = '15.05.1984 16:40',
            e = $('<a href="#" data-type="datetime" data-pk="1" data-url="post-datetime-clear.php">'+d+'</a>').appendTo(fx).editable({
                format: f,
                clear: 'abc',
                showbuttons: true
            });
                       
          $.mockjax({
              url: 'post-datetime-clear.php',
              response: function(settings) {
                  equal(settings.data.value, '', 'submitted value correct');            
              }
          });
       
        equal(frmt(e.data('editable').value, 'DD.MM.YYYY HH:mm'), d, 'value correct');
            
        e.click();
        var p = tip(e);
        ok(p.find('.bootstrap-datetimepicker-widget').is(':visible'), 'datetimepicker exists');
        
        equal(frmt(e.data('editable').value, f), d, 'day set correct');
        equal(p.find('td.day.active').text(), 15, 'day shown correct');

        var clear = p.find('.editable-clear a');
        equal(clear.text(), 'abc', 'clear link shown');

        //click clear
        clear.click();
        ok(!p.find('td.day.active').length, 'no active day');
        ok(p.find('.bootstrap-datetimepicker-widget').is(':visible'), 'datetimepicker still visible');

        p.find('form').submit();
    
        setTimeout(function() {          
           ok(!p.is(':visible'), 'popover closed');
           equal(e.data('editable').value, null, 'null saved to value');
           equal(e.text(), e.data('editable').options.emptytext, 'empty text shown');
           
           //reopen popover
           e.click();
           p = tip(e);
           ok(p.find('.bootstrap-datetimepicker-widget').is(':visible'), 'datetimepicker exists');
            
           e.remove();    
           start();  
        }, timeout); 
        
     });        

     
    asyncTest("clear button (showbuttons: false)", function () {
        var d = '15.05.1984 16:40',
            e = $('<a href="#" data-type="datetime" data-pk="1" data-url="post-datetime-clear1.php">'+d+'</a>').appendTo(fx).editable({
                showbuttons: false,
                format: f,
                clear: 'abc'
            });
                       
          $.mockjax({
              url: 'post-datetime-clear1.php',
              response: function(settings) {
                  equal(settings.data.value, '', 'submitted value correct');            
              }
          });
       
        equal(frmt(e.data('editable').value, 'DD.MM.YYYY HH:mm'), d, 'value correct');
            
        e.click();
        var p = tip(e);
        ok(p.find('.bootstrap-datetimepicker-widget').is(':visible'), 'datetimepicker exists');
        
        equal(frmt(e.data('editable').value, f), d, 'day set correct');
        equal(p.find('td.day.active').text(), 15, 'day shown correct');

        var clear = p.find('.editable-clear a');
        equal(clear.text(), 'abc', 'clear link shown');

        //click clear
        clear.click();
    
        setTimeout(function() {          
           ok(!p.is(':visible'), 'popover closed');
           equal(e.data('editable').value, null, 'null saved to value');
           equal(e.text(), e.data('editable').options.emptytext, 'empty text shown');
           
           //reopen popover
           e.click();
           p = tip(e);
           ok(p.find('.bootstrap-datetimepicker-widget').is(':visible'), 'datetimepicker exists');
            
           e.remove();    
           start();  
        }, timeout); 
        
     });             
});