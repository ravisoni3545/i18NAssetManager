define([ "backbone", "app", "models/insuranceModel",
         "collections/insuranceCollection", "text!templates/insurance.html","text!templates/insuranceResults.html",
         "text!templates/addInsuranceQuote.html","views/codesView","text!templates/insuranceQuoteHeader.html","text!templates/insuranceApplicationModal.html",
         "text!templates/insuranceBinderModal.html","components-dropdowns", "components-pickers"], 
         function(Backbone, app,insuranceModel, insuranceCollection, insurancePage, insuranceResultsPage,
        		 addInsuranceQuotePage,codesView,quoteHeaderPage,insuranceApplicationModal,insuranceBinderModal) {

	var InsuranceView = Backbone.View.extend({
		initialize : function() {
			this.codesView = new codesView({codeGroup:'INS_TYPE'});
			this.statusCodesView = new codesView({codeGroup:'INS_APP_STA'});
		},
		events : {
			"click .insurancePopUp" :"openInsurancePopUp",
			"click #add_quote" :"addNewQuote",
			"click .accordion-toggle" :"collapseOtherOptions",
			"click .removeBtn" : "removeQuotePopUp",
			"click button[name=saveQuoteButton]":"saveInsuranceQuote",
			"click #searchSubmit":"fetchInsuranceSearch",
			'keyup #insuranceSearchForm input':'handleEnterKey',
			"change select[name=insuranceProvider]":"enableAddNewField",
			"click button[name=submitAllQuotes]" :"submitAllQuotes",
			"click #confirmDeleteQuote":"confirmDeleteQuote",
			"click #insuranceAppSubmitButton" :"submitInsuranceApplication",
			"click #insuranceBinderSubmitButton" : "submitInsuranceBinder",
			"click #sendDocsToLenderButton" :"mailDocsToLender",
			"change input[name=isDeductiblePercentage]":"changeDeductibleFieldFormat",
			"change input[name=isWindAndHailPercentage]":"changeWindAndHailFieldFormat"

		},
		self : this,
		el : "#maincontainer",
		model:insuranceModel,
		quoteArr: [],
		render : function () {
			if(this.$el.find('#insuranceSearchForm').length<1) {
				thisPtr= this;
				thisPtr.template = _.template(insurancePage);
				thisPtr.$el.html("");
				this.$el.html(this.template());
				this.statusCodesView.render({el:$('#statusList'),codeParamName:"statusId",addBlankFirstOption:"true"});
			}
			this.fetchInsuranceSearch();
			this.setInsuranceResults();
			return this;
		},
		render1 : function () {
			thisPtr= this;
			thisPtr.template = _.template(insurancePage);
			thisPtr.$el.html("");
			this.$el.html(this.template());
			$('#insurancePageContentWrapper').hide();
			return this;
		},
		setInsuranceResults : function(){
			this.resultsTemplate = _.template(insuranceResultsPage);
			var templateData=thisPtr.collection.toJSON();
			$('#insuranceSearchResults').html("");
			$('#insuranceSearchResults').html(this.resultsTemplate({templateData:templateData}));
			var table =$('#insuranceClosingsTable').dataTable({
				"bPaginate":true,
				"bInfo":true,
				"bFilter":false,
				"deferRender": true,
				"aoColumnDefs": [
				                 { "aTargets": [ 0 ], "bSortable": true },
				                 { "aTargets": [ 1 ], "bSortable": true },
				                 { "aTargets": [ 2 ], "bSortable": true },
				                 { "aTargets": [ 3 ], "bSortable": true },
				                 { "aTargets": [ 4 ], "bSortable": true }
				                 ]
			});
			table.fnSort( [ [2,'desc']] );
			$('#insuranceClosingsTable thead tr th:nth-child(2)').removeClass("sorting_desc sorting_asc").addClass("sorting");
			$(".amount").formatCurrency();
		},
		handleEnterKey:function(event) {
			if(event.keyCode == 13){
				this.fetchInsuranceSearch();
			}
		},
		fetchInsuranceSearch : function(){
			var thisPtr=this;
			var formData = $('#insuranceSearchForm').serializeArray();
			var searchModel= new insuranceModel();

			$.map(formData, function(n, i){
				var value=n['value'];
				var name=n['name'];

				searchModel.set(name,value);
			});

			this.model = searchModel;

			thisPtr.collection.fetchInsuranceClosings(this.model.attributes,{
				success: function (res) {
					thisPtr.collection.reset();
					_(res).each(function(obj) {
						thisPtr.collection.add(new insuranceModel(obj));
					});
					thisPtr.setInsuranceResults();
				},
				error   : function (res) {
					$('#insuranceSearchResults').html("");
					$('#errorDiv').show();
				}
			});
		},

		url :function (){
			var gurl=app.context()+ "/closing";
			return gurl;
		},

		openInsurancePopUp : function(evt){
			var thisPtr = this;
			var object = $(evt.currentTarget).data('object');
			var objectId = $(evt.currentTarget).data('objectid');
			var taskKey = $(evt.currentTarget).data('taskkey');

			var popupKey = $(evt.currentTarget).data('popupkey');
			var popupVersion = $(evt.currentTarget).data('popupversion');
			var popupId = popupKey+'_'+popupVersion;

			$('#'+popupId+' #object').val(object);
			$('#'+popupId+' #objectId').val(objectId);
			$('#'+popupId+' #taskKey').val(taskKey);

			this.object=object;
			this.objectId=objectId;
			this.taskKey=taskKey;
			this.popupId=popupId;
			

			if(popupId.indexOf('INSURANCE_QUOTE_REQUEST_POPUP_1')>-1){
				
				this.fetchInsuranceQuoteHeaderData();
				if(this.insuranceHeaderData){
					this.quoteHeadertemplate = _.template( quoteHeaderPage );
					$('#INSURANCE_QUOTE_REQUEST_POPUP_1').find('.modal-body').html("");
					$('#INSURANCE_QUOTE_REQUEST_POPUP_1').find('.modal-body').html(this.quoteHeadertemplate({headerInfo:this.insuranceHeaderData}));
				}

				this.fetchInsuranceQuotesData();
				this.fetchInsuranceCompanies();
				this.addNewQuote({});
				$(".removeBtn").parent().parent().remove();
				if(!thisPtr.quoteRes || thisPtr.quoteRes.length==0){

					this.addNewQuote({});
				}
				else{
					$('#accordion2').empty();
					for(i=0;i<thisPtr.quoteRes.propertyInsuranceResponse.length;i++){
						this.addNewQuote(thisPtr.quoteRes.propertyInsuranceResponse[i]);
					}
					setTimeout(
							function() 
							{
								$('.panel-collapse').collapse('hide');
							}, 500);

				}
			}
			
			if(popupId.indexOf('INSURANCE_APPLICATION_POPUP_1')>-1){
				this.fetchInsurancePopupData();
				var insuranceAppModal = _.template(insuranceApplicationModal );
				$('#insuranceApplicationPopUpDiv').html("");
				$('#insuranceApplicationPopUpDiv').html(insuranceAppModal({popupData:thisPtr.popupData}));
				$(".amount").formatCurrency();
				this.currentPopup = $('#'+popupId);
				thisPtr.currentForm = $('#'+popupId+'_FORM');
				this.insuranceApplicationFormValidation();
			}
			
			if(popupId.indexOf('INSURANCE_PROVIDED_POPUP_1')>-1){
				this.fetchInsurancePopupData();
				var insuranceBinderTemplate = _.template(insuranceBinderModal );
				$('#insuranceApplicationPopUpDiv').html("");
				$('#insuranceApplicationPopUpDiv').html(insuranceBinderTemplate({popupData:thisPtr.popupData}));
				this.currentPopup = $('#'+popupId);
				thisPtr.currentForm = $('#'+popupId+'_FORM');
				this.insuranceBinderFormValidation();
			}
			$(".amount").formatCurrency();

			$('#'+popupId).modal("show");

		},

		addNewQuote : function(quoteVal){
			var self = this;
			$('.panel-collapse.in').collapse('hide');
			var c = $('.quote_panel').length;
			var i = c+1;
			i= this.checkExistingOption(i);

			$('#accordion2').append('<div class="panel panel-light-grey quote_panel"><div class="panel-heading col-md-12"><h4 class="panel-title pull-left quote-head"><a href="#collapse_2_'+i+'" data-parent="#accordion2" data-toggle="collapse" class="accordion-toggle collapsed acc-header"> Quote '+i+' </a></h4><a class="removeBtn marg_top10 pull-right"><i class="fa fa-trash-o removeBtn"></i></a></div><div class="clearfix"></div><div class="panel-collapse collapse" id="collapse_2_'+i+'" style="height: 0px;"><div class="portlet-body"></div></div></div>').accordion();
			$("#collapse_2_"+i).find(".portlet-body").html(_.template( addInsuranceQuotePage )({quote:quoteVal,insuranceOrgList:this.insuranceCompanies}));
			
			var tempObj = {};
			tempObj.i = i;
			tempObj.insType = quoteVal.insuranceType;
			self.quoteArr.push(tempObj);
			
			this.codesView.callback = function() {
				_.each(this.quoteArr, function(obj){
					$("#collapse_2_"+obj.i).find("[name=insuranceType]").val(obj.insType);
				});
			}.bind(this);
			this.codesView.render({el:$("#collapse_2_"+i).find('#insTypes'),codeParamName:"insuranceType"});
			$("#collapse_2_"+i+" #object").val(this.object);
			$("#collapse_2_"+i+" #objectId").val(this.objectId);
			$("#collapse_2_"+i+" #taskKey").val(this.taskKey);
			$("#collapse_2_"+i+" #propertyInsuranceId").val(quoteVal.propertyInsuranceId);
			$("#collapse_2_"+i).find("[name=insuranceType]").val(quoteVal.insuranceType);
			$("#collapse_2_"+i).find("[name=insuranceProvider]").val(quoteVal.insuranceProvider);
			
			var isDeductiblePercentage = $("#collapse_2_"+i).find("input[name=isDeductiblePercentage]:checked").val();
//			console.log("isDeductiblePercentage ::"+isDeductiblePercentage);
				
			if(isDeductiblePercentage=='Y'){
				$("#collapse_2_"+i+" #deductibleAmountDiv").hide();
				$("#collapse_2_"+i+" #deductiblePercentageDiv").show();
			}else{
				$("#collapse_2_"+i+" #deductibleAmountDiv").show();
				$("#collapse_2_"+i+" #deductiblePercentageDiv").hide();
			}
//			console.log("chk 2::"+insuranceData.isWindAndHailPercentage);
			var isWindAndHailPercentage = $("#collapse_2_"+i).find("input[name=isWindAndHailPercentage]:checked").val();
//			console.log("isWindAndHailPercentage ::"+isWindAndHailPercentage);
				
			if(isWindAndHailPercentage=='Y'){
				$("#collapse_2_"+i+" #windAndHailAmountDiv").hide();
				$("#collapse_2_"+i+" #windAndHailPercentageDiv").show();
			}else{
				$("#collapse_2_"+i+" #windAndHailAmountDiv").show();
				$("#collapse_2_"+i+" #windAndHailPercentageDiv").hide();
			}

			//
			$(".currencyInsurance").formatCurrency();
			app.currencyFormatter("$","currencyInsurance");

			this.insuranceQuoteFormValidation($("#collapse_2_"+i).find(".form-horizontal"));

			/*if(quoteVal['insurancePolicyDetailDocs'] && !$.isEmptyObject(quoteVal['insurancePolicyDetailDocs'])) {
				var insuranceDocs = quoteVal['insurancePolicyDetailDocs'] ;
				var docHtml = "Existing Policies : <br>";
				for(docId in insuranceDocs) {
					docHtml += '<a href="document/download/'+docId+'" target="_blank" style="word-wrap:break-word;">'+insuranceDocs[docId]+'</a><br>';
				}
				_($("#collapse_2_"+i).find('div[id^=existingDocument]')).each(function(document){
					$(document).html(docHtml);
				});
			}*/

			//

			
			$('.collapse').collapse();
		},

		collapseOtherOptions : function(evt){
			$('.panel-collapse.in').collapse('hide');
			var target=$(evt.target);
			target.find('.panel-collapse').collapse('show');
		},

		removeQuotePopUp : function(evt){
						
				this.propertyInsuranceIdToBeDeleted= $(evt.target).parent().parent().parent().find('#propertyInsuranceId').val();
				this.elementToBeRemoved=evt.target.parentElement.parentElement.parentElement;
				$("#form-delete").modal('show');
		
			/*var propertyInsuranceId=$(evt.target).parent().parent().parent().find('#propertyInsuranceId').val();
			if(propertyInsuranceId && propertyInsuranceId!=""){
				this.archiveQuoteHeaderData(propertyInsuranceId);
			}
			evt.target.parentElement.parentElement.parentElement.remove();*/
		},

		checkExistingOption : function(i){
			var thisPtr=this;
			if(($("#collapse_2_"+i)).size()>0){
				i=i+1;
				return thisPtr.checkExistingOption(i);
			}

			return i;
		},

		saveInsuranceQuote : function(evt){
			var thisPtr=this;
			this.currentForm =$(evt.target).parent().parent();
			
	     	var isDeductiblePercentage = this.currentForm.find("input[name=isDeductiblePercentage]:checked").val()
		     
	     	var isWindAndHailPercentage =this.currentForm.find("input[name=isWindAndHailPercentage]:checked").val()
	     	
	     	
	     	if(isDeductiblePercentage=='Y'){
	     		var deductiblePercentage = this.currentForm.find("input[name=deductiblePercentage]").val();
	     		if(deductiblePercentage==""){
	     			this.currentForm.find("#deductibleErrDiv").show();
	     			return;
	     		}else{
	     			this.currentForm.find("#deductibleErrDiv").hide();
	     		}
	     		this.currentForm.find("input[name=deductibleAmount]").val("");
	     	}else{
	     		var deductibleAmount = this.currentForm.find("input[name=deductibleAmount]").val();
	     		if(deductibleAmount==""){
	     			this.currentForm.find("#deductibleErrDiv").show();
	     			return;
	     		}else{
	     			this.currentForm.find("#deductibleErrDiv").hide();
	     		}
	     		
	     		this.currentForm.find("input[name=deductiblePercentage]").val("");
	     	}
	     	
	     	if(isWindAndHailPercentage=='Y'){
	     		this.currentForm.find("input[name=windAndHailAmount]").val("");
	     	}else{
	     		this.currentForm.find("input[name=windAndHailPercentage]").val("");
	     	}
			

			if (this.currentForm.validate().form()){
				if(this.currentForm.find('input[name=insuranceQuoteDocuments]').val() == "") {
					this.currentForm.find('input[name=insuranceQuoteDocuments]').attr("disabled","disabled");
				}
				
				$.blockUI({
		     		baseZ: 999999,
		     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			     });
				this.currentForm.attr("enctype","multipart/form-data");
				this.currentForm.ajaxSubmit({
					url: this.url()+'/process',
					async:true,
					success: function(res){
						$.unblockUI();
						thisPtr.fetchInsuranceQuotesData();
						thisPtr.currentForm.find("#propertyInsuranceId").val(thisPtr.quoteRes.propertyInsuranceResponse[0].propertyInsuranceId);
						thisPtr.currentForm.find(".insuranceQuoteAlertFailure").hide();
						thisPtr.currentForm.find(".alert-success").show();
						$(".insuranceSubmitQuoteAlertFailure").hide();
					},
					error: function(res){
						$.unblockUI();
						thisPtr.currentForm.find(".insuranceQuoteAlertFailure").hide();
						thisPtr.currentForm.find(".alert-success").hide();
						thisPtr.currentForm.find(".internalServerError").show();
					}
				});

				this.currentForm.find('input[name=insuranceQuoteDocuments]').removeAttr("disabled");
			}
		},

		fetchInsuranceQuotesData : function(){
			var thisPtr=this; 
			$.ajax({
				url: this.url()+'/task/'+this.object+'/'+this.objectId+'/'+this.taskKey,
				contentType: 'application/json',
				dataType:'json',
				type: 'GET',
				async: false,
				success: function(res){
					thisPtr.quoteRes=res;
//					console.log("success"+res);
				},
				error: function(res){
//					console.log("fail");
				}
			});


		},

		fetchInsuranceQuoteHeaderData : function(){
			var thisPtr=this; 
			$.ajax({
				url:app.context()+ "/insurance/insuranceHeader/"+thisPtr.objectId,
				contentType: 'application/json',
				dataType:'json',
				type: 'GET',
				async: false,
				success: function(res){
					thisPtr.insuranceHeaderData=res;
//					console.log("success"+res);
				},
				error: function(res){
//					console.log("fail");
				}
			});

		},

		archiveQuoteHeaderData : function(propertyInsuranceId){
			var thisPtr=this; 
			$.ajax({
				url:app.context()+ "/insurance/archiveQuote/"+propertyInsuranceId,
				contentType: 'application/json',
				dataType:'json',
				type: 'GET',
				async: false,
				success: function(res){
//					console.log("success"+res);
				},
				error: function(res){
//					console.log("fail");
				}
			});

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
		
		refreshParentView : function() {
			if(app.closingView && app.closingView.closingStepsView) {
				app.closingView.closingStepsView.refreshClosingSteps();
			}
		},

		enableAddNewField: function(evt){
			this.currentForm =$(evt.target).parent().parent();
			if(this.currentForm.find('select[name=insuranceProvider]').val() == "addNewInsuranceVendor") {
				this.currentForm.parent().parent().find('input[name=newInsuranceVendor]').attr("disabled",false);
			}
			else{
				this.currentForm.parent().parent().find('input[name=newInsuranceVendor]').attr("disabled",true);
			}
		},

		submitAllQuotes : function(evt){
			var propertyInsuranceId=$(evt.target).parent().parent().find("#propertyInsuranceId").val();

			if(propertyInsuranceId && propertyInsuranceId!=""){

				var thisPtr=this;
				this.submitForm=$("#submitQuotesForm");
				$("#submitQuotesForm #endDate").val(new Date().getTime());
				$("#submitQuotesForm #objectId").val(this.objectId);
				$("#submitQuotesForm #taskKey").val(this.taskKey);
				$("#submitQuotesForm #object").val(this.object);
				
				$.blockUI({
		     		baseZ: 999999,
		     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			     });
				$("#submitQuotesForm").attr("enctype","multipart/form-data");
					$("#submitQuotesForm").ajaxSubmit({
						url: this.url()+'/process',
						async:true,
						success: function(res){
							$.unblockUI();
							$('body').removeClass('modal-open');
	           	    	 	$('.modal-backdrop').remove();
	           	    	 	$('#'+thisPtr.popupId).modal("hide");
	           	    	 	$('#'+thisPtr.popupId).on('hidden.bs.modal', function (e) {
		           	    	 	if(app.closingView && app.closingView.closingStepsView) {
		           					app.closingView.closingStepsView.refreshClosingSteps();
		           				}
							});
	           	    	 	if(app.closingView && app.closingView.closingStepsView) {
	           	    	 		return;
	           	    	 	}
							thisPtr.render();
						},
						error: function(res){
							$.unblockUI();
							$(".insuranceSubmitQuoteInternalServerError").show();
							$(".insuranceSubmitQuoteAlertFailure").hide();
						}
					});
			}
			else{
				$(".insuranceSubmitQuoteAlertFailure").show();
				$(".insuranceSubmitQuoteInternalServerError").hide();
			}
		},

		insuranceQuoteFormValidation: function(form1) {

			//var form1 = $('#editContactForm');
			//var error1 = $('.insuranceQuoteAlertFailure', form1);
			//var success1 = $('.alert-success', form1);
			var error1=form1.find(".insuranceQuoteAlertFailure");
			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					yearlyPremium: {

						required : true
					},
			    	deductibleAmount : {
//			    		required:true, // check is done manually above
			    		number : true,
			    		dollarsscents : true
			    	},
			    	deductiblePercentage : {
//			    		required:true, // check is done manually above
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

				invalidHandler: function (event, validator) { //display error alert on form submit              
					//success1.hide();
					error1.show();
					form1.find(".alert-success").hide();
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
		
		confirmDeleteQuote : function(){
			if(this.propertyInsuranceIdToBeDeleted && this.propertyInsuranceIdToBeDeleted!=""){
				this.archiveQuoteHeaderData(this.propertyInsuranceIdToBeDeleted);
			}
			this.elementToBeRemoved.remove();
			$("#form-delete").modal('hide');

		},
		
		fetchInsurancePopupData : function(){
			var thisPtr=this; 
			thisPtr.popupData=null;
			$.ajax({
				url: this.url()+'/task/'+this.object+'/'+this.objectId+'/'+this.taskKey,
				contentType: 'application/json',
				dataType:'json',
				type: 'GET',
				async: false,
				success: function(res){
					thisPtr.popupData=res;
				},
				error: function(res){
					$('#insuranceErrMsg').show();
    				App.scrollTo($('#insuranceErrMsg'), -200);
    				$('#insuranceErrMsg').delay(2000).fadeOut(2000);
				}
			});
		},
		
		submitInsuranceApplication : function(){
			var self = this;
			if(this.currentForm.validate().form()){
	    	 var insuranceCertificateDocs = this.currentForm.find('input[name=insuranceCertificateDocs]');
	    	 if(insuranceCertificateDocs && insuranceCertificateDocs.val() == "") {
	    		 insuranceCertificateDocs.prop("disabled", true);
	         }
	    	 var insuranceEvidenceDocs = this.currentForm.find('input[name=insuranceEvidenceDocs]');
	    	 if(insuranceEvidenceDocs && insuranceEvidenceDocs.val() == "") {
	    		 insuranceEvidenceDocs.prop("disabled", true);
	         }
	    	 var insuranceDeclarationDocs = this.currentForm.find('input[name=insuranceDeclarationDocs]');
	    	 if(insuranceDeclarationDocs && insuranceDeclarationDocs.val() == "") {
	    		 insuranceDeclarationDocs.prop("disabled", true);
	         }
	    	 var insuranceApplicationDocs = this.currentForm.find('input[name=insuranceApplicationDocs]');
	    	 if(insuranceApplicationDocs && insuranceApplicationDocs.val() == "") {
	    		 insuranceApplicationDocs.prop("disabled", true);
	         }
	    	 var insuranceInvoiceDocs = this.currentForm.find('input[name=insuranceInvoiceDocs]');
	    	 if(insuranceInvoiceDocs && insuranceInvoiceDocs.val() == "") {
	    		 insuranceInvoiceDocs.prop("disabled", true);
	         }
    		 $.blockUI({
	     		baseZ: 999999,
	     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
		     });
    		 this.currentForm.attr("enctype","multipart/form-data");
	    	 this.currentForm.ajaxSubmit({
					url: this.url()+'/process',
					async:true,
					success: function(res){
						$.unblockUI();
						self.currentPopup.modal('hide');
						self.currentPopup.on('hidden.bs.modal', function (e) {
							if(app.closingView && app.closingView.closingStepsView) {
	           					app.closingView.closingStepsView.refreshClosingSteps();
	           				}
						});
						if(app.closingView && app.closingView.closingStepsView) {
           	    	 		return;
           	    	 	}
						self.fetchInsuranceSearch();
						$('#taskCompletionMsg').show();
	    				App.scrollTo($('#taskCompletionMsg'), -200);
	    				$('#taskCompletionMsg').delay(2000).fadeOut(2000);
					},
					error: function(res){
						$.unblockUI();
						self.currentPopup.modal('hide');
						$('#taskInCompleteMsg').show();
	    				App.scrollTo($('#taskInCompleteMsg'), -200);
	    				$('#taskInCompleteMsg').delay(2000).fadeOut(2000);
					}
				});
			}
		},
		submitInsuranceBinder : function(){
			var self = this;
			if(this.currentForm.validate().form()){
	    	 var insuranceCertificateDocs = this.currentForm.find('input[name=insuranceCertificateDocs]');
	    	 if(insuranceCertificateDocs && insuranceCertificateDocs.val() == "") {
	    		 insuranceCertificateDocs.prop("disabled", true);
	         }
	    	 var insuranceEvidenceDocs = this.currentForm.find('input[name=insuranceEvidenceDocs]');
	    	 if(insuranceEvidenceDocs && insuranceEvidenceDocs.val() == "") {
	    		 insuranceEvidenceDocs.prop("disabled", true);
	         }
	    	 var insuranceDeclarationDocs = this.currentForm.find('input[name=insuranceDeclarationDocs]');
	    	 if(insuranceDeclarationDocs && insuranceDeclarationDocs.val() == "") {
	    		 insuranceDeclarationDocs.prop("disabled", true);
	         }
	    	 var insuranceInvoiceDocs = this.currentForm.find('input[name=insuranceInvoiceDocs]');
	    	 if(insuranceInvoiceDocs && insuranceInvoiceDocs.val() == "") {
	    		 insuranceInvoiceDocs.prop("disabled", true);
	         }
	    	 self.emailId = this.currentForm.find('input[name=email]').val();
	    	 $.blockUI({
		     		baseZ: 999999,
		     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			     });
	    	 this.currentForm.attr("enctype","multipart/form-data");
	    	 this.currentForm.ajaxSubmit({
					url: this.url()+'/process',
					async:true,
					success: function(res){
						$.unblockUI();
						self.currentPopup.modal('hide');
						self.currentPopup.on('hidden.bs.modal', function (e) {
							if(app.closingView && app.closingView.closingStepsView) {
	           					app.closingView.closingStepsView.refreshClosingSteps();
	           				}
						});
						if(app.closingView && app.closingView.closingStepsView) {
           	    	 		return;
           	    	 	}
						self.fetchInsuranceSearch();
						if(self.emailId!=null && self.emailId!=""){
							 $('#mailSent').show();
		    				   App.scrollTo($('#mailSent'), -200);
		    				   $('#mailSent').delay(2000).fadeOut(2000);
	    	 			}
						$('#taskCompletionMsg').show();
	    				App.scrollTo($('#taskCompletionMsg'), -200);
	    				$('#taskCompletionMsg').delay(2000).fadeOut(2000);
						
					},
					error: function(res){
						$.unblockUI();
						self.currentPopup.modal('hide');
						$('#taskInCompleteMsg').show();
	    				App.scrollTo($('#taskInCompleteMsg'), -200);
	    				$('#taskInCompleteMsg').delay(2000).fadeOut(2000);
					}
				});
			}
		},
		mailDocsToLender :function(evt){
			this.currentForm.find('#mailContentDiv').show();
			if(this.currentForm.validate().form()){
//				this.currentForm.find('#mailContentDiv').show();
				var mailContent = this.currentForm.find('#mailContent').val();
				if(mailContent==null || mailContent==""){
				   $('#mailContentErrDiv').show();
				   App.scrollTo($('#mailContentErrDiv'), -200);
  				   $('#mailContentErrDiv').delay(2000).fadeOut(2000);
				}else{
					var emailId = $(evt.currentTarget).data('email');
					this.currentForm.find('input[name=email]').val(emailId);
					this.submitInsuranceBinder();
				}
			}
		},
		insuranceApplicationFormValidation:function(){
	    	 var thisPtr = this;
    	  	 var form1 = this.currentForm;
//             var error1 = $('.alert-danger', form1);
//             var success1 = $('.alert-success', form1);
             form1.validate({
            	 errorElement: 'span', //default input error message container
                 errorClass: 'help-block', // default input error message class
                 focusInvalid: false, // do not focus the last invalid input
                 ignore: "",
                 rules: {
                	 insuranceApplicationDocs:{
                		 required: true
                	 }
                 },
                 invalidHandler: function (event, validator) { //display error alert on form submit              
//                     success1.hide();
//                     error1.show();
//                     App.scrollTo(error1, -200);
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
		insuranceBinderFormValidation:function(){
	    	 var thisPtr = this;
   	  	 var form1 = this.currentForm;
//            var error1 = $('.alert-danger', form1);
//            var success1 = $('.alert-success', form1);
            form1.validate({
           	 errorElement: 'span', //default input error message container
                errorClass: 'help-block', // default input error message class
                focusInvalid: false, // do not focus the last invalid input
                ignore: "",
                rules: {
                	insuranceEvidenceDocs:{
               		 required: true
               	 }
                },
                invalidHandler: function (event, validator) { //display error alert on form submit              
//                    success1.hide();
//                    error1.show();
//                    App.scrollTo(error1, -200);
                	  $('[name=insuranceEvidenceDocs]').focus();
                	  $('[name=insuranceEvidenceDocs]').effect("highlight", {}, 3000);
                	  App.scrollTo($('[name=insuranceEvidenceDocs]'), -200);
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
       changeDeductibleFieldFormat :function(evt){
    	   this.currentForm = $(evt.currentTarget).closest(".form-horizontal");
	    	var isDeductiblePercentage = this.currentForm.find("input[name=isDeductiblePercentage]:checked").val();
				
			if(isDeductiblePercentage=='Y'){
				this.currentForm.find("#deductibleAmountDiv").hide();
				this.currentForm.find("#deductiblePercentageDiv").show();
				
				this.currentForm.find("input[name=deductiblePercentage]").val(this.currentForm.find("input[name=deductibleAmount]").val());
				
			}else{
				this.currentForm.find("#deductibleAmountDiv").show();
				this.currentForm.find("#deductiblePercentageDiv").hide();
				
				this.currentForm.find("input[name=deductibleAmount]").val(this.currentForm.find("input[name=deductiblePercentage]").val());
				this.currentForm.find("#deductibleAmount_currency").val(this.currentForm.find("input[name=deductiblePercentage]").val());
			}
			$(".currencyInsurance").formatCurrency();
			//app.currencyFormatter("$","currencyInsurance");
		},
	   changeWindAndHailFieldFormat :function(evt){
		   this.currentForm = $(evt.currentTarget).closest(".form-horizontal");
	    	var isWindAndHailPercentage = this.currentForm.find("input[name=isWindAndHailPercentage]:checked").val();
				
			if(isWindAndHailPercentage=='Y'){
				this.currentForm.find("#windAndHailAmountDiv").hide();
				this.currentForm.find("#windAndHailPercentageDiv").show();
				
				this.currentForm.find("input[name=windAndHailPercentage]").val(this.currentForm.find("input[name=windAndHailAmount]").val());
				
			}else{
				this.currentForm.find("#windAndHailAmountDiv").show();
				this.currentForm.find("#windAndHailPercentageDiv").hide();
				
				this.currentForm.find("input[name=windAndHailAmount]").val(this.currentForm.find("input[name=windAndHailPercentage]").val());
				this.currentForm.find("#windAndHailAmount_currency").val(this.currentForm.find("input[name=windAndHailPercentage]").val());
				
			}
			$(".currencyInsurance").formatCurrency();
			//app.currencyFormatter("$","currencyInsurance");
		}

	});
	return InsuranceView;
});