define(["backbone","app","text!templates/investorDeposit.html", "models/investorDepositDataModel",
        "text!templates/investorDepositDetailsModal.html","text!templates/investorDepositDetailsTable.html",
        "text!templates/investorPaymentRow.html",
        "text!templates/recordPayment.html","views/codesView","text!templates/investorPropertiesDropdown.html"
        ],
		function(Backbone,app,investorDepositTemplate,depositDataModel,
				depositDetailsModalTemplate,depositDetailsTableTemplate,investorPaymentRow,recordPaymentPage,
				codesView,investorPropertiesDropdownPage){
	
	var investorDepositView = Backbone.View.extend( {
		initialize: function(options){
			this.navPermission = options.navPermission;
			this.statusCodesView = new codesView({codeGroup:'INVESTOR_DEP'});
			this.paymentTypeCodesView = new codesView({codeGroup:'INV_PAY_TYP'});
			console.log("investorDepositView1");
			/*var depositData = new depositDataModel();*/
		},
		el:"#investorDepositDiv",
		depositDataModel: new depositDataModel(),
		dataModel:{},
		financialTransactionDetails:{},
		navPermission:{},
		isReloadViewNeeded:false,
		events          : {
			"click #confirmReceiptBtn":"showConfirmReceiptModal",
			"click #confirmReceiptModalSave":"saveConfirmReceipt",
			"click #depositDetailsBtn":"showDepositDetailsModal",
			"click .deleteInvestorPayment":"deleteInvestorPayment",
			"click #paymentDeleteYesBtn":"paymentDeleteYesBtn",
			"click #showRecordPaymentBtn":"showRecordInvestorPayment",
			"click #saveInvestorPayment":"saveInvestorPayment",
			"click #cancelInvestorPayment":"cancelInvestorPaymentClick",
			"hidden.bs.modal #investorDepositDetailsPopup":"depositDetailsPopupClosed"
		},
		render : function (context) {
			var self = this;
			self.isReloadViewNeeded = false;
			self.dataModel = self.depositDataModel.toJSON();
			self.financialTransactionDetails = self.dataModel.financialTransactionDetails.toJSON();
			self.$el.html("");
			/**
			 * Render only if transaction id is present for investor deposit. This is for opportunity screen.
			 * For other screens, different logic is required.
			 */
		 	var isOpportunityScreen = false;
		 	var depositHeader = "Deposit Amount";
		 	if(self.depositDataModel.parentObject == "Opportunity"){
		 		 isOpportunityScreen = true;
		 	} else if(self.depositDataModel.parentObject == "Rehab"){
		 		depositHeader = "Investor Deposit";
		 	} else if(self.depositDataModel.parentObject == "Investor"){
		 		depositHeader = "";
		 	}
		 	
		 	var financialTransactionDetails = self.dataModel.financialTransactionDetails;
			var investorDeposit = financialTransactionDetails.findWhere({description:"Investor Deposit"});
			var investorDepositModel = investorDeposit? investorDeposit.toJSON():{};
			
			if(self.dataModel.financialTransactionId){
				var template = _.template(investorDepositTemplate)({dataModel:self.dataModel,isOpportunityScreen:isOpportunityScreen,
									depositHeader:depositHeader,navPermission:self.navPermission , investorDepositModel : investorDepositModel});
				self.$el.html(template);
				app.currencyFormatter();
				self.$el.find('.amount_1').formatCurrency({roundToDecimalPlace:2});
				self.$el.find('.currency').formatCurrency({symbol:""});
				ComponentsPickers.init();
			}
			
			/**
			 * Added condition for removing div in the investor screen when LPOA is not created or status is requested.
			 */
			if(self.depositDataModel.parentObject == "Investor" && (!self.dataModel.financialTransactionId || !investorDepositModel.status || investorDepositModel.status == "Requested")){
				$("#investorDepoDiv").remove();
			}
			
	     	return this;
		},
		fetchInvestorDepositData: function(){
			var self = this;
			self.depositDataModel.fetchInvestorDepositData({
				success: function(){
					self.render();
				},
				error: function(){
					console.log("error");
				}
			});
		},
		showConfirmReceiptModal: function(){
			var self = this;
			self.$el.find('#confirmReceiptFormId .date-picker').datepicker('setEndDate',new Date()).datepicker('update');
			self.$el.find("#confirmReceiptModal").modal("show");
		},
		saveConfirmReceipt: function(evt){
			var self = this;
			var postData = {};
			var currentForm = self.$el.find("#confirmReceiptModal #confirmReceiptFormId");
			
			self.confirmReceiptFormValidation(currentForm);
	    	if(!currentForm.validate().form()){
	    		return;
	    	}
			
			postData.transactionDetailId = currentForm.data("financialTransactionDetailId");
			var unindexed_array = currentForm.serializeArray();
			$.map(unindexed_array, function(n, i){
				var value=n['value'];
				var name=n['name'];
				postData[name]=value;
			});
			self.$el.find("#confirmReceiptModal").modal("hide");
			self.depositDataModel.saveConfirmReceipt(postData,{
				success: function(res){
					console.log("success");
					/*self.$el.find("#confirmReceiptModal").modal("hide");*/
					/*self.depositDataModel.set("",)*/
					$('.modal-backdrop.fade').remove();
					self.fetchInvestorDepositData();
					/* _.defer(function() { self.fetchInvestorDepositData(); });*/
					$('#depositReceiptSuccessMessage').show();
					App.scrollTo($('#depositReceiptSuccessMessage'), -200);
					$('#depositReceiptSuccessMessage').delay(2000).fadeOut(3000);
				},
				error: function(res){
					$('.modal-backdrop.fade').remove();
					$('#depositReceiptErrorMessage').show();
					App.scrollTo($('#depositReceiptErrorMessage'), -200);
					$('#depositReceiptErrorMessage').delay(2000).fadeOut(3000);
				}
			})
		},
		confirmReceiptFormValidation:function(currentForm){
			var form1 = currentForm;

			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					transactionDate:{//payment date
						required: true
					},
					creditAmount:{//payment amount
						required: true,
						dollarsscents: true
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
		showDepositDetailsModal:function(evt){
			var self=this;
			self.fetchInvestorProperties();
			self.$el.find("#depositDetailsDiv").html("");
			self.$el.find("#depositDetailsDiv").html(
					_.template( depositDetailsModalTemplate )({navPermission:self.navPermission}));
			self.loadDepositDetailsTemplate();
			self.$el.find("#investorDepositDetailsPopup").modal("show");
		},
		loadDepositDetailsTemplate:function(){
			var self=this;
			self.$el.find("#investorDepositDetailsTableRender").html("");
			self.$el.find("#investorDepositDetailsTableRender").html(
					_.template( depositDetailsTableTemplate )({totalsObj:self.calculateTotal()}));
			self.renderInvestorPaymentsTable();
		},
		renderInvestorPaymentsTable: function(){
	    	var self = this;
	    	var tableTemplate = _.template(investorPaymentRow)({payments:self.financialTransactionDetails,navPermission:self.navPermission});
	    	self.$el.find("#investorPaymentsTable tbody").html("");
	    	self.$el.find("#investorPaymentsTable tbody").html(tableTemplate);

	    	self.$el.find('.propNameTooltip').tooltip({
				animated: 'fade',
				placement: 'bottom'
			});
	    	self.$el.find(".amount").formatCurrency();
	    },
	    calculateTotal:function(){
	    	var self = this;
	    	var totalsObj = {};
	    	var creditTotal = 0;
	    	var debitTotal = 0;
	    	var totalBalance = 0;
	    	
	    	_.each(self.financialTransactionDetails,function(payment){
	    		if(payment.description=='Investor Deposit'){
	    			creditTotal += parseFloat(payment.creditAmount);
	    		}else{
	    			debitTotal += parseFloat(payment.debitAmount);
	    		}
	    	});
	    	totalBalance = creditTotal-debitTotal;
	    	totalsObj.creditTotal = creditTotal;
	    	totalsObj.debitTotal = debitTotal;
	    	totalsObj.totalBalance = totalBalance;
	    	return totalsObj;
	    },
	    deleteInvestorPayment:function(evt){
	    	var self = this;
	    	var popup = self.$el.find("#paymentDeleteModal");
	    	var paymentIdToDelete = $(evt.currentTarget).closest('tr').data('modelid');
	    	self.callBackData = {};

	    	var callBack = function(){
	    		self.isReloadViewNeeded = true;
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});
				self.depositDataModel.deleteInvestorPayment(paymentIdToDelete,{
					success: function(res){
						self.financialTransactionDetails = _.reject(self.financialTransactionDetails, function(el) { return el.financialTransactionDetailId == paymentIdToDelete; });
		    			// self.renderInvestorPaymentsTable();
		    			self.loadDepositDetailsTemplate();
						$.unblockUI();
						self.$el.find('#savePaymentSuccessMessage').text("Successfully deleted payment.");
		    			self.$el.find('#savePaymentSuccessMessage').show();
						App.scrollTo(self.$el.find('#savePaymentSuccessMessage'), -200);
						$('#savePaymentSuccessMessage').delay(2000).fadeOut(3000);
					},
					error: function(res){
						$.unblockUI();
						self.$el.find('#savePaymentErrorMessage').text("Error in deleting payment.");
						self.$el.find('#savePaymentErrorMessage').show();
						App.scrollTo(self.$el.find('#savePaymentErrorMessage'), -200);
						self.$el.find('#savePaymentErrorMessage').delay(2000).fadeOut(3000);
					}
				});
			}
	    	self.callBackData = callBack;
	    	popup.modal("show");
	    },
	    paymentDeleteYesBtn:function(){
	    	var self = this;		    	
	    	self.callBackData();
	    	self.callBackData = {};
	    	self.$el.find("#paymentDeleteModal").modal("hide");
	    },
	    fetchInvestorProperties:function(){
	    	var self=this;
	    	self.depositDataModel.fetchInvestorProperties(self.depositDataModel.investorId,{
	    		success:function(res){
	    			self.investorProperties = res.propertiesList;
	    		},
	    		error:function(res){
//					console.log("Failed to fetch properties for investor.");
	    		}
	    	});
	    },
	    showRecordInvestorPayment : function(){
	    	var self=this;
	    	self.$el.find("#recordPaymentDiv").html("");
	    	if(!self.investorProperties){
	    		console.log("No properties");
	    		self.$el.find('#savePaymentErrorMessage').text("No investment found for the investor.");
				self.$el.find('#savePaymentErrorMessage').show();
				App.scrollTo(self.$el.find('#savePaymentErrorMessage'), -200);
				self.$el.find('#savePaymentErrorMessage').delay(2000).fadeOut(3000);
				return;
	    	}
	    	var recordPaymentTemplate = _.template(recordPaymentPage)();
	    	var propertiesTemplate = _.template(investorPropertiesDropdownPage);
	    	self.$el.find("#recordPaymentDiv").html(recordPaymentTemplate);
	    	
	    	this.statusCodesView.render({el:self.$el.find('#paymentStatusDropdown'),codeParamName:"status",addBlankFirstOption:true});
			this.paymentTypeCodesView.render({el:self.$el.find('#paymentTypeDropdown'),codeParamName:"detailDescription",addBlankFirstOption:true});

	    	self.$el.find("#investorPropertiesDropdown").html(propertiesTemplate({investorProperties:self.investorProperties,
	    				name:'subObjectId',addBlankFirstOption:true}));
	    	
	    	self.$el.find('#recordPaymentDiv .date-picker').datepicker('setEndDate',new Date()).datepicker('update');
	    	self.$el.find("#showRecordPaymentBtn").hide();
	    	//self.$el.find("#recordPaymentDiv").show();
	    	self.$el.find("#recordPaymentDiv").fadeIn(600);
	    	app.currencyFormatter();
	    	ComponentsPickers.init();
	    },
	    saveInvestorPayment:function(evt){
	    	var self = this;
			var postData = {};
			var currentForm = $(evt.currentTarget).closest('form');
			var unindexed_array = currentForm.serializeArray();
			$.map(unindexed_array, function(n, i){
				var value=n['value'];
				var name=n['name'];
				postData[name]=value;
			});
	    	
	    	self.recordPaymentFormValidation(currentForm);
	    	var financialTransactionId = self.dataModel.financialTransactionId;

	    	if(!currentForm.validate().form()){
	    		return;
	    	}
	    	$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
	    	self.depositDataModel.saveInvestorPayment(postData,financialTransactionId,{
	    		success:function(res){
    				self.financialTransactionDetails.push(res);
	    			// self.renderInvestorPaymentsTable();
	    			self.loadDepositDetailsTemplate();
	    			self.cancelInvestorPaymentClick();
	    			self.isReloadViewNeeded = true;
	    			$.unblockUI();
	    			self.$el.find('#savePaymentSuccessMessage').text("Successfully saved payment");
	    			self.$el.find('#savePaymentSuccessMessage').show();
					App.scrollTo(self.$el.find('#savePaymentSuccessMessage'), -200);
					$('#savePaymentSuccessMessage').delay(2000).fadeOut(3000);
	    		},
	    		error:function(res){
					$.unblockUI();
					self.$el.find('#savePaymentErrorMessage').text("Error in saving payment");
					self.$el.find('#savePaymentErrorMessage').show();
					App.scrollTo(self.$el.find('#savePaymentErrorMessage'), -200);
					self.$el.find('#savePaymentErrorMessage').delay(2000).fadeOut(3000);
	    		}
	    	});
	    },
	    recordPaymentFormValidation:function(currentForm){
			var form1 = currentForm;

			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					transactionDate:{//payment date
						required: true
					},
					debitAmount:{//payment amount
						required: true,
						dollarsscents: true
					},
					status:{
						required:true
					},
					detailDescription:{//payment type
						required: true
					},
					subObjectId:{//investmentId from propertyAddress dropdown
						required: true
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
	    cancelInvestorPaymentClick:function(){
	    	var self=this;
	    	self.$el.find("#recordPaymentDiv").fadeOut(500);
	    	self.$el.find("#showRecordPaymentBtn").show();
	    },
	    depositDetailsPopupClosed:function(){
	    	console.log('depositDetailsPopupClosed');
	    	var self = this;
	    	if(self.isReloadViewNeeded){
	    		self.isReloadViewNeeded = false;
	    		self.fetchInvestorDepositData();
	    	}
	    }
	});
	return investorDepositView;
});