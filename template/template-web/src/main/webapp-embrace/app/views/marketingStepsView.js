define(["text!templates/assetMarketingSteps.html", "text!templates/taskPopups.html", "backbone", "app",
        "models/assetMarketingStepsModel", "collections/assetMarketingStepsCollection",
        "text!templates/documentListForTask.html","text!templates/messagesListForTask.html","views/codesView","views/documentPreviewView",
        "text!templates/usersDropdown.html" , "views/emailView", "text!templates/mailSendTemplateToCCBCC.html",
        "text!templates/emailTemplateList.html",
        "components-dropdowns","components-pickers","bootstrap-toggle","bootstrap-datetimepicker"
        ],
        function(marketingStepsPage, taskPopupsPage, Backbone, app, marketingStepsModel, marketingStepsCollection,documentForTaskPage,messageForTaskPage,
        		codesView,documentPreviewView,usersDropdown,emailView,mailSendTemplate,emailTemplates){

	var MarketingStepsView = Backbone.View.extend( {
		initialize: function(){
			
		},
		model:new marketingStepsModel(),
		states:null,
		collection:new marketingStepsCollection(),
		el:"#marketingStepsTab",
		mailContent:null,
		currentObject:null,
		currentObjectId:null,
		currentTaskKey:null,
		propertyModel:{},
		excludedAttrs:['moveinRepairsRequired'],
		events          : {
			"click a[href='taskPopup']":"showTaskModal",
			"click button[id$=PopupSubmitButton]":"submitPopupForm",
			'click #showOpenMarketingToggleButton':'showOpenMarketingToggle',
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
			
			
			'click #initiateWorkflowConfirmationButton': 'initiateWorkflowForMarketing',
			'click #addTaskPopup':'showAddTaskModal',
			'click #saveTaskButton':'saveTask',
		},
		initiateWorkflowForMarketing:function() {
			
			var marketingId = this.propertyModel.objectId;
			var self=this;

			var postData = {};
			postData['objectId']=marketingId;
			console.log(postData);

			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});

			$.ajax({
				dataType: 'json',
				contentType: "application/json",
				type: "POST",
				url: app.context()+ '/assetMarketing/initiateWorkflow',
				async: false,
				data: JSON.stringify(postData),
				success: function(res){
					$.unblockUI();
					var popup = $("#initiateWorkflowModal");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.refreshMarketingSteps();
					});
				},
				error: function(res){
					$.unblockUI();
					var popup = $("#initiateWorkflowModal");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.refreshMarketingSteps();
					});
				}
			});
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
					console.log("Fetching All documents and messages for marketing failed");
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
		fetchMarketingStepsData : function(marketingId) {
			var self= this;
			this.collection.getMarketingSteps(marketingId,
					{	success : function ( model, res ) {
						self.collection.reset();
						_(res).each(function(obj) {
							self.collection.push(new marketingStepsModel(obj));
						});
					},
					error   : function ( model, res ) {
						$('#marketingStepsErrorMessage').html('Error in fetching marketing tasks');
					}
					});
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

//			var self=this;
			this.currentObject=object;
			this.currentObjectId=objectId;
			this.currentTaskKey=taskKey;
			var popupId = popupKey+'_'+popupVersion;
			
			if(taskKey=='MOVEIN_INSPECTION') {
				var popupId = taskKey+'_'+popupVersion;
			}

			this.taskKeyName=popupKey;
			
			this.currentPopup = $('#'+popupId);
			this.currentForm = $('#'+popupId+' form');
			
			$('#'+popupId+' #modalTitle').html(taskName);
			$('#'+popupId+' #documentLabel').html(documentLabel);
			_($('.date-picker:not(.unrestricted)')).each(function(datePicker) {
//				$(datePicker).datepicker('setEndDate','+0d').datepicker('update');
				$(datePicker).datepicker('setEndDate',new Date()).datepicker('update');
			});

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
			
			var popupForm = $('#'+popupId+' form');
			if(popupForm && popupForm[0]){
				popupForm[0].reset();
			}
			
			var taskKeysForPreload = ['REVIEW_RENT'];
			if(completedDate!='' || startDate!='' || taskKeysForPreload.indexOf(taskKey)!=-1) {
				this.model.loadTaskData(taskKey,object,objectId,{
					success : function ( model, res ) {
						console.log(res);
						for(attr in res) {
							var formElement = self.currentForm.find('[name='+attr+']');
							if(attr.indexOf('Date')!=-1 && formElement) {
								formElement.parent().data({date: res[attr]}).datepicker('update');
							}
							if(formElement && self.excludedAttrs.indexOf(attr)==-1) {
								formElement.val(res[attr]);
							}
							
							if(self.excludedAttrs.indexOf(attr)!=-1){
								$('input[name='+attr+']:checked').removeAttr('checked').parent().removeClass('checked');
								$('input[id=optionsRadios'+res[attr]+'][name='+attr+']').attr('checked','checked').parent().addClass('checked');
								$('input[id=optionsRadios'+res[attr]+'][name='+attr+']').parent().click();
							}
							
						}
						$('#updatedCma_currency').val($('#updatedCma').val());
						$('#zestimate_currency').val($('#zestimate').val());
						$('#estimatedRent_currency').val($('#estimatedRent').val());
						$('#updatedAvm_currency').val($('#updatedAvm').val());
					},
				error   : function ( model, res ) {
						console.log('Error in fetching task data '+res);
						/*var error1 = $('#alertAddServiceContractFailure', $('#alertsForm'));
			             	error1.show();
	                 	App.scrollTo(error1, -200);
	                 	error1.delay(2000).fadeOut(2000);*/
					}
				});
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

			_($('.has-error')).each(function(error) {
				$(error).removeClass('has-error');
			});

			_($('.help-block')).each(function(error) {
				$(error).remove();
			});

//			if(this.parentView) {
//				var marketingStatus = this.parentView.model.attributes.marketingResponse['marketingStatus'];
//				if(marketingStatus == 'Completed') {
//					this.handleMarketingCompleted();
//				} else if(marketingStatus == 'Cancelled') {
//					this.handleMarketingCancelled();
//				}
//			}

			$('#'+popupId+' #object').val(object);
			$('#'+popupId+' #objectId').val(objectId);
			$('#'+popupId+' #taskKey').val(taskKey);
			//this.applyPermissions();
			$('#'+popupId).data('backdrop','static');
			$('#'+popupId).data('keyboard','false');
			$('#'+popupId).modal('show');

			$(".currency").formatCurrency({symbol:""});
			
			this.initializeTooltipPopup(popupId);
			App.handleUniform();
			$(".amount").formatCurrency();
		},
		submitPopupForm : function(evt) {

			var self = this;

			var document = this.currentForm.find('input[name=document]');
			var otherDocuments = this.currentForm.find('input[name$=Document]');
//			if(this.milestoneTasksWithMandatoryDocument.indexOf(this.currentTaskKey)!=-1) {
//				var existingDoc = this.currentForm.find('.showDocumentTooltip');
//				if(document && document.val() == "" && existingDoc.css('display') == 'none') {
//					$('#milestoneDocRequiredMsg').show();
//					return false;
//				} else {
//					$('#milestoneDocRequiredMsg').hide();
//				}
//			} else {
//				$('#milestoneDocRequiredMsg').hide();
//			}
			
			if(this.currentForm.validate().form()) {
				if(document && document.val() == "") {
					document.attr("disabled","disabled");
				}
				
				if(otherDocuments) {
					_(otherDocuments).each(function(document) {
						var doc = $(document);
						if(doc && doc.val() == "") {
							doc.attr("disabled","disabled");
						}
					});
				}
				
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});
				var multipartTasks = ['UPLOAD_LEASE_LISTING','UPLOAD_EXEC_LEASE_LISTING','UPLOAD_MLS_SHEET','DEPOSIT_RECEIPT','CONFIRM_LEASE','MOVEIN_INSPECTION','MOVEIN-DOCS'];
				if(multipartTasks.indexOf(self.currentTaskKey)!=-1){
					self.model.submitTaskData(
						this.currentForm,
						{
							success : function ( model, res ) {
								$.unblockUI();
								self.currentPopup.modal('hide');
								self.currentPopup.on('hidden.bs.modal', function (e) {
									self.refreshMarketingSteps();
									if(self.parentView) {
										self.parentView.refreshMarketingHeader();
									}
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
									self.refreshMarketingSteps();
									if(self.parentView) {
										self.parentView.refreshMarketingHeader();
									}
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
					
					postData.endDate = $(self.currentPopup).find('#endDate').val();
					if($(self.currentPopup).find('#startDate')) {
						postData.startDate = $(self.currentPopup).find('#startDate').val();
					}
					if($(self.currentPopup).find('#moveinDate')) {
						postData.moveinDate = $(self.currentPopup).find('#moveinDate').val();
					}
					if($(self.currentPopup).find('input[name=updatedCma]')) {
						postData.updatedCma = $(self.currentPopup).find('input[name=updatedCma]').val();
					}
					if($(self.currentPopup).find('input[name=zestimate]')) {
						postData.zestimate = $(self.currentPopup).find('input[name=zestimate]').val();
					}
					postData.comments = $(self.currentPopup).find('#comments').val();
					
					if($(self.currentPopup).find('input[name=moveinRepairsRequired]')) {
						postData.moveinRepairsRequired = $('input[type=radio][name=moveinRepairsRequired]:checked').val();
					}
														
					$.ajax({
						url: app.context()+'/assetMarketing/processNonMultipartForm',
						contentType: 'application/json',
						dataType:'json',
						type: 'POST',
						data: JSON.stringify(postData),
						async: true,
						success: function(res){
							$.unblockUI();
							self.currentPopup.modal('hide');
							self.currentPopup.on('hidden.bs.modal', function (e) {
								self.refreshMarketingSteps();
								if(self.parentView) {
									self.parentView.refreshMarketingHeader();
								}
							});
						},
						error: function(res){
							$.unblockUI();
							self.currentPopup.modal('hide');
							self.currentPopup.on('hidden.bs.modal', function (e) {
								self.refreshMarketingSteps();
								if(self.parentView) {
									self.parentView.refreshMarketingHeader();
								}
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
				this.fetchMarketingStepsData(this.parentView.marketingId);
			}

			if(!app.documentPreview){
				app.documentPreview=new documentPreviewView();
			}
			
			this.template = _.template( marketingStepsPage );
			this.$el.html("");
			this.$el.html(this.template({assetMarketingStepsData:this.collection.toJSON(),object:this.propertyModel.object,objectId:this.propertyModel.objectId,app:app,marketingStatus:this.propertyModel.marketingStatus}));
			var popupsTemplate = _.template( taskPopupsPage );
			$('#taskPopups').html("");
			$('#taskPopups').html(popupsTemplate());

			app.currencyFormatter();
			this.addFormValidations();

			ComponentsPickers.init();
			//this.applyPermissions();
//			if(this.parentView) {
//				var marketingStatus = this.parentView.model.attributes.marketingResponse['marketingStatus'];
//				if(marketingStatus == 'Completed') {
//					this.handleMarketingCompleted();
//				} else if(marketingStatus == 'Cancelled') {
//					this.handleMarketingCancelled();
//				}
//			}

			this.initializeTooltipRender();
            $('.hopNameTooltip').tooltip({
                animated: 'fade',
                placement: 'left'
            });

			return this;
		},
		refreshMarketingSteps : function () {
			this.render({});
		},
		addFormValidations:function(args){
			var self=this;
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

		},
		applyPermissions : function() {
			if($.inArray('MarketingManagement', app.sessionModel.attributes.permissions)==-1) {
				$("#provideRehabEstimateButton").remove();
				$("button[id$=PopupSubmitButton]").remove();
				$('a[href="#cancelMarketing"]').remove();
				$(".marketingCompletedButton").remove();
				_($("a[id$=reprojectDate]")).each(function(n){
					$(n).remove();
				});
			}
		},
		handleMarketingCompleted : function() {
			$("#showOwnershipModal").remove();
			$("#showEscrowCompanyModal").remove();
			$("a[href='editMarketingHeader']").remove();
			$("a[href='#lendingcompany']").remove();
			$("#provideRehabEstimateButton").remove();
			$("button[id$=PopupSubmitButton]").remove();
			$('a[href="#cancelMarketing"]').remove();
			$(".marketingCompletedButton").remove();
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
		handleMarketingCancelled : function() {
			$("#showOwnershipModal").remove();
			$("#showEscrowCompanyModal").remove();
			$("a[href='editMarketingHeader']").remove();
			$("a[href='#lendingcompany']").remove();
			$("#provideRehabEstimateButton").remove();
			$("button[id$=PopupSubmitButton]").remove();
			$('#cancelMarketingLink').remove();
			$(".marketingCompletedButton").remove();
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
		showOpenMarketingToggle: function(){
			var items;

			if($("#showOpenMarketingToggleButton").text() == "Show All") {
				$("#showOpenMarketingToggleButton").text("Show Open");

				items = $('td:nth-child(6)', '#assetMarketingStepsTable');
				for(var i=0;i<items.length;i++)
				{
					if(items[i].textContent == "Completed"){
						$(items[i]).closest("tr").show();
					}
				}
			} else {
				$("#showOpenMarketingToggleButton").text("Show All");

				items = $('td:nth-child(6)', '#assetMarketingStepsTable');
				for(var i=0;i<items.length;i++)
				{
					if(items[i].textContent == "Completed"){
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
					url: app.context()+ '/assetMarketing/updateProjectedDate',
					async: false,
					data: JSON.stringify(postData),
					success: function(res){
						self.refreshMarketingSteps();
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
				url: app.context()+ '/assetMarketing/step/open',
				async: false,
				data: JSON.stringify(postData),
				success: function(res){
					var popup = $("#openWorkflowStep");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.refreshMarketingSteps();
					});
				},
				error: function(res){
					var popup = $("#openWorkflowStep");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.refreshMarketingSteps();
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
				url: app.context()+ '/assetMarketing/step/delete',
				async: false,
				data: JSON.stringify(postData),
				success: function(res){
					var popup = $("#deleteWorkflowStep");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.refreshMarketingSteps();
					});
				},
				error: function(res){
					var popup = $("#deleteWorkflowStep");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.refreshMarketingSteps();
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
		url :function (){
			var gurl=app.context()+ "/assetMarketing";
			return gurl;
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
							self.refreshMarketingSteps();
						});
	                },
	                error: function(res){
	                	$.unblockUI();
	                	var popup = $("#addTaskModal");
						popup.modal("hide");
						popup.on('hidden.bs.modal', function (e) {
							self.refreshMarketingSteps();
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

		}
	});
	return MarketingStepsView;
});
