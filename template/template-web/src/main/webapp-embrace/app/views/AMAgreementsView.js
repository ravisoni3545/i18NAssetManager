define(["backbone","app","text!templates/AMAgreements.html","text!templates/editAMAgreements.html","text!templates/AMAgreementDocUpload.html","views/codesView","components-dropdowns","components-pickers",
        "jquery.dataTables"],
	function(Backbone,app,AMAgreementsPage,editAMAgreementsPage,docUploadPage,codesView){
		var AMAgreementsView=Backbone.View.extend({
			initialize: function(){
				this.agreementStatus = new codesView({codeGroup:'AGRMNT_STAT'});
				this.agreementDocType = new codesView({codeGroup:'AGR_DOC_TYPE'});
			},
			 events : {
			     "click .showEditAMAgreementsModal":"showEditAMAgreementsModal",
			     "change input[name=isAAFeePercentage]":"changeAAFeeFieldFormat",
			     "change input[name=isAMFeePercentage]":"changeAMFeeFieldFormat",
			     "change input[name=isPMFeePercentage]":"changePMFeeFieldFormat",
			     "keyup input[name=AAFeePercentage]":"calculateAAFeeAmount",
			     "keyup input[name=AMFeePercentage]":"calculateAMFeeAmountTemp",
			     "click .AMAgreementsRemoveBtn":"showDeleteAMAgreementModal",
			     "click #deleteAMAgreementConfirmationButton":"deleteAMAgreement",
			     "click #editOrSaveAMAgreements":"editOrSaveAMAgreements",
			     "click #saveAMDocs":"saveAMDocs",
			    /* "change #docType":"changeSignedDateFormat",*/
			     'click #showUploadRow':'showUploadRow',
				 'click #hideUploadRow':'hideUploadRow'
		     },
			self:this,
			el:"#AMAgreementsTab",
			propertyModel:{},
			expenseIdToBeDeleted:{},
			states:{},
			purchasePrice:{},
			rent:{},
			flag:{},//holds the value of isAMFeePercentage radio btn
			agreementIdToBeDeleted:{},
			assetId:"",
			AMAgreementsIdToBeEdited:"",
			uploadedDocIds:[],
			render : function () {
				var thisPtr = this;
				thisPtr.template = _.template(AMAgreementsPage);
				thisPtr.$el.html("");
				var templateData=thisPtr.collection.toJSON();
				
				thisPtr.assetId=this.propertyModel.get("assetId");
				this.$el.html(this.template({agreementsData:templateData,assetId:thisPtr.assetId,purchasePrice:this.purchasePrice,rent:this.rent}));
							
				this.applyPermissions();
				ComponentsDropdowns.init();
		     	ComponentsPickers.init();
		     	$(".amount").formatCurrency({symbol:"$",roundToDecimalPlace:2});
		     	app.currencyFormatter();
		     	//this.AMAgreementsFormValidation();
                
				return this;
			},
			
			showEditAMAgreementsModal:function(evt){
				var thisPtr=this;
				var selectedModelAttribute;
				var clickedAMAgreementsModel;
				
				var clickedAgreementsId=$(evt.currentTarget).closest('tr').data('agreementsid')	
				if(clickedAgreementsId){
					this.AMAgreementsIdToBeEdited = clickedAgreementsId;		
					clickedAMAgreementsModel = this.collection.findWhere({agreementsId:clickedAgreementsId})
					selectedModelAttribute = clickedAMAgreementsModel.attributes;
					//this.flag = selectedModelAttribute.isAssetManagementFeePercent;
				}
				else{
					this.AMAgreementsIdToBeEdited = "";
					clickedAMAgreementsModel = {};
					selectedModelAttribute = {};
				}
				
				var assetAcquisititonFeePercent=selectedModelAttribute.assetAcuisitionFee;
				var assetManagementFeePercent=selectedModelAttribute.assetManagementFee;
				
				var editTemplate = _.template(editAMAgreementsPage);
				$("#editAMAgreementsDiv").empty();
				thisPtr.assetId=thisPtr.propertyModel.get("assetId");
				$("#editAMAgreementsDiv").html(editTemplate({AMAgreementsModel:selectedModelAttribute,assetId:thisPtr.assetId}));
				
				this.agreementStatus.callback=function() {
					$("#editAMAgreementsStatus [name=agreementStatusId]").val(selectedModelAttribute.statusTypeId);
				}
				this.agreementStatus.render({el:$('#editAMAgreementsStatus'),codeParamName:"agreementStatusId"});
				$("#editAMAgreementsStatus [name=agreementStatusId]").val(selectedModelAttribute.statusTypeId);
				
				//----------------------------------------------------------
				var uploadtemplate = _.template(docUploadPage);
				$("#documentUploadDiv").html(uploadtemplate);
				this.agreementDocType.render({el:$('#docType'),codeParamName:"agreementDocTypeId"});//***************
				//--------------------------------------------------------------
				
				if(selectedModelAttribute.signedDate){
					$("#signedDateDiv").removeClass("disable-field");
					$("[name=signedDate]").removeClass("ignore");
				}
				//$("#signedDateDiv").attr("disabled","disabled");
				
				//this.applyPermissions();
				ComponentsDropdowns.init();
		     	ComponentsPickers.init();
		     	
				//$(".currencyInsurance").formatCurrency();
				app.currencyFormatter("$","currencyInsurance");
				
				if(selectedModelAttribute.isAssetAcquisitionFeePercent=='N'||selectedModelAttribute.isAssetAcquisitionFeePercent==null){
					$("#AAFeeAmountDiv").show();
					$("#AAFeePercentageDiv").hide();
					$("#AAFeeAmountCalcDiv").hide();
					
					$("input[name=AAFeePercentage]").attr("disabled","disabled");
					$("input[name=AAFeeAmount]").attr("disabled",false);
				}
				else{
					$("#AAFeeAmountDiv").hide();
					$("#AAFeePercentageDiv").show();
					$("#AAFeeAmountCalcDiv").show();
					
					$("#AAFeeAmountCalc").val((assetAcquisititonFeePercent*this.purchasePrice)/100);
					$("#AAFeeAmountCalc_currency").val((assetAcquisititonFeePercent*this.purchasePrice)/100);
					
					$("input[name=AAFeeAmount]").attr("disabled","disabled");
					$("input[name=AAFeePercentage]").attr("disabled",false);
				}
				if(selectedModelAttribute.isAssetManagementFeePercent!='Y' && selectedModelAttribute.isAMFeePercentOfRent!='Y'){
					$("#AMFeeAmountDiv").show();
					$("#AMFeePercentageDiv").hide();
					$("#AMFeeAmountCalcDiv").hide();
					
					$("input[name=AMFeePercentage]").attr("disabled","disabled");
					$("input[name=AMFeeAmount]").attr("disabled",false);
				}
				else{
					$("#AMFeeAmountDiv").hide();
					$("#AMFeePercentageDiv").show();
					$("#AMFeeAmountCalcDiv").show();
					
					if(selectedModelAttribute.isAssetManagementFeePercent=='Y'){
						$("#yearly").show();
						$("#monthly").hide();
						var calculatedAmount = (assetManagementFeePercent*this.purchasePrice)/100;
						this.flag='Y';
						if(calculatedAmount>1200){
							$("#AMFeeAmountCalc").val(calculatedAmount);
							$("#AMFeeAmountCalc_currency").val(calculatedAmount);
						}else{
							$("#AMFeeAmountCalc").val(1200);
							$("#AMFeeAmountCalc_currency").val(1200);
						}
					}
					else{
						$("#monthly").show();
						$("#yearly").hide();
						var calculatedAmount = (assetManagementFeePercent*this.rent)/100;
						this.flag='R';
						if(calculatedAmount>100){
							$("#AMFeeAmountCalc").val(calculatedAmount);
							$("#AMFeeAmountCalc_currency").val(calculatedAmount);
						}else{
							$("#AMFeeAmountCalc").val(100);
							$("#AMFeeAmountCalc_currency").val(100);
						}
					}
					
					$("input[name=AMFeeAmount]").attr("disabled","disabled");
					$("input[name=AMFeePercentage]").attr("disabled",false);
				}
				if(selectedModelAttribute.isPropertyManagementFeePercent=='N'||selectedModelAttribute.isPropertyManagementFeePercent==null){
					$("#PMFeeAmountDiv").show();
					$("#PMFeePercentageDiv").hide();
					
					$("input[name=PMFeePercentage]").attr("disabled","disabled");
					$("input[name=PMFeeAmount]").attr("disabled",false);
				}
				else{
					$("#PMFeeAmountDiv").hide();
					$("#PMFeePercentageDiv").show();
					
					$("input[name=PMFeeAmount]").attr("disabled","disabled");
					$("input[name=PMFeePercentage]").attr("disabled",false);
				}
				
				$(".currencyInsurance").formatCurrency({symbol:"$",roundToDecimalPlace:2});
				var form=$('#editAMAgreementsForm');
				var startDatePicker = form.find('input[name=startDate]');
				if(startDatePicker.length>0) {
					$(startDatePicker[0]).parent().datepicker().on('changeDate', function (evt) {
						var selectedDate = new Date(evt.date.valueOf());
						var endDatePicker = form.find('input[name=endDate]');
						if(endDatePicker.length>0) {
							var endDatePickerWidget = $(endDatePicker[0]).parent();
							var endDate = endDatePickerWidget.datepicker("getDate");
							if(endDate<selectedDate) {
								endDatePickerWidget.data({date: selectedDate}).datepicker('update');
								var month = selectedDate.getMonth()+1;
								if(String(month).length<2) {
									month = '0'+month;
								}
								$(endDatePicker[0]).val(month+"-"+selectedDate.getDate()+"-"+selectedDate.getFullYear());
							}
							endDatePickerWidget.datepicker('setStartDate', selectedDate);
						}
					});
				}
				
				this.EditAMAgreementsFormValidation();
				$("#editAMAgreementsModal").modal('show');
			},
	
			EditAMAgreementsFormValidation :function(){
	   	  	 var form1 = $('#editAMAgreementsForm');
	            var error1 = $('.alert-danger', form1);
	            var success1 = $('.alert-success', form1);
	            /*$.validator.addMethod("notEqual",function(value, element, param){
	            	return this.optional(element) || value != param;
	            },"Non-zero value is required");*/
	            
	            form1.validate({
	           	 errorElement: 'span', //default input error message container
	                errorClass: 'help-block', // default input error message class
	                focusInvalid: false, // do not focus the last invalid input
	                ignore: ".ignore",
	                rules: {
	                	startDate : {
	                		required:true							
						},
						endDate : {
	                		required:true
						},
						signedDate : {
	                		required:true
						},
						AAFeeAmount : {
							number : true,
							dollarsscents : true
						},
						AAFeePercentage : {
							number : true
						},
						AMFeeAmount : {
							required:true,
							number : true,
							dollarsscents : true
						},
						AMFeePercentage : {
							required:true,
							number : true
						},
						RevisedAAFeeAmount : {
							dollarsscents : true
						},
						RevisedAMFeeAmount : {
							dollarsscents : true
						},
						PMFeeAmount : {
							number : true,
							dollarsscents : true
						},
						PMFeePercentage : {
							number : true
						},
						leasingFee : {
							number : true
						},
						reLeasingFee : {
							number : true
						},
						maintenanceAmount : {
							number : true,
							dollarsscents : true
						},
						provisionBilled : {
							number : true,
							dollarsscents : true
						}
	                },
	                invalidHandler: function (event, validator) { // display error alert on form submit
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
	       
	       docUploadFormValidation : function(form){
		   	  	//var form1 = $('#amDocUploadForm');
	            var error1 = $('.alert-danger', form);
	            var success1 = $('.alert-success', form);
	            /*$.validator.addMethod("notEqual",function(value, element, param){
	            	return this.optional(element) || value != param;
	            },"Non-zero value is required");*/
	            
	            form.validate({
	           	 errorElement: 'span', //default input error message container
	                errorClass: 'help-block', // default input error message class
	                focusInvalid: false, // do not focus the last invalid input
	                ignore: ".ignore",
	                rules: {
	                	document : {
	                		required:true
						}
	                },
	                invalidHandler: function (event, validator) { // display error alert on form submit
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
	       
	       showDeleteAMAgreementModal:function(evt){
				this.agreementIdToBeDeleted=$(evt.currentTarget).closest('tr').data('agreementsid');
				$('#optionDeleteAMAgreement').modal("show");
			},
			deleteAMAgreement:function(){
				var self=this;
				 $.ajax({
		                url: app.context()+'AMAgreements/deleteAMAgreement/'+this.agreementIdToBeDeleted,
		                contentType: 'application/json',
		                dataType:'text',
		                type: 'DELETE',
		                success: function(res){
		                	$("#optionDeleteAMAgreement").modal('hide');
		                	$('#optionDeleteAMAgreement').on('hidden.bs.modal',function() {
								self.fetchAMAgreements();
								self.trigger('FeeChanged'); //event triggered to re-render the asset details header to update AAFee and AMFee in header
							});
		                },
		                error: function(res){
		                   alert(res.message);
		                   $("#optionDeleteAMAgreement").modal('hide');
		                }
		            });
			},
		    /*showDeleteExpenseModal:function(evt){
				this.expenseIdToBeDeleted=$(evt.currentTarget).attr('expenseId');
				$('#optionDeleteExpense').modal("show");
			},*/
			/*deleteExpense:function(){
				var self=this;
				 $.ajax({
		                url: app.context()+'expenses/deleteExpense/'+this.expenseIdToBeDeleted,
		                contentType: 'application/json',
		                dataType:'text',
		                type: 'DELETE',
		                success: function(res){
		                	$("#optionDeleteExpense").modal('hide');
		                	$('#optionDeleteExpense').on('hidden.bs.modal',function() {
								self.fetchExpenses();
							});
		                },
		                error: function(res){
		                   alert(res.message);
		                   $("#optionDeleteExpense").modal('hide');
		                }
		            });
			},*/
			fetchAMAgreements : function(){
	    	 	var thisPtr=this;
	    	 	thisPtr.collection.assetId=this.propertyModel.get("assetId");
	        	thisPtr.collection.getAMAgreements({
	                success: function (purchasePrice,rent) {
	                	thisPtr.purchasePrice = purchasePrice;
	                	thisPtr.rent = rent;
	                	thisPtr.render();
	                },
	                error   : function (err) {
	                	console.log("Fetch AMAgreements: Error::" + err);
	                	$('.alert-danger').show();
	                }
	            });
	        },
	        changeAAFeeFieldFormat :function(evt){
	        	var self = this;
		    	var isPercentage = $(evt.currentTarget).val();					
				if(isPercentage=='Y'){
					self.$el.find("#AAFeeAmountDiv").hide();
					$("#AAFeePercentageDiv").show();
					$("#AAFeeAmountCalcDiv").show();
					
					$("input[name=AAFeeAmount]").attr("disabled","disabled");
					$("input[name=AAFeePercentage]").attr("disabled",false);
					
					$("input[name=AAFeePercentage]").val($("input[name=AAFeeAmount]").val());
					
					self.calculateAAFeeAmount();
					
				}else{
					$("#AAFeeAmountDiv").show();
					$("#AAFeePercentageDiv").hide();
					$("#AAFeeAmountCalcDiv").hide();
					
					$("input[name=AAFeePercentage]").attr("disabled","disabled");
					$("input[name=AAFeeAmount]").attr("disabled",false);
					
					$("input[name=AAFeeAmount]").val($("input[name=AAFeePercentage]").val());
					$(" #AAFeeAmount_currency").val($(" input[name=AAFeePercentage]").val());
				}
			},
			changeAMFeeFieldFormat :function(evt){	
				var self = this;
		    	var isPercentage = $(evt.currentTarget).val();	
		    	self.flag = isPercentage;
				if(isPercentage=='Y'||isPercentage=='R'){
					$("#AMFeeAmountDiv").hide();
					$("#AMFeePercentageDiv").show();
					$("#AMFeeAmountCalcDiv").show();
					
					if(isPercentage=='Y'){
						$("#yearly").show();
						$("#monthly").hide();
					}else{
						$("#monthly").show();
						$("#yearly").hide();
					}
					
					$("input[name=AMFeeAmount]").attr("disabled","disabled");
					$("input[name=AMFeePercentage]").attr("disabled",false);
					
					$("input[name=AMFeePercentage]").val($("input[name=AMFeeAmount]").val());
					self.calculateAMFeeAmount(isPercentage);
					
				}else{
					$("#AMFeeAmountDiv").show();
					$("#AMFeePercentageDiv").hide();
					$("#AMFeeAmountCalcDiv").hide();
					
					$("input[name=AMFeePercentage]").attr("disabled","disabled");
					$("input[name=AMFeeAmount]").attr("disabled",false);
					
					$("input[name=AMFeeAmount]").val($("input[name=AMFeePercentage]").val());
					$(" #AMFeeAmount_currency").val($(" input[name=AMFeePercentage]").val());
				}
				app.currencyFormatter("$","currencyInsurance");
			},
			changePMFeeFieldFormat :function(evt){	
				var self = this;
		    	var isPercentage = $(evt.currentTarget).val();					
				if(isPercentage=='Y'){
					$("#PMFeeAmountDiv").hide();
					$("#PMFeePercentageDiv").show();
					
					$("input[name=PMFeeAmount]").attr("disabled","disabled");
					$("input[name=PMFeePercentage]").attr("disabled",false);
					
					$("input[name=PMFeePercentage]").val($("input[name=PMFeeAmount]").val());
					
				}else{
					$("#PMFeeAmountDiv").show();
					$("#PMFeePercentageDiv").hide();
					
					$("input[name=PMFeePercentage]").attr("disabled","disabled");
					$("input[name=PMFeeAmount]").attr("disabled",false);
					
					$("input[name=PMFeeAmount]").val($("input[name=PMFeePercentage]").val());
					$(" #PMFeeAmount_currency").val($(" input[name=PMFeePercentage]").val());
				}
				app.currencyFormatter("$","currencyInsurance");
			},
			calculateAAFeeAmount : function(evt) {
				$("#AAFeeAmountCalc").val(($("input[name=AAFeePercentage]").val()/100)*this.purchasePrice);
				$("#AAFeeAmountCalc_currency").val(($("input[name=AAFeePercentage]").val()/100)*this.purchasePrice);
				$(".currencyInsurance").formatCurrency({symbol:"$",roundToDecimalPlace:2});
				app.currencyFormatter("$","currencyInsurance");
			},
			calculateAMFeeAmountTemp : function(){
				this.calculateAMFeeAmount(this.flag);
			},
			calculateAMFeeAmount : function(percentOf) {
				if(percentOf=='Y'){
					var calculatedAmount = ($("input[name=AMFeePercentage]").val()/100)*this.purchasePrice;
					if(calculatedAmount>1200){
						$("#AMFeeAmountCalc").val(calculatedAmount);
						$("#AMFeeAmountCalc_currency").val(calculatedAmount);
					}else{
						$("#AMFeeAmountCalc").val(1200);
						$("#AMFeeAmountCalc_currency").val(1200);
					}
				}
				else if(percentOf=='R'){
					var calculatedAmount = ($("input[name=AMFeePercentage]").val()/100)*this.rent;
					if(calculatedAmount>100){
						$("#AMFeeAmountCalc").val(calculatedAmount);
						$("#AMFeeAmountCalc_currency").val(calculatedAmount);
					}else{
						$("#AMFeeAmountCalc").val(100);
						$("#AMFeeAmountCalc_currency").val(100);
					}
				}
				
				$("input[name=AMFeeAmount]").val($("input[name=AMFeePercentage]").val());
				$(" #AMFeeAmount_currency").val($(" input[name=AMFeePercentage]").val());
				
				$(".currencyInsurance").formatCurrency({symbol:"$",roundToDecimalPlace:2});
				app.currencyFormatter("$","currencyInsurance");
			},
			changeSignedDateFormat : function(evt) {
				if($(evt.currentTarget.closest('#amDocUploadForm')).find('#docType select[name=agreementDocTypeId] option:selected').text()=='AM Agreement'){
					$("#signedDateDiv").removeClass("disable-field");
					$("[name=signedDate]").removeClass("ignore");
				}
				/*else{
					$("#signedDateDiv").addClass("disable-field");
					$("[name=signedDate]").addClass("ignore");
				}*/
			},
			editOrSaveAMAgreements:function(){
		    	 var self=this;		    	 
		    	 var form=$('#editAMAgreementsForm');
		    	 form.attr("enctype","multipart/form-data");
		    	 
		    	 //var uploadDocument = form.find('input[name=document]');
		    	 
		    	 /*var signedDate = form.find('input[name=signedDate]');
		    	 signedDate.attr("disabled",false);
		    	 if(uploadDocument && uploadDocument.val() == ""){
		    		 signedDate.attr("disabled","disabled");
		    	 }*/
		    	 
		    	 if($('#editAMAgreementsForm').validate().form()){
		    		/*if(uploadDocument && uploadDocument.val() == ""){
		    			uploadDocument.attr("disabled","disabled");
		    		}*/
		    		form.append('<input type="hidden" name="agreementsId" value='+self.AMAgreementsIdToBeEdited+">");
			    	form.append('<input type="hidden" name="assetId" value='+self.assetId+">");
		    		$.blockUI({
			     		baseZ: 999999,
			     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				     });
		    	 form.ajaxSubmit({
		    		 url: app.context()+'AMAgreements/editAMAgreements',
		    		 	contentType: 'application/json',
		    		 	dataType:'json',
		    		 	/*data:JSON.stringify({"docIdList":self.uploadedDocIds}),*/
		    		 	data:{"docIdList":self.uploadedDocIds.toString()},
		    	        async:true,
		    	        type: 'POST',
		    	        success: function(res){
		                	$("#editAMAgreementsModal").modal('hide');
		                	$('#editAMAgreementsModal').on('hidden.bs.modal',function() {
	 							self.fetchAMAgreements();
	 							self.trigger('FeeChanged'); //event triggered to re-render the asset details header to update AAFee and AMFee in header
	 						});
		                	 $.unblockUI();
		                },
		                error: function(res){
		                   //alert(res.message);
		                   $("#editAMAgreementsModal").modal('hide');
		                   $.unblockUI();
		                }
		    	    });
		    	 }
		    	    	 
		    	    	 
		    	   // }
		    },
		    saveAMDocs : function(evt) {
		    	 var self=this;	
		    	 self.changeSignedDateFormat(evt);
		    	 var form=$(evt.currentTarget.closest('#amDocUploadForm'));
		    	 self.docUploadFormValidation(form);
		    	 form.attr("enctype","multipart/form-data");
		    	 
		    	 if(form.validate().form()){
			    		form.append('<input type="hidden" name="agreementsId" value='+self.AMAgreementsIdToBeEdited+">");
				    	form.append('<input type="hidden" name="assetId" value='+self.assetId+">");
			    		$.blockUI({
				     		baseZ: 999999,
				     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					     });
			    	 form.ajaxSubmit({
			    		 url: app.context()+'AMAgreements/uploadDocuments',
			    		 	contentType: 'application/json',
			    		 	dataType:'json',
			    	        async:true,
			    	        type: 'POST',
			    	        success: function(res){
			    	        	self.uploadedDocIds = self.uploadedDocIds.concat(res);
			    	        	$.unblockUI();
			    	        	form.find(".alert-success").show();
			    	        	form.find(".alert-success").delay(4000).fadeOut(4000);
			    	        },
			                error: function(res){
			                	$.unblockUI();
			                }
			    	    });
			    	 }
			},
			showUploadRow : function(evt) {
			   $(evt.target).closest(".viewsdiv2").hide();
			   $(evt.target).closest(".viewsdiv2").siblings('.hidesdiv2').show();
			   //var reqtemplate = _.template(docUploadPage)();documentUploadDiv var newlyAddedHtml =  appendTo()
			   $(evt.target).closest("#amDocUpload").after(_.template(docUploadPage));
			   //var newlyAddedHtml = $(evt.target).closest("#documentUploadDiv").appendTo(_.template(docUploadPage));
			   this.agreementDocType.render({el:$(evt.target).closest("#amDocUpload").next().find('#docType'),codeParamName:"agreementDocTypeId"});
			},
			hideUploadRow : function(evt) {
			   //$(evt.target).closest(".amDocUpload").siblings(".amDocUpload").find('.hidesdiv2').hide();
			   //$(evt.target).closest(".amDocUpload").siblings(".amDocUpload").find(".viewsdiv2").show();
			   //$(evt.target).closest(".hidesdiv2").hide();
			   $(evt.target).closest("#amDocUpload").remove();
			},
			applyPermissions : function() {
		    	 if($.inArray('AssetManagement', app.sessionModel.attributes.permissions)==-1) {
		    		 $('#showAddAMAgreementsModal').remove();
		    		 $('#editOrSaveAMAgreements').remove();
		    		 $(".AMAgreementsRemoveBtn").remove();
		    	 }
		     }
		});
		return AMAgreementsView;
});