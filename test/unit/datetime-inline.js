(function(factory) {
    if (typeof define === 'function' && define.amd) {
      // AMD environment
      define(['jquery', 'moment'], factory);
    } else {
      // Global jQuery fallback
      factory(jQuery, moment);
    }
  })(function ($, moment) {

   var f = 'DD.MM.YYYY HH:mm', mode;

   module("datetime-inline", {
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
        return date.format(format);
    }

    asyncTest("container should contain datetimepicker with value and save new entered date", function () {
        var d = '15.05.1984 20:30',
            e = $('<a href="#" data-type="datetime" data-pk="1" data-url="post-datetimefield">'+d+'</a>').appendTo(fx).editable({
                format: f,
                datetimepicker: {

                }
            }),
            nextD = '16.05.1984 21:35';

          $.mockjax({
              url: 'post-datetimefield',
              response: function(settings) {
                  equal(settings.data.value, nextD, 'submitted value correct');
              }
          });

        //testing func, run twice!
        var func = function() {
            var df = $.Deferred();
            equal(frmt(e.data('editable').value, 'DD.MM.YYYY HH:mm'), d, 'value correct');

            e.click();
            var cont = tip(e);
            //check input
            ok(cont.find('input[type="text"]').is(':visible'), 'input exists');
            equal(cont.find('input').val(), d, 'value set correct');

            //open picker
            cont.find('span.input-group-addon').click();
            var p = cont.find('.bootstrap-datetimepicker-widget');

            //check date in picker
            ok(p.is(':visible'), 'datetimepicker exists');
            equal(p.length, 1, 'datetimepicker single');
            ok(p.find('.datepicker-days').is(':visible'), 'datetimepicker days visible');

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
            cont.find('form').submit();

            setTimeout(function() {
               ok(!cont.is(':visible'), 'popover closed');
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

     test("viewformat, init by text", function () {
        var dview = '15/05/1984 11:50',
            d = '1984-05-15 11:50',
            e = $('<a href="#" data-type="datetime" data-pk="1">'+dview+'</a>').appendTo('#qunit-fixture').editable({
                format: 'YYYY-MM-DD HH:mm',
                viewformat: 'DD/MM/YYYY HH:mm',
                datetimepicker: {

                }
            });

          equal(frmt(e.data('editable').value, 'YYYY-MM-DD HH:mm'), d, 'value correct');
     });

     test("viewformat, init by value", function () {
        var dview = '15/05/1984 15:45',
            d = '1984-05-15 15:45',
            e = $('<a href="#" data-type="datetime" data-pk="1" data-format="YYYY-MM-DD HH:mm" data-viewformat="DD/MM/YYYY HH:mm"  data-value="'+d+'"></a>').appendTo('#qunit-fixture').editable();

        equal(frmt(e.data('editable').value, 'YYYY-MM-DD HH:mm'), d, 'value correct');
        equal(e.text(), dview, 'text correct');
     });

 	test("incorrect datetime", function () {
        var dview = '15/05/1984 15:45',
            d = '1984-05-15 15:45',
            e = $('<a href="#" data-type="datetime" data-pk="1" data-format="YYYY-MM-DD HH:mm" data-viewformat="DD/MM/YYYYy HH:mm"  data-value="'+d+'"></a>').appendTo('#qunit-fixture').editable();

        e.click();
        var p = tip(e);
        ok(p.find('input').is(':visible'), 'input exists');

        //enter incorrect date
		p.find('input').val('abcde');

        //submit
        p.find('form').submit();

        ok(!p.is(':visible'), 'popover closed');
        equal(e.data('editable').value, null, 'date set to null');
        equal(e.text(), $.fn.editable.defaults.emptytext , 'emptytext shown');
     });

});