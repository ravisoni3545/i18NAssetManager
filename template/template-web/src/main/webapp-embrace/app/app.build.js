({
	 paths: {

		 'jquery'                     : '../assets/js/lib/jquery',
	        'underscore'            : '../assets/js/lib/underscore',         
	        'backbone'              : '../assets/js/lib/backbone',
	        'text'                  : '../assets/js/lib/text',
	        'jquery-cookie'         :'../assets/js/lib/modifiedplugins/jquery.cookie',
	        'app1':'../assets/js/lib/app1',
	        'bootstrap.min':'../assets/js/lib/bootstrap.min',
	        'bootstrap-datepicker':'../assets/js/lib/bootstrap-datepicker',
	        'bootstrap-datetimepicker':'../assets/js/lib/bootstrap-datetimepicker.min',
	        'bootstrap-hover-dropdown.min':'../assets/js/lib/bootstrap-hover-dropdown.min',
	        'bootstrap-select.min':'../assets/js/lib/bootstrap-select.min',
	        'canvas-to-blob.min':'../assets/js/lib/canvas-to-blob.min',
	        'components-dropdowns':'../assets/js/lib/components-dropdowns',
	        'components-pickers':'../assets/js/lib/components-pickers',
	        'DT_bootstrap':'../assets/js/lib/modifiedplugins/DT_bootstrap',
	        'form-fileupload':'../assets/js/lib/form-fileupload',
	        'form-validation':'../assets/js/lib/form-validation',
	        'hide-show':'../assets/js/lib/hide-show',
	        'jquery.blockui.min':'../assets/js/lib/jquery.blockui.min',
	        'jquery.dataTables':'../assets/js/lib/jquery.dataTables',
	        'jquery.fileupload':'../assets/js/lib/jquery.fileupload',
	        'jquery.fileupload-image':'../assets/js/lib/jquery.fileupload-image',
	        'jquery.fileupload-process':'../assets/js/lib/jquery.fileupload-process',
	        'jquery.fileupload-ui':'../assets/js/lib/jquery.fileupload-ui',
	        'jquery.fileupload-validate':'../assets/js/lib/jquery.fileupload-validate',
	        'jquery.multi-select':'../assets/js/lib/jquery.multi-select',
	        'jquery.slimscroll.min':'../assets/js/lib/jquery.slimscroll.min',
	        'jquery.ui.widget':'../assets/js/lib/jquery.ui.widget',
	        'jquery.uniform.min':'../assets/js/lib/jquery.uniform.min',
	        'jquery.validate.min':'../assets/js/lib/jquery.validate.min',
	        'jquery-ui-1.10.3.custom.min':'../assets/js/lib/jquery-ui-1.10.3.custom.min',
	        'load-image':'../assets/js/lib/load-image',
	        'load-image.min':'../assets/js/lib/load-image.min',
	        'load-image-exif':'../assets/js/lib/load-image-exif',
	        'load-image-ios':'../assets/js/lib/load-image-ios',
	        'load-image-meta':'../assets/js/lib/load-image-meta',
	        'login':'../assets/js/lib/login',
	        'select2.min':'../assets/js/lib/select2.min',
	        'table-managed':'../assets/js/lib/table-managed',
	        'tmpl.min':'../assets/js/lib/tmpl.min',
	        'jquery.form':'../assets/js/lib/modifiedplugins/jquery.form',
	        'polyglot': '../assets/js/lib/polyglot.min',
	        'additional-methods':'../assets/js/lib/additional-methods',
	        'format-currency'       : '../assets/js/lib/jquery.formatCurrency-1.4.0.min',
	        'ckeditor'       : '../assets/js/lib/ckeditor/ckeditor',
	        'flot': '../assets/js/lib/jquery.flot.min',
	        'flot-pie': '../assets/js/lib/jquery.flot.pie.min',
	        'flot-resize': '../assets/js/lib/jquery.flot.resize.min',
	        'fullcalendar': '../assets/js/lib/fullcalendar.min',
	        'moment': '../assets/js/lib/moment.min',
	        'accounting': '../assets/js/lib/accounting.min',
	        'bootstrap-toggle':'../assets/js/lib/bootstrap-toggle.min',
	        'jcarousel' : '../assets/js/lib/jquery.jcarousel.min',
	        //'featherlight' : '../assets/js/lib/featherlight.min',
	        'colorbox' : '../assets/js/lib/jquery.colorbox-min',
	        'd3':'../assets/js/lib/d3.min',
	        'nvd3':'../assets/js/lib/nv.d3.min' ,
	        'sock':'../assets/js/lib/sockjs.min',
	        'stomp':'../assets/js/lib/stomp',
	        /*'table2excel':'../assets/js/lib/modifiedplugins/jquery.table2excel'*/
	        'jszip':'../assets/modifiedplugins/tableexport/jszip',
	        'xlsx-export':'../assets/modifiedplugins/tableexport/xlsx.core.min',
	        'Blob':'../assets/modifiedplugins/tableexport/Blob',
	        'file-saver':'../assets/modifiedplugins/tableexport/FileSaver',
	        'table-export':'../assets/modifiedplugins/tableexport/tableexport',
	        'notify':'../assets/js/lib/notify'
	        
	    },

	    // non-AMD lib
	    shim: {
	    	'underscore'            : {deps : ['jquery'], exports  : '_' },
	        'backbone'              : { deps : ['underscore','jquery'], exports : 'Backbone' },
	        'jquery-cookie':["jquery"],
	        "bootstrap.min": ["jquery","jquery-ui-1.10.3.custom.min"],
	        "bootstrap-hover-dropdown.min": ["jquery"],
	        'bootstrap-select.min': ["jquery"],
	        //'jquery.dataTables':["jquery"],
	        //"DT_bootstrap": ["bootstrap.min","jquery.dataTables"],
	        'jquery.blockui.min':["jquery"],
	        "hide-show": ["jquery"],
	        "jquery.slimscroll.min": ["jquery"],
	        "jquery.validate.min": ["jquery"],        
	        "additional-methods":["jquery.validate.min"],
	        "jquery.fileupload-ui": ["jquery"],
	        "jquery-ui-1.10.3.custom.min": { exports: "$",deps:["jquery"]},
	        "jquery.fileupload": ["jquery"],
	        "load-image": ["jquery"],
	        "jquery.fileupload-process": ["jquery"],
	        "jquery.fileupload-image": ["jquery"],        
	        "jquery.uniform.min": ["jquery"],
	        "select2.min": ["jquery"],
	        "bootstrap-datepicker": ["jquery"],
	        "bootstrap-datetimepicker": ["jquery"],  
	        "jquery.multi-select":["jquery"],
	        "app1": ["jquery"],
	        "jquery.form":["jquery"],
	        "polyglot": { exports: 'Polyglot'},
	        "format-currency"       : ["jquery"],
	        'ckeditor':{
	            deps:['jquery']
	        },
	        "flot":["jquery"],
	        "flot-pie":["jquery","flot"],
	        "flot-resize":["jquery","flot"],
	        "fullcalendar":["jquery"],
	        "moment":["jquery"],
	        "jcarousel": ["jquery"],
	        //"featherlight": ["jquery"],
	        "colorbox": ["jquery"],
	        "bootstrap-toggle":["jquery"],
	        'd3' : { exports: 'd3' },
	        'nvd3' : {
	            exports: 'nv',
	            deps: ['d3']
	        },
	        'xlsx-export':["jszip"],
	        'table-export':["jquery","Blob","file-saver"]
	    },
    

    mainConfigFile:'loader.js',
    name: "loader",
    removeCombined: true,
    findNestedDependencies: true,
    out: "loader-built.js"

})