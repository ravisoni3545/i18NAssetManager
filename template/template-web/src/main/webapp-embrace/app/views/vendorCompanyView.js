define(["text!templates/vendorCompany.html", "backbone","app","models/vendorCompanyModel","views/statesView",
        "views/codesView"],
		function(companyPage, Backbone,app,vendorcompanymodel,statesView,codesView){
	
	var VendorCompanyView = Backbone.View.extend( {
		 initialize: function(){
			 this.statesView = new statesView();
			 this.codesView = new codesView({codeGroup:'ORG_STATUS'});
			},
			el:"#companyTab",
			 model: new vendorcompanymodel(),
			 events : {
		         "click #submitCompanyForm":"submitCompanyForm",
		         "click #resetCompanyForm":"resetCompanyForm"
		     },
		     submitCompanyForm:function(){
		    	 var self = this;
		    	 if ($('#companyForm').validate().form()) {
		    		if(!app.vendorCompanyModel){
		    			app.vendorCompanyModel=self.model;
		    		}
		    	    var unindexed_array = $('#companyForm').serializeArray();
		    	    $.map(unindexed_array, function(n, i){
		    	    	var value=n['value'];
		    	    	var name=n['name']
		    	    	app.vendorCompanyModel.set(name,value);
		    	    });
		    	    
		    	    app.vendorCompanyModel.saveVendor({
	                    success : function ( mod, res ) {
	                    	app.vendorId=res.orgId;
	                    	//app.vendorCompanyModel.set("orgId",res.orgId);
	                    	//self.render();
	                    	//console.log(app);
	                    	$("#company").parent().addClass('active')
	           	    	 	$("#companyTab").addClass("active");
	                    	var success1 = null;
	                    	if (app.vendorUpdateFlow) {
	                    		success1 = $('#updateVendorSuccess', $('#companyForm'));
	                    	} else {
	                    		success1 = $('#createVendorSuccess', $('#companyForm'))
	                    	}
	                    	success1.show();
	                    	$('#createVendorFormError', $('#companyForm')).hide();
	                    	App.scrollTo(success1, -200);
	                    	success1.delay(2000).fadeOut(2000);
	                    	if(!app.vendorUpdateFlow) {
		                    	$('#submitCompanyForm').attr('disabled','disabled');
		                    	$('#resetCompanyForm').attr('disabled','disabled');
	                    	}
	                    },
	                    error   : function ( mod, res ) {
	                    	var error1 = null;
	                    	if (app.vendorUpdateFlow) {
	                    		error1 = $('#updateVendorError', $('#companyForm'));
	                    	} else {
	                    		error1 = $('#createVendorError', $('#companyForm'))
	                    	}
	   		             	error1.show();
	                    	App.scrollTo(error1, -200);
	                    	error1.delay(2000).fadeOut(2000);
	                    }
	                });
		    	 }
		     },
		     resetCompanyForm:function(){
		    	 $('#companyForm')[0].reset();
		    	 $('.alert-danger').hide();
		    	 
		    	 $('.form-group').removeClass('has-error')
		     },
			 render : function () {
			     if(app.vendorUpdateFlow) {
			    	 this.fetchCompanyData();
			     } 
	 	 		 this.template = _.template( companyPage );
		     	 this.$el.html("");
		     	 this.$el.html(this.template());
		     	 this.statesView.render({el:$('#states')});
		     	 this.codesView.render({el:$('#status'),codeParamName:"statusId"});
		     	 if(app.vendorCompanyModel) {
		     		this.populateExistingOrganizationData();
		     	 }
		     	 this.applyPermissions();
		     	 this.companyFormValidation();
		     	 return this;
		     },
		     applyPermissions : function() {
		    	 if($.inArray('VendorManagement', app.sessionModel.attributes.permissions)==-1) {
		    		 $('#buttonsArea').remove();
		    	 }
		     },
		     fetchCompanyData : function() {
		    	 var self = this;
		    	 app.vendorCompanyModel.getVendor({
                    success : function ( mod, res ) {
                    	app.vendorId=res.orgId;
                    	$('#vendorPageHeading').html(res.orgName);
                    	if(app.vendorCompanyModel) {
        		     		self.populateExistingOrganizationData();
        		     	}
                    },
                    error   : function ( mod, res ) {
                    	var error1 = $('#getVendorError', $('#companyForm'))
                    	error1.show();
                    	App.scrollTo(error1, -200);
                    	error1.delay(2000).fadeOut(2000);
                    }
                });
		     },
		     populateExistingOrganizationData: function() {
		    	 for(attr in app.vendorCompanyModel.attributes) {
		    		 var formElement = $('[name='+attr+']');
		    		 if(formElement) {
		    			 formElement.val(app.vendorCompanyModel.get(attr));
		    		 }
		    	 }
		    	 if(!app.vendorUpdateFlow) {
				     $('#submitCompanyForm').attr('disabled','disabled');
	             	 $('#resetCompanyForm').attr('disabled','disabled');
		    	 }
		     },
		     companyFormValidation: function() {
		         // for more info visit the official plugin documentation: 
		             // http://docs.jquery.com/Plugins/Validation

		             var form1 = $('#companyForm');
		             var error1 = $('#createVendorFormError', form1);
		             var success1 = $('.alert-success', form1);

		             form1.validate({
		                 errorElement: 'span', //default input error message container
		                 errorClass: 'help-block', // default input error message class
		                 focusInvalid: false, // do not focus the last invalid input
		                 ignore: "",
		                 rules: {
		                     name: {
		                         minlength: 2,
		                         required: true
		                     },
		                     orgName: {
		                         minlength: 2,
		                         required: true
		                     },
		                     address1: {
		                         minlength: 2,
		                         required: true
		                     },
		 					city: {
		                         minlength: 2,
		                         required: true
		                     },
		 					state: {
		                         minlength: 1,
		                         required: true
		                     },
		                     postalCode: {
		                         minlength: 2,
		                         required: true
		                     },
		 					phone: {
		                         minlength: 2,
		                         required: true
		                     },
		                     email: {
		                         required: true,
		                         email: true
		                     },
		                     url: {
		                         url: true
		                     },
		                     corporateEmail: {
		                         required: false,
		                         email: true
		                     },
		                     number: {
		                         required: true,
		                         number: true
		                     },
		                     digits: {
		                         required: true,
		                         digits: true
		                     },
		                     creditcard: {
		                         required: true,
		                         creditcard: true
		                     },
		                     occupation: {
		                         minlength: 5
		                     },
		                     category: {
		                         required: true
		                     },
		                     taxId: {
		                    	 required: false,
		                     }
		                 },

		                 invalidHandler: function (event, validator) { //display error alert on form submit              
		                     success1.hide();
		                     error1.show();
		                     App.scrollTo(error1, -200);
		                 },

		                 highlight: function (element) { // hightlight error inputs
		                     $(element)
		                         .closest('.form-group').addClass('has-error'); // set error class to the control group
		                 },

		                 unhighlight: function (element) { // revert the change done by hightlight
		                     $(element)
		                         .closest('.form-group').removeClass('has-error'); // set error class to the control group
		                 },

		                 success: function (label) {
		                     label
		                         .closest('.form-group').removeClass('has-error'); // set success class to the control group
		                 }
		             });

		     }

	});
	return VendorCompanyView;
});