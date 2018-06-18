define(["backbone","app","text!templates/calendar.html","text!templates/usersDropdown.html", 
        "models/calendarModel","text!templates/defaultTaskModal.html","views/documentTooltipView",
        "models/closingStepsModel", "collections/closingStepsCollection",
        "text!templates/documentListForTask.html","text!templates/messagesListForTask.html",
        "text!templates/taskPopups.html","views/documentPreviewView","views/emailView",
        "text!templates/reviewLeaseTab.html","text!templates/utilityInformationModal.html","views/utilityView",
        "text!templates/utilityTransferModal.html","views/utilityTransferView",
        "components-dropdowns","components-pickers"],
		function(Backbone,app,calendarPage,usersDropdown,calendarModel,taskModal,documentTooltipView,
				closingStepsModel,closingStepsCollection,documentForTaskPage,messageForTaskPage,
				taskPopupsPage,documentPreviewView,emailView,reviewLeaseTab,
				utilityInformation,utilityView,utilityTransfer,utilityTransferView){
	var CalendarView=Backbone.View.extend({
		initialize: function(){
			var self=this;
			self.isAssetWFTask = false;
			self.preset = false;
		},
		 events : {
			 'click #addTaskPopup':'showAddTaskModal',
			 'click #saveTaskButton':'saveTask',
			 "click a[href='taskPopup']":'openTaskModal',
			 'click #defaultPopupSubmitButton':'submitAdhocTaskData',
			 'click #milestonePopupSubmitButton':'submitPopupForm',
			 'click #assetMgmtAgreementPopupSubmitButton':'submitPopupForm',
			 'click #reprojectDate':'showReprojectModal',
			 'click #reProjectPopupSubmit':'saveReprojectedDate',
			 'click #deleteTask':'deleteWorkflowStepShow',
			 'click #deleteStepConfirmationButton':'deleteWorkflowStep',
			 'click #openStep':'openWorkflowStepShow',
			 'click #openStepConfirmationButton':'openWorkflowStep',
			 'click .showDocumentTooltip': 'showDocumentsForTask',
			 'click .showMessageTooltip': 'showMessagesForTask',
			 "click .popover-close" : "closePopover",
			 'change [name=isAgreementSigned]': 'showUploadDiv',
			 'hidden.bs.modal .with-popover': 'bsModalHide',
			 "click #showOpenTasksToggleButton": "toggleOpenOrAllTasks",
			 "click #exportCalendarTasks": "exportCalendarTasksToExcel",
			 "click .radio-list input[name='taskType']":'handleRadio'
				
			
       },
		self:this,
		el:"#calendarTab",
		object:{},
		objectId:{},
		calendarModel:new calendarModel(),
		model:new closingStepsModel(),
		states:null,
		collection:new closingStepsCollection(),
		currentObject:null,
		currentObjectId:null,
		currentTaskKey:null,
		hideAddTaskButton: false,
		milestoneTasksWithMandatoryDocument:['INSURANCE_DECLARATION'],
//		propertyModel:{},
		excludedAttrs:['repairRequired','appraisalRequired','isRented','priceIssueResolved','isVacant','huToProvideInsurance','insuranceSelected',
			'buyerNameMatch','addressMatch','commissionToHuMatch','purchasePriceMatch','sellerCreditsMatch','securityDepositPreHud','proRatedRentCreditMatch','isAgreementSigned'],
		initialRender: function(parentView,object,objectId){
			var self = this;
			self.parentView = parentView;
			self.render(object,objectId);
		},
		render : function (object,objectId) {
			
			if(!app.documentTooltipView){
				app.documentTooltipView=new documentTooltipView();
			}
			
			if(!app.documentPreview){
				app.documentPreview=new documentPreviewView();
			}
			
			var self= this;
			this.object=object;
			this.objectId=objectId;

			
			$.ajax({
				url: app.context()+'/task/get/'+object+'/'+objectId,
                contentType: 'application/json',
                async : false,
                dataType:'json',
                type: 'GET',
                success: function(res){
                	self.tasksResponse=res;
                },
                error: function(res){
                	console.log('Error in fetching tasks data');
                }
				
			});
			console.log('getting object wf codes');
			$.ajax({
				url: app.context()+'/code/all/'+object.toUpperCase()+'_WF',
                contentType: 'application/json',
                async : false,
                dataType:'json',
                type: 'GET',
                success: function(res){
                	self.customWFtasksList=res;
                },
                error: function(res){
                	console.log('Error in fetching tasks data');
                }
				
			});
			self.customWFtasks = false;
			if(self.customWFtasksList.length > 0){
				self.customWFtasks = true;
			}
			self.template = _.template( calendarPage );
			self.$el.html("");
			//this.$el.html(this.template({tasks:self.tasksResponse,app:app, object: self.object, objectId: self.objectId}));
			this.$el.html(this.template({tasks:self.tasksResponse,app:app, object: self.object, objectId: self.objectId,customWFtasks:self.customWFtasks,customWFtasksList:self.customWFtasksList}));
			self.popupsTemplate = _.template( taskPopupsPage );
			$('#taskPopups').html("");
			$('#taskPopups').html(this.popupsTemplate());
			
			var utilityInformationHtml=_.template(utilityInformation);
			$("#renderUtilityInformation").html(utilityInformationHtml);
			
			var utilityTransferHtml=_.template(utilityTransfer);
			$("#renderUtilityTransfer").html(utilityTransferHtml);
			
			app.currencyFormatter();
			this.addFormValidations();
			
            $('.hopNameTooltip').tooltip({
                animated: 'fade',
                placement: 'left'
            });
			this.initializeTooltipRender();

			$("#calendar-table").DataTable({paging: false}).column('1:visible').order('asc').draw();
			$("select[name=calendar-table_length]").addClass("form-control");
			self.toggleOpenOrAllTasks();
			if(self.hideAddTaskButton){
				$("#addTaskPopup").hide();
			}
		},
		
		showAddTaskModal : function(evt){
			
			
			$('.addTaskForm')[0].reset();
			$('#customFields').show();
			$('#presetTasks').hide();
			$("#addTaskModal").find("[name=object]").val(this.object);
			$("#addTaskModal").find("[name=objectId]").val(this.objectId);
			
			this.fetchEmbraceUsers();
			var usersDropdownTemplate = _.template(usersDropdown);
	    	 $('#assignedUsers').html('');
	    	 $('#assignedUsers').html(usersDropdownTemplate({name:'assigneeId',id:'embraceUsers',users:this.allUsers.userResponse,addBlankFirstOption:true,investorId:null,investorName: null}));
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
						//$(endDatePicker[0]).val(month+"-"+selectedDate.getDate()+"-"+selectedDate.getFullYear());
					}
					endDatePickerWidget.datepicker('setStartDate', selectedDate);
				}
	    	 //---
	    	 
	    	 this.formValidation();
	    	 ComponentsPickers.init();
		},
		
		fetchEmbraceUsers: function(){
			 var self = this;
			 $.ajax({
					url: app.context()+'/user/fetchAllUsers/'+self.objectId+'/'+self.object,
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
			if(self.preset){
				console.log('dont validate');
				$.map(unindexed_array, function(n, i){
					var value=n['value'];
					var name=n['name'];
					self.calendarModel.set(name,value);
				});
				
				$.ajax({
	                url: app.context()+'/task/create',
	                contentType: 'application/json',
	                dataType:'json',
	                type: 'POST',
	                data: JSON.stringify(self.calendarModel.attributes),
	                success: function(res){
	                    $.unblockUI();
	                    var popup = $("#addTaskModal");
						popup.modal("hide");
						popup.on('hidden.bs.modal', function (e) {
							self.render(self.object,self.objectId);
						});
	                },
	                error: function(res){
	                	$.unblockUI();
	                	var popup = $("#addTaskModal");
						popup.modal("hide");
						popup.on('hidden.bs.modal', function (e) {
							self.render(self.object,self.objectId);
						});
	                }
	            });
			}
			else{
				console.log('custom task, do valuidate');
					if ($('.addTaskForm').validate().form()){
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Creating Task... </div>'
				});
				$.map(unindexed_array, function(n, i){
					var value=n['value'];
					var name=n['name'];
					self.calendarModel.set(name,value);
				});
				
				$.ajax({
	                url: app.context()+'/task/create',
	                contentType: 'application/json',
	                dataType:'json',
	                type: 'POST',
	                data: JSON.stringify(self.calendarModel.attributes),
	                success: function(res){
	                    $.unblockUI();
	                    var popup = $("#addTaskModal");
						popup.modal("hide");
						popup.on('hidden.bs.modal', function (e) {
							self.render(self.object,self.objectId);
						});
	                },
	                error: function(res){
	                	$.unblockUI();
	                	var popup = $("#addTaskModal");
						popup.modal("hide");
						popup.on('hidden.bs.modal', function (e) {
							self.render(self.object,self.objectId);
						});
	                }
	            });
				}
			}

		
		},
		
		openTaskModal :function(evt){
			var self=this;
//			var taskKey=$(evt.target).data('taskkey');
			
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

			this.currentObject=object;
			this.currentObjectId=objectId;
			this.currentTaskKey=taskKey;
			var popupId = popupKey+'_'+popupVersion;


			this.taskKeyName=popupKey;

			if(taskKey.indexOf("WFA_")>-1){
				self.isAssetWFTask = true;
				console.log('assetWFTaskFound');
			}else{
				self.isAssetWFTask = false;
				console.log('not assetWFTASK');
			}
			
			if(taskKey.indexOf("adhocTask")!=-1 || taskKey.indexOf("REHAB_COMPLETED")!=-1 || taskKey.indexOf("PROPERTY_REPAIRS")!=-1 ){
				this.template = _.template( taskModal );
				$('#renderTaskPop').html("");
				$('#renderTaskPop').html(this.template());
				//----
				var startDatePicker = $('#defaultTaskPopUp').find('[name=startDate]');
				var endDatePicker = $('#defaultTaskPopUp').find('[name=endDate]');
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
				this.fetchTaskData(taskKey);
	
//				$('#DEFAULT_POPUP_1 #modalTitle').html(this.singleTaskResponse.taskName);
				$('#DEFAULT_POPUP_1 #modalTitle').html(taskName);
				this.handleDates();
				
				$('#DEFAULT_POPUP_1').modal('show');
				this.adhocFormValidation();
				ComponentsPickers.init();
			}else{

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
					self.appraisalFormValidation();
					ComponentsPickers.init();
				}else if(popupId.indexOf("INSPECTION_POPUP")>-1){
					var inspectionModal = _.template( propertyInspectionModal );
					$('#propertyInspectionRenderDiv').html("");
					$('#propertyInspectionRenderDiv').html(inspectionModal);
					app.currencyFormatter();
					self.addFormValidations();
					ComponentsPickers.init();
				}else if(popupId.indexOf("ASSET_MGMT_AGREEMENT_POPUP")>-1){
					self.addFormValidations();
				}

				this.currentPopup = $('#'+popupId);
				this.currentForm = $('#'+popupId+' form');
				if(this.currentTaskKey=="UPLOAD_REPAIR_PICS"){
					this.currentForm.find('input[id=document]').attr('multiple','');
					this.currentForm.find('input[id=document]').attr('name','repairPictures');
					self.addFormValidations();
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
				
				
				$('#'+popupId+' #modalTitle').html(taskName);
				$('#'+popupId+' #documentLabel').html(documentLabel);
				_($('.date-picker:not(.unrestricted)')).each(function(datePicker) {
//					$(datePicker).datepicker('setEndDate','+0d').datepicker('update');
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

				if(taskKey=='UPLOAD_RENTAL_AGREEMENT') {
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

				_($('div[id^=existingDocument]')).each(function(document){
					$(document).html('');
				});
				$('#existingFinalHudDocument').html('');
				$('#existingTitleDocument').html('');
				$('#existingMortgageNote').html('');
				$('#existingTaxCertificate').html('');
				
				var taskKeysForPreload = ["NOTIFY_INVESTOR_TKP","FINAL_HUD","TERMS_AND_RATE_LOCKED","REHAB_ESTIMATE","INSURANCE_QUOTES_REVIEW",
				                          "INSURANCE_VENDOR_SELECTION","INSURANCE_APPLICATION_SIGNATURE","PRELIMINARY_HUD","LEASE_REVIEW"];
				if(completedDate!='' || startDate!='' || taskKeysForPreload.indexOf(taskKey)!=-1) {
					this.model.loadTaskData(taskKey,object,objectId,{
						success : function ( model, res ) {

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
								if(attr.indexOf('Date')!=-1 && formElement) {
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
							
//							$('#purchasePrice_currency').val($('#purchasePrice').val());
							$('#rehabCost_currency').val($('#rehabCost').val());
							$('#closingCost_currency').val($('#closingCost').val());
							self.currentForm.find('[id=inspectionFee_currency]').val(self.currentForm.find('[id=inspectionFee]').val());
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
						     	 $(".amount").formatCurrency();
						     	 ComponentsPickers.init();
					    	 }else if(taskKey=='LEASE_REVIEW'){
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
					    	 	self.parentView.getPropertyUnitsData();
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
					    	 }
//							self.calculateRentalDailyPerDiem();
						},
						error   : function ( model, res ) {
							console.log('Error in fetching task data '+JSON.stringify(res));
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

				/*if(this.parentView) {
					if(this.parentView.model.attributes.investmentResponse['financingTypeName'] == 'Cash') {
						$('.mortgageFields').hide();
						$('#downPaymentField').hide();
					} else {
						$('.mortgageFields').show();
						$('#downPaymentField').show();
					}
				}*/

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

				/*if(this.parentView) {
					var closingStatus = this.parentView.model.attributes.investmentResponse['closingStatus'];
					if(closingStatus == 'Completed') {
						this.handleClosingCompleted();
					} else if(closingStatus == 'Cancelled') {
						this.handleClosingCancelled();
					}
				}*/

//				this.showLeaseActive();

				$('#'+popupId+' #object').val(object);
				$('#'+popupId+' #objectId').val(objectId);
				$('#'+popupId+' #taskKey').val(taskKey);
//				this.applyPermissions();
				$('#'+popupId).data('backdrop','static');
				$('#'+popupId).data('keyboard','false');
				$('#'+popupId).modal('show');

				$(".currency").formatCurrency({symbol:""});
				
				var tooltipExcludedTasks = ['INSURANCE_QUOTES_REVIEW','INSURANCE_VENDOR_SELECTION'];
				if(tooltipExcludedTasks.indexOf(taskKey)==-1){
					this.initializeTooltipPopup(popupId);
				}
				 App.handleUniform();
				 $(".amount").formatCurrency();
				
			}
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
					object:object,investmentId:objectId,subObject:subObject,assetId:self.parentView.propertyModel.objectId}));
			$(".rent_agreement_tab_general").attr("id",tabId).removeClass("rent_agreement_tab_general");
		},
		removeRentalAgreementActiveTab:function(){
			$(".rentalAgreementNav.active").removeClass("active");
			$('.rentalAgreementNavTab.active').removeClass("active");
		},
		fetchTaskData: function(taskKey){

			var self=this;
			var object = self.object;
			if(self.currentObject=='49') {
				object = "Investment";
			}
			if(self.currentObject===96){
				object ='Asset'
				console.log('96 asset');
			}
			var self=this;
			if(taskKey.indexOf('WFA_')>-1){
				console.log('assetwf found, no need to use closing service for task data');
			}
			$.ajax({
                url: app.context()+'/closing/task/'+object+'/'+self.currentObjectId+'/'+taskKey,
                contentType: 'application/json',
                async : false,
                dataType:'json',
                type: 'GET',
                success: function(res){
                	self.singleTaskResponse=res;
           	
                	var i;
                	$.each(res, function(i, val) {
                		var formElement = $("#defaultTaskPopUp").find('[name='+i+']');
						if(i.indexOf('Date')!=-1 && formElement) {
							formElement.val(val);
							formElement.parent().data({date: val}).datepicker('update');
						}
						else if(formElement) {
							formElement.val(val);
						}
					});
                	//
                	$("#defaultTaskPopUp").find('.showMessageTooltip_2').attr('data-object', $("#defaultTaskPopUp").find('[name=object]').val());
                	$("#defaultTaskPopUp").find('.showMessageTooltip_2').attr('data-objectid', self.currentObjectId);
                	$("#defaultTaskPopUp").find('.showMessageTooltip_2').attr('data-taskKey_1', taskKey);
                	//
                },
                error: function(res){
                	console.log('Error in fetching task data');
                }
            });
		},
		
		submitAdhocTaskData: function(){
			var form=$('#defaultTaskPopUp');
			var self=this;
			
			if(form.validate().form()){
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});
				form.attr("enctype","multipart/form-data");
		
			if(self.isAssetWFTask){

			}else{
				form.ajaxSubmit({		
	    	        url: app.context()+'/closing/process',
	    	        async:false,
	    	        success: function(res){
	    	        	console.log('successfully saved the task data');
	    	        	$.unblockUI();
	    	        	
	    	        	var popup = $("#DEFAULT_POPUP_1");
						popup.modal("hide");
						popup.on('hidden.bs.modal', function (e) {
							self.render(self.object,self.objectId);
						});
	                },
	                error: function(res){
	                	console.log('error in submitting the task data');
	                	$.unblockUI();
	                	
	                	var popup = $("#DEFAULT_POPUP_1");
						popup.modal("hide");
						popup.on('hidden.bs.modal', function (e) {
							self.render(self.object,self.objectId);
						});
	                }
	    	    });
			}
			}
		},
		
		formValidation: function() {

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
		handleDates: function(){
			
			var projectedStartDate=this.singleTaskResponse.projectedStartDate;
			if(( $('#defaultTaskPopUp').find('input[name=startDate]').length>0 && !$('#defaultTaskPopUp').find('input[name=startDate]').val())) {
				var projectedDateArray = String(projectedStartDate).split('-');
				var projectedStartDateObj = new Date();
				projectedStartDateObj.setFullYear(projectedDateArray[2], projectedDateArray[0]-1, projectedDateArray[1]);
				//console.log(projectedStartDateObj);
				var currentDate = new Date();
				//console.log(projectedStartDateObj<=currentDate);
				 
				if(projectedStartDateObj<=currentDate) {
					 $('#defaultTaskPopUp').find('input[name=startDate]').val(projectedStartDate);
				}
				//update date-picker or fire its update event
			}

		},
		
		adhocFormValidation: function() {

			var form1 = $('#defaultTaskPopUp');
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
					startDate: {
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
						self.render(self.object,self.objectId);
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
		
		showReprojectModal: function(evt){
			var target=$(evt.target);
			var taskKey=target.data('taskkey');
			var objectId=target.data('objectid');
			var object= target.data('object');

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
			var target=$(evt.target).parent().parent().parent().find('.fa-comments-o');
			var taskKey=target.data('taskkey_1');
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
						self.render(self.object,self.objectId);
					});
				},
				error: function(res){
					var popup = $("#deleteWorkflowStep");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.render(self.object,self.objectId);
					});
				}
			});
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
			//$(".showMessageTooltip").hide();
			$(".showMessageTooltip_2").hide();

			var loadAllContent;
			this.model.loadAllMessagesAndDocuments(this.object,this.objectId,{
				success : function ( model, res ) {
					loadAllContent = res;
//					console.log("load all: " + JSON.stringify(loadAllContent));
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
						$('[data-taskkey="'+ element +'"]').parent().find('.showMessageTooltip_2').show();
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
		closePopover:function(evt) {
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
		submitPopupForm : function(evt) {

			console.log('submit popup form');

			var self = this;

			var document = this.currentForm.find('input[name=document]');
			if(this.milestoneTasksWithMandatoryDocument.indexOf(this.currentTaskKey)!=-1) {
				var existingDoc = this.currentForm.find('.showDocumentTooltip');
				if(document && document.val() == "" && existingDoc.css('display') == 'none') {
					$('#milestoneDocRequiredMsg').show();
					return false;
				} else {
					$('#milestoneDocRequiredMsg').hide();
				}
			} else {
				$('#milestoneDocRequiredMsg').hide();
			}
			
			if((this.currentTaskKey).indexOf("ASSET_MGMT_AGREEMENT")!=-1) {
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
			}
			
			if(this.currentForm.validate().form()) {
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
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});
				
				var nonMultipartTasks = ['INSURANCE_QUOTES_REVIEW','INSURANCE_VENDOR_SELECTION','INSURANCE_APPLICATION_SIGNATURE'];

				if(nonMultipartTasks.indexOf(self.currentTaskKey)==-1){
					if(self.isAssetWFTask === true){
						console.log('submit milestone asset wf task');
						var tForm = $('#MILESTONE_POPUP_1').find('form');
						console.log('tForm: ' + tForm);
						var sa = tForm.serializeArray();
						console.log(JSON.stringify(sa));
						var submitData={};
						_.each(sa,function(data, index){
							console.log('data: ' + data.name + ' value ' + data.value + "index" + index);
							submitData[data.name]=data.value
						});
						console.log('sdata: ' + JSON.stringify(submitData));

						$.ajax({
			                url: app.context()+'/myAssets/process',
			                contentType: 'application/json',
			                dataType:'json',
			                type: 'POST',
			                data: JSON.stringify(submitData),
			                success: function(res){
			                    console.log('success');
			                    $.unblockUI();
								self.currentPopup.modal('hide');
								self.currentPopup.on('hidden.bs.modal', function (e) {

									self.render(self.object,self.objectId);
								});
			                },
			                error: function(res){
			                    console.log('error: ' + JSON.stringify(res));
			                   $.unblockUI();
								self.currentPopup.modal('hide');
								self.currentPopup.on('hidden.bs.modal', function (e) {

									self.render(self.object,self.objectId);
								});
			                }
			            });
					
					}
					else{

					
						self.model.submitTaskData(this.currentForm,{
							success : function ( model, res ) {
								$.unblockUI();
								self.currentPopup.modal('hide');
								self.currentPopup.on('hidden.bs.modal', function (e) {
	//								self.refreshClosingSteps();
	//								if(self.parentView) {
	//									self.parentView.refreshClosingHeader();
	//								}
									self.render(self.object,self.objectId);
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
									self.refreshClosingSteps();
									if(self.parentView) {
										self.parentView.refreshClosingHeader();
									}
								});
								/*var error1 = $('#alertAddServiceContractFailure', $('#alertsForm'));
				             	error1.show();
		                 	App.scrollTo(error1, -200);
		                 	error1.delay(2000).fadeOut(2000);*/
							}
						});
					}
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
					} else if(self.currentTaskKey='INSURANCE_APPLICATION_SIGNATURE') {
						postData.comments = self.currentForm.find('[name=comments]').val();
						if($('#INSURANCE_APPLICATION_SIGNATURE_POPUP_1').find('#endDate').val()!=""){
							postData.endDate=$('#INSURANCE_APPLICATION_SIGNATURE_POPUP_1').find('#endDate').val();
						}
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
//								self.refreshClosingSteps();
//								if(self.parentView) {
//									self.parentView.refreshClosingHeader();
//								}
								self.render(self.object,self.objectId);
							});
							console.log(res);
						},
						error: function(res){
							$.unblockUI();
							self.currentPopup.modal('hide');
							self.currentPopup.on('hidden.bs.modal', function (e) {
//								self.refreshClosingSteps();
//								if(self.parentView) {
//									self.parentView.refreshClosingHeader();
//								}
								self.render(self.object,self.objectId);
							});
						}
					});
				}
			}

		},
		addFormValidations:function(){
			var self=this;
			var form3 = $('#propertyAppraisalForm');
			var error3 = $('.alert-danger', form3);
			var success3 = $('.alert-success', form3);
			$.validator.addMethod("dollarsscents", function(value, element) {
				return this.optional(element) || /^\d{1,8}(\.\d{0,2})?$/i.test(value);
			}, "Maximum 8 digits and 2 decimal places allowed");
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
					cost:{
						required: true
					},
					item:{
						required: true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					successRehab.hide();
				errorRehab.show();
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
			$.validator.addMethod("dollarsscents", function(value, element) {
				return /^\d{1,8}(\.\d{0,2})?$/i.test(value);
			}, "Maximum 8 digits and 2 decimal places allowed");
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

			//final-hud-form validations
			var finalHudForm=$(".final-hud-form");
			var errorHud = $('.alert-danger', finalHudForm);
			var successHud = $('.alert-success', finalHudForm);
			$.validator.addMethod("dollarsscents", function(value, element) {
				return this.optional(element) || /^\d{1,8}(\.\d{0,2})?$/i.test(value);
			}, "Maximum 8 digits and 2 decimal places allowed");
			$.validator.addMethod("percentage", function(value, element) {
				return this.optional(element) || /^\d{1,3}(\.\d{0,3})?$/i.test(value);
			}, "Maximum 3 digits and 3 decimal places allowed");
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
					}

				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					successHud.hide();
				errorHud.show();
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
		},
		showUploadDiv:function(){
			var isAgreementSigned=$('input[name=isAgreementSigned]:checked').val();
			
			if(isAgreementSigned=='No') {
				this.currentForm.find('input[name=document]').val("");
				$('#assetMgmtAgreementErrDiv').hide();
				$('#assetMgmtAgreementDiv').hide();
			} else {
				$('#assetMgmtAgreementErrDiv').hide();
				$('#assetMgmtAgreementDiv').show();
			}
		},
		closePopover:function(evt) {
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
		bsModalHide:function() {
			$('.showMessageTooltip').popover("hide");
			$('.showMessageTooltip').data('show',true);
			$('.showMessageTooltip').removeClass("tooTip-shown");
			$('.showDocumentTooltip').popover("hide");
			$('.showDocumentTooltip').data('show',true);
			$('.showDocumentTooltip').removeClass("tooTip-shown");
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
						self.render(self.object,self.objectId);
					});
				},
				error: function(res){
					var popup = $("#openWorkflowStep");
					popup.modal("hide");
					popup.on('hidden.bs.modal', function (e) {
						self.render(self.object,self.objectId);
					});
				}
			});
		},

		toggleOpenOrAllTasks: function(){
			var items;
			var allhide=0;

			if($("#showOpenTasksToggleButton").text() == "Show All") {
				$("#showOpenTasksToggleButton").text("Show Open");
				$("#allRowhidded").remove();
				
				items = $('td:nth-child(6)', '#calendar-table');
				for(var i=0;i<items.length;i++)
				{
					if(items[i].textContent == "Completed"){
						$(items[i]).closest("tr").show();
					}
				}
				if($("#calendar-table tbody tr td:eq(0)").text() == "No open steps found."){
					$("#calendar-table tbody tr td:eq(0)").text("No data available in table");
				}
			} else {
				$("#showOpenTasksToggleButton").text("Show All");

				items = $('td:nth-child(6)', '#calendar-table');
				for(var i=0;i<items.length;i++)
				{
					if(items[i].textContent == "Completed"){
						$(items[i]).closest("tr").hide();
						allhide++;
					}
				}

				if(allhide==items.length && $("#calendar-table tbody tr td:eq(0)").text() != "No data available in table" && $("#calendar-table tbody tr td:eq(0)").text() != "No open steps found."){
					$("#calendar-table tbody").append(' <tr class="dummy-row" id="allRowhidded"><td colspan="7" style="text-align:center;">No open steps found.</td></tr>');
				}

				if($("#calendar-table tbody tr td:eq(0)").text() == "No data available in table"){
					$("#calendar-table tbody tr td:eq(0)").text("No open steps found.");
				}
			}
		},

		exportCalendarTasksToExcel: function(){
			var export_link = $("#exportCalendarTasksLink");
          	if(export_link.get(0).click){
          		export_link.get(0).click();
          	} else {
      			//Custom code for safari download
      			
	            var click_ev = document.createEvent("MouseEvents");
	            // initialize the event
	            click_ev.initEvent("click", true /* bubble */, true /* cancelable */);
	            // trigger the evevnt
	            export_link.get(0).dispatchEvent(click_ev);
          	}
          },
		handleRadio: function(){
			var self = this;
			console.log('handle Radio');
			if($('[name=taskType]:checked').val()==="custom"){
				console.log('customSelected');
				$('#customFields').show();
				$('#presetTasks').hide();
				self.preset = false;
	    	 }
	    	 else{
	    	 	console.log('preset selected');
	    	 	$('#customFields').hide();
				$('#presetTasks').show();
	    		self.preset = true;
	    	 }

		}
		
	});
	return CalendarView;
});