define(["text!templates/login.html","app", "models/SessionModel"],function(loginPage,app, sessionmodel){
	var LoginView = Backbone.View.extend( {
		initialize: function(){

		},
		el:"#maincontainer",

		events          : {
			'click #submit' : 'onLoginAttempt',
			"click #forgot-password":"showForgotPassword",
	 	 	'click #forgotPasswordForm #back-btn':'showloginformfromForgotPassword',
		 	'click #forgotPasswordForm #sentforgotPasswordMail':'sentforgotPasswordMail',
			'keyup #loginForm input':'handleEnterKey',
			'click #resetPassword' : 'onresetPassword'

				/* 'click #register-btn':'showRegistrationForm',*/
				/* 'click #register-back-btn':'showloginformfromRegistration',*/
				/* 'click #register-submit-btn':'register'*/

		},
		handleEnterKey:function(event) {
			if(event.keyCode == 13){
				$("#submit").click();
			}
		},
		register:function(){
			if ($('#registrationForm').validate().form()) {
				console.log("sending request");
				var self = this;
				var url = "/register";
				var responseObject = $.ajax({
					type: "POST",
					url: url,
					data:$("#registrationForm").serializeArray(),
					async: false
				});
				responseObject.done(function(response){


				}
				);
				responseObject.fail(function(response){

				});
			}
		},
		onLoginAttempt : function ( evt ) {
			if ($('.login-form').validate().form()) {
				var self = this;
				var url = app.context() + "/login";
				var responseObject = $.ajax({
					type: "POST",
					url: url,
					data: $("#loginForm").serialize(),
					async: false
				});
				responseObject.done(function(response){
					app.sessionModel=new sessionmodel();
					app.sessionModel.set({userId:response.userId, statusCode: response.statusCode, message: response.message,forceReset:response.forceReset});
					var index = window.location.href.indexOf('#');
					var finalUrl="index";
					if(index>0 && window.location.href.indexOf('#logout')<0&&response.forceReset!="Y"){
						finalUrl=finalUrl+window.location.href.substring(index);
					}
					if(response.forceReset=="Y"){
						$('.alert-danger').hide();
						self.$el.find("#loginForm").hide();
						self.$el.find("#resetPasswordForm").show();
						self.handleResetPassword();
					}else{
						window.location.assign(finalUrl);
					}
				}
				);
				responseObject.fail(function(response){
					if(response.responseText){
						var respObj =JSON.parse(response.responseText);
						console.log(respObj);
						app.sessionModel=new sessionmodel();
						app.sessionModel.set({ statusCode: respObj.statusCode, message: respObj.message});
						self.render(app.sessionModel);
						$('.alert-danger').show();
					}else{
						var respObj = response;
						console.log(respObj);
						app.sessionModel=new sessionmodel();
						app.sessionModel.set({ statusCode: respObj.statusCode, message: respObj.statusText});
						self.render(app.sessionModel);
						$('.alert-danger').show();
					}
				});
			}

		},

		showRegistrationForm:function(){
			$('#loginForm').hide();
			$('#registrationForm').show();
		},
		showForgotPassword:function(){
    	 	$('#forgotPasswordForm .alert-success').hide();
    	 	$('#forgotPasswordForm .alert-danger').hide();
     	 	$('#loginForm').hide();
          	$('#forgotPasswordForm').show();
      	},
     	showloginformfromForgotPassword:function(){
     	 	$('#loginForm').show();
          	$('#forgotPasswordForm').hide();
      	},
		showloginformfromRegistration:function(){
			$('#loginForm').show();
			$('#registrationForm').hide();
		},
		render : function (msg) {
			console.log("Login render called");
			if(!msg){
				msg=new sessionmodel();
			}
			var query = window.location.search;
			if(query && query.indexOf('timeout')>-1) {
				msg.set({ statusCode: 419, message: 'Session expired. Please login again.'});
			}
			if(query && query.indexOf('resetPassword')>-1){
				var errMsg ="Please reset your password";
				this.template = _.template( loginPage );
				this.$el.html("");
				this.$el.html(this.template({message:errMsg}));
				this.$el.find("#loginForm").hide();
				this.$el.find("#resetPasswordForm").show();
				if(errMsg) {
					$('.alert-danger').show();
					$('.alert-danger').delay(1000).fadeOut(500);
				}
				this.handleResetPassword();
			}

			if(msg.attributes.forceReset=="Y"){
				var errMsg = msg.get("message");
				//this.template = _.template( loginPage );
				//	this.$el.html("");
				//this.$el.html(this.template({message:errMsg}));
				this.$el.find("#loginForm").hide();
				this.$el.find("#resetPasswordForm").show();
				//this.handleResetPassword();

			}
			else if(!(query && query.indexOf('resetPassword')>-1)){
				var errMsg = msg.get("message");
				this.template = _.template( loginPage );
				this.$el.html("");
				this.$el.html(this.template({message:errMsg}));
				this.handleLogin();
				this.handleForgotPassword();
				if(errMsg) {
					$('.alert-danger').show();
				}
			}
			/*	this.handleRegister();*/
			return this;
		},
		
		handleLogin:function() {

			$('#loginForm').validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				rules: {
					username: {
						required: true
					},
					password: {
						required: true
					},
					remember: {
						required: false
					}
				},

				messages: {
					username: {
						required: "Username is required."
					},
					password: {
						required: "Password is required."
					}
				},

				invalidHandler: function (event, validator) { //display error alert on form submit   
					$('.login-form').show();
				},

				highlight: function (element) { // hightlight error inputs
					$(element)
					.closest('.form-group').addClass('has-error'); // set error class to the control group
				},

				success: function (label) {
					label.closest('.form-group').removeClass('has-error');
					label.remove();
				},

				errorPlacement: function (error, element) {
					error.insertAfter(element.closest('.input-icon'));
				}
			});


		},

		handleForgotPassword:function () {
			$('#forgotPasswordForm').validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					userName: {
						required: true,
						email: true
					}
				},

				messages: {
					userName: {
						required: "Email is required."
					}
				},

				invalidHandler: function (event, validator) { //display error alert on form submit   

				},

				highlight: function (element) { // hightlight error inputs
					$(element)
					.closest('.form-group').addClass('has-error'); // set error class to the control group
				},

				success: function (label) {
					label.closest('.form-group').removeClass('has-error');
					label.remove();
				},

				errorPlacement: function (error, element) {
					error.insertAfter(element.closest('.input-icon'));
				}
			});
		},

		handleRegister : function () {

			function format(state) {
				if (!state.id) return state.text; // optgroup
				return "<img class='flag' src='assets/img/flags/" + state.id.toLowerCase() + ".png'/>&nbsp;&nbsp;" + state.text;
			}
			$("#select2_sample4").select2({
				placeholder: '<i class="fa fa-map-marker"></i>&nbsp;Select a Country',
				allowClear: true,
				formatResult: format,
				formatSelection: format,
				escapeMarkup: function (m) {
					return m;
				}
			});
			$('#select2_sample4').change(function () {
				//$('.register-form').validate().element($(this)); //revalidate the chosen dropdown value and show error or success message for the input
			});
			$('#registrationForm').validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {

					fullname: {
						required: true
					},
					email: {
						required: true,
						email: true
					},
					address: {
						required: true
					},
					city: {
						required: true
					},
					country: {
						required: true
					},

					username: {
						required: true
					},
					password: {
						required: true
					},
					rpassword: {
						equalTo: "#register_password"
					},

					tnc: {
						required: true
					}
				},

				messages: { // custom messages for radio buttons and checkboxes
					tnc: {
						required: "Please accept TNC first."
					}
				},

				invalidHandler: function (event, validator) { //display error alert on form submit   

				},

				highlight: function (element) { // hightlight error inputs
					$(element)
					.closest('.form-group').addClass('has-error'); // set error class to the control group
				},

				success: function (label) {
					label.closest('.form-group').removeClass('has-error');
					label.remove();
				},

				errorPlacement: function (error, element) {
					if (element.attr("name") == "tnc") { // insert checkbox errors after the container                  
						error.insertAfter($('#register_tnc_error'));
					} else if (element.closest('.input-icon').size() === 1) {
						error.insertAfter(element.closest('.input-icon'));
					} else {
						error.insertAfter(element);
					}
				}
			});

		},
		
		onresetPassword:function(evt){

			if ($('.resetPassword-form').validate().form()){
				 if(!app.sessionModel){
				var buildSessionModel = function() {
					var sessionData = null;
					app.sessionModel = new sessionmodel();
					sessionData = app.sessionModel.getUser();
					app.sessionModel.set({
						userId : sessionData.userId,
						firstName : sessionData.firstName,
						isDeleted : sessionData.isDeleted,
						isInactive : sessionData.isInactive,
						isLocked : sessionData.isLocked,
						lastName : sessionData.lastName,
						userName : sessionData.userName,
						permissions : sessionData.permissions,
						statusCode : sessionData.statusCode,
						message : sessionData.message,
						roles : sessionData.roles,
						forceReset:sessionData.forceReset
					});
				};
				buildSessionModel();
				console.log(app.sessionModel);
				 }
				var resetPwdObj={};
				resetPwdObj.newpassword=$("#newpassword").val();
				resetPwdObj.confirmpassword=$("#confirmpassword").val();
				resetPwdObj.userId=app.sessionModel.attributes.userId;
				var self=this;
				var url=app.context()+"/user/forceToResetPassword";
				$.ajax({
					contentType: 'application/json',
					dataType:'json',
					type: 'PUT',
					data: JSON.stringify(resetPwdObj),
					url:url,
					async: false,

					success: function(res){
						console.log("success");
						app.sessionModel=new sessionmodel();
						app.sessionModel.set({userId:res.userId, statusCode: res.statusCode, message: res.message,forceReset:res.forceReset});
						$('.alert-success').show();
						$('.alert-success').delay(1000).fadeOut(500);
						setTimeout(self.showResetSuccess,1500); 

					},
					error: function(res){
						var respObj =JSON.parse(res.responseText);
						console.log(respObj);
						app.sessionModel=new sessionmodel();
						app.sessionModel.set({ statusCode: respObj.statusCode, message: respObj.message});
						self.render(app.sessionModel);
						$('.alert-danger').show();
					}

				});
			}
		},
		handleResetPassword:function(){

			$('#resetPasswordForm').validate({

				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				rules: {
					newpassword: {
						required: true
					},
					confirmpassword: {
						required: true,
						equalTo:"#newpassword"
					}
				},

				messages: {
					newpassword: {
						required: "Password is required."
					},
					confirmpassword: {
						required: "Confirm Password is required.",
						equalTo:  "New Password and Confirm Password do not match."
					}
				},

				invalidHandler: function (event, validator) { //display error alert on form submit   
					$('.resetPassword-form').show();
				},

				highlight: function (element) { // hightlight error inputs
					$(element)
					.closest('.form-group').addClass('has-error'); // set error class to the control group
				},

				success: function (label) {
					label.closest('.form-group').removeClass('has-error');
					label.remove();
				},

				errorPlacement: function (error, element) {
					error.insertAfter(element.closest('.input-icon'));
				}
			});
		},
		
		showResetSuccess : function(){
			//  $('#resetSuccessmsg').show();
			//App.scrollTo($('#dashboardFailure'), -200);
			// $('#resetSuccessmsg').delay(2000).fadeOut(2000);
			var index = window.location.href.indexOf('#');
			var finalUrl="index";
			if(index>0 && window.location.href.indexOf('#logout')<0){
				finalUrl=finalUrl+window.location.href.substring(index);
			}
			window.location.assign(finalUrl);
		},

		sentforgotPasswordMail:function(evt){
			evt.preventDefault();
			var self = this;
			var currentForm = $(evt.currentTarget).closest("form");
			if(currentForm.validate().form()){
				console.log("sentforgotPasswordMail");
				var requestObj = {};
				var unindexed_array = currentForm.serializeArray();
				$.map(unindexed_array, function(n, i){
					var value=n['value'];
					var name=n['name'];
					requestObj[name] = value;
				});
				var url = app.context() + "/user/resetPassword";
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});
				$.ajax({
					dataType:'json',
					contentType: 'application/json',
					type: 'POST',
					url: url,
					data: JSON.stringify(requestObj),
					async: true,
					success:function(){
						$.unblockUI();
						currentForm.find(".alert-success #emailAddress").html(requestObj.userName);
						currentForm.find(".alert-success").show();
						currentForm.find("input[name=userName]").val("");
						// setTimeout(function(){self.showloginformfromForgotPassword()},8000); 
					},
					error:function(){
						$.unblockUI();
						console.log("error");
						currentForm.find(".alert-danger").show().delay(8000).fadeOut(4000);
					}
				});
			}																	
	 	}

	} );

	return LoginView;

});
