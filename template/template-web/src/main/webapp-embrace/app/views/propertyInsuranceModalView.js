define(["backbone","app","text!templates/propertyInsuranceModal.html","text!templates/propertyInsuranceModalTab.html",
	"text!templates/addNewInsurancePaymentHistoryRow.html","views/codesView","views/stateCodesView","components-dropdowns","components-pickers"],
	function(Backbone,app,insuranceModal,insuranceModalTab,paymentHistoryRow,codesView,stateCodesView){
		var insuranceModalView=Backbone.View.extend({
			initialize: function(){
				this.insuranceTypes = new codesView({codeGroup:'INS_TYPE'});
				// this.statusCodesView = new codesView({codeGroup:'INS_APP_STA'});
				this.insurancePaymentStatus = new codesView({codeGroup:'INS_PAY_STA'});
				this.insurancePaymentBy = new codesView({codeGroup:'INS_PAY_BY'});
				this.propertyModel.subObject = 	"219";	
				this.stateCodesView=new stateCodesView();
			},
			events : { 
				"click #addNewInsurance":"addNewInsuranceOnBtnClick",
				"change select[name=insuranceType]":"changeTabTitle",
				"change select[name=insuranceProvider]":"enableAddNewField",
				"click .addNewPayment":"addNewPaymentRowOnBtnClick",
				"click .deleteInsPaymentBtn":"removePaymentRowConfirmPopup",
				"click #deleteInsPaymentConfirmBtn":"removePaymentRow",
				"change :input" : "formChanged",
				"click .savePropertyInsurance":"savePropertyInsurance",
				"change input[name=isDeductiblePercentage]":"changeDeductibleFieldFormat",
				"change input[name=isWindAndHailPercentage]":"changeWindAndHailFieldFormat",
				"click .showAddressDiv":"showAddressDiv",
				"click .hideAddressDiv":"hideAddressDiv",
				'keyup .showExistingAddress': 'showExistingAddress',
				'change .showExistingAddress': 'showExistingAddress',
				'click .existingaddress':'showAddressDiv'
			},
			el:"#propertyInsuranceRenderDiv",
			tabCount:0,
			propertyModel:{},
			paymentRowToDelete:{},
			paymentIdToDelete:"",
			states:{},
			insuranceArr:[],
			payArr:[],
			render : function () {
				var self = this;
				self.tabCount = 0;
				self.fetchInsuranceCompanies();
				self.fetchPropertyInsuranceData();

				var modalTemplate = _.template(insuranceModal);
				self.$el.html("");
				self.$el.html(modalTemplate);
				if(self.insuranceDatas && self.insuranceDatas.length != 0){
					_.each(self.insuranceDatas,function(insuranceData){
						self.addNewInsurance(insuranceData);
					});
				} else {
					self.addNewInsurance();
				}

				$(".currencyInsuranceTable").formatCurrency("");
				app.currencyFormatter("$","currencyInsuranceTable");
				$(".currencyInsurance").formatCurrency("");
				app.currencyFormatter("$","currencyInsurance");
				$("a[href=#ins_tab_1]").click();
				this.applyPermissions();
				$("#propertyInsuranceModal").modal('show');

			// ComponentsDropdowns.init();
				ComponentsPickers.init();
		    },
		    refreshPopupView : function(tabId){
		    	var self = this;
				self.tabCount = 0;
				self.fetchInsuranceCompanies();
				self.fetchPropertyInsuranceData();
				$("#insuranceListUL").empty();
				$("#insuranceListTab").empty();

				if(self.insuranceDatas && self.insuranceDatas.length != 0){
					_.each(self.insuranceDatas,function(insuranceData){
						self.addNewInsurance(insuranceData);
					});
				} else {
					self.addNewInsurance();
				}

				$(".currencyInsuranceTable").formatCurrency("");
				app.currencyFormatter("$","currencyInsuranceTable");
				$(".currencyInsurance").formatCurrency("");
				app.currencyFormatter("$","currencyInsurance");
				$("a[href=#" + tabId + "]").click();
				$("#"+tabId).find(".alert-success").show();
				$("#"+tabId).find(".alert-success").delay(2000).fadeOut(2000);
				$('.modal').animate({ scrollTop: 0 }, 'slow');
				ComponentsPickers.init();
		    },
		     fetchPropertyInsuranceData : function(){
		     	var self=this; 
		     	$.ajax({
		     		url: app.context()+'/insurance/fetchpropertyInsurance/'+self.propertyModel.object+'/'+self.propertyModel.objectId,
		     		contentType: 'application/json',
		     		dataType:'json',
		     		type: 'GET',
		     		async: false,
		     		success: function(res){
		     			self.insuranceDatas=res;
					//reset insuranceDatas afterwards
					},
					error: function(res){
						console.log("Fectching property insurance data failed");
					}
				});
		     },
		     savePropertyInsurance:function(evt){
		     	var self = this;
		     	var currentForm = $(evt.currentTarget).siblings("form");
		     	var tabId = $(currentForm).closest(".insuranceNavTab").attr("id");
		     	var error1 = $('#formFailure', currentForm);
		     	var paymentErrorStatus = false;
		     	var paymentEntries = [];
		     	var insurancedocument = $(currentForm).find('input[name=insurancePolicyDocuments]');
		     	if(insurancedocument && insurancedocument.val() == "") {
		     		insurancedocument.attr("disabled","disabled");
		     	}
		     	$(evt.currentTarget).parent().find("#paymentTable tbody").find('tr').each(function(){
		     		var obj={};
		     		obj.paymentId = $(this).find("[name=paymentId]").val();
		     		obj.coverageStartDate = $(this).find("[name=coverageStartDate]").val();
		     		obj.coverageEndDate = $(this).find("[name=coverageEndDate]").val();
		     		obj.paymentDueDate = $(this).find("[name=paymentDueDate]").val();
		     		obj.paymentDate = $(this).find("[name=paymentDate]").val();
		     		obj.paymentAmount = $(this).find("[name=paymentAmount]").val();
		     		obj.paymentStatus = $(this).find("[name=paymentStatus]").val();
		     		obj.paidBy = $(this).find("[name=paidBy]").val();
		     		obj.referenceNo = $(this).find("[name=referenceNo]").val();

		     		if(!obj.coverageStartDate){
		     			 $(this).find("[name=coverageStartDate]").parent().addClass("has-error");
		     			 paymentErrorStatus = true;
		     		} else {
		     			$(this).find("[name=coverageStartDate]").parent().removeClass("has-error");
		     		}
		     		if(!obj.coverageEndDate){
		     			 $(this).find("[name=coverageEndDate]").parent().addClass("has-error");
		     			 paymentErrorStatus = true;
		     		} else {
		     			$(this).find("[name=coverageEndDate]").parent().removeClass("has-error");
		     		}
		     		if(!obj.paymentAmount){
		     			 $(this).find("[name=paymentAmount]").parent().addClass("has-error");
		     			 paymentErrorStatus = true;
		     		} else {
		     			$(this).find("[name=paymentAmount]").parent().removeClass("has-error");
		     		}
		     		if(!obj.paymentStatus){
		     			 $(this).find("[name=paymentStatus]").parent().addClass("has-error");
		     			 paymentErrorStatus = true;
		     		} else {
		     			$(this).find("[name=paymentStatus]").parent().removeClass("has-error");
		     		}
		     		if(paymentErrorStatus){
		     			return;
		     		}
		     		paymentEntries.push(obj);
		     	});
		     	
		     	var isDeductiblePercentage = $("#"+tabId+" input[name=isDeductiblePercentage]:checked").val()
		     	var isWindAndHailPercentage = $("#"+tabId+" input[name=isWindAndHailPercentage]:checked").val()
		     	
		     	if(isDeductiblePercentage=='Y'){
		     		var deductiblePercentage = $("#"+tabId+" input[name=deductiblePercentage]").val();
		     		if(deductiblePercentage==""){
		     			$("#"+tabId+" #deductibleErrDiv").show();
		     			$("#"+tabId+" [name=deductiblePercentage]").parent().addClass("has-error");
		     			paymentErrorStatus = true;

		     		}else{
		     			$("#"+tabId+" #deductibleErrDiv").hide();
		     			$("#"+tabId+" [name=deductiblePercentage]").parent().removeClass("has-error");
		     		}
		     		$("#"+tabId+" input[name=deductibleAmount]").val("");
		     	}else{
		     		var deductibleAmount = $("#"+tabId+" input[name=deductibleAmount]").val();
		     		if(deductibleAmount==""){
		     			$("#"+tabId+" #deductibleErrDiv").show();
		     			$("#"+tabId+" [name=deductibleAmount]").parent().addClass("has-error");
		     			paymentErrorStatus = true;

		     		}else{
		     			$("#"+tabId+" #deductibleErrDiv").hide();
		     			$("#"+tabId+" [name=deductibleAmount]").parent().removeClass("has-error");
		     		}
		     		
		     		$("#"+tabId+" input[name=deductiblePercentage]").val("");
		     	}
		     	
		     	if(isWindAndHailPercentage=='Y'){
		     		$("#"+tabId+" input[name=windAndHailAmount]").val("");
		     	}else{
		     		$("#"+tabId+" input[name=windAndHailPercentage]").val("");
		     	}
		     	
		     	self.insuranceFormValidation(currentForm);
		     	
		     	
		     	if(!paymentErrorStatus && $(currentForm).validate().form()){
		     		$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
		     		$(currentForm).attr("enctype","multipart/form-data");
		     		$(currentForm).ajaxSubmit({
			     		url: app.context() + '/insurance/propertyInsurance',
			     		async:true,
			     		data:{"payHistoryDatas":JSON.stringify(paymentEntries)}, // change needed here
			     		success: function(res){
			     			console.log("success");
			     			//TODO: Change below logic
			     			//Get backend data for the tab and refresh only that tab instead of all
			     			//Now unsaved quote is lost
			     			$.unblockUI();
			     			self.refreshPopupView(tabId);
			     			insurancedocument.removeAttr("disabled");
			     			$(currentForm).find("input[name=insurancePolicyDocuments]").replaceWith($(currentForm).find("input[name=insurancePolicyDocuments]").clone(true))
			     			//TODO: refresh the view after success or error.. Only payment Row
			     		},
			     		error: function(res) {
			     			$("#textValue",error1).text("");
			     			$("#textValue",error1).text("Error in Saving Property Insurance");
			     			error1.show();
				    		$('.modal').animate({ scrollTop: 0 }, 'slow');
				    		error1.delay(2000).fadeOut(2000);

				    		$.unblockUI();
				    		insurancedocument.removeAttr("disabled");
			     			$(currentForm).find("input[name=insurancePolicyDocuments]").replaceWith($(currentForm).find("input[name=insurancePolicyDocuments]").clone(true))
			     			
			     		}
			     	});
		     	} else {
		     		insurancedocument.removeAttr("disabled");
		     	}
		     	if(paymentErrorStatus){
		     		$("#textValue",error1).text("");
	     			$("#textValue",error1).text("Error in Saving Payment History Details");
		     		error1.show();
		    		$('.modal').animate({ scrollTop: 0 }, 'slow');
		    		error1.delay(2000).fadeOut(2000);
		     	}
			},
			addNewInsuranceOnBtnClick:function(evt){
				this.addNewInsurance();
				//for date-picker // check and remove later or move to new function
				// ComponentsDropdowns.init();
				app.currencyFormatter("$","currencyInsurance");
				ComponentsPickers.init();
			},
			addNewInsurance:function(insuranceData){
				var self = this;
				this.removeActiveTab();
				this.tabCount++;
				var tabId = "ins_tab_" + this.tabCount;
				var newElement = '<li class="insuranceNav active"> <a data-toggle="tab" href="#'+ tabId +'">Insurance(Earthquake)</a></li>';
				$("#insuranceListUL").append(newElement);
				var insuranceData = insuranceData || {};
				//Setting Essential Values to insuranceData
				insuranceData.essentials = {};
				insuranceData.essentials.objectCodeListId = self.propertyModel.objectCodeListId;
				insuranceData.essentials.objectId = self.propertyModel.objectId;
				insuranceData.essentials.subObject = self.propertyModel.subObject;

				$("#insuranceListTab").append(_.template(insuranceModalTab)({singleData:insuranceData,insuranceOrgList:this.insuranceCompanies}));
				$(".ins_tab_general").attr("id",tabId).removeClass("ins_tab_general");
				$("#"+tabId + " #object").val(this.propertyModel.object);
				$("#"+tabId + " #objectId").val(this.propertyModel.objectId);
				$("#"+tabId + " #propertyInsuranceId").val(insuranceData.propertyInsuranceId);

				var tempObj = {};
				tempObj.tabId = tabId;
				tempObj.insType = insuranceData.insuranceType;
				self.insuranceArr.push(tempObj);
				
				this.insuranceTypes.callback = function() {
					_.each(this.insuranceArr, function(obj){
						$("#"+ obj.tabId +" .InsuranceTypeDD select[name=insuranceType]").val(obj.insType);
						var title = "Insurance("+ $.trim($('#'+ obj.tabId +' .InsuranceTypeDD select[name=insuranceType] option:selected').text()) +")";
						$('a[href=#' + obj.tabId +']').text(title);
					});
				}.bind(this);

				this.insuranceTypes.render({el:$("#"+tabId).find('.InsuranceTypeDD'),codeParamName:"insuranceType"});
				$("#"+tabId+" .InsuranceTypeDD select[name=insuranceType]").val(insuranceData.insuranceType);
				var title = "Insurance("+ $.trim($('#'+tabId+' .InsuranceTypeDD select[name=insuranceType] option:selected').text()) +")";
				$('a[href=#' + tabId +']').text(title);
				$("#"+tabId+" select[name=insuranceProvider]").val(insuranceData.insuranceProvider);
				
				
				this.stateCodesView.render({el:$("#"+tabId).find('.state')});
				$("#"+tabId+" .state select[name=state]").val(insuranceData.state);
				
				 var currState=$("#"+tabId+" select[name=state] option:selected").val();
			        var str;
			        var strArray = [];
			        var addressArray=[];
			        var fullArray=[];
	                  
			        if($("#"+tabId+" input[name=insVendorAddress1]").val()){
			        	addressArray.push($("#"+tabId+" input[name=insVendorAddress1]").val());
			        } 
			        if($("#"+tabId+" input[name=insVendorAddress2]").val()){
			        	addressArray.push($("#"+tabId+" input[name=insVendorAddress2]").val());
			        } 
			        if($("#"+tabId+" input[name=insVendorcity]").val()){
			        	strArray.push($("#"+tabId+" input[name=insVendorcity]").val());
			        } 
			        if($("#"+tabId+" select[name=state]").val()&&currState!=""){
			        	strArray.push($("#"+tabId+" select[name=state]").val());
			        } 
			        if($("#"+tabId+" input[name=insVendorpostalcode]").val()){
			        	strArray.push($("#"+tabId+" input[name=insVendorpostalcode]").val());
			        } 
			        fullArray.push(addressArray.join(' ,'));
			        fullArray.push(strArray.join(' ,'));
			        $("#"+tabId+" .existingaddress").val(fullArray.join(',\n')); 
			       
//				console.log("chk 1::"+insuranceData.isDeductiblePercentage);
				var isDeductiblePercentage = $("#"+tabId+" input[name=isDeductiblePercentage]:checked").val();
//				console.log("isDeductiblePercentage ::"+isDeductiblePercentage);
					
				if(isDeductiblePercentage=='Y'){
					$("#"+tabId+" #deductibleAmountDiv").hide();
					$("#"+tabId+" #deductiblePercentageDiv").show();
				}else{
					$("#"+tabId+" #deductibleAmountDiv").show();
					$("#"+tabId+" #deductiblePercentageDiv").hide();
				}
//				console.log("chk 2::"+insuranceData.isWindAndHailPercentage);
				var isWindAndHailPercentage = $("#"+tabId+" input[name=isWindAndHailPercentage]:checked").val();
//				console.log("isWindAndHailPercentage ::"+isWindAndHailPercentage);
					
				if(isWindAndHailPercentage=='Y'){
					$("#"+tabId+" #windAndHailAmountDiv").hide();
					$("#"+tabId+" #windAndHailPercentageDiv").show();
				}else{
					$("#"+tabId+" #windAndHailAmountDiv").show();
					$("#"+tabId+" #windAndHailPercentageDiv").hide();
				}
				
				app.currencyFormatter("$","currencyInsurance");
				
				_.each(insuranceData.payHistoryDatas,function(paymentData){
					self.addNewPaymentRow(paymentData,tabId);
				});

				if(app.documentTooltipView){
					app.documentTooltipView.render();
				}
			},
			removeActiveTab:function(){
				$(".insuranceNav.active").removeClass("active");
				$('.insuranceNavTab.active').removeClass("active");
			},
			fetchInsuranceCompanies : function(){
				var self=this;
				var serviceName='Insurance-Service';
				var allCompaniesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+ "/company/service/"+serviceName,
					async : false
				});
				allCompaniesResponseObject.done(function(response) {
					self.insuranceCompanies=response;
				});
				allCompaniesResponseObject.fail(function(response) {
					console.log("Error in retrieving states "+response);
				});
			},
			changeTabTitle: function(evt){
				var title = "Insurance("+ $.trim($(evt.target).parent().parent().find('select[name=insuranceType] option:selected').text()) +")";
				var tabId = $(evt.target).closest(".insuranceNavTab").attr("id");
				$('a[href=#' + tabId +']').text(title);
			},
			enableAddNewField: function(evt){
				var self = this;
				var formEl = $(evt.target).parent().parent();
				var requiredCompany = {}; 
				if(formEl.find('select[name=insuranceProvider]').val() == "addNewInsuranceVendor") {
					formEl.parent().parent().find('input[name=newInsuranceVendor]').attr("disabled",false);
					formEl.parent().parent().parent().find('input[name=insVendorAddress]').val("");
					formEl.parent().parent().parent().find('input[name=insVendorPhone]').val("");
					formEl.parent().parent().parent().find('input[name=insVendorUrl]').val("");
				}
				else{
					formEl.parent().parent().find('input[name=newInsuranceVendor]').attr("disabled",true);
					_.each(self.insuranceCompanies,function(company){
						if(formEl.find('select[name=insuranceProvider]').val() == company.orgId){
							requiredCompany = company;
							return;
						}
					});
					formEl.parent().parent().parent().find('input[name=insVendorAddress]').val(requiredCompany.address1);
					formEl.parent().parent().parent().find('input[name=insVendorPhone]').val(requiredCompany.phone);
					formEl.parent().parent().parent().find('input[name=insVendorUrl]').val(requiredCompany.url);
				}
			},
			addNewPaymentRowOnBtnClick:function(evt){
				this.addNewPaymentRow({},null,evt);
				app.currencyFormatter("$","currencyInsuranceTable");
				ComponentsPickers.init();
			},
			addNewPaymentRow: function(paymentData,tabId,evt){
				var self = this;
				console.log("Reached addNewPaymentRow");
				var paymentData = paymentData || {};
				if(tabId!=null){
					var tBody = $("#"+tabId).find("#paymentTable tbody");
				} else {
					var tBody = $(evt.currentTarget).parent().find("#paymentTable tbody");
				}
				
				var newRow = _.template(paymentHistoryRow)({singleData:paymentData});
				var requiredEl = $(newRow).appendTo(tBody);
				// ComponentsDropdowns.init();

				var tempObj = {};
				tempObj.tabId = tabId;
				tempObj.el = requiredEl;
				tempObj.payStatus = paymentData.paymentStatus;
				tempObj.paidBy = paymentData.paidBy;
				self.payArr.push(tempObj);

				this.insurancePaymentStatus.callback = function() {
					_.each(this.payArr, function(obj){
						$("#"+obj.tabId).find(obj.el).find("select[name=paymentStatus]").val(obj.payStatus);	
					});
				}.bind(this);

				this.insurancePaymentStatus.render({el:$(requiredEl).find('.InsurancePayStatusDD'),codeParamName:"paymentStatus",addBlankFirstOption:"true"});
				this.insurancePaymentBy.callback = function() {
					_.each(this.payArr, function(obj){
						$("#"+obj.tabId).find(obj.el).find("select[name=paidBy]").val(obj.paidBy);
					});
				}.bind(this);
				this.insurancePaymentBy.render({el:$(requiredEl).find('.InsurancePayByDD'),codeParamName:"paidBy",addBlankFirstOption:"true"});
				$(requiredEl).find("select[name=paymentStatus]").val(paymentData.paymentStatus);
				$(requiredEl).find("select[name=paidBy]").val(paymentData.paidBy);
			},
			removePaymentRowConfirmPopup: function(evt) {
				var removedRowId = $(evt.currentTarget).closest("tr").find("input[name=paymentId]").val();
				if(removedRowId && removedRowId != ""){
					this.paymentIdToDelete = removedRowId;
				} else {
					this.paymentIdToDelete = "";
				}
				this.paymentRowToDelete = $(evt.currentTarget).closest("tr");
				$("#deleteInsPaymentModal").modal("show");
			},
			removePaymentRow: function(){
				var self = this;
				if(self.paymentIdToDelete == ""){
					$(self.paymentRowToDelete).remove();
				} else {
					$.ajax({
						url: app.context() + '/insurance/delPropertyInsPayment/'+self.paymentIdToDelete,
						contentType: 'application/json',
						type: 'POST',
						success: function(res){
							console.log(res);
							if(res.statusCode == "200") {
								$(self.paymentRowToDelete).remove();
							} else {
								//TODO: Show Error Div
							}
						},
						error: function(res){
							//TODO: Show Error Div
							console.log("Failed in deleting the payment History");
						}
					});
				}
				$("#deleteInsPaymentModal").modal("hide");
			},
			insuranceFormValidation :function(currentForm){
				var form1 = currentForm;
				var error1 = $('#formFailure', form1);
				$.validator.addMethod("dollarsscents", function(value, element) {
					return this.optional(element) || /^\d{1,8}(\.\d{0,2})?$/i.test(value);
				}, "Maximum 8 digits and 2 decimal places allowed");

				form1.validate({
				   	errorElement: 'span', //default input error message container
				    errorClass: 'help-block', // default input error message class
				    focusInvalid: false, // do not focus the last invalid input
				    ignore: "",
				    rules: {
				    	insuranceType:{
				    		required:true
				    	},
				    	insuranceProvider:{
				    		required:true
				    	},
				    	insPolicyStartDate: {
				    		required:true
				    	},
				    	insVendorPhone:{
				    		number : true
				    	},
				    	
                        insVendorAddress1:{
				    		required:true
				    	},
				    	premium : {
				    		required:true,
				    		number : true,
				    		dollarsscents : true
				    	},
				    	deductibleAmount : {
//				    		required:true,
				    		number : true,
				    		dollarsscents : true
				    	},
				    	deductiblePercentage : {
//				    		required:true,
				    		number : true,
				    		percentage : true
				    	},
				    	windAndHailAmount :{
				    		number : true,
				    		dollarsscents : true
				    	},
				    	windAndHailPercentage :{
				    		number : true,
				    		percentage : true
				    	}
				    },
				    invalidHandler: function (event, validator) { // display error alert on form submit
				    	$("#textValue",error1).text("");
				    	$("#textValue",error1).text("You have some form errors. Please check below.");
				    	error1.show();
				    	// App.scrollTo(error1, -200);
				    	$('.modal').animate({ scrollTop: 0 }, 'slow');
				    	error1.delay(2000).fadeOut(2000);
				    },
				    highlight: function (element) { // hightlight error inputs
				    	$(element).closest('.form-group').addClass('has-error'); // set error class to the control group
			        },
				    unhighlight: function (element) { // revert the change done by hightlight
				    	$(element).closest('.form-group').removeClass('has-error'); // set error class to the control group
			        },
			        success: function (label) {
			        	label
			            .closest('.form-group').removeClass('has-error'); // set success class to the control group
			        }
				});
			},
			formChanged : function(evt) {
				var headerEl = $(evt.currentTarget).closest(".modal-body").find(".insuranceNav.active a");
				if( $(headerEl).text().indexOf("*") == -1)
				{
					$(headerEl).text($(headerEl).text()+"*");
				}
			},
			applyPermissions : function() {
				if($.inArray('ClosingManagement', app.sessionModel.attributes.permissions)==-1) {
					$('#addNewInsurance').remove();
					$('.addNewPayment').remove();
					$('.savePropertyInsurance').remove();
					$('.deleteInsPaymentBtn').remove();
				}
			},
			changeDeductibleFieldFormat :function(evt){
		     	var tabId = $(evt.currentTarget).closest(".insuranceNavTab").attr("id");
		    	var isDeductiblePercentage = $("#"+tabId+" input[name=isDeductiblePercentage]:checked").val();
					
				if(isDeductiblePercentage=='Y'){
					$("#"+tabId+" #deductibleAmountDiv").hide();
					$("#"+tabId+" #deductiblePercentageDiv").show();
					
					$("#"+tabId+" input[name=deductiblePercentage]").val($("#"+tabId+" input[name=deductibleAmount]").val());
					
				}else{
					$("#"+tabId+" #deductibleAmountDiv").show();
					$("#"+tabId+" #deductiblePercentageDiv").hide();
					
					$("#"+tabId+" input[name=deductibleAmount]").val($("#"+tabId+" input[name=deductiblePercentage]").val());
					$("#"+tabId+" #deductibleAmount_currency").val($("#"+tabId+" input[name=deductiblePercentage]").val());
				}
				app.currencyFormatter("$","currencyInsurance");
			},
			changeWindAndHailFieldFormat :function(evt){
		     	var tabId = $(evt.currentTarget).closest(".insuranceNavTab").attr("id");
		    	var isWindAndHailPercentage = $("#"+tabId+" input[name=isWindAndHailPercentage]:checked").val();
						
				if(isWindAndHailPercentage=='Y'){
					$("#"+tabId+" #windAndHailAmountDiv").hide();
					$("#"+tabId+" #windAndHailPercentageDiv").show();
					
					$("#"+tabId+" input[name=windAndHailPercentage]").val($("#"+tabId+" input[name=windAndHailAmount]").val());
					
				}else{
					$("#"+tabId+" #windAndHailAmountDiv").show();
					$("#"+tabId+" #windAndHailPercentageDiv").hide();

					
					$("#"+tabId+" input[name=windAndHailAmount]").val($("#"+tabId+" input[name=windAndHailPercentage]").val());
					$("#"+tabId+" #windAndHailAmount_currency").val($("#"+tabId+" input[name=windAndHailPercentage]").val());
					
				}
				app.currencyFormatter("$","currencyInsurance");
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
				if(currentForm.find("[name=insVendorAddress1]").val()){
					addressArray.push(currentForm.find("[name=insVendorAddress1]").val());
				}
				
				if(currentForm.find("[name=insVendorAddress2]").val()){
					addressArray.push(currentForm.find("[name=insVendorAddress2]").val());
				}
				if(currentForm.find("[name=insVendorcity]").val()){
					strArray.push(currentForm.find("[name=insVendorcity]").val());
				}
				
				if(currentForm.find("[name=state]").val()&&currentState!=""){
					strArray.push(currentForm.find("[name=state]").val());
				}
				if(currentForm.find("[name=insVendorpostalcode]").val()){
					strArray.push(currentForm.find("[name=insVendorpostalcode]").val());
				}
				fullArray.push(addressArray.join(" ,"));
				fullArray.push(strArray.join(" ,"));
				currentForm.find(".existingaddress").val(fullArray.join(",\n"));
				
			}
		});
		return insuranceModalView;
});
