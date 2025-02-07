/*
Loads all js files via require.js
*/
define(function () {
         
    function loadCss(url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    };     
                
    return {
        loadCss: loadCss,
        getConfig: function (baseUrl) {

            var
                params = this.getParams(),
                f = params.f, 
                c = params.c;            
                  
            var 
                jqueryui_ver = '1.10.3',
            //    jqueryui_ver = '1.9.1',
                bs3_ver = '300',
                bs4_ver = '400',
                bs5_ver = '500',
                //path aliases
                paths = {
                    "bootstrap": "../test/libs/bootstrap"+({'bootstrap3': bs3_ver, 'bootstrap4': bs4_ver, 'bootstrap5': bs5_ver}[f]), 
                    
                  //  "jqueryui": "../test/libs/jquery-ui-"+jqueryui_ver+".custom", 
                    "jqueryui_js": "../test/libs/jquery-ui-"+jqueryui_ver+".custom/js/jquery-ui-"+jqueryui_ver+".custom", 
                     
                    "dateui_js": "inputs/dateui/jquery-ui-datepicker/js/jquery-ui-"+jqueryui_ver+".custom",
                    
                    "poshytip": "../test/libs/poshytip",
                    "moment": "../test/libs/moment/moment",

                    "test": "../test" 
                },          
          
                shim = {
                'containers/editable-container': {
                    deps: ['require', 'editable-form/editable-form-utils', 'editable-form/editable-form'],
                    init: function(require) {
                        loadCss(require.toUrl("./editable-container.css")); 
                    }                  
                },  
                
                //inline container
                'containers/editable-inline': ['containers/editable-container'],                
                 
                'element/editable-element': {
                    deps: ['require'], //here should be dynamically added container
                    init: function(require) {
                        loadCss(require.toUrl("./editable-element.css")); 
                    }                         
                },
                /*
                common inputs
                */
                'editable-form/editable-form': {
                    deps: ['require',
                    'inputs/text',
                    'inputs/textarea',
                    'inputs/select',
                    'inputs/checklist',
                    'inputs/html5types',
                    'inputs/combodate/combodate',
                    'inputs-ext/address/address',
                    'inputs/select2/select2'],
                    init: function(require) {
                        loadCss(require.toUrl("./editable-form.css")); 
                    }      
                },
                'inputs/select': ['inputs/list'],
                'inputs/checklist': ['inputs/list'],
                'inputs/list': ['inputs/abstract'],
                'inputs/text': ['inputs/abstract'],
                'inputs/textarea': ['inputs/abstract'],
                'inputs/abstract': ['editable-form/editable-form-utils'],   
                'inputs/html5types': ['inputs/text'], 
                'inputs/combodate/combodate': ['inputs/abstract', 'inputs/combodate/lib/combodate'/*, 'moment'*/],
                //moment 1.7.2
                //'inputs/combodate/combodate': ['inputs/abstract', 'inputs/combodate/lib/combodate', 'inputs/combodate/lib/moment.min.1.7.2'],
                'inputs/typeahead': ['inputs/list'],  


                /* ------------------------------
                   bootstrap
                   ------------------------------ */                 
                'bootstrap/js/bootstrap': {
                    deps: ['require'],
                    init: function(require) {
                        loadCss(require.toUrl("../css/bootstrap.css")); 
                        //add responsive css for bs2
                        if(f === 'bootstrap2') {
                           loadCss(require.toUrl("../css/bootstrap-responsive.css"));
                        } 
                    }                
                },
                'editable-form/editable-form-bootstrap': [
                    'editable-form/editable-form', 
                    'bootstrap/js/bootstrap'
                ],
                'editable-form/editable-form-bootstrap3': [
                    'editable-form/editable-form', 
                    'bootstrap/js/bootstrap'
                ],
                'editable-form/editable-form-bootstrap4': [
                    'editable-form/editable-form', 
                    'bootstrap/js/bootstrap'
                ],
                'editable-form/editable-form-bootstrap5': [
                    'editable-form/editable-form', 
                    'bootstrap/js/bootstrap'
                ],
                'containers/editable-popover': [
                    'containers/editable-inline', 
                    'bootstrap/js/bootstrap'
                ],
                'containers/editable-popover3': [
                    'containers/editable-inline', 
                    'bootstrap/js/bootstrap'
                ],
                'containers/editable-popover4': [
                    'containers/editable-inline', 
                    'bootstrap/js/bootstrap'
                ],
                'containers/editable-popover5': [
                    'containers/editable-inline', 
                    'bootstrap/js/bootstrap'
                ],
                'inputs/date/date': {
                    deps: ['require', 
                    'bootstrap/js/bootstrap',
                    'inputs/abstract', 
                    'inputs/datetime/tempusdominus/js/tempusdominus-bootstrap-4',
                    'moment'],
                    init: function(require) {
                        loadCss(require.toUrl("../datetime/tempusdominus/css/tempusdominus-bootstrap-4.css"));
                    }
                },
                'inputs/datetime/datetime': {
                    deps: ['require', 
                    'bootstrap/js/bootstrap',
                    'inputs/abstract', 
                    'inputs/datetime/tempusdominus/js/tempusdominus-bootstrap-4',
                    'moment'],
                    init: function(require) {
                        loadCss(require.toUrl("./tempusdominus/css/tempusdominus-bootstrap-4.css")); 
                    }
                },

                //wysihtml5
//                'inputs-ext/wysihtml5/bootstrap-wysihtml5-0.0.2/bootstrap-wysihtml5-0.0.2.min': ['inputs-ext/wysihtml5/bootstrap-wysihtml5-0.0.2/wysihtml5-0.3.0.min'],
                'inputs-ext/wysihtml5/bootstrap-wysihtml5-0.0.2/bootstrap-wysihtml5-0.0.2': ['inputs-ext/wysihtml5/bootstrap-wysihtml5-0.0.2/wysihtml5-0.3.0'],
                'inputs-ext/wysihtml5/wysihtml5': {
                    deps: ['require', 
                    'bootstrap/js/bootstrap',
                    'inputs/abstract', 
//                    'inputs-ext/wysihtml5/bootstrap-wysihtml5-0.0.2/bootstrap-wysihtml5-0.0.2.min'],
                    'inputs-ext/wysihtml5/bootstrap-wysihtml5-0.0.2/bootstrap-wysihtml5-0.0.2'],
                    init: function(require) {
                        loadCss(require.toUrl("./bootstrap-wysihtml5-0.0.2/bootstrap-wysihtml5-0.0.2.css")); 
                        //loadCss(require.toUrl("./bootstrap-wysihtml5-0.0.2/wysiwyg-color.css")); 
                    }
                },
                
                //select2
                'inputs/select2/select2': {
                    deps: ['require', 
                    'inputs/select2/lib/js/select2',
                    'inputs/abstract'], 
                    init: function(require) {
                        loadCss(require.toUrl("./lib/css/select2.css")); 
                        if (f === 'bootstrap2' || f === 'bootstrap3' || f === 'bootstrap4' || f === 'bootstrap5') {
                            loadCss(require.toUrl("./lib/select2-bootstrap.css"));
                        } 
                    }
                },                
                
                //datefield
                'inputs/date/datefield': ['inputs/date/date'],

                //datetimefield
                'inputs/datetime/datetimefield': ['inputs/datetime/datetime'],

                /* ------------------------------
                   jqueryui
                   ------------------------------ */ 
                'jqueryui_js': {
                    deps: ['require'],
                    //temp: test simultaneous jquery-ui with bootstrap
                    //deps: ['require', 'bootstrap/js/bootstrap'],
                    init: function(require) {
                        //loadCss(require.toUrl("../css/redmond/jquery-ui-1.10.1.custom.css")); 
                        loadCss(require.toUrl("../test/libs/jquery-ui-"+jqueryui_ver+".custom/css/redmond/jquery-ui-"+jqueryui_ver+".custom.css")); 
                    }                
                },  
                'editable-form/editable-form-jqueryui': [
                    'editable-form/editable-form', 
                    'jqueryui_js'
                ],            
                'containers/editable-tooltip': [
                    'containers/editable-inline', 
                    'jqueryui_js'
                ],                      
                'inputs/dateui/dateui': ['inputs/abstract'],
                'inputs/dateui/dateuifield': ['inputs/dateui/dateui'],


                /* ------------------------------
                   plain
                   ------------------------------ */                 
                'containers/editable-poshytip': [ 
                    'containers/editable-inline', 
                    'poshytip/jquery.poshytip'
                ],
                'poshytip/jquery.poshytip': {
                    deps: ['require'],
                    init: function(require) {
                        loadCss(require.toUrl("./tip-yellowsimple/tip-yellowsimple.css")); 
                    }                
                },
                'dateui_js': {
                    deps: ['require'],
                    init: function(require) {
                        //loadCss(require.toUrl('../css/redmond/jquery-ui-'+jqueryui_ver+'.custom.css')); 
                        loadCss(require.toUrl('inputs/dateui/jquery-ui-datepicker/css/redmond/jquery-ui-'+jqueryui_ver+'.custom.css')); 
                    } 
                },
                                         

                /* ------------------------------
                   inputs-ext
                   ------------------------------ */                  
                'inputs-ext/address/address': {
                    deps: ['require', 'inputs/abstract'],
                    init: function(require) {
                        loadCss(require.toUrl("./address.css")); 
                    }
                },
                'inputs-ext/typeaheadjs/typeaheadjs': { 
                    deps: [
                        'require',
                        'inputs/text',
                        'inputs-ext/typeaheadjs/lib/typeahead'
                    ],
                    init: function(require) {
                        loadCss(require.toUrl("./lib/typeahead.js-bootstrap.css")); 
                    }
                }
            };

            /*
             modify shim for bootstrap, jqueryui or plain
            */
             if(f === 'bootstrap5') { 
                //bootstrap 5
                shim['editable-form/editable-form'].deps = shim['editable-form/editable-form'].deps.concat( 
                 [
                  'inputs/date/datefield',
                  'inputs/datetime/datetimefield',
                  'inputs-ext/typeaheadjs/typeaheadjs'
                  //'inputs-ext/wysihtml5/wysihtml5',
                  //'inputs/typeahead'
                 ]);

                shim['element/editable-element'].deps.push('editable-form/editable-form-bootstrap5');
                shim['element/editable-element'].deps.push('containers/editable-popover5');
            } else if(f === 'bootstrap4') { 
                //bootstrap 4
                shim['editable-form/editable-form'].deps = shim['editable-form/editable-form'].deps.concat( 
                 [
                  'inputs/date/datefield',
                  'inputs/datetime/datetimefield',
                  'inputs-ext/typeaheadjs/typeaheadjs'
                  //'inputs-ext/wysihtml5/wysihtml5',
                  //'inputs/typeahead'
                 ]);

                shim['element/editable-element'].deps.push('editable-form/editable-form-bootstrap4');
                shim['element/editable-element'].deps.push('containers/editable-popover4');
            } else if(f === 'bootstrap3') { 
                //bootstrap 3
                shim['editable-form/editable-form'].deps = shim['editable-form/editable-form'].deps.concat( 
                 [
                  'inputs/date/datefield',
                  'inputs/datetime/datetimefield',
                  'inputs-ext/typeaheadjs/typeaheadjs'
                  //'inputs-ext/wysihtml5/wysihtml5',
                  //'inputs/typeahead'
                 ]);

                shim['element/editable-element'].deps.push('editable-form/editable-form-bootstrap3');
                shim['element/editable-element'].deps.push('containers/editable-popover3');
            } else if(f === 'bootstrap2') { 
                //bootstrap 2
                shim['editable-form/editable-form'].deps = shim['editable-form/editable-form'].deps.concat( 
                 [
                  'inputs/date/datefield',
                  'inputs/datetime/datetimefield',
                  'inputs-ext/wysihtml5/wysihtml5',
                  'inputs/typeahead'
                 ]);
                shim['element/editable-element'].deps.push('editable-form/editable-form-bootstrap');
                shim['element/editable-element'].deps.push('containers/editable-popover');
            } else if(f === 'jqueryui') {
                //jqueryui
                shim['editable-form/editable-form'].deps.push('inputs/dateui/dateuifield');
                shim['element/editable-element'].deps.push('editable-form/editable-form-jqueryui');
                shim['element/editable-element'].deps.push('containers/editable-tooltip');
            } else {    
                //plain
                shim['editable-form/editable-form'].deps.push('inputs/dateui/dateuifield');
                shim['inputs/dateui/dateui'].push('dateui_js');
                shim['element/editable-element'].deps.push('containers/editable-poshytip');        
            }  
            
            
            /*
             return requirejs config
            */            
            
            return {
                baseUrl: baseUrl,
                paths: paths,
                shim: shim,
                map: {
                    // For all modules, if they ask for 'moment', use 'moment-adapter'
                    '*': {
                        'moment': 'moment-adapter'
                    },
                    // However, for moment-adapter, and moment/ modules, give them the
                    // real 'moment*' modules.
                    'moment-adapter': {
                        'moment': 'moment'
                    },
                    'moment': {
                        'moment': 'moment'
                    },
                }
            };  
        },

        getParams: function() {
            var url = window.location.href, f, c;
            if(url.match(/f=jqueryui/i)) { 
                f = 'jqueryui';
            } else if(url.match(/f=plain/i)) {
                f = 'plain';
            } else if(url.match(/f=bootstrap5/i) || url.match(/f=bs5/i)) {
                f = 'bootstrap5';
            } else if(url.match(/f=bootstrap4/i) || url.match(/f=bs4/i)) {
                f = 'bootstrap4';
            } else if(url.match(/f=bootstrap3/i) || url.match(/f=bs3/i)) {      
                f = 'bootstrap3';
            } else {      
                f = 'bootstrap3';
            }
            c = url.match(/c=inline/i) ? 'inline' : 'popup';
            return {f: f, c: c};
        }
    }
});