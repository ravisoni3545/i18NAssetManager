define(["backbone","app","text!templates/ownershipType.html","views/codesView","text!templates/genericDropdown.html",
        "views/stateCodesView","components-dropdowns","components-pickers"],
	function(Backbone,app,ownershipPage,codesView,genericDropdown,stateCodesView){
		var ownershipTypeView=Backbone.View.extend({
			 initialize: function(){
				 this.ownershipTypeCodesView = new codesView({codeGroup:'OWNER_TYPE'});
				 this.relationshipTypeView = new codesView({codeGroup:'REL_TYPE'});
				 this.stateCodesView=new stateCodesView();
			 },
			 events:{
				 "change #ownershipTypeDropdown" : "showOwnershipTemplates",
				 "change #coBuyerDropdown" : "showCoBuyerDetails",
				 "change #investorOrgDropdown" : "showOrganizationTemplate",
				 "click .showAddressDiv":"showAddressDiv",
				 "click .hideAddressDiv":"hideAddressDiv",
				 'keyup .showExistingAddress': 'showExistingAddress',
				 'change .showExistingAddress': 'showExistingAddress',
				 'click .existingaddress':'showAddressDiv',
				 'change #copyInvestorAddress' :'populateInvestorAddress',
				 "click #saveOwnership":"saveOwnership"
			 },
//			 el:"#ownershipDiv",
//			 el:null,
			 ownershipTypeModel:{},
			 render: function (){
		    	 	var self = this;
			    	self.fetchOwnershipDetails();
			    	 
			    	var ownershipTemplate= _.template(ownershipPage);
					self.$el.html(" ");
					self.$el.html(
			    			ownershipTemplate({
					    				ownershipData:self.ownershipResponse
				    				})
			    				);
					this.ownershipTypeCodesView.callback = function() {
						if(!self.ownershipResponse.ownershipType){
				    		$("#ownershipTypeDropdown select[name='ownershipType']").val('');
				    	}else{
				    		$("#ownershipTypeDropdown select[name='ownershipType']").val(self.ownershipResponse.ownershipType);
				    	}
						self.showOwnershipTemplates();
					}
			    	this.ownershipTypeCodesView.render({el:$('#ownershipTypeDropdown'),codeParamName:"ownershipType",addBlankFirstOption:true});
			    	var genericDropdownTemplate = _.template(genericDropdown);
			    	this.fetchCoBuyers(self.investorId);
			    	$('#coBuyerDropdown').html('');
			    	$('#coBuyerDropdown').html(genericDropdownTemplate({name:'coBuyerId',id:'coBuyerId',items:this.coBuyers,addBlankFirstOption:true,addNewOption:true}));
			    	this.fetchInvestorOrgs(self.investorId);
			    	$('#investorOrgDropdown').html('');
			    	$('#investorOrgDropdown').html(genericDropdownTemplate({name:'orgId',id:'orgId',items:this.investorOrgs,addBlankFirstOption:true,addNewOption:true}));
			    	
			    	this.relationshipTypeView.callback = function() {
				    	if(self.ownershipResponse.ownershipType=='42'){
				    		$("#co-buyer-reln select[name='relationType']").val(self.ownershipResponse.coBuyerRelation);
			    		}else{
		    				$("#coBuyerDropdown select[name='coBuyerId'] option:contains('Select')").attr('selected', true);
		    			}
		    			self.showCoBuyerDetails();
		    			$("#co-buyer-reln select[name='relationType']").val(self.ownershipResponse.coBuyerRelation);
		    			$("#organization").prop('disabled', true);
		    			//$(".singleform").show();
		    			//$(".multipleform").show();
			    	}
			    	this.relationshipTypeView.render({el:$('.relationTypeDropdown'),codeParamName:"relationType",addBlankFirstOption:true});
			    	this.stateCodesView.render({el:$("#coBuyerStateDropdown").find('.state')});
			    	if(!self.ownershipResponse.ownershipType){
			    		$("#ownershipTypeDropdown select[name='ownershipType']").val('');
			    	}else{
			    		$("#ownershipTypeDropdown select[name='ownershipType']").val(self.ownershipResponse.ownershipType);
			    	}
			    	if(self.ownershipResponse.ownershipType=='41'){
			    		$("#coBuyerLegalName").prop('disabled', true);
		    			$("#coBuyerPhone").prop('disabled', true);
		    			$("#coBuyerEmail").prop('disabled', true);
		    			$("#organization").prop('disabled', true);
			    		$(".singleform").show();
			    	}
			    	else if(self.ownershipResponse.ownershipType=='42'){
			    		if(!jQuery.isEmptyObject(self.ownershipResponse.coBuyerId)){
			    			$("#coBuyerDropdown select[name='coBuyerId']").val(self.ownershipResponse.coBuyerId);
		    			}else{
		    				$("#coBuyerDropdown select[name='coBuyerId'] option:contains('Select')").attr('selected', true);
		    			}
		    			self.showCoBuyerDetails();
		    			$("#co-buyer-reln select[name='relationType']").val(self.ownershipResponse.coBuyerRelation);
		    			$("#organization").prop('disabled', true);
		    			$(".singleform").show();
		    			$(".multipleform").show();
		    		}  		
		    		else if(self.ownershipResponse.ownershipType=='43'){
		    			if(!jQuery.isEmptyObject(self.ownershipResponse.orgId)){
		    				$("#investorOrgDropdown select[name='orgId']").val(self.ownershipResponse.orgId);
		    			}else{
		    				$("#investorOrgDropdown select[name='orgId'] option:contains('Select')").attr('selected', true);
		    			}
		    			
		    			$("#coBuyerLegalName").prop('disabled', true);
		    			$("#coBuyerPhone").prop('disabled', true);
		    			$("#coBuyerEmail").prop('disabled', true);
		    			$(".singleform").show();
		    			$(".orgform").show();
		    			self.showOrganizationTemplate();
		    		}
			    	this.showOwnershipTemplates();
			    	
		    		if($.inArray('NPIManagement', app.sessionModel.attributes.permissions)==-1){
			    		 $(".dob").remove();
						 $(".ssn").remove();
					}
		    		
			    	$("#ownershiptype").modal("show");
			    	this.ownershipFormValidation($('#ownershiptype').find("form"));
			    	ComponentsPickers.init();
			 },
			 fetchOwnershipDetails:function(){
				 var self=this;
				 $.ajax({
		                url: app.context()+'ownership/'+self.ownershipTypeModel.object+'/'+self.ownershipTypeModel.objectId,
		                contentType: 'application/json',
		                dataType:'json',
		                type: 'GET',
		                async:false,
		                success: function(res){
		                	self.ownershipResponse=res;
		                	self.investorId=res.investorId;
		                },
		                error: function(res){
		                	console.log("Fetching ownershipType details failed");
		                }
		            });
			 },
		    fetchCoBuyers:function(investorId){
		    	 var self = this;
				 var investorId = this.investorId;
				 $.ajax({
						url: app.context()+'/contact/getCoBuyerList/'+investorId,
		                contentType: 'application/json',
		                async : false,
		                dataType:'json',
		                type: 'GET',
		                success: function(res){
		                	self.coBuyers=res;
		                },
		                error: function(res){
		                	
		                }
						
					});
		     },
		     
		     fetchInvestorOrgs:function(investorId){
		    	 var self = this;
				 var investorId = this.investorId;
				 $.ajax({
						url: app.context()+'/organization/getInvestorOrganizations/'+investorId,
		                contentType: 'application/json',
		                async : false,
		                dataType:'json',
		                type: 'GET',
		                success: function(res){
		                	self.investorOrgs=res;
		                },
		                error: function(res){
		                	
		                }
						
					});
		     },
		     
			 showOwnershipTemplates:function(){
		    	 var self = this;
		    	 var ownershipVal=$("#ownershipTypeDropdown option:selected").text().trim();
		    	 if(ownershipVal=="Single"){
		    		$(".singleform").show();
		    		$("#coBuyerLegalName").prop('disabled', true);
		    		$("#coBuyerPhone").prop('disabled', true);
		    		$("#coBuyerEmail").prop('disabled', true);
		    		$("#coBuyerAddress1").prop('disabled', true);
		    		$("#coBuyerStateDropdown select[name='state']").attr('disabled', true);
		    		$("#coBuyerPostalCode").prop('disabled', true);
		    		$("#organization").prop('disabled', true);
		    		$('.showCoBuyer').hide();
					$(".multipleform").hide();
					$(".addOrg").hide(); 
					$(".orgform").hide();
		    	 }
		    	 else if(ownershipVal=="Multiple"){
		    		$(".singleform").show();
		    		$(".showCoBuyer .form-group").removeClass('has-error');
		    		$(".showCoBuyer .help-block").remove();
//		    		$(".showCoBuyer .hidesdiv1 .form-group").removeClass('has-error');
//		    		$("#coBuyerStateDropdown").find(".help-block").remove();
		    		$(".orgform .form-group").removeClass('has-error'); 
		    		$(".orgform .help-block").remove();
		    		$("#coBuyerLegalName").prop('disabled', false);
			    	$("#coBuyerPhone").prop('disabled', false);
			    	$("#coBuyerEmail").prop('disabled', false);
		    		$("#coBuyerAddress1").prop('disabled', false);
		    		$("#coBuyerStateDropdown select[name='state']").attr('disabled', false);
		    		$("#coBuyerPostalCode").prop('disabled', false);
	    		    $("#organization").prop('disabled', true);
	    		    if(!jQuery.isEmptyObject(self.ownershipResponse.coBuyerId)){
		    			$("#coBuyerDropdown select[name='coBuyerId']").val(self.ownershipResponse.coBuyerId);
	    			}else{
	    				$("#coBuyerDropdown select[name='coBuyerId'] option:contains('Select')").attr('selected', true);
	    			}
	    			self.showCoBuyerDetails();
	    			$("#co-buyer-reln select[name='relationType']").val(self.ownershipResponse.coBuyerRelation);
	    			$(".hidesdiv1").hide();
					$(".viewsdiv1").show();
					$(".multipleform").show();
					$(".addOrg").hide(); 
					$(".orgform").hide();
			     }
		    	 else if(ownershipVal=="Organization"){
		    		$(".singleform").show();
		    		$(".showCoBuyer .form-group").removeClass('has-error');
		    		$(".showCoBuyer .help-block").remove();
		    		$(".orgform .form-group").removeClass('has-error'); 
		    		$(".orgform .help-block").remove();
		    		$("#coBuyerLegalName").prop('disabled', true);
		    		$("#coBuyerPhone").prop('disabled', true);
		    		$("#coBuyerEmail").prop('disabled', true);
		     		$("#coBuyerAddress1").prop('disabled', true);
		     		$("#coBuyerStateDropdown select[name='state']").attr('disabled', true);
		     		$("#coBuyerPostalCode").prop('disabled', true);
		    		$("#organization").prop('disabled', false);
		    		if(!jQuery.isEmptyObject(self.ownershipResponse.orgId)){
	    				$("#investorOrgDropdown select[name='orgId']").val(self.ownershipResponse.orgId);
	    			}else{
	    				$("#investorOrgDropdown select[name='orgId'] option:contains('Select')").attr('selected', true);
	    			}
		    		$('.showCoBuyer').hide();
					$(".multipleform").hide();
//		    		$('.showCoBuyer').show();
//		    		$(".multipleform").show();
		    		$("#organization").prop('disabled', true); 
					$(".addOrg").hide(); 
					$(".orgform").show();
			     }else {
			    	 $('.showCoBuyer').hide();
			    	 $(".multipleform").hide();
					 $(".addOrg").hide(); 
					 $(".orgform").hide();
			     }
		     },
		     showCoBuyerDetails:function(){
		    	 var self = this;
		    	 var coBuyerIdText=$("#coBuyerDropdown option:selected").text().trim();
		    	 var coBuyerId=$("#coBuyerDropdown option:selected").val();
		    	 
		    	 if(coBuyerIdText=='Select'){
		    		 $('.showCoBuyer').hide();
	    		 }else if(coBuyerIdText=='Add New'){
    			 
    			    $("#coBuyerLegalName").val('');
	    			$("#coBuyerDob").val('');
	    			$("#coBuyerSSN").val('');
	    			$("#co-buyer-reln select[name='relationType'] option:contains('select')").attr('selected',true);
	    			$("#coBuyerPhone").val('');
	    			$("#coBuyerEmail").val('');
	    			$("#coBuyerProfession").val('');
	    			$("#coBuyerAddress1").val('');
	    			$("#coBuyerAddress2").val('');
	    			$("#coBuyerCity").val('');
	    			$("#coBuyerStateDropdown select[name='state'] option:contains('Select')").attr('selected', true);
	    			$("#coBuyerPostalCode").val('');
	    			$(".existingaddress").val('');
	    			$('.showCoBuyer').show();
	    		 }else{
		    	 
			    	 $.ajax({
						url: app.context()+'/contact/read/'+coBuyerId,
		                contentType: 'application/json',
		                async : false,
		                dataType:'json',
		                type: 'GET',
		                success: function(res){
		                	self.coBuyerData=res;
		                },
		                error: function(res){
		                	
		                }
					});
			    	if(!jQuery.isEmptyObject(self.coBuyerData)){
		    			$("#coBuyerLegalName").val(self.coBuyerData.legalName);
		    			$("#coBuyerDob").val(self.coBuyerData.dateOfbirth);
		    			$("#coBuyerSSN").val(self.coBuyerData.ssn);
		    			$("#co-buyer-reln select[name='relationType'] option:contains(" + self.coBuyerData.relationship + ")").attr('selected', 'selected');
		    			$("#coBuyerPhone").val(self.coBuyerData.phoneHome);
		    			$("#coBuyerEmail").val(self.coBuyerData.email);
		    			$("#coBuyerProfession").val(self.coBuyerData.profession);
		    			$("#coBuyerAddress1").val(self.coBuyerData.address1);
		    			$("#coBuyerAddress2").val(self.coBuyerData.address2);
		    			$("#coBuyerCity").val(self.coBuyerData.city);
	    			    if(!jQuery.isEmptyObject(self.coBuyerData.state)){
	    			    	$("#coBuyerStateDropdown select[name='state']").val(self.coBuyerData.state);
		    			}else{
		    				$("#coBuyerStateDropdown select[name='state'] option:contains('Select')").attr('selected', true);
		    			}
	    			    $("#coBuyerPostalCode").val(self.coBuyerData.postalCode);
	    			    this.setExistingAddress();
		    			$('.showCoBuyer').show(); 
	    		 	}
	    		 }
		    	 
		     },
		     setExistingAddress : function(){
		    	 var currState=$("#coBuyerStateDropdown select[name=state] option:selected").val();
			        var str;
			        var strArray = [];
			        var addressArray=[];
			        var fullArray=[];
	                  
			        if($("#coBuyerAddress1").val()){
			        	addressArray.push($("#coBuyerAddress1").val());
			        } 
			        if($("#coBuyerAddress2").val()){
			        	addressArray.push($("#coBuyerAddress2").val());
			        } 
			        if($("#coBuyerCity").val()){
			        	strArray.push($("#coBuyerCity").val());
			        } 
			        if($("#coBuyerStateDropdown select[name=state]").val()&&currState!=""){
			        	strArray.push($("#coBuyerStateDropdown select[name=state]").val());
			        } 
			        if($("#coBuyerPostalCode").val()){
			        	strArray.push($("#coBuyerPostalCode").val());
			        } 
			        fullArray.push(addressArray.join(' ,'));
			        fullArray.push(strArray.join(' ,'));
			        $(".existingaddress").val(fullArray.join(',\n')); 
		     },
		     showOrganizationTemplate:function(){
		    	 var orgIdText=$("#investorOrgDropdown option:selected").text().trim();
		    	 if(orgIdText=='Select'){
//		    		$("#organization").removeClass('has-error'); 
		    		$(".orgform .form-group").removeClass('has-error'); 
		    		$(".orgform .help-block").remove();
		    		$("#organization").prop('disabled', true); 
		    		$(".addOrg").hide();
	    		 }else if(orgIdText=='Add New'){
//	    			$("#organization").removeClass('has-error'); 
	    			$(".orgform .form-group").removeClass('has-error'); 
		    		$(".orgform .help-block").remove();
	    			$("#organization").prop('disabled', false); 
	    			$(".addOrg").show(); 
			     }else {
//			    	$("#organization").removeClass('has-error'); 
			    	$(".orgform .form-group").removeClass('has-error'); 
		    		$(".orgform .help-block").remove();
			    	$("#organization").prop('disabled', true); 
			    	$(".addOrg").hide(); 
			     }
		     },
	         showAddressDiv :function(evt){
					
				$(evt.currentTarget).closest("form").find(".viewsdiv1").hide();
				$(evt.currentTarget).closest("form").find(".hidesdiv1").show();
			},
			hideAddressDiv :function(evt){
				$(evt.currentTarget).closest("form").find(".hidesdiv1").hide();
				$(evt.currentTarget).closest("form").find(".viewsdiv1").show();
			},
			
			showExistingAddress :function(evt){
				var currentForm = $(evt.currentTarget).closest("form");
				var str;
				var strArray = [];
		        var addressArray=[];
		        var fullArray=[];
				var currentState=currentForm.find("[name=state] option:selected").val() ;
				if(currentForm.find("[name=coBuyerAddress1]").val()){
					addressArray.push(currentForm.find("[name=coBuyerAddress1]").val());
				}
				
				if(currentForm.find("[name=coBuyerAddress2]").val()){
					addressArray.push(currentForm.find("[name=coBuyerAddress2]").val());
				}
				if(currentForm.find("[name=coBuyerCity]").val()){
					strArray.push(currentForm.find("[name=coBuyerCity]").val());
				}
				
				if(currentForm.find("#coBuyerStateDropdown select[name=state]").val()&&currentState!=""){
					strArray.push(currentForm.find("#coBuyerStateDropdown select[name=state]").val());
				}
				if(currentForm.find("[name=coBuyerPostalCode]").val()){
					strArray.push(currentForm.find("[name=coBuyerPostalCode]").val());
				}
				fullArray.push(addressArray.join(" ,"));
				fullArray.push(strArray.join(" ,"));
				currentForm.find(".existingaddress").val(fullArray.join(",\n"));
				
			},
			populateInvestorAddress: function() {
				 var self=this;
				 
				 if(self.investorAddress==null){
					 $.ajax({
			                url: app.context()+'ownership/getInvestorAddress/'+self.investorId,
			                contentType: 'application/json',
			                dataType:'json',
			                type: 'GET',
			                async:false,
			                success: function(res){
			                	self.investorAddress=res;
			                },
			                error: function(res){
			                	console.log("Fetching investor address details failed");
			                }
			            });
				 }
				if ($("#copyInvestorAddress").prop("checked")){
					if(self.investorAddress!==null){
						$("#coBuyerAddress1").val(self.investorAddress.address1);
		    			$("#coBuyerAddress2").val(self.investorAddress.address2);
		    			$("#coBuyerCity").val(self.investorAddress.city);
	    			    if(!jQuery.isEmptyObject(self.investorAddress.state)){
	    			    	$("#coBuyerStateDropdown select[name='state']").val(self.investorAddress.state);
		    			}else{
		    				$("#coBuyerStateDropdown select[name='state'] option:contains('Select')").attr('selected', true);
		    			}
	    			    $("#coBuyerPostalCode").val(self.investorAddress.postalCode);
	    			    self.setExistingAddress();
					}
				}

			},
		    saveOwnership:function(){
		    	 var self=this;
		    	 var obj={};
		    	 obj.object=self.ownershipTypeModel.object;
		    	 obj.objectId=self.ownershipTypeModel.objectId;
		    	 
		    	 obj.ownershipType=$("#ownershipTypeDropdown option:selected").val();
		    	 obj.investorId = $("#investorId").val();
		    	 obj.investorLegalName=$("#ownershipInvLegalName").val();
		    	 obj.investorProfession=$("#investorProfession").val();
		    	 obj.investorDob=$("#investorDob").val();
		    	 obj.investorSSN=$("#investorSSN").val();
		    	 
		    	 var ownershipVal=$("#ownershipTypeDropdown option:selected").text().trim();
	    		 if(ownershipVal=='select'){
		    		 $('#ownershipTypeFormMsg > text').html('Please select ownershipType.');
		    		 $('#ownershipTypeFormMsg').show();
				     $('#ownershipTypeFormMsg').delay(2000).fadeOut(2000); 
	    			 return;
	    		 }
		    	 if(ownershipVal=="Multiple"){
		    		 var coBuyerIdText=$("#coBuyerDropdown option:selected").text().trim();
		    		 if(coBuyerIdText=='Select'){
			    		 $('#ownershipTypeFormMsg > text').html('Please select coBuyer.');
			    		 $('#ownershipTypeFormMsg').show();
					     $('#ownershipTypeFormMsg').delay(2000).fadeOut(2000); 
		    			 return;
		    		 }
		    		 obj.coBuyerId=$("#coBuyerDropdown option:selected").val();
			    	 obj.coBuyerLegalName=$("#coBuyerLegalName").val();
			    	 obj.coBuyerRelation=$("#co-buyer-reln option:selected").val();
			    	 obj.coBuyerDob=$("#coBuyerDob").val();
			    	 obj.coBuyerSSN=$("#coBuyerSSN").val();
			    	 obj.coBuyerPhone=$("#coBuyerPhone").val();
			    	 obj.coBuyerEmail=$("#coBuyerEmail").val();
			    	 obj.coBuyerProfession=$("#coBuyerProfession").val();
			    	 obj.coBuyerAddress1=$("#coBuyerAddress1").val();
			    	 obj.coBuyerAddress2=$("#coBuyerAddress2").val();
			    	 obj.coBuyerCity=$("#coBuyerCity").val();
			    	 obj.coBuyerState=$("#coBuyerStateDropdown option:selected").val();
			    	 obj.coBuyerPostalCode=$("#coBuyerPostalCode").val();
			     }
		    	 else if(ownershipVal=="Organization"){
		    		 var orgIdText=$("#investorOrgDropdown option:selected").text().trim();
		    		 if(orgIdText=='Select'){
			    		 $('#ownershipTypeFormMsg > text').html('Please select organization.');
			    		 $('#ownershipTypeFormMsg').show();
					     $('#ownershipTypeFormMsg').delay(2000).fadeOut(2000); 
		    			 return;
		    		 }
		    		 obj.orgId=$("#investorOrgDropdown  select[name='orgId']").val();
			    	 obj.organization=$("#organization").val();
			    }
		    	 
		    	if($('#ownershipTypeForm').validate().form()){ 
			    	 $.ajax({
			                url: app.context()+'ownership/saveOrUpdateOwnership',
			                contentType: 'application/json',
			                dataType:'text',
			                type: 'POST',
			                data:JSON.stringify(obj),
			                success: function(res){
			                	$("#ownershiptype").modal("hide");
			                	setTimeout(function(){$('.modal-backdrop').remove()},500)
			                	$('.modal-backdrop').fadeOut(400);
			                	self.trigger('ownershipTypeChangedSuccess');
			                },
			                error: function(res){
			                	$("#ownershiptype").modal("hide");
			                	setTimeout(function(){$('.modal-backdrop').remove()},500)
			                	$('.modal-backdrop').fadeOut(400);
			                	self.trigger('ownershipTypeChangedFailure');
			                }
			            });
		    	 }
		     },
		     ownershipFormValidation:function(currentForm){
				var form1 = currentForm;
				var hidesdiv1 = $('.hidesdiv1', form1);
				form1.validate({
					errorElement: 'span', 
					errorClass: 'help-block', 
					focusInvalid: false, 
					ignore: "",
					rules: {
						ownershipInvLegalName: {
							required: true
						},
						coBuyerLegalName: {
							required: true
						},
						coBuyerPhone: {
							number: true
						},
						coBuyerEmail: {
							required: true,email: true
						},
						coBuyerAddress1:{
							required: true
						},
						state:{
							required: true
						},
						coBuyerPostalCode:{
							number: true
						},
						organization:{
							required: true
						}
					},

					invalidHandler: function (event, validator) { 

					},

					highlight: function (element) { 
						$(element)
					.closest('.form-group').addClass('has-error'); 
						if ($(".hidesdiv1 .has-error", form1).length > 0){ 
							hidesdiv1.show();
						}
					},

					unhighlight: function (element) { 
						$(element)
						.closest('.form-group').removeClass('has-error'); 
			
					},

					success: function (label) {
						label
						.closest('.form-group').removeClass('has-error'); 
					}
				});

			}
		});
		return ownershipTypeView;
});
