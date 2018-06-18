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
	        'bootstrap-hover-dropdown.min':'../assets/js/lib/bootstrap-hover-dropdown.min',
	        'bootstrap-select.min':'../assets/js/lib/bootstrap-select.min',
	        'canvas-to-blob.min':'../assets/js/lib/canvas-to-blob.min',
	        'components-dropdowns':'../assets/js/lib/components-dropdowns',
	        'components-pickers':'../assets/js/lib/components-pickers',
	        'form-fileupload':'../assets/js/lib/form-fileupload',
	        'form-validation':'../assets/js/lib/form-validation',
	        'hide-show':'../assets/js/lib/hide-show',
	        'jquery.blockui.min':'../assets/js/lib/jquery.blockui.min',
	        'jquery.dataTables':'../assets/js/lib/jquery.dataTables',
	        'DT_bootstrap':'../assets/js/lib/modifiedplugins/DT_bootstrap',
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
	        'colorbox' : '../assets/js/lib/jquery.colorbox-min',
	        'xlsx-export':'../assets/modifiedplugins/tableexport/xlsx.core.min',
	        'table-export':'../assets/modifiedplugins/tableexport/tableexport'

	    },

	    // non-AMD lib
	    shim: {
	    	'underscore'            : {deps : ['jquery'], exports  : '_' },
	        'backbone'              : { deps : ['underscore','jquery'], exports : 'Backbone' },
	        'jquery-cookie':["jquery"],
	        "bootstrap.min": ["jquery","jquery-ui-1.10.3.custom.min"],
	        "bootstrap-hover-dropdown.min": ["jquery"],
	        'bootstrap-select.min': ["jquery"],
	        //"DT_bootstrap": ["bootstrap.min"],
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
	        "jquery.multi-select":["jquery"],
	        "app1": ["jquery"],
	        "jquery.form":["jquery"],
	        "polyglot": { exports: 'Polyglot'},
	        "format-currency"       : ["jquery"],
	        "colorbox": ["jquery"]
	    },
    

    mainConfigFile:'loginloader.js',
    name: "loginloader",
    removeCombined: true,
    findNestedDependencies: true,
    out: "loginloader-built.js",

})