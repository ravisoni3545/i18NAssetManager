define([
"backbone",
"app",
"text!templates/change_password.html",
"models/userModel"
], function(Backbone,app,changePasswordTpl,userModel){
	var changePasswordView = Backbone.View.extend({

		initialize: function(){
		 },
		 el:"#maincontainer",
		 model:new userModel(),
		 events          : {
	     	//"click #save_password":"updateUserPassword",
	     	"click #cancel":"cancelUserPassword", 
	     	"focus #new_password" : "validatePassword",   
	     	"blur #new_password" : "validatePassword",
	     	"keyup #new_password" : "validatePassword"      
	     },
	     render : function (userID) {

	    	 this.template = _.template( changePasswordTpl );
	     	 this.$el.html("");
	     	 this.$el.html(this.template());
	     	 
	    	 if(userID) {
				 this.userID = userID;
    	  		 app.userModel = new userModel();
    	  		 app.userModel.set("userID",userID);
			 } else {
				 this.userID = null;
			 }
	    	 this.addFormValidations();
	    	 //$("#new_password").dPassword();
	     	 return this;
	     },
	     updateUserPassword : function() {

	     	if(this.userID && $('#changePasswordForm').validate().form()) {
		     	var updateRequestData = {};
		    	updateRequestData.userId = this.userID;
		    	updateRequestData.oldPassword = $('#current_password').val();
		    	updateRequestData.newPassword = $('#new_password').val();
		    	//updateRequestData.confirmPassword = $('#confirm_password').val();
		    	
		    	if(updateRequestData.newPassword == $('#confirm_password').val()){
		    		var self= this;
		    	 	this.model.updatePassword(updateRequestData,
	 				{	success : function ( model, res ) {

	 						var success = $('#alertPasswordChangeSuccess');

	                    	if(res.statusCode == "400")
	                    		success = $('#alertOldPasswordMismatch');
	                    	else if(res.statusCode == "415")
	                    		success = $('#alertNewPasswordPatternFailure');
	                    		
	                    	success.show();
	                    	App.scrollTo(success, -200);
	                    	success.delay(2000).fadeOut(2000);
	                    	self.initialFields();
	                    },
	                    error   : function ( model, res ) {
	                    	var error = $('#alertPasswordChangeFailure');
							error.show();
	                    	App.scrollTo(error, -200);
	                    	error.delay(2000).fadeOut(2000);
	                    	self.initialFields();
	                    }
	                });	
		    	}
		    	else{
		    		var error = $('#alertPasswordMismatchFailure');
					error.show();
                	App.scrollTo(error, -200);
                	error.delay(2000).fadeOut(2000);
		    		this.initialFields();
		    	}		    	

	    	}	
	     },
	     initialFields : function () {

	     	$('#current_password').val("");
	     	$('#new_password').val("");
	     	$('#confirm_password').val("");
	     },
	     cancelUserPassword : function () {
	     	this.render(this.userID);
	     },
	     validatePassword : function (e){
	     	$("#save_password").attr('disabled','disabled');
	     	var pswd = $("#new_password").val();
	     	var isValid = true;

	     	if(pswd.length > 0){
	  
		     	//validate letter
				if ( pswd.match(/[a-z]/) ) {
				    $('#letter').removeClass('invalid').addClass('valid');
				} else {
				    $('#letter').removeClass('valid').addClass('invalid');
				    isValid = false;
				}

				//validate capital letter
				if ( pswd.match(/[A-Z]/) ) {
				    $('#capital').removeClass('invalid').addClass('valid');
				} else {
				    $('#capital').removeClass('valid').addClass('invalid');
				    isValid = false;
				}

				//validate number
				if ( pswd.match(/\d/) ) {
				    $('#number').removeClass('invalid').addClass('valid');
				} else {
				    $('#number').removeClass('valid').addClass('invalid');
				    isValid = false;
				}

				//validate special
				if ( pswd.match(/[!,@,#,$,%,^,&,*,?,_,\-,~]/) ) {
				    $('#special').removeClass('invalid').addClass('valid');
				} else {
				    $('#special').removeClass('valid').addClass('invalid');
				    isValid = false;
				}

				//validate length 
				if (pswd.length >= 8){
					$('#length').removeClass('invalid').addClass('valid');
				}
				else{
					$('#length').removeClass('valid').addClass('invalid');
					isValid = false;
				}
			}
			if(isValid){
				$("#pswd_info").hide();
				$("#save_password").removeAttr('disabled');
			}
			else
				$("#pswd_info").show();
	     },
	     addFormValidations : function () {
	    	var form3 = $('#changePasswordForm');
            var success3 = $('#alertPasswordChangeSuccess', form3);
          	var self= this;
            form3.validate({
            	 errorElement: 'span', //default input error message container
                 errorClass: 'help-block', // default input error message class
                 focusInvalid: false, // do not focus the last invalid input
                 ignore: "",
                 focusCleanup: true,
                 rules: {
                	 current_password:{
                    	 required: true
                     },
                     new_password:{
                    	 required: true,
                    	 minlength: 8,
                    	 remote: function() {
                    	 	var newPass = $("#new_password").val();
                    	 	return {
	                    	 	url: app.context()+'/user/checkPassword',
	                    	 	type: "post",
	                    	 	contentType: "application/json; charset=utf-8",
	                    	 	dataType: "json",
	                    	 	data: JSON.stringify({password: newPass}),
	                    	 	dataFilter: function(response) {
	             					
	                    	 		var res = jQuery.parseJSON(response);
	                				if(res.statusCode == "200")
	                					return res.valid;
	                				else
	                					return false;
	            				}
							}
                    	 }
                	 },
                	 confirm_password:{
                		 required: true,
                		 equalTo: "#new_password"
                	 }   
                 },
                 messages: {
                 	new_password: {
                 		required: "This field is required.",
                 		remote: "Cannot use the same Old Password"
                 	}
                 	
                 },
                 invalidHandler: function (event, validator) { //display error alert on form submit              
                	 success3.hide();
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
                 },
                 submitHandler: function(form,event) {
  
                 		event.preventDefault();
				     	var updateRequestData = {};
				    	updateRequestData.userId = self.userID;
				    	updateRequestData.oldPassword = $('#current_password').val();
				    	updateRequestData.newPassword = $('#new_password').val();
				    	//updateRequestData.confirmPassword = $('#confirm_password').val();
				    	
				    	if(updateRequestData.newPassword == $('#confirm_password').val()){		    		
				    	 	self.model.updatePassword(updateRequestData,
			 				{	success : function ( model, res ) {

			 						var success = $('#alertPasswordChangeSuccess');

			                    	if(res.statusCode == "400")
			                    		success = $('#alertOldPasswordMismatch');
			                    	else if(res.statusCode == "415")
			                    		success = $('#alertNewPasswordPatternFailure');
			                    		
			                    	success.show();
			                    	App.scrollTo(success, -200);
			                    	success.delay(2000).fadeOut(2000);
			                    	self.initialFields();
			                    },
			                    error   : function ( model, res ) {
			                    	var error = $('#alertPasswordChangeFailure');
									error.show();
			                    	App.scrollTo(error, -200);
			                    	error.delay(2000).fadeOut(2000);
			                    	self.initialFields();
			                    }
			                });	
				    	}
				    	else{
				    		var error = $('#alertPasswordMismatchFailure');
							error.show();
		                	App.scrollTo(error, -200);
		                	error.delay(2000).fadeOut(2000);
				    		self.initialFields();
				    	}		
                }
             });
	     }
	 });
	 return changePasswordView;
});