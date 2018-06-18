define(["text!templates/vendorContact.html", "backbone","models/vendorContactModel","app","collections/contacts","views/vendorEditContactView","views/statesView","views/codesView"],
	function(contactPage, Backbone, vendorcontactmodel,app,contacts,vendorEditContactView,statesView,codesView){

		var VendorContactView = Backbone.View.extend( {
		initialize: function(){
			var ad = this;
			this.statesView = new statesView();
			this.codesView = new codesView({codeGroup:'CONTACT_TYPE'});
			//$('#contact-form1').modal({show: false});
		},
		
		model : {},
		models:{},
		el:"#contactTab",
		self:this,
		collection:null,

		events          : {
			 'click #addContact': 'submitContactForm',
			 'change .codeType' : 'showAddresses',
			'click .editContact'	: 'editContact' ,
			'click .deleteContact': 'openDeleteContact',
			'click #confirmDeleteVendor'  : 'deleteContact',
			'change #copyPrimaryContact' :'populateExistingPrimaryContact'
				 
	        },
	        addRow : function(){
	        	var thisPtr=this;
	        	if(app.vendorId){
	        	thisPtr.collection.fetch({
	                success: function (data) {
                	
                	thisPtr.models=data.models;
                	thisPtr.render();               
	                },
	                error   : function () {
                    	$('.alert-danger').show();
                    }
	            });
	        	}
	        	else{
	        		thisPtr.render();
	        	}

	        },
	        submitContactForm:function(){
		    	 var self = this;
		    	 
		    	 if ($('#contactForm').validate().form()){
			    	 var contactModel=new vendorcontactmodel();
			    	    var unindexed_array = $('#contactForm').serializeArray();
			    	    $.map(unindexed_array, function(n, i){
			    	    	var value=n['value'];
			    	    	var name=n['name'];
			    	    	contactModel.set(name,value);
			    	    });
			    	    //contactModel.set("contactType",$("#status").val());
			    	    
			    	    contactModel.saveVendorContact(contactModel,{
		                    success : function ( mod, res ) {
		                    	//app.vendorId=res.orgId;
		                    	//app.vendorCompanyModel.set("orgId",res.orgId);
		                    	
		                    	app.homeView.contactView.collection.add(contactModel);
		                    	self.addRow();
		                    	$("#contact").parent().addClass('active');
		           	    	 	$("#contactTab").addClass("active");
		           	    	 	$('body').removeClass('modal-open');
	
		           	    	 	$('.modal-backdrop').remove();
		                    },
		                    error   : function ( mod, res ) {
		                    	$('.alert-danger').show();
		                    }
		                });
	        }

		     },    
	 
		render : function () {
			this.template = _.template( contactPage );
			
			this.$el.html("");
		
			data=this.models;
			if(data==null){
				data="";
			}
			
			this.$el.html(this.template({contactModels:data}));
			this.statesView.render({el:$('#states')});
			this.codesView.render({el:$('#status'),codeParamName:"contactStatusId"});
			this.contactFormValidation();
			this.applyPermissions();
			 if($.inArray('NPIManagement', app.sessionModel.attributes.permissions)==-1){
	    		 $(".dob").remove();
				 $(".ssn").remove();
			}
            ComponentsPickers.init();
			return this;
		},
		
		editContact : function(evt) {
			console.log($(evt.target));
			var contactId= $(evt.target).data('contactid');
					
			var contact = this.collection.findWhere({contactId: contactId});
			
			if(app.editView && app.editView.close){
				app.editView.close();
			}
			app.editView= new vendorEditContactView({model:contact});
			//app.editView.model=contact;
			//editView.render();
			app.editView.setElement( $("#edit-contact") ).render(); 
			
			$('.states').val(contact.attributes.state);
			$('#status_edit select[name=contactStatusId]').val(contact.attributes.contactStatusId);
			if($.inArray('NPIManagement', app.sessionModel.attributes.permissions)==-1){
	    		 $(".dob").remove();
				 $(".ssn").remove();
			}
			ComponentsPickers.init();
			$('#edit-contact-form').modal('show');
		},
		
		deleteContact : function() {
			var self=this;
			var contactModel = this.collection.findWhere({contactId: this.contactIdToBeDeleted});
			
			contactModel.deleteVendorContact(contactModel,{
                success : function ( mod, res ) {
                	self.addRow();
                	/*$("#contact").parent().addClass('active');
       	    	 	$("#contactTab").addClass("active");*/
                },
                error   : function ( mod, res ) {
                	$('.alert-danger').show();
                }
            });
			//$('#form-delete1').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
		},
		
		populateExistingPrimaryContact: function() {
			var contact = this.collection.findWhere({contactType: 'Primary Contact'});
			var msgVal=$(".codeType option:selected").val();
			
			if(contact!==null){
				for(attr in contact.attributes) {
		    		 var formElement = $('[name='+attr+']');
		    		 if(formElement) {
		    			 formElement.val(contact.get(attr));
		    		 }
		    	 }
			}
			$(".codeType").val(msgVal);

	     },
		
		contactFormValidation: function() {

	             var form1 = $('#contactForm');
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

		showAddresses: function(evt) {
			//var msg=$(".codeType option:selected").text().trim();
			//var msgVal=$(".codeType option:selected").val();
			var msg=$(evt.currentTarget.selectedOptions).text().trim();
			var msgVal=$(evt.currentTarget).val();
			if(msg=="Primary Contact")
			{
			$("#primaryco").show();
			$("#billingco").hide();
			}
			else if(msg=="Billing Contact")
			{
			$("#primaryco").hide();
			$("#billingco").show();
			}
			else 
			{
			$("#primaryco").hide();
			$("#billingco").hide();
			$('#contactForm')[0].reset();
		//	$(".codeType").val(msgVal);
			$(evt.currentTarget).val(msgVal);
			}

		},
		
		openDeleteContact: function(evt){
			this.contactIdToBeDeleted= $(evt.target).data('contactid');
		},
		
		applyPermissions : function() {
	    	 if($.inArray('VendorManagement', app.sessionModel.attributes.permissions)==-1) {
	    		 $('#addingContact').remove();
	    		 $('.fa-edit').remove();
	    		 $('.deleteContact').remove();
	    	 }
	     }
	});
	return VendorContactView;
});