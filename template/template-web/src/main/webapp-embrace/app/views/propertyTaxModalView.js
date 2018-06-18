define(["backbone","app","text!templates/propertyTaxModal.html","text!templates/propertyTaxModalTab.html",
	"text!templates/addNewTaxPaymentHistoryRow.html","views/codesView","views/stateCodesView","components-dropdowns","components-pickers"],
	function(Backbone,app,taxModal,taxModalTab,paymentHistoryRow,codesView,stateCodesView){
		var taxModalView=Backbone.View.extend({
			initialize: function(){
				this.taxTypes = new codesView({codeGroup:'TAX_TYPE'});
				this.taxPaymentStatus = new codesView({codeGroup:'INS_PAY_STA'});
				this.taxPaymentBy = new codesView({codeGroup:'INS_PAY_BY'});
				this.propertyModel.subObject = 	"232";
				this.stateCodesView = new stateCodesView();
			},
			events : { 
				"click #addNewTax":"addNewTaxOnBtnClick",
				"change select[name=taxType]":"changeTabTitle",
				"click .addNewPayment":"addNewPaymentRowOnBtnClick",
				"click .deleteTaxPaymentBtn":"removePaymentRowConfirmPopup",
				"click #deleteTaxPaymentConfirmBtn":"removePaymentRow",
				"change :input" : "formChanged",
				"click .savePropertyTax":"savePropertyTax",
				"click .showAddressDiv": "showAddressDiv",
				"click .hideAddressDiv":"hideAddressDiv",
				"keyup .showExistingAddress":"showExistingAddress",
				'change .showExistingAddress': 'showExistingAddress',
				'click .existingaddress':'showAddressDiv'
			
			},
			el:"#propertyTaxRenderDiv",
			tabCount:0,
			propertyModel:{},
			paymentRowToDelete:{},
			paymentIdToDelete:"",
			states:{},
			render : function () {
				var self = this;
				self.tabCount = 0;
				self.fetchPropertyTaxData();

				var modalTemplate = _.template(taxModal);
				self.$el.html("");
				self.$el.html(modalTemplate);
				if(self.taxDatas && self.taxDatas.length != 0){
					_.each(self.taxDatas,function(taxData){
						self.addNewTax(taxData);
					});
				} else {
					self.addNewTax();
				}

				$(".currencyInsuranceTable").formatCurrency("");
				app.currencyFormatter("$","currencyInsuranceTable");
				$(".currencyInsurance").formatCurrency("");
				app.currencyFormatter("$","currencyInsurance");
				$("a[href=#tax_tab_1]").click();
				this.applyPermissions();
				$("#propertyTaxModal").modal('show');

			// ComponentsDropdowns.init();
				ComponentsPickers.init();
		    },
		    refreshPopupView : function(tabId){
		    	var self = this;
				self.tabCount = 0;
				self.fetchPropertyTaxData();
				$("#taxListUL").empty();
				$("#taxListTab").empty();

				if(self.taxDatas && self.taxDatas.length != 0){
					_.each(self.taxDatas,function(taxData){
						self.addNewTax(taxData);
					});
				} else {
					self.addNewTax();
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
		     fetchPropertyTaxData : function(){
		     	var self=this; 
		     	$.ajax({
		     		url: app.context()+'/propertyTax/fetchPropertyTax/'+self.propertyModel.object+'/'+self.propertyModel.objectId,
		     		contentType: 'application/json',
		     		dataType:'json',
		     		type: 'GET',
		     		async: false,
		     		success: function(res){
		     			self.taxDatas=res;
					//reset taxDatas afterwards
					},
					error: function(res){
						console.log("Fectching property tax data failed");
					}
				});
		     },
		     savePropertyTax:function(evt){
		     	var self = this;
		     	var currentForm = $(evt.currentTarget).siblings("form");
		     	var tabId = $(currentForm).closest(".taxNavTab").attr("id");
		     	var error1 = $('#formFailure', currentForm);
		     	var paymentErrorStatus = false;
		     	var paymentEntries = [];
		     	var taxdocument = $(currentForm).find('input[name=taxStatementDocs]');
		     	if(taxdocument && taxdocument.val() == "") {
		     		taxdocument.attr("disabled","disabled");
		     	}
		     	$(evt.currentTarget).parent().find("#paymentTable tbody").find('tr').each(function(){
		     		var obj={};
		     		obj.paymentId = $(this).find("[name=paymentId]").val();
		     		obj.paymentType = $(this).find("[name=paymentType]").val();
		     		obj.paidThroughDate = $(this).find("[name=paidThroughDate]").val();
		     		obj.paymentDueDate = $(this).find("[name=paymentDueDate]").val();
		     		obj.paymentDate = $(this).find("[name=paymentDate]").val();
		     		obj.paymentAmount = $(this).find("[name=paymentAmount]").val();
		     		obj.paymentStatus = $(this).find("[name=paymentStatus]").val();
		     		obj.paidBy = $(this).find("[name=paidBy]").val();
		     		obj.referenceNo = $(this).find("[name=referenceNo]").val();

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

		     	self.taxFormValidation(currentForm);
		     	if(!paymentErrorStatus && $(currentForm).validate().form()){
		     		$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
		     		$(currentForm).attr("enctype","multipart/form-data");
		     		$(currentForm).ajaxSubmit({
			     		url: app.context() + '/propertyTax/savePropertyTax',
			     		async:true,
			     		data:{"payHistoryDatas":JSON.stringify(paymentEntries)},
			     		success: function(res){
			     			console.log("success");
			     			//TODO: Change below logic
			     			//Get backend data for the tab and refresh only that tab instead of all
			     			//Now unsaved quote is lost
			     			$.unblockUI();
			     			self.refreshPopupView(tabId);
			     			taxdocument.removeAttr("disabled");
			     			$(currentForm).find("input[name=taxStatementDocs]").replaceWith($(currentForm).find("input[name=taxStatementDocs]").clone(true))
			     			//TODO: refresh the view after success or error.. Only payment Row
			     		},
			     		error: function(res) {
			     			$("#textValue",error1).text("");
			     			$("#textValue",error1).text("Error in Saving Property Tax");
			     			error1.show();
				    		$('.modal').animate({ scrollTop: 0 }, 'slow');
				    		error1.delay(2000).fadeOut(2000);

				    		$.unblockUI();
				    		taxdocument.removeAttr("disabled");
			     			$(currentForm).find("input[name=taxStatementDocs]").replaceWith($(currentForm).find("input[name=taxStatementDocs]").clone(true))
			     			
			     		}
			     	});
		     	} else {
		     		taxdocument.removeAttr("disabled");
		     	}
		     	if(paymentErrorStatus){
		     		$("#textValue",error1).text("");
	     			$("#textValue",error1).text("Error in Saving Payment History Details");
		     		error1.show();
		    		$('.modal').animate({ scrollTop: 0 }, 'slow');
		    		error1.delay(2000).fadeOut(2000);
		     	}
			},
			addNewTaxOnBtnClick:function(evt){
				this.addNewTax();
				//for date-picker // check and remove later or move to new function
				// ComponentsDropdowns.init();
				app.currencyFormatter("$","currencyInsurance");
				ComponentsPickers.init();
			},
			addNewTax:function(taxData){
				var self = this;
				this.removeActiveTab();
				this.tabCount++;
				var tabId = "tax_tab_" + this.tabCount;

				var newElement = '<li class="taxNav active"> <a data-toggle="tab" href="#'+ tabId +'">Tax()</a></li>';
				$("#taxListUL").append(newElement);
				var taxData = taxData || {};
				//Setting Essential Values to insuranceData
				taxData.essentials = {};
				taxData.essentials.objectCodeListId = self.propertyModel.objectCodeListId;
				taxData.essentials.objectId = self.propertyModel.objectId;
				taxData.essentials.subObject = self.propertyModel.subObject;
				$("#taxListTab").append(_.template(taxModalTab)({singleData:taxData,taxOrgList:this.taxCompanies}));
				$(".tax_tab_general").attr("id",tabId).removeClass("tax_tab_general");
				$("#"+tabId + " #object").val(this.propertyModel.object);
				$("#"+tabId + " #objectId").val(this.propertyModel.objectId);
				$("#"+tabId + " #propertyTaxId").val(taxData.propertyTaxId);
				this.stateCodesView.render({el:$("#"+tabId).find('.state')});
		        $("#"+tabId+" .state select[name=state]").val(taxData.state);
				
			  
		        this.taxTypes.callback = function() {
		        	$("#"+tabId+" .TaxTypeDD select[name=taxType]").val(taxData.taxType);
					var title = "Tax("+ $.trim($('#'+tabId+' .TaxTypeDD select[name=taxType] option:selected').text()) +")";
					$('a[href=#' + tabId +']').text(title);
		        }
				this.taxTypes.render({el:$("#"+tabId).find('.TaxTypeDD'),codeParamName:"taxType"});
				$("#"+tabId+" .TaxTypeDD select[name=taxType]").val(taxData.taxType);
				var title = "Tax("+ $.trim($('#'+tabId+' .TaxTypeDD select[name=taxType] option:selected').text()) +")";
				$('a[href=#' + tabId +']').text(title);
				
				 var currState=$("#"+tabId+" select[name=state] option:selected").val();
			        var str;
			        var strArray = [];
			        var addressArray=[];
			        var fullArray=[];
	                  
			        if($("#"+tabId+" input[name=address1]").val()){
			        	addressArray.push($("#"+tabId+" input[name=address1]").val());
			        } 
			        if($("#"+tabId+" input[name=address2]").val()){
			        	addressArray.push($("#"+tabId+" input[name=address2]").val());
			        } 
			        if($("#"+tabId+" input[name=city]").val()){
			        	strArray.push($("#"+tabId+" input[name=city]").val());
			        } 
			        if($("#"+tabId+" select[name=state]").val()&&currState!=""){
			        	strArray.push($("#"+tabId+" select[name=state]").val());
			        } 
			        if($("#"+tabId+" input[name=postalcode]").val()){
			        	strArray.push($("#"+tabId+" input[name=postalcode]").val());
			        } 
			        fullArray.push(addressArray.join(' ,'));
			        fullArray.push(strArray.join(' ,'));
			        $("#"+tabId+" .existingaddress").val(fullArray.join(',\n'));

				_.each(taxData.payHistoryDatas,function(paymentData){
					self.addNewPaymentRow(paymentData,tabId);
				});

				if(app.documentTooltipView){
					app.documentTooltipView.render();
				}
			},
			removeActiveTab:function(){
				$(".taxNav.active").removeClass("active");
				$('.taxNavTab.active').removeClass("active");
			},
			changeTabTitle: function(evt){
				var title = "Tax("+ $.trim($(evt.target).parent().parent().find('select[name=taxType] option:selected').text()) +")";
				var tabId = $(evt.target).closest(".taxNavTab").attr("id");
				$('a[href=#' + tabId +']').text(title);
			},
			addNewPaymentRowOnBtnClick:function(evt){
				this.addNewPaymentRow({},null,evt);
				app.currencyFormatter("$","currencyInsuranceTable");
				ComponentsPickers.init();
			},
			addNewPaymentRow: function(paymentData,tabId,evt){
				var paymentData = paymentData || {};
				if(tabId!=null){
					var tBody = $("#"+tabId).find("#paymentTable tbody");
				} else {
					var tBody = $(evt.currentTarget).parent().find("#paymentTable tbody");
				}
				
				var newRow = _.template(paymentHistoryRow)({singleData:paymentData});
				var requiredEl = $(newRow).appendTo(tBody);
				// ComponentsDropdowns.init();
				this.taxPaymentStatus.callback = function() {
					$(requiredEl).find("select[name=paymentStatus]").val(paymentData.paymentStatus);
				}
				this.taxPaymentStatus.render({el:$(requiredEl).find('.TaxPayStatusDD'),codeParamName:"paymentStatus",addBlankFirstOption:"true"});
				this.taxPaymentBy.callback = function() {
					$(requiredEl).find("select[name=paidBy]").val(paymentData.paidBy);
				}
				this.taxPaymentBy.render({el:$(requiredEl).find('.TaxPayByDD'),codeParamName:"paidBy",addBlankFirstOption:"true"});
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
				$("#deleteTaxPaymentModal").modal("show");
			},
			removePaymentRow: function(){
				var self = this;
				if(self.paymentIdToDelete == ""){
					$(self.paymentRowToDelete).remove();
				} else {
					$.ajax({
						url: app.context() + '/propertyTax/delPropertyTaxPayment/'+self.paymentIdToDelete,
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
				$("#deleteTaxPaymentModal").modal("hide");
			},
			taxFormValidation :function(currentForm){
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
				    	taxType:{
				    		required:true
				    	},
				    	taxAssessor:{
				    		required:true
				    	},
				    	address1:{
				    		required:true
				    	},
				    	phone:{
				    		number : true
				    	},
				    	taxPercentage:{
				    		range: [0, 100]
				    	}/*,
				    	insPolicyStartDate: {
				    		required:true
				    	},
				    	premium : {
				    		required:true,
				    		number : true,
				    		dollarsscents : true
				    	},
				    	deductible : {
				    		required:true,
				    		number : true,
				    		dollarsscents : true
				    	}*/
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
				var headerEl = $(evt.currentTarget).closest(".modal-body").find(".taxNav.active a");
				if( $(headerEl).text().indexOf("*") == -1)
				{
					$(headerEl).text($(headerEl).text()+"*");
				}
			},
			applyPermissions : function() {
				if($.inArray('ClosingManagement', app.sessionModel.attributes.permissions)==-1) {
					$('#addNewTax').remove();
					$('.addNewPayment').remove();
					$('.savePropertyTax').remove();
					$('.deleteTaxPaymentBtn').remove();
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
				if(currentForm.find("[name=address1]").val()){
					addressArray.push(currentForm.find("[name=address1]").val());
				}
				if(currentForm.find("[name=address2]").val()){
					addressArray.push(currentForm.find("[name=address2]").val());
				}
				if(currentForm.find("[name=city]").val()){
					strArray.push(currentForm.find("[name=city]").val());
				}
				if(currentForm.find("[name=state]").val()&&currentState!=""){
					strArray.push(currentForm.find("[name=state]").val());
				}
				if(currentForm.find("[name=postalcode]").val()){
					strArray.push(currentForm.find("[name=postalcode]").val());
				}
				fullArray.push(addressArray.join(" ,"));
				fullArray.push(strArray.join(" ,"));
				currentForm.find(".existingaddress").val(fullArray.join(",\n"));
			}
		});
		return taxModalView;
});
