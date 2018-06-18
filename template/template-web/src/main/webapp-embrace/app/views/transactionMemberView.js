define(["backbone","app","text!templates/transactionMembers.html",
        "views/lendersView","text!templates/sellerAgent.html","text!templates/escrowCompany.html",
        "text!templates/rehabVendor.html","views/codesView","text!templates/usersDropdown.html",
        "text!templates/companyDropDown.html", "text!templates/genericCompanyDropDown.html"],
		function(Backbone,app,transactionMembersPage,
				lendersView,sellerAgentPage,escrowCompanyPage,
				rehabVendorPage,codesView,usersDropdown,companyDropDown,genericCompanyDropDown){

	var TransactionMemberView = Backbone.View.extend( {
		initialize: function(){
			var ad = this;
			 this.codesView = new codesView({codeGroup:'MORT_STATUS'});
			 this.lendersView = new lendersView();
			 this.fetchStates();
		},

		model : {},
		models:{},
		//el:"#contactsTab",
		self:this,
		collection:null,

		events          : {
			"change #lendersDropdown" : "showNewLender",
			"change #lendersDropdownUpdate" : "showNewLenderUpdate",
			"click #saveMortgage":"saveMortgage",
			"click #showEscrowCompanyModal":"showEscrowCompanyModal",
			"click #saveEscrowCompany":"saveEscrowCompany",
			"change #escrowCompanyDropdown":"showAddEscrowForm",
			"click #transmem-edit":"openUserDropdownModal",
			"click #cancel-transmem":"cancelTransMembers",
			"click #save-trans-mem":"saveTransactionMember",
			"click #showSellerAgentModal":"showSellerAgentModal",
			"click #saveSellerAgent":"saveSellerAgent",
			"click #rehabVendorEdit":"showRehabVendorModal",
			"click #save-rehab-vendor":"saveRehabVendor",
			"click #transmem-org-gen-edit":"showGenericVendorModal",
			"click .transmem-org-edit": "showProcessRelatedInfo",
			"click #save-generic-vendor":"saveGenericVendor"
			
		},
		
		render:function(){
			var self = this;
			//var dealTypeVal=self.model.attributes.investmentResponse['dealTypeName'];
	    	this.transMemsTemplate = _.template( transactionMembersPage );
	     	var transMemsEl = this.$el;
     		this.fetchTransactionMembers();

     		transMemsEl.html("");
	    	transMemsEl.html(this.transMemsTemplate({transactionMemberResponse:this.transMemsData,investmentResponse:self.otherTransMemsData}));
	    /*	if(dealTypeVal=='TKP'){
	    		$('*[data-rolename="ILM"]').hide();
	    	}*/
	      	 	    	 
	    	 var lendingCompanyName =self.otherTransMemsData.lendingCompanyName;
	     	 var mortgageStatus =  self.otherTransMemsData.mortgageStatus;
	     	 
	     	 this.lendersView.render({el:$('#lendersList')});
	     	 $('#lendersList .form-control').attr('id', 'lendersDropdown');
	     	 this.lendersView.render({el:$('#lendersListUpdate')});
	     	 $('#lendersListUpdate .form-control').attr('id', 'lendersDropdownUpdate');
	     	 $('#lendersListUpdate .form-control').attr('name', 'lenderCompanyUpdate');
	     	 
	     	 this.showNewLender();
	     	 this.showNewLenderUpdate();
	     	 
	     	 this.codesView.render({el:$('#statusList'),codeParamName:"statusId",addBlankFirstOption:"true"});
	     	 this.codesView.callback=function() {
	     		 //alert('1');
	     		 $('#statusList .form-control').attr('id', 'statusId');
	     		 $('#statusListUpdate .form-control').attr('id', 'statusIdUpdate');
		     	 $('#statusListUpdate .form-control').attr('name', 'statusIdUpdate');
	     		 $('#statusId').val(mortgageStatus);
		     	 $('#statusIdUpdate').val(mortgageStatus);
			 }
	     	 this.codesView.render({el:$('#statusListUpdate'),codeParamName:"statusId",addBlankFirstOption:"true"});
	     	 $('#statusListUpdate .form-control').attr('id', 'statusIdUpdate');
	     	 $('#statusListUpdate .form-control').attr('name', 'statusIdUpdate');
	     	 
	     	 var text = $("#lendersDropdown option[value='"+lendingCompanyName+"']").text();
         	 $('.bootstrap-select .filter-option').text(text);
	    	 $('#lendersDropdown').val(lendingCompanyName);
	    	 
	    	 var text1 = $("#lendersDropdownUpdate option[value='"+lendingCompanyName+"']").text();
         	 $('.bootstrap-select .filter-option').text(text1);
	    	 $('#lendersDropdownUpdate').val(lendingCompanyName);
	     	 
	     	 $('#statusId').val(mortgageStatus);
	     	 $('#statusIdUpdate').val(mortgageStatus);
	    	 
	    	//$('#trans-mem-edit').hide();
		},
		fetchTransactionMembers:function(){
			var self = this;
			//var object='Investment';
			$.ajax({
				url: app.context()+'/transactionMembers/get/'+self.object+'/'+self.objectId,
				contentType: 'application/json',
				async : false,
				dataType:'json',
				type: 'GET',
				success: function(res){
					self.transMemsData=res;
				},
				error: function(res){
					console.log("Error occured while fetching transaction member for object:"+object);
				}

			});
			
			 $.ajax({
			 	url: app.context()+'/closing/getTransactionMembers/'+self.investmentId,
			      contentType: 'application/json',
			      async : false,
			      dataType:'json',
			      type: 'GET',
			      success: function(res){
			      	self.otherTransMemsData=res;
			      },
			      error: function(res){
			      	
			      }
			 	
			 });
		},
		
		showNewLender: function() {
			var lenderCompany = $("#lendersDropdown").val();
			if(lenderCompany=="newlender"){
				$("#newlender").prop("disabled", false);
			}else{
				$("#newlender").prop("disabled", true);
			}
		},
		showNewLenderUpdate: function() {
			var lenderCompanyUpdate = $("#lendersDropdownUpdate").val();
			if(lenderCompanyUpdate=="newlender"){
				$("#newlenderUpdate").prop("disabled", false);
			}else{
				$("#newlenderUpdate").prop("disabled", true);
			}
		},
		saveMortgage:function() {
			 var self=this;
	    	 var obj={};
	    	 var investmentId=this.investmentId;
	    	 var lender=$("#lendersDropdownUpdate option:selected").val();
	    	 var nonHuLender=$("#newlenderUpdate").val();
	    	 obj.mortgageStatus=$("#statusListUpdate option:selected").val();
	    	 obj.investmentId=investmentId;
	    	 if(lender=="newlender"){
	    		 if(nonHuLender == ""){
	    		 	 $('#mortgageDetailsForm #formFailure #textValue').text("Please enter New Lender.");
	    			 $('#mortgageDetailsForm #formFailure').show();
	    			 App.scrollTo($('#mortgageDetailsForm #formFailure'), -200);
	                 $('#mortgageDetailsForm #formFailure').delay(2000).fadeOut(2000);
	    		 }else{
	    			 obj.lendingCompanyName=nonHuLender;
	    			 this.saveOrUpdateMortgage(obj);
	    		 }
	    	 }else{
	    		 obj.lendingCompanyName=lender;
	    		 if(jQuery.isEmptyObject(obj.lendingCompanyName)){
	    			 $('#mortgageDetailsForm #formFailure #textValue').text("Please select lender Company.");
	    			 $('#mortgageDetailsForm #formFailure').show();
	    			 App.scrollTo($('#mortgageDetailsForm #formFailure'), -200);
	                 $('#mortgageDetailsForm #formFailure').delay(2000).fadeOut(2000); 
				     return;
		    	 }
	    		 this.saveOrUpdateMortgage(obj);
	    	 }
		},
	
		saveOrUpdateMortgage:function(obj){ 	 
			 var self=this;
			 var currentModal=$("#lendingcompany");
			 var selectedUserId=$("#lendersDropdownUpdate option:selected").attr('id');

			 $.ajax({
	                url: app.context()+'closing/saveOrUpdateMortgage',
	                contentType: 'application/json',
	                aysnc:false,
	                dataType:'text',
	                type: 'POST',
	                data:JSON.stringify(obj),
	                success: function(res){
	                	$("#lendingcompany").modal("hide");
	                	$("#lendingcompany").on('hidden.bs.modal', function (e) {
	                			self.render();
	                			self.saveTransactionMemUtility(self.processRoleId, self.otherTransMemsData.lendingCompanyId, self.roleName, currentModal);
	                			$('#transMemsSuccessMsg').show();
								$('#transMemsSuccessMsg > text').html("Successfully updated mortgage company.");
						        App.scrollTo($('#transMemsSuccessMsg'), -200);
						        $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
                   	});
	                	//self.refreshContactsTab();
	                },
	                error: function(res){
	                	self.render();
	                	$('#transMemsFailureMsg').show();
						$('#transMemsFailureMsg > text').html("Error in updating mortgage company.");
				        App.scrollTo($('#transMemsFailureMsg'), -200);
				        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);
	                }
	        });
		},
		
		refreshTransactionMembers:function(){
				//this.fetchTransactionMembers();
		    	this.render();
		},
				
	    showSellerAgentModal:function(){
		    	var self=this;
		    	this.fetchSellerAgentData();
		    	var data = this.sellerAgentData;
		    	var sellerAgentTemplate = _.template(sellerAgentPage);
		    	
		    	$('#sellerAgentDiv').html('');
		    	$('#sellerAgentDiv').html(sellerAgentTemplate({}));
		    	
		    	if(!jQuery.isEmptyObject(data))
		    	{
			    	if(!jQuery.isEmptyObject(data.agentName)){
			    		 $('input[name=agentName]').val(data.agentName);
			    	}else{
			    		$('input[name=agentName]').val('');
			    	}
			    	if(!jQuery.isEmptyObject(data.agentEmail)){
			    		 $('input[name=agentEmail]').val(data.agentEmail);
			    	}else{
			    		$('input[name=agentEmail]').val('');
			    	}
			    	if(!jQuery.isEmptyObject(data.agentPhone)){
			    		 $('input[name=agentPhone]').val(data.agentPhone);
			    	}else{
			    		$('input[name=agentPhone]').val('');
			    	}
		    	}
		    	 
		    	this.sellerAgentFormValidation($('#sellerAgentDiv').find("form"));
		    	$("#sellerAgent").modal("show");
		 },
		 
		 fetchSellerAgentData:function(){
			 var self = this;
			 var investmentId = this.investmentId;
			 $.ajax({
					url: app.context()+'/closing/getSellerAgentData/'+investmentId,
	                contentType: 'application/json',
	                async : false,
	                dataType:'json',
	                type: 'GET',
	                success: function(res){
	                	self.sellerAgentData=res;
	                },
	                error: function(res){
	                	
	                }
					
				});
		 },
		 
		 saveSellerAgent:function(){
				var self = this;
				var currentModal=$("#sellerAgent");
				if($('#sellerAgentForm').validate().form()){
					var postData = {};
					var unindexed_array = $('#sellerAgentForm').serializeArray();
					$.map(unindexed_array, function(n, i){
						var value=n['value'];
						var name=n['name'];
						postData[name]=value;
					});
					postData["investmentId"]=this.investmentId;
					
					
					$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
					$.ajax({
			                url: app.context()+'/closing/saveOrUpdateSellerAgent',
			                async:true,
			                contentType: 'application/json',
			                dataType:'json',
			                type: 'POST',
			                data: JSON.stringify(postData),
			                success: function(res){
			                	$.unblockUI();
			                	$("#sellerAgent").modal("hide");
			                	$("#sellerAgent").on('hidden.bs.modal', function (e) {
				                	self.render();
				                	self.saveTransactionMemUtility(self.processRoleId, self.otherTransMemsData.agentId, self.roleName, currentModal);
				                	$('#transMemsSuccessMsg').show();
									$('#transMemsSuccessMsg > text').html("Successfully updated seller agent.");
							        App.scrollTo($('#transMemsSuccessMsg'), -200);
							        $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
			                	});
			                	//self.refreshContactsTab();
			                },
							error   : function ( mod, res ) {
								$.unblockUI();
//								var error1 = $('#sellerAgentFormFailure');
//								error1.show();
//		                    	App.scrollTo(error1, -200);
//		                    	error1.delay(2000).fadeOut(2000);
		                    	$('#transMemsFailureMsg').show();
								$('#transMemsFailureMsg > text').html("Error in updating seller agent.");
						        App.scrollTo($('#transMemsFailureMsg'), -200);
						        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);
								
							}
					});
				}

			},
			sellerAgentFormValidation:function(currentForm){
				var form1 = currentForm;

				form1.validate({
					errorElement: 'span', //default input error message container
					errorClass: 'help-block', // default input error message class
					focusInvalid: false, // do not focus the last invalid input
					ignore: "",
					rules: {
						agentName: {
							required: true
						},
						agentPhone: {
							number:true,
							required: true
						},
						agentEmail: {
							required: true,
							email: true
						}
					},

					invalidHandler: function (event, validator) { //display error alert on form submit              

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
			
			showEscrowCompanyModal:function(){
		    	var self=this;
		    	var escrowCompanyTemplate= _.template(escrowCompanyPage);
		    	var investmentId=this.investmentId;
		    	var escrowOrganizationId = null;
		    	var serviceName='Escrow-Service';
		    	this.fetchCompaniesByService(serviceName);
		    	
		    	var investmentProps = self.otherTransMemsData;
		    	
		    	$("#escrowcompanyDiv").html(" ");
		    	$("#escrowcompanyDiv").html(
		    			escrowCompanyTemplate({
				    				states:self.states,
				    				escrowOrganization:{},
				    				escrowOrganizationContact:{},
				    				escrowOrgList:self.escrowCompanies
			    				})
		    				);
		    	
	    		$('select[name= escrowCompanyDropdown]').val(investmentProps.escrowCompanyId);
		    	$("#escrowcompany").modal("show");
		     },
		     
		     saveEscrowCompany:function(){
		    	 var self=this;
		    	 var obj={};
		    	 var escrowCompany=$("#escrowCompanyDropdown option:selected").val();
		    	 var currentModal=$("#escrowcompany");
		    	
		    	 var investmentId=self.investmentId;
		    	 if(escrowCompany=='addNewEscrow'){
		    		 obj.companyName=$("#companyName").val();

			    	 if(jQuery.isEmptyObject(obj.companyName)){
			    		 $('#escrowCompanyFormMsg').show();
			    		 $('#escrowCompanyFormMsg > text').val('Please enter company name');
					     $('#escrowCompanyFormMsg').delay(2000).fadeOut(2000); 
					     return;
			    	 }
		    		 obj.contactName=$("#contactName").val();
		    		 obj.address1=$("#address1").val();
		    		 obj.address2=$("#address2").val();
		    		 obj.city=$("#city").val();
		    		 obj.state=$("#state").val();
		    		 obj.postalCode=$("#postalCode").val();
		    		 obj.phone1=$("#phone1").val();
		    		 obj.phone2=$("#phone2").val();
		    		 obj.fax=$("#fax").val();
		    		 obj.email=$("#email").val();
		    	 }
		    	 else{
		    		 obj.escrowCompanyId=escrowCompany;
		    		 
			    	 if(jQuery.isEmptyObject(escrowCompany)){
			    		 $('#escrowCompanyFormMsg').show();
					     $('#escrowCompanyFormMsg').delay(2000).fadeOut(2000); 
					     return;
			    	 }
		    	 }
		    	 
		    	 $.ajax({
		                url: app.context()+'closing/saveEscrowCompany/'+investmentId,
		                contentType: 'application/json',
		                dataType:'json',
		                type: 'POST',
		                data:JSON.stringify(obj),
		                success: function(res){
		                	$("#escrowcompany").modal("hide");
		                	$("#escrowcompany").on('hidden.bs.modal', function (e) {
		                		self.render();
		                		self.saveTransactionMemUtility(self.processRoleId, self.otherTransMemsData.escrowCompanyId, self.roleName, currentModal);
		                		$('#transMemsSuccessMsg').show();
								$('#transMemsSuccessMsg > text').html("Successfully updated escrow company.");
						        App.scrollTo($('#transMemsSuccessMsg'), -200);
						        $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
	                    	});
		                	//self.refreshContactsTab();
		                },
		                error: function(res){
		                	self.render();
		                	$('#transMemsFailureMsg').show();
							$('#transMemsFailureMsg > text').html("Error in updating escrow company.");
					        App.scrollTo($('#transMemsFailureMsg'), -200);
					        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);
		                }
		            });
		     },
		     
		     fetchCompaniesByService : function(serviceName){
					
					var self=this;
					
			    	 var allCompaniesResponseObject = $.ajax({
							type : "GET",
							url : app.context()+ "/company/service/"+serviceName,
							async : false
						});
			    	 allCompaniesResponseObject.done(function(response) {
							self.escrowCompanies=response;
						});
			    	 allCompaniesResponseObject.fail(function(response) {
							
						});
			},
			 showRehabVendorModal: function(){
		    	 var self=this;
				 var usersDropdownTemplate = _.template(rehabVendorPage);
				 this.fetchRehabVendorsAndServices();
				 $('#rehabVendorDiv').html(usersDropdownTemplate({name:'rehabVendor',id:'rehabVendor',users:self.rehabVendors,addBlankFirstOption:true}));
				 //$('#rehabVendorDiv').css({"margin-right":"280px","margin-bottom":"10px"});
				 //$('select[id=insuranceVendorDropdown]').val(investmentProps.insuranceVendorId);
				 $("#rehabVendor").modal("show");
			 },
			 fetchRehabVendorsAndServices:function(){
		         var self = this;
		         $.ajax({
		           url: app.context() + '/company/rehabVendorsAndServices',
		           contentType: 'application/json',
		           type: 'GET',
		           async:false,
		           success: function(res){
		            self.rehabVendors=res.rehabVendors;
		           },
		           error: function(res){
		        	   self.rehabVendors=[];
		           }
		         });
		     },
			 saveRehabVendor : function(){
				 var self=this;
				 self.vendorId=$('#rehabVendorDiv').find('[name=rehabVendor] option:selected').val();
				 var initialRehabId=self.otherTransMemsData.initialRehabId;
				 var currentModal=$("#rehabVendor");
				 self.saveTransactionMemUtility(self.processRoleId, self.vendorId, self.roleName, currentModal);
				 $.ajax({
					 url: app.context()+'/rehab/saveRehabVendor/'+initialRehabId+'/'+self.vendorId,
		             contentType: 'application/json',
		             async : false,
		             dataType:'text',
		             type: 'GET',
		             success: function(res){
		            	 
		            	$("#rehabVendor").modal("hide");
		             	//$("#rehabVendor").on('hidden.bs.modal', function (e) {
		             		self.render();
		             		$('#transMemsSuccessMsg').show();
							$('#transMemsSuccessMsg > text').html("Successfully updated rehab vendor.");
						    App.scrollTo($('#transMemsSuccessMsg'), -200);
						    $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
		             	//});
		             },
		             error: function(res){
		            	$("#rehabVendor").modal("hide");
		            	self.render();
		             	$('#transMemsFailureMsg').show();
						$('#transMemsFailureMsg > text').html("Error in updating rehab vendor.");
				        App.scrollTo($('#transMemsFailureMsg'), -200);
				        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);

		             }
					});
				 $('body').removeClass('modal-open');
					$('.modal-backdrop').remove();
			 },
			 
			 openUserDropdownModal: function(evt){
				 var self=this;
				 var currTarget=$(evt.currentTarget);
				 
				 self.processRoleId=currTarget.data("processroleid");
				 //self.currentTranMemberTarget=currTarget;
				 var roleName=currTarget.data('rolename');
				 var userId=currTarget.data('userid');
				 self.fetchUsersByRoleName(roleName);
				 self.roleName=roleName;
				 var usersDropdownTemplate = _.template(usersDropdown);
				 
				 $('#transactionMemberClosingDiv').html(usersDropdownTemplate({name:'transUser',id:'transUser',users:self.transUsers,addBlankFirstOption:true,investorName:null}));
				 $('#transactionMemberClosingDiv').css({"margin-right":"280px","margin-bottom":"10px"});
				 $("[name=transUser]").val(userId);
				 
				 $('#transMemberClosing').find('.modal-title').html(roleName);
				 $("#transMemberClosing").modal("show");
			 },
			 fetchUsersByRoleName:function(roleName){
		    	 var self = this;
				 $.ajax({
						url: app.context()+'/user/'+roleName,
		                contentType: 'application/json',
		                async : false,
		                dataType:'json',
		                type: 'GET',
		                success: function(res){
		                	self.transUsers=res;
		                },
		                error: function(res){
		                }
						
					});
			 },
			 saveTransactionMember : function(){
				 var self=this;
				 var userId=$('#transactionMemberClosingDiv').find('[name=transUser] option:selected').val();
				 $.ajax({
					 url: app.context()+'/transactionMembers/save/'+self.processRoleId+'/'+userId,
		             contentType: 'application/json',
		             async : false,
		             dataType:'text',
		             type: 'GET',
		             success: function(res){
		            	 
		            	$("#transMemberClosing").modal("hide");
		            	$("#transMemberClosing").on('hidden.bs.modal', function (e) {
		            		self.render();
		            		$('#transMemsSuccessMsg').show();
							$('#transMemsSuccessMsg > text').html("Successfully updated "+self.roleName +".");
						    App.scrollTo($('#transMemsSuccessMsg'), -200);
						    $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
		            	});

		             },
		             error: function(res){
		            	$("#transMemberClosing").modal("hide"); 
		            	$("#transMemberClosing").on('hidden.bs.modal', function (e) {
			            	self.render();
			             	$('#transMemsFailureMsg').show();
							$('#transMemsFailureMsg > text').html("Error in updating  "+self.roleName +".");
					        App.scrollTo($('#transMemsFailureMsg'), -200);
					        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);
		            	});
		             }
					});
			 },
			 
			 showGenericVendorModal: function(evt){
		    	 var self=this;
				 var currTarget=$(evt.currentTarget);
				 
				 self.processRoleId=currTarget.data("processroleid");
				 var roleName=currTarget.data('rolename');
				 self.roleName=roleName;
				 var serviceName={};
				 if(roleName.indexOf('Lawn Care')>-1){
					 serviceName='Lawn Care';
				 }else if(roleName.indexOf('Winterazation')>-1){
					 serviceName='Winterazation';
				 }else if(roleName.indexOf('Maintenance Vendor')>-1){
					 serviceName='Contractor - General';
				 }
				 var companyDropDownTemplate = _.template(genericCompanyDropDown);
				 this.fetchCompaniesByService(serviceName);
				 $('#genericVendor').find('.modal-title').html(roleName);
				 $('#genericVendorDiv').html(companyDropDownTemplate({orgList:self.escrowCompanies}));
				 $("#genericVendor").modal("show");
			 },
			 
			 saveGenericVendor : function(){
				 var self=this;
				 var userId=$('#genericVendorDiv').find('[name=genericCompanyDropdown] option:selected').val();
				 if(userId){
					 $.ajax({
						 url: app.context()+'/transactionMembers/save/'+self.processRoleId+'/'+userId,
			             contentType: 'application/json',
			             async : false,
			             dataType:'text',
			             type: 'GET',
			             success: function(res){
			            	 
			            	$("#genericVendor").modal("hide");
			            	$("#genericVendor").on('hidden.bs.modal', function (e) {
			            		self.render();
			            		$('#transMemsSuccessMsg').show();
								$('#transMemsSuccessMsg > text').html("Successfully updated "+self.roleName +".");
							    App.scrollTo($('#transMemsSuccessMsg'), -200);
							    $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
			            	});
	
			             },
			             error: function(res){
			            	$("#genericVendor").modal("hide"); 
			            	$("#genericVendor").on('hidden.bs.modal', function (e) {
				            	self.render();
				             	$('#transMemsFailureMsg').show();
								$('#transMemsFailureMsg > text').html("Error in updating  "+self.roleName +".");
						        App.scrollTo($('#transMemsFailureMsg'), -200);
						        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);
			            	});
			             }
						});
				 }else{
					 	$("#genericVendor").modal("hide");
					 	$('#transMemsFailureMsg').show();
						$('#transMemsFailureMsg > text').html("Error in updating  "+self.roleName +".");
				        App.scrollTo($('#transMemsFailureMsg'), -200);
				        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);
				 }
			 },
			 
			 showAddEscrowForm : function(){
					var escrowCompany=$("#escrowCompanyDropdown option:selected").val();
					
					if(escrowCompany=='addNewEscrow'){
						$('.addEscrowForm').show();
					}
					else{
						$('.addEscrowForm').hide();
					}
			},
			saveTransactionMemUtility:function(processRoleId,userId,roleName,currentModal){
				var self=this;
				$.ajax({
					 url: app.context()+'/transactionMembers/save/'+processRoleId+'/'+userId,
		             contentType: 'application/json',
		             async : false,
		             dataType:'text',
		             type: 'GET',
		             success: function(res){
		            	 
		            	//currentModal.modal("hide");
		            	//currentModal.on('hidden.bs.modal', function (e) {
		            		self.render();
		            		$('#transMemsSuccessMsg').show();
							$('#transMemsSuccessMsg > text').html("Successfully updated "+roleName +".");
						    App.scrollTo($('#transMemsSuccessMsg'), -200);
						    $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
		            	//});
	
		             },
		             error: function(res){
		            	//currentModal.modal("hide"); 
		            	//currentModal.on('hidden.bs.modal', function (e) {
			            	self.render();
			             	$('#transMemsFailureMsg').show();
							$('#transMemsFailureMsg > text').html("Error in updating  "+roleName +".");
					        App.scrollTo($('#transMemsFailureMsg'), -200);
					        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);
		            	//});
		             }
					});
			},
			
			showProcessRelatedInfo: function(evt){
				 var self=this;
				 var currTarget=$(evt.currentTarget);
				 
				 self.processRoleId=currTarget.data("processroleid");
				 self.roleName=currTarget.data('rolename');
				 self.userId=currTarget.data('userid');
			},
			
			fetchStates:function(){
		    	 var self=this;
		    	 var allStatesResponseObject = $.ajax({
						type : "GET",
						url : app.context()+ "/state/all",
						async : false
					});
					allStatesResponseObject.done(function(response) {
						self.states=response;
					});
					allStatesResponseObject.fail(function(response) {
						
					});
		     }
	});
	return TransactionMemberView;
});