

define(["backbone",
	"app",
	"SecurityUtil",
	"text!templates/userAccounts.html",
	"models/userModel",
	"views/editUserModalView"],
		function(Backbone, app, securityUtil, userAccountsPage, userModel,editUserModalView){
	
	var UserAccountsView = Backbone.View.extend({
		 initialize: function(){
						 console.log('onOpen');
						 this.currentRole = "";
			 
			},
			onOpen: function(){
				
			},
			events          : {
		         "click a[name=edituser]":"showEditUserModal",
		         "click button[name=newUser]":"showCreateUserModal",
		         "click a[href=#deleteUserConfirmationModal]":"showDeleteUser",
		         "click button[name=createUserBtn]":"createUser",
		         "click button[name=deleteUserConfirm]": "deleteUser",
		         "click a[href=#resetUserPasswordConfirmationModal]":"showResetUser",
		         "click button[name=resetConfirm]": "resetUserPassword",
		         "change #roleSearchSelect":"changeRole"
		    },
			el:"#mainContainer",
			render : function(){

			var self = this;
 	 		this.template = _.template( userAccountsPage );
	     	this.$el.html("");			     	
	     	this.$el.html(this.template());

			var userModel1 = new userModel();
			userModel1.fetch();
			this.model = userModel1;
			this.showDataTable();
			//add the role select in the top of the datatables element
			$('#userInfoTable_filter').append('<div style="width:50%" id="appendDiv"><span style="line-height: 32px">Search by Role:</span> <select class="form-control pull-right" style="width:62%" id="roleSearchSelect"><option value="">select</option></select></div>');
			this.model.getRoles({
				success: function(res){
					_.each(res,function(role){
						$('#roleSearchSelect').append('<option value="' + role.roleId + '">' + role.roleName + "</option>");
					}) ;
					$('#roleSearchSelect').val(self.currentRole);
				},
				error: function(res){
					console.log('error Fetching roles for user accounts search');
				}
			});
			this.createUserFormValidation();

			     	return this;
		    },
		    showDataTable : function(){
		    var self = this;
		    if(self.currentRole === ""){
		    	self.dtSource = app.context()+ '/user/';
			}else{
				self.dtSource = app.context() + '/user/byRole/' + self.currentRole;
			}
			// ----------------------------DataTable
			// start-----------------------------------
			var oTable = $('#userInfoTable').dataTable(
							{
								"bServerSide" : false,
								"bProcessing" : true,
								"bFilter": true,
								//"scrollY" : "300px",
								//"scrollX" : "100%",
								"sAjaxSource" : self.dtSource,
								"sAjaxData" : 'aaData',
								//"pagingType" : "simple",
								"sServerMethod":"GET",
								"oLanguage" : {
									"sLengthMenu" : "_MENU_ records",
									"sZeroRecords" : "No matching records found",
									"sInfo" : "Showing _START_ to _END_ of _TOTAL_ entries",
									"sInfoEmpty" : "No records available",
									"sInfoFiltered" : "(filtered from _MAX_ total entries)",
								},

								"aoColumns" : [
										{
											"mData" : "userId",
											"sTitle" : "Action"
										},{
											"mData" : "firstName",
											"sTitle" : "First Name"
										},{
											"mData" : "lastName",
											"sTitle" : "Last Name"
										},{
											"mData" : "userName",
											"sTitle" : "Username"
										},{
											"mData" : "fromEmail",
											"sTitle" : "From Email"
										}, {
											"mData" : "isInactive",
											"sTitle" : "Inactive"
										}, {
											"mData" : "lastLoginDate",
											"sTitle": "Last Login Date"
										}, {
											"mData" : "lastModifiedBy",
											"sTitle": "Last Modified By"
										}, {
											"mData" : "lastModifiedDate",
											"sTitle": "Last Modified Date"
										}, {
											"mData" : "lastPasswordChangedDate",
											"sTitle": "Last Password Change"
										}],

								"aoColumnDefs" : [
										{
											"aTargets" : [ 0 ],
											"bSortable": false,
											"mRender" : function(
													data, type,
													full) {
												return '<div class="btn-group" style="text-align:left!important;">'
 								                      	+'<button data-toggle="dropdown" class="btn dropdown-toggle gear2button myaction" type="button"><i class="fa fa-gear"></i></button>'
			                       					  	+'<ul user-id="'+full.userId+'" role="menu" class="dropdown-menu" style="margin-left:30px!important;margin-top:-20px!important; padding:5px; position: relative; z-index: 1;">'
														+'<li><a name="edituser" user-id="'+full.userId+'"data-toggle="modal" class="btn btn-xs green textalignleft"><i class="fa fa-pencil"></i> Edit User</a></li>'
                                                        +'<li><a href="#deleteUserConfirmationModal" data-toggle="modal" user-id="'+full.userId+'" href="#deleteUserModal" class="btn btn-xs red textalignleft"><i class="fa fa-star"></i> Delete User</a></li>'
                        								+'<li><a href="#resetUserPasswordConfirmationModal" data-toggle="modal" user-info="'+full.firstName+' '+full.lastName+' '+full.userName+'" user-id="'+full.userId+'"href="#resetUserModal" class="btn btn-xs purple textalignleft"><i class="fa fa-lock"></i> Reset Password</a></li>'
                        								+'</ul></div>'
											}
										},
										{
											"aTargets": [ 6 ],
											"mRender" : function(
													data, type,
													full) {
												if(full.lastLoginDate != null)
													return $.datepicker.formatDate('mm-dd-yy', new Date(full.lastLoginDate));
												else
													return "";
											}


										},
										{
											"aTargets": [ 8 ],
											"mRender" : function(
													data, type,
													full) {
												if(full.lastModifiedDate != null)
													return $.datepicker.formatDate('mm-dd-yy', new Date(full.lastModifiedDate));
												else
													return "";
											}


										},
										{
											"aTargets": [ 9 ],
											"mRender" : function(
													data, type,
													full) {
												if(full.lastPasswordChangedDate != null)
													return $.datepicker.formatDate('mm-dd-yy', new Date(full.lastPasswordChangedDate));
												else
													return "";
											}


										}

								],

								"fnServerData" : function(
										sSource, aoData,
										fnCallback, oSettings) {
									console.log("fnServerData");
									var paramMap = {};
									for (var i = 0; i < aoData.length; i++) {
										paramMap[aoData[i].name] = aoData[i].value;
										console.log("aoData[i] name: " + aoData[i].name);
										console.log("aoData value: " + aoData[i].value)
									}
									var pageSize = oSettings._iDisplayLength;
									var start = (paramMap.iDisplayStart>0)?paramMap.iDisplayStart:0;

									var pageNum = (start / pageSize);
									var sortCol = paramMap.iSortCol_0;
									var sortDir = paramMap.sSortDir_0;
									var sortName = paramMap['mDataProp_'
											+ sortCol];
									self.model.set("sortDir",
											sortDir);
									self.model.set("sortName",
											sortName);
									self.model.set("pageNum",
											pageNum);
									self.model.set("pageSize",
											pageSize);
									//$("#investorSearch").attr('disabled','disabled');
									$.ajax({
												"dataType" : 'json',
												"contentType" : "application/json",
												"type" : "GET",
												"url" : sSource,
												"success" : function(
														res) {
													res.iTotalRecords = res.iTotalRecords;
													res.iTotalDisplayRecords = res.iTotalRecords;
													fnCallback(res);
													//$("#investorSearch").removeAttr('disabled');
												},
												"error" : function(res) {
													 console.log("Failed in user Accounts View: " + res);
													
									                 
												}
											});
								}

							});

                $('select[name=userInfoTable_length]').addClass('form-control');
                $('#userInfoTable_filter input').addClass('form-control-search');

			//$('#investorSearchResultsTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");
		},
		createUser : function(){
			var self=this;
			var data = {};
			var newId;
			if($('#createUserForm').validate().form()){
				data["userName"]=$('#createUserName').val();
				data["firstName"]=$('#createFirstName').val();
				data["lastName"]=$('#createLastName').val();
				data["fromEmail"]=$('#createFromEmail').val();
				data["isInactive"]=$('#createInactive').is(':checked')?'Y':'N';
				data["isLocked"]=$('#isLocked').is(':checked')?'Y':'N';
				data["isReceiveMsg"]=$('#createMessages').is(':checked')?'Y':'N';
				data["title"]=$('#createTitle').val();
				data["phoneNumber"]=$('#createPhoneNumber').val();
				
				self.model.editUser(data,{
								success: function(res){
				    				console.log("success roles");
				    				//hold user id to bring up edit modal
				     				newId = res.user.userId;
				     				console.log("resId: " + newId);
				    			},
				    			error: function(res){
				    				console.log(res);
				    				console.log("error in getting the roles");
				    			}
				});
				$('#createUserModal').modal('hide');
				$('body').removeClass('modal-open');
				$('.modal-backdrop').remove();
				self.render();
				if(!app.editUserModalView)
		    		app.editUserModalView = new editUserModalView();
		  		//console.log("this.model.userID: " + newId);
		  		//reset new user's password
		  		var data = {};
				data["userId"]= newId;
				this.model.resetUserPassword(data);
		    	app.editUserModalView.render(newId, this.model);
	    }




		},
		showEditUserModal : function(evt){
			console.log("showEdituUserModal");
			var self = this;
			if(!app.editUserModalView)
	    		app.editUserModalView = new editUserModalView();
	    	app.editUserModalView.setElement($("#editUserModalDiv"));
	    	var id = $(evt.target).closest("a").attr('user-id');
	    	self.model.set({"userId": $(evt.target).closest("a").attr('userId')});
	    	app.editUserModalView.render(id,self.model);	
	    	//evt.preventDefault();	


		},
		showDeleteUser : function(evt){
			this.userIdToDelete = $(evt.target).attr("user-id");
			//console.log("setting new UserId for delete: " + this.userIdToDelete);

		},
		showResetUser: function(evt){
			this.userIdToReset = $(evt.target).closest("a").attr('user-id');
			this.userInfoToReset = $(evt.target).closest("a").attr('user-info');
			//console.log("setting new UserId for reset: " + this.userIdToReset);
		},
		deleteUser : function(){
			console.log("delete USer confirmed");
			var self = this;
			var data = {};
			data["userId"]= this.userIdToDelete;
			this.model.deleteUser(data);
			$('#deleteUserConfirmationModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			this.render();

		},
		resetUserPassword : function(){
			console.log("reset USer confirmed");
			var self = this;
			var data = {};
			data["userId"]= this.userIdToReset;
			this.model.resetUserPassword(data, {
				success: function(res){
					alert('Password succesfully reset for user: ' + self.userInfoToReset);
					console.log('success');
				},
				error: function(res){
					alert('Error with password reset for user: ' + self.userInfoToReset);

				}
			});
			$('#resetUserPasswordConfirmationModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			this.render();

		},
		createUserFormValidation: function() {
		         // for more info visit the official plugin documentation: 
		             // http://docs.jquery.com/Plugins/Validation
		             console.log("company form validation here");
		             var form1 = $('#createUserForm');
		             var error1 = $('#createUserFormError', form1);
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
		     changeRole: function(evt){
		     	var self=this;
		     	console.log('changing role: ' + $(evt.target).val());
		     	self.currentRole=$(evt.target).val();
		     	self.render();
		     }
		    
	});
	return UserAccountsView;
});