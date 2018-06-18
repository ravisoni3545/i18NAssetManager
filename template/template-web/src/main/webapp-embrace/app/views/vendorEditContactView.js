define(["text!templates/vendorEditContact.html", "backbone","models/vendorContactModel","app","collections/contacts","views/statesView","views/codesView"],
	function(editContactPage, Backbone, vendorcontactmodel,app,contacts,statesView,codesView){

		var EditVendorContactView = Backbone.View.extend( {
		initialize: function(){
			this.statesView = new statesView();
			this.codesView = new codesView({codeGroup:'CONTACT_TYPE'});
		},
		model : {},
	       
		el:"#edit-contact",
		
		events          : {
			 'click #editContact' : 'submitContactForm'
				 
	        },
	      
	        submitContactForm:function(){
		    	 var self = this;
         
		    	 if ($('#editContactForm').validate().form()){
			    	 app.vendorContactModel=this.model;//this.model;
			    	 app.vendorContactModel.set('message','my message');
			    	    var unindexed_array = $('#editContactForm').serializeArray();
			    	    console.log(unindexed_array);
	                    var obj ={};
	                    
			    	    $.map(unindexed_array, function(n, i){
			    	    	console.log(n);
			    	    	var value=n['value'];
			    	    	var name=n['name'];
	
		    	    		app.vendorContactModel.set(name,value);
			    	    });
			    	   
			    	    app.vendorContactModel.editVendorContact(app.vendorContactModel,{
		                    success : function ( mod, res ) {
	
		                    	console.log(app);
		                    	$("#contact").parent().addClass('active');
		           	    	 	$("#contactTab").addClass("active");
		            	    	 	
		           	    	 	$('body').removeClass('modal-open');
		           	    	 	$('.modal-backdrop').remove();
		           	    	 	app.homeView.contactView.addRow();
	
		                    },
		                    error   : function ( mod, res ) {
		                    	$('.alert-danger').show();
		                    }
		                });
			    	    app.homeView.contactView.addRow();
		    	    
		    	 }
		     },
		     
		     contactFormValidation: function() {

	             var form1 = $('#editContactForm');
	             var error1 = $('.alert-danger', form1);
	             var success1 = $('.alert-success', form1);

	             form1.validate({
	                 errorElement: 'span', //default input error message container
	                 errorClass: 'help-block', // default input error message class
	                 focusInvalid: false, // do not focus the last invalid input
	                 ignore: "",
	                 rules: {
	                	 contactName: {
	                         minlength: 2,
	                         required: true
	                     },
	                     phoneHome: {
	                         minlength: 2,
	                         required: true
	                     },
	                     email: {
	                         required: true,
	                         email: true
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

	     },
	 
		render : function () {
		
			this.template = _.template( editContactPage );
			this.$el.html(this.template({model:this.model}));
			this.statesView.render({el:$('#states2')});
			this.codesView.render({el:$('#status_edit'),codeParamName:"contactStatusId"});
			this.contactFormValidation();
			return this;
		}
	});
	return EditVendorContactView;
});