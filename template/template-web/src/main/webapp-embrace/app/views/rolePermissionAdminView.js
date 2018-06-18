define(['app', 'backbone', 'text!templates/rolePermissionsAdmin.html','models/rolePermissionModel','jquery.multi-select','models/userModel'],
	function(app,Backbone,rolePermissionTpl,rolePermissionModel, mselect,userModel){

		var rolePermissionAdminView = Backbone.View.extend({

			initialize : function(){
				var self=this;
				self.toAddList = [];
				self.toDeleteList=[];

			},
			el: '#maincontainer',
			events: {
				"change #roleSelect": "renderRolePermissions",
				"click #rolePermissionSave": "saveRolePermissions"
			},

			render: function(){

			//$.unblockUI();

			var self=this;
				self.toAddList = [];
				self.toDeleteList=[];
				console.log('initial values: toadd: ' + self.toAddList + '; toDelete: ' + self.toDeleteList );

				console.log('role permission main render');

			if(!self.rolePermissionModel){
				self.rolePermissionModel = new rolePermissionModel();
			}

			if(!self.userModel){
				self.userModel = new userModel();
			}
			self.userModel.getRoles({
				success: function(res){
					console.log('success in getting roles');
					self.roles = res;
					//if there is no selected role then no need to render the multi-select control, or fetch role permission data
					if(self.roleSelect === undefined || self.roleSelect == ""){
						self.template = _.template( rolePermissionTpl );
				     	self.$el.html("");
				     	self.$el.html(self.template({roleSelect: "",roles:self.roles,availablePermissions:"",currentPermissions:""}));
			     	} else{
			     		self.rolePermissionModel.getPermissions(self.roleSelect,{
			     			success: function(res2){
			     				console.log('success in getting role permissions');
			     				self.availablePermissions = res2.availablePermissions;
			     				self.currentPermissions = res2.currentPermissions;
			     				self.template = _.template( rolePermissionTpl );
						     	self.$el.html("");
						     	self.$el.html(self.template({roleSelect: self.roleSelect, roles:self.roles,availablePermissions:self.availablePermissions,currentPermissions:self.currentPermissions}));
			     				
			     				var select = $("#my-select option");

								select.sort(function(a,b) {
								    if (a.text > b.text) return 1;
								    else if (a.text < b.text) return -1;
								    else return 0;
								});

								$("#my-select").empty().append( select );

								//keep order false makes it actually keep order. not sure why
			     				$('#my-select').multiSelect({
			     					 keepOrder: false,
			     					 selectableHeader: "<div class='custom-header'>Available Permissions</div>",
  									 selectionHeader: "<div class='custom-header'>Current Permissions</div>",

								  afterSelect: function(values){
								  	//convert values to string 
								  	var toAdd = String(values);
								  	//console.log('adding: ' + toAdd);
								  	//if the string begins with p, and is less than 38 characters long, then it is a  permission so add it
								  	if(toAdd.charAt(0) === 'p' && toAdd.length <38){
								  	//	console.log('pushed');
								    	self.toAddList.push(toAdd);
								    }
								    //check if the index is already in the delete list to remove it
								    var index = self.toDeleteList.indexOf(toAdd);
								    //console.log('index: ' + index);
								    //index >-1 means an element was found
								    if(index > -1){
    									self.toDeleteList.splice(index, 1);
								    }
								  },
								  afterDeselect: function(values){
								  	//convert to string
								  	var toDelete = String(values);
								  	//console.log('delete: ' + toDelete);

								  	//if the character doesn't start with p then it is a role permission so it can be deleted
								  	if(toDelete.charAt(0) !== 'p' && toDelete.length < 38){
								  		//console.log('pushed');
								   	 self.toDeleteList.push(toDelete);
								   	}
								   	//check index to remove from add list if the element was previously added.
								    var index = self.toAddList.indexOf(toDelete);
								   // console.log('index: ' + index);
								    if(index > -1){
    									self.toAddList.splice(index, 1);
								    }
								  }
								});
								// correct role select value
			     				$('#roleSelect').val(self.roleSelect);
			     				//show save button
			     				$('#rolePermissionSave').show();
			     			},
			     			error: function(res2){
			     				console.log("error in fetching role permissions for role: " + self.roleSelect);
			     				console.log(res2);
			     			}
			     		});
			     	}
				},
				error: function(res){
					console.log('error fetching roles for role permission admin');
					console.log(res);
				}
			}); 	

	     	return this;
			},
			renderRolePermissions : function(evt){
				// console.log('render role permissions');
				// console.log('evt.target.val' + $(evt.target).val());
				// console.log('role select value: ' + $('#roleSelect').val());
				this.roleSelect =  $('#roleSelect').val();
				this.render();
			},
			saveRolePermissions : function(){
				var self=this;
				$('#saveRoleError').hide();
				$('#saveRoleSucess').hide();

		
				console.log('add: ' + self.toAddList);
				console.log('delete: ' + self.toDeleteList);

				var dataAdd = {};
				var dataDelete = {};
				
				dataAdd["roleId"] = self.roleSelect;
				dataAdd["permissionIds"] = self.toAddList;

				dataDelete["roleId"]= self.roleSelect;
				dataDelete["permissionIds"]=self.toDeleteList;

				console.log('saving');
				self.noErrors = true;
				if(self.toAddList.length >0)
				self.rolePermissionModel.addPermissions(dataAdd, {
					success: function(res){
						console.log('success in adding role permissions');
						if(res.statusCode === "500"){
							self.noErrors = false;
						}
					},
					error: function(res){
						console.log('error in adding role permissions: ' + res);
						self.noErrors = false;
					}
				});

				if(self.toDeleteList.length >0)
				self.rolePermissionModel.deletePermissions(dataDelete, {
					success: function(res){
						console.log('success in delete role permissions');
						if(res.statusCode === "500"){
							self.noErrors = false;
						}
					},
					error: function(res){
						console.log('error in delete role permissions: ' + res);
						self.noErrors = false;
					}
				});
			
				self.render();
				console.log('saved');
				if(self.noErrors)
				{
					console.log('no errors');
					$('#saveRoleSuccess').show();
				}else{
					$('#saveRoleError').show();

				}

				
			}

		});

		return rolePermissionAdminView;

});