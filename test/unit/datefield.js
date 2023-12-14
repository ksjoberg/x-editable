define(["jquery", "moment"], function ($, moment) {
   
   var f = 'DD.MM.YYYY', mode;
   
   module("datefield", {
        setup: function(){
            fx = $('#async-fixture');
            $.support.transition = false;
            
            mode = $.fn.editable.defaults.mode;
            $.fn.editable.defaults.mode = 'inline';
        },
        teardown: function() {
            //restore mode
            $.fn.editable.defaults.mode = mode;
        }         
    });
    
    function frmt(date, format) {
       return moment(date).format(format);  
    }
     
    asyncTest("container should contain input with value and save new entered date", function () {

        var d = '15.05.1984',
            e = $('<a href="#" data-type="date" data-pk="1" data-url="post-datefield.php">'+d+'</a>').appendTo(fx).editable({
                format: f,
                viewformat: f,
                datepicker: {
                }        
            }),
            nextD = '16.05.1984',
            finalD = '17.05.1984';
        
          $.mockjax({
              url: 'post-datefield.php',
              response: function(settings) {
                  equal(settings.data.value, finalD, 'submitted value correct');            
              }
          });

        equal(frmt(e.data('editable').value, 'DD.MM.YYYY'), d, 'value correct');
            
        e.click();
        var p = tip(e);
        ok(p.find('input').is(':visible'), 'input exists');
        
        equal(p.find('input').val(), d, 'date set correct');
        
        //open picker
        //p.find('span.input-group-addon').click();
        var picker = p.find('.bootstrap-datetimepicker-widget');

        ok(picker.is(':visible'), 'picker shown');
        ok(picker.find('td.day.active').is(':visible'), 'active day is visible');
        equal(picker.find('td.day.active').text(), 15, 'day shown correct');
        equal(picker.find('th.dow').eq(0).text(), 'Mo', 'weekStart correct');

        //set new day by picker
        picker.find('td.day.active').next().click();
        ok(!picker.is(':visible'), 'picker closed'); 
        
        equal(p.find('input').val(), nextD, 'next day set correct');

        //re-open picker
        p.find('span.input-group-addon').click();
        p.find('input').val(finalD).trigger('keyup');
        
        var picker = p.find('.bootstrap-datetimepicker-widget');
        equal(picker.find('td.day.active').text(), 17, 'picker active date updated');
    
        //submit
        p.find('form').submit();
    
        setTimeout(function() {          
           ok(!p.is(':visible'), 'popover closed');
           ok(!picker.is(':visible'), 'picker closed');
           equal(frmt(e.data('editable').value, f), finalD, 'new date saved to value');
           equal(e.text(), finalD, 'new text shown');            
           e.remove();    
           start();  
        }, timeout); 
        
     }); 
     
     test("viewformat, init by text", function () {
         
        var dview = '15/05/1984',
            d = '1984-05-15',
            e = $('<a href="#" data-type="date" data-pk="1" data-url="post-date1.php">'+dview+'</a>').appendTo('#qunit-fixture').editable({
                format: 'YYYY-MM-DD',
                viewformat: 'DD/MM/YYYY'
            }),
            nextD = '1984-05-16',
            nextDview = '16/05/1984';
        
          equal(frmt(e.data('editable').value, 'YYYY-MM-DD'), d, 'value correct');
     });       
    
     test("viewformat, init by value", function () {
        var dview = '15/05/1984',
            d = '1984-05-15',
            e = $('<a href="#" data-type="date" data-pk="1" data-format="YYYY-MM-DD" data-viewformat="DD/MM/YYYY"  data-value="'+d+'"></a>').appendTo('#qunit-fixture').editable();

        equal(frmt(e.data('editable').value, 'YYYY-MM-DD'), d, 'value correct');
        equal(e.text(), dview, 'text correct');
     });    
    
    
 	test("incorrect date", function () {
        var d = '15.05.1984',
            e = $('<a href="#" data-type="date" data-pk="1">'+d+'</a>').appendTo('#qunit-fixture').editable({
                format: f,
                viewformat: f
            }),
            nextD = '16.05.1984';
        
        equal(frmt(e.data('editable').value, 'DD.MM.YYYY'), d, 'value correct');
            
        e.click();
        var p = tip(e);
        ok(p.find('input').is(':visible'), 'input exists');
        
        equal(p.find('input').val(), d, 'date set correct');
        
        //enter incorrect date
		p.find('input').val('abcde');
    
        //submit
        p.find('form').submit();
         
        ok(!p.is(':visible'), 'popover closed');
        equal(e.data('editable').value, null, 'date set to null');
        equal(e.text(), $.fn.editable.defaults.emptytext , 'emptytext shown');            
     });     
});