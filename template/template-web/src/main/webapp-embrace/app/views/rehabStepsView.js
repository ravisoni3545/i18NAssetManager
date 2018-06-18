define(["backbone","app","text!templates/rehabSteps.html","models/rehabStepsModel",
        "collections/rehabStepsCollection","views/codesView","text!templates/rehabTaskPopups.html","text!templates/propertyReInspectionModal.html",
        "text!templates/propertyInspectionModal.html","views/propertyInspectionIlmView","views/propertyInspectionInvestorView",
        "views/requestForRepairsView","views/sellerResponseForRepairsView","views/investorResponseForRepairsView",
        "views/huUpdatedRehabQuoteView","views/documentPreviewView","text!templates/messagesListForTask.html","text!templates/documentListForTask.html", "text!templates/usersDropdown.html", "text!templates/docusignEnvelope.html"],
        function(Backbone,app,rehabStepsPage, rehabStepsModel,rehabStepsCollection,codesView,taskPopupsPage,propertyReInspectionModal,
        		propertyInspectionModal,propertyInspectionIlm,propertyInspectionInvestor,
        		requestForRepairsView,sellerResponseForRepairsView,investorResponseForRepairsView,
        		huUpdatedRehabQuoteView,documentPreviewView,messageForTaskPage,documentForTaskPage,usersDropdown,docusignEnvelopeTemplate){


	var RehabStepsView = Backbone.View.extend( {
		initialize: function(){
		},

		model : new rehabStepsModel(),
		currentObject:null,
		currentObjectId:null,
		currentTaskKey:null,
		currentTaskStatus:null,
		el:"#rehabStepsTab",
		collection:new rehabStepsCollection(),

		events          : {
			"click a[href='taskPopup']":"showTaskModal",
			"click button[id$=PopupRehabSubmitButton]":"submitRehabPopupForm",
			'click #showOpenClosingToggleButton':'showOpenClosingToggle',
			'click #reprojectDate':'showReprojectModal',
			'click #reProjectPopupSubmit':'saveReprojectedDate',
			'click #deleteStep':'deleteWorkflowStepShow',
			'click #deleteStepConfirmationButton':'deleteWorkflowStep',
			'click #openStepConfirmationButton':'openWorkflowStep',
			'click #openStep':'openWorkflowStepShow',
			"click button[id$=PopupSubmitButton]":"submitClosingPopupForm",
			'hidden.bs.modal .with-popover': 'bsModalHide',
			'click #addTaskPopup':'showAddTaskModal',
			'click #saveTaskButton':'saveTask',
			'click .createEnvelopeButton' : 'createDocusignEnvelopeForTask',
			'click .tagAndSendEnvelopeButton' : 'openTagAndSendForEnvelope',
			'click .updateEnvelopeInfoButton' : 'manualRefreshEnvelopeInfo',
			'click .launchManagementConsole' : 'launchDocusignManagementConsole',
			'click .sendRecipientLinkButton' : 'sendRecipientLink'


		},
		excludedAttrs:['repairRequired','appraisalRequired','reinspectionRequired'],
		currencyAttrs:['inspectionFee','utilitiesActivationFee'],
		milestoneTasksWithMandatoryDocument:['INSURANCE_DECLARATION','TITLE_RECEIVED','TAX_CERTIFICATE'],

		render : function (options) {
			if(options.parentView) {
				this.parentView = options.parentView;
			}
			if(this.parentView) {
				this.fetchRehabStepsData(this.parentView.rehabId);
			}

			if(!app.documentPreview){
				app.documentPreview=new documentPreviewView();
			}

			this.template = _.template( rehabStepsPage );
			this.$el.html("");
			this.$el.html(this.template({rehabStepsData:this.collection.toJSON(),object:this.object,objectId:this.objectId,app:app}));
			var popupsTemplate = _.template( taskPopupsPage );
			$('#taskPopups').html("");
			$('#taskPopups').html(popupsTemplate());
			app.currencyFormatter();
			this.addFormValidations();
			this.showOpenClosingToggle();
			ComponentsPickers.init();


			this.initializeTooltipEffects();

			return this;
		},

		fetchRehabStepsData : function(rehabId) {
			var self= this;
			this.collection.getRehabSteps(rehabId,
					{	success : function ( model ,res ) {
						self.collection.reset();
						_(res).each(function(obj) {
							self.collection.push(new rehabStepsModel(obj));
						});
					},
					error   : function ( model, res ) {
						$('#closingStepsErrorMessage').html('Error in fetching closing tasks');
					}
					});
		},

		showTaskModal : function(evt){
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
			var isLoopTask=$(evt.currentTarget).data('islooptask');
			var inspectionFee=$(evt.currentTarget).data('inspectionFee');
			var taskStatus=$(evt.currentTarget).data('status');

			this.currentObject=object;
			this.currentObjectId=objectId;
			this.currentTaskKey=taskKey;
			this.currentTaskStatus=taskStatus;
			var popupId = popupKey+'_'+popupVersion;

			this.taskKeyName=popupKey;

			if(taskName=="Property Inspection"){
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
			else if(this.currentTaskKey == 'HU_UPDATED_REHAB_QUOTE'){
				if(!this.huUpdatedRehabQuoteView){
					this.huUpdatedRehabQuoteView = new huUpdatedRehabQuoteView();
				}
				this.huUpdatedRehabQuoteView.setElement($('#HU_UPDATED_QUOTE_RENDER_DIV')).render({parentModel:self.model,
					parentObject:self.currentObject,parentObjectId:self.currentObjectId,taskKey:self.currentTaskKey});
			}
			else if(this.currentTaskKey.indexOf("PROPERTY_RE_INSPECTION")>-1){
				var inspectionModal = _.template( propertyReInspectionModal );
				$('#propertyReInspectionDiv').html("");
				$('#propertyReInspectionDiv').html(inspectionModal);
				app.currencyFormatter();
				//self.addFormValidations({documentRequired:true});
				ComponentsPickers.init();
			}

			if(isLoopTask){
				$('#'+popupId).find('button[id$=PopupRehabSubmitButton]').hide();
				self.taskId=$(evt.currentTarget).data('taskid');
			}
			else{
				$('#'+popupId).find('button[id$=PopupRehabSubmitButton]').show();
				self.taskId=null;
			}


			//should be after the form is created
			this.currentPopup = $('#'+popupId);
			this.currentForm = $('#'+popupId+' form');
			$('#'+popupId+' #modalTitle').html(taskName);

			$('#'+popupId+' #documentLabel').html(documentLabel);
			_($('.date-picker:not(.unrestricted)')).each(function(datePicker) {
//				$(datePicker).datepicker('setEndDate','+0d').datepicker('update');
				$(datePicker).datepicker('setEndDate',new Date()).datepicker('update');
			});



			if(popupId == "MILESTONE_POPUP_1"){
				if(this.currentTaskKey == "RE_INSPECTION_REVIEW"){
					this.currentForm.find("#reinspectionRequired").hide();
					this.currentForm.find("#repairRequired").show();
				}else if(this.currentTaskKey == "RE_INSPECTION_APPTMT"){
					this.currentForm.find("#repairRequired").hide();
					this.currentForm.find("#reinspectionRequired").show();
				}else{
					this.currentForm.find("#repairRequired").hide();
					this.currentForm.find("#reinspectionRequired").hide();
				}
			}

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

			if(self.taskId){

				$.ajax({
					url: app.context()+ "/closing/task/"+object+'/'+objectId+'/'+taskKey+"?taskId="+self.taskId,
					contentType: 'application/json',
					dataType:'json',
					type: 'GET',
					async: false,
					success: function(res){
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
								$('input[id$=optionsRadios'+res[attr]+'][name='+attr+']').attr('checked','checked').parent().addClass('checked');
								$('input[id$=optionsRadios'+res[attr]+'][name='+attr+']').parent().click();
							}

							if(self.currencyAttrs.indexOf(attr)!=-1){
								self.currentForm.find('[id='+attr+'_currency]').val(self.currentForm.find('[id='+attr+']').val());
							}
						}
						if(res['documentId']) {
							_($('div[id^=existingDocument]')).each(function(document){
								$(document).html('Existing Document : <a href="document/download/'+res['documentId']+'" target="_blank" style="word-wrap:break-word;">'+res['documentName']+'</a>');
							});
						}

						if(popupId == "MILESTONE_POPUP_1"){
							if(taskKey == "RE_INSPECTION_REVIEW"){
								self.currentForm.find("#reInspectionDoc").show();

							}else{
								self.currentForm.find("#reInspectionDoc").hide();
							}
						}


						if(taskKey=='PROPERTY_INSPECTION_ILM' || taskKey == 'HU_REHAB_QUOTE' ||
								taskKey == 'INSPECTION_REVIEW_INTERNAL' || taskKey == 'CONTRACTOR_QUOTE'){
							self.propertyInspectionIlmView.populateInspectionItems(res);
						} else if(taskKey=='PROPERTY_INSPECTION_INVESTOR'){
							self.propertyInspectionInvestorView.populateInspectionItems(res);
						}else if(taskKey=='REPAIRS_REQUEST'){
							self.requestForRepairsView.populateInspectionItems(res);
						}else if(taskKey=="SELLER_RESPONSE_REPAIRS"){
							self.sellerResponseForRepairsView.populateInspectionItems(res);
						}else if(taskKey=="INVESTOR_RESPONSE_REPAIRS"){
							self.investorResponseForRepairsView.populateInspectionItems(res);
						}else if(taskKey=="HU_UPDATED_REHAB_QUOTE"){
							self.huUpdatedRehabQuoteView.populateInspectionItems(res);
						}else if(taskKey=='PROPERTY_INSPECTION'||taskKey.indexOf('PROPERTY_RE_INSPECTION')>-1){
							if(res && res.documentId){
								self.addFormValidations({documentRequired:false});
							} else {
								self.addFormValidations({documentRequired:true});
							}
						}

					},
					error: function(res){
						console.log('Error in fetching task data '+res);
					}
				});
			}
			else{
				this.model.loadTaskData(taskKey,object,objectId,{
					success : function ( model, res ) {
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

							if(self.currencyAttrs.indexOf(attr)!=-1){
								self.currentForm.find('[id='+attr+'_currency]').val(self.currentForm.find('[id='+attr+']').val());
							}
							//self.currentForm.find('[id=inspectionFee_currency]').val(self.currentForm.find('[id=inspectionFee]').val());

						}

						if(res['documentId']) {
							_($('div[id^=existingDocument]')).each(function(document){
								$(document).html('Existing Document : <a href="document/download/'+res['documentId']+'" target="_blank" style="word-wrap:break-word;">'+res['documentName']+'</a>');
							});
						}

						if(popupId == "MILESTONE_POPUP_1"){
							if(taskKey == "RE_INSPECTION_REVIEW"){
								self.currentForm.find("#reInspectionDoc").show();

							}else{
								self.currentForm.find("#reInspectionDoc").hide();
							}
						}


						if(taskKey=='PROPERTY_INSPECTION_ILM' || taskKey == 'HU_REHAB_QUOTE' ||
								taskKey == 'INSPECTION_REVIEW_INTERNAL' || taskKey == 'CONTRACTOR_QUOTE'){
							self.propertyInspectionIlmView.populateInspectionItems(res);
						} else if(taskKey=='PROPERTY_INSPECTION_INVESTOR'){
							self.propertyInspectionInvestorView.populateInspectionItems(res);
						}else if(taskKey=='REPAIRS_REQUEST'){
							self.requestForRepairsView.populateInspectionItems(res);
						}else if(taskKey=="SELLER_RESPONSE_REPAIRS"){
							self.sellerResponseForRepairsView.populateInspectionItems(res);
						}else if(taskKey=="INVESTOR_RESPONSE_REPAIRS"){
							self.investorResponseForRepairsView.populateInspectionItems(res);
						}else if(taskKey=="HU_UPDATED_REHAB_QUOTE"){
							self.huUpdatedRehabQuoteView.populateInspectionItems(res);
						}else if(taskKey=='PROPERTY_INSPECTION'||taskKey.indexOf('PROPERTY_RE_INSPECTION')>-1){
							if(res && res.documentId){
								self.addFormValidations({documentRequired:false});
							} else {
								self.addFormValidations({documentRequired:true});
							}
						}

					},
					error   : function ( model, res ) {
						console.log('Error in fetching task data '+res);

					}
				});
			}

			if((self.currentForm.find('input[name=startDate]').length>0 && !self.currentForm.find('input[name=startDate]').val())) {
				var projectedDateArray = String(projectedStartDate).split('-');
				var projectedStartDateObj = new Date();
				projectedStartDateObj.setFullYear(projectedDateArray[2], projectedDateArray[0]-1, projectedDateArray[1]);

				var currentDate = new Date();

				if(projectedStartDateObj<=currentDate) {
					self.currentForm.find('input[name=startDate]').val(projectedStartDate);
				}
				//update date-picker or fire its update event
			}

			_($('.has-error')).each(function(error) {
				$(error).removeClass('has-error');
			});

			_($('.help-block')).each(function(error) {
				$(error).remove();
			});
			
			if(this.parentView) {
				var rehabStatus = this.parentView.model.attributes.investmentResponse['closingStatus'];
				if(rehabStatus == 'Completed') {
//					this.handleRehabCompleted();
				} else if(rehabStatus == 'Cancelled') {
					this.handleRehabCancelled();
				}
			}

			$('#'+popupId+' #object').val(object);
			$('#'+popupId+' #objectId').val(objectId);
			$('#'+popupId+' #taskKey').val(taskKey);

			/*
			 * Below codes populate data into messages and document tooltip.
			 * Default tooltip will work with just populating object,objectId and taskKey.
			 * For popups with multiple document field, we need to set subObject and subOjbectId as well.
			 */
			self.currentForm.find('.showMessageTooltip').addClass('showMessageTooltip_2').removeClass('showMessageTooltip');
			self.currentForm.find('.showMessageTooltip_2')
			.data('object',object)
			.data('objectid',objectId)
			.data('taskkey_1',taskKey);
			self.currentForm.find('.showDocumentTooltip').addClass('showDocumentTooltip_2').removeClass('showDocumentTooltip');
			self.currentForm.find('.showDocumentTooltip_2')
			.data('object',object)
			.data('objectid',objectId)
			.data('taskkey_1',taskKey);

			//this.applyPermissions();
			$('#'+popupId).data('backdrop','static');
			$('#'+popupId).data('keyboard','false');
			$('#'+popupId).modal('show');

			var tooltipExcludedTasks = [];
			if(tooltipExcludedTasks.indexOf(taskKey)==-1){
				self.initializeTooltipPopup(popupId);
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

		bsModalHide:function() {
			$('.showMessageTooltip_2').popover("hide");
			$('.showMessageTooltip_2').data('show',true);
			$('.showMessageTooltip_2').removeClass("tooTip-shown");
			$('.showDocumentTooltip').popover("hide");
			$('.showDocumentTooltip').data('show',true);
			$('.showDocumentTooltip').removeClass("tooTip-shown");
		},

		initializeTooltipPopup:function(popupId) {
			this.initializeTooltipEffects();

			if(this.getMessagesForTask() == "") {
				$('#'+popupId).find('.showMessageTooltip_2').hide();
			} else {
				$('#'+popupId).find('.showMessageTooltip_2').show();
			}
			if(this.getDocumentsForTask() == "") {
				$('#'+popupId).find('.showDocumentTooltip_2').hide();
			} else {
				$('#'+popupId).find('.showDocumentTooltip_2').show();
			}
		},


		initializeTooltipEffects:function(){
			$('.showMessageTooltip_2').popover({ 
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
			$('.showDocumentTooltip_2').popover({ 
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

		getMessagesForTask:function(taskKey,object,objectId,subObject,subObjectId) {
			var taskKey = taskKey || this.currentTaskKey;
			var excludedTaskKeys = [];
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

		getDocumentsForTask:function(subTask,taskKey,object,objectId,subObject,subObjectId) {
			var taskKey = taskKey || this.currentTaskKey;
			var object = object || this.currentObject;
			var objectId = objectId || this.currentObjectId;
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
			else {
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


		submitRehabPopupForm : function(evt) {

			var self = this;
			if(self.currentObject=='49'){
				self.submitClosingPopupForm();
			}else{
				var document = this.currentForm.find('input[name=document]');
				if(this.milestoneTasksWithMandatoryDocument.indexOf(this.currentTaskKey)!=-1) {
					var existingDoc = this.currentForm.find('.showMessageTooltip_2');
					if(document && document.val() == "" && existingDoc.css('display') == 'none') {
						$('#milestoneDocRequiredMsg').show();
						return false;
					} else {
						$('#milestoneDocRequiredMsg').hide();
					}
				} else {
					$('#milestoneDocRequiredMsg').hide();
				}

				if(this.currentForm.validate().form()) {
					if(document && document.val() == "") {
						document.attr("disabled","disabled");
					}

					$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});

					self.model.submitRehabTaskData(
							this.currentForm,
							{
								success : function ( model, res ) {
									$.unblockUI();
									self.currentPopup.modal('hide');
									self.currentPopup.on('hidden.bs.modal', function (e) {
										self.refreshRehabSteps();
										if(self.parentView) {
											self.parentView.renderHeader();
										}
									});
									console.log(res);
								},
								error   : function ( model, res ) {
									$.unblockUI();
									self.currentPopup.modal('hide');
									self.currentPopup.on('hidden.bs.modal', function (e) {
										self.refreshRehabSteps();
										if(self.parentView) {
											self.parentView.renderHeader();
										}
									});
								}
							}
					);
				}
			}
		},
		addFormValidations:function(args){
			var milestoneForms = $('.milestone-form');

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
						estimatedStartDate:{
							required:true
						},
						estimatedEndDate:{
							required:true
						},
						investorEstimatedEndDate:{
							required:true
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


			var inspectionForm=$("#propertyReInspectionForm");
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
					//	self.showClosingDiv();
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



			var inspectionForm=$("#propertyInspectionForm");
			inspectionForm.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					document:{
						required:!(args && args.documentRequired)?false:true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					// 	successInsp.hide();
					// errorInsp.show();
					//	self.showClosingDiv();
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
		refreshRehabSteps : function () {
			this.render({});
		},
		showOpenClosingToggle: function(){
			var items;

			if($("#showOpenClosingToggleButton").text() == "Show All") {
				$("#showOpenClosingToggleButton").text("Show Open");

				items = $('td:nth-child(6)', '#rehabStepsTable');
				for(var i=0;i<items.length;i++)
				{
					if(items[i].textContent == "Completed" || items[i].textContent == "Cancelled"){
						$(items[i]).closest("tr").show();
					}
				}
			} else {
				$("#showOpenClosingToggleButton").text("Show All");

				items = $('td:nth-child(6)', '#rehabStepsTable');
				for(var i=0;i<items.length;i++)
				{
					if(items[i].textContent == "Completed" || items[i].textContent == "Cancelled"){
						$(items[i]).closest("tr").hide();
					}
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
						self.refreshRehabSteps();
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
						self.refreshRehabSteps();
					});
				},
				error: function(res){
					var popup = $("#deleteWorkflowStep");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.refreshRehabSteps();
					});
				}
			});
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
						self.refreshRehabSteps();
					});
				},
				error: function(res){
					var popup = $("#openWorkflowStep");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.refreshRehabSteps();
					});
				}
			});
		},
		submitClosingPopupForm: function(evt) {

			var self = this;

			var document = this.currentForm.find('input[name=document]');
			if(this.milestoneTasksWithMandatoryDocument.indexOf(this.currentTaskKey)!=-1) {
				var existingDoc = this.currentForm.find('.showMessageTooltip_2');
				if(document && document.val() == "" && existingDoc.css('display') == 'none') {
					$('#milestoneDocRequiredMsg').show();
					return false;
				} else {
					$('#milestoneDocRequiredMsg').hide();
				}
			} else {
				$('#milestoneDocRequiredMsg').hide();
			}

			if(this.currentForm.validate().form()) {
				if(document && document.val() == "") {
					document.attr("disabled","disabled");
				}

				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});

				var nonMultipartTasks = ['INSURANCE_QUOTES_REVIEW','INSURANCE_VENDOR_SELECTION','INSURANCE_APPLICATION_SIGNATURE',
				                         'PROPERTY_INSPECTION_INVESTOR','FINAL_WALK_THROUGH','CLOSING_APPOINTMENT','INVESTOR_RESPONSE_REPAIRS','REPAIRS_REQUEST','HU_UPDATED_REHAB_QUOTE','DEED_RECORDED'];


				if(nonMultipartTasks.indexOf(self.currentTaskKey)==-1){
					self.model.submitTaskData(
							self.currentForm,
							{
								success : function ( model, res ) {
									$.unblockUI();
									self.currentPopup.modal('hide');
									self.currentPopup.on('hidden.bs.modal', function (e) {
										self.refreshRehabSteps();
									});
								},
								error   : function ( model, res ) {
									$.unblockUI();
									self.currentPopup.modal('hide');
									self.currentPopup.on('hidden.bs.modal', function (e) {
										self.refreshRehabSteps();
									});
								}
							}
					);
				}
				else{
					var postData={};
					postData.taskKey=self.currentTaskKey;
					postData.objectId=self.currentObjectId;
					postData.object=self.currentObject;
					if(self.currentTaskKey == 'PROPERTY_INSPECTION_INVESTOR' && self.propertyInspectionInvestorView){
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
					} else if(self.currentTaskKey == 'HU_UPDATED_REHAB_QUOTE' && self.huUpdatedRehabQuoteView){
						var returnObj = self.huUpdatedRehabQuoteView.fetchSubmitData();
						postData.inspectionCategories = returnObj.inspectionCategories;
						postData.endDate = returnObj.endDate;
						postData.comments = returnObj.comments;
					}


					$.ajax({
						url: app.context()+'/closing/processNonMultipartForm',
						contentType: 'application/json',
						dataType:'json',
						type: 'POST',
						data: JSON.stringify(postData),
						async: true,
						success: function(res){
							$.unblockUI();
							self.currentPopup.modal('hide');
							self.currentPopup.on('hidden.bs.modal', function (e) {
								self.refreshRehabSteps();
							});
							self.afterSubmitClosingPopupForm();
						},
						error: function(res){
							$.unblockUI();
							self.currentPopup.modal('hide');
							self.currentPopup.on('hidden.bs.modal', function (e) {
								self.refreshRehabSteps();
							});
							self.afterSubmitClosingPopupForm();
						}
					});
				}
			}

		},

		afterSubmitClosingPopupForm:function(){
			var self = this;
			if(self.currentTaskKey == 'INVESTOR_RESPONSE_REPAIRS'){
				self.trigger('RefreshRehabHeader')
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
							self.refreshRehabSteps();
						});
					},
					error: function(res){
						$.unblockUI();
						var popup = $("#addTaskModal");
						popup.modal("hide");
						popup.on('hidden.bs.modal', function (e) {
							self.refreshRehabSteps();
						});
					}
				});
			}

		},
		createDocusignEnvelopeForTask : function(evt){
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

					var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
					self.currentForm.find('.docusignEnvelopeArea').html("");
					self.currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));

