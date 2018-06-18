define(["backbone","app","text!templates/propertyHoaModal.html","text!templates/propertyHoaModalTab.html",
	"text!templates/addNewHoaPaymentHistoryRow.html","views/codesView","views/stateCodesView","components-dropdowns","components-pickers"],
	function(Backbone,app,hoaModal,hoaModalTab,paymentHistoryRow,codesView,stateCodesView){
		var hoaModalView=Backbone.View.extend({
			initialize: function(){
				this.hoafreqTypes = new codesView({codeGroup:'FREQ'});
				this.hoaPaymentStatus = new codesView({codeGroup:'INS_PAY_STA'});
				this.hoaPaymentBy = new codesView({codeGroup:'INS_PAY_BY'});
				this.propertyModel.subObject = 	"234";
				this.stateCodesView = new stateCodesView();
			},
			events : { 
				"click #addNewHoa":"addNewHoaOnBtnClick",
				"click .addNewPayment":"addNewPaymentRowOnBtnClick",
				"click .deleteHoaPaymentBtn":"removePaymentRowConfirmPopup",
				"click #deleteHoaPaymentConfirmBtn":"removePaymentRow",
				"change :input" : "formChanged",
				"click .savePropertyHoa":"savePropertyHoa",
				"click .showAddressDiv":"showAddressDiv",
				"click .hideAddressDiv":"hideAddressDiv",
				'keyup .showExistingAddress': 'showExistingAddress',
				'change .showExistingAddress': 'showExistingAddress',
				'click .existingaddress':'showAddressDiv'
			},
			el:"#propertyHoaRenderDiv",
			tabCount:0,
			propertyModel:{},
			paymentRowToDelete:{},
			paymentIdToDelete:"",
			states:{},
			render : function () {
				var self = this;
				self.tabCount = 0;
				self.fetchPropertyHoaData();

				var modalTemplate = _.template(hoaModal);
				self.$el.html("");
				self.$el.html(modalTemplate);
								
				if(self.hoaDatas && self.hoaDatas.length != 0){
					_.each(self.hoaDatas,function(hoaData){
						self.addNewHoa(hoaData);
					});
				} else {
					self.addNewHoa();
				}

				$(".currencyInsuranceTable").formatCurrency("");
				app.currencyFormatter("$","currencyInsuranceTable");
				$(".currencyInsurance").formatCurrency("");
				app.currencyFormatter("$","currencyInsurance");
				$("a[href=#hoa_tab_1]").click();
				this.applyPermissions();
				$("#propertyHoaModal").modal('show');
				
				

			// ComponentsDropdowns.init();
				ComponentsPickers.init();
		    },
		    refreshPopupView : function(tabId){
		    	var self = this;
				self.tabCount = 0;
				self.fetchPropertyHoaData();
				$("#hoaListUL").empty();
				$("#hoaListTab").empty();

				if(self.hoaDatas && self.hoaDatas.length != 0){
					_.each(self.hoaDatas,function(hoaData){
						self.addNewHoa(hoaData);
					});
				} else {
					self.addNewHoa();
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
		     fetchPropertyHoaData : function(){
		     	var self=this; 
		     	$.ajax({
		     		url: app.context()+'/hoa/fetchHoas/'+self.propertyModel.object+'/'+self.propertyModel.objectId,
		     		contentType: 'application/json',
		     		dataType:'json',
		     		type: 'GET',
		     		async: false,
		     		success: function(res){
		     			self.hoaDatas=res;
					//reset hoaDatas afterwards
					},
					error: function(res){
						console.log("Fectching property hoa data failed");
					}
				});
		     },
		     savePropertyHoa:function(evt){
		     	var self = this;
		     	var currentForm = $(evt.currentTarget).siblings("form");
		     	var tabId = $(currentForm).closest(".hoaNavTab").attr("id");
		     	var error1 = $('#formFailure', currentForm);
		     	var paymentErrorStatus = false;
		     	var paymentEntries = [];
		     	var hoadocument = $(currentForm).find('input[name=hoaPolicyDocs]');
		     	if(hoadocument && hoadocument.val() == "") {
		     		hoadocument.attr("disabled","disabled");
		     	}
		     	$(evt.currentTarget).parent().find("#paymentTable tbody").find('tr').each(function(){
		     		var obj={};
		     		obj.hoaPaymentId = $(this).find("[name=hoaPaymentId]").val();
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

		     	self.hoaFormValidation(currentForm);
		     	if(!paymentErrorStatus && $(currentForm).validate().form()){
		     		$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
		     		$(currentForm).attr("enctype","multipart/form-data");
		     		$(currentForm).ajaxSubmit({
			     		url: app.context() + '/hoa/saveHoa',
			     		async:true,
			     		data:{"payHistoryDatas":JSON.stringify(paymentEntries)},
			     		success: function(res){
			     			console.log("success");
			     			//TODO: Change below logic
			     			//Get backend data for the tab and refresh only that tab instead of all
			     			//Now unsaved quote is lost
			     			$.unblockUI();
			     			self.refreshPopupView(tabId);
			     			hoadocument.removeAttr("disabled");
			     			$(currentForm).find("input[name=hoaPolicyDocs]").replaceWith($(currentForm).find("input[name=hoaPolicyDocs]").clone(true))
			     			//TODO: refresh the view after success or error.. Only payment Row
			     		},
			     		error: function(res) {
			     			$("#textValue",error1).text("");
			     			$("#textValue",error1).text("Error in Saving Property Hoa");
			     			error1.show();
				    		$('.modal').animate({ scrollTop: 0 }, 'slow');
				    		error1.delay(2000).fadeOut(2000);

				    		$.unblockUI();
				    		hoadocument.removeAttr("disabled");
			     			$(currentForm).find("input[name=hoaPolicyDocs]").replaceWith($(currentForm).find("input[name=hoaPolicyDocs]").clone(true))
			     			
			     		}
			     	});
		     	} else {
		     		hoadocument.removeAttr("disabled");
		     	}
		     	if(paymentErrorStatus){
		     		$("#textValue",error1).text("");
	     			$("#textValue",error1).text("Error in Saving Payment History Details");
		     		error1.show();
		    		$('.modal').animate({ scrollTop: 0 }, 'slow');
		    		error1.delay(2000).fadeOut(2000);
		     	}
			},
			addNewHoaOnBtnClick:function(evt){
				this.addNewHoa();
				//for date-picker // check and remove later or move to new function
				// ComponentsDropdowns.init();
				app.currencyFormatter("$","currencyInsurance");
				ComponentsPickers.init();
			},
			addNewHoa:function(hoaData){
				var self = this;
				this.removeActiveTab();
				this.tabCount++;
				var tabId = "hoa_tab_" + this.tabCount;

				var newElement = '<li class="hoaNav active"> <a data-toggle="tab" href="#'+ tabId +'">HOA1</a></li>';
				$("#hoaListUL").append(newElement);
				var hoaData = hoaData || {};
				//Setting Essential Values to insuranceData
				hoaData.essentials = {};
				hoaData.essentials.objectCodeListId = self.propertyModel.objectCodeListId;
				hoaData.essentials.objectId = self.propertyModel.objectId;
				hoaData.essentials.subObject = self.propertyModel.subObject;
				$("#hoaListTab").append(_.template(hoaModalTab)({singleData:hoaData,hoaOrgList:this.hoaCompanies}));
				$(".hoa_tab_general").attr("id",tabId).removeClass("hoa_tab_general");
				$("#"+tabId + " #object").val(this.propertyModel.object);
				$("#"+tabId + " #objectId").val(this.propertyModel.objectId);
				$("#"+tabId + " #hoaId").val(hoaData.hoaId);
				
				this.hoafreqTypes.callback = function() {
					$("#"+tabId+" .frequencyTypeDD select[name=frequency]").val(hoaData.frequency);
				}
				this.hoafreqTypes.render({el:$("#"+tabId).find('.frequencyTypeDD'),codeParamName:"frequency"});
				$("#"+tabId+" .frequencyTypeDD select[name=frequency]").val(hoaData.frequency);
				
				this.stateCodesView.render({el:$("#"+tabId).find('.state')});
		        $("#"+tabId+" .state select[name=state]").val(hoaData.state);
		        
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
		        
				var title = "HOA"+ self.tabCount;
				$('a[href=#' + tabId +']').text(title);

				_.each(hoaData.payHistoryDatas,function(paymentData){
					self.addNewPaymentRow(paymentData,tabId);
				});

				if(app.documentTooltipView){
					app.documentTooltipView.render();
				}
			},
			removeActiveTab:function(){
				$(".hoaNav.active").removeClass("active");
				$('.hoaNavTab.active').removeClass("active");
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
				this.hoaPaymentStatus.callback = function() {
					$(requiredEl).find("select[name=paymentStatus]").val(paymentData.paymentStatus);
				}
				this.hoaPaymentStatus.render({el:$(requiredEl).find('.HoaPayStatusDD'),codeParamName:"paymentStatus",addBlankFirstOption:"true"});
				this.hoaPaymentBy.callback = function() {
					$(requiredEl).find("select[name=paidBy]").val(paymentData.paidBy);
				}
				this.hoaPaymentBy.render({el:$(requiredEl).find('.HoaPayByDD'),codeParamName:"paidBy",addBlankFirstOption:"true"});
				$(requiredEl).find("select[name=paymentStatus]").val(paymentData.paymentStatus);
				$(requiredEl).find("select[name=paidBy]").val(paymentData.paidBy);
			},
			removePaymentRowConfirmPopup: function(evt) {
				var removedRowId = $(evt.currentTarget).closest("tr").find("input[name=hoaPaymentId]").val();
				if(removedRowId && removedRowId != ""){
					this.paymentIdToDelete = removedRowId;
				} else {
					this.paymentIdToDelete = "";
				}
				this.paymentRowToDelete = $(evt.currentTarget).closest("tr");
				$("#deleteHoaPaymentModal").modal("show");
			},
			removePaymentRow: function(){
				var self = this;
				if(self.paymentIdToDelete == ""){
					$(self.paymentRowToDelete).remove();
				} else {
					$.ajax({
						url: app.context() + '/hoa/delHoaPayment/'+self.paymentIdToDelete,
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
				$("#deleteHoaPaymentModal").modal("hide");
			},
			hoaFormValidation :function(currentForm){
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
				    	associationName:{
				    		required:true
				    	},
				    	address:{
				    		required:true
				    	},
				    	address1:{
				    		required:true
				    	},
				    	paymentAmount:{
				    		required:true
				    	},
				    	frequency:{
				    		required:true
				    	},
				    	phone:{
				    		number : true
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
				var headerEl = $(evt.currentTarget).closest(".modal-body").find(".hoaNav.active a");
				if( $(headerEl).text().indexOf("*") == -1)
				{
					$(headerEl).text($(headerEl).text()+"*");
				}
			},
			applyPermissions : function() {
				if($.inArray('ClosingManagement', app.sessionModel.attributes.permissions)==-1) {
					$('#addNewHoa').remove();
					$('.addNewPayment').remove();
					$('.savePropertyHoa').remove();
					$('.deleteHoaPaymentBtn').remove();
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
		return hoaModalView;
});
