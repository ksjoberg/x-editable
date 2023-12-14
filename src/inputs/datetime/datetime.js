/**
Bootstrap-datetimepicker.  
Based on [Eonasdan bootstrap-datetimepicker plugin](https://github.com/Eonasdan/bootstrap-datetimepicker/). 
Before usage you should manually include dependent js and css:

    <link href="css/bootstrap-datetimepicker.css" rel="stylesheet" type="text/css"></link> 
    <script src="js/bootstrap-datetimepicker.js"></script>

For **i18n** you should include js file from here: https://github.com/Eonasdan/bootstrap-datetimepicker/tree/master/js/locales
and set `language` option.  

@class datetime
@extends abstractinput
@final
@since 1.4.4
@example
<a href="#" id="last_seen" data-type="datetime" data-pk="1" data-url="/post" title="Select date & time">15/03/2013 12:45</a>
<script>
$(function(){
    $('#last_seen').editable({
        format: 'YYYY-MM-DD HH:mm',    
        viewformat: 'DD/MM/YYYY HH:mm',    
        datetimepicker: {
           }
        }
    });
});
</script>
**/

/*global moment*/

(function ($) {
    "use strict";

    var DateTime = function (options) {
        this.init('datetime', options, DateTime.defaults);
        this.initPicker(options, DateTime.defaults);
    };

    $.fn.editableutils.inherit(DateTime, $.fn.editabletypes.abstractinput);

    $.extend(DateTime.prototype, {
        initPicker: function(options, defaults) {
            //'format' is set directly from settings or data-* attributes

            //by default viewformat equals to format
            if(!this.options.viewformat) {
                this.options.viewformat = this.options.format;
            }
            
            //try parse datetimepicker config defined as json string in data-datetimepicker
            options.datetimepicker = $.fn.editableutils.tryParseJson(options.datetimepicker, true);

            //overriding datetimepicker config (as by default jQuery extend() is not recursive)
            //since 1.4 datetimepicker internally uses viewformat instead of format. Format is for submit only
            this.options.datetimepicker = $.extend({}, defaults.datetimepicker, options.datetimepicker, {
                format: this.options.viewformat
            });

            //language
            this.options.datetimepicker.locale = this.options.datetimepicker.locale || moment.locale(); 

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
            this.$input.datetimepicker(this.options.datetimepicker);

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
            var text = value ? this.dpg.formatDate(value, this.options.viewformat, this.options.datetimepicker.locale, this.options.formatType) : '';
            if(element) {
                DateTime.superclass.value2html.call(this, text, element);
            } else {
                return text;
            }
        },

        html2value: function(html) {
            return this.parseDate(html, this.options.viewformat); 
        },

        value2str: function(value) {
            return value ? this.dpg.formatDate(value, this.options.format, this.options.datetimepicker.locale, this.options.formatType) : '';
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
 
        clear: function() {
            this.$input.data('datetimepicker').date = null;
            this.$input.find('.active').removeClass('active');
            if(!this.options.showbuttons) {
                this.$input.closest('form').submit(); 
            }          
        },

        autosubmit: function() {
            this.$input.on('mouseup', '.minute', function(e){
                var $form = $(this).closest('form');
                setTimeout(function() {
                    $form.submit();
                }, 200);
            });
        },
 
        //convert date from local to utc
        toUTC: function(value) {
            return value ? new Date(value.valueOf() + value.utcOffset() * 60000) : value;  
        },
 
        //convert date from utc to local
        fromUTC: function(value) {
            return value ? new Date(value.valueOf() - value.utcOffset() * 60000) : value;  
        },
 
        /*
         For incorrect date bootstrap-datetimepicker returns current date that is not suitable
         for datetimefield.
         This function returns null for incorrect date.  
        */
        parseDate: function(str, format) {
            var date = null, formattedBack;
            if(str) {
                date = this.dpg.parseDate(str, format, this.options.datetimepicker.locale, this.options.formatType);
                if(typeof str === 'string') {
                    formattedBack = this.dpg.formatDate(date, format, this.options.datetimepicker.locale, this.options.formatType);
                    if(str !== formattedBack) {
                        date = null;
                    } 
                }
            }
            return date;
        }

    });

    DateTime.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        @property tpl 
        @default <div></div>
        **/         
        //tpl:'<div class="editable-date well"></div>',
        tpl:'<div class="input-append date" data-target-input="nearest" style="position: relative"><input type="text"/></div>',

        /**
        @property inputclass 
        @default null
        **/
        inputclass: null,
        /**
        Format used for sending value to server. Also applied when converting date from <code>data-value</code> attribute.<br>
        See documentation for MomentJs for possible formatting tokens. 
        
        @property format 
        @type string
        @default YYYY-MM-DD HH:mm
        **/         
        format:'YYYY-MM-DD HH:mm',
        formatType:'standard',
        /**
        Format used for displaying date. Also applied when converting date from element's text on init.   
        If not specified equals to <code>format</code>
        
        @property viewformat 
        @type string
        @default null
        **/
        viewformat: null,
        /**
        Configuration of datetimepicker.
        Full list of options: https://github.com/Eonasdan/bootstrap-datetimepicker

        @property datetimepicker 
        @type object
        @default { }
        **/
        datetimepicker:{
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

    $.fn.editabletypes.datetime = DateTime;

}(window.jQuery));