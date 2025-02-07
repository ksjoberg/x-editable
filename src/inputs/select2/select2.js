/**
Select2 input. Based on amazing work of Igor Vaynberg https://github.com/ivaynberg/select2.
Please see [original select2 docs](http://ivaynberg.github.com/select2) for detailed description and options.

You should manually download and include select2 distributive:

    <link href="select2/select2.css" rel="stylesheet" type="text/css"></link>
    <script src="select2/select2.js"></script>

To make it **bootstrap-styled** you can use css from [here](https://github.com/t0m/select2-bootstrap-css):

    <link href="select2-bootstrap.css" rel="stylesheet" type="text/css"></link>

**Note:** currently `autotext` feature does not work for select2 with `ajax` remote source.
You need initially put both `data-value` and element's text youself:

    <a href="#" data-type="select2" data-value="1">Text1</a>


@class select2
@extends abstractinput
@since 1.4.1
@final
@example
<a href="#" id="country" data-type="select2" data-pk="1" data-value="ru" data-url="/post" data-title="Select country"></a>
<script>
$(function(){
    //local source
    $('#country').editable({
        source: [
              {id: 'gb', text: 'Great Britain'},
              {id: 'us', text: 'United States'},
              {id: 'ru', text: 'Russia'}
           ],
        select2: {
           multiple: true
        }
    });
    //remote source (simple)
    $('#country').editable({
        source: '/getCountries',
        select2: {
            placeholder: 'Select Country',
            minimumInputLength: 1
        }
    });
    //remote source (advanced)
    $('#country').editable({
        select2: {
            placeholder: 'Select Country',
            allowClear: true,
            minimumInputLength: 3,
            id: function (item) {
                return item.CountryId;
            },
            ajax: {
                url: '/getCountries',
                dataType: 'json',
                data: function (term, page) {
                    return { query: term };
                },
                results: function (data, page) {
                    return { results: data };
                }
            },
            formatResult: function (item) {
                return item.CountryName;
            },
            formatSelection: function (item) {
                return item.CountryName;
            },
            initSelection: function (element, callback) {
                return $.get('/getCountryById', { query: element.val() }, function (data) {
                    callback(data);
                });
            }
        }
    });
});
</script>
**/
(function ($) {
    "use strict";

    $.fn.select2.amd.define('select2/dataAdapter/CustomData', [
        'select2/data/array',
        'select2/utils'
    ], function (ArrayData, Utils) {
        function CustomData ($element, options) {
            CustomData.__super__.constructor.call(this, $element, options);
            this.options.optionCache = {};
        }
        function converterFunc(obj) {
            obj.id = obj.id || obj.value;
            obj.text = obj.text || obj.name;
            return obj;
        }

        Utils.Extend(CustomData, ArrayData);
        CustomData.prototype.query = function (params, callback) {
            var optionCache = this.options.optionCache;
            $.get(this.options.options.ajax.url, { query: params.term }, function (data) {
                var items = $.map(data, converterFunc);
                items.forEach(function(item) {
                    optionCache[item.id] = item;
                });
                callback({
                    results: items
                });
            }, 'json');
        };

        CustomData.prototype.current = function (callback) {
            var currentVal = this.$element.val();

            if (!this.$element.prop('multiple')) {
                currentVal = [currentVal];
            }

            var optionCache = this.options.optionCache;
            var cachedItems = [];
            currentVal.forEach(function(v)
            {
                var cachedItem = optionCache[v];
                if (optionCache[v])
                {
                    cachedItems.push(cachedItem);
                }
            });
            if (cachedItems.length === currentVal.length)
            {
                callback(cachedItems);
                return;
            }
            $.get(this.options.options.ajax.url, { id: currentVal }, function (data) {
                callback($.map(data, converterFunc).filter(function(element) { return currentVal.includes(element.id); }));
            }, 'json');
        };
        return CustomData;
    });

    var Constructor = function (options) {
        this.init('select2', options, Constructor.defaults);

        options.select2 = options.select2 || {};

        this.sourceData = null;
        this.scope = options.scope;

        //placeholder
        if(options.placeholder) {
            options.select2.placeholder = options.placeholder;
        }

        //if not `tags` mode, use source
        if(!options.select2.tags && options.source) {
            var source = options.source;
            //if source is function, call it (once!)
            if ($.isFunction(options.source)) {
                source = options.source.call(options.scope);
            } else if (options.sourceType === 'json') {
                source = JSON.parse(source);
            }

            if (typeof source === 'string') {
                options.select2.ajax = options.select2.ajax || {};
                options.select2.ajax.url = source;
                
                options.select2.dataAdapter = $.fn.select2.amd.require('select2/dataAdapter/CustomData');
            } else {
                //check format and convert x-editable format to select2 format (if needed)
                this.sourceData = this.convertSource(source);
                options.select2.data = this.sourceData;
            }
        }

        //overriding objects in config (as by default jQuery extend() is not recursive)
        this.options.select2 = $.extend({}, Constructor.defaults.select2, options.select2);

        //detect whether it is multi-valued
        this.isMultiple = this.options.select2.tags || this.options.select2.multiple;
        this.isRemote = ('ajax' in this.options.select2);

        //store function returning ID of item
        //should be here as used inautotext for local source
        this.idFunc = this.options.select2.id;
        if (typeof(this.idFunc) !== "function") {
            var idKey = this.idFunc || 'id';
            this.idFunc = function (e) { return e[idKey]; };
        }

        //store function that renders text in select2
        this.formatSelection = this.options.select2.formatSelection;
        if (typeof(this.formatSelection) !== "function") {
            this.formatSelection = function (e) { return e.text; };
        }
    };

    $.fn.editableutils.inherit(Constructor, $.fn.editabletypes.abstractinput);

    $.extend(Constructor.prototype, {
        render: function() {
            this.setClass();
            if (this.options.select2.multiple)
            {
                this.$input.attr('multiple', 'multiple');
            } else if (this.options.select2.placeholder) {
                // for single selects with placeholder
                // add a blank <option> as the first option
                var option = new Option('', '', false, false);
                // Append it to the select
                this.$input.append(option);
            }
            //can not apply select2 here as it calls initSelection
            //over input that does not have correct value yet.
            //apply select2 only in value2input
            //this.$input.select2(this.options.select2);

            //when data is loaded via ajax, we need to know when it's done to populate listData
            if(this.isRemote) {
                //listen to loaded event to populate data
                this.$input.on('results:all', $.proxy(function(e) {
                    this.sourceData = e.items.results;
                }, this));
            }

            //trigger resize of editableform to re-position container in multi-valued mode
            if(this.isMultiple) {
                this.$input.on('change', function() {
                    $(this).closest('form').parent().triggerHandler('resize');
                });
            }
       },

       value2html: function(value, element) {
            var text = '', data,
                that = this;

            if(this.options.select2.tags) { //in tags mode just assign value
                data = value;
                //data = $.fn.editableutils.itemsByValue(value, this.options.select2.tags, this.idFunc);
            } else if(this.sourceData) {
                data = $.fn.editableutils.itemsByValue(value, this.sourceData, this.idFunc);
            } else if(this.$input) { // false initially when isRemote
                data = this.$input.find(':selected').toArray();
                //can not get list of possible values
                //(e.g. autotext for select2 with ajax source)
            } else {
                return;
            }

            //data may be array (when multiple values allowed)
            if($.isArray(data)) {
                //collect selected data and show with separator
                text = [];
                $.each(data, function(k, v){
                    text.push(v && typeof v === 'object' ? that.formatSelection(v) : v);
                });
            } else if(data) {
                text = that.formatSelection(data);
            }

            text = $.isArray(text) ? text.join(this.options.viewseparator) : text;

            //$(element).text(text);
            Constructor.superclass.value2html.call(this, text, element);
        },

        html2value: function(html) {
            return this.options.select2.tags ? this.str2value(html, this.options.viewseparator) : null;
        },

        value2input: function(value) {

            //for remote source just set value, text is updated by initSelection
            if (this.$input.data('select2') == null) {
                if (value != null && this.isRemote && !this.options.select2.tags)
                {
                    var optionvalues = value;
                    if(!$.isArray(optionvalues))
                    {
                        optionvalues = [optionvalues];
                    }

                    var optiontexts = $(this.scope).text().split(this.options.viewseparator);
                    optionvalues.forEach(function(val, index) {
                        var option = new Option(optiontexts[index], val, true, true);
                        // Append it to the select
                        this.$input.append(option);
                    }.bind(this));
                }
                this.$input.select2(this.options.select2);
            }

            if (!this.isRemote)
            {
                //second argument needed to separate initial change from user's click (for autosubmit)
                this.$input.val(value).trigger('change', true);
            }

            // if defined remote source AND no multiple mode AND no user's initSelection provided -->
            // we should somehow get text for provided id.
            // The solution is to use element's text as text for that id (exclude empty)
            if(this.isRemote && !this.isMultiple && !this.options.select2.initSelection && false) {
                // customId and customText are methods to extract `id` and `text` from data object
                // we can use this workaround only if user did not define these methods
                // otherwise we cant construct data object
                var customId = this.options.select2.id,
                    customText = this.options.select2.formatSelection;

                if(!customId && !customText) {
                    var $el = $(this.options.scope);
                    if (!$el.data('editable').isEmpty) {
                        var newOption = new Option($el.text(), value, false, false);
                        this.$input.append(newOption).trigger('change');
                    }
                }
            }
        },

        input2value: function() {
            return this.$input.val();
        },

        str2value: function(str, separator) {
            if(typeof str !== 'string' || !this.isMultiple) {
                return str;
            }

            separator = separator || this.options.separator;

            var val, i, l;

            if (str === null || str.length < 1) {
                return null;
            }
            val = str.split(separator);
            for (i = 0, l = val.length; i < l; i = i + 1) {
                val[i] = $.trim(val[i]);
            }

            return val;
        },

        autosubmit: function() {
            this.$input.on('change', function(e, isInitial){
                if(!isInitial) {
                  $(this).closest('form').submit();
                }
            });
        },

        /*
        Converts source from x-editable format: {value: 1, text: "1"} to
        select2 format: {id: 1, text: "1"}
        */
        convertSource: function(source) {
            if($.isArray(source) && source.length && source[0].value !== undefined) {
                for(var i = 0; i<source.length; i++) {
                    if(source[i].value !== undefined) {
                        source[i].id = source[i].value;
                        delete source[i].value;
                    }
                }
            }
            return source;
        },

        // see: https://github.com/vitalets/x-editable/pull/953
        activate: function() {
            //this.$input.val($(this.options.scope).data('editable').value).trigger('change');
            this.$input.select2('focus');
        },

        destroy: function() {
            if(this.$input) {
                if(this.$input.data('select2')) {
                    this.$input.select2('destroy');
                }
            }
        }

    });

    Constructor.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        @property tpl
        @default <input type="hidden">
        **/
        tpl:'<select></select>',
        /**
        Configuration of select2. [Full list of options](http://ivaynberg.github.com/select2).

        @property select2
        @type object
        @default null
        **/
        select2: {
            //commented due to failing test, running `grunt test3`
            //dropdownParent: '.popover:last',
            width: '100%',
            dropdownAutoWidth: true,
        },
        /**
        Placeholder attribute of select

        @property placeholder
        @type string
        @default null
        **/
        placeholder: null,
        /**
        Source data for select. It will be assigned to select2 `data` property and kept here just for convenience.
        Please note, that format is different from simple `select` input: use 'id' instead of 'value'.
        E.g. `[{id: 1, text: "text1"}, {id: 2, text: "text2"}, ...]`.

        @property source
        @type array|string|function
        @default null
        **/
        source: null,
        /**
        Source type: If source is a string, treat it as a 'url' or 'json' encoded data.

        @property sourceType
        @type string
        @default null
        **/
        sourceType: 'url',
        /**
        Separator used to parse values.

        @property separator
        @type string
        @default ','
        **/
        separator: ',',

        /**
        @property viewseparator
        @type string
        @default ', '
        **/
        viewseparator: ', '
    });

    $.fn.editabletypes.select2 = Constructor;
}(window.jQuery));
