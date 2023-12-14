/**
Bootstrap datetimefield input - datetime input for inline mode.
Shows normal <input type="text"> and binds popup datetimepicker.  
Automatically shown in inline mode.

@class datetimefield
@extends datetime

**/
(function ($) {
    "use strict";
    
    var DateTimeField = function (options) {
        this.init('datetimefield', options, DateTimeField.defaults);
        this.initPicker(options, DateTimeField.defaults);
    };

    $.fn.editableutils.inherit(DateTimeField, $.fn.editabletypes.datetime);
    
    $.extend(DateTimeField.prototype, {
        render: function () {
            this.$input = this.$tpl.find('input');
            this.setClass();
            this.setAttr('placeholder');
            if(this.options.clear) {
                if (!this.options.datetimepicker.buttons)
                {
                    this.options.datetimepicker.buttons = {};
                }
                this.options.datetimepicker.buttons.showClear = true;
            }

            this.$tpl.datetimepicker(this.options.datetimepicker);

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
           if(value) {
               this.$tpl.data('datetimepicker').date(value);
           }
       },
        
       input2value: function() { 
           return this.html2value(this.$input.val());
       },              
        
       activate: function() {
           $.fn.editabletypes.text.prototype.activate.call(this);
           this.$tpl.datetimepicker('show');
       },
       
       autosubmit: function() {
         //reset autosubmit to empty  
       }
    });
    
    DateTimeField.defaults = $.extend({}, $.fn.editabletypes.datetime.defaults, {
        /**
        @property tpl 
        **/         
        tpl:'<div class="input-group date" data-target-input="nearest"><input type="text"/></div>',
        /**
        @property inputclass 
        @default null
        **/         
        inputclass: null,
        
        /* datetimepicker config */
        datetimepicker:{
            format: 'L LT',
        },
    });
    
    $.fn.editabletypes.datetimefield = DateTimeField;

}(window.jQuery));