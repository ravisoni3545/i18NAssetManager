define(["text!templates/closingSteps.html", "text!templates/taskPopups.html", "backbone", "app",
        "models/closingStepsModel", "collections/closingStepsCollection","text!templates/rehabEstimateAddRow.html",
        "text!templates/provideRehabEstimateModal.html",
        "text!templates/selectTenant.html","text!templates/propertyAppraisal.html","text!templates/propertyInspectionModal.html",
        "text!templates/documentListForTask.html","text!templates/messagesListForTask.html","views/codesView","views/documentPreviewView",
        "views/insuranceVendorHomeView","collections/insuranceCollection","text!templates/insuranceReview.html","text!templates/insuranceReviewHeader.html",
        "text!templates/insuranceAppSignatureModal.html","text!templates/insuranceVendorSelection.html", "text!templates/usersDropdown.html" , "text!templates/docusignEnvelope.html",
        "text!templates/uploadRentalAgreementTab.html","text!templates/reviewLeaseTab.html","views/emailView", "text!templates/mailSendTemplateToCCBCC.html",
        "text!templates/emailTemplateList.html","views/propertyInspectionIlmView","views/propertyInspectionInvestorView",
        "text!templates/homeWarrantyPopUp.html","text!templates/utilityInformationModal.html","views/utilityView",
        "views/requestForRepairsView","views/sellerResponseForRepairsView","views/investorResponseForRepairsView",
        "text!templates/utilityTransferModal.html","views/utilityTransferView","views/finalWalkThroughView",
        "views/closingAppointmentView","text!templates/optionFee.html","text!templates/huImpound.html","views/watch-has-changed","views/huUpdatedRehabQuoteView",
        "text!templates/cancelClosingPopup.html","text!templates/cancellationSubReasons.html",
        "text!templates/posInspection.html","text!templates/posReport.html","text!templates/posRepairCompletion.html","text!templates/uploadMutualRelease.html",
        "text!templates/uploadFormMutualRelease.html","text!templates/pendingInvestorSign.html","text!templates/sendMutualRelease.html",
        "text!templates/uploadExecutedMutualRelease.html","text!templates/executedMutualRelease.html","components-dropdowns","components-pickers","bootstrap-toggle","bootstrap-datetimepicker"
        ],
        function(closingStepsPage, taskPopupsPage, Backbone, app, closingStepsModel, closingStepsCollection,rehabEstimateAddRow,
        		rehabEstimateModal,selectTenantModal,propertyAppraisalModal,propertyInspectionModal,documentForTaskPage,messageForTaskPage,
        		codesView,documentPreviewView,insuranceVendorHomeView,insuranceCollection,insuranceReview,insuranceReviewHeader,
        		insuranceAppSignatureModal,insuranceVendorSelection,usersDropdown,docusignEnvelopeTemplate,rentalAgreementTab,reviewLeaseTab,
        		emailView,mailSendTemplate,emailTemplates,propertyInspectionIlm,propertyInspectionInvestor,homeWarrantyPopUp,
        		utilityInformation,utilityView,requestForRepairsView,sellerResponseForRepairsView,
        		investorResponseForRepairsView,utilityTransfer,utilityTransferView,finalWalkThrough,
        		closingAppointment,optionFee,huImpound,watchChanges,huUpdatedRehabQuoteView,cancelClosingTemplate,
        		cancellationSubReasonsTemplate,posInspection,posReport,posRepairCompletion,uploadMutualRelease,uploadFormMutualRelease,pendingInvestorSign,
        		sendMutualRelease,uploadExecutedMutualRelease,executedMutualReleasePage){

	var ClosingStepsView = Backbone.View.extend( {
		initialize: function(){
			
		},
		model:new closingStepsModel(),
		states:null,
		collection:new closingStepsCollection(),
		el:"#closingStepsTab",
		mailContent:null,
		currentObject:null,
		currentObjectId:null,
		currentTaskKey:null,
		currentTaskStatus:null,
		docIdToBeMailed:null,
		rentalAgreementTabForm:null,
		milestoneTasksWithMandatoryDocument:['INSURANCE_DECLARATION','TITLE_RECEIVED'],
		propertyModel:{},
		mutualReleaseEnvelopeStatus:null,
		RentaltabCount:0,
		excludedAttrs:['repairRequired','appraisalRequired','isRented','priceIssueResolved','isVacant','huToProvideInsurance','insuranceSelected',
			'buyerNameMatch','addressMatch','commissionToHuMatch','purchasePriceMatch','sellerCreditsMatch','securityDepositPreHud','proRatedRentCreditMatch',
			'isAgreementSigned','isTitleClean','warrantyRequired','isTaxImpound','isInsuranceImpound','isHOAImpound','inspectionRequired','repairRequired','isFundsReserved','repairedBy'],
		events          : {
			"click a[href='taskPopup']":"showTaskModal",
			"click #addNewRehabEstimate":"addNewRehabEstimateRow",
			"click button[id$=PopupSubmitButton]":"submitPopupForm",
			"click button[id=provideRehabEstimateButton]":"submitRehabEstimatePopUp",
			"click a[name='deleteInspectionIssueRow']":"deleteCurrentRow",
			'input input[name="cost"]':'calculateAmount',
			'keyup input[id="cost_currency"]':'calculateAmount',
			'click #confirmDeleteRehab':'deleteRehabItemIssue',
			//Final HUD popup related events - start
			'click #showClosingDiv':'showClosingDiv',
			'click #hideClosingDiv':'hideClosingDiv',
			'click #showFinancedClosingDiv':'showFinancedClosingDiv',
			'click #hideFinancedClosingDiv':'hideFinancedClosingDiv',
			'click button[id=finalHudPopupExtractDataButton]':'processDataExtraction',
			'click input[name=closingCost]':'showClosingDiv',
			'click input[name=closingCostFinanced]':'showFinancedClosingDiv',
			'keyup .hidesdiv1':'calculateClosingCostTotal',
			'keyup .hidesdiv2':'calculateClosingCostTotal',
			'keyup .investment-div':'calculateInvestmentTotal',
			'change input[name=closingCost]':'calculateInvestmentTotal',
			'change input[name=closingCostFinanced]':'calculateInvestmentTotal',
			'change input[name=finalHudDocument]':'showExtractButton',
			'keyup div.hidesdiv2 input[style*=red]':'valueIsFixed',
			//Final HUD popup related events - end
			'click #cancelClosingButton':'cancelClosing',
			'click #completeClosingButton':'completeClosing',
			'click #showOpenClosingToggleButton':'showOpenClosingToggle',
			'click #reprojectDate':'showReprojectModal',
			'click #reProjectPopupSubmit':'saveReprojectedDate',
			'click #openStep':'openWorkflowStepShow',
			'click #deleteStep':'deleteWorkflowStepShow',
			'click #openStepConfirmationButton':'openWorkflowStep',
			'click #deleteStepConfirmationButton':'deleteWorkflowStep',
			'click .showDocumentTooltip': 'showDocumentsForTask',
			'click .showMessageTooltip': 'showMessagesForTask',
			'hidden.bs.modal .with-popover': 'bsModalHide',
			"click .showMoreMessage" : "showMoreContent",
			"click .showLessMessage" : "showLessContent",
			"shown.bs.popover .showMessageTooltip" : "rearrangeMessageTooltip",
			"click .popover-close" : "closePopover",
			'change [name=isVacant]': 'showLeaseActive',
			'change [name=isAgreementSigned]': 'showUploadDiv',
			
			'click #initiateWorkflowConfirmationButton': 'initiateWorkflowForClosing',
			'click #addTaskPopup':'showAddTaskModal',
			'click #saveTaskButton':'saveTask',
			'keyup .rentAmount' : 'calculateRentalDailyPerDiem',
			'click .saveRentalAgreementTab': "saveRentalAgreementTab",
			
			//'click #insuranceAppSignaturePopupSubmitButton':'submitInsuranceAppSignature'
			'input input[name="loanAmount"]':'setDownPayment',
			'keyup input[id="loanAmount_currency"]':'setDownPayment',
			'change #firstPaymentDueDate' :'setMaturityDate',
			'input input[name="term"]':'setMaturityDate',
			'change select[name=impounds]': 'showHideImpoundAmount',
			
			'click .createEnvelopeButton' : 'createDocusignEnvelopeForTask',
			'click .tagAndSendEnvelopeButton' : 'openTagAndSendForEnvelope',
			'click .updateEnvelopeInfoButton' : 'manualRefreshEnvelopeInfo',
			'click .launchManagementConsole' : 'launchDocusignManagementConsole',
			'click .sendRecipientLinkButton' : 'sendRecipientLink',
			'click #mailRentalAgreement' :'sendRentalAgreementMail',
			"click #add_cc":"ShowCcDropdown",
		    "click #add_bcc":"ShowBccDropdown",
		    "change #messageTemplateID":"getTemplate",
		    "click #showPreview" : "ShowEmailPreview",
		    "click #sendMail":"addMessage",
		    'change input[name=warrantyRequired]':'showHideHomeWarrantyDetails',
		    'click #mailMortgageClause' :'sendMortgageInfoMail',
		    'click #mailFeeSheet':'sendFeeSheetMail',
		    'click #mailWireInstruction':'sendWireInstructionMail',
		    'click #cancelClosingLink':"showCancelClosing",
		    'change select[name=cancellationReason]':'getCancellationSubReasons',
		    'change [name=repairRequired]':'showResponsiblePersonRadios',
		    'change [name=repairedBy]':'showFundsReceivedRadios',
		    'change [name=isFundsReserved]':'showEscrowDepositField',
		    "click button[id$=PopupClosingCancellationSubmitButton]":"submitPopupForm",
		    'click #mailMutualReleaseButton':'mailMutualRelease',
		    'click #mailExeMutualRelease':'mailExecutedMutualRelease'
		},
		initiateWorkflowForClosing:function() {
			
			var investmentId = this.propertyModel.objectId;
			var self=this;

			var postData = {};
			postData['objectId']=investmentId;
			console.log(postData);

			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});

			$.ajax({
				dataType: 'json',
				contentType: "application/json",
				type: "POST",
				url: app.context()+ '/closing/initiateWorkflow',
				async: false,
				data: JSON.stringify(postData),
				success: function(res){
					$.unblockUI();
					var popup = $("#initiateWorkflowModal");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.refreshClosingSteps();
					});
				},
				error: function(res){
					$.unblockUI();
					var popup = $("#initiateWorkflowModal");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.refreshClosingSteps();
					});
				}
			});
		},
		showLeaseActive:function() {
			var isVacant=$('input[name=isVacant]:checked').val();
			console.log(isVacant);
			if(isVacant=='tenantOccupied') {
				$('#leaseActive').show();
			} else {
				$('#leaseActive').hide();
			}
		},
		showUploadDiv:function(){
			var isAgreementSigned=$('input[name=isAgreementSigned]:checked').val();
			
			if(isAgreementSigned=='No') {
				this.currentForm.find('input[name=document]').val("");
				$('#assetMgmtAgreementErrDiv').hide();
				$('#assetMgmtAgreementDiv').hide();
				this.currentForm.find('input[name=document]').attr("disabled","disabled");
			} else {
				$('#assetMgmtAgreementErrDiv').hide();
				$('#assetMgmtAgreementDiv').show();
				this.currentForm.find('input[name=document]').attr("disabled",false);
			}
		},
		closePopover:function(evt) {
			evt.stopPropagation();
			if($(evt.currentTarget).data("item") === "msg") {
				$(evt.currentTarget).parent().parent().parent().find(".showMessageTooltip").popover("hide");
				$(evt.currentTarget).parent().parent().parent().find(".showMessageTooltip").data('show',true);
				$(evt.currentTarget).parent().parent().parent().find(".showMessageTooltip").removeClass("tooTip-shown");
			} else {
				$(evt.currentTarget).parent().parent().parent().parent().parent().parent().parent().find(".showDocumentTooltip").popover("hide");
				$(evt.currentTarget).parent().parent().parent().parent().parent().parent().parent().find(".showDocumentTooltip").data('show',true); 
				$(evt.currentTarget).parent().parent().parent().parent().parent().parent().parent().find(".showDocumentTooltip").removeClass("tooTip-shown");
			}
		},
		rearrangeMessageTooltip:function(evt) {
//			console.log("rearrange: " + $(evt.currentTarget.nextElementSibling).css('top') ); 
//			console.log($(evt.currentTarget.nextElementSibling).first());
			if(evt.currentTarget.nextElementSibling.firstChild){
				evt.currentTarget.nextElementSibling.firstChild.style.display = 'none';
			}
//			$(evt.currentTarget.nextElementSibling).css('top',parseInt($(evt.currentTarget.nextElementSibling).css('top')) + 50 + 'px');
//			$(evt.currentTarget.nextElementSibling).css('left',parseInt($(evt.currentTarget.nextElementSibling).css('left')) - 100 + 'px');
		},
		bsModalHide:function() {
			$('.showMessageTooltip').popover("hide");
			$('.showMessageTooltip').data('show',true);
			$('.showMessageTooltip').removeClass("tooTip-shown");
			$('.showDocumentTooltip').popover("hide");
			$('.showDocumentTooltip').data('show',true);
			$('.showDocumentTooltip').removeClass("tooTip-shown");
		},
		initializeTooltipEffects:function(){
			$('.showMessageTooltip').popover({ 
				trigger: 'manual',
				'placement': 'right',
				hide: function() {
					$(this).animate({marginLeft: -200}, function() {
						$(this).css({marginLeft: ''});
					});
				},
				show: function () {
					$(this).fadeIn(500);
				}
			});
			$('.showDocumentTooltip').popover({ 
				trigger: 'manual',
				'placement': 'right',
				hide: function() {
					$(this).animate({marginLeft: -10}, function() {
						$(this).css({marginLeft: ''});
					});
				},
				show: function () {
					$(this).fadeIn(200);
				}
			});
		},
		initializeTooltipRender:function(){
			this.initializeTooltipEffects();
			$(".showDocumentTooltip").hide();
			$(".showMessageTooltip").hide();

			var loadAllContent;
			this.model.loadAllMessagesAndDocuments(this.propertyModel.object,this.propertyModel.objectId,{
				success : function ( model, res ) {
					loadAllContent = res;
				},
				error: function (model,res){
					console.log("Fetching All documents and messages for closing failed");
				}
			});
			if(loadAllContent && loadAllContent.length != 0){
				if(loadAllContent[0]) {
					loadAllContent[0].forEach(function (element, index, array){
						$('[data-taskkey="'+ element +'"]').parent().find('.showDocumentTooltip').show();
					});
				}
				if(loadAllContent[1]) {
					loadAllContent[1].forEach(function (element, index, array){
						$('[data-taskkey="'+ element +'"]').parent().find('.showMessageTooltip').show();
					});
				}
			}
		},
		initializeTooltipPopup:function(popupId) {
			this.initializeTooltipEffects();

			if(this.getMessagesForTask() == "") {
				$('#'+popupId).find('.showMessageTooltip').hide();
			} else {
				$('#'+popupId).find('.showMessageTooltip').show();
			}
			if(this.getDocumentsForTask() == "") {
				$('#'+popupId).find('.showDocumentTooltip').hide();
			} else {
				$('#'+popupId).find('.showDocumentTooltip').show();
			}
		},
		showMessagesForTask:function (evt) {
			evt.preventDefault();
			evt.stopPropagation();
			var self = this;
			var isVisible = $(evt.currentTarget).data('show');



			if(isVisible == true){
				var msgContent =""; 
					
				if($(evt.currentTarget).data('object')){
					msgContent=self.getMessagesForTask($(evt.currentTarget).data('taskkey'),$(evt.currentTarget).data('object'),$(evt.currentTarget).data('objectid'));
				}
				else{
					msgContent=self.getMessagesForTask($(evt.currentTarget).data('taskkey'),self.currentObject,self.currentObjectId,$(evt.currentTarget).data('subobject'),$(evt.currentTarget).data('subobjectid'));
				}
				
				var els = $(".tooTip-shown");
				_.each(els,function(el){
					$(el).removeClass("tooTip-shown");
					$(el).popover("hide");
					$(el).data('show',true);
				});
				$(evt.currentTarget).addClass("tooTip-shown");
				$(evt.currentTarget).data('show',false);
				if(msgContent.length>0){
					$(evt.currentTarget).attr("data-content",msgContent);
				}
				else{
					$(evt.currentTarget).attr("data-content","No messages");
				}
				$(evt.currentTarget).popover("show");
			} else {
				$(evt.currentTarget).popover("hide");
				$(evt.currentTarget).data('show',true);
				$(evt.currentTarget).removeClass("tooTip-shown");
			}
		},
		getMessagesForTask:function(taskKey,object,objectId,subObject,subObjectId) {
			var taskKey = taskKey || this.currentTaskKey;
			var excludedTaskKeys = ['INSURANCE_QUOTES_REVIEW','INSURANCE_VENDOR_SELECTION'];
			var object = object || this.currentObject;
			var objectId = objectId || this.currentObjectId;
			var msgContent;

			if(!subObject){
				this.model.loadEachTaskMessage(taskKey,object,objectId,{
					success : function ( model, res ) {
						msgContent = res;
					},
					error: function (model,res){
						console.log("Fetching Messages for each task failed");
					}
				});
			}
			else{
				if(excludedTaskKeys.indexOf(taskKey)!=-1){
		    		 taskKey = null;
		    	}
				this.model.loadTaskSubObjectMessages(taskKey,object,objectId,subObject,subObjectId,{
					success : function ( model, res ) {
						msgContent = res;
					},
					error: function (model,res){
						console.log("Fetching Document for each task failed");
					}
				});
			}
			
			if(msgContent.length == 0){
				return "";
			} else {
				var popOverMsgTemplate = _.template( messageForTaskPage )({msgDatas:msgContent});
				return popOverMsgTemplate;
			}
		},
		showDocumentsForTask:function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			var self = this;
			var isVisible = $(evt.currentTarget).data('show');

			if(isVisible == true){
				var msgContent =""; 
					if($(evt.currentTarget).data('object')){
						msgContent=self.getDocumentsForTask( $(evt.currentTarget).data('doc'),$(evt.currentTarget).data('taskkey'),$(evt.currentTarget).data('object'),$(evt.currentTarget).data('objectid') );
					}
					else{
						msgContent=self.getDocumentsForTask(null,$(evt.currentTarget).data('taskKey'), self.currentObject,self.currentObjectId,$(evt.currentTarget).data('subobject'),$(evt.currentTarget).data('subobjectid') );
					}
				
				var els = $(".tooTip-shown");
				_.each(els,function(el){
					$(el).removeClass("tooTip-shown");
					$(el).popover("hide");
					$(el).data('show',true);
				});

				$(evt.currentTarget).addClass("tooTip-shown");
				$(evt.currentTarget).data('show',false);
				if(msgContent.length>0){
					$(evt.currentTarget).attr("data-content",msgContent);
				}
				else{
					$(evt.currentTarget).attr("data-content","Documents not uploaded");
				}
				$(evt.currentTarget).popover("show");
			} else {
				$(evt.currentTarget).popover("hide");
				$(evt.currentTarget).data('show',true);
				$(evt.currentTarget).removeClass("tooTip-shown");
			}
		},
		getDocumentsForTask:function(subTask,taskKey,object,objectId,subObject,subObjectId) {
			var taskKey = taskKey || this.currentTaskKey;
			if(taskKey == "INSURANCE_APPLICATION_SIGNATURE"){
	    		 taskKey = "INSURANCE_APPLICATION";
	    	 }
	    	 var object = object || this.currentObject;
	    	 var objectId = objectId || this.currentObjectId;
	    	 var subTask = subTask || this.currentSubTask;
	    	 var docsContent;

			if(!subObject){
				this.model.loadEachTaskDocument(taskKey,object,objectId,subTask,{
					success : function ( model, res ) {
						docsContent = res;
					},
					error: function (model,res){
						console.log("Fetching Document for each task failed");
					}
				});
			}
			else{
				this.model.loadTaskSubObjectDocuments(taskKey,object,objectId,subObject,subObjectId,{
					success : function ( model, res ) {
						docsContent = res;
					},
					error: function (model,res){
						console.log("Fetching Document for each task failed");
					}
				});
			}
			
			
			if(docsContent.length == 0){
				return "";
			} else {
				var popOverDocTemplate = _.template( documentForTaskPage )({documentDatas:docsContent});
				return popOverDocTemplate;
			}
		},
		showMoreContent : function(evt){
			$(evt.currentTarget).closest('td').find(".showLessContent").hide();
			$(evt.currentTarget).closest('td').find(".showMoreContent").show();
		},
		showLessContent : function(evt){
			$(evt.currentTarget).closest('td').find(".showMoreContent").hide();
			$(evt.currentTarget).closest('td').find(".showLessContent").show();
		},
		calculateInvestmentTotal:function() {
			var purchasePrice=$("input[name=purchasePriceHUD]").val();
			var rehabCost=$("input[name=rehabCost]").val();
			var closingCost=$("input[name=closingCost]").val();
			var closingCostFinanced=$("input[name=closingCostFinanced]").val();
			var downPayment=$("input[name=downPayment]").val();

			var investmentTotal=0;

			var isMortgage = false;
			if(this.parentView) {
				if(this.parentView.model.attributes.investmentResponse['financingTypeName'] == 'Cash') {
					isMortgage = false;
				} else {
					isMortgage = true;
				}
			}

			if(!isMortgage) {
				if(purchasePrice.trim()!=''){
					investmentTotal+=parseFloat(purchasePrice.trim());
				}
			}
			if(rehabCost.trim()!=''){
				investmentTotal+=parseFloat(rehabCost.trim());
			}
			if(closingCost.trim()!=''){
				investmentTotal+=parseFloat(closingCost.trim());
			}
			if(closingCostFinanced.trim()!=''){
				investmentTotal+=parseFloat(closingCostFinanced.trim());
			}
			if(isMortgage) {
				if(downPayment.trim()!=''){
					investmentTotal+=parseFloat(downPayment.trim());
				}
			}

			$('input[name=totalInvestment]').val(investmentTotal.toFixed(2));
			$('input[id=totalInvestment_currency]').val(investmentTotal.toFixed(2));
			$('#totalInvestment_currency').formatCurrency({symbol:""});
		},
		calculateClosingCostTotal:function() {
			//closing cost - POC calculation
			if(this.taskKeyName.indexOf('FINAL_HUD')>-1){
				var inspectionFee=$("input[name=inspectionFee]").val();
				var appraisalFee1=$("input[name=appraisalFee1]").val();
				var optionFee=this.currentForm.find("input[name=optionFee]").val();
				var utilitiesActivationFee=$("input[name=utilitiesActivationFee]").val();

				var closingTotal=0;
				if(inspectionFee.trim()!=''){
					closingTotal+=parseFloat(inspectionFee.trim());
				}
				if(appraisalFee1.trim()!=''){
					closingTotal+=parseFloat(appraisalFee1.trim());
				}
				if(optionFee.trim()!=''){
					closingTotal+=parseFloat(optionFee.trim());
				}
				if(utilitiesActivationFee.trim()!=''){
					closingTotal+=parseFloat(utilitiesActivationFee.trim());
				}
				$('input[name=closingCost]').val(closingTotal.toFixed(2)).trigger('change');
				$('input[id=closingCost_currency]').val(closingTotal.toFixed(2));
				$('#closingCost_currency').formatCurrency({symbol:""});

				//closing cost - Financed calculation
				var cityPropertyTax=$("input[name=cityPropertyTax]").val();
				var countyPropertyTax=$("input[name=countyPropertyTax]").val();
				var annualAssessments=$("input[name=annualAssessments]").val();
				var floodInsurance=$("input[name=floodInsurance]").val();
				var optionFeeCredit=$("input[name=optionFeeCredit]").val();
				var credit1=$("input[name=credit1]").val();
				var credit2=$("input[name=credit2]").val();
				var credit3=$("input[name=credit3]").val();
				var cityPropertyTaxCredit=$("input[name=cityPropertyTaxCredit]").val();
				var countyPropertyTaxCredit=$("input[name=countyPropertyTaxCredit]").val();
				var annualAssessmentsCredit=$("input[name=annualAssessmentsCredit]").val();
				var floodInsuranceCredit=$("input[name=floodInsuranceCredit]").val();
				var hoa=$("input[name=hoa]").val();
				var hoaCredit=$("input[name=hoaCredit]").val();
				var securityDepositCredit=$("input[name=securityDepositCredit]").val();
				var proRatedRentCredit=$("input[name=proRatedRentCredit]").val();
				var appraisalFee=$("input[name=appraisalFee]").val();
				var originationCharges=$("input[name=originationCharges]").val();
				var creditReport=$("input[name=creditReport]").val();
				var floodCertificationFee=$("input[name=floodCertificationFee]").val();
				var dailyInterestCharges=$("input[name=dailyInterestCharges]").val();
				var homeownersInsuranceYearly=$("input[name=homeownersInsuranceYearly]").val();
				var homeownersInsuranceReserves=$("input[name=homeownersInsuranceReserves]").val();
				var propertyTaxReserves=$("input[name=propertyTaxReserves]").val();
				var aggregateAdjustment=$("input[name=aggregateAdjustment]").val();
				var titleServicesInsurance=$("input[name=titleServicesInsurance]").val();
				var ownersTitleInsurance=$("input[name=ownersTitleInsurance]").val();
				var recordingFee=$("input[name=recordingFee]").val();
				var mobileClosingFee=$("input[name=mobileClosingFee]").val();
				var otherCosts=$("input[name=otherCosts]").val();

				var closingCostFinanced=0;
				//debits
				if(cityPropertyTax.trim()!=''){
					closingCostFinanced+=parseFloat(cityPropertyTax.trim());
				}
				if(countyPropertyTax.trim()!=''){
					closingCostFinanced+=parseFloat(countyPropertyTax.trim());
				}
				if(annualAssessments.trim()!=''){
					closingCostFinanced+=parseFloat(annualAssessments.trim());
				}
				if(floodInsurance.trim()!=''){
					closingCostFinanced+=parseFloat(floodInsurance.trim());
				}
				if(appraisalFee.trim()!=''){
					closingCostFinanced+=parseFloat(appraisalFee.trim());
				}
				if(originationCharges.trim()!=''){
					closingCostFinanced+=parseFloat(originationCharges.trim());
				}
				if(creditReport.trim()!=''){
					closingCostFinanced+=parseFloat(creditReport.trim());
				}
				if(floodCertificationFee.trim()!=''){
					closingCostFinanced+=parseFloat(floodCertificationFee.trim());
				}
				if(dailyInterestCharges.trim()!=''){
					closingCostFinanced+=parseFloat(dailyInterestCharges.trim());
				}
				if(homeownersInsuranceYearly.trim()!=''){
					closingCostFinanced+=parseFloat(homeownersInsuranceYearly.trim());
				}
				if(homeownersInsuranceReserves.trim()!=''){
					closingCostFinanced+=parseFloat(homeownersInsuranceReserves.trim());
				}
				if(propertyTaxReserves.trim()!=''){
					closingCostFinanced+=parseFloat(propertyTaxReserves.trim());
				}
				if(titleServicesInsurance.trim()!=''){
					closingCostFinanced+=parseFloat(titleServicesInsurance.trim());
				}
				if(ownersTitleInsurance.trim()!=''){
					closingCostFinanced+=parseFloat(ownersTitleInsurance.trim());
				}
				if(recordingFee.trim()!=''){
					closingCostFinanced+=parseFloat(recordingFee.trim());
				}
				if(mobileClosingFee.trim()!=''){
					closingCostFinanced+=parseFloat(mobileClosingFee.trim());
				}
				if(otherCosts.trim()!=''){
					closingCostFinanced+=parseFloat(otherCosts.trim());
				}
				if(hoa.trim()!=''){
					closingCostFinanced+=parseFloat(hoa.trim());
				}
				//credit
				if(optionFeeCredit.trim()!=''){
					closingCostFinanced-=parseFloat(optionFeeCredit.trim());
				}
				if(credit1.trim()!=''){
					closingCostFinanced-=parseFloat(credit1.trim());
				}
				if(credit2.trim()!=''){
					closingCostFinanced-=parseFloat(credit2.trim());
				}
				if(credit3.trim()!=''){
					closingCostFinanced-=parseFloat(credit3.trim());
				}
				if(cityPropertyTaxCredit.trim()!=''){
					closingCostFinanced-=parseFloat(cityPropertyTaxCredit.trim());
				}
				if(countyPropertyTaxCredit.trim()!=''){
					closingCostFinanced-=parseFloat(countyPropertyTaxCredit.trim());
				}
				if(annualAssessmentsCredit.trim()!=''){
					closingCostFinanced-=parseFloat(annualAssessmentsCredit.trim());
				}
				if(floodInsuranceCredit.trim()!=''){
					closingCostFinanced-=parseFloat(floodInsuranceCredit.trim());
				}
				if(hoaCredit.trim()!=''){
					closingCostFinanced-=parseFloat(hoaCredit.trim());
				}
				if(securityDepositCredit.trim()!=''){
					closingCostFinanced-=parseFloat(securityDepositCredit.trim());
				}
				if(proRatedRentCredit.trim()!=''){
					closingCostFinanced-=parseFloat(proRatedRentCredit.trim());
				}
				if(aggregateAdjustment.trim()!=''){
					closingCostFinanced-=parseFloat(aggregateAdjustment.trim());
				}
				$('input[name=closingCostFinanced]').val(closingCostFinanced.toFixed(2)).trigger('change');
				$('input[id=closingCostFinanced_currency]').val(closingCostFinanced.toFixed(2));
				$('#closingCostFinanced_currency').formatCurrency({symbol:""});
			}
		},
		showClosingDiv:function(){
			$(".viewsdiv1").hide();
			$(".hidesdiv1").show();
		},
		hideClosingDiv:function(){
			$(".viewsdiv1").show();
			$(".hidesdiv1").hide();
		},
		showFinancedClosingDiv:function(){
			$(".viewsdiv2").hide();
			$(".hidesdiv2").show();
		},
		hideFinancedClosingDiv:function(){
			$(".viewsdiv2").show();
			$(".hidesdiv2").hide();
		},
		showExtractButton:function(){
			if ($("input[name='finalHudDocument']")[0].files.length) $(".hidesdiv3").show();
		},
		processDataExtraction:function(evt){
			console.log(evt);
			console.log ("app",app)
			var hudDebug = {debug : false, file: "" };
			var docid = "";
			var self = this;
			var ajaxParms = {};
			if (hudDebug.debug) {
				console.log("Debug run with input file:","'"+hudDebug.file+"'");
				var theUrl = app.context() + "extract/debug/" + encodeURI(hudDebug.file);
				console.log("theUrl",theUrl);
				ajaxParms = {
					type : "POST", url : theUrl, async : true
				};
			} else if ($("input[name='finalHudDocument']")[0].files.length) {
				console.log("new file has been selected.",$("input[name='finalHudDocument']")[0].files);
				var formData = new FormData();
				formData.append('file', $("input[name='finalHudDocument']")[0].files[0]);
				ajaxParms = {
					type : "POST", url : app.context() + "/extract/file", async : true,
					data : formData, cache: false, contentType: false, processData: false
				};
				if(formData.fake) {
				    // Make sure no text encoding stuff is done by xhr
					ajaxParms.xhr = function() { var xhr = jQuery.ajaxSettings.xhr(); xhr.send = xhr.sendAsBinary; return xhr; }
					ajaxParms.contentType = "multipart/form-data; boundary="+formData.boundary;
					ajaxParms.data = formData.toString();
				};
				
			} else if ($("div#existingFinalHudDocument a").length) {
				docid = $("div#existingFinalHudDocument a").attr('href').replace("document/download/","")
				console.log("Going to extract data from a document from the server, docid is: ", docid);
				ajaxParms = {
					type : "POST", url : app.context() + "/extract/document/"+docid, async : true
				};
			}
			_.extend(ajaxParms,{
				beforeSend: function(xhr,settings) {
					$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Extracting Data From HUD Document...</div>'
					});
					console.log("Ajax xhr",xhr,"Ajax settings",settings);
				}
			});
			var extractedDataObject = $.ajax(ajaxParms);
			extractedDataObject.done(function(responseString) {
				console.log("response string",responseString);
				var response;
				try {
					response = JSON.parse(responseString);
					console.log("JSON response",response);
				} catch (e) {
					console.log("error in JSON parsing extract HUD data response from server: "+e);
				}
				if (responseString=="" || responseString.includes("***") ) {
					responseString="Error";
					response = ["Error: Document provided was not a valid HUD document.","No data extracted."];
				}
				if (!responseString.toLowerCase().includes("error")) {
					self.showFinancedClosingDiv();
					var scrAmt = 236;
					$(evt.currentTarget).closest(".modal").animate({ scrollTop: scrAmt }, 'slow');
					var hasCurrencySymbol = self.hasCurrency(response);
					var inputFields = {};
					var itmList = [];
					var fndCtl = false;
					var secName = "";
					var fields = {};
					for (var i=0;i<self.sectDefs.length;i++) {
						itmList = [];
						secName = "section"+self.sectDefs[i].sec;
						_.each(
							self.getHUDSectionItems(response,self.sectDefs[i].rng[0],self.sectDefs[i].rng[1]),function(itm) {
								var revItm = self.revisedItem(itm.item);
								var revAmt = itm.amount.replace("-","").replace(/,/g,"");
								//revAmt = hasCurrencySymbol ? ("$" + revAmt.substr(1)) : revAmt.substr(1) ;
								var matchRes = self.matchHUDItem(revItm,secName);
								if (matchRes!==false) {
									var newResult = {
										 "item"    : revItm,         "amount": revAmt,                "ctlId" : matchRes.ctlid, 
									     "piece"   : matchRes.piece, "score" : matchRes.score,    "minlength" : matchRes.minlength,
									     "segment" : secName
									     };
									itmList.push(newResult); 
									if (fields.hasOwnProperty(matchRes.ctlid)) fields[matchRes.ctlid].push(newResult);
									else fields[matchRes.ctlid]=[newResult];
								}
							}, this
						);
						inputFields[secName] = itmList;
					}
					
					
//					console.log("inputFields",inputFields);
//					console.log("fields before",fields);
					var selectedFields = JSON.parse(JSON.stringify(fields));
					var unSelectedFields = [];
					for (var item in selectedFields) {
						var sorted = _.sortBy(selectedFields[item], 'score');
						for (var j=sorted.length-1;j>=0;j--)
							if (sorted[j].item.includes("seller")) sorted.splice(-1,1);
						if (sorted.length>0) {
							selectedFields[item] = _.last(sorted);
							if (sorted.length>1)
								unSelectedFields.push( _.initial(sorted) );
						} else delete selectedFields[item];
					}
//					console.log("selected fields",selectedFields);
//					console.log("unselected fields",unSelectedFields);
	
	 				var remainingItems = JSON.parse(JSON.stringify(self.hudSections));
					for (itm in selectedFields) {
						console.log("current itm:",itm);
						var thisSegment = selectedFields[itm].segment;
						var thisCtl = selectedFields[itm].ctlId;
						var thisAmt = selectedFields[itm].amount.replace("$","");
						self.updateHudFields(thisCtl,thisAmt,selectedFields[itm].score);
						remainingItems[thisSegment] = _.without(remainingItems[thisSegment],thisCtl);
						if (remainingItems[thisSegment].length<=0) remainingItems = _.omit(remainingItems, thisSegment) ;
						
					}
					console.log("remaining items",remainingItems);
				} else {
					var errText = "";
					_.each(response,function(itm,indx,lst){
						errText += itm + "<br/>"
					});
					$(evt.currentTarget).closest(".form-group").find(".alert-danger").html(errText);
					$(evt.currentTarget).closest(".form-group").find(".alert-danger").show();
					$(evt.currentTarget).closest(".form-group").find(".alert-danger").delay(2000).fadeOut(4000);
					
				}
			});
			extractedDataObject.fail(function(response) {
				console.log("Error in extracting the data ",response);
			});
			extractedDataObject.always(function(){
				$.unblockUI();
			});
		},
		updateHudFields : function(thisCtl,thisAmt,score) {
			$("input#"+thisCtl).val(thisAmt);
			$(("input#"+thisCtl).replace("_currency","")).val(thisAmt);
			var theStyle = $("input#"+thisCtl).attr("style");
			if (theStyle==undefined) theStyle="";
			if (score<1) $("input#"+thisCtl).attr("style",theStyle+"border:solid red 1px;");
			else $("input#"+thisCtl).attr("style",theStyle+"border:solid green 1px;");
		},
		valueIsFixed : function (evt) {
			console.log("valueIsFixed event",evt);
			var fldChanged = evt.currentTarget;
			console.log ("field changed is",fldChanged);
			var theStyle = $(fldChanged).attr("style");
			console.log ("style before",theStyle);
			var theStyle = theStyle.replace(/border.*\;/g,"");
			console.log ("style after",theStyle);
			$(fldChanged).attr("style",theStyle);
		},
		responseHasErrors : function (response) {
			var resp = false;
			return resp;
		},
		hasCurrency : function (items) {
			var countFound = 0;
			var important = 0;
			var self=this;
			_.each(items,function(e,i,l) {
				for (var j=0;j<self.sectDefs.length;j++) {
					if (e.lineno>=self.sectDefs[j].rng[0] && e.lineno<=self.sectDefs[j].rng[1]) {
						important++;
						if (e.amount.startsWith("$")) countFound++;
					}
				}
			});
			var res;
			if (countFound/important > 0.5) res = true;
			else res = false;
			console.log("hasCurrency, countFound, important, res",countFound,important, res);
			return res;
		},
		revisedItem : function (itemDescr) {
			var replcDescr = itemDescr.replace(/[^A-Za-z]/g,"").toLowerCase();
			return replcDescr;
		},
		matchHUDItem : function (hudItem,section) {
			var found = false;
			var score=0;
			var minLength = 1;
			for (var i=0;i<this.hudSections[section].length;i++) {
				var matchText = this.hudSections[section][i].toLowerCase().replace("_currency","");
				var str1; var str2;
				if (hudItem.length>matchText.length) { str1=matchText; str2=hudItem.toLowerCase(); minLength=matchText.length; }
				else { str2=matchText; str1=hudItem.toLowerCase(); minLength=hudItem.length; }
				for (var offset=0;offset<(str1.length-2);offset++) {
					for (c=str1.length;c>2;c--) {
						var piece = str1.slice(offset,offset+c);
						var thisScore = piece.length/minLength;
						if (str2.includes(piece) && thisScore > score) {
							score = thisScore;
							found = {"section" : section, "ctlid":this.hudSections[section][i],"score": score, 
									"piece": piece, "minlength" : minLength};
							console.log("        **** str1:",str1,"str2:",str2,"found",found);
							break;
						}
					}
				}
			}
			if (found) console.log("------> found matchHUDItem",found,hudItem,section);
			else console.log("matchHUDItem none found, hudItem:",hudItem,section,"score",score,this.hudSections[section]);
			return found;
		},
		getHUDSectionItems : function(items,startLine,endLine){
			return _.filter(items, function(i){
				var lno = parseInt(i.lineno);
				if (lno>=startLine && lno <= endLine) return true;
				return false;
			}); 
		},
		hudSections : {"section1" :["cityPropertyTax_currency","countyPropertyTax_currency","annualAssessments_currency",
		                           "floodInsurance_currency","hoa_currency","optionFeeCredit_currency","credit1_currency",
		                           "credit2_currency","credit3_currency"],
		               "section2" :["cityPropertyTaxCredit_currency","countyPropertyTaxCredit_currency",
		                           "annualAssessmentsCredit_currency","floodInsuranceCredit_currency","hoaCredit_currency",
		                           "securityDepositCredit_currency","proRatedRentCredit_currency"],
		               "section8" :["originationCharges_currency","appraisalFee_currency","creditReport_currency",
		                           "floodCertificationFee_currency"],
		               "section9" :["dailyInterestCharges_currency","homeownersInsuranceYearly_currency"],
		               "section10":["homeownersInsuranceReserves_currency","propertyTaxReserves_currency","aggregateAdjustment_currency"],
		               "section11":["titleServicesInsurance_currency","ownersTitleInsurance_currency"],
		               "section12":["recordingFee_currency"],
		               "section13":["otherCosts_currency"]
		},
		sectDefs : [{"sec":1,"rng":[106,119]},{"sec":2,"rng":[210,219]},{"sec":8,"rng":[801,808]},
		                {"sec":9,"rng":[900,903]},{"sec":10,"rng":[1000,1011]},{"sec":11,"rng":[1100,1118]},
		                {"sec":12,"rng":[1201,1201]},{"sec":13,"rng":[1300,1307] }],
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
				console.log("Error in retrieving states "+response);
			});
		},
		fetchClosingStepsData : function(investmentId) {
			var self= this;
			this.collection.getClosingSteps(investmentId,
					{	success : function ( model, res ) {
						self.collection.reset();
						_(res).each(function(obj) {
							self.collection.push(new closingStepsModel(obj));
						});
					},
					error   : function ( model, res ) {
						$('#closingStepsErrorMessage').html('Error in fetching closing tasks');
					}
					});
		},
		addNewRentalTab:function(oldTabId,propertyUnit,leaseData,object,objectId,taskKey,subObject){
			var self = this;
			self.removeRentalAgreementActiveTab();
			var tabId = null;
			if(!jQuery.isEmptyObject(oldTabId)){
				tabId = oldTabId;
				$("#rentalAgreementTab #" + tabId).html("");
				$("#rentalAgreementTab #" + tabId).html(_.template(rentalAgreementTab)({propertyUnit:propertyUnit,leaseData:leaseData,taskKey:taskKey,
					object:object,investmentId:objectId,subObject:subObject,assetId:self.parentView.model.attributes.investmentResponse.assetId}));
				
				$("#rentalAgreementUL a[href='#"+oldTabId+"']").closest('.rentalAgreementNav').addClass('active');
				$("#"+oldTabId).addClass('active');
			}else{
				self.RentaltabCount++;
				tabId = "rental_tab_" + self.RentaltabCount;
			
				var tabName = "";
				if(propertyUnit){
					tabName = propertyUnit.unitName + "(Unit)"
				} else {
					tabName = "Property";
				}
				if(!leaseData.leaseId){
					tabName = tabName + "*";
				}
	
				var newElement = '<li class="rentalAgreementNav active"> <a data-toggle="tab" href="#'+ tabId +'">' + tabName + '</a></li>';
				$("#rentalAgreementUL").append(newElement);
	
				$("#rentalAgreementTab").append(_.template(rentalAgreementTab)({propertyUnit:propertyUnit,leaseData:leaseData,taskKey:taskKey,
						object:object,investmentId:objectId,subObject:subObject,assetId:self.parentView.model.attributes.investmentResponse.assetId}));
			}
			
			$(".rent_agreement_tab_general").attr("id",tabId).removeClass("rent_agreement_tab_general");

			var startDatePicker = $("#rentalAgreementTab #"+tabId).find('[name=leaseStartDate]');
			if(startDatePicker.length>0) {
				$(startDatePicker[0]).parent().datepicker().on('changeDate', function (evt) {
					var selectedDate = new Date(evt.date.valueOf());
					var endDatePicker = $("#rentalAgreementTab #"+tabId).find('[name=leaseEndDate]');
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

			self.calculateRentalDailyPerDiem({},$("#rentalAgreementTab #"+tabId).find('form'));
		},
		addNewLeaseReviewTab:function(propertyUnit,leaseData,object,objectId,taskKey,subObject){
			var self = this;
			self.removeRentalAgreementActiveTab();
			self.RentaltabCount++;
			var tabId = "rental_tab_" + self.RentaltabCount;
			var tabName = "";
			if(propertyUnit){
				tabName = propertyUnit.unitName + "(Unit)"
			} else {
				tabName = "Property";
			}
			if(!leaseData.leaseId){
				tabName = tabName + "*";
			}

			var newElement = '<li class="rentalAgreementNav active"> <a data-toggle="tab" href="#'+ tabId +'">' + tabName + '</a></li>';
			$("#rentalAgreementReviewUL").append(newElement);
			$("#rentalAgreementReviewTab").append(_.template(reviewLeaseTab)({propertyUnit:propertyUnit,lease:leaseData,taskKey:taskKey,
					object:object,investmentId:objectId,subObject:subObject,assetId:self.parentView.model.attributes.investmentResponse.assetId}));
			$(".rent_agreement_tab_general").attr("id",tabId).removeClass("rent_agreement_tab_general");
		},
		removeRentalAgreementActiveTab:function(){
			$(".rentalAgreementNav.active").removeClass("active");
			$('.rentalAgreementNavTab.active').removeClass("active");
		},
		showTaskModal: function (evt) {
			var self=this;

			var object = $(evt.currentTarget).data('object');
			var objectId = $(evt.currentTarget).data('objectid');
			var taskKey = $(evt.currentTarget).data('taskkey');
			var popupKey = $(evt.currentTarget).data('popupkey');
			var popupVersion = $(evt.currentTarget).data('popupversion');
			var documentLabel = $(evt.currentTarget).data('documentlabel');
			var taskName = $(evt.currentTarget).data('taskname');
			var startDate = $(evt.currentTarget).data('startdate');
			var completedDate = $(evt.currentTarget).data('completeddate');
			var projectedStartDate = $(evt.currentTarget).data('projectedstartdate');
			var taskStatus=$(evt.currentTarget).data('status');

//			var self=this;
			this.currentObject=object;
			this.currentObjectId=objectId;
			this.currentTaskKey=taskKey;
			this.currentTaskStatus=taskStatus;
			
			var popupId = popupKey+'_'+popupVersion;

			if(popupId.indexOf("INSURANCE_QUOTE_REQUEST_POPUP")>-1 || popupId.indexOf("INSURANCE_APPLICATION_POPUP")>-1 || popupId.indexOf("INSURANCE_PROVIDED_POPUP")>-1) {
				this.insuranceVendorHomeView.openInsurancePopUp(evt);
				return;
			}

			this.taskKeyName=popupKey;
			if(popupId.indexOf("REHAB_ESTIMATE_POPUP")>-1){
				var estimateModal = _.template( rehabEstimateModal );
				$('#provideRehabEstimateRenderDiv').html("");
				$('#provideRehabEstimateRenderDiv').html(estimateModal);
				app.currencyFormatter();
				this.addFormValidations();
				$("#rehabItems").val('[]');
			}else if(popupId.indexOf("SELECT_TENANT_POPUP")>-1){
				if(!self.states){
					self.fetchStates(); 
				}
				var clickedModal = _.template(selectTenantModal );
				$('#selectTenantPopUpDiv').html("");
				$('#selectTenantPopUpDiv').html(clickedModal({states:self.states}));
				self.addFormValidations();
				ComponentsPickers.init();
			}else if(popupId.indexOf("APPRAISAL_POPUP")>-1){
				var clickedpropertyAppraisalModal = _.template(propertyAppraisalModal );
				$('#propertyAppraisalDiv').html("");
				$('#propertyAppraisalDiv').html(clickedpropertyAppraisalModal({purchasePrice:self.parentView.model.attributes.investmentResponse.purchasePrice}));
				app.currencyFormatter();
				// self.appraisalFormValidation({documentRequired:true});
				ComponentsPickers.init();
			}else if(popupId.indexOf("INSPECTION_POPUP")>-1){
				var inspectionModal = _.template( propertyInspectionModal );
				$('#propertyInspectionRenderDiv').html("");
				$('#propertyInspectionRenderDiv').html(inspectionModal);
				app.currencyFormatter();
				// self.addFormValidations({documentRequired:true});
				ComponentsPickers.init();
			}

			if(this.currentTaskKey == 'PROPERTY_INSPECTION_ILM' || this.currentTaskKey == 'HU_REHAB_QUOTE' 
				|| this.currentTaskKey == 'INSPECTION_REVIEW_INTERNAL' || this.currentTaskKey == 'CONTRACTOR_QUOTE'){
				if(!this.propertyInspectionIlmView){
					this.propertyInspectionIlmView = new propertyInspectionIlm();
				}
				this.propertyInspectionIlmView
					.setElement($('#PROPERTY_INSPECTION_ILM_RENDER_DIV'))
					.render({parentView:self,parentModel:self.model, parentObject:self.currentObject,parentObjectId:self.currentObjectId,
						taskKey:self.currentTaskKey,taskName:taskName});
				self.addFormValidations();
			} 
			else if(this.currentTaskKey == 'PROPERTY_INSPECTION_INVESTOR'){
				if(!this.propertyInspectionInvestorView){
					this.propertyInspectionInvestorView = new propertyInspectionInvestor();
				}
				this.propertyInspectionInvestorView
					.setElement($('#PROPERTY_INSPECTION_INVESTOR_RENDER_DIV'))
					.render({parentModel:self.model, parentObject:self.currentObject,parentObjectId:self.currentObjectId});
				self.addFormValidations();
			}
			else if(this.currentTaskKey == 'REPAIRS_REQUEST'){
				if(!this.requestForRepairsView){
					this.requestForRepairsView = new requestForRepairsView();
				}
				this.requestForRepairsView
					.setElement($('#REQUEST_FOR_REPAIRS_RENDER_DIV'))
					.render({parentModel:self.model,parentObject:self.currentObject,parentObjectId:self.currentObjectId});
				self.addFormValidations();
			}
			else if(this.currentTaskKey == 'SELLER_RESPONSE_REPAIRS'){
				if(!this.sellerResponseForRepairsView){
					this.sellerResponseForRepairsView = new sellerResponseForRepairsView();
				}
				this.sellerResponseForRepairsView
					.setElement($('#SELLER_RESPONSE_REPAIRS_RENDER_DIV'))
					.render({parentModel:self.model,parentObject:self.currentObject,parentObjectId:self.currentObjectId,
						taskKey:self.currentTaskKey});
				self.addFormValidations();
			}
			else if(this.currentTaskKey == 'UPLOAD_MUTUAL_RELEASE'){
				var uploadMutualReleaseTemplate = _.template(uploadMutualRelease);
				$("#UPLOAD_MUTUAL_RELEASE_DIV").html("");
				$("#UPLOAD_MUTUAL_RELEASE_DIV").html(uploadMutualReleaseTemplate);
				$('#uploadMutualReleaseRequiredMsg').hide();
				self.addFormValidations();
			}
			else if(this.currentTaskKey == 'PENDING_INVESTOR_SIGNATURE'){
				var pendingInvestorSignTemplate = _.template(pendingInvestorSign);
				$("#PENDING_INVESTOR_SIGNATURE_DIV").html("");
				$("#PENDING_INVESTOR_SIGNATURE_DIV").html(pendingInvestorSignTemplate);
				self.addFormValidations();
			}
			else if(this.currentTaskKey == 'SEND_MUTUAL_RELEASE'){
				var sendMutualReleaseTemplate = _.template(sendMutualRelease);
				$("#SEND_MUTUAL_RELEASE_DIV").html("");
				$("#SEND_MUTUAL_RELEASE_DIV").html(sendMutualReleaseTemplate);
				self.addFormValidations();
			}
			else if(this.currentTaskKey == 'UPLOAD_EXECUTED_MUTUAL_RELEASE'){
				var uploadExecutedMutualReleaseTemplate = _.template(uploadExecutedMutualRelease);
				$("#UPLOAD_EXECUTED_MUTUAL_RELEASE_DIV").html("");
				$("#UPLOAD_EXECUTED_MUTUAL_RELEASE_DIV").html(uploadExecutedMutualReleaseTemplate);
				$('#executedMutualReleaseRequiredMsg').hide();
				self.addFormValidations();
			}else if(this.currentTaskKey == 'EXECUTED_MUTUAL_RELEASE'){
				var executedMutualReleaseTemplate = _.template(executedMutualReleasePage);
				$("#EXECUTED_MUTUAL_RELEASE_DIV").html("");
				$("#EXECUTED_MUTUAL_RELEASE_DIV").html(executedMutualReleaseTemplate);
				self.addFormValidations();
			}
			else if(this.currentTaskKey == 'INVESTOR_RESPONSE_REPAIRS'){
				if(!this.investorResponseForRepairsView){
					this.investorResponseForRepairsView = new investorResponseForRepairsView();
				}
				this.investorResponseForRepairsView
					.setElement($('#INVESTOR_RESPONSE_REPAIRS_RENDER_DIV'))
					.render({parentModel:self.model,parentObject:self.currentObject,parentObjectId:self.currentObjectId,
						taskKey:self.currentTaskKey});
				self.addFormValidations();
			} 
			else if(this.currentTaskKey == 'FINAL_WALK_THROUGH'){
				if(!this.finalWalkThroughView){
					this.finalWalkThroughView = new finalWalkThrough();
				}
				this.finalWalkThroughView.setElement($('#FINAL_WALK_THROUGH_RENDER_DIV')).render({parentModel:self.model,
					parentObject:self.currentObject,parentObjectId:self.currentObjectId});
				self.addFormValidations();
			}
			
			else if(this.currentTaskKey == 'CLOSING_APPOINTMENT'){
				if(!this.closingAppointmentView){
					this.closingAppointmentView = new closingAppointment();
				}
				this.closingAppointmentView.setElement($('#CLOSING_APPOINTMENT_RENDER_DIV')).render({parentModel:self.model,
					parentObject:self.currentObject,parentObjectId:self.currentObjectId});
				self.addFormValidations();
			}
			else if(this.currentTaskKey == 'OPTION_FEE'){
				
				var optionFeeTemplate = _.template( optionFee );
				$("#renderOptionFee").html("");
				$("#renderOptionFee").html(optionFeeTemplate);
				self.addFormValidations();
				app.currencyFormatter();
			}
			else if(this.currentTaskKey == 'HU_IMPOUND'){
				var huImpoundTemplate = _.template( huImpound );
				$("#renderHUImpound").html("");
				$("#renderHUImpound").html(huImpoundTemplate);
				self.addFormValidations();
			}
			else if(this.currentTaskKey == 'UPLOAD_RENTAL_AGREEMENT'){
				$('#'+popupId).find("#rentalAgreementUL").html("");
				$('#'+popupId).find("#rentalAgreementTab").html("");
			}

		 	else if(this.currentTaskKey == 'HU_UPDATED_REHAB_QUOTE'){
				if(!this.huUpdatedRehabQuoteView){
					this.huUpdatedRehabQuoteView = new huUpdatedRehabQuoteView();
				}
				this.huUpdatedRehabQuoteView.setElement($('#HU_UPDATED_QUOTE_RENDER_DIV')).render({parentModel:self.model,
					parentObject:self.currentObject,parentObjectId:self.currentObjectId,taskKey:self.currentTaskKey});
				
				self.addFormValidations();
				
		 	}
			else if(this.currentTaskKey == 'DEED_RECORDED'){
				self.addFormValidations();
			}
			else if(this.currentTaskKey == 'POS_INSPECTION'){
				var template = _.template( posInspection );
				$("#renderPOSInspection").html(template);
				self.addFormValidations();
			}
			else if(this.currentTaskKey == 'POS_REPORT'){
				var template = _.template( posReport );
				$("#renderPOSReport").html(template);
				app.currencyFormatter();
				self.addFormValidations();
			}
			else if(this.currentTaskKey == 'POS_REPAIR_COMPLETION'){
				var template = _.template( posRepairCompletion );
				$("#renderPOSRepairCompletion").html(template);
				ComponentsPickers.init();
				self.addFormValidations();
			}

			this.currentPopup = $('#'+popupId);
			this.currentForm = $('#'+popupId+' form');
			if(this.currentTaskKey=="UPLOAD_REPAIR_PICS"){
				this.currentForm.find('input[id=document]').attr('multiple','');
				this.currentForm.find('input[id=document]').attr('name','repairPictures');
			} else if(this.currentTaskKey=="INSURANCE_QUOTE_REQUEST"){
				this.currentForm.find('input[id=document]').attr('multiple','');
				this.currentForm.find('input[id=document]').attr('name','insuranceQuoteDocuments');
			} else {
				this.currentForm.find('input[id=document]').removeAttr('multiple');
				this.currentForm.find('input[id=document]').attr('name','document');
			}

			if(this.currentTaskKey=="SCHEDULE_PREINSPECTION"){
				this.currentForm.find('div[id=staticDocumentArea]').css('display','inline-block');
				this.currentForm.find('a[id=staticDocument]').attr('href','assets/pdf/Pre-Inspection Sheet 12-26 v2.pdf');
			} else {
				this.currentForm.find('div[id=staticDocumentArea]').css('display','none');
			}

			if(this.currentTaskKey=='UTILITY_INFORMATION'){
				if(!this.utilityView){
					this.utilityView= new utilityView();
				}
				this.utilityView.setElement('#renderUtilityInformation').render({object:self.currentObject,objectId:self.currentObjectId,taskKey:self.taskKey});
			}
			
			if(this.currentTaskKey=='UTILITY_TRANSFER'){
				if(!this.utilityTransferView){
					this.utilityTransferView= new utilityTransferView();
				}
				this.utilityTransferView.setElement('#renderUtilityTransfer').renderUtilityTransfer({object:self.currentObject,objectId:self.currentObjectId,taskKey:self.taskKey});
			}
			
			if(this.currentTaskKey == 'POS_CERTIFICATION' || this.currentTaskKey == 'FOLLOW_UP_FUNDS_ESCROW'){
				this.currentForm.find('[id=displayToInvestorMessage]').hide();
			}
			else if(this.currentForm.find('[id=displayToInvestorMessage]')){
				this.currentForm.find('[id=displayToInvestorMessage]').show();
			}

			$('#'+popupId+' #modalTitle').html(taskName);
			$('#'+popupId+' #documentLabel').html(documentLabel);
			_($('.date-picker:not(.unrestricted)')).each(function(datePicker) {
//				$(datePicker).datepicker('setEndDate','+0d').datepicker('update');
				$(datePicker).datepicker('setEndDate',new Date()).datepicker('update');
			});

			var document = this.currentForm.find('input[name=document]');
			if(document) {
				document.removeAttr("disabled");
			}
			
			if(this.milestoneTasksWithMandatoryDocument.indexOf(this.currentTaskKey)!=-1) {
				$('#milestoneDocRequired').show();
				$('#milestoneDocRequiredMsg').hide();
			} else {
				$('#milestoneDocRequired').hide();
				$('#milestoneDocRequiredMsg').hide();
			}
			
			if(this.currentTaskKey == "FEE_SHEET"){
				$('#feeSheetRequiredMsg').hide();
			}
			
			if(this.currentTaskKey=='WIRE_INSTRUCTION' || this.currentTaskKey=='MLS_SHEET' || this.currentTaskKey=='HOA_DOCS'){
				$("#displayToInvestorMessage").hide();
			}
			
			if(this.currentTaskKey=='WIRE_INSTRUCTION'){
				$("#mailWireInstruction").show();
			}else{
				$("#mailWireInstruction").hide();
			}

			var startDatePicker = this.currentForm.find('[name=startDate]');
			if(startDatePicker.length>0) {
				$(startDatePicker[0]).parent().datepicker().on('changeDate', function (evt) {
					var selectedDate = new Date(evt.date.valueOf());
					var endDatePicker = self.currentForm.find('[name=endDate]');
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

			if(taskKey=='FINAL_HUD') {
				if(!this.mortgageTypesView) {
					this.mortgageTypesView = new codesView({codeGroup:'MORTG_TYPE'});
				}
				this.mortgageTypesView.render({el:$('#mortgageTypes'),codeParamName:"mortgageType"});
				if(!this.impoundsView) {
					this.impoundsView = new codesView({codeGroup:'IMPOUND_TYPE'});
				}
				this.impoundsView.render({el:$('#impoundTypes'),codeParamName:"impounds"});
			}

			/*if(taskKey=='UPLOAD_RENTAL_AGREEMENT') {
				var startDatePicker = this.currentForm.find('[name=leaseStartDate]');
				if(startDatePicker.length>0) {
					$(startDatePicker[0]).parent().datepicker().on('changeDate', function (evt) {
						var selectedDate = new Date(evt.date.valueOf());
						var endDatePicker = self.currentForm.find('[name=leaseEndDate]');
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
			}*/
			if(taskKey.indexOf('adhocTask')>-1){
				var startDatePicker = this.currentForm.find('[name=startDate]');
				var endDatePicker =  this.currentForm.find('[name=endDate]');
				endDatePicker.parent().datepicker('setEndDate','+0d').datepicker('update');
				startDatePicker.parent().datepicker('setEndDate','+0d').datepicker('update');
					
				if(startDatePicker.length>0) {
					$(startDatePicker[0]).parent().datepicker().on('changeDate', function (evt) {
						var selectedDate = new Date(evt.date.valueOf());
						
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
							if($(startDatePicker[0]).parent().datepicker('getDate')){
								endDatePickerWidget.datepicker('setStartDate', $(startDatePicker[0]).parent().datepicker('getDate'));
							}
						}
					});
				}
			}
			
			if(taskKey=='TITLE_RECEIVED') {
				$(".titleClean").show();
			}
			else{
				$(".titleClean").hide();
			}
			
			var popupForm = $('#'+popupId+' form');
			if(popupForm && popupForm[0]){
				popupForm[0].reset();
			}

			_($('div[id^=existingDocument]')).each(function(document){
				$(document).html('');
			});
			$('#existingFinalHudDocument').html('');
			$('#existingTitleDocument').html('');
			$('#existingMortgageNote').html('');
			$('#existingTaxCertificate').html('');
			
			var taskKeysForPreload = ["NOTIFY_INVESTOR_TKP","FINAL_HUD","TERMS_AND_RATE_LOCKED","REHAB_ESTIMATE",
				"INSURANCE_QUOTES_REVIEW","INSURANCE_VENDOR_SELECTION","INSURANCE_APPLICATION_SIGNATURE",
				"PRELIMINARY_HUD","UPLOAD_RENTAL_AGREEMENT","PROPERTY_INSPECTION_ILM","PROPERTY_INSPECTION_INVESTOR",
				"REPAIRS_REQUEST","SELLER_RESPONSE_REPAIRS","UPLOAD_MUTUAL_RELEASE","PENDING_INVESTOR_SIGNATURE","SEND_MUTUAL_RELEASE","HU_UPDATED_REHAB_QUOTE","INVESTOR_RESPONSE_REPAIRS","FINAL_WALK_THROUGH",
				"CLOSING_APPOINTMENT","LEASE_REVIEW","HOME_WARRANTY","PROPERTY_INSPECTION","MORTGAGEE_CLAUSE",
				"PROPERTY_APPRAISAL","FEE_SHEET","HU_IMPOUND","SELLER_DISCLOSURE","INSPECTION_APPOINTMENT","DEED_RECORDED",
				"HU_REHAB_QUOTE","INSPECTION_REVIEW_INTERNAL","CONTRACTOR_QUOTE","TAX_CERTIFICATE","CONTRACTOR_SCHEDULING",
				"EXECUTED_MUTUAL_RELEASE"];//seller disclosure is added to check year_built for FLD Disclosure display
			if(completedDate!='' || startDate!='' || taskKeysForPreload.indexOf(taskKey)!=-1) {
				this.model.loadTaskData(taskKey,object,objectId,{
					success : function ( model, res ) {
						console.log(res);

						if(popupId.indexOf("APPRAISAL_POPUP")>-1){
							if(res.paidOutOfClosing=="Y"){
								$("#paidOutOfClosing").prop("checked",true);
							}
							else{
								$("#paidOutOfClosing").prop("checked",false);
							}
						}
						//
						var insuranceSelected = res['insuranceSelected'];
						for(attr in res) {
							var formElement = self.currentForm.find('[name='+attr+']');
							if(attr.indexOf('appointmentDate')!=-1 && formElement){
								formElement.parent().data({date: res[attr]}).datetimepicker('update');
							}else if(attr.indexOf('Date')!=-1 && formElement) {
								formElement.parent().data({date: res[attr]}).datepicker('update');
							}
							if(formElement && self.excludedAttrs.indexOf(attr)==-1) {
								formElement.val(res[attr]);
							}
							if(self.excludedAttrs.indexOf(attr)!=-1){
								/*console.log($("input[id=optionsRadios"+res[attr]+"][name="+attr+"]"));
		   		    			 $("input[id=optionsRadios"+res[attr]+"][name="+attr+"]").val(res[attr]);
		   		    			console.log($("input[id=optionsRadios"+res[attr]+"][name="+attr+"]").attr('checked'));
		   		    			 $("input[id=optionsRadios"+res[attr]+"][name="+attr+"]").attr('checked','checked');*/
								$('input[name='+attr+']:checked').removeAttr('checked').parent().removeClass('checked');
								$('input[id=optionsRadios'+res[attr]+'][name='+attr+']').attr('checked','checked').parent().addClass('checked');
								$('input[id=optionsRadios'+res[attr]+'][name='+attr+']').parent().click();
							}
						}

						self.currentForm.find('[id=appraisalValue_currency]').val(self.currentForm.find('[id=appraisalValue]').val());
						self.currentForm.find('[id=purchasePrice_currency]').val(self.currentForm.find('[id=purchasePrice]').val());
						self.currentForm.find('[id=purchasePriceHUD_currency]').val(self.currentForm.find('[id=purchasePriceHUD]').val());

						self.currentForm.find('[id=downPayment]').val(self.currentForm.find('[id=purchasePriceHUD]').val()-self.currentForm.find('[id=loanAmount]').val());
						self.currentForm.find('[id=downPayment_currency]').val(self.currentForm.find('[id=purchasePriceHUD]').val()-self.currentForm.find('[id=loanAmount]').val());
						
						var impounds=$("#impoundTypes select[name='impounds'] option:selected").text().trim();
						if(impounds=="No"){
							$('#impoundAmountDiv').hide();
						}else{
							$('#impoundAmountDiv').show();
						}
						
//						$('#purchasePrice_currency').val($('#purchasePrice').val());
						$('#rehabCost_currency').val($('#rehabCost').val());
						$('#closingCost_currency').val($('#closingCost').val());
						self.currentForm.find('[id=inspectionFee_currency]').val(self.currentForm.find('[id=inspectionFee]').val());
						self.currentForm.find('[id=escrowDepositAmount_currency]').val(self.currentForm.find('[id=escrowDepositAmount]').val());
						self.currentForm.find('[id=appraisalFee_currency]').val(self.currentForm.find('[id=appraisalFee]').val());
						//$('#appraisalFee_currency').val($('#appraisalFee').val());
						$('#titleFee_currency').val($('#titleFee').val());
						//$('#recordingFee_currency').val($('#recordingFee').val());
						//$('#originationFee_currency').val($('#originationFee').val());
						$('#otherCosts_currency').val($('#otherCosts').val());
						$('#credits_currency').val($('#credits').val());
						$('#downPayment_currency').val($('#downPayment').val());
						$('#totalInvestment_currency').val($('#totalInvestment').val());
						$('#hoa_currency').val($('#hoa').val());
						$('#propertyInsurance_currency').val($('#propertyInsurance').val());
						$('#propertyTax_currency').val($('#propertyTax').val());
						$('#loanAmount_currency').val($('#loanAmount').val());
						$('#impoundAmount_currency').val($('#impoundAmount').val());
						$('#monthlyPayment_currency').val($('#monthlyPayment').val());
						$('#propertyTaxReserve_currency').val($('#propertyTaxReserve').val());
						$('#propertyInsuranceReserve_currency').val($('#propertyInsuranceReserve').val());
						$('#rentAmount_currency').val($('#rentAmount').val());
						self.currentForm.find('[id=utilitiesActivationFee_currency]').val(self.currentForm.find('[id=utilitiesActivationFee]').val());

						$('#closingCostFinanced_currency').val($('#closingCostFinanced').val());
						$('#cityPropertyTax_currency').val($('#cityPropertyTax').val());
						$('#countyPropertyTax_currency').val($('#countyPropertyTax').val());
						$('#annualAssessments_currency').val($('#annualAssessments').val());
						$('#floodInsurance_currency').val($('#floodInsurance').val());
						$('#optionFeeCredit_currency').val($('#optionFeeCredit').val());
						$('#credit1_currency').val($('#credit1').val());
						$('#credit2_currency').val($('#credit2').val());
						$('#credit3_currency').val($('#credit3').val());
						$('#cityPropertyTaxCredit_currency').val($('#cityPropertyTaxCredit').val());
						$('#countyPropertyTaxCredit_currency').val($('#countyPropertyTaxCredit').val());
						$('#annualAssessmentsCredit_currency').val($('#annualAssessmentsCredit').val());
						$('#floodInsuranceCredit_currency').val($('#floodInsuranceCredit').val());
						$('#hoaCredit_currency').val($('#hoaCredit').val());
						$('#securityDepositCredit_currency').val($('#securityDepositCredit').val());
						$('#proRatedRentCredit_currency').val($('#proRatedRentCredit').val());
						self.currentForm.find('[id=optionFee_currency]').val(self.currentForm.find('[id=optionFee]').val());
						$('#appraisalFee1_currency').val($('#appraisalFee1').val());
						$('#homeUnionCommission_currency').val($('#homeUnionCommission').val());
						$('#originationCharges_currency').val($('#originationCharges').val());
						$('#creditReport_currency').val($('#creditReport').val());
						$('#floodCertificationFee_currency').val($('#floodCertificationFee').val());
						$('#dailyInterestCharges_currency').val($('#dailyInterestCharges').val());
						$('#homeownersInsuranceYearly_currency').val($('#homeownersInsuranceYearly').val());
						$('#homeownersInsuranceReserves_currency').val($('#homeownersInsuranceReserves').val());
						$('#propertyTaxReserves_currency').val($('#propertyTaxReserves').val());
						$('#aggregateAdjustment_currency').val($('#aggregateAdjustment').val());
						$('#titleServicesInsurance_currency').val($('#titleServicesInsurance').val());
						$('#ownersTitleInsurance_currency').val($('#ownersTitleInsurance').val());
						$('#recordingFee_currency').val($('#recordingFee').val());
						$('#mobileClosingFee_currency').val($('#mobileClosingFee').val());
						$('#securityDeposits_currency').val($('#securityDeposits').val());
						$('#yearlyTaxAmount_currency').val($('#yearlyTaxAmount').val());

						if(res.items!=null){
							$(".staticRehabRow").remove();
							for(item in res.items){
								self.addNewRehabEstimateRenderedRow(res.items[item]);
							}
							self.calculateAmount();
						}

						if(res['documentId']) {
							_($('div[id^=existingDocument]')).each(function(document){
								$(document).html('Existing Document : <a href="document/download/'+res['documentId']+'" target="_blank" style="word-wrap:break-word;">'+res['documentName']+'</a>');
							});
						}
						if(res['repairPictureDocs'] && !$.isEmptyObject(res['repairPictureDocs'])) {
							var repairPictures = res['repairPictureDocs'];
							var docHtml = "Existing Pictures : <br>";
							for(pictureId in repairPictures) {
								docHtml += '<a href="document/download/'+pictureId+'" target="_blank" style="word-wrap:break-word;">'+repairPictures[pictureId]+'</a><br>';
							}
							_($('div[id^=existingDocument]')).each(function(document){
								$(document).html(docHtml);
							});
						}
						if(res['insuranceQuoteDocs'] && !$.isEmptyObject(res['insuranceQuoteDocs'])) {
							var insuranceQuoteDocuments = res['insuranceQuoteDocs'];
							var docHtml = "Existing Documents : <br>";
							for(docId in insuranceQuoteDocuments) {
								docHtml += '<a href="document/download/'+docId+'" target="_blank" style="word-wrap:break-word;">'+insuranceQuoteDocuments[docId]+'</a><br>';
							}
							_($('div[id^=existingDocument]')).each(function(document){
								$(document).html(docHtml);
							});
						}

						if(res['finalHudDocumentId']) {
							$('#existingFinalHudDocument').html('Existing Final HUD Document : <a href="document/download/'+res['finalHudDocumentId']+'" target="_blank" style="word-wrap:break-word;">'+res['finalHudDocumentName']+'</a>');
							$(".hidesdiv3").show();
						}
						if(res['titleDocumentId']) {
							$('#existingTitleDocument').html('Existing Title Document : <a href="document/download/'+res['titleDocumentId']+'" target="_blank" style="word-wrap:break-word;">'+res['titleDocumentName']+'</a>');
						}
						if(res['mortgageNoteId']) {
							$('#existingMortgageNote').html('Existing Mortgage Note : <a href="document/download/'+res['mortgageNoteId']+'" target="_blank" style="word-wrap:break-word;">'+res['mortgageNoteName']+'</a>');
						}
						if(res['taxCertificateDocumentId']) {
							$('#existingTaxCertificate').html('Existing Tax Document : <a href="document/download/'+res['taxCertificateDocumentId']+'" target="_blank" style="word-wrap:break-word;">'+res['taxCertificateDocumentName']+'</a>');
						}
						if(taskKey=="INSURANCE_QUOTES_REVIEW"){

							self.fetchInsuranceQuoteHeaderData();
							if(self.insuranceHeaderData){
								self.insuranceReviewHeaderModal = _.template( insuranceReviewHeader );
								$('#INSURANCE_QUOTES_REVIEW_POPUP_1').find('#renderQuoteReviewHeader').html("");
								$('#INSURANCE_QUOTES_REVIEW_POPUP_1').find('#renderQuoteReviewHeader').html(self.insuranceReviewHeaderModal({headerInfo:self.insuranceHeaderData}));
							}


							var insuranceReviewModal = _.template(insuranceReview );
							$('#renderInsuranceReviewData').html("");
							$('#renderInsuranceReviewData').html(insuranceReviewModal({quotes:res.propertyInsuranceResponse,objectId:self.currentObjectId,object:self.currentObject}));
						} else if(taskKey=="INSURANCE_VENDOR_SELECTION"){
							self.fetchInsuranceQuoteHeaderData();
							if(self.insuranceHeaderData){
								self.insuranceVendorSelectionModal = _.template( insuranceReviewHeader );
								$('#INSURANCE_VENDOR_SELECTION_POPUP_1').find('#renderVendorSelectionHeader').html("");
								$('#INSURANCE_VENDOR_SELECTION_POPUP_1').find('#renderVendorSelectionHeader').html(self.insuranceVendorSelectionModal({headerInfo:self.insuranceHeaderData}));
							}
							var insuranceVendorSelectionModal = _.template(insuranceVendorSelection );
							$('#renderVendorSelectionData').html("");
							$('#renderVendorSelectionData').html(insuranceVendorSelectionModal({quotes:res.propertyInsuranceResponse}));
							
							if(insuranceSelected){
								$('input[name=insuranceSelected]:checked').removeAttr('checked').parent().removeClass('checked');
								$('input[id=optionsRadios'+insuranceSelected+'][name=insuranceSelected]').attr('checked','checked').parent().addClass('checked');
								$('input[id=optionsRadios'+insuranceSelected+'][name=insuranceSelected]').parent().click();
							}
						} else if(taskKey=="INSURANCE_APPLICATION_SIGNATURE"){
				    		 //self.currentSubTask = "Insurance Application";
				    		 var insuranceAppSignatureTemplate = _.template( insuranceAppSignatureModal );
					     	 $('#renderInsuranceApplicationData').html("");
					     	 $('#renderInsuranceApplicationData').html(insuranceAppSignatureTemplate({popupData:res}));
					     	 
					     	 var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
					     	 self.currentForm.find('.docusignEnvelopeArea').html("");
					     	 res.documentTaskKey = 'INSURANCE_APPLICATION';
					     	 res.envelopeTaskKey = 'INSURANCE_APPLICATION_SIGNATURE';
					     	 res.documentTypes = 'Insurance Application';
					     	 self.embraceEnvelopeId = res.embraceEnvelopeId;
					     			
					     	 self.currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));
					     	 
					     	 $(".amount").formatCurrency();
					     	 ComponentsPickers.init();
				    	 } else if(taskKey=='UPLOAD_RENTAL_AGREEMENT'){
				    	 	self.uploadRentalAgreementAdded = false;
				    	 	self.RentaltabCount = 0;
				    	 	$("#rentalAgreementUL").html("");
				    	 	$("#rentalAgreementTab").html("");
				    	 	var leasesAlreadyAdded = [];
				    	 	var leaseData;
				    	 	var atleastOneLeaseAdded = false;
				    	 	if(self.parentView.model.attributes.propertyUnits && self.parentView.model.attributes.propertyUnits.length){
					    	 	_.each(self.parentView.model.attributes.propertyUnits,function(propertyUnit){
					    	 		leaseData = _.find(res.leasesData, function(leaseData) { return leaseData.unitId == propertyUnit.unitId }) || {};
					    	 		if(leaseData.leaseId){
				    	 				leasesAlreadyAdded.push(leaseData.leaseId);
				    	 				self.uploadRentalAgreementAdded = true
				    	 			}
					    	 		self.addNewRentalTab(null,propertyUnit,leaseData,object,objectId,taskKey,res.subObject);
					    	 		atleastOneLeaseAdded = true;
					    	 	});
					    	 	
					    	 	self.propertyType="Multiple";
				    	 	} else {
				    	 		var leaseAdded;
				    	 		if(res.leasesData && res.leasesData.length){
					    	 		self.uploadRentalAgreementAdded = true;
					    	 		_.each(res.leasesData,function(leaseData){
						    	 		leaseAdded = _.find(leasesAlreadyAdded, function(leaseIdAdded) { return leaseData.leaseId == leaseIdAdded });
						    	 		if(!leaseAdded){
						    	 			self.addNewRentalTab(null,"",leaseData,object,objectId,taskKey,res.subObject);
						    	 			atleastOneLeaseAdded = true;
						    	 		}
						    	 	});
					    	 	}
					    	 	
					    	 	self.propertyType="Single";
				    	 	}
				    	 	if(!atleastOneLeaseAdded){
				    	 		self.addNewRentalTab(null,"",{},object,objectId,taskKey,res.subObject);
				    	 	}
				    	 	$("#rentalAgreementUL a[href=#rental_tab_1]").click();
				    	 	app.currencyFormatter();
				    	 	ComponentsPickers.init();
				    	 	self.rentalAgreementTabForm = $('.rentalAgreementTabForm').watchChanges();
				    	 } else if(taskKey=='LEASE_REVIEW'){
				    	 	if(!res.leasesData || !res.leasesData.length){
				    	 		//self.uploadRentalAgreementAdded = false;
				    	 		$('#rentalAgreementReviewTab').html("No lease records found");
				    	 		return;
				    	 	} else {
				    	 		//self.uploadRentalAgreementAdded = true;
				    	 	}
				    	 	self.RentaltabCount = 0;
				    	 	$("#rentalAgreementReviewUL").html("");
				    	 	$("#rentalAgreementReviewTab").html("");
				    	 	var leasesAlreadyAdded = [];
				    	 	var leaseData;
				    	 	var atleastOneLeaseAdded = false;
				    	 	if(self.parentView.model.attributes.propertyUnits && self.parentView.model.attributes.propertyUnits.length){
					    	 	_.each(self.parentView.model.attributes.propertyUnits,function(propertyUnit){
					    	 		leaseData = _.find(res.leasesData, function(leaseData) { return leaseData.unitId == propertyUnit.unitId }) || {};
					    	 		if(leaseData.leaseId){leasesAlreadyAdded.push(leaseData.leaseId);}
					    	 		self.addNewLeaseReviewTab(propertyUnit,leaseData,object,objectId,taskKey,res.subObject);
					    	 		atleastOneLeaseAdded = true;
					    	 	});
					    	 	
					    	 	self.propertyType="Multiple";
				    	 	}
				    	 	else{
				    	 		var leaseAdded;
					    	 	_.each(res.leasesData,function(leaseData){
					    	 		leaseAdded = _.find(leasesAlreadyAdded, function(leaseIdAdded) { return leaseData.leaseId == leaseIdAdded });
					    	 		if(!leaseAdded){
					    	 			self.addNewLeaseReviewTab("",leaseData,object,objectId,taskKey,res.subObject);
					    	 			atleastOneLeaseAdded = true;
					    	 		}
					    	 	});
					    	 	self.propertyType="Single";
				    	 	}
				    	 	if(!atleastOneLeaseAdded){
				    	 		$('#rentalAgreementReviewTab').html("No lease records found");
				    	 	}
				    	 	$("#rentalAgreementReviewUL a[href=#rental_tab_1]").click();
				    	 	app.currencyFormatter();
				    	 	ComponentsPickers.init();
				    	 }else if(taskKey=='PROPERTY_INSPECTION_ILM' || taskKey == 'HU_REHAB_QUOTE' || taskKey == 'INSPECTION_REVIEW_INTERNAL' || taskKey == 'CONTRACTOR_QUOTE'){
				    	 	self.propertyInspectionIlmView.populateInspectionItems(res);
				    	 } else if(taskKey=='PROPERTY_INSPECTION_INVESTOR'){
				    	 	self.propertyInspectionInvestorView.populateInspectionItems(res);
				    	 }else if(taskKey=='REPAIRS_REQUEST'){
				    		self.requestForRepairsView.populateInspectionItems(res);
			    		 }else if(taskKey=="SELLER_RESPONSE_REPAIRS"){
			    		 	self.sellerResponseForRepairsView.populateInspectionItems(res);
			    		 }else if(taskKey=="UPLOAD_MUTUAL_RELEASE"){
			 		    	if(!res. embraceEnvelopeId){
			 		    		var uploadTemplate=_.template(uploadFormMutualRelease);
			 			    	self.$el.find("#uploadMutualReleaseFormDiv").html(uploadTemplate);
			 		    	} else {
			 		    		self.$el.find("#uploadMutualReleaseFormDiv").remove();
			 		    	}
			 		    	res.app=app;
			 	     		var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
			 		     	res.documentTaskKey = 'UPLOAD_MUTUAL_RELEASE';
			 		     	res.envelopeTaskKey = 'UPLOAD_MUTUAL_RELEASE';
			 		     	res.documentTypes = 'Mutual Release';
			 		     	self.embraceEnvelopeId = res.embraceEnvelopeId;
			 		     	self.$el.find('.docusignEnvelopeArea').html("");
			 		     	self.$el.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));
			    		 }else if(taskKey=="PENDING_INVESTOR_SIGNATURE"){
			    			 res.app=app;
			    		 }else if(taskKey=="INVESTOR_RESPONSE_REPAIRS"){
-			    		 	self.investorResponseForRepairsView.populateInspectionItems(res);
				    	 }else if(taskKey=="HU_UPDATED_REHAB_QUOTE"){
-			    		 	self.huUpdatedRehabQuoteView.populateInspectionItems(res);
				    	 }else if(taskKey=='PRELIMINARY_HUD' && res['rentalStatus']){
				    		self.currentForm.find(".rentalStatus").text(res['rentalStatus']);
				    		if(res && res.documentId){
				    	 		self.preliminaryHudformValidation({documentRequired:false});
				    	 	} else {
				    	 		self.preliminaryHudformValidation({documentRequired:true});
				    	 	}
				    	 }else if(taskKey=='FINAL_WALK_THROUGH'){
					    	 	self.finalWalkThroughView.populateResponseItems(res);
				    	 }else if(taskKey=='CLOSING_APPOINTMENT'){
					    	 	self.closingAppointmentView.populateAppointmentItems(res);
				    	 }else if(taskKey=='PROPERTY_INSPECTION'){
				    	 	if(res && res.documentId){
				    	 		self.addFormValidations({documentRequired:false});
				    	 	} else {
				    	 		self.addFormValidations({documentRequired:true});
				    	 	}
				    	 }else if(taskKey=='SELLER_DISCLOSURE'){
				    		 if(res.showFldDisclosure=='Yes'){
				    			 $('#fldDisclosureDiv').show();
				    		 }
				    	 }else if(taskKey=='PROPERTY_APPRAISAL'){
				    	 	if(res && res.documentId){
				    	 		self.appraisalFormValidation({documentRequired:false});
				    	 	} else {
				    	 		self.appraisalFormValidation({documentRequired:true});
				    	 	}
				    	 } else if(taskKey=='EXEC_ASSET_MGMT_AGREEMENT'){
				    	 	if(res && res.documentId){
				    	 		self.assetManagementAgreementformValidation({documentRequired:false});
				    	 	} else {
				    	 		self.assetManagementAgreementformValidation({documentRequired:true});
				    	 	}
				    	 } else if(taskKey=='FINAL_HUD'){
				    	 	if(res && res.finalHudDocumentId){
				    	 		self.finalHudFormValidations({finalHudDocument:false});
				    	 	} else {
				    	 		self.finalHudFormValidations({finalHudDocument:true});
				    	 	}
				    	 }else if(taskKey=='FEE_SHEET'||taskKey=='WIRE_INSTRUCTION'||
				    			 taskKey=='SEND_MUTUAL_RELEASE'||taskKey=='EXECUTED_MUTUAL_RELEASE'){
				    		 if(res && res.documentId){
				    			 self.docIdToBeMailed = res.documentId;
				    			 console.log("docIdToBeMailed::"+self.docIdToBeMailed);
				    		 }
				    	 }else if(taskKey=='TAX_CERTIFICATE'){
				    		 if(res && res.propertyTaxesAnnual){
				    			 self.currentForm.find('.propertyTaxesAnnual').html(res.propertyTaxesAnnual);
						     	 $(".amount").formatCurrency();
						     	 app.currencyFormatter();
				    		 }
				    	 }
						
						// self.calculateRentalDailyPerDiem();
					},
				error   : function ( model, res ) {
						console.log('Error in fetching task data '+res);
						/*var error1 = $('#alertAddServiceContractFailure', $('#alertsForm'));
			             	error1.show();
	                 	App.scrollTo(error1, -200);
	                 	error1.delay(2000).fadeOut(2000);*/
					}
				});

				/*if(completedDate!=''){
	    			 $('#'+popupId+' button[id$=PopupSubmitButton]').attr('disabled','disabled');
	    		 } else {
	    			 $('#'+popupId+' button[id$=PopupSubmitButton]').removeAttr('disabled');
	    		 }*/
			}

			if((self.currentForm.find('input[name=startDate]').length>0 && !self.currentForm.find('input[name=startDate]').val())) {
				var projectedDateArray = String(projectedStartDate).split('-');
				var projectedStartDateObj = new Date();
				projectedStartDateObj.setFullYear(projectedDateArray[2], projectedDateArray[0]-1, projectedDateArray[1]);
				//console.log(projectedStartDateObj);
				var currentDate = new Date();
				//console.log(projectedStartDateObj<=currentDate);
				if(projectedStartDateObj<=currentDate) {
					self.currentForm.find('input[name=startDate]').val(projectedStartDate);
				}
				//update date-picker or fire its update event
			}

			if(this.parentView) {
				if(this.parentView.model.attributes.investmentResponse['financingTypeName'] == 'Cash') {
					$('.mortgageFields').hide();
					$('#downPaymentField').hide();
				} else {
					$('.mortgageFields').show();
					$('#downPaymentField').show();
				}
			}

			_($('.has-error')).each(function(error) {
				$(error).removeClass('has-error');
			});

			_($('.help-block')).each(function(error) {
				$(error).remove();
			});

			if(taskKey=='FINAL_HUD') {
				var titleDocument = this.currentForm.find('input[name=titleDocument]');
				if(titleDocument) {
					titleDocument.removeAttr("disabled");
				}
				var finalHudDocument = this.currentForm.find('input[name=finalHudDocument]');
				if(finalHudDocument) {
					finalHudDocument.removeAttr("disabled");
				}
				var recordedMortgageNote = this.currentForm.find('input[name=mortgageNote]');
				if(recordedMortgageNote) {
					recordedMortgageNote.removeAttr("disabled");
				}
				var taxCertificateDocument = this.currentForm.find('input[name=taxCertificateDocument]');
				if(taxCertificateDocument) {
					taxCertificateDocument.removeAttr("disabled");
				}
			}

			if(taskKey=='HOME_WARRANTY'){
				var isWarrantyRequired=this.currentForm.find('input[name=warrantyRequired]:checked').val();
				if(isWarrantyRequired=='Y'){
					$('.warrantyDetails').show();
				}
				else{
					$('.warrantyDetails').hide();
				}
			}

			if(taskKey=='EXEC_ASSET_MGMT_AGREEMENT'){
				self.showUploadDiv();
			}
			
			if(taskKey == 'POS_REPORT'){
				self.showResponsiblePersonRadios();
			}

			if(this.parentView) {
				var closingStatus = this.parentView.model.attributes.investmentResponse['closingStatus'];
				if(closingStatus == 'Completed') {
					this.handleClosingCompleted();
				} else if(closingStatus == 'Cancelled') {
					this.handleClosingCancelled();
				} else if(closingStatus == 'Pending Cancellation') {
					this.handleClosingPendingCancellation();
				}
			}

			this.showLeaseActive();

			$('#'+popupId+' #object').val(object);
			$('#'+popupId+' #objectId').val(objectId);
			$('#'+popupId+' #taskKey').val(taskKey);
			this.applyPermissions();
			$('#'+popupId).data('backdrop','static');
			$('#'+popupId).data('keyboard','false');
			$('#'+popupId).modal('show');

			$(".currency").formatCurrency({symbol:""});
			
			var tooltipExcludedTasks = ['INSURANCE_QUOTES_REVIEW','INSURANCE_VENDOR_SELECTION'];
			if(tooltipExcludedTasks.indexOf(taskKey)==-1){
				this.initializeTooltipPopup(popupId);
			}

			/*
	    	 * Initializing the export to excel button for the modal popup
	    	 */
	    	$('.exportToExcelWFTooltip').tooltip({
                animated: 'fade',
                placement: 'left'
            });
            
			App.handleUniform();
			$(".amount").formatCurrency();
		},
		submitPopupForm : function(evt) {

			var self = this;
			var isCancelSubmitAndReturn = false;

			if(self.currentTaskKey == "UPLOAD_RENTAL_AGREEMENT"){
				if (self.rentalAgreementTabForm.hasChanged()) {
					$('.rentalAgreementTabMsg').show().delay(2000).fadeOut(2000);
		            // return;
		            isCancelSubmitAndReturn = true;
		        }
				if(self.uploadRentalAgreementAdded == false){
					console.log("Please save atleast one rental agreement");
					$(evt.currentTarget).closest(".modal").find(".rentalAgreement-atleastOne-error").show()
						.delay(2000).fadeOut(4000);
					$(evt.currentTarget).closest(".modal").find(".rentalAgreement-atleastOne-error").animate({ scrollTop: 0 }, 'slow');
					// return;
					isCancelSubmitAndReturn = true;
				}
			} else if(self.currentTaskKey=='UTILITY_INFORMATION' && self.utilityView && !self.utilityView.isUtilityItemSaved()){
				console.log("save atleast one UTILITY_INFORMATION");
				self.utilityView.showError('NO_UTILITY_SAVED');
				// return;
				isCancelSubmitAndReturn = true;
			}

			var document = this.currentForm.find('input[name=document]');
			if(this.milestoneTasksWithMandatoryDocument.indexOf(this.currentTaskKey)!=-1) {
				var existingDoc = this.currentForm.find('.showDocumentTooltip');
				if(document && document.val() == "" && existingDoc.css('display') == 'none') {
					$('#milestoneDocRequiredMsg').show();
					// return false;
					isCancelSubmitAndReturn = true;
				} else {
					$('#milestoneDocRequiredMsg').hide();
				}
			} else {
				$('#milestoneDocRequiredMsg').hide();
			}
			
			if(self.currentTaskKey == "FEE_SHEET"){
				var existingDoc = this.currentForm.find('.showDocumentTooltip');
				if(document && document.val() == "" && existingDoc.css('display') == 'none') {
					$('#feeSheetRequiredMsg').show();
					// return false;
					isCancelSubmitAndReturn = true;
				} 
			}
			
			if(self.currentTaskKey == "UPLOAD_MUTUAL_RELEASE"){
				if((document && document.val() == "") || (self.mutualReleaseEnvelopeStatus!="sent" && self.mutualReleaseEnvelopeStatus!="completed")) {
					//$('#executedMutualReleaseRequiredMsg').show();
					$('#uploadMutualReleaseRequiredMsg').show();
					// return false;
					isCancelSubmitAndReturn = true;
				} 
			}
			
			if(self.currentTaskKey == "UPLOAD_EXECUTED_MUTUAL_RELEASE"){
				var existingDoc = this.currentForm.find('.showDocumentTooltip');
				if(document && document.val() == "" && existingDoc.css('display') == 'none') {
					$('#executedMutualReleaseRequiredMsg').show();
					// return false;
					isCancelSubmitAndReturn = true;
				} 
			}
			
			if(self.currentTaskKey == "POS_REPORT") {
				var existingDoc = this.currentForm.find('.showDocumentTooltip');
				if(document && document.val() == "" && existingDoc.css('display') == 'none') {
					$('#posReportDocRequiredMsg').show();
					// return false;
					isCancelSubmitAndReturn = true;
				} 
			} 		
			
			if(self.currentTaskKey == "TAX_CERTIFICATE"){
				var existingDoc = this.currentForm.find('.showDocumentTooltip');
				if(document && document.val() == "" && existingDoc.css('display') == 'none') {
					$('#taxCertificateRequiredMsg').show();
					// return false;
					isCancelSubmitAndReturn = true;
				} 
			}
			/*if((this.currentTaskKey).indexOf("ASSET_MGMT_AGREEMENT")!=-1) {
				var isAgreementSigned = this.currentForm.find('input[name=isAgreementSigned]:checked').val();
				if(isAgreementSigned == 'Yes'){
					var documentVal = this.currentForm.find('input[name=document]').val();
					if(documentVal=="") {
						document.removeAttr("disabled");
						$('#assetMgmtAgreementErrDiv').show();
						return false;
					}
					$('#assetMgmtAgreementErrDiv').hide();
				}else{
					$('#assetMgmtAgreementErrDiv').hide();
				}
			}*/
			
			if(self.currentTaskKey == "HOME_WARRANTY"){
				var warrantyReq = this.currentForm.find('input[name=warrantyRequired]:checked').val();
				if(warrantyReq!='Y' && document && document.val() == ""){
					document.attr("disabled","disabled");
				}
				else{
					document.attr("disabled",false);
				}
			}
			
			if(this.currentForm.validate().form() && !isCancelSubmitAndReturn) {
				if(document && document.val() == "") {
					document.attr("disabled","disabled");
				}
				var titleDocument = this.currentForm.find('input[name=titleDocument]');
				if(titleDocument && titleDocument.val() == "") {
					titleDocument.attr("disabled","disabled");
				}
				var finalHudDocument = this.currentForm.find('input[name=finalHudDocument]');
				if(finalHudDocument && finalHudDocument.val() == "") {
					finalHudDocument.attr("disabled","disabled");
				}
				var recordedMortgageNote = this.currentForm.find('input[name=mortgageNote]');
				if(recordedMortgageNote && recordedMortgageNote.val() == "") {
					recordedMortgageNote.attr("disabled","disabled");
				}
				var taxCertificateDocument = this.currentForm.find('input[name=taxCertificateDocument]');
				if(taxCertificateDocument && taxCertificateDocument.val() == "") {
					taxCertificateDocument.attr("disabled","disabled");
				}
				var repairPictures = this.currentForm.find('input[name=repairPictures]');
				if(repairPictures && repairPictures.val() == "") {
					repairPictures.attr("disabled","disabled");
				}
				var insuranceQuoteDocuments = this.currentForm.find('input[name=insuranceQuoteDocuments]');
				if(insuranceQuoteDocuments && insuranceQuoteDocuments.val() == "") {
					insuranceQuoteDocuments.attr("disabled","disabled");
				}
				var fldDocument = this.currentForm.find('input[name=fldDocument]');
				if(fldDocument && fldDocument.val() == "") {
					fldDocument.attr("disabled","disabled");
				}
				
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});
				
				var nonMultipartTasks = ['INSURANCE_QUOTES_REVIEW','INSURANCE_VENDOR_SELECTION','INSURANCE_APPLICATION_SIGNATURE',
					'PROPERTY_INSPECTION_INVESTOR','FINAL_WALK_THROUGH','CLOSING_APPOINTMENT','INVESTOR_RESPONSE_REPAIRS','REPAIRS_REQUEST','HU_UPDATED_REHAB_QUOTE','DEED_RECORDED'];

					

				if(nonMultipartTasks.indexOf(self.currentTaskKey)==-1){
					self.model.submitTaskData(
						this.currentForm,
						{
							success : function ( model, res ) {
								$.unblockUI();
								self.currentPopup.modal('hide');
								self.currentPopup.on('hidden.bs.modal', function (e) {
									if(self.parentView) {
										self.parentView.refreshClosingHeader();
									}
									self.refreshClosingSteps();//order is imp as refreshClosingHeder will set closingStatusSteps
									$('#workflowExecutionSuccessAlert span').text(res);
									$("#workflowExecutionSuccessAlert").show();
									$("#workflowExecutionSuccessAlert").delay(5000).fadeOut(5000);
								});
								console.log(res);
								/*var success1 = $('#alertAddServiceContractSuccess', $('#alertsForm'));
		                 	success1.show();
		                 	App.scrollTo(success1, -200);
		                 	success1.delay(2000).fadeOut(2000);*/
							},
							error   : function ( model, res ) {
								$.unblockUI();
								self.currentPopup.modal('hide');
								self.currentPopup.on('hidden.bs.modal', function (e) {
									if(self.parentView) {
										self.parentView.refreshClosingHeader();
									}
									self.refreshClosingSteps();//order is imp as refreshClosingHeder will set closingStatusSteps
									$('#workflowExecutionFailureAlert span').text(res.responseText);
									$("#workflowExecutionFailureAlert").show();
									$("#workflowExecutionFailureAlert").delay(5000).fadeOut(5000);
								});
								
								/*var error1 = $('#alertAddServiceContractFailure', $('#alertsForm'));
				             	error1.show();
		                 	App.scrollTo(error1, -200);
		                 	error1.delay(2000).fadeOut(2000);*/
							}
						}
					);
				}
				else{
					var postData={};
					postData.taskKey=self.currentTaskKey;
					postData.objectId=self.currentObjectId;
					postData.object=self.currentObject;
					if(self.currentTaskKey=='INSURANCE_QUOTES_REVIEW') {
						postData.insuranceReviewObjects=self.getInsuranceReviewFormData();
						if($('#INSURANCE_QUOTES_REVIEW_POPUP_1').find('#endDate').val()!=""){
							postData.endDate=$('#INSURANCE_QUOTES_REVIEW_POPUP_1').find('#endDate').val();
						}
					} else if(self.currentTaskKey=='INSURANCE_VENDOR_SELECTION') {
						postData.insuranceSelected = $('[name=insuranceSelected]:checked').val();
						if($('#INSURANCE_VENDOR_SELECTION_POPUP_1').find('#endDate').val()!=""){
							postData.endDate=$('#INSURANCE_VENDOR_SELECTION_POPUP_1').find('#endDate').val();
						}
					} else if(self.currentTaskKey=='INSURANCE_APPLICATION_SIGNATURE') {
						postData.comments = self.currentForm.find('[name=comments]').val();
						if($('#INSURANCE_APPLICATION_SIGNATURE_POPUP_1').find('#endDate').val()!=""){
							postData.endDate=$('#INSURANCE_APPLICATION_SIGNATURE_POPUP_1').find('#endDate').val();
						}
					} else if(self.currentTaskKey == 'PROPERTY_INSPECTION_INVESTOR' && self.propertyInspectionInvestorView){
						var returnObj = self.propertyInspectionInvestorView.fetchSubmitData();
						postData.inspectionCategories = returnObj.inspectionCategories;
						postData.endDate = returnObj.endDate;
						postData.comments = returnObj.comments;
					} else if(self.currentTaskKey == 'INVESTOR_RESPONSE_REPAIRS' && self.investorResponseForRepairsView){
						var returnObj = self.investorResponseForRepairsView.fetchSubmitData();
						postData.inspectionCategories = returnObj.inspectionCategories;
						postData.endDate = returnObj.endDate;
						postData.comments = returnObj.comments;
					}  else if(self.currentTaskKey == 'REPAIRS_REQUEST' && self.requestForRepairsView){
						var returnObj = self.requestForRepairsView.fetchSubmitData();
						postData.inspectionCategories = returnObj.inspectionCategories;
						postData.endDate = returnObj.endDate;
						postData.comments = returnObj.comments;
					} else if(self.currentTaskKey=='FINAL_WALK_THROUGH') {
						postData.comments = self.currentForm.find('[name=comments]').val();
						if($('#FINAL_WALK_THROUGH_POPUP_1').find('#endDate').val()!=""){
							postData.endDate=$('#FINAL_WALK_THROUGH_POPUP_1').find('#endDate').val();
						}
					}  else if(self.currentTaskKey=='CLOSING_APPOINTMENT') {
						postData.notaryContactId = self.currentForm.find('[name=notaryContactId]').val();
						postData.firstName = self.currentForm.find('[name=firstName]').val();
						postData.lastName = self.currentForm.find('[name=lastName]').val();
						postData.phone = self.currentForm.find('[name=phone]').val();
						postData.email = self.currentForm.find('[name=email]').val();
						postData.comments = self.currentForm.find('[name=comments]').val();
						if($('#CLOSING_APPOINTMENT_POPUP_1').find('#endDate').val()!=""){
							postData.endDate=$('#CLOSING_APPOINTMENT_POPUP_1').find('#endDate').val();
						}

					} else if(self.currentTaskKey == 'HU_UPDATED_REHAB_QUOTE' && self.huUpdatedRehabQuoteView){
						var returnObj = self.huUpdatedRehabQuoteView.fetchSubmitData();
						postData.inspectionCategories = returnObj.inspectionCategories;
						postData.endDate = returnObj.endDate;
						postData.comments = returnObj.comments;
					}

					 else if(self.currentTaskKey=='DEED_RECORDED') {
						postData.closingEndDate=self.currentForm.find('[name=closingEndDate]').val();
						postData.endDate=self.currentForm.find('[name=endDate]').val();
						postData.comments = self.currentForm.find('[name=comments]').val();
					} 

										
					$.ajax({
						url: app.context()+'/closing/processNonMultipartForm',
						contentType: 'application/json',
						dataType:'text',
						type: 'POST',
						data: JSON.stringify(postData),
						async: true,
						success: function(res){
							$.unblockUI();
							self.currentPopup.modal('hide');
							self.currentPopup.on('hidden.bs.modal', function (e) {
								if(self.parentView) {
									self.parentView.refreshClosingHeader();
									if(self.currentTaskKey=='DEED_RECORDED') {
										self.parentView.renderImpDates();
									}
								}
								self.refreshClosingSteps();//order is imp as refreshClosingHeder will set closingStatusSteps
								$('#workflowExecutionSuccessAlert span').text(res);
								$("#workflowExecutionSuccessAlert").show();
								$("#workflowExecutionSuccessAlert").delay(5000).fadeOut(5000);
							});
							console.log(res);
						},
						error: function(res){
							$.unblockUI();
							self.currentPopup.modal('hide');
							self.currentPopup.on('hidden.bs.modal', function (e) {
								if(self.parentView) {
									self.parentView.refreshClosingHeader();
									if(self.currentTaskKey=='DEED_RECORDED') {
										self.parentView.renderImpDates();
									}
								}
								self.refreshClosingSteps();//order is imp as refreshClosingHeder will set closingStatusSteps
								$('#workflowExecutionFailureAlert span').text(res.responseText);
								$("#workflowExecutionFailureAlert").show();
								$("#workflowExecutionFailureAlert").delay(5000).fadeOut(5000);
							});
						}
					});
				}
			}

		},
		render : function (options) {
			if(options.parentView) {
				this.parentView = options.parentView;
			}
			if(this.parentView) {
				this.fetchClosingStepsData(this.parentView.investmentId);
			}

			if(!app.documentPreview){
				app.documentPreview=new documentPreviewView();
			}
			
			this.template = _.template( closingStepsPage );
			this.$el.html("");
			
			
			
			
			this.$el.html(this.template({closingStepsData:this.collection.toJSON(),object:this.propertyModel.object,objectId:this.propertyModel.objectId,app:app,closingStatusSteps:this.propertyModel.closingStatus}));
			
			/*$('#closingStepsTable').dataTable({
				"bFilter":true,
				"deferRender": true,
				"bPaginate": false
			});*/
			$('#closingStepsTable').DataTable({
				"searching": true,
				"deferRender": true,
				"paging": false,
				"aaSorting": [], 
				"columnDefs": [
				    { "type": "html", "targets": 0 },
				    { "type": "html", "targets": 1 },
				    { "type": "html", "targets": 2 },
				    { "type": "html", "targets": 3 },
				    { "type": "html", "targets": 4 },
				    { "type": "html", "targets": 5 }
				  ]
			});
			
			var popupsTemplate = _.template( taskPopupsPage );
			$('#taskPopups').html("");
			$('#taskPopups').html(popupsTemplate());
			
			var homeWarrantyHtml=_.template(homeWarrantyPopUp);
			$("#renderHomeWarrantyTemplate").html(homeWarrantyHtml);
			
			if(!this.insuranceVendorHomeView){
				this.insuranceVendorHomeView=new insuranceVendorHomeView({collection:new insuranceCollection()});
			}
			
			console.log($('#insurancePopupsDiv'));
			this.insuranceVendorHomeView.setElement($('#insurancePopupsDiv')).render1();
			
			var mailTemplate=_.template(mailSendTemplate);
			$('#renderSendToMailTemplate').html(mailTemplate);
			
			var utilityInformationHtml=_.template(utilityInformation);
			$("#renderUtilityInformation").html(utilityInformationHtml);
			
			var utilityTransferHtml=_.template(utilityTransfer);
			$("#renderUtilityTransfer").html(utilityTransferHtml);

			app.currencyFormatter();
			this.addFormValidations();

			ComponentsPickers.init();
			this.applyPermissions();
			if(this.parentView) {
				var closingStatus = this.parentView.model.attributes.investmentResponse['closingStatus'];
				if(closingStatus == 'Completed') {
					this.handleClosingCompleted();
				} else if(closingStatus == 'Cancelled'){
					this.handleClosingCancelled();
				} else if(closingStatus == 'Pending Cancellation'){
					this.handleClosingPendingCancellation();
				}
			}

			this.initializeTooltipRender();
            $('.hopNameTooltip').tooltip({
                animated: 'fade',
                placement: 'left'
            });
            this.showOpenClosingToggle();
			return this;
		},
		refreshClosingSteps : function () {
			this.propertyModel.closingStatus=self.parentView.model.attributes.investmentResponse.closingStatus;
			this.render({});
		},

		addNewRehabEstimateRow : function() {
			var rowtemplate = _.template( rehabEstimateAddRow );
			if($('#rehabEstimateTbody tr').last().size()>0){
				$('#rehabEstimateTbody tr').last().after(rowtemplate({data:null}));
			}
			else{
				$('#rehabEstimateTbody').append(rowtemplate({data:null}));

			}
			app.currencyFormatter();
		},

		submitRehabEstimatePopUp : function(){
			var self=this;
			//var requestObj=new closingStepsModel();
			var rehabItems=[];

			//requestObj.set("object",self.currentObject);
			//requestObj.set("objectId",self.currentObjectId);
			//requestObj.set("taskKey",self.currentTaskKey);

//			var unindexed_array = $('#provideRehabEstimateForm').serializeArray();
//			$.map(unindexed_array, function(n, i){

//			var value=n['value'];
//			var name=n['name'];
//			if(name!="item" && name!="cost" && name!="totalCost" && name!="rehabItemId"){
//			requestObj.set(name,value);
//			}
//			});

			$('#rehabEstimateTbody').find('tr').each(function(){

				var obj={};
				obj.cost=$(this).find("[name='cost']").val();
				obj.item=$(this).find("[name='item']").val();
				if($(this).find("[name='rehabItemId']")){
					obj.rehabItemId=$(this).find("[name='rehabItemId']").val();
				}

				// if($(this).find("[name='cost']").val()!="" && $(this).find("[name='item']").val()!=""){
				if($(this).find("[name='item']").val()!=""){
					rehabItems.push(obj);
				}
			});

			$("#rehabItems").val(JSON.stringify(rehabItems));
			if(this.currentForm.validate().form()) {
				var document = this.currentForm.find('input[name=document]');
				if(document && document.val() == "") {
					document.attr("disabled","disabled");
				}
				_(this.currentForm.find('input[name=cost]')).each(function(item){
					$(item).attr("disabled","disabled");
				});
				_(this.currentForm.find('input[name=item]')).each(function(item){
					$(item).attr("disabled","disabled");
				});
				_(this.currentForm.find('input[name=rehabItemId]')).each(function(item){
					$(item).attr("disabled","disabled");
				});
				_(this.currentForm.find('input[name=totalCost]')).each(function(item){
					$(item).attr("disabled","disabled");
				});
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});
				this.currentForm.attr("enctype","multipart/form-data");
				this.currentForm.ajaxSubmit({
					url: app.context()+'/closing/processRehabEstimate',
					async:true,
					success: function(res){
						$.unblockUI();
						console.log("success");
						$('#REHAB_ESTIMATE_POPUP_1').modal('hide');
						$('#REHAB_ESTIMATE_POPUP_1').on('hidden.bs.modal', function (e) {
							self.refreshClosingSteps();
						}); 
					},
					error: function(res){
						$.unblockUI();
						console.log("failure");
						self.enableRehabPopupFields();
					}
				});
			}

		},
		enableRehabPopupFields:function(){
			var document = this.currentForm.find('input[name=document]');
			if(document && document.val() == "") {
				document.removeAttr("disabled");
			}
			_(this.currentForm.find('input[name=cost]')).each(function(item){
				$(item).removeAttr("disabled");
			});
			_(this.currentForm.find('input[name=item]')).each(function(item){
				$(item).removeAttr("disabled");
			});
			_(this.currentForm.find('input[name=rehabItemId]')).each(function(item){
				$(item).removeAttr("disabled");
			});
			_(this.currentForm.find('input[name=totalCost]')).each(function(item){
				$(item).removeAttr("disabled");
			});
		},
		appraisalFormValidation:function(args){
			var form1 = $('#propertyAppraisalForm');
			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					appraisalValue:{
						number: true,
						dollarsscents: true
					},
					startDate:{
						required: true
					},
					appraisalFee:{
						number: true,
						dollarsscents: true
					},
					document:{
						required:!(args && args.documentRequired)?false:true
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
		preliminaryHudformValidation:function(args){
			var preliminaryHudform=$('#PreliminaryHudReviewForm');
			preliminaryHudform.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					startDate:{
						required: true
					},
					document:{
						required:!(args && args.documentRequired)?false:true
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
		assetManagementAgreementformValidation:function(args){
			var assetMgmtAgreementform=$('.assetMgmtAgreementform');
			assetMgmtAgreementform.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					startDate:{
						required: true
					},
					document:{
						required:!(args && args.documentRequired)?false:true
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
		finalHudFormValidations:function(args){
			var self = this;
			var finalHudForm=$(".final-hud-form");
			/*var errorHud = $('.alert-danger', finalHudForm);
			var successHud = $('.alert-success', finalHudForm);*/
			finalHudForm.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					purchasePriceHUD:{
						number: true,
						dollarsscents:true
					},
					rehabCost:{
						number: true,
						dollarsscents:true
					},
					closingCost:{
						number: true,
						dollarsscents:true
					},
					inspectionFee:{
						number: true,
						dollarsscents:true
					},
					appraisalFee:{
						number: true,
						dollarsscents:true
					},
					titleFee:{
						number: true,
						dollarsscents:true
					},
					recordingFee:{
						number: true,
						dollarsscents:true
					},
					originationFee:{
						number: true,
						dollarsscents:true
					},
					otherCosts:{
						number: true,
						dollarsscents:true
					},
					credits:{
						number: true,
						dollarsscents:true
					},
					downPayment:{
						number: true,
						dollarsscents:true
					},
					totalInvestment:{
						number: true,
						dollarsscents:true
					},
					hoa:{
						number: true,
						dollarsscents:true
					},
					propertyInsurance:{
						number: true,
						dollarsscents:true
					},
					propertyTax:{
						number: true,
						dollarsscents:true
					},
					//impounds;
					//mortgageType;
					impoundAmount:{
						number: true,
						dollarsscents:true
					},
					loanAmount:{
						number: true,
						dollarsscents:true
					},
					monthlyPayment:{
						number: true,
						dollarsscents:true
					},
					//maturityDate;
					interestRate:{
						number: true,
						percentage:true
					},
					term:{
						number: true
					},
					amortizationPeriod:{
						number: true
					},
					armLength:{
						number: true
					},
					propertyInsuranceReserve:{
						number: true,
						dollarsscents:true
					},
					propertyTaxReserve:{
						number: true,
						dollarsscents:true
					},
					finalHudDocument:{
						required:!(args && args.finalHudDocument)?false:true
					}

				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					/*successHud.hide();
				errorHud.show();
				self.showClosingDiv();*/
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
		addFormValidations:function(args){
			var self=this;
			var form3 = $('#propertyAppraisalForm');
			var error3 = $('.alert-danger', form3);
			var success3 = $('.alert-success', form3);

			form3.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					startDate:{
						required: true
					},
					appraisalValue:{
						required: "input[name=endDate]:filled",
						number: true,
						dollarsscents: true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					success3.hide();
					error3.show();
					App.scrollTo(error3, -200);
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
			var milestoneForms = $('.milestone-form');
			var tenantForm=$('#tenantForm');
			var error1 = $('.alert-danger', tenantForm);
			var success1 = $('.alert-success', tenantForm);
			tenantForm.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					name:{
						required: "input[name=endDate]:filled",
					},
					startDate:{
						required: true
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
			_(milestoneForms).each(function(form) {
				var form1=$(form);
				var error1 = $('.alert-danger', form1);
				var success1 = $('.alert-success', form1);
				form1.validate({
					errorElement: 'span', //default input error message container
					errorClass: 'help-block', // default input error message class
					focusInvalid: false, // do not focus the last invalid input
					ignore: "",
					rules: {
						endDate:{
							required: true
						},
						loanNumber:{
							number:true
						},
						optionFee:{
							required: true
						},
						reInspectionDate:{
							required: true
						}
					},
					invalidHandler: function (event, validator) { //display error alert on form submit              
						success1.hide();
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
			});

			var defaultDocForms = $('.default-form-with-doc');
			_(defaultDocForms).each(function(form) {
				var form1=$(form);
				var error1 = $('.alert-danger', form1);
				var success1 = $('.alert-success', form1);
				form1.validate({
					errorElement: 'span', //default input error message container
					errorClass: 'help-block', // default input error message class
					focusInvalid: false, // do not focus the last invalid input
					ignore: "",
					rules: {
						startDate:{
							required: true
						}
					},
					invalidHandler: function (event, validator) { //display error alert on form submit              
						success1.hide();
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
			});

			var homeWarrantyform=$('.homeWarrantyForm');
			var error1 = $('.alert-danger', homeWarrantyform);
			var success1 = $('.alert-success', homeWarrantyform);
			homeWarrantyform.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					companyName:{
						required: true
					},
					policyNumber:{
						required: true
					},
					validFromDate:{
						required: true
					},
					validToDate:{
						required: true
					},
					endDate:{
						required: true
					},
					document:{
						required: true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					success1.hide();
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
			
			//provideRehabEstimate Validations start
			var provideRehabEstimateForm=$("#provideRehabEstimateForm");
			var errorRehab = $('.alert-danger', provideRehabEstimateForm);
			var successRehab = $('.alert-success', provideRehabEstimateForm);
			provideRehabEstimateForm.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {

					startDate:{
						required: true
					},
					/*cost:{
						required: true
					},*/
					item:{
						required: true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					successRehab.hide();
					errorRehab.show().delay(2000).fadeOut(2000);
					App.scrollTo(errorRehab, -200);
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
			//provideRehabEstimate Validations end

			//inspection form validations
			var inspectionForm=$("#propertyInspectionForm");
			var errorInsp = $('.alert-danger', inspectionForm);
			var successInsp = $('.alert-success', inspectionForm);
			inspectionForm.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					inspectionFee:{
						number: true,
						dollarsscents:true
					},
					utilitiesActivationFee:{
						number: true,
						dollarsscents:true
					},
					document:{
						required:!(args && args.documentRequired)?false:true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					successInsp.hide();
				errorInsp.show();
				self.showClosingDiv();
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

			var termRateForm=$(".term-rate-form");
			var errorTermRate = $('.alert-danger', termRateForm);
			var successTermRate = $('.alert-success', termRateForm);

			termRateForm.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					endDate:{
						required: true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					successTermRate.hide();
					errorTermRate.show();
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
			
			//Deed Recorded form validation
			var deedRecordedForm=$('.deedRecordedForm');
			var errorDeed = $('.alert-danger', deedRecordedForm);
			var successDeed = $('.alert-success', deedRecordedForm);
			deedRecordedForm.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					closingEndDate:{
						required: true
					},
					endDate:{
						required: true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					errorDeed.hide();
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
			
			//Tax Certificate form validation
			var taxCertificateForm=$('.taxCertificateForm');
			var errorTaxCertificate = $('.alert-danger', taxCertificateForm);
			var successTaxCertificate = $('.alert-success', taxCertificateForm);
			taxCertificateForm.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					yearlyTaxAmount:{
						required: true
					},
					endDate:{
						required: true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					errorTaxCertificate.hide();
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
			
			//upload mutual release form validation
			var uploadMututalReleaseform=$('#uploadMutualReleaseForm');
			var error1 = $('.alert-danger', uploadMututalReleaseform);
			var success1 = $('.alert-success', uploadMututalReleaseform);
			uploadMututalReleaseform.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					endDate:{
						required: true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					success1.hide();
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
			
			//Pending Investor Sign form validation
			var pendingInvestorSignForm=$('#pendingInvestorSignForm');
			var error1 = $('.alert-danger', pendingInvestorSignForm);
			var success1 = $('.alert-success', pendingInvestorSignForm);
			pendingInvestorSignForm.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					endDate:{
						required: true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					success1.hide();
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
			
			//send mutual release form validation
			var sendMututalReleaseform=$('#sendMutualReleaseForm');
			var error1 = $('.alert-danger', sendMututalReleaseform);
			var success1 = $('.alert-success', sendMututalReleaseform);
			sendMututalReleaseform.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					endDate:{
						required: true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					success1.hide();
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
			
			//upload executed mutual release form validation
			var uploadExecutedMutualReleaseForm=$('#uploadExecutedMutualReleaseForm');
			var error1 = $('.alert-danger', uploadExecutedMutualReleaseForm);
			var success1 = $('.alert-success', uploadExecutedMutualReleaseForm);
			uploadExecutedMutualReleaseForm.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					endDate:{
						required: true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					success1.hide();
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
			
			//executed mutual release form validation
			var executedMutualReleaseForm=$('#executedMutualReleaseForm');
			var error1 = $('.alert-danger', executedMutualReleaseForm);
			var success1 = $('.alert-success', executedMutualReleaseForm);
			executedMutualReleaseForm.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					endDate:{
						required: true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					success1.hide();
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

		deleteCurrentRow: function(evt){

			this.tableRow=$(evt.currentTarget).parent().parent();
			this.rehabItemIdVal=this.tableRow.find("[name='rehabItemId']").val();
			$("#form-delete1").modal('show');
		},

		calculateAmount : function(){
			var self=this;
			self.cost=0;

			$('#rehabEstimateTbody').find('tr').each(function(){
				if($(this).find("[name='cost']").val()!=""){
					self.cost+=parseFloat($(this).find("[name='cost']").val());
				}
			});
			$("#resultTotalCost").val(self.cost);
			$("#resultTotalCost_currency").val(self.cost);
			$("#resultTotalCost_currency").formatCurrency();
		},

		addNewRehabEstimateRenderedRow : function(data) {
			var rowtemplate = _.template( rehabEstimateAddRow );
			if($('#rehabEstimateTbody tr').last().size()>0){
				$('#rehabEstimateTbody tr').last().after(rowtemplate({data:data}));
			}
			else{
				$('#rehabEstimateTbody').append(rowtemplate({data:data}));
			}
			$("[id$=currency]").keyup();
			app.currencyFormatter();
		},

		deleteRehabItemIssue: function(){
			var self = this;
			var rehabItemIdVal=this.rehabItemIdVal;
			if(rehabItemIdVal){
				self.model.deleteInspectionIssue(rehabItemIdVal,{
					success: function(res){
						console.log("success");
					},
					error: function(res){
						console.log("failure");
					}
				});
				/*$.ajax({
					url: app.context()+'/closing/deleteInspectionIssue/'+rehabItemIdVal,
					contentType: 'application/json',
					dataType:'json',
					type: 'DELETE',
					success: function(res){
						console.log("success");
					},
					error: function(res){
						console.log("failure");
					}
				});*/
			}
			this.tableRow.remove();
			$("#form-delete1").modal('hide');
			this.calculateAmount();
		},
		cancelClosing : function() {
			var self= this;

			if($('#cancelClosingForm').validate().form()){
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});
				//
				var postData= {};
				var unindexed_array = $('#cancelClosingForm').serializeArray();
				$.map(unindexed_array, function(n, i){
					var value=n['value'];
					var name=n['name'];
					postData[name]=value;

				});
				var allVals = [];
			     $('#cancellationSubReasonsDiv :checked').each(function() {
			       allVals.push($(this).val());
			     });
			    postData.cancellationSubReasons = allVals;//.join();
				postData.object=this.propertyModel.object;
				postData.objectId=this.propertyModel.objectId;
				console.log(postData);

				this.model.cancelClosing(postData,{
					success : function ( model, res ) {
						$.unblockUI();
						$('#cancelClosing').modal('hide');
						$('#cancelClosing').on('hidden.bs.modal', function (e) {
							if(self.parentView) {
								if(self.parentView.model && res['closingStatus']){
									self.parentView.model.attributes.investmentResponse['closingStatus'] = res['closingStatus'];
								}
								self.parentView.refreshClosingHeader();
								self.refreshClosingSteps();//order is imp as refreshClosingHeder will set closingStatusSteps
								self.parentView.applyPermissions();
							}
							self.handleClosingPendingCancellation();
						});
						var success1 = $('#alertCancelClosingSuccess', $('#alertsForm'));
						success1.show();
						App.scrollTo(success1, -200);
						success1.delay(2000).fadeOut(2000);
					},
					error   : function ( model, res ) {
						$.unblockUI();
						$('#cancelClosing').modal('hide');
						$('#cancelClosing').on('hidden.bs.modal', function (e) {
							if(self.parentView) {
								self.parentView.refreshClosingHeader();
							}
						});
						var error1 = $('#alertCancelClosingFailure', $('#alertsForm'));
						error1.show();
						App.scrollTo(error1, -200);
						error1.delay(2000).fadeOut(2000);
					}
				});
			}
		},
		completeClosing : function() {
			var self= this;
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			this.model.completeClosing(this.propertyModel.object,this.propertyModel.objectId,{
				success : function ( model, res ) {
					$.unblockUI();
					$('#completeClosing').modal('hide');
					$('#completeClosing').on('hidden.bs.modal', function (e) {
						if(res['statusCode']=='-2') {
							var error1 = $('#alertCompleteClosingFailure1', $('#alertsForm'));
							error1.show();
							App.scrollTo(error1, -200);
							error1.delay(2000).fadeOut(2000);
						} else {
							if(self.parentView) {
								if(self.parentView.model && res['closingStatus']){
									self.parentView.model.attributes.investmentResponse['closingStatus'] = res['closingStatus'];
								}
								self.parentView.refreshClosingHeader();
								self.parentView.applyPermissions();
								self.parentView.setCurrentRemarks();
							}
							self.handleClosingCompleted();
							var success1 = $('#alertCompleteClosingSuccess', $('#alertsForm'));
							success1.show();
							App.scrollTo(success1, -200);
							success1.delay(2000).fadeOut(2000);
						}
					});
				},
				error   : function ( model, res ) {
					$.unblockUI();
					$('#completeClosing').modal('hide');
					$('#completeClosing').on('hidden.bs.modal', function (e) {
						if(self.parentView) {
							self.parentView.refreshClosingHeader();
						}
					});
					var error1 = $('#alertCompleteClosingFailure', $('#alertsForm'));
					error1.show();
					App.scrollTo(error1, -200);
					error1.delay(2000).fadeOut(2000);
				}
			});
		},
		applyPermissions : function() {
			if($.inArray('ClosingManagement', app.sessionModel.attributes.permissions)==-1) {
				$("#provideRehabEstimateButton").remove();
				$("button[id$=PopupSubmitButton]").remove();
				$('a[href="#cancelClosing"]').remove();
				$(".closingCompletedButton").remove();
				_($("a[id$=reprojectDate]")).each(function(n){
					$(n).remove();
				});
			}
		},
		handleClosingCompleted : function() {
			$("#showOwnershipModal").remove();
			$("#showEscrowCompanyModal").remove();
			$("a[href='editClosingHeader']").remove();
			$("a[href='#lendingcompany']").remove();
			$("#provideRehabEstimateButton").remove();
			$("button[id$=PopupSubmitButton]").remove();
			$("button[id$=PopupClosingCancellationSubmitButton]").remove();
			$('a[href="#cancelClosing"]').remove();
			$(".closingCompletedButton").remove();
			_($("a[id$=openStep]")).each(function(n){
				$(n).remove();
			});
			_($("a[id$=deleteStep]")).each(function(n){
				$(n).remove();
			});
			_($("a[id$=reprojectDate]")).each(function(n){
				$(n).remove();
			});
		},
		handleClosingCancelled : function() {
			$("#showOwnershipModal").remove();
			$("#showEscrowCompanyModal").remove();
			$("a[href='editClosingHeader']").remove();
			$("a[href='#lendingcompany']").remove();
			$("#provideRehabEstimateButton").remove();
			$("button[id$=PopupSubmitButton]").remove();
			$("button[id$=PopupClosingCancellationSubmitButton]").remove();
			$('#cancelClosingLink').remove();
			$(".closingCompletedButton").remove();
			_($("a[id$=openStep]")).each(function(n){
				$(n).remove();
			});
			_($("a[id$=deleteStep]")).each(function(n){
				$(n).remove();
			});
			_($("a[id$=reprojectDate]")).each(function(n){
				$(n).remove();
			});
		},
		handleClosingPendingCancellation:function() {
			var self=this;
			if(!jQuery.isEmptyObject(self.currentTaskStatus) && self.currentTaskStatus=='Cancelled'){
				$("button[id$=PopupSubmitButton]").remove();
			}
			$('#cancelClosingLink').remove();
			$(".closingCompletedButton").remove();
		},
		cancelClosingValidation: function(){
			var form1 = $('#cancelClosingForm');
			var error1 = $('.alert-danger', form1);
			var success1 = $('.alert-success', form1);

			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					comments:{
						required: true
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
		showOpenClosingToggle: function(){
			var items;
			var allhide=0;

			if($("#showOpenClosingToggleButton").text() == "Show All") {
				$("#showOpenClosingToggleButton").text("Show Open");

				
				$("#allRowhidded").remove();
			
				
				items = $('td:nth-child(6)', '#closingStepsTable');
				for(var i=0;i<items.length;i++)
				{
					if(items[i].textContent == "Completed" || items[i].textContent == "Cancelled"){
						$(items[i]).closest("tr").show();
					}
				}
			} else {
				$("#showOpenClosingToggleButton").text("Show All");

				items = $('td:nth-child(6)', '#closingStepsTable');
				for(var i=0;i<items.length;i++)
				{
					if(items[i].textContent == "Completed" || items[i].textContent == "Cancelled"){
						$(items[i]).closest("tr").hide();
						allhide++;
					}
				}
				if(allhide==items.length){
					
					//console.log("all hide");
					$("#closingStepsTable tbody").append(' <tr class="dummy-row" id="allRowhidded"><td colspan="7" style="text-align:center;">No open steps found.</td></tr>');
					
					
					
				}
			}


		},

		showReprojectModal: function(evt){
			var target=$(evt.target).parent().parent().parent().find('a[href="taskPopup"]');
			var taskKey=target.data('taskkey');
			var objectId=target.data('objectid');
			var object= target.data('object');
			var projectedStartDate=target.data('projectedstartdate');
			//var actualStartDate=target.data('startdate');
			var selectedDate;

			$('#reproject-form').find('[name=object]').val(object);
			$('#reproject-form').find('[name=objectId]').val(objectId);
			$('#reproject-form').find('[name=taskKey]').val(taskKey);
			$("#reprojectTitle").html(target.data('taskname'));
			//-------------------------------------------------------
			selectedDate = new Date();
			var endDatePicker = $('#reproject-form').find('[name=projectedCompletionDate]');
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
			//-------------------------------------------------------

			this.reprojectDateFormValidation();
			$("#REPROJECT_POPUP").data('backdrop','static');
			$("#REPROJECT_POPUP").data('keyboard','false');
			$("#REPROJECT_POPUP").modal("show");
		},

		saveReprojectedDate : function(){
			var self=this;

			var postData = {};
			if ($('#reproject-form').validate().form()){
				var unindexed_array = $('#reproject-form').serializeArray();
				$.map(unindexed_array, function(n, i){
					var value=n['value'];
					var name=n['name'];
					postData[name]=value;
				});
				console.log(postData);

				$.ajax({
					dataType: 'json',
					contentType: "application/json",
					type: "POST",
					url: app.context()+ '/closing/updateProjectedDate',
					async: false,
					data: JSON.stringify(postData),
					success: function(res){
						self.refreshClosingSteps();
						$("#formAlertSuccess").show();
						$("#formAlertFailure").hide();
					},
					error: function(res){
						$("#formAlertFailure").show();
						$("#formAlertSuccess").hide();
						$("#REPROJECT_POPUP").modal("hide");
					}
				});

				$('body').removeClass('modal-open');
				$('.modal-backdrop').remove();
			}
		},
		openWorkflowStepShow: function(evt){
			var target=$(evt.target).parent().parent().parent().find('a[href="taskPopup"]');
			var taskKey=target.data('taskkey');
			var objectId=target.data('objectid');
			var object= target.data('object');

			$('#open-step-form').find('[name=object]').val(object);
			$('#open-step-form').find('[name=objectId]').val(objectId);
			$('#open-step-form').find('[name=taskKey]').val(taskKey);
			$("#openWorkflowStep").modal("show");
		},
		deleteWorkflowStepShow: function(evt){
			var target=$(evt.target).parent().parent().parent().find('a[href="taskPopup"]');
			var taskKey=target.data('taskkey');
			var objectId=target.data('objectid');
			var object= target.data('object');

			$('#delete-step-form').find('[name=object]').val(object);
			$('#delete-step-form').find('[name=objectId]').val(objectId);
			$('#delete-step-form').find('[name=taskKey]').val(taskKey);
			$("#deleteWorkflowStep").modal("show");
		},
		openWorkflowStep : function() {
			var self=this;

			var postData = {};
			var unindexed_array = $('#open-step-form').serializeArray();
			$.map(unindexed_array, function(n, i){
				var value=n['value'];
				var name=n['name'];
				postData[name]=value;
			});
			console.log(postData);

			$.ajax({
				dataType: 'json',
				contentType: "application/json",
				type: "POST",
				url: app.context()+ '/closing/step/open',
				async: false,
				data: JSON.stringify(postData),
				success: function(res){
					var popup = $("#openWorkflowStep");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.refreshClosingSteps();
					});
				},
				error: function(res){
					var popup = $("#openWorkflowStep");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.refreshClosingSteps();
					});
				}
			});
		},
		deleteWorkflowStep : function() {
			var self=this;

			var postData = {};
			var unindexed_array = $('#delete-step-form').serializeArray();
			$.map(unindexed_array, function(n, i){
				var value=n['value'];
				var name=n['name'];
				postData[name]=value;
			});
			console.log(postData);

			$.ajax({
				dataType: 'json',
				contentType: "application/json",
				type: "POST",
				url: app.context()+ '/closing/step/delete',
				async: false,
				data: JSON.stringify(postData),
				success: function(res){
					var popup = $("#deleteWorkflowStep");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.refreshClosingSteps();
					});
				},
				error: function(res){
					var popup = $("#deleteWorkflowStep");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.refreshClosingSteps();
					});
				}
			});
		},

		reprojectDateFormValidation: function() {

			var form1 = $('#reproject-form');
			var error1 = $('#formAlertFailure', form1);
			var success1 = $('.alert-success', form1);

			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					comments: {
						required: true
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

		fetchInsuranceQuoteHeaderData : function(){
			var thisPtr=this; 
			$.ajax({
				url:app.context()+ "/insurance/insuranceHeader/"+thisPtr.currentObjectId,
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

		getInsuranceReviewFormData: function(){
			var entries=[];
				$('.insuranceReviewTable').find('#insuranceReviewRow').find('.quoteClass').each(function(){

					var obj={};
					obj.msg=$(this).find("[name='msg']").val();
					obj.id=$(this).find("[name='msg']").attr('id');
					entries.push(obj);
				});
			return entries;

		},
		
//		fetchInsurancePopupData : function(){
//			var thisPtr=this; 
//			$.ajax({
//				url: this.url()+'/task/'+this.currentObject+'/'+this.currentObjectId+'/'+this.currentTaskKey,
//				contentType: 'application/json',
//				dataType:'json',
//				type: 'GET',
//				async: false,
//				success: function(res){
//					thisPtr.popupData=res;
//				},
//				error: function(res){
//					
//				}
//			});
//		},
		
//		submitInsuranceAppSignature : function(){
//			var self = this;
//			
//			$.ajax({
//				url: self.url()+'/process',
//				type:'post',
//				data:self.currentForm.serialize(),
//				async:false,
//				success: function(res){
//					self.currentPopup.modal('hide');
//					self.fetchInsuranceSearch();
//				},
//				error: function(res){
//					self.currentPopup.modal('hide');
//				}
//			});
//		
//		},
		url :function (){
			var gurl=app.context()+ "/closing";
			return gurl;
		},
		calculateRentalDailyPerDiem : function(evt,form)
		{
			var currentForm = $(evt.currentTarget).closest('form');
			if(!currentForm.length){currentForm = form;}
			if(this.currentTaskKey.indexOf('UPLOAD_RENTAL_AGREEMENT')>-1){
				var rent=currentForm.find("[name=rentAmount]").val();
				var t=((rent *12)/365);
			    currentForm.find("input[name=rentalDailyperDiem]").val(t);
				currentForm.find("input[name=rentalDailyperDiem]").formatCurrency({symbol:""});
			}
		},
		saveRentalAgreementTab:function(evt){
			var self = this;
			console.log("saveRentalAgreementTab");
			var currentForm = $(evt.currentTarget).closest("form");
			var formDocument = currentForm.find('input[name=document]');
			var uploadedDocumentId = currentForm.find('input[name=uploadedDocumentId]').val();
			if(formDocument && formDocument.val() == "") {
				if(!uploadedDocumentId){
					currentForm.find('#docRequiredMsg').show();
					return;
				}else{
					formDocument.attr("disabled","disabled");
				}
			}
			var tabId = $(evt.currentTarget).closest(".rentalAgreementNavTab").attr('id');
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			self.model.submitRentalAgreementData(currentForm,{
				success:function(res){
					$.unblockUI();
					self.uploadRentalAgreementAdded = true;

					currentForm.find("input[name=leaseId]").val(res.leaseId);
					formDocument.val("");
					formDocument.removeAttr("disabled");

					var headerEl = $(evt.currentTarget).closest(".modal-body").find(".rentalAgreementNav.active a");
					var headerStr = $(headerEl).html();
					if( headerStr.indexOf("*") != -1)
					{
						$(headerEl).html(headerStr.substring(0, headerStr.length-1));
					}
					
					var propertyUnit = _.find(self.parentView.model.attributes.propertyUnits, function(unit) { return unit.unitId == res.leaseData.unitId }) || "";
					
					self.addNewRentalTab(tabId,propertyUnit,res.leaseData,self.currentObject,self.currentObjectId,self.currentTaskKey,res.subObject);
				},
				error:function(){
					console.log("error");
					$.unblockUI();
					formDocument.removeAttr("disabled");
				}
			})
		},
		showHideImpoundAmount : function(){
			var impounds=$("#impoundTypes select[name='impounds'] option:selected").text().trim();
			if(impounds=="No"){
				$('input[name=impoundAmount]').val(0);
				$('input[id=impoundAmount_currency]').val(0);
				$('#impoundAmount_currency').formatCurrency({symbol:""});
				$('#impoundAmountDiv').hide();
			}else{
				$('#impoundAmountDiv').show();
			}
		},
		
		setDownPayment:function(){
			$('#downPayment').val($('#purchasePriceHUD').val()-$('#loanAmount').val());
			$('#downPayment_currency').val($('#purchasePriceHUD').val()-$('#loanAmount').val());
			$('#downPayment_currency').formatCurrency({symbol:""});
			this.calculateClosingCostTotal();
		},
		
	
		setMaturityDate:function(){
	    	if($('#firstPaymentDueDate').val()!=null && $('#firstPaymentDueDate').val()!=""){
	    		var firstPaymentDueDate = $('#firstPaymentDueDate').val();
	    		var dateSplit = firstPaymentDueDate.split("-");            
	    		objDate = new Date(dateSplit[0] + " " + dateSplit[1] + ", " + dateSplit[2]);
	    		var maturityDateCalc = objDate;
	    		if($('#term').val()!=null && $('#term').val()!=""){
	    			totalmonths = $('#term').val();
	    			years = totalmonths/12;
	    			months = totalmonths%12;
	    			maturityDateCalc = new Date(objDate.getFullYear() + parseInt(years), objDate.getMonth()+ parseInt(months),
	    					objDate.getDate() - 1); 
	    			console.log("maturityDateCalc ::"+maturityDateCalc);
	    		}
	    		var maturityDate = $.datepicker.formatDate('mm-dd-yy', new Date(maturityDateCalc));
    			$('#maturityDate').val(maturityDate);
	    		$("#maturityDate").parent().data({date: maturityDate}).datepicker('update');
    	     }
        },
		showAddTaskModal : function(evt){
			this.currentObjectId=$(evt.target).parent().data('objectid');
			this.currentObject=$(evt.target).parent().data('object');
			
			$('.addTaskForm')[0].reset();
			
			$("#addTaskModal").find("[name=object]").val(this.currentObject);
			$("#addTaskModal").find("[name=objectId]").val(this.currentObjectId);
			//
			 //---
	    	 selectedDate = new Date();
				var endDatePicker = $('.addTaskForm').find('[name=projectedCompletionDate]');
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
	    	 //---
			//
			this.addTaskformValidation();
			this.fetchEmbraceUsers();
			var usersDropdownTemplate = _.template(usersDropdown);
	    	 $('#assignedUsers').html('');
	    	 $('#assignedUsers').html(usersDropdownTemplate({investorName:"",name:'assigneeId',id:'embraceUsers',users:this.allUsers.userResponse,addBlankFirstOption:true,investorId:this.allUsers.investorId,investorName:this.allUsers.investorName}));
		},
		
		fetchEmbraceUsers: function(){
			 var self = this;
			 $.ajax({
					url: app.context()+'/user/fetchAllUsers/'+self.currentObjectId+'/'+self.currentObject,
	                contentType: 'application/json',
	                async : false,
	                dataType:'json',
	                type: 'GET',
	                success: function(res){
	                	self.allUsers=res;
	                },
	                error: function(res){
	                	console.log('Error in fetching all embrace users');
	                }
					
				});
		},
		
		saveTask : function(){
			var unindexed_array = $('.addTaskForm').serializeArray();
			var self=this;
			
			if ($('.addTaskForm').validate().form()){
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Creating Task... </div>'
				});
				$.map(unindexed_array, function(n, i){
					var value=n['value'];
					var name=n['name'];
					self.model.set(name,value);
				});
				
				$.ajax({
	                url: app.context()+'/task/create',
	                contentType: 'application/json',
	                dataType:'json',
	                type: 'POST',
	                data: JSON.stringify(self.model.attributes),
	                success: function(res){
	                    $.unblockUI();
	                    var popup = $("#addTaskModal");
						popup.modal("hide");
						popup.on('hidden.bs.modal', function (e) {
							self.refreshClosingSteps();
						});
	                },
	                error: function(res){
	                	$.unblockUI();
	                	var popup = $("#addTaskModal");
						popup.modal("hide");
						popup.on('hidden.bs.modal', function (e) {
							self.refreshClosingSteps();
						});
	                }
	            });
			}
			
		},

		addTaskformValidation: function() {

			var form1 = $('.addTaskForm');
			var error1 = $('#formAlertFailure', form1);
			var success1 = $('.alert-success', form1);
			var suggestions = $('.has-error', form1);
			suggestions.removeClass('has-error');
			$('.help-block').hide();
			error1.hide();

			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					taskName: {
						required: true
					},
					projectedCompletionDate:{
						required: true
					},
					assigneeId:{
						required: true
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

		
		createDocusignEnvelopeForTask : function(evt){
			debugger;
			var self=this;
			var currentForm;
			var button = $(evt.currentTarget);
			var createEnvelopeRequest = {};
			createEnvelopeRequest.object = button.data('object');
			createEnvelopeRequest.objectId = button.data('objectid');
			createEnvelopeRequest.documentTaskKey = button.data('documenttaskkey');
			createEnvelopeRequest.envelopeTaskKey = button.data('envelopetaskkey');
			createEnvelopeRequest.documentTypes = button.data('docs');
		
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Creating Envelope... </div>'
			});
			if(createEnvelopeRequest.documentTaskKey=="REPAIRS_REQUEST"){
				createEnvelopeRequest.vaultUpload="Yes";
				createEnvelopeRequest.folderCodelistId="176";
				 currentForm=self.$el.find("#uploadformRequestRepairs").find('#uploadAddendum');
				if(currentForm.find("#document").val()==""){
					$.unblockUI();
					$('.envelopeMessage').html('Please attach the document');
					$('.envelopeMessage').css("color", "#b94a48");
					return ;
				}
				self.uploadDocumentsAndCreateEnvelope(currentForm,createEnvelopeRequest);
				return ;
			}else if(createEnvelopeRequest.documentTaskKey=="SELLER_RESPONSE_REPAIRS"){
				createEnvelopeRequest.vaultUpload="Yes";
				createEnvelopeRequest.folderCodelistId="176";
				currentForm=self.$el.find("#uploadSellerForm #uploadSellerRequestForm");
				if(currentForm.find("#document").val()==""){
					$.unblockUI();
					$('.envelopeMessage').html('Please attach the document');
					$('.envelopeMessage').css("color", "#b94a48");
					return ;
				}
				self.uploadDocumentsAndCreateEnvelope(currentForm,createEnvelopeRequest);
				return ;
			}else if(createEnvelopeRequest.documentTaskKey=="UPLOAD_MUTUAL_RELEASE"){
				createEnvelopeRequest.vaultUpload="Yes";
				createEnvelopeRequest.folderCodelistId="641";
				currentForm=self.$el.find("#uploadMutualReleaseFormDiv #uploadMutualReleaseForm");
				if(currentForm.find("#document").val()==""){
					$.unblockUI();
					$('.envelopeMessage').html('Please attach the document');
					$('.envelopeMessage').css("color", "#b94a48");
					return ;
				}
				self.uploadDocumentsAndCreateEnvelope(currentForm,createEnvelopeRequest);
				return ;
			}

			//$('.envelopeMessage').html('Creating Envelope..');
			
			
			$.ajax({
                url: app.context()+'/docusign/envelope/createForTask',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(createEnvelopeRequest),
                success: function(res){
                	$.unblockUI();
                    console.log('successfully created envelope embraceEnvelopeId '+res.embraceEnvelopeId+" docusignEnvelopeId "+res.docusignEnvelopeId+' message '+res.message);
                    console.log('Tag and Send Url is '+res.tagAndSendUrl);
                    $('.envelopeMessage').html('Envelope Created');
                    this.embraceEnvelopeId = res.embraceEnvelopeId;
                    res.envelopeStatus = 'created';
                    self.mutualReleaseEnvelopeStatus = res.envelopeStatus;
                    
	                    var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
				     	self.currentForm.find('.docusignEnvelopeArea').html("");
	                    self.currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));
                	
//                    $.colorbox({href: res.tagAndSendUrl,
//                	  iframe:true,fastIframe:false,title:'Tag and Send Documents for Signature',closeButton:true,width:'100%',height:'100%',
//                	  escKey:false,overlayClose:false});
//                    $('#cboxOverlay').css('z-index',99998);
//                    $('#colorbox').css('z-index',99999);
                },
                error: function(res){
                	$.unblockUI();
                	console.log('failed to create envelope '+res.message);
                	$('.envelopeMessage').html('Envelope Creation Failed');
                }
            });
		},
		openTagAndSendForEnvelope : function(evt){
			var self=this;
			var button = $(evt.currentTarget);
			var embraceEnvelopeId = button.data('envelopeid');
			this.embraceEnvelopeId = embraceEnvelopeId;
			
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Opening Tag & Send View... </div>'
			});

			//$('.envelopeMessage').html('Creating Envelope..');
			$.ajax({
                url: app.context()+'/docusign/envelope/tagAndSendUrl/'+embraceEnvelopeId,
                type: 'GET',
                success: function(res){
                	$.unblockUI();
                    console.log('Tag and Send Url is '+res);
                    if(res=='locked'){
                    	var formData = {};
                        formData.embraceEnvelopeId = self.embraceEnvelopeId;
                        formData.envelopeStatus = res;
                        self.mutualReleaseEnvelopeStatus = formData.envelopeStatus;
                        
                        	 var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
        			     	self.currentForm.find('.docusignEnvelopeArea').html("");
                            self.currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:formData}));
                    	
                        
                        
                    } else {
	                    var tagSendBox = $.colorbox({href: res,
	                	  iframe:true,fastIframe:false,title:'Tag and Send Documents for Signature',closeButton:true,width:'100%',height:'100%',
	                	  escKey:false,overlayClose:false});
	                    $('#cboxOverlay').css('z-index',99998);
	                    $('#colorbox').css('z-index',99999);
	                    
	                    tagSendBox.onCleanup = self.showTagAndSendWarning;
	                    tagSendBox.onClosed = self.refreshEnvelopeStatus;
//	                    tagSendBox.on('cbox_closed', function (e) {
//							self.refreshEnvelopeStatus();
//						});
//	                    tagSendBox.on('cbox_cleanup', function (e) {
//							self.showTagAndSendWarning(e);
//						});
                    }
                },
                error: function(res){
                	$.unblockUI();
                	console.log('failed to get Tag and Send Url of envelope '+res);
                	$('.envelopeMessage').html('Failed to get Tag and Send URL');
                }
            });
		},
		showTagAndSendWarning : function(evt) {
			var self=this;
			alert('triggered');
			$('#optionCloseTagAndSend').modal('show');
			evt.preventDefault();
			evt.stopPropagation();
		},
		refreshEnvelopeStatus : function() {
			var self=this;
			var embraceEnvelopeId = self.embraceEnvelopeId;
			
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Refreshing Envelope Status... </div>'
			});

			//$('.envelopeMessage').html('Creating Envelope..');
			$.ajax({
                url: app.context()+'/docusign/envelope/refreshEnvelopeStatus/'+embraceEnvelopeId,
                type: 'GET',
                success: function(res){
                	$.unblockUI();
                    console.log('Envelope status is '+res);
                    //self.currentForm.find('.envelopeStatus').html(res);
                    var formData = {};
                    formData.embraceEnvelopeId = self.embraceEnvelopeId;
                    formData.envelopeStatus = res;
                    self.mutualReleaseEnvelopeStatus = formData.envelopeStatus;
                    
                    var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
			     	self.currentForm.find('.docusignEnvelopeArea').html("");
                    self.currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:formData}));
                },
                error: function(res){
                	$.unblockUI();
                	console.log('failed to get envelope status '+res);
                	$('.envelopeMessage').html('Failed to get envelope status');
                }
            });
		},
		manualRefreshEnvelopeInfo : function(evt) {
			var self=this;
			var button = $(evt.currentTarget);
			var embraceEnvelopeId = button.data('envelopeid');
			this.embraceEnvelopeId = embraceEnvelopeId;
			this.refreshEnvelopeStatus();
		},
		launchDocusignManagementConsole : function(evt) {
			var self=this;
			var button = $(evt.currentTarget);
			var embraceEnvelopeId = button.data('envelopeid');
			this.embraceEnvelopeId = embraceEnvelopeId;
			
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Opening Docusign Management Console... </div>'
			});

			//$('.envelopeMessage').html('Creating Envelope..');
			$.ajax({
                url: app.context()+'/docusign/envelope/managementConsoleUrl',
                type: 'GET',
                success: function(res){
                	$.unblockUI();
                    console.log('Management Console Url is '+res);
                    var managementConsole = $.colorbox({href: res,
	                	  iframe:true,fastIframe:false,title:'Docusign Management Console - Manage -> Draft -> Complete & Send Previous Envelopes',closeButton:true,width:'100%',height:'100%',
	                	  escKey:false,overlayClose:false});
                    $('#cboxOverlay').css('z-index',99998);
                    $('#colorbox').css('z-index',99999);
                    
                    console.log(managementConsole);
                    managementConsole.onCleanup = self.refreshEnvelopeStatus;
                    /*managementConsole.on('cbox_closed', function (e) {
                    	console.log(e);
						self.refreshEnvelopeStatus();
					});*/
                },
                error: function(res){
                	$.unblockUI();
                	console.log('failed to get Management Console Url of envelope '+res);
                	$('.envelopeMessage').html('Failed to get Management Console URL');
                }
            });
		},
		sendRecipientLink : function (evt) {
			var self=this;
			var button = $(evt.currentTarget);
			var embraceEnvelopeId = button.data('envelopeid');
			this.embraceEnvelopeId = embraceEnvelopeId;
			
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Sending Envelope For Signature... </div>'
			});

			//$('.envelopeMessage').html('Creating Envelope..');
			$.ajax({
                url: app.context()+'/docusign/envelope/sendForSignature/'+embraceEnvelopeId,
                type: 'GET',
                success: function(res){
                	$.unblockUI();
                    console.log('Success sending envelope for signature '+res);
                    //$('.envelopeMessage').html('Sent For Signature');
                },
                error: function(res){
                	$.unblockUI();
                	console.log('failed to send envelope for signature '+res);
                	$('.envelopeMessage').html('Failed to send. Try again.');
                }
            });
		},
		
		sendRentalAgreementMail: function(evt){
			//$('#message-form').modal('show');
			var thisPtr = this;
			
			if(thisPtr.uploadRentalAgreementAdded == false){
				console.log("Pleae save atleast one rental agreement");
				$(evt.currentTarget).closest(".modal").find(".alert-danger").show();
				$(evt.currentTarget).closest(".modal").find(".alert-danger").delay(2000).fadeOut(4000);
				$(evt.currentTarget).closest(".modal").animate({ scrollTop: 0 }, 'slow');
				return;
			}
			
			$("#messageForm")[0].reset();
			_($("#messageForm .form-group")).each(function(error){
				$(error).removeClass('has-error');
			});
			_($("#messageForm .help-block")).each(function(error){
				$(error).remove();
			});
			
			$('#msgformFailure > text').html("");
			
			try {
				var editor = CKEDITOR.instances.editorTextArea;
				console.log($('#editorTextArea'));
			    if (editor) {
			        editor.destroy(true); 
			    }
			} catch(err) {
                console.log("Error in loading editor : err = " + err);
            }
			CKEDITOR.replace('editorTextArea');
			this.showToDropdown();	
			this.fetchSendToList();
			this.fetchTemplateList();
			
			$("#emailPopupTitle").html("Send Rental Agreement");
			
			var val="Rental Agreement";
			var selectedVal=$("#messageTemplateID").find("option:contains("+val+")").val();
			$("#messageTemplateID").val(selectedVal);
			this.getTemplate();
			$(".emailTemplateDiv").hide();
			
			$('.sendToNamesDropDown').select2({
				createSearchChoice:function(term, data) { 
					if(thisPtr.validatemail(term)){
				        if ($(data).filter(function() { 
				            return this.text.localeCompare(term)===0; 
				        }).length===0) 
				        	{return {id:term, text:term};} 
					}
			    },
				multiple: true,
			    data: thisPtr.select2_ary
			});

			$('#message-form').modal('show');	

	   		$(".saveMessageButton").show();
	   		$('#msgformFailure').hide();
		},
		
		fetchSendToList:function(){
	    	 var self=this;
	    	 var objectId=this.propertyModel.objectId;
	    	 var object=this.propertyModel.object;

	    	 var thisPtr=this;
				var allcodesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+'messages/sendToList/'+object+'/'+objectId,
					async : false
				});
				var codes = JSON.parse(allcodesResponseObject.responseText);
				
				var investors = [];
					_(codes.investor).each(function(investor) {
					investors.push({id:investor.emailAddress,text:investor.name});
				});

				var embraceUsers = [];
				_(codes.embraceUsers).each(function(embraceUser) {
					embraceUsers.push({id:embraceUser.emailAddress,text:embraceUser.name});
				});
				
				var vendors = [];
				_(codes.vendors).each(function(vendor) {
					vendors.push({id:vendor.emailAddress,text:vendor.name});
				});
				this.select2_ary = [];
				
				
				if(self.currentTaskKey=="WIRE_INSTRUCTION"){
				    this.select2_ary.push(
					    	{
						        text: 'Investor',
						        children: investors
						    }
					    );
					
				}else{
			    this.select2_ary.push(
			    	{
				        text: 'Investor',
				        children: investors
				       
				    }, {
				        text: 'Embrace Internal Users',
				        children: embraceUsers
				    }, {
				        text: 'Vendors',
				        children: vendors
				    }
			    );
				}
	    	 
	     },
	     
	     fetchTemplateList:function(){
	    	 var self=this;
	    	 var object=this.propertyModel.object;

	    	 var thisPtr=this;
				var allcodesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+'messages/templateList/'+object,
					async : false
				});

				$("#emailTemplateDD").html(_.template( emailTemplates )({elementId:null,codes:JSON.parse(allcodesResponseObject.responseText)}));
	     },
	     
	     ShowEmailPreview : function() {
	    	 var mailToRecipients = $("#mailToRecipients").val();
	    	 var mailCcRecipients = $("#mailCcRecipients").val();
	    	 var mailBccRecipients = $("#mailBccRecipients").val();
	    	 if(mailToRecipients== undefined || mailToRecipients==""){
	    	 		$('#msgformFailure > text').html("Please enter recipients.");
	    			$('#msgformFailure').show();
	    			$('.modal').animate({ scrollTop: 0 }, 'slow');
					$('#msgformFailure').delay(3000).fadeOut(3000);
					return;
	    	 }
	    	 CKEDITOR.instances.editorTextArea.updateElement();
	    	 if($('#messageForm').validate().form()){
		    	 $('#formMessagePreview').modal("show");
		    	 $("#toRecipients").html(mailToRecipients);
		    	 if(mailCcRecipients!= undefined && mailCcRecipients!=""){
		    		 $('#cc_div').show();
		    		 $("#ccRecipients").html(mailCcRecipients);
		    		 console.log("mailCcRecipients :::"+mailCcRecipients);
		    	 }
		    	 if(mailBccRecipients!= undefined && mailBccRecipients!=""){
		    		 $('#bcc_div').show();
		    		 $("#bccRecipients").html(mailBccRecipients);
		    		 console.log("mailBccRecipients :::"+mailBccRecipients);
		    	 }
		    	 var subject = $("#mailSubject").val();
		    	 $("#subject").html(subject);
		    	 var editorTextArea = $("#editorTextArea").val();
		    	 $("#emailPreview").html(editorTextArea);
	    	 }
	     },
	     validatemail : function(email) { 
			    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			    return re.test(email);
		 },
	     showToDropdown: function(){
	    		 $('#messageForm').get(0).reset();
	    		// var $radios = $('input:radio[name=messageType]');
	    	     //$radios.filter('[value=email]').prop('checked', true);
	    	     CKEDITOR.instances.editorTextArea.setData("");
	    	     $('.select2-container').select2('val', '');
	    	     $('#messageForm').find('.form-group').removeClass('has-error');
	    	     $('#messageForm').find('.help-block').remove();
	    		 $(".tomultipledrop").show();
	    		 $(".emailTemplateDiv").show();
	    		 $("#hideCcLabel").show();
	    		 $("#add_cc").show();
	    		 $("#add_bcc").show();
	    		 $("#cc_container_div").hide();
	    		 $("#bcc_container_div").hide();
	    		 $(".saveMessageButton").hide();

	     },
	     ShowCcDropdown : function() {
	    	$("#cc_container_div").show();
 			$("#add_cc").hide();
 			if($("#bcc_container_div").is(":visible") === true){
 				$("#hideCcLabel").hide();
 			}
	     },
	     ShowBccDropdown : function() {
    		$("#bcc_container_div").show();
			$("#add_bcc").hide();
			if($("#cc_container_div").is(":visible") === true){
				$("#hideCcLabel").hide();
			}
	     },
	     getTemplate:function(){
	    	 var self=this;
	    	 var messageTemplateID = $('#messageTemplateID').val();
	    	 var objectId = this.propertyModel.objectId;
	    	 var object=this.propertyModel.object;
	    	 if(messageTemplateID!=""){
		    	 $.ajax({
		    		  type: "GET",
		    		  url: "messages/getEmailTemplate/"+messageTemplateID+'/'+objectId+'/'+object,
		    		  async : false,
		    		  success: function(res){
	//	    		    CKEDITOR.instances['editorTextArea'].setData(msg);
		    			$('#mailSubject').val(res.subject);
		    		    CKEDITOR.instances.editorTextArea.setData(res.fileContent);
		    		    self.mailContent = res.fileContent;
		    		  },
		    		  error:function(){
		    			 $('#msgformFailure').show();
		                 $('#msgformFailure > text').html("Error in fetching email template");
	  					 App.scrollTo($('#msgformFailure'), -200);
		    		  }
		    	});
	    	 }else{
	    		 $('#mailSubject').val("");
	    		 CKEDITOR.instances.editorTextArea.setData("");
	    	 }
	    	 
	     },
	     
	     addMessage:function(){
	    	 	var self=this;
	    	 	var obj={};
	    	 	var objectId=this.propertyModel.objectId;
	    	 	var object=this.propertyModel.object;
	    	 	var form1 = $('#messageForm');
	    	 	var formId = $(form1).data("formid");
	    	 	this.CKupdate();
	    	 	var mailDocument = form1.find('input[name=document]');
	            if(mailDocument && mailDocument.val() == "") {
	            	mailDocument.prop("disabled", true);
	            }
	            //var messageType=form1.find('input[name=messageType]:checked').val();
	            var messageTemplateID = $("#messageTemplateID option:selected").val();
	            obj['messageType']='email';
	            obj['propertyType']=self.propertyType;
	            obj['taskKey']= self.currentTaskKey;
	    	    // var unindexed_array = $('#messageForm').serializeArray();
	    	    obj['formId'] = formId;
	    	   /* $.map(unindexed_array, function(n, i){
	    	    	var value=n['value'];
	    	    	var name=n['name'];
	    	    	obj[name]=value;
	    	    });*/
	    	    
	    	    if(self.currentTaskKey=="FEE_SHEET"||self.currentTaskKey=="WIRE_INSTRUCTION"||self.currentTaskKey=="SEND_MUTUAL_RELEASE"
	    	    	||self.currentTaskKey=="EXECUTED_MUTUAL_RELEASE"){
	    	    	obj['documentId'] = self.docIdToBeMailed;
	    	    }
	    	    
	    		if($('#messageForm').validate().form()){
	    			$.blockUI({
			     		baseZ: 999999,
			     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			     	});

	    	    	var form = $('#messageForm');
	    	    	form.attr("enctype","multipart/form-data");
	    	    	form.ajaxSubmit({
		                url: app.context()+'messages/createMessage/'+objectId+'/'+object,
		                contentType: 'application/json',
		                async:true,
		                dataType:'text',
		                type: 'POST',
		                data: obj,
		                success: function(res){
		                	$.unblockUI();
	                		$("#message-form").modal('hide');
		                	$('#message-form').on('hidden.bs.modal',function() {
		                		var editor = CKEDITOR.instances.editorTextArea;
		            			// console.log($('#editorTextArea'));
	            			    if (editor) {
	            			        editor.destroy(true); 
	            			    }
	 							//self.fetchMessages();
	 						});
		                	if(self.currentTaskKey=="UPLOAD_RENTAL_AGREEMENT"){
		                		$('.rentalAgreementNotification').show().delay(2000).fadeOut(2000);
		                	}else if(self.currentTaskKey=="MORTGAGEE_CLAUSE"){
		                		$('.mortgageMailNotification').show().delay(2000).fadeOut(2000);
		                	}else if(self.currentTaskKey=="FEE_SHEET"){
		                		$('.feeSheetMailNotification').show().delay(2000).fadeOut(2000);
		                	}else if(self.currentTaskKey=="INSURANCE_QUOTE_REQUEST"){
		                		$('.mailNotification').show().delay(2000).fadeOut(2000);
		                	}else if(self.currentTaskKey=="WIRE_INSTRUCTION"){
		                		$('.wireMailNotification').show().delay(2000).fadeOut(2000);
		                	}else if(self.currentTaskKey=="SEND_MUTUAL_RELEASE"){
		                		$('.sendMutualReleaseMailNotification').show().delay(2000).fadeOut(2000);
		                	}else if(self.currentTaskKey=="EXECUTED_MUTUAL_RELEASE"){
		                		$('.executedMutualReleaseMailNotification').show().delay(2000).fadeOut(2000);
		                	}
		                	
		                },
		                error: function(res){
		                	$.unblockUI();
		                	$('#msgformFailure').show();
		                	$('#msgformFailure > text').html(JSON.parse(res.responseText).message);
	    					App.scrollTo($('#msgformFailure'), -200);
	    					$('#msgformFailure').delay(2000).fadeOut(2000);
	    					//self.enableFileUpload();
		                }
		            });
	     		}
	     },
	     CKupdate:function(){
	    	 CKEDITOR.instances.editorTextArea.updateElement();
//	    	 for (instance in CKEDITOR.instances) {
//          CKEDITOR.instances[instance].updateElement();
//	    	 }
	     },
	     uploadDocumentsAndCreateEnvelope:function(form,UploadDocumentRequest){
	    	self=this;
	    	form.attr("enctype","multipart/form-data");
        	form.ajaxSubmit({
    	        url: app.context()+'/document/documentsUpload',
    	        async:true,
    	        data: UploadDocumentRequest,
    	        success: function(res){
                	console.log("success");
                	$.unblockUI();
                    console.log('successfully created envelope embraceEnvelopeId '+res.embraceEnvelopeId+" docusignEnvelopeId "+res.docusignEnvelopeId+' message '+res.message);
                    console.log('Tag and Send Url is '+res.tagAndSendUrl);
                    $('.envelopeMessage').html('Envelope Created');
                    this.embraceEnvelopeId = res.embraceEnvelopeId;
                    
                	self.refreshEnvelopeStatusBlocking(res.embraceEnvelopeId,self.form);
					//self.handleCounterType();
					//$('#optionTagAndSend').modal('show');
					self.handleTagAndSend(res.embraceEnvelopeId);
                    
                /*    if(!jQuery.isEmptyObject(res.embraceEnvelopeId)&&UploadDocumentRequest.documentTaskKey=="REPAIRS_REQUEST"){
                    	var currentForm=self.$el.find("#uploadformRequestRepairs").find('#uploadAddendum');
                    	currentForm.remove();
					}
                    
                    res.envelopeStatus = 'created';

                    if(UploadDocumentRequest.documentTaskKey=="REPAIRS_REQUEST"){
			    		self.requestForRepairsView.populateDocusignArea(res);
                    }else{
	                    var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
				     	self.currentForm.find('.docusignEnvelopeArea').html("");
	                    self.currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));
                	}
                	*/
                },
                error: function(res){
                	console.log("fail");
                	$.unblockUI();
                	console.log('failed to create envelope '+res.message);
                	$('.envelopeMessage').html('Envelope Creation Failed');
                	
                }
    	    });

	     },
	     
			refreshEnvelopeStatusBlocking : function(embraceEnvelopeId,currentForm) {
				var self=this;

				//$('.envelopeMessage').html('Creating Envelope..');
				$.ajax({
					url: app.context()+'/docusign/envelope/refreshEnvelopeStatusClosing/'+embraceEnvelopeId,
					type: 'GET',
					async:false,
					success: function(res){
						console.log('Envelope status is '+res);
						//self.currentForm.find('.envelopeStatus').html(res);
						var formData = {};
						formData.embraceEnvelopeId = embraceEnvelopeId;
						formData.envelopeStatus = res.envelopeStatus;
						self.mutualReleaseEnvelopeStatus = formData.envelopeStatus;
						
						self.envelopeStatus=res.envelopeStatus;
						var resobj={};
						resobj.embraceEnvelopeId=embraceEnvelopeId;
						resobj.envelopeStatus=res.envelopeStatus;
						var currTaskKey=self.currentForm.find("#taskKey").val();
						
						 if(!jQuery.isEmptyObject(formData.embraceEnvelopeId)&&res=="created"&&currTaskKey=="REPAIRS_REQUEST"){
		                    	var currentForm=self.$el.find("#uploadformRequestRepairs").find('#uploadAddendum');
		                    	currentForm.remove();
							}
						 if(!jQuery.isEmptyObject(formData.embraceEnvelopeId)&&res=="created"&&currTaskKey=="SELLER_RESPONSE_REPAIRS"){
		                    	var currentForm=self.$el.find("#uploadSellerForm").find('#uploadSellerRequestForm');
		                    	currentForm.remove();
							}
						 if(!jQuery.isEmptyObject(formData.embraceEnvelopeId)&&res=="created"&&currTaskKey=="UPLOAD_MUTUAL_RELEASE"){
		                    	var currentForm=self.$el.find("#uploadMutualReleaseFormDiv").find('#uploadMutualReleaseForm');
		                    	currentForm.remove();
							}
						 
						 
						   if(currTaskKey=="REPAIRS_REQUEST"){
					    		self.requestForRepairsView.populateDocusignArea(res);
		                    }else if(currTaskKey=="SELLER_RESPONSE_REPAIRS"){
					    		self.sellerResponseForRepairsView.populateDocusignArea(res);
		                    }else if(currTaskKey=="UPLOAD_MUTUAL_RELEASE"){
				 		    	if(!res. embraceEnvelopeId){
				 		    		var uploadTemplate=_.template(uploadFormMutualRelease);
				 			    	self.$el.find("#uploadMutualReleaseFormDiv").html(uploadTemplate);
				 		    	} else {
				 		    		self.$el.find("#uploadMutualReleaseFormDiv").remove();
				 		    	}
				 		    	res.app=app;
				 	     		var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
				 		     	res.documentTaskKey = 'UPLOAD_MUTUAL_RELEASE';
				 		     	res.envelopeTaskKey = 'UPLOAD_MUTUAL_RELEASE';
				 		     	res.documentTypes = 'Mutual Release';//to decide
				 		     	self.embraceEnvelopeId = res.embraceEnvelopeId;
				 		     	self.$el.find('.docusignEnvelopeArea').html("");
				 		     	self.$el.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));
				    		 }
		                    else{
						var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
						formData.app=app;
						currentForm.find('.docusignEnvelopeArea').html("");
						currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:formData}));
		                    }
					},
					error: function(res){
						console.log('failed to get envelope status '+res);
						currentForm.find('.envelopeMessage').html('Failed to get envelope status');
					}
				});
			},
			
			handleTagAndSend : function(embraceEnvelopeId) {
				var self=this;
				this.embraceEnvelopeId = embraceEnvelopeId;
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Opening Tag & Send View... </div>'
				});

				

				//$('.envelopeMessage').html('Creating Envelope..');
				$.ajax({
					url: app.context()+'/docusign/envelope/tagAndSendUrl/'+embraceEnvelopeId,
					type: 'GET',
					async:false,
					success: function(res){
						$.unblockUI();
						console.log('Tag and Send Url is '+res);
						if(res=='locked'){
							var formData = {};
							formData.embraceEnvelopeId = self.embraceEnvelopeId;
							formData.envelopeStatus = res;
							self.mutualReleaseEnvelopeStatus = res;
							var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
							self.currentForm.find('.docusignEnvelopeArea').html("");
							formData.app = app;
							self.currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:formData}));
						} else {
							var tagSendBox = $.colorbox({href: res,
								iframe:true,fastIframe:false,title:'Tag and Send Documents for Signature',closeButton:true,width:'100%',height:'100%',
								escKey:false,overlayClose:false});
							$('#cboxOverlay').css('z-index',99998);
							$('#colorbox').css('z-index',99999);

							$('#optionTagAndSend').modal('hide');
							$('#cboxClose').unbind('click',self.mgmtConsoleCloseHandler);
							$('#cboxClose').unbind('click',self.tagAndSendCloseHandler);
							//$('#cboxClose').unbind('click',self.reviewPACloseHandler);
							$('#cboxClose').on('click', {self: self}, self.tagAndSendCloseHandler);
							//tagSendBox.onCleanup = self.showTagAndSendWarning;
//							tagSendBox.onClosed = self.refreshEnvelopeStatus(embraceEnvelopeId,self.currentForm);
//							tagSendBox.on('cbox_closed', function (e) {
//							alert('closed');
//							self.refreshEnvelopeStatus();
//							});
//							tagSendBox.on('cbox_cleanup', function (e) {
//							self.showTagAndSendWarning(e);
//							});
						}
					},
					error: function(res){
						$.unblockUI();
						console.log('failed to get Tag and Send Url of envelope '+res);
						self.currentForm.find('.envelopeMessage').html('Failed to get Tag and Send URL');
					}
				});
			},
			tagAndSendCloseHandler : function(evt) {
				console.log('Closing Tag and Send popup');
				var self = evt.data.self;
				console.log(self);
				self.refreshEnvelopeStatusBlocking(self.embraceEnvelopeId,self.currentForm);
				if(self.envelopeStatus == 'sent') {
					self.handleSendRecipientLink();
				}
			},
			mgmtConsoleCloseHandler : function(evt) {
				console.log('Closing management console popup');
				var self = evt.data.self;
				console.log(self);
				self.refreshEnvelopeStatusBlocking(self.embraceEnvelopeId,self.currentForm);
			},
			handleSendRecipientLink : function() {
				var self=this;
				var embraceEnvelopeId = self.embraceEnvelopeId;
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Sending Envelope For Signature... </div>'
				});

				//$('.envelopeMessage').html('Creating Envelope..');
				$.ajax({
					url: app.context()+'/docusign/envelope/sendForRBASignature/'+embraceEnvelopeId,
					type: 'GET',
					async:true,
					success: function(res){
						$.unblockUI();
						console.log('Success sending envelope for signature '+res);
						self.currentForm.find('.envelopeMessage').html('Sent For Signature');
						self.refreshEnvelopeStatus(embraceEnvelopeId,self.currentForm);

					},
					error: function(res){
						$.unblockUI();
						console.log('failed to send envelope for signature '+res);
						self.currentForm.find('.envelopeMessage').html('Failed to send. Try again.');
					}
				});
			},
	     
	     showHideHomeWarrantyDetails: function(){
	    	 var isRequired=$('input[name=warrantyRequired]:checked').val();
				if(isRequired=='Y') {
					$('.warrantyDetails').show();
					$('.warrantyDetails').find("input").prop("disabled",false);
				} else {
					$('.warrantyDetails').hide();
					$('.warrantyDetails').find("input").prop("disabled","disabled");
				}
 	     },
 	    sendMortgageInfoMail:function(evt){
 	    	//$('#message-form').modal('show');
			var thisPtr = this;
			
			var mailTemplate=_.template(mailSendTemplate);
			$('#renderSendToMailTemplate').html("");
			$('#renderSendToMailTemplate').html(mailTemplate);
			
			var loanNumber = $(evt.currentTarget).closest(".modal").find('input[name=loanNumber]').val();
			var mortgageeClause = $(evt.currentTarget).closest(".modal").find('textarea[name=mortgageeClause]').val();
			
			if(thisPtr.currentTaskKey=="MORTGAGEE_CLAUSE"){
				if(jQuery.isEmptyObject(loanNumber) || jQuery.isEmptyObject(mortgageeClause)){
					$(evt.currentTarget).closest(".modal").find(".mortgageMailError").show();
					$(evt.currentTarget).closest(".modal").find(".mortgageMailError").delay(2000).fadeOut(4000);
					$(evt.currentTarget).closest(".modal").animate({ scrollTop: 0 }, 'slow');
					return;
				}
			}else{
				//This is for Insurance Vendor Quotes Step
				//here condition is AND and error message is different
				if(jQuery.isEmptyObject(loanNumber) && jQuery.isEmptyObject(mortgageeClause)){
					$(evt.currentTarget).closest(".modal").find(".mailError").show();
					$(evt.currentTarget).closest(".modal").find(".mailError").delay(2000).fadeOut(4000);
					$(evt.currentTarget).closest(".modal").animate({ scrollTop: 0 }, 'slow');
					return;
				}
			}
			
			$("#messageForm")[0].reset();
			_($("#messageForm .form-group")).each(function(error){
				$(error).removeClass('has-error');
			});
			_($("#messageForm .help-block")).each(function(error){
				$(error).remove();
			});
			
			$('#msgformFailure > text').html("");
			
			try {
				var editor = CKEDITOR.instances.editorTextArea;
				console.log($('#editorTextArea'));
			    if (editor) {
			        editor.destroy(true); 
			    }
			} catch(err) {
                console.log("Error in loading editor : err = " + err);
            }
			CKEDITOR.replace('editorTextArea');
			this.showToDropdown();	
			this.fetchSendToList();
			this.fetchTemplateList();
			
			$("#emailPopupTitle").html("Send Mortgagee Information");
			
			var val="Mortgagee Clause";
			var selectedVal=$("#messageTemplateID").find("option:contains("+val+")").val();
			$("#messageTemplateID").val(selectedVal);
			this.getTemplate();
			$(".emailTemplateDiv").hide();
			var emailContent = thisPtr.mailContent;
			emailContent = emailContent.replace("loanNumber", loanNumber);
			emailContent = emailContent.replace("mortgageeClause", mortgageeClause);
			CKEDITOR.instances.editorTextArea.setData(emailContent);
			
			
			$('.sendToNamesDropDown').select2({
				createSearchChoice:function(term, data) { 
					if(thisPtr.validatemail(term)){
				        if ($(data).filter(function() { 
				            return this.text.localeCompare(term)===0; 
				        }).length===0) 
				        	{return {id:term, text:term};} 
					}
			    },
				multiple: true,
			    data: thisPtr.select2_ary
			});

			$('#message-form').modal('show');	

	   		$(".saveMessageButton").show();
	   		$('#msgformFailure').hide();
 	    },
 	    sendFeeSheetMail:function(evt){
	    	//$('#message-form').modal('show');
			var thisPtr = this;
			var documentId = thisPtr.docIdToBeMailed;
			
			var document = $(evt.currentTarget).closest(".modal").find('input[name=document]');
			if(document && document.val() == ""){
				if(!jQuery.isEmptyObject(documentId)){
					$("#messageForm input[name=documentId]").val(documentId);
				}else{
					$(evt.currentTarget).closest(".modal").find(".alert-danger").show();
					$(evt.currentTarget).closest(".modal").find(".alert-danger").delay(2000).fadeOut(4000);
					$(evt.currentTarget).closest(".modal").animate({ scrollTop: 0 }, 'slow');
					return;
				}
			}else{
				$(evt.currentTarget).closest(".modal").find(".alert-danger").show();
				$(evt.currentTarget).closest(".modal").find(".alert-danger").delay(2000).fadeOut(4000);
				$(evt.currentTarget).closest(".modal").animate({ scrollTop: 0 }, 'slow');
				return;
			}
			
			$("#messageForm")[0].reset();
			_($("#messageForm .form-group")).each(function(error){
				$(error).removeClass('has-error');
			});
			_($("#messageForm .help-block")).each(function(error){
				$(error).remove();
			});
			
			$('#msgformFailure > text').html("");
			
			try {
				var editor = CKEDITOR.instances.editorTextArea;
				console.log($('#editorTextArea'));
			    if (editor) {
			        editor.destroy(true); 
			    }
			} catch(err) {
               console.log("Error in loading editor : err = " + err);
           }
			CKEDITOR.replace('editorTextArea');
			this.showToDropdown();	
			this.fetchSendToList();
			this.fetchTemplateList();
			
			$("#emailPopupTitle").html("Send Fee Sheet");
			
			var val="Fee Sheet";
			var selectedVal=$("#messageTemplateID").find("option:contains("+val+")").val();
			$("#messageTemplateID").val(selectedVal);
			this.getTemplate();
			$(".emailTemplateDiv").hide();

			$('.sendToNamesDropDown').select2({
				createSearchChoice:function(term, data) { 
					if(thisPtr.validatemail(term)){
				        if ($(data).filter(function() { 
				            return this.text.localeCompare(term)===0; 
				        }).length===0) 
				        	{return {id:term, text:term};} 
					}
			    },
				multiple: true,
			    data: thisPtr.select2_ary
			});

			$('#message-form').modal('show');	

	   		$(".saveMessageButton").show();
	   		$('#msgformFailure').hide();
	    },
	    
	    sendWireInstructionMail:function(evt){
	    	//$('#message-form').modal('show');
			var thisPtr = this;
			var documentId = thisPtr.docIdToBeMailed;
			
			var document = $(evt.currentTarget).closest(".modal").find('input[name=document]');
			if(document && document.val() == ""){
				if(!jQuery.isEmptyObject(documentId)){
					$("#messageForm input[name=documentId]").val(documentId);
				}else{
					$(evt.currentTarget).closest(".modal").find(".alert-danger").show();
					$(evt.currentTarget).closest(".modal").find(".alert-danger").delay(2000).fadeOut(4000);
					$(evt.currentTarget).closest(".modal").animate({ scrollTop: 0 }, 'slow');
					return;
				}
			}else{
				$(evt.currentTarget).closest(".modal").find(".alert-danger").show();
				$(evt.currentTarget).closest(".modal").find(".alert-danger").delay(2000).fadeOut(4000);
				$(evt.currentTarget).closest(".modal").animate({ scrollTop: 0 }, 'slow');
				return;
			}
			
			$("#messageForm")[0].reset();
			_($("#messageForm .form-group")).each(function(error){
				$(error).removeClass('has-error');
			});
			_($("#messageForm .help-block")).each(function(error){
				$(error).remove();
			});
			
			$('#msgformFailure > text').html("");
			
			try {
				var editor = CKEDITOR.instances.editorTextArea;
				console.log($('#editorTextArea'));
			    if (editor) {
			        editor.destroy(true); 
			    }
			} catch(err) {
               console.log("Error in loading editor : err = " + err);
           }
			CKEDITOR.replace('editorTextArea');
			this.showToDropdown();	
			this.fetchSendToList();
			this.fetchTemplateList();
			
			$("#emailPopupTitle").html("Send Wire Instruction");
			
			var val="Wire Instruction";
			var selectedVal=$("#messageTemplateID").find("option:contains("+val+")").val();
			$("#messageTemplateID").val(selectedVal);
			this.getTemplate();
			$(".emailTemplateDiv").hide();

			$('.sendToNamesDropDown').select2({
				createSearchChoice:function(term, data) { 
					if(thisPtr.validatemail(term)){
				        if ($(data).filter(function() { 
				            return this.text.localeCompare(term)===0; 
				        }).length===0) 
				        	{return {id:term, text:term};} 
					}
			    },
				multiple: true,
			    data: thisPtr.select2_ary
			});

			$('#message-form').modal('show');	

	   		$(".saveMessageButton").show();
	   		$('#msgformFailure').hide();
	    },
	    showCancelClosing:function(){
	    	$('#cancelClosingDiv').html("");
	    	$('#cancelClosingDiv').html(_.template(cancelClosingTemplate));
			if(!this.cancellationReasonsView) {
				this.cancellationReasonsView = new codesView({codeGroup:'CANC_REASON'});
			}
			this.cancellationReasonsView.render({el:$('#cancellationReasonTypes'),codeParamName:"cancellationReason"});
			this.getCancellationSubReasons();
			this.cancelClosingValidation();
//			ComponentsPickers.init();
			$('#cancelClosing').modal('show');
	    },
	    getCancellationSubReasons:function(evt){
	    	var self = this;
	    	var cancellationReason=$("select[name=cancellationReason] option:selected").text().trim();
	    	var cancellationReasonId=$("select[name=cancellationReason] option:selected").val();
	    	var codeGroup = 'CANC_SUB_REA';
	    	if(cancellationReason=='Inspection - Safety Issue' || cancellationReason=='Inspection - Increased Rehab Cost'
	    		|| cancellationReason=='Inspection - Investor Expectations Not Met') {
		    	$.ajax({
	                url: app.context()+ "/code/getAll/"+codeGroup+'/'+cancellationReasonId,
					dataType:'json',
	                type: 'GET',
	                async:false,
	                success: function(res){
	                	self.cancellationSubReasonsObject =res;
	               },
	                error: function(res){
	                }
				});
		    	$('#cancellationSubReasonsDiv').html(_.template(cancellationSubReasonsTemplate)({codelists:self.cancellationSubReasonsObject}));
		    	$('#cancellationSubReasonsDiv').show();
	    	}else{
	    		$('#cancellationSubReasonsDiv').html("");
	    		$('#cancellationSubReasonsDiv').hide();
	    	}
	    },
	    
	    showResponsiblePersonRadios: function(){

	    	if($("[name=repairRequired]:checked").val()=="RepairsRequired"){
	    		$('.repairedBy').show();
	    		if($("[name=repairedBy]:checked").val()=="Buyer"){
		    		$('.isFundsReserved').show();
		    		if($("[name=isFundsReserved]:checked").val()=="Y"){
			    		$('.escrowDepositDiv').show();
			    	}
		    	}
	    	}
	    	else{
	    		$('.repairedBy').hide();
	    		$('.isFundsReserved').hide();
	    		$('.escrowDepositDiv').hide();
	    	}
	    },
	    
	    showFundsReceivedRadios: function(){

	    	if($("[name=repairedBy]:checked").val()=="Buyer"){
	    		$('.isFundsReserved').show();
	    		if($("[name=isFundsReserved]:checked").val()=="Y"){
		    		$('.escrowDepositDiv').show();
		    	}
	    	}
	    	else{
	    		$('.isFundsReserved').hide();
	    		$('.escrowDepositDiv').hide();
	    	}
	    },
	    
	    showEscrowDepositField: function(){
	    	if($("[name=isFundsReserved]:checked").val()=="Y"){
	    		$('.escrowDepositDiv').show();
	    	}
	    	else{
	    		$('.escrowDepositDiv').hide();
	    	}
	    },
	    
	    mailMutualRelease: function() {
			/*console.log("Hi");
			var mailTemplate=_.template(mailSendTemplate);
			this.$el.find('#SEND_MUTUAL_RELEASE_POPUP_1 #mailMutualReleaseDiv').html("");
			this.$el.find('#SEND_MUTUAL_RELEASE_POPUP_1 #mailMutualReleaseDiv').html(mailTemplate);
			$('#message-form').modal('show');	
			*/

			//$('#message-form').modal('show');
			var thisPtr = this;
			
			/*if(thisPtr.uploadRentalAgreementAdded == false){
				console.log("Pleae save atleast one rental agreement");
				$(evt.currentTarget).closest(".modal").find(".alert-danger").show();
				$(evt.currentTarget).closest(".modal").find(".alert-danger").delay(2000).fadeOut(4000);
				$(evt.currentTarget).closest(".modal").animate({ scrollTop: 0 }, 'slow');
				return;
			}*/
			
			//Attach document
			var documentId = thisPtr.docIdToBeMailed;
			
			/*var document = $(evt.currentTarget).closest(".modal").find('input[name=document]');
			if(document && document.val() == ""){
				if(!jQuery.isEmptyObject(documentId)){
					$("#messageForm input[name=documentId]").val(documentId);
				}else{
					$(evt.currentTarget).closest(".modal").find(".alert-danger").show();
					$(evt.currentTarget).closest(".modal").find(".alert-danger").delay(2000).fadeOut(4000);
					$(evt.currentTarget).closest(".modal").animate({ scrollTop: 0 }, 'slow');
					return;
				}
			}else{
				$(evt.currentTarget).closest(".modal").find(".alert-danger").show();
				$(evt.currentTarget).closest(".modal").find(".alert-danger").delay(2000).fadeOut(4000);
				$(evt.currentTarget).closest(".modal").animate({ scrollTop: 0 }, 'slow');
				return;
			}*/
			
			if(!jQuery.isEmptyObject(documentId)){
				$("#messageForm input[name=documentId]").val(documentId);
			}else{
				$(evt.currentTarget).closest(".modal").find(".alert-danger").show();
				$(evt.currentTarget).closest(".modal").find(".alert-danger").delay(2000).fadeOut(4000);
				$(evt.currentTarget).closest(".modal").animate({ scrollTop: 0 }, 'slow');
				return;
			}
			
			$("#messageForm")[0].reset();
			_($("#messageForm .form-group")).each(function(error){
				$(error).removeClass('has-error');
			});
			_($("#messageForm .help-block")).each(function(error){
				$(error).remove();
			});
			
			$('#msgformFailure > text').html("");
			
			try {
				var editor = CKEDITOR.instances.editorTextArea;
				console.log($('#editorTextArea'));
			    if (editor) {
			        editor.destroy(true); 
			    }
			} catch(err) {
                console.log("Error in loading editor : err = " + err);
            }
			CKEDITOR.replace('editorTextArea');
			this.showToDropdown();	
			//this.fetchSendToList();
			this.fetchSellerAgentData();
			this.fetchTemplateList();
			
			$("#emailPopupTitle").html("Send Mutual Release Document");
			
			var val="Mutual Release";
			var selectedVal=$("#messageTemplateID option").filter(function(index) { return $(this).text().trim() === "Mutual Release"; });
			$("#messageTemplateID").val(selectedVal.val());
			this.getTemplate();
			$(".emailTemplateDiv").hide();
			
			$('.sendToNamesDropDown').select2({
				createSearchChoice:function(term, data) { 
					if(thisPtr.validatemail(term)){
				        if ($(data).filter(function() { 
				            return this.text.localeCompare(term)===0; 
				        }).length===0) 
				        	{return {id:term, text:term};} 
					}
			    },
				multiple: true,
			    data: thisPtr.select2_ary
			});

			$('#message-form').modal('show');	

	   		$(".saveMessageButton").show();
	   		$('#msgformFailure').hide();
		
		},
		
		fetchSellerAgentData:function(){
			 var self = this;
			 var investmentId = self.propertyModel.objectId;
			 var allcodesResponseObject = $.ajax({
					url: app.context()+'/closing/getSellerAgentData/'+investmentId,
	                contentType: 'application/json',
	                async : false,
	                dataType:'json',
	                type: 'GET'					
				});
			 var codes = JSON.parse(allcodesResponseObject.responseText); 
			 
			 var seller = [];
			 seller.push({id:codes.agentEmail,text:codes.agentName});
			 
			 this.select2_ary = [];
			 
			 if(self.currentTaskKey=="SEND_MUTUAL_RELEASE"){
			    this.select2_ary.push(
				    	{
					        text: 'Seller Agent',
					        children: seller
					    }
				    );
			}
		 },
		 
		 mailExecutedMutualRelease:function(evt){
		    	//$('#message-form').modal('show');
				var thisPtr = this;
				var documentId = thisPtr.docIdToBeMailed;
				
				var document = $(evt.currentTarget).closest(".modal").find('input[name=document]');
				if(!jQuery.isEmptyObject(documentId)){
					$("#messageForm input[name=documentId]").val(documentId);
				}else{
					return;
				}
				
				$("#messageForm")[0].reset();
				_($("#messageForm .form-group")).each(function(error){
					$(error).removeClass('has-error');
				});
				_($("#messageForm .help-block")).each(function(error){
					$(error).remove();
				});
				
				$('#msgformFailure > text').html("");
				
				try {
					var editor = CKEDITOR.instances.editorTextArea;
					console.log($('#editorTextArea'));
				    if (editor) {
				        editor.destroy(true); 
				    }
				} catch(err) {
	               console.log("Error in loading editor : err = " + err);
	           }
				CKEDITOR.replace('editorTextArea');
				this.showToDropdown();	
				this.fetchSendToList();
				this.fetchTemplateList();
				
				$("#emailPopupTitle").html("Send Executed Mutual Release");
				
				var val="Executed Mutual Release";
				var selectedVal=$("#messageTemplateID").find("option:contains("+val+")").val();
				$("#messageTemplateID").val(selectedVal);
				this.getTemplate();
				$(".emailTemplateDiv").hide();

				$('.sendToNamesDropDown').select2({
					createSearchChoice:function(term, data) { 
						if(thisPtr.validatemail(term)){
					        if ($(data).filter(function() { 
					            return this.text.localeCompare(term)===0; 
					        }).length===0) 
					        	{return {id:term, text:term};} 
						}
				    },
					multiple: true,
				    data: thisPtr.select2_ary
				});

				$('#message-form').modal('show');	

		   		$(".saveMessageButton").show();
		   		$('#msgformFailure').hide();
		  }
	});
	return ClosingStepsView;
});
