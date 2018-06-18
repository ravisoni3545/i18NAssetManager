define(['backbone',
	'app',
	'text!templates/editUserModal.html'],function(backbone, app, editUserModalTpl){
		var editUserModalView = Backbone.View.extend({
		initialize : function(){
		},
		events : {
			"click button[name=addRoleBtn]":"addRole",
			"click button[name=saveEditBtn]":"saveChanges",
			"click button[name=deleteRoleBtn]":"deleteRole",
			"click button[name=addFilesBtn]":"addFile"
		},
		el:"#editUserModalDiv",
		render : function(userId, theModel){
			var self = this;
			this.model = theModel;
			this.userId = userId;
			console.log("rendering edit user Modal");
	 		self.apiLink = app.context()+'user/photo/';
	    	this.template = _.template( editUserModalTpl );
	     	this.$el.html("");
	     	console.log("get profile info");
	     	
	    	theModel.getProfileInfo(userId,{
	    			success: function(res){
	    				console.log("sucess profileInfo");
	     				
	     				theModel.getRoles({
				    			success: function(res2){
				    				console.log('getting current image');
				    				$.ajax({
						                url: app.context()+'/image/link/User/'+self.userId,
						                type: 'GET',
						                async: false,
						                success: function(res3){
						                	self.userImage=res3;
								            
						                },
						                error: function(res3){
						                   console.log("error getting current user photo");
						                }
						            });
						            console.log("success roles and userimage");
						     				self.$el.html(self.template({roles:res2,userInfo:res,apiLink:self.apiLink,currentImage:self.userImage}));
						     				self.addFile();
			    							$("#editUserModal").modal('show');
				    			
				    			},
				    			error: function(res2){
				    				console.log(res2);
				    				console.log("error in getting the roles");
				    			}
				    	});
	    			},
	    			error: function(res){
	    				console.log(res);
	    				console.log("error in getting the user INfo");
	    			}
	    	});

	    	this.editUserFormValidation();

		},
		addRole : function(evt){
			var self = this;
			var data ={};
			data["userId"] = $(evt.target).closest('button').attr('user-id');
			var id = $('#roleOption').find(":selected").val();
			data["roleId"] = id;

			self.model.addRole(data);
			$('#editUserModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			self.render($(evt.target).closest('button').attr('user-id'),self.model);

		},
		saveChanges : function(evt){
			var self = this;
			var data = {};
			if($('#editUserForm').validate().form()){
			data["userId"] = $(evt.target).closest('button').attr('user-id');
			data["userName"]=$('#editUsername').val();
			data["firstName"]=$('#editFirstName').val();
			data["lastName"]=$('#editLastName').val();
			data["fromEmail"]=$('#editFromEmail').val();
			data["isInactive"]=$('#editInactive').is(':checked')?'Y':'N';
			data["isLocked"]=$('#editLocked').is(':checked')?'Y':'N';
			data["isReceiveMsg"]=$('#editMessages').is(':checked')?'Y':'N';
			data["phoneNumber"]=$('#editPhoneNumber').val();
			data["title"]=$('#editTitle').val();
			data["receiveToasterNotifications"]=$('#editReceiveNotifications').is(':checked')?'Y':'N';

			self.model.editUser(data, {
								success: function(res){
				    				console.log("success edit");
				     				
				    			},
				    			error: function(res){
				    				console.log(res);
				    				console.log("error with edit");
				    			}
			});
			$('#editUserModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();

			app.userAccountsView.render();
		}


		},
		deleteRole : function(evt){
			console.log("delete");
			var self = this;
			var data ={};
			console.log('evt: ' + evt);
			console.log("closestuid: " + $(evt.target).closest('button').attr('user-id'));
			console.log("uid: " + $(evt.target).attr('user-id'));
			data["userId"] = $(evt.target).closest('button').attr('user-id');
			data["roleId"] = $(evt.target).closest('button').attr('role-id');
			
			self.model.deleteRole(data);
			//$.modal.close();
			$('#editUserModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();

			self.render($(evt.target).closest('button').attr('user-id'),self.model);
		},
		editUserFormValidation: function() {
		         // for more info visit the official plugin documentation: 
		             // http://docs.jquery.com/Plugins/Validation
		             console.log("edit form validation here");
		             var form1 = $('#editUserForm');
		             var error1 = $('#editUserFormError', form1);
		             var success1 = $('.alert-success', form1);

		             form1.validate({
		                 errorElement: 'span', //default input error message container
		                 errorClass: 'help-block', // default input error message class
		                 focusInvalid: false, // do not focus the last invalid input
		                 ignore: "",
		                 rules: {
		                     firstName: {
		                         minlength: 2,
		                         required: true
		                     },
		                     lastName: {
		                         minlength: 2,
		                         required: true
		                     },
		                     username: {
		                         minlength: 2,
		                         required: true
		                     },
		 					 fromEmail:{
		                         email: true,
		                         required: true
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
		     addFile: function(){
		     	var self = this;
	            console.log('add files');
	              // prepare Options Object 
	            var options = { 
	                target: '#response', 
	                url:        this.apiLink, 
	                success:    function() { 
	                    console.log('success in uploading photos');

	                },
	                error: function(){
	                    console.log("error in uploading photos");
	                } 
	            };
	             
	            $('#uploadForm2').ajaxForm(function(options) { 
	                console.log("success");
	                self.photoSaveSuccess = true;
	                $('#editUserModal').modal('hide');
					$('body').removeClass('modal-open');
					$('.modal-backdrop').remove();
	                self.render(self.userId,self.model);
	            }); 

		     }


	});
		return editUserModalView;
});