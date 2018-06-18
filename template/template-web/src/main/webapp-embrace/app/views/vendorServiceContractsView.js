define(["text!templates/vendorServiceContracts.html","backbone","app","models/vendorServiceContractModel"
        ,"collections/vendorServiceContractsCollection","text!templates/contractPaymentRow.html","text!templates/existingPaymentTerm.html"],
	function(vendorServicesContractsPage, Backbone, app, vendorServiceContractModel,
			vendorServiceContractsCollection,contractPaymentRowPage,existingPaymentTermPage){

		var VendorServiceContractsView = Backbone.View.extend( {
			initialize: function(){
				 this.paymentcount=0;
			},
			coll: new vendorServiceContractsCollection(),
			model : new vendorServiceContractModel(),
		    currentcontractId:{} ,  
			el:"#vendorServiceContractsPortlet",
			paymentcount:{},
			self:this,
			feeType:{},
			paymentType:{},
			events: {
				//'click #addContractLink'   : 'openAddContractModal',
				'click #addcontractPaymentTerm':'addcontractPayment',
				'click #addPaymentRow':'addPaymentRow',
				'click #closeAddContractModal':'resetPaymentCount',
				"click a[name='deletePaymentRow']":"deletePaymentRow",
				'click #deleteContractPaymentLink'	:	'openDeletePaymentConfirmationModal',
				"click #deleteContractPaymentConfirmationButton":"deleteExistingPayment",
				"click a[name='addContractPaymentModal']":'showAddContractPaymentModal',
				'click #addContractButton'	:  'addVendorServiceContract',
				'click #editContractLink'	:	'openEditContractModal',
				'click #updateContractButton'	:	'updateVendorServiceContract',
				'click #deleteContractLink'	:	'openDeleteConfirmationModal',
				'click #deleteContractConfirmationButton'	:	'deleteVendorServiceContract',
				'click #reloadContractLink'	:	'refreshVendorServiceContracts',
				'hidden.bs.modal #add-contract-payment' :	'refreshVendorServiceContracts',
				"change select[name='paymentType']" :	"handlePaymentTypeChange"
			},
			addPaymentRow:function(){
				var rowtemplate = _.template( contractPaymentRowPage );
				if($('#contactPaymentTermTable tr').last().size()>0){
					$('#contactPaymentTermTable tr').last().after(rowtemplate({
						feeType:self.feeType,paymentType:self.paymentType}));
				}
				else{
					$('#newpaymentTerm').show();
					$('#contactPaymentTermTable').append(rowtemplate({
						feeType:self.feeType,paymentType:self.paymentType}));
				}
				app.currencyFormatter("","currencyTable");
			},
			handlePaymentTypeChange :	function(evt){
				var paymentType = $(evt.target).find(':selected').text();
				var i=-1;
				if(paymentType=='Flat Fee') {
					i=4;
				} else if(paymentType=='Percentage') {
					i=3;
				}
				var currentRow = $(evt.target).closest('tr');
				$(currentRow.children()).each(function(){
					$(this).find('input').removeAttr('disabled');
				});
				if(i!=-1) {
					var textBoxToBeDisabled = currentRow.find('td:nth-child('+i+') input');
					textBoxToBeDisabled.val('');
					textBoxToBeDisabled.attr('disabled','disabled');
				}
			},
			openDeletePaymentConfirmationModal : function(evt) {
				this.contractPaymentIdToBeDeleted = $(evt.currentTarget).data('paymentermid');
				this.contractIdForPaymentDeletion = $(evt.currentTarget).data('contractid');
			},
			deleteExistingPayment:function(evt){
				var self=this;
				var paymentTermId=this.contractPaymentIdToBeDeleted;
				var contractId=this.contractIdForPaymentDeletion;
				$.ajax({
	                url: app.context()+'/vendor/contract/deletePayment/'+contractId+"/"+paymentTermId,
	                contentType: 'application/json',
	                dataType:'text',
	                type: 'DELETE',
	                success: function(res){
	                	$('#optionDeleteContractPayment').modal('hide');
	    				$('#optionDeleteContractPayment').on('hidden.bs.modal', function(){
	    					self.successMessage="alertDeletePaymentTermsSuccess";
	    					$("a[data-recordid="+contractId+"]").click();
	    				});
	                },
	                error: function(res){
	                	$('#optionDeleteContractPayment').modal('hide');
	                	$('#optionDeleteContractPayment').on('hidden.bs.modal', function(){
		                	var error1 = $('#alertDeletePaymentTermsFailure', $('#paymentAlertsForm'));
		                	error1.show();
	   		             	App.scrollTo(error1, -200);
	   		             	error1.delay(2000).fadeOut(2000);
	                	});
	                }
	            });
				
			},
			validateContractRow:function(obj){
				var validation=true;
				var paymmentRegex=/^[0-9]{1,8}(\.[0-9]{1,2})?$/;
				var percentRegex=/^[0-9]{1,3}(\.[0-9]{1,2})?$/;
				
				var paymentType = obj.find("[name='paymentType']").find(':selected').text();
				if(paymentType=='Flat Fee') {
					if(!(paymmentRegex.test(obj.find("[name='flatFee']").val()))){
						obj.find("[name='flatFeeErrorMessage']").html(" ");
						obj.find("[name='flatFeeErrorMessage']").html("Enter valid data");
						validation=false;
						//return validation;
					}else{
						obj.find("[name='flatFeeErrorMessage']").html(" ");
					}
				} else if(paymentType=='Percentage') {
					if(!(paymmentRegex.test(obj.find("[name='percentage']").val()))){
						obj.find("[name='percentageErrorMessage']").html(" ");
						obj.find("[name='percentageErrorMessage']").html("Enter valid data");
						validation=false;
						//return validation;
					}else{
						obj.find("[name='percentageErrorMessage']").html(" ");
					}
				} else {
					if(!(paymmentRegex.test(obj.find("[name='flatFee']").val()))){
						obj.find("[name='flatFeeErrorMessage']").html(" ");
						obj.find("[name='flatFeeErrorMessage']").html("Enter valid data");
						validation=false;
						//return validation;
					}else{
						obj.find("[name='flatFeeErrorMessage']").html(" ");
					}
					if(!(paymmentRegex.test(obj.find("[name='percentage']").val()))){
						obj.find("[name='percentageErrorMessage']").html(" ");
						obj.find("[name='percentageErrorMessage']").html("Enter valid data");
						validation=false;
						//return validation;
					}else{
						obj.find("[name='percentageErrorMessage']").html(" ");
					}
				}
				return validation;
			},
			addcontractPayment:function(evt){
				var validation=false;
				var contractId=$(evt.currentTarget).data('recordid');
				var self=this;
				var paymentTerms=[];
				var existingPaymentTerms=[];
				evt.preventDefault();
				var contractId=$(evt.currentTarget).data('recordid');
				var contactPaymentvalidation=true;
				var existingcontactPaymentvalidation=true;
				var isValid = true;
				$('#contactPaymentTermTable').find('tr').each(function(){
					var obj={};
					contactPaymentvalidation=self.validateContractRow($(this));
					if(contactPaymentvalidation){
						$(this).find("[name='flatFeeErrorMessage']").html(" ");
						$(this).find("[name='percentageErrorMessage']").html(" ");
						obj.feeType=$(this).find("[name='feeType']").val();
						obj.paymentType=$(this).find("[name='paymentType']").val();
						obj.flatFee=$(this).find("[name='flatFee']").val();
						obj.percentage=$(this).find("[name='percentage']").val();
						paymentTerms.push(obj);
					}
					else{
						isValid = false;
					}
				});
				
				
				$('#existingcontactPaymentTermTable').find('tr').each(function(){
					var obj={};
					existingcontactPaymentvalidation=self.validateContractRow($(this));
					if(existingcontactPaymentvalidation){
							$(this).find("[name='flatFeeErrorMessage']").html(" ");
							$(this).find("[name='percentageErrorMessage']").html(" ");
							obj.feeType=$(this).find("[name='feeType']").val();
							obj.paymentType=$(this).find("[name='paymentType']").val();
							obj.flatFee=$(this).find("[name='flatFee']").val();
							obj.percentage=$(this).find("[name='percentage']").val();
							obj.contractId=$(this).find("[name='deleteExistingPaymentRow']").attr('data-contractid');
							obj.paymentTermId=$(this).find("[name='deleteExistingPaymentRow']").attr('data-paymentermid');
							existingPaymentTerms.push(obj);
						}
					else{
						isValid = false;
					}
					
				});
				
				var postData={};
				postData.paymentTerms=paymentTerms;
				postData.existingPaymentTerms=existingPaymentTerms;
				
				if(isValid){
					$.ajax({
		                url: app.context()+'/vendor/contract/createPayment/'+contractId,
		                contentType: 'application/json',
		                dataType:'text',
		                type: 'POST',
		                data:JSON.stringify(postData),
		                success: function(res){
	//	                	$("#add-contract-payment").modal('hide');
	//	                	$('div.modal-backdrop.fade.in').remove();
		                	self.successMessage="alertSavePaymentTermsSuccess";
		                	$("a[data-recordid="+contractId+"]").click();
		                },
		                error: function(res){
		                	var error1 = $('#alertSavePaymentTermsFailure', $('#paymentAlertsForm'));
		                	error1.show();
	   		             	App.scrollTo(error1, -200);
	   		             	error1.delay(2000).fadeOut(2000);
		                }
		            });
				}
			},
			showAddContractPaymentModal:function(evt){
				evt.preventDefault();
				var existingContext=this;
				var contractId=$(evt.currentTarget).data('recordid');
				var exitingpaymentTerm;
				var rowtemplate = _.template( contractPaymentRowPage );
				$('#addcontractPaymentTerm').data('recordid', contractId);
				var existingPaymentTermTemplate=_.template( existingPaymentTermPage );
				if(!self.feeType) {
					this.fetchFeeType();
				}
				if(!self.paymentType) {
					this.fetchPaymentType();
				}
				$.ajax({
	                url: app.context()+'/vendor/contract/'+contractId,
	                contentType: 'application/json',
	                dataType:'json',
	                type: 'GET',
	                async:false,
	                success: function(res){
	                	$('#newpaymentTerm').hide();
	    				$('#contactPaymentTermTable').empty();
	    				$('#existingpaymentTerm').empty();
	    				$('#existingpaymentTerm').html(existingPaymentTermTemplate({
							feeType:self.feeType,paymentType:self.paymentType,paymentTerms:res.paymentterms}));
	    				existingContext.applyPermissions();
	    				app.currencyFormatter("","currencyTable");
	    				$(".currencyTable").formatCurrency({symbol:""});
	    				$("#add-contract-payment").modal('show');
	    				if(existingContext.successMessage) {
	    					var success1 = $('#'+existingContext.successMessage, $('#paymentAlertsForm'));
	    					success1.show();
	   		             	success1.delay(2000).fadeOut(2000);
	   		             	existingContext.successMessage = null;
		    			}
	                },
	                error: function(res){
	                	var error1 = $('#alertGetPaymentTermsFailure', $('#alertsForm'));
   		             	error1.show();
   		             	App.scrollTo(error1, -200);
                    	error1.delay(2000).fadeOut(2000);
	                }
	            });
				
			},
			deletePaymentRow:function(evt){
				evt.preventDefault();
				$(evt.target).data('recordid');
				$(evt.currentTarget).parent().parent().remove();
				if($('#contactPaymentTermTable tr').size()<=0){
					$('#newpaymentTerm').hide();
				}
			},
			fetchFeeType:function(){
		    	 var allcodesResponseObject = $.ajax({
						type : "GET",
						url : app.context()+ "/code/all/FEE_TYPE",
						async : false
					});
					allcodesResponseObject.done(function(response) {
						self.feeType=response;
					});
					allcodesResponseObject.fail(function(response) {
						console.log("Error in retrieving codes "+response);
					});
		     },
		     fetchPaymentType:function(){
		    	 var allcodesResponseObject = $.ajax({
						type : "GET",
						url : app.context()+ "/code/all/PAYMENT_TYPE",
						async : false
					});
					allcodesResponseObject.done(function(response) {
						self.paymentType=response;
					});
					allcodesResponseObject.fail(function(response) {
						console.log("Error in retrieving codes "+response);
					});
		     },
			deleteVendorServiceContract : function() {
				var self=this;
				this.model.set('contractId',this.contractIdToBeDeleted);
				this.model.deleteVendorServiceContract({
                    success : function ( model, res ) {
                    	$("#optionDeleteContract").modal('hide');
                    	$('#optionDeleteContract').on('hidden.bs.modal', function (e) {
                    		self.refreshVendorServiceContracts();
                    	});
                    	
                    	var success1 = $('#alertDeleteServiceContractSuccess', $('#alertsForm'));
                    	success1.show();
                    	App.scrollTo(success1, -200);
                    	success1.delay(2000).fadeOut(2000);
                    },
                    error   : function ( model, res ) {
                    	$("#optionDeleteContract").modal('hide');
                    	$('#optionDeleteContract').on('hidden.bs.modal', function (e) {
                    		self.refreshVendorServiceContracts();
                    	});
                    	var error1 = $('#alertDeleteServiceContractFailure', $('#alertsForm'));
   		             	error1.show();
                    	App.scrollTo(error1, -200);
                    	error1.delay(2000).fadeOut(2000);
                    }
                });
			},
			openDeleteConfirmationModal : function(evt) {
				this.contractIdToBeDeleted = $(evt.target).data('recordid');
			},
			openEditContractModal : function(evt) {
				evt.preventDefault();
				contractIdToBeEdited = $(evt.target).data('recordid');
				$('#updateContractForm #contractId').val(contractIdToBeEdited);
				this.model.getVendorServiceContract(contractIdToBeEdited,{
                    success : function ( model, res ) {
                    	for(attr in res) {
	       		    		 var formElement = $('#updateContractForm [name='+attr+']');
	       		    		 if(formElement) {
	       		    			 formElement.val(res[attr]);
	       		    		 }
       		    	 	}
                    	if(res['documentId']) {
                    		$('#existingDocument').html('<a href="vendor/contract/download/'+contractIdToBeEdited+'" target="_blank">Existing Document</a>');
                    	} else {
                    		$('#existingDocument').html('');
                    	}
                    	$('#update-contract-form1').modal('show');
                    },
                    error   : function ( model, res ) {
                    	var error1 = $('#alertGetServiceContractFailure', $('#alertsForm'));
   		             	error1.show();
                    	App.scrollTo(error1, -200);
                    	error1.delay(2000).fadeOut(2000);
                    }
				});
			},
			resetPaymentCount:function(){
				$("#add-contract-form1").modal('hide');
			},
			updateVendorServiceContract	:	function() {
				var self=this;
				
				var selectedServiceId = $('#servicesDropdown').val();
	        	var orgId = "";
	        	if(app.vendorCompanyModel) {
					orgId = app.vendorCompanyModel.get("orgId");
				} else {
					//Throw error saying 'Add organization first'
					/*var error1 = $('.alert-danger', $('#companyForm'));
		             	error1.show();
                	App.scrollTo(error1, -200);*/
				}
	        	
	        	//var orgId = "8b475d56-b1d9-454e-98ef-fc1f7303e006";
	        	
	        	this.model.set({'orgId':orgId,'serviceId':selectedServiceId});
	        	
	        	if($('#updateContractForm input[name=contractFiles]').val() == "") {
	        		$('#updateContractForm input[name=contractFiles]').attr("disabled","disabled");
	        	}
	        	
				var updateContractForm = $('#updateContractForm');
				if(updateContractForm.validate().form()) {
					this.model.updateVendorServiceContract(updateContractForm,{
	                    success : function ( model, res ) {
	                    	$("#update-contract-form1").modal('hide');
	                    	$('#update-contract-form1').on('hidden.bs.modal', function (e) {
	                    		self.refreshVendorServiceContracts();
	                    	});
	                    	var success1 = $('#alertUpdateServiceContractSuccess', $('#alertsForm'));
	                    	success1.show();
	                    	App.scrollTo(success1, -200);
	                    	success1.delay(2000).fadeOut(2000);
	                    },
	                    error   : function ( model, res ) {
	                    	$("#update-contract-form1").modal('hide');
	                    	$('#update-contract-form1').on('hidden.bs.modal', function (e) {
	                    		self.refreshVendorServiceContracts();
	                    	});
	                    	var error1 = $('#alertUpdateServiceContractFailure', $('#alertsForm'));
	   		             	error1.show();
	                    	App.scrollTo(error1, -200);
	                    	error1.delay(2000).fadeOut(2000);
	                    }
	                });
		    	}
				
				$('#updateContractForm input[name=contractFiles]').removeAttr("disabled");
		    	return false;
			},
			addVendorServiceContract  :  function() {
				var self=this;
				
				var selectedServiceId = $('#servicesDropdown').val();
	        	var orgId = "";
	        	if(app.vendorCompanyModel) {
					orgId = app.vendorCompanyModel.get("orgId");
				} else {
					//Throw error saying 'Add organization first'
					/*var error1 = $('.alert-danger', $('#companyForm'));
		             	error1.show();
                	App.scrollTo(error1, -200);*/
				}
	        	
	        	//var orgId = "8b475d56-b1d9-454e-98ef-fc1f7303e006";
	        	
	        	this.model.set({'orgId':orgId,'serviceId':selectedServiceId});
	        	
	        	if($('#addContractForm input[name=contractFiles]').val() == "") {
	        		$('#addContractForm input[name=contractFiles]').attr("disabled","disabled");
	        	}
	        	
				var addContractForm = $('#addContractForm');
				if(addContractForm.validate().form()) {
					this.model.addVendorServiceContract(addContractForm,{
	                    success : function ( model, res ) {
	                    	$("#add-contract-form1").modal('hide');
	                    	$('#add-contract-form1').on('hidden.bs.modal', function (e) {
	                    		self.refreshVendorServiceContracts();
	                    	});
	                    	self.paymentcount=0;
	                    	var success1 = $('#alertAddServiceContractSuccess', $('#alertsForm'));
	                    	success1.show();
	                    	App.scrollTo(success1, -200);
	                    	success1.delay(2000).fadeOut(2000);
	                    },
	                    error   : function ( model, res ) {
	                    	$("#add-contract-form1").modal('hide');
	                    	$('#add-contract-form1').on('hidden.bs.modal', function (e) {
	                    		self.refreshVendorServiceContracts();
	                    	});
	                    	var error1 = $('#alertAddServiceContractFailure', $('#alertsForm'));
	   		             	error1.show();
	   		             	self.paymentcount=0;
	                    	App.scrollTo(error1, -200);
	                    	error1.delay(2000).fadeOut(2000);
	                    }
	                });
		    	}
				
				$('#addContractForm input[name=contractFiles]').removeAttr("disabled");
		    	return false;
			},
			refreshVendorServiceContracts: function() {
				var self=this;
				var selectedServiceId = $('#servicesDropdown').val();
	        	var orgId = "";
	        	if(app.vendorCompanyModel) {
					orgId = app.vendorCompanyModel.get("orgId");
				} else {
					//Throw error saying 'Add organization first'
					/*var error1 = $('.alert-danger', $('#companyForm'));
		             	error1.show();
                	App.scrollTo(error1, -200);*/
				}
	        	
	        	//var orgId = "8b475d56-b1d9-454e-98ef-fc1f7303e006";
	        	
				this.coll.refreshRecords(new vendorServiceContractModel({'orgId':orgId,'serviceId':selectedServiceId}),
            				{
	    	                    success : function ( model, res ) {
	    	                    	$("#add-contract-form1").modal('hide');
	    	                    	self.coll.reset();
	    	                    	_(res).each(function(contract) {
	    	                    		self.coll.add(new vendorServiceContractModel(contract));
	    	                    	});
	    	                    	self.render(self.coll);
	    	                    },
	    	                    error   : function ( model, res ) {
	    	                    	$('#contractPortletBody').html('<div style="text-align: center;">Error in fetching records.</div>');
	    	                    }
    	                    });
			},
	        render : function (contractsData) {
	        	this.paymentcount=0;
				this.template = _.template( vendorServicesContractsPage );
				this.$el.html("");
				var refresh = false;
				
				if(!contractsData){
					contractsData={};
					refresh = true;
				} else {
					contractsData = contractsData.toJSON();
					refresh = false;
				}
				
				var selectedServiceId = $('#servicesDropdown').val();
				var selectedServiceName = $('#servicesDropdown option#'+selectedServiceId).text();
				var orgId = "";
	        	if(app.vendorCompanyModel) {
					orgId = app.vendorCompanyModel.get("orgId");
				}
	        	
				this.$el.html(this.template({vendorServiceContracts:contractsData,orgId:orgId,serviceId:selectedServiceId,serviceName:selectedServiceName,feeType:self.feeType,paymentType:self.paymentType}));
				$(".amount").formatCurrency();
				
				if(refresh) {
					this.refreshVendorServiceContracts();
				}
				$('body').off();
				ComponentsPickers.init();
				this.addContractFormValidation();
				this.updateContractFormValidation();
				this.handleDate();
				this.applyPermissions();
				
				
				
				
				return this;
			 },
		     applyPermissions : function() {
		    	 if($.inArray('VendorManagement', app.sessionModel.attributes.permissions)==-1) {
		    		 $('#addContractLink').remove();
		    		 $('#addContractButton').remove();
		    		 $('#updateContractButton').remove();
		    		 $('#addcontractPaymentTerm').remove();
		    		 $('a[id=deleteContractLink]').each(function(){
		    			 $(this).remove();
		    		 });
		    		 $("a[name='deleteExistingPaymentRow']").each(function(){
		    			 $(this).remove();
		    		 });
		    		 $('#newPaymentHeading').remove();
		    		 $('#addPaymentRow').remove();
		    		 
//		    		 $('#contactPaymentTermTableParent').hide();
		    	 }
		     },
			 addContractFormValidation:function(){
        	  	 var form1 = $('#addContractForm');
	             var error1 = $('.alert-danger', form1);
	             var success1 = $('.alert-success', form1);
	             form1.validate({
	            	 errorElement: 'span', //default input error message container
	                 errorClass: 'help-block', // default input error message class
	                 focusInvalid: false, // do not focus the last invalid input
	                 ignore: "",
	                 rules: {
	                	 dateSigned:{
	                    	 required: true
	                    	 
	                     },
	                     effectiveDate:{
	                    	 required: true
	                    	 //effectiveDate:true
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
	        updateContractFormValidation:function(){
       	  	 var form1 = $('#updateContractForm');
	             var error1 = $('.alert-danger', form1);
	             var success1 = $('.alert-success', form1);
	             form1.validate({
	            	 errorElement: 'span', //default input error message container
	                 errorClass: 'help-block', // default input error message class
	                 focusInvalid: false, // do not focus the last invalid input
	                 ignore: "",
	                 rules: {
	                	 dateSigned:{
	                    	 required: true
	                     },
	                     effectiveDate:{
	                    	 required: true
	                     }
	                	 /*contractFiles:{
	                    	 required: true
	                     }*/
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
	        handleDate:function(){
	        	$('.dateSigned').datepicker({
					rtl: App.isRTL(),
	                autoclose: true,
	                defaultDate: null,
	                todayHighlight:false
				})
				    .on('changeDate', function(selected){
//				    	$("input[name='effectiveDate']").val(null);
				    	//$('.effectiveDate').datepicker('update', new Date(selected.date.valueOf()));
				        startDate = new Date(selected.date.valueOf());
				        startDate.setDate(startDate.getDate(new Date(selected.date.valueOf())));
				        $('.effectiveDate').datepicker('setStartDate', startDate);
				    });
				$('.effectiveDate').datepicker({
					rtl: App.isRTL(),
	                autoclose: true,
	                defaultDate: null,
	                todayHighlight:false
				})
				    .on('changeDate', function(selected){
//				    	$("input[name='expirationDate']").val(null);
				        startDate = new Date(selected.date.valueOf());
				        startDate.setDate(startDate.getDate(new Date(selected.date.valueOf())));
				        $('.expirationDate').datepicker('setStartDate', startDate);
				    });
				$('.expirationDate').datepicker({
					rtl: App.isRTL(),
	                autoclose: true,
	                defaultDate: null
				});
	        }
		});
		return VendorServiceContractsView;
});