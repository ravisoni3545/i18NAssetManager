define(["text!templates/contact.html", "backbone","models/contactModel","app",
        "collections/contactCollection","views/statesView","views/codesView","text!templates/vendorEditContact.html"],
		function(contactPage, Backbone, contactmodel,app,contacts,statesView,codesView,editContagePage){

	var ContactView = Backbone.View.extend( {
		initialize: function(){
			var ad = this;
			this.statesView = new statesView();
			this.codesView = new codesView({codeGroup:'CONTACT_TYPE'});
			
		},

		model : {},
		models:{},
		el:"#contactsTab",
		self:this,
		collection:null,
		updateContactModel:null,

		events          : {
			'click #addContact'           : 'submitContactForm',
			'click #confirmDeleteContact'  : 'deleteContact',
			'change #copyPrimaryContact' :'populateExistingPrimaryContact',
			'click #editContact' : 'updateContact',
			'change select[name=contactStatusId]' : 'showAddresses',
			'click .editContact'	: 'editContactPopUp' ,
			'click .deleteContact': 'openDeleteContact',
			

		},
		

		render : function () {
			
			var thisPtr=this;
			if(this.objectId){
				thisPtr.collection.fetch({async:false,
					success: function (data) {
						thisPtr.models=data.models;
					},
					error   : function () {
						$('#alertFailure').show();
					}
				});
			}
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
			//$('#editContactButton').unbind('click');
            $('.hopNameTooltip').tooltip({
                animated: 'fade',
                placement: 'left'
            });
            if($.inArray('NPIManagement', app.sessionModel.attributes.permissions)==-1){
	    		 $(".dob").remove();
				 $(".ssn").remove();
			}
            ComponentsPickers.init();
			return this;
		},
		
		submitContactForm:function(){
			var self = this;

			if ($('#contactForm').validate().form()){
				var contactModel=new contactmodel();
				var unindexed_array = $('#contactForm').serializeArray();
				$.map(unindexed_array, function(n, i){
					var value=n['value'];
					var name=n['name'];
					contactModel.set(name,value);
				});
				//contactModel.set("contactType",$("#status").val());

				contactModel.saveContact(self.object,self.objectId, contactModel,{
					success : function ( mod, res ) {

//						console.log(JSON.stringify(self.model));
						/*if(app.mypropertyView){
							app.mypropertyView.contactView.collection.add(contactModel);
						}
						else if(app.closingView){
							app.closingView.contactView.collection.add(contactModel);
						}*/
						self.collection.add(contactModel);
						self.render();
						
						$("#contact").parent().addClass('active');
						$("#contactsTab").addClass("active");
						$('body').removeClass('modal-open');

						$('.modal-backdrop').remove();
						self.trigger('ContactChanged');
					},
					error   : function ( mod, res ) {
						$('#formAlertFailure').show();
						$('#formAlertFailure').delay(2000).fadeOut(4000);
					}
				});
			}

		},    

		editContactPopUp : function(evt) {
			console.log($(evt.target));
			var contactId= $(evt.target).data('contactid');
			var contact = this.collection.findWhere({contactId: contactId});
			this.updateContactModel=contact;
			
			$('#edit-contact').html(_.template( editContagePage )({model:contact}));
			this.statesView.render({el:$('#states2')});
			$('.states').val(contact.attributes.state);
			this.codesView.callback=function() {
				$('#status_edit select[name=contactStatusId]').val(contact.attributes.contactStatusId);
			}
			this.codesView.render({el:$('#status_edit'),codeParamName:"contactStatusId"});
			$('#status_edit select[name=contactStatusId]').val(contact.attributes.contactStatusId);
			if(contact.attributes.contactStatusId == "51"){
				$('#status_edit select[name=contactStatusId]').attr("disabled","disabled").hide();
				$('#status_edit').append('<input type="text" value="Co-Buyer" class="form-control" disabled="">');
			}
			this.applyPermissions();
			this.editContactFormValidation();
			if($.inArray('NPIManagement', app.sessionModel.attributes.permissions)==-1){
	    		 $(".dob").remove();
				 $(".ssn").remove();
			}
			ComponentsPickers.init();
			$("#edit-contact-form").modal("show");
		},

		deleteContact : function() {
			var self=this;
			var contactModel = this.collection.findWhere({contactId: this.contactIdToBeDeleted});
			var status="0";
            $.ajax({
                url: app.context()+ '/contact/checkContact/'+this.contactIdToBeDeleted,
                contentType: 'application/json',
                dataType:'json',
                async:false,
                type: 'GET',
                success: function(res){
                	status=res.statusCode;
                },
                error: function(res){
                	console.log("error");
                	 $('#alertFailure').show();
                	 App.scrollTo($('#alertFailure'), -200);
 					 $('#alertFailure').delay(2000).fadeOut(2000);
                }
            });
            if(status=="1"){
               $('#alertFailureVendor').show();
//			   $('#alertFailure > text').html("Vendor contact must be deleted from Vendor Profile.");
			   App.scrollTo($('#alertFailureVendor'), -200);
			   $('#alertFailureVendor').delay(2000).fadeOut(2000);
			   
            }else if(status=="2"){
            	contactModel.deleteContact(contactModel,{
    				success : function ( mod, res ) {
    					self.render();
                    	self.trigger('ContactChanged');
    					/*$("#contact").parent().addClass('active');
           	    	 	$("#contactTab").addClass("active");*/
    				},
    				error   : function ( mod, res ) {
    		            $('#alertFailure').show();
    					App.scrollTo($('#alertFailure'), -200);
    					$('#alertFailure').delay(2000).fadeOut(2000);
    				}
    			});
       		}

			$('#form-delete1').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
		},

		populateExistingPrimaryContact: function() {
			var contact = this.collection.findWhere({contactType: 'Primary Contact'});
			var msgVal=$("select[name=contactStatusId] option:selected").val();

			if(contact!==null){
				for(attr in contact.attributes) {
					var formElement = $('[name='+attr+']');
					if(attr == 'phoneHome' && contact.get(attr) == null){
						attr = 'phoneMobile';
					}
					if(formElement) {
						formElement.val(contact.get(attr));
					}
				}
			}
			$("select[name=contactStatusId]").val(msgVal);

		},

		contactFormValidation: function() {

			var form1 = $('#contactForm');
			var error1 = $('#formAlertFailure', form1);
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
		//var msg=$("select[name=contactStatusId] option:selected").text().trim();
		//	var msgVal=$("select[name=contactStatusId] option:selected").val();
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
				//$("select[name=contactStatusId]").val(msgVal);
				$(evt.currentTarget).val(msgVal);
				
			}

		},

		openDeleteContact: function(evt){
			this.contactIdToBeDeleted= $(evt.target).data('contactid');
		},

		applyPermissions : function() {
			var self=this;
			
				if(self.object=='Asset' && $.inArray('AssetManagement', app.sessionModel.attributes.permissions)==-1){
					$('#addPopUp').remove();
					$('#editContact').remove();
					$('.deleteContact').remove();
				}
				else if(self.object=='Investment' && $.inArray('ClosingManagement', app.sessionModel.attributes.permissions)==-1){
					$('#addPopUp').remove();
					$('#editContact').remove();
					$('.deleteContact').remove();
				}	else if(self.object=='Rehab' && $.inArray('RehabManagement', app.sessionModel.attributes.permissions)==-1){
					$('#addPopUp').remove();
					$('#editContact').remove();
					$('.fa-edit').remove();
					$('.deleteContact').remove();
				}
		},
		
		updateContact:function(){
			var self = this;
			if ($('#editContactForm').validate().form()){
				var contactModel=self.updateContactModel;
				var unindexed_array = $('#editContactForm').serializeArray();
				$.map(unindexed_array, function(n, i){
					var value=n['value'];
					var name=n['name'];
					contactModel.set(name,value);
				});
				//contactModel.set("contactType",$("#status").val());

				contactModel.editContact(contactModel,{
                    success : function ( mod, res ) {

                    	$("#contact").parent().addClass('active');
           	    	 	$("#contactTab").addClass("active");
            	    	 	
           	    	 	$('body').removeClass('modal-open');
           	    	 	$('.modal-backdrop').remove();
           	    	 	self.render();
           	    	 	self.trigger('ContactChanged');
                    },
                    error   : function ( mod, res ) {
                    	$('#editFormAlertFailure').show();
						$('#editFormAlertFailure').delay(2000).fadeOut(2000);
                    }
                });
			}
		},
		
		editContactFormValidation: function() {

			var form1 = $('#editContactForm');
			var error1 = $('#editFormAlertFailure', form1);
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

		}
	});
	return ContactView;
});