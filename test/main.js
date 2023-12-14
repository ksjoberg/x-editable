/*
Loads all required files.
Calls loader.js to get x-editable files with dependencies.
*/

//detect version of jquery from url param, e.g. 'jquery=1.7.2' 
var jqver = decodeURIComponent((new RegExp('[?|&]' + 'jquery' + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    jqurl = jqver ? "http://code.jquery.com/jquery-"+jqver+".min.js" : "libs/jquery/jquery-1.9.1.min.js";
    
require(["loader", jqurl], function(loader) {
    
    var config = loader.getConfig("../src"),
        params = loader.getParams();
    
    //add test specific dependencies
    config.shim['test/mocks'] = ['element/editable-element', 'test/libs/mockjax/jquery.mockjax'];
        
    //as we need to keep order of tests, create shim dependencies automatically
    addTests(config);
    
    requirejs.config(config);

    var locale = 'sv';
    // Use a second config call to set the dynamic path.
    // This allows the above config to be use in an r.js
    // build, which will only look for the first requirejs.config
    // call and which does not support arbitrary execution of
    // code that is needed here to determine the locale.
    // For the build, put in a paths or map config in the r.js
    // build config to point 'moment/calculatedLocale' to the
    // locale module you want bundled in a build, or set the paths
    // config to be 'moment/calculatedLocale': 'empty:' to just
    // skip it for the build and dynamically load it at runtime.
    requirejs.config({
        map: {
            'moment-adapter': {
                // Points the calculatedLocale to the dynamically determined ID.
                'moment/calculatedLocale': 'moment/../locale/' + locale
            }
        }
    });

    // Define this module inline after the two requirejs calls. Or, it could be defined
    // in its own file, an just make it an anonymous define in that case, define(['moment... 
    define('moment-adapter', ['moment', 'moment/calculatedLocale'], function(moment) {
        // ISO-8601, Europe
        moment.updateLocale('en', {
            week : {
                dow : 1, // First day of week is Monday
                doy : 4  // First week of year must contain 4 January (7 + 1 - 4)
             }
        });
        //moment.locale(locale);
        return moment;
    });

    require(['test/unit/api'], 
    function() {
        //disable effects
        $.fx.off = true;
        $.support.transition = false;
        $.fn.editable.defaults.mode = params.c === 'inline' ? 'inline' : 'popup';           
        
        //for some reason qunit's empty of fixture does not call element's `destryed` event
        //and container remains open
        QUnit.testDone(function( details ) {
            $('#qunit-fixture').empty();
        });        
        
        QUnit.load();
        //QUnit.start();
    });
    
    function addTests(config) {
        var custom;
        
        switch(params.f) {
            case 'bootstrap2':
              custom = ['test/unit/datefield', 
                        'test/unit/date', 
                        'test/unit/datetimefield', 
                        'test/unit/datetime', 
                        'test/unit/wysihtml5',
                        'test/unit/typeahead'
                        ];
              break;

            case 'bootstrap3':
              custom = [
                        'test/unit/datefield', 
                        'test/unit/date', 
                        'test/unit/datetimefield', 
                        'test/unit/datetime', 
                        //'test/unit/wysihtml5'
                        'test/unit/typeaheadjs'
                       ];
              break;              

            case 'bootstrap4':
              custom = [
                        'test/unit/datefield', 
                        'test/unit/date', 
                        'test/unit/datetimefield', 
                        'test/unit/datetime', 
                        //'test/unit/wysihtml5'
                        'test/unit/typeaheadjs'
                       ];
              break;

            case 'bootstrap5':
            custom = [
                        'test/unit/datefield', 
                        'test/unit/date', 
                        'test/unit/datetimefield', 
                        'test/unit/datetime', 
                        //'test/unit/wysihtml5'
                        'test/unit/typeaheadjs'
                        ];
            break;

            default:  
              custom = ['test/unit/dateuifield', 'test/unit/dateui'];
        }
        
        var tests = [
            'test/mocks',
            'test/unit/common',
            'test/unit/text',
            'test/unit/textarea',
            'test/unit/select',
            'test/unit/checklist',
            'test/unit/combodate',
            'test/unit/select2'
       ];
       tests = tests.concat(custom);
       tests.push('test/unit/api');
       
       for(var i=0; i<tests.length-1; i++) {
          config.shim[tests[i+1]] = [tests[i]]; 
       }
    }
});


// implement JSON.stringify serialization for IE7
var JSON = JSON || {};
JSON.stringify = JSON.stringify || function (obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"'+obj+'"';
        return String(obj);
    }
    else {
        // recurse array or object
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n]; t = typeof(v);
            if (t == "string") v = '"'+v+'"';
            else if (t == "object" && v !== null) v = JSON.stringify(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
};
