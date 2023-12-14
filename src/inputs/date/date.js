/**
Bootstrap-datepicker.  
Description and examples: https://github.com/eternicode/bootstrap-datepicker.  
For **i18n** you should include js file from here: https://github.com/eternicode/bootstrap-datepicker/tree/master/js/locales
and set `language` option.  
Since 1.4.0 date has different appearance in **popup** and **inline** modes. 

@class date
@extends abstractinput
@final
@example
<a href="#" id="dob" data-type="date" data-pk="1" data-url="/post" data-title="Select date">15/05/1984</a>
<script>
$(function(){
    $('#dob').editable({
        format: 'yyyy-mm-dd',    
        viewformat: 'dd/mm/yyyy',    
        datepicker: {
           }
        }
    });
});
</script>
**/
/*global moment*/
(function ($) {
    "use strict";
    
    //store bootstrap-datepicker as bdateicker to exclude conflict with jQuery UI one
    
    var Date = function (options) {
        this.init('date', options, Date.defaults);
        this.initPicker(options, Date.defaults);
    };

    $.fn.editableutils.inherit(Date, $.fn.editabletypes.abstractinput);    
    
    $.extend(Date.prototype, {
        initPicker: function(options, defaults) {
            //'format' is set directly from settings or data-* attributes

            //by default viewformat equals to format
            if(!this.options.viewformat) {
                this.options.viewformat = this.options.format;
            }
            
            //try parse datepicker config defined as json string in data-datepicker
            options.datepicker = $.fn.editableutils.tryParseJson(options.datepicker, true);

            //overriding datepicker config (as by default jQuery extend() is not recursive)
            //since 1.4 datepicker internally uses viewformat instead of format. Format is for submit only
            this.options.datepicker = $.extend({}, defaults.datepicker, options.datepicker, {
                format: this.options.viewformat
            });
            
            //language
            this.options.datepicker.locale = this.options.datepicker.locale || moment.locale(); 

            this.dpg = {
                parseDate: function (txt, fmt) {
                    return moment(txt, fmt, true);
                },
                formatDate: function (x, fmt) {
                    return x.format(fmt);
                }
            };
        },
        
        render: function () {
            this.$input.datetimepicker(this.options.datepicker);
            
            //adjust container position when viewMode changes
            //see https://github.com/smalot/bootstrap-datetimepicker/pull/80
            this.$input.on('changeMode', function(e) {
                var f = $(this).closest('form').parent();
                //timeout here, otherwise container changes position before form has new size
                setTimeout(function(){
                    f.triggerHandler('resize');
                }, 0);
            });

            //"clear" link
            if(this.options.clear) {
                this.$clear = $('<a href="#"></a>').html(this.options.clear).click($.proxy(function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    this.clear();
                }, this));
                
                this.$tpl.parent().append($('<div class="editable-clear">').append(this.$clear));  
            }                
        },
        
        value2html: function(value, element) {
            var text = value ? this.dpg.formatDate(value, this.options.viewformat, this.options.datepicker.locale, this.options.formatType) : '';
            if(element) {
                Date.superclass.value2html.call(this, text, element);
            } else {
                return text;
            }
        },

        html2value: function(html) {
            return this.parseDate(html, this.options.viewformat); 
        },   

        value2str: function(value) {
            return value ? this.dpg.formatDate(value, this.options.format, this.options.datepicker.locale, this.options.formatType) : '';
        }, 

        str2value: function(str) {
            return this.parseDate(str, this.options.format);
        }, 

        value2submit: function(value) {
            return this.value2str(value);
        },                    

        value2input: function(value) {
            if(value) {
                this.$input.data('datetimepicker').date(value);
            }
        },

        input2value: function() { 
            //date may be cleared, in that case getDate() triggers error
            var dt = this.$input.data('datetimepicker');
            return dt.date ? dt.date() : null;
        },       

        activate: function() {
        },

        clear:  function() {
            this.$input.data('datetimepicker').date = null;
            this.$input.find('.active').removeClass('active');
            if(!this.options.showbuttons) {
                this.$input.closest('form').submit(); 
            }
        },

        autosubmit: function() {
            this.$input.on('mouseup', '.day', function(e){
                if($(e.currentTarget).is('.old') || $(e.currentTarget).is('.new')) {
                    return;
                }
                var $form = $(this).closest('form');
                setTimeout(function() {
                    $form.submit();
                }, 200);
            });
           //changedate is not suitable as it triggered when showing datepicker. see #149
           /*
           this.$input.on('changeDate', function(e){
               var $form = $(this).closest('form');
               setTimeout(function() {
                   $form.submit();
               }, 200);
           });
           */
       },
       
       /*
        For incorrect date bootstrap-datepicker returns current date that is not suitable
        for datefield.
        This function returns null for incorrect date.  
       */
       parseDate: function(str, format) {
           var date = null, formattedBack;
           if(str) {
                date = this.dpg.parseDate(str, format, this.options.datepicker.locale, this.options.formatType);
               if(typeof str === 'string') {
                    formattedBack = this.dpg.formatDate(date, format, this.options.datepicker.locale, this.options.formatType);
                   if(str !== formattedBack) {
                       date = null;
                   }
               }
           }
           return date;
       }

    });

    Date.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        @property tpl 
        @default <div></div>
        **/         
        tpl:'<div class="editable-date well"></div>',
        /**
        @property inputclass 
        @default null
        **/
        inputclass: null,
        /**
        Format used for sending value to server. Also applied when converting date from <code>data-value</code> attribute.<br>
        See MomentJs for possible formatting tokens.

        @property format 
        @type string
        @default YYYY-MM-DD
        **/
        format:'YYYY-MM-DD',
        /**
        Format used for displaying date. Also applied when converting date from element's text on init.   
        If not specified equals to <code>format</code>

        @property viewformat 
        @type string
        @default null
        **/
        viewformat: null,
        /**
        Configuration of datepicker.
        Full list of options: https://getdatepicker.com/4/Options/

        @property datepicker 
        @type object
        @default {
            startView: 0,
            minViewMode: 0,
            autoclose: false,
            pickTime: false
        }
        **/
        datepicker:{
            format: 'L',
            inline: true,
        },
        /**
        Text shown as clear date button. 
        If <code>false</code> clear button will not be rendered.

        @property clear 
        @type boolean|string
        @default 'x clear'
        **/
        clear: '&times; clear'
    });

    $.fn.editabletypes.date = Date;

}(window.jQuery));