//					$.colorbox({href: res.tagAndSendUrl,
//					iframe:true,fastIframe:false,title:'Tag and Send Documents for Signature',closeButton:true,width:'100%',height:'100%',
//					escKey:false,overlayClose:false});
//					$('#cboxOverlay').css('z-index',99998);
//					$('#colorbox').css('z-index',99999);
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
//						tagSendBox.on('cbox_closed', function (e) {
//						self.refreshEnvelopeStatus();
//						});
//						tagSendBox.on('cbox_cleanup', function (e) {
//						self.showTagAndSendWarning(e);
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


					if(currTaskKey=="REPAIRS_REQUEST"){
						self.requestForRepairsView.populateDocusignArea(res);
					}else if(currTaskKey=="SELLER_RESPONSE_REPAIRS"){
						self.sellerResponseForRepairsView.populateDocusignArea(res);
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
//						tagSendBox.onClosed = self.refreshEnvelopeStatus(embraceEnvelopeId,self.currentForm);
//						tagSendBox.on('cbox_closed', function (e) {
//						alert('closed');
//						self.refreshEnvelopeStatus();
//						});
//						tagSendBox.on('cbox_cleanup', function (e) {
//						self.showTagAndSendWarning(e);
//						});
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
			console.log('Rehab Tag and Send popup');
			var self = evt.data.self;
			console.log(self);
			self.refreshEnvelopeStatusBlocking(self.embraceEnvelopeId,self.currentForm);
			if(self.envelopeStatus == 'sent') {
				self.handleSendRecipientLink();
			}
		},
		mgmtConsoleCloseHandler : function(evt) {
			console.log('Rehab management console popup');
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
		handleRehabCancelled:function() {
			if(this.currentTaskStatus && this.currentTaskStatus=='Cancelled'){
				$("button[id$=PopupSubmitButton]").remove();
			}
		}

	});
	return RehabStepsView;
});
