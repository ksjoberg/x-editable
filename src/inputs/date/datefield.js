/**
Bootstrap datefield input - modification for inline mode.
Shows normal <input type="text"> and binds popup datepicker.
Automatically shown in inline mode.

@class datefield
@extends date

@since 1.4.0
**/
(function ($) {
    "use strict";

    var DateField = function (options) {
        this.init('datefield', options, DateField.defaults);
        this.initPicker(options, DateField.defaults);
    };

    $.fn.editableutils.inherit(DateField, $.fn.editabletypes.date);

    $.extend(DateField.prototype, {
        render: function () {
            this.$input = this.$tpl.find('input');
            this.setClass();
            this.setAttr('placeholder');

            this.$tpl.datetimepicker(this.options.datepicker);

            //need to disable original event handlers
            this.$input.off('focus keydown');

            //update value of datepicker
            this.$input.keyup($.proxy(function(){
               this.$tpl.removeData('date');
               this.$tpl.data('datetimepicker').date(this.$input.val());
            }, this));

        },

       value2input: function(value) {
           this.$input.val(this.value2html(value));
           //this.$tpl.datetimepicker('update');
           if(value) {
               this.$tpl.data('datetimepicker').date(value);
           }
       },

       input2value: function() {
           return this.html2value(this.$input.val());
       },

       activate: function() {
            //this.$input.data('datetimepicker').show();
            $.fn.editabletypes.text.prototype.activate.call(this);
            this.$tpl.datetimepicker('show');
       },

       autosubmit: function() {
         //reset autosubmit to empty
       }
    });

    DateField.defaults = $.extend({}, $.fn.editabletypes.date.defaults, {
        /**
        @property tpl
        **/
        tpl:'<div class="input-group date" id="editable${id}" data-target-input="nearest" style="position: relative"><input type="text"/><span class="input-group-addon" data-target="#editable${id}" data-toggle="datetimepicker"><span class="glyphicon glyphicon-calendar"></span></span></div>',
        /**
        @property inputclass
        @default null
        **/
        inputclass: null,

        /* datepicker config */
        datepicker: {
            format: 'L',
        }
    });

    $.fn.editabletypes.datefield = DateField;

}(window.jQuery));
