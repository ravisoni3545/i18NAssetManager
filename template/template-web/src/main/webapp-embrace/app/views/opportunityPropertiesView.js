define(["text!templates/opportunitesProperties.html", "text!templates/opportunityInvestorReviewRow.html",
        "text!templates/uploadRightBidAgreement.html","text!templates/uploadPurchaseAgreement.html", "views/calendarView", "backbone","app",
        "collections/opportunitiesPropertiesCollection","accounting","text!templates/docusignEnvelope.html","text!templates/docusignEnvelopeStatus.html","text!templates/usersDropdown.html",
        "views/opportunityPropertyActionsView","views/codesView","views/stateCodesView","models/opportunitiesPropertyActionsModel","components-pickers","ckeditor"],
        function(opportunitesPropertiesTemplate, investorReviewRow,uploadRightBidAgreementRow,uploadPurchaseAgreementRow, calendarView, Backbone,app,collection,accounting,
        		docusignEnvelopeTemplate,docusignEnvelopeStatus,usersDropdown,opportunityPropertyActionsView,codesView,stateCodesView,opportunitiesPropertyActionsModel){

	var opportunitiesPropertiesView = Backbone.View.extend( {
		initialize: function(options){
			this.parent = options.parent;
			this.opportunityPropertyActionsView = new opportunityPropertyActionsView();
			this.rejecReasonCodesView = new codesView({codeGroup:'REJEC_REASON'});
			this.offerRejecReasonCodesView = new codesView({codeGroup:'O_REJ_REASON'});
			this.stateCodesView=new stateCodesView();
			this.finTypeView = new codesView({codeGroup:'OPP_FIN_TYPE'});
			this.mortgageTypeView = new codesView({codeGroup:'MORT_TYPE'});
		},
		model : new opportunitiesPropertyActionsModel(),
		currentForm : null,
		cancelledLostHilOppPropId : "",
		cancelledLostHilOppPropObj : "",
		state : null,
		collection:new collection(),
		oppPropertyStatusActionsMap:{},
		oppPropertyHilGroup:[],
		opportunityId:"",
		// oppPropertyStatusGearActionsMap:{"Manual Recommendation":["Initiate RightBid Process"],"Offer Created":["Upload RightBid Agreement"],"Offer Accepted":["Upload Purchase Agreement"]},
		oppPropertyStatusGearActionsMap:{},
		oppPropertyModalData:{},
		oppPropertyTable:{},
		errorMessage:{},
		isRowInsertedToDT:false,
		self:this,
		el:"#opportunityPropertiesTab",
		// showBidRangeCondition:["RightBid Range Rejected","RightBid Agreements Signed","RightBid Agreements Submitted to Investor","RightBid Range Approved","RightBid Range Created","RightBid Process Initiated"],
		events          : {
			"click  .investorReviewBtn":"showInvestorReviewRow",
			"click  .removeProperty":"showRemoveProperty",
			"click  .initiateRightBid":"initiateRightBid",
			"click .cancelToggleBtnClass":"cancelToggleBtnClick",

			"click #oppPropertyYesNoConfirmBtn":"oppPropertyYesNoConfirmBtnClick",
			"click #oppPropertyNoConfirmBtn":"oppPropertyNoConfirmBtnClick",
			"click .uploadRightBidAgreement":"showRightBidAgreementRow",
			"click .uploadPurchaseAgreement":"showPurchaseAgreementRow",			
			"click .createEnvelopeButton": "createEnvelopeAndUploadFile",
			"change input[name=rightBidAgreement]": "fileSelectedRightBidAgg",
			"click .tagAndSendEnvelopeButton":"tagAndSendEnvelope",
			'click .updateEnvelopeInfoButton' : 'manualRefreshEnvelopeInfo',
			'click .launchManagementConsole' : 'launchDocusignManagementConsole',
			'click .sendRecipientLinkButton' : 'sendRecipientLink',
			'click .reviewPALinkButton' : 'reviewPA',
			'click .viewPALinkButton' : 'viewPA',
			"click .showAddressDiv":"showAddressDiv",
			"click .hideAddressDiv":"hideAddressDiv",
			'keyup .showExistingAddress': 'showExistingAddress',
			'change .showExistingAddress': 'showExistingAddress',
			'click .existingaddress':'showAddressDiv',
			'click .hilGroupBtn':'showByHilGroup',
			'click .hilGroupRemoveBtn':'removeHilBtn',
			'change input[name=counterType]':'handleCounterType',
			'change #financingTypeDD [name=financingType]': "finacingTypeChanged",
			'keyup #downPaymentPercentage': "calculateDownPayment",
			'keyup #offerAmount_currency': "calculateDownPayment",


			//workflow driven UI events
			'click .directActionButton' : 'executeDirectAction',
			'click .formActionButton' : 'showFormForAction',
			"click .saveToggleBtnClass":"saveFormForAction",
			"change input[name=isNormal]":"changeIsNormal",
			"click #emailOffer" :"openEmailOfferPopUp",
			"click #sendOfferEmailButton" : "sendOfferEmailToListingAgent",
			"click .fa-table":"showOfferHistory",
			"click .fa-calendar":"showTasks",
			"click .ippropertypage":"showippropertypage",

			"change input[name=isLpoa]":"islpoaEvent",
			//docusign events
			"click #tagAndSendConfirmationButton":"handleTagAndSend",
			//"click #cboxClose":"tagAndSendCloseHandler"
			
			//PA creation
			"click #createPAbuttn":"createPA",
			"click #confirmCancelProperty":"confirmCancelProperty",
			"click .cancelProperty":"initiateCancelProperty",
			"change .cancelReason": "cancelReasonChange",
			"click .rollbackProperty":"initiateRollbackProperty",
			"click #confirmRollbackProperty":"confirmRollbackProperty",
			"click #cancelledLostConfirmationButton" : "cancelledLostConfirmation",
			"click .cancelledLost" : "cancelledLost",
			"click #undoCancelledLostConfirmationButton" : "undoCancelledLostConfirmation",
			"click .undoCancelledLost" : "undoCancelledLost"
		},
		 isProofOffundsuploaded:null,
		 isPreQualdocsuploaded:null,
		render : function (context) {
			var self = this;
			var essentials = {};
			var oppMgmtPermission = false;
			essentials.parentObj = self.parent.model.attributes.opportunityResponse.opportunityObj;
			essentials.parentObjId = self.opportunityId;
			if($.inArray("OpportunityManagement",app.sessionModel.attributes.permissions) != -1){
				//to allow opportunity property cancellation only to users with OpportunityManagement permission 
				oppMgmtPermission = true;
			}
			this.template = _.template(opportunitesPropertiesTemplate)({essentials:essentials,propertiesData:this.collection.models,hilGroupData:oppPropertyHilGroup,
				statusActionsMap:oppPropertyStatusActionsMap,accounting:accounting,oppPropertyStatusGearActionsMap:this.oppPropertyStatusGearActionsMap,opportunityPropertyActionsView:this.opportunityPropertyActionsView,oppMgmtPermission:oppMgmtPermission});
			this.$el.html("");
			this.$el.html(this.template);
			app.selectedHilGroupList = [];

			if(!this.huSigners) {
				this.fetchHUSignerUsers();
			}

			$('#hilOppPropertyTable').on( 'draw.dt', function () {
				$('.hopNameTooltip').tooltip({
					animated: 'fade',
					placement: 'bottom'
				});
				self.trigger('PropertiesTableDrawn');
				App.handleUniform();
			});

			var dataTable = $("#hilOppPropertyTable").dataTable({
				// "sScrollY": "100%",
				// "sScrollY": "100%",

				"sScrollX": "100%",
				// "sScrollCollapse": true,
				"bPaginate": true,  
				"bInfo": true,  
				"bFilter": true,
				"bAutoWidth": false,
				"bStateSave": true,
				"aoColumnDefs": [
				                 { "sWidth": "27%", "aTargets": [ 0 ], "bSortable": false },
				                 { "sWidth": "5%", "aTargets": [ 1 ], "bSortable": false },
				                 { "sWidth": "10%", "aTargets": [ 2 ], "bSortable": false },
				                 { "sWidth": "10%", "aTargets": [ 3 ], "bSortable": false },
				                 { "sWidth": "10%", "aTargets": [ 4 ], "bSortable": true },
				                 { "sWidth": "14%", "aTargets": [ 5 ], "bSortable": false },
				                 { "sWidth": "20%", "aTargets": [ 6 ], "bSortable": false },
				                 { "sWidth": "5%", "aTargets": [ 7 ], "bSortable": false }
				                 ],
				                 "aaSorting": []
			});

			$('#hilOppPropertyTable_wrapper .dataTables_scrollBody').css({"overflow":"visible","width":"100%"});
			$('#hilOppPropertyTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");
			$("#hilOppPropertyTable_wrapper .dataTables_scrollHead table").css("margin-top","0px");
			$("#hilOppPropertyTable_wrapper .dataTables_scrollBody table").css("margin-top","-3px");
            $('select[name=hilOppPropertyTable_length]').addClass('form-control');
            $('#hilOppPropertyTable_filter input').css('border','1px solid #e5e5e5');
			$(".amount").formatCurrency({roundToDecimalPlace:-2});

			self.oppPropertyTable = dataTable;

			/*$('.hopNameTooltip').tooltip({
				animated: 'fade',
				placement: 'bottom'
			});*/
			 App.handleUniform();
			self.parent.disableButtons();

			self.isRowInsertedToDT = false;
			$(window).on('resize', function () {
				if(!self.isRowInsertedToDT && $('#hilOppPropertyTable').dataTable() && $('#hilOppPropertyTable').dataTable().length){
					$('#hilOppPropertyTable').dataTable().fnAdjustColumnSizing();
				}
			});
		},
		fetchOpportunityProperties: function(){
			var self = this;
			self.collection.fetch({
				success:function(data){
					oppPropertyStatusActionsMap = data.oppPropertyStatusActionsMap;
					oppPropertyHilGroup=data.hilgroup;
					self.render();
				},
				error:function(res){
					console.log(res);
				}
			});
		},

		addRecentlyAddedatFirst:function(res){


			var self=this;
			self.collection.add(res, {at: 0});
			self.render();

		},

		calculateDownPayment:function() {
			var offerAmount = $('input[name=offerAmount]').val();
			var percentage = $('#downPaymentPercentage').val();
			if(offerAmount!='' && percentage!='' && percentage!=null) {
				console.log('calculating downpayment');
				var downpayment = (offerAmount * percentage)/100;
				console.log(downpayment);
				$('input[name=downPayment]').val(downpayment);
				$('input[id=downPayment_currency]').val(downpayment).formatCurrency({symbol:""});
			}
		},

		executeDirectAction:function(evt) {
			var self=this;
			var popup = $("#oppPropertyYesNoModal");
			var object = $(evt.currentTarget).closest("tr").data('object');
			var objectId = $(evt.currentTarget).closest("tr").data('objectid');
			var taskKey = $(evt.currentTarget).data('taskkey');

			this.currentObject=object;
			this.currentObjectId=objectId;
			this.currentTaskKey=taskKey;

			// var hilOpportunityPropertyId = $(evt.currentTarget).closest("tr").data("objectid");
			/*var callBack = function(){
				return self.collection.initiateRightBid(hilOpportunityPropertyId,{
							success:function(res){
								console.log(res);
								self.fetchOpportunityProperties();
							},
							error:function(res){
								console.log("Initiating Right Bid for the Property failed");
							}
						});
			}*/
			self.oppPropertyModalData = {};
			var callBack = function(){

				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});

				var postData={};
				postData.taskKey=self.currentTaskKey;
				postData.objectId=self.currentObjectId;
				postData.object=self.currentObject;
				postData.endDate=new Date();
				console.log(postData);

				// TODO: Custom form data for direct actions need to be written like this
				/*if(self.currentTaskKey=='READY_INVESTOR_REVIEW') {
					postData.insuranceReviewObjects=self.getInsuranceReviewFormData();
					if($('#INSURANCE_QUOTES_REVIEW_POPUP_1').find('#endDate').val()!=""){
						postData.endDate=$('#INSURANCE_QUOTES_REVIEW_POPUP_1').find('#endDate').val();
					}
				}*/


				$.ajax({
					url: app.context()+'/hilOpportunityProperty/processNonMultipartForm',
					contentType: 'application/json',
					dataType:'json',
					type: 'POST',
					data: JSON.stringify(postData),
					async: true,
					success: function(res){
						$.unblockUI();
						//self.fetchOpportunityProperties();
						self.refreshAfterWorkflowAction(res);


						//TODO: Refresh opportunity header here
						//					if(self.parentView) {
						//						self.parentView.refreshClosingHeader();
						//					}
						console.log(res);
					},
					error: function(res){
						$.unblockUI();
						self.fetchOpportunityProperties();
						//TODO: Refresh opportunity header here
						//					if(self.parentView) {
						//						self.parentView.refreshClosingHeader();
						//					}
						console.log(res);
					}
				});
			}

			// TODO: Custom Header and body for the yes/no popup
			if(self.currentTaskKey=='READY_INVESTOR_REVIEW') {
				popup.find(".modal-title").html("Show in Wishlist");
				popup.find(".modal-body").html("Do you want to add this property into investor's wishlist?");
			}else if(self.currentTaskKey=='REMOVE_PROPERTY') {
				popup.find(".modal-title").html("Remove Property");
				popup.find(".modal-body").html("Are you sure want to remove this property?");
			}
			else if(self.currentTaskKey=='INITIATE_CLOSING'){
				//app.router.closing(self.currentInvestmentId,null);
				self.model.loadTaskData(self.currentTaskKey,self.currentObject,self.currentObjectId,{
					success : function ( model, res ) {
						console.log("res :"+res);
						self.currentInvestmentId = res.investmentId;
					},error: function (model,res){
						console.log("Fetching Task data for property actions failed");
					}
				});

				window.location.hash='#closing/'+self.currentInvestmentId;
				return;
			}

			self.oppPropertyModalData.callBack = callBack;
			popup.modal("show");
		},
		showFormForAction: function(evt) {
			var self = this;
			var showpopup = $(evt.currentTarget).data("showpopup");
			var row = $(evt.currentTarget).closest("tr");
			var box = $(evt.currentTarget).closest("td");
			if(showpopup){
				self.hideAllHiddenRows();
				var object = row.data('object');
				var objectId = row.data('objectid');
				var taskKey = $(evt.currentTarget).data('taskkey');
				var subtaskKey = $(evt.currentTarget).data('subtaskkey');
				console.log(taskKey);
				self.currentObject=object;
				self.currentObjectId=objectId;
				self.currentTaskKey=taskKey;
				self.currentSubtaskKey=subtaskKey;

				var template = null;
				var templateKey = taskKey;
				if(subtaskKey) {
					templateKey = taskKey+"_"+subtaskKey;
				}
				
				template = self.opportunityPropertyActionsView.getActionView(templateKey);
				
				row.after(template);
				self.isRowInsertedToDT = true;

				var currentForm = row.next().find("form");
				self.currentForm = currentForm;
				var model = self.collection.findWhere({"hilOppPropertyId":objectId.toString()});
				self.state = model.attributes.state;

				switch(taskKey){
				case "INVESTOR_REVIEW":
					self.investorReviewFormValidation(currentForm);
					break;
				case "PROPERTY_REJECTED":
					self.rejecReasonCodesView.render({el:$('#rejectionReasonDropdown'),codeParamName:"rejectionReason"});
					break;
				case "READY_TO_INVEST":
					box.append('<span id="progressMsg">Loading..</span>');
					self.stateCodesView.render({el:currentForm.find('.state')});
					self.finTypeView.render({el:currentForm.find('#financingTypeDD'),codeParamName:"financingType",addBlankFirstOption:"true"});
					self.mortgageTypeView.render({el:currentForm.find('#mortgageTypeDD'),codeParamName:"mortgageType",addBlankFirstOption:"true"});
					var usersDropdownTemplate = _.template(usersDropdown);
					self.$el.find('#husignerDD').html('');
					self.$el.find('#husignerDD').html(usersDropdownTemplate({name:'huSigner',id:'huSigner',users:this.huSigners,addBlankFirstOption:true,investorName:null}));

					var state = model.attributes.state;
				    self.isProofOffundsuploaded=null;
					self.isPreQualdocsuploaded=null;
					
					self.hideStateSpecificFields(currentForm,state);
					//TODO: set the value here for required fields
					// currentForm.find('.state select[name=state]').val("");
					self.readyToInvestFormValidation(currentForm);
					app.currencyFormatter();
					this.model.loadTaskData(taskKey,object,objectId,{
						success : function ( model, res ) {
							box.find('#progressMsg').remove();
							currentForm.find("#offerAmount").val(res.offerAmount);
							currentForm.find("#offerAmount_currency").val(res.offerAmount);
							currentForm.find("#emdAmount").val(res.emdAmount);
							currentForm.find("#emdAmount_currency").val(res.emdAmount);
							currentForm.find("#offerDate").val(res.offerDate);
							currentForm.find("#estimatedClosingDate").val(res.estimatedClosingDate);
							currentForm.find("#phoneNumber").val(res.phoneNumber);
							currentForm.find("#emailAddress").val(res.emailAddress);
							currentForm.find("#maritalStatus").val(res.maritalStatus);
							currentForm.find("#firstInvlegalName").val(res.firstInvlegalName);
							currentForm.find("#secondInvlegalName").val(res.secondInvlegalName);
							currentForm.find("#secInvPhoneNumber").val(res.secInvPhoneNumber);
							currentForm.find("#secInvEmailAddress").val(res.secInvEmailAddress);
							currentForm.find("#citizenship").val(res.citizenship);
							currentForm.find("#address1").val(res.address1);
							currentForm.find("#address2").val(res.address2);
							currentForm.find("#city").val(res.city);
							currentForm.find('.state select[name=state]').find('option[value="' + res.state+ '"]').attr('selected', 'selected');
							currentForm.find("#postalCode").val(res.postalCode);
							var strArray = [];
							var addressArray=[];
							var fullArray=[];

							if(res.dealType=="TKP"){
								currentForm.find("input[value=No][name=isNormal]").closest('label').hide();
							}

							if(res.address1){
								addressArray.push(res.address1);
							}
							if(res.address2){
								addressArray.push(res.address2);
							}
							if(res.city){
								strArray.push(res.city);
							}
							if(res.state){
								strArray.push(res.state);
							}
							if(res.postalCode){
								strArray.push(res.postalCode);
							}

							if(res.isLpoa=='true') {
								currentForm.find('#lpoa').click();
								currentForm.find('select[name=huSigner]').val(res.huSigner);
							}
							
							fullArray.push(addressArray.join(" ,"));
							fullArray.push(strArray.join(" ,"));
							currentForm.find(".existingaddress").val(fullArray.join(",\n"));

							var parentModel = self.parent.model.attributes
							var financingTypeEl = currentForm.find("#financingTypeDD select[name=financingType]");
							financingTypeEl.val(parentModel.investorBreadboxResponse.financingTypeId);
							financingTypeEl.change();
							
							if(res.financingType!='') {
								var finTypeVal = financingTypeEl.find('option').filter(function () { return $(this).html() == res.financingType; }).val(); 
								financingTypeEl.val(finTypeVal);
								financingTypeEl.change();
							}
							
							
							if(res.financingType=='Cash'&& res.isProofofFundsDocs==true){
								currentForm.find("#isProofdocsUploaded").removeClass("display-hide");
							}
							
							if(res.financingType=='Mortgage'&& res.isPreQualifyDocs==true){
								currentForm.find("#isPreQualdocsUploaded").removeClass("display-hide");
								
							}
							
							if(res.isProofofFundsDocs==true){
								 self.isProofOffundsuploaded="Yes";
							}
							
							if(res.isPreQualifyDocs==true){
								self.isPreQualdocsuploaded="Yes";
							}
							
							
							//populate mortgage fields
							if(res.financingType=='Mortgage' || res.financingType=='IRA Mortgage') {
								currentForm.find("select[name=mortgageType]").val(res.mortgageType);
								currentForm.find("#downPayment").val(res.downPayment);
								currentForm.find("#downPayment_currency").val(res.downPayment);
								currentForm.find("#interestRate").val(res.interestRate);
							}
							
							currentForm.find("#proofOfFundsDocumentDiv .showDocumentTooltip_2")
							.data("object",parentModel.opportunityResponse.opportunityObj)
							.data("objectid",parentModel.opportunityResponse.opportunityId)
							.data("subobject",parentModel.investorBreadboxResponse.subObject)
							.data("subobjectid",parentModel.investorBreadboxResponse.investorBreadboxId)
							.data("taskkey_1","Proof of Funds");
							currentForm.find("#uploadPreLetterDiv .showDocumentTooltip_2")
							.data("object",parentModel.opportunityResponse.opportunityObj)
							.data("objectid",parentModel.opportunityResponse.opportunityId)
							.data("subobject",parentModel.investorBreadboxResponse.subObject)
							.data("subobjectid",parentModel.investorBreadboxResponse.investorBreadboxId)
							.data("taskkey_1","Pre Qualified Letter");
						},
						error: function (model,res){
							box.find('#progressMsg').remove();
							console.log("Fetching Task data for property actions failed");
						}
					});
//					$(".amount").formatCurrency();
					$(".currency").formatCurrency({symbol:""});

					app.currencyFormatter();
					ComponentsPickers.init();
					break;
				case "CREATE_OFFER":
					var subtask = $(evt.currentTarget).html();
					app.currencyFormatter();
					self.createOfferFormValidation(currentForm);
					box.append('<span id="progressMsg">Loading..</span>');
					this.model.loadTaskData(taskKey,object,objectId,{
						success : function ( model, res ) {
							console.log(box.find('#progressMsg'));
							box.find('#progressMsg').remove();
							console.log(res);
							if(jQuery.isEmptyObject(res.offerId)){
								res.hilOppPropertyId = res.objectId;
								self.refreshAfterWorkflowAction(res);
								return;
							}
							currentForm.find("#offerAmount").val(res.offerAmount);
							currentForm.find("#offerAmount_currency").val(res.offerAmount);
							currentForm.find("#emdAmount").val(res.emdAmount);
							currentForm.find("#emdAmount_currency").val(res.emdAmount);
							currentForm.find("#offerDate").val(res.offerDate);
							currentForm.find("#object").val(res.object);
							currentForm.find("#objectId").val(res.objectId);
							currentForm.find("#offerId").val(res.offerId);
							currentForm.find("#taskId").val(res.taskId);
							currentForm.find("#estimatedClosingDate").val(res.estimatedClosingDate);
							currentForm.find("#subtask").val(subtask);
							
							if(res.isLpoa=="Y"){
							currentForm.find("#isLpoa").text("Yes");
							
							if(res.huSignerEmail){
							
							//currentForm.find("#husigner").text("HU Signer:");
							currentForm.find("#husignerEmail").text(res.huSignerEmail);
							currentForm.find("#husigner").removeClass("display-hide");
							//currentForm.find("#husignerEmail").removeClass("display-hide");
							}
							}else{
								currentForm.find("#isLpoa").text("No");
								if(res.investorEmail){
									currentForm.find("#investor").removeClass("display-hide");
									currentForm.find("#investorEmail").text(res.investorEmail);
									}
								
								if(res.cobuyerEmail){
									//currentForm.find("#cobuyer").text("CoBuyer:");
									currentForm.find("#coBuyermail").text(res.cobuyerEmail);
									currentForm.find("#cobuyer").removeClass("display-hide");
								}
								
							}
							if(res.templateAvailable==true && jQuery.isEmptyObject(res.embraceEnvelopeId)){
								currentForm.find("#createPAbuttnBox").show();
							}
							if(subtask=='Review Offer' && jQuery.isEmptyObject(res.embraceEnvelopeId)){
								self.embraceEnvelopeId = null;
								self.currentForm.find('.docusignEnvelopeArea').html("");
								self.currentForm.find('.docusignOthEnvelopeArea').html("");
								self.currentForm.find('#plainPaAgreement').remove();
								currentForm.find("#createPAbuttnBox").hide();
							} else {
								var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
								var docusignOthEnvelopePage = _.template( docusignEnvelopeStatus );
								
								self.currentForm.find('.docusignEnvelopeArea').html("");
								self.currentForm.find('.docusignOthEnvelopeArea').html("");
	//							res.documentTaskKey = 'CREATE_OFFER';
	//							res.envelopeTaskKey = 'CREATE_OFFER';
	//							res.documentTypes = 'Purchase Agreement';
								self.embraceEnvelopeId = null;
								self.embraceEnvelopeId = res.embraceEnvelopeId;
								if(!jQuery.isEmptyObject(res.embraceEnvelopeId)){
									self.currentForm.find('#plainPaAgreement').remove();
								}
								res.app = app;
								self.currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));
								if(res.otherEnvelopeDTO) {
									self.currentForm.find('.docusignOthEnvelopeArea').html(docusignOthEnvelopePage({popupData:res.otherEnvelopeDTO,docusignname:res.otherEnvelopeName}));
								}
							}
							self.envelopeData = res;
						},
						error: function (model,res){
							box.find('#progressMsg').remove();
							console.log("Fetching Task data for property actions failed");
						}
					});
					$(".currency").formatCurrency({symbol:""});
//					$(".amount").formatCurrency();
					//app.currencyFormatter();

					ComponentsPickers.init();
					break;

				case "SUBMIT_OFFER":
					app.currencyFormatter();
					self.createOfferFormValidation(currentForm);
					this.model.loadTaskData(taskKey,object,objectId,{
						success : function ( model, res ) {
							for(attr in res) {
								var formElement = self.currentForm.find('[name='+attr+']');
								if(attr.indexOf('Date')!=-1 && formElement) {
									formElement.parent().data({date: res[attr]}).datepicker('update');
								}
								if(formElement) {
									formElement.val(res[attr]);
								}

								if(attr==='mailSubject'){
									self.mailSubject=res[attr];
								}
								if(attr==='mailBody'){
									self.mailBody=res[attr];
								}

								if(attr==='listingAgentEmailAddress'){
									self.listingAgentEmailAddress=res[attr];
								}
								var offerForm=$("#sendOfferEmailForm");

								if(attr==='object'){
									offerForm.find('[name=object]').val(res[attr]);
								}
								if(attr=='objectId'){
									offerForm.find('[name=objectId]').val(res[attr]);
								}
								if(attr=='offerId'){
									offerForm.find('[name=offerId]').val(res[attr]);
								}
								if(attr=='opportunityId'){
									offerForm.find('[name=opportunityId]').val(res[attr]);
								}
								if(attr=='offerAmount' || attr=='emdAmount'){
									self.currentForm.find('#' + attr + '_currency').val(res[attr]);
								}
							}

							if(res["envelopeStatus"]=="sent"||res["envelopeStatus"]=="delivered"){
								var invSignMsg="**PA is sent for investor signature";
								self.currentForm.find('#investorSignMsg').text(invSignMsg);
							}else if(res["envelopeStatus"]=="completed"){
								var invSignMsg="**PA is signed by investor";
								self.currentForm.find('#investorSignMsg').text(invSignMsg);
							}else{
								var invSignMsg="**Purchase Agreement is not yet signed";
								self.currentForm.find('#investorSignMsg').text(invSignMsg);
							}
							if(res.otherEnvelopeDTO.envelopeStatus){
								self.currentForm.find('#othEnvSignMsg').text(res.otherEnvelopeDTO.envelopeStatus);
							}
							//self.currentForm.find('#othEnvSignMsg').text(res.otherEnvelopeDTO.envelopeStatus);
						},
						error: function (model,res){
							console.log("Fetching Task data for property actions failed");
						}
					});
					$('.currency').formatCurrency({symbol:""});
					//app.currencyFormatter();
					ComponentsPickers.init();
					break;

				case "UPLOAD_PA":
					app.currencyFormatter();	
					self.uploadFinalPurchaseAgreementValidation(currentForm);
					this.model.loadTaskData(taskKey,object,objectId,{
						success : function ( model, res ) {
							for(attr in res) {
								var formElement = self.currentForm.find('[name='+attr+']');
								if(attr.indexOf('Date')!=-1 && formElement) {
									formElement.parent().data({date: res[attr]}).datepicker('update');
								}
								if(formElement) {
									formElement.val(res[attr]);
								}
								if(attr=='offerAmount' || attr=='emdAmount'){
									self.currentForm.find('#' + attr + '_currency').val(res[attr]);
								}
							}

							if(res.financingType){
								self.financingType=res.financingType;
							}
						},
						error: function (model,res){
							console.log("Fetching Task data for property actions failed");
						}
					});
					$('.currency').formatCurrency({symbol:""});
					//app.currencyFormatter();
					ComponentsPickers.init();
					break;
					/*case "INITIATE_CLOSING":
						this.model.loadTaskData(taskKey,object,objectId,{
							success : function ( model, res ) {
								console.log("res :"+res);
								self.currentInvestmentId = res.investmentId;
							},error: function (model,res){
								console.log("Fetching Task data for property actions failed");
							}
						});
						break;*/
				case "CREATE_PA":
					self.createPAFormValidation(currentForm);
					this.model.loadTaskData(taskKey,object,objectId,{
						success : function ( model, res ) {
							console.log("res :"+res);
							currentForm.find("#object").val(res.object);
							currentForm.find("#objectId").val(res.objectId);
							currentForm.find("#offerId").val(res.offerId);
							currentForm.find("#taskId").val(res.taskId);

							var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
							self.currentForm.find('.docusignEnvelopeArea').html("");
							self.embraceEnvelopeId = null;
							self.embraceEnvelopeId = res.embraceEnvelopeId;
							if(!jQuery.isEmptyObject(res.embraceEnvelopeId)){
								self.currentForm.find('#plainPaAgreement').remove();
							}
							res.app = app;
							self.currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));
						},
						error: function (model,res){
							console.log("Fetching Task data for property actions failed");
						}
					});
					break;

				case "OFFER_RESPONSE":
					self.offerRejecReasonCodesView.render({el:$('#offerRejectionReasonDropdown'),codeParamName:"offerRejectionReason"});
					if(subtaskKey=='REVIEW') {
						var subtask = $(evt.currentTarget).html();
						app.currencyFormatter();
						self.createOfferFormValidation(currentForm);
						box.append('<span id="progressMsg">Loading..</span>');
						this.model.loadTaskData(taskKey,object,objectId,{
							success : function ( model, res ) {
								console.log(box.find('#progressMsg'));
								box.find('#progressMsg').remove();
								console.log(res);
								currentForm.find("#offerAmount").val(res.offerAmount);
								currentForm.find("#offerAmount_currency").val(res.offerAmount);
								currentForm.find("#emdAmount").val(res.emdAmount);
								currentForm.find("#emdAmount_currency").val(res.emdAmount);
								currentForm.find("#offerDate").val(res.offerDate);
								currentForm.find("#object").val(res.object);
								currentForm.find("#objectId").val(res.objectId);
								currentForm.find("#offerId").val(res.offerId);
								currentForm.find("#taskId").val(res.taskId);
								currentForm.find("#estimatedClosingDate").val(res.estimatedClosingDate);
								currentForm.find("#subtask").val(subtask);
								
								if(jQuery.isEmptyObject(res.embraceEnvelopeId) && jQuery.isEmptyObject(res.counterEnvelopeId)){
									self.embraceEnvelopeId = null;
									self.currentForm.find('.docusignEnvelopeArea').html("");
									self.currentForm.find('.docusignOthEnvelopeArea').html("");
									self.currentForm.find('#plainPaAgreement').remove();
								} else {
									var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
									var docusignNCEnvelopePage = _.template( docusignEnvelopeStatus );
									
									self.currentForm.find('.docusignEnvelopeArea').html("");
									//self.currentForm.find('.docusignOthEnvelopeArea').html("");
									self.embraceEnvelopeId = null;
									self.embraceEnvelopeId = res.embraceEnvelopeId;
									
									if(jQuery.isEmptyObject(res.embraceEnvelopeId)) {
										res.embraceEnvelopeId = res.counterEnvelopeId;
										self.embraceEnvelopeId = res.embraceEnvelopeId;
										res.envelopeStatus = res.counterEnvelopeStatus;
										res.docusignEnvelopeRecipients = res.counterEnvelopeRecipients;
									}
									if(!jQuery.isEmptyObject(res.embraceEnvelopeId)){
										self.currentForm.find('#plainPaAgreement').remove();
									}
									res.app = app;
									self.currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));
								}
								self.envelopeData = res;
							},
							error: function (model,res){
								box.find('#progressMsg').remove();
								console.log("Fetching Task data for property actions failed");
							}
						});
						$(".currency").formatCurrency({symbol:""});
//						$(".amount").formatCurrency();
						//app.currencyFormatter();

						ComponentsPickers.init();
					} else if(subtaskKey=='COUNTER') {
						self.counterOfferFormValidation(currentForm);
						this.model.loadTaskData(taskKey,object,objectId,{
							success : function ( model, res ) {
								console.log("res :"+res);
								//currentForm.find("#offerAmount").val(res.offerAmount);
								if(res.offerHistory) {
									var tableHTML ="<table class='table table-striped table-bordered table-advance table-hover'>";
									tableHTML+="<thead><tr><th>Offer Date</th><th>Offer Amount</th><th>Offer Type</th><th>Status</th></tr></thead>";
									_.each(res.offerHistory,function(offer){
										tableHTML+="<tr>";
										tableHTML+="<td>"+offer.offerDate+"</td>";
										tableHTML+="<td class=amount>"+offer.offerAmount+"</td>";
										if(offer.offerType && offer.offerType!='null'){
											tableHTML+="<td>"+offer.offerType+"</td>";
										}
										else{
											tableHTML+="<td></td>";
										}

										tableHTML+="<td>"+offer.status+"</td>";
										tableHTML+="</tr>";
									});
									tableHTML+="</table>";
									console.log(tableHTML);
									currentForm.find("#offerHistoryTable").html(tableHTML);
									$(".amount").formatCurrency();
								}
								currentForm.find("#object").val(res.object);
								currentForm.find("#objectId").val(res.objectId);
								currentForm.find("#offerId").val(res.offerId);
								currentForm.find("#taskId").val(res.taskId);
								var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
								self.currentForm.find('.docusignEnvelopeArea').html("");
								self.embraceEnvelopeId = null;
								self.embraceEnvelopeId = res.embraceEnvelopeId;
								if(!jQuery.isEmptyObject(res.embraceEnvelopeId) && currentForm.find('input[name=counterType]:checked').val()=='Investor'){
									console.log('hiding document');
									this.currentForm.find('input[name=counterOfferDocument]').attr('disabled','disabled');
									this.currentForm.find('div[id=counterOfferDocument]').hide();
								}
								res.app = app;
								self.currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));
								self.handleCounterType();
								$('.currency').formatCurrency({symbol:""});
								app.currencyFormatter();
							},
							error: function (model,res){
								console.log("Fetching Task data for property actions failed");
							}
						});
					} else if(subtaskKey=='ACCEPT') {
						//self.counterOfferFormValidation(currentForm);
						var acceptType = $(evt.currentTarget).html();
						if (acceptType && acceptType.toUpperCase()=='ACCEPT') {
							self.uploadFinalPurchaseAgreementValidation(currentForm);
						} else {
							$('#finalPAForm').remove();
							$(currentForm).find('input[name=docType]').val('Counter Offer');
						}
						
						app.currencyFormatter();
						this.model.loadTaskData(taskKey,object,objectId,{
							success : function ( model, res ) {
								console.log("res :"+res);
								currentForm.find("#object").val(res.object);
								currentForm.find("#objectId").val(res.objectId);
								currentForm.find("#offerId").val(res.offerId);
								currentForm.find("#taskId").val(res.taskId);
								var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
								self.currentForm.find('.docusignEnvelopeArea').html("");
								self.embraceEnvelopeId = null;
								console.log(res.documentId);
								if(res.documentId && res.documentId!='null') {
									$('#sellerCounterOfferDocumentLink').attr('href','document/download/'+res.documentId);
									//								if(!jQuery.isEmptyObject(res.embraceEnvelopeId)){
									//									console.log('hiding document');
									//									this.currentForm.find('input[name=sellerCounterOfferDocument]').attr('disabled','disabled');
									//									this.currentForm.find('div[id=counterOfferDocument]').hide();
									//								}
									self.embraceEnvelopeId = res.counterEnvelopeId;
									self.counterDocumentId = res.documentId;
									res.embraceEnvelopeId = res.counterEnvelopeId;
									res.envelopeStatus = res.counterEnvelopeStatus;
									res.envelopeLastSent = res.counterEnvelopeLastSent;
									res.docusignEnvelopeRecipients = res.counterEnvelopeRecipients;
									res.app = app;
									self.currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));
								} else {
									console.log('hiding document');
									self.counterDocumentId = null;
									$('#sellerCounterOfferBox').hide();
								}
								for(attr in res) {
									var formElement = self.currentForm.find('[name='+attr+']');
									if(attr.indexOf('Date')!=-1 && formElement) {
										formElement.parent().data({date: res[attr]}).datepicker('update');
									}
									if(formElement) {
										formElement.val(res[attr]);
									}
									if(attr=='offerAmount' || attr=='emdAmount'){
										self.currentForm.find('#' + attr + '_currency').val(res[attr]);
									}
								}

								if(res.financingType){
									self.financingType=res.financingType;
								}
								//self.handleCounterType();
								$('.currency').formatCurrency({symbol:""});
								//app.currencyFormatter();
								ComponentsPickers.init();
							},
							error: function (model,res){
								console.log("Fetching Task data for property actions failed");
							}
						});
					}
					break;
				default:
				}

				App.handleUniform();
				ComponentsPickers.init();
				$(evt.currentTarget).data("showpopup",false);
			} else {
				$(evt.currentTarget).data("showpopup",true);
				self.hideHiddenRows(row.next());
			}

		},
		handleCounterType : function() {
			counterType=$('input[name=counterType]:checked').val();
			if(counterType=='Investor') {
				$('#counterTypeError').html('');
				$('#counterSubForm').show();
				if(!jQuery.isEmptyObject(this.embraceEnvelopeId)){
					console.log('hiding document for toggle'+this.embraceEnvelopeId);
					console.log(this.embraceEnvelopeId);
					this.currentForm.find('input[name=counterOfferDocument]').attr('disabled','disabled');
					this.currentForm.find('div[id=counterOfferDocument]').hide();
				} else {
					this.currentForm.find('input[name=counterOfferDocument]').removeAttr('disabled');
					this.currentForm.find('div[id=counterOfferDocument]').show();
				}
				$(".docusignEnvelopeArea").show();
			} else if(counterType=='Seller') {
				$('#counterTypeError').html('');
				$('#counterSubForm').show();
				console.log('showing document for toggle');
				this.currentForm.find('input[name=counterOfferDocument]').removeAttr('disabled');
				this.currentForm.find('div[id=counterOfferDocument]').show();
				$('.envelopeErrorMessage').html("");
				$(".docusignEnvelopeArea").hide();
			}
		},
		createPA: function(evt) {
			var form = this.currentForm;
			var target= $(evt.currentTarget);
			var self=this;
			var requestObj = {};
			requestObj.objectId=self.currentObjectId;
			requestObj.object=self.currentObject;
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Generating Purchase Agreement... </div>'
			});
			$.ajax({
				url: app.context()+'/offer/generatePurchaseAgreement',
				contentType: 'application/json',
				dataType:'json',
				type: 'POST',
				async:true ,
				data:JSON.stringify(requestObj),
				success: function(res){
					$.unblockUI();
					var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
					var docusignOthEnvelopePage = _.template( docusignEnvelopeStatus );
					
					self.currentForm.find('.docusignEnvelopeArea').html("");
					self.currentForm.find('.docusignOthEnvelopeArea').html("");
					self.embraceEnvelopeId = null;
					self.embraceEnvelopeId = res.embraceEnvelopeId;
					self.envelopeData = {};
					self.envelopeData.envelopeStatus = res.envelopeStatus;
					self.envelopeData.docusignEnvelopeRecipients = res.docusignEnvelopeRecipients;
					if(!jQuery.isEmptyObject(res.embraceEnvelopeId)){
						self.currentForm.find('#plainPaAgreement').remove();
						self.currentForm.find('#createPAbuttnBox').remove();
					}
					res.app = app;
					self.currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));
					if(res.otherEnvelopeDTO) {
						self.currentForm.find('.docusignOthEnvelopeArea').html(docusignOthEnvelopePage({popupData:res.otherEnvelopeDTO,docusignname:res.otherEnvelopeName}));
					}
				},
				error: function(res){
					$.unblockUI();
					self.currentForm.find('.envelopeMessage').html('Error in generating PA');
					console.error("Error in generating PA");
				}
			});
		},
		saveFormForAction: function(evt){
			console.log("saveToggleBtnClick");
			var self=this;
//			var form = $(evt.currentTarget).closest("form");
			var form = self.currentForm;

			var postData={};
			postData.taskKey=self.currentTaskKey;

			if(self.currentTaskKey=="OFFER_RESPONSE" && self.currentSubtaskKey=='COUNTER' ) {
				console.log(form.find('input[name=counterType]:checked').val());
				if(form.find('input[name=counterType]:checked').val()==null) {
					$('#counterTypeError').html('<text style="color:red; padding-left:5px;">Select counter offer type</text>');
					return;
				} else {
					$('#counterTypeError').html('');
				}
				var counterOfferDoc = self.currentForm.find("input[name=counterOfferDocument]");
				if(counterOfferDoc && counterOfferDoc.val() == "") {
					counterOfferDoc.attr("disabled","disabled");
				}
			} else if(self.currentTaskKey=="UPLOAD_PA"){
				if(!self.financingType){
					self.currentForm.parent().find('#uploadPAformFTAlert').show();
					return;
				}
				else{
					self.currentForm.parent().find('#uploadPAformFTAlert').hide();
				}
			} else if(self.currentTaskKey=="READY_TO_INVEST"){
				self.legalName = self.currentForm.find("#titleConveyedTo").val();
				var proofOfFundsDoc = self.currentForm.find("input[name=proofOfFunds]");
				if(proofOfFundsDoc && proofOfFundsDoc.val() == "") {
					proofOfFundsDoc.attr("disabled","disabled");
				}
				var preQualDoc = self.currentForm.find("input[name=preQualDocument]");
				if(preQualDoc && preQualDoc.val() == "") {
					preQualDoc.attr("disabled","disabled");
				}
				postData.investorBreadboxId = self.parent.model.attributes.investorBreadboxResponse.investorBreadboxId;
			} else if(self.currentTaskKey=="SUBMIT_OFFER"){
				self.listingAgentEmail = "";
			}
			postData.endDate=new Date();

			//Start
			var document=self.currentForm.find('[name=finalPaAgreement]');

			if(document && document.val() == "") {
				$("#uploadPAformAlertFailure").show();
				return;
			}
			//End

			// TODO: Custom form data for Form actions need to be written like this
			/*if(self.currentTaskKey=='INVESTOR_REVIEW') {
				postData.insuranceReviewObjects=self.getInsuranceReviewFormData();
				if($('#INSURANCE_QUOTES_REVIEW_POPUP_1').find('#endDate').val()!=""){
					postData.endDate=$('#INSURANCE_QUOTES_REVIEW_POPUP_1').find('#endDate').val();
				}
			}*/
			console.log(postData);
			console.log(form.validate().form());

			//TODO: Current ajax will work for form with or without document.
			//No need to create separate ajax call for form with documents. Copy the form from INVESTOR_REVIEW_FORM
			//Below code will work for all form with or without validation rules defined.
			if (form.validate().form()){
				console.log(self.currentTaskKey=="OFFER_RESPONSE");
				console.log(form.find('input[name=counterType]:checked').val()=='Seller');
				console.log(form.find('input[name=offerResponse]').val()=='Accept');
				if(self.currentTaskKey=="CREATE_OFFER" || self.currentTaskKey=="CREATE_PA" || (self.currentTaskKey=="OFFER_RESPONSE" && form.find('input[name=counterType]:checked').val()=='Investor' ) ||  (self.currentTaskKey=="OFFER_RESPONSE" && form.find('input[name=offerResponse]').val()=='Accept' && self.counterDocumentId!=null) || (self.currentTaskKey=="OFFER_RESPONSE" && form.find('input[name=offerResponse]').val()=='Review') ){
					if(!jQuery.isEmptyObject(self.embraceEnvelopeId)){
						var showProgressBar = "hide";
						if(form.find('#subtask').val()=='Review Offer') {
							showProgressBar = "show";
						}
						self.refreshEnvelopeStatusBlocking(self.embraceEnvelopeId,self.currentForm,showProgressBar);
						$('.envelopeErrorMessage').html("");
						if(form.find('#subtask').val()=='Review Offer' && self.envelopeStatus!='completed') {
							console.log('Review offer envelope not signed (completed)');
							var popup = $("#oppPropertyYesNoModal");
							popup.find(".modal-title").html("PA Confirmation");
							popup.find(".modal-body").html('Docusign Envelope is not completed yet. Are you sure you want to proceed without Signature?');
							self.oppPropertyModalData = {};
							var callBack = function(){
								$.blockUI({
									baseZ: 999999,
									message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
								});
	
								form.attr("enctype","multipart/form-data");
								form.ajaxSubmit({
									url: app.context()+'/hilOpportunityProperty/process',
									async:true,
									data:postData,
									success: function(res){
										$.unblockUI();
										self.refreshAfterWorkflowAction(res);
	
	
										//TODO: Refresh opportunity header here
										if(self.currentTaskKey=="READY_TO_INVEST"){
	//										self.parent.fetchOpportunityData(self.opportunityId);
	//										self.parent.renderHeader();
											$('#legalNameDiv > text').html(self.legalName);
	
										}
										var statusNotallowedForClosing = ["Ready to Invest","Purchase Agreement Created","Purchase Agreement Executed","Offer Created","Seller Counter Received","Investor Counter Submitted","Offer Submitted","Offer Accepted"];							
										if(statusNotallowedForClosing.indexOf(res.hopResponseDto.propertyStatus)!=-1){
											self.trigger('closingAllowedStatusChange');
										}
										
									},
									error: function(res){
										$.unblockUI();
										errorMessage=JSON.parse(res.responseText);
										if(self.currentTaskKey=="READY_TO_INVEST"){
											var proofOfFundsDoc = self.currentForm.find("input[name=proofOfFunds]");
											if(proofOfFundsDoc && proofOfFundsDoc.val() == "") {
												proofOfFundsDoc.attr("disabled",false);
											}
											var preQualDoc = self.currentForm.find("input[name=preQualDocument]");
											if(preQualDoc && preQualDoc.val() == "") {
												preQualDoc.attr("disabled",false);
											}
	
											$('#readyToInvestErrorMessage').show();
											if(errorMessage && errorMessage.message){
											$('#readyToInvestErrorMessage > text').html(errorMessage.message);
											}
											App.scrollTo($('#readyToInvestErrorMessage'), -200);
											$('#readyToInvestErrorMessage').delay(2000).fadeOut(4000);
										}
									}
	
								});
							}
							self.oppPropertyModalData.callBack = callBack;
							popup.modal("show");
							return false;
						}
					}else{	
						console.log('envelope not complete');
//						$('.envelopeErrorMessage').html("<p style='color:red;'>Please complete the envelope.</p>");
//						return;
//						if (confirm('Are you sure you want to save without uploading PA to docusign?')) {
//						    // continue
//						} else {
//						   return;
//						}
//						var BootstrapDialog = require('bootstrap-dialog');
//						BootstrapDialog.confirm({ title: 'PA Confirmation', message: 'Are you sure you want to save without uploading PA to docusign?', 
//							callback: function(result){
//								console.log('confirm dialog result ::'+result);
//					            if(result) {
//					            	self.continueFormSubmit(form,postData);
//					            }else {
//					            	 return;
//					            }
//							}
//				        });
//						return false;
						if(form.find('#subtask').val()!='Review Offer') {
							var popup = $("#oppPropertyYesNoModal");
							popup.find(".modal-title").html("PA Confirmation");
							popup.find(".modal-body").html('Are you sure you want to save without uploading PA to docusign?');
							self.oppPropertyModalData = {};
							var callBack = function(){
								$.blockUI({
									baseZ: 999999,
									message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
								});
	
								form.attr("enctype","multipart/form-data");
								form.ajaxSubmit({
									url: app.context()+'/hilOpportunityProperty/process',
									async:true,
									data:postData,
									success: function(res){
										$.unblockUI();
										// self.fetchOpportunityProperties();
										self.refreshAfterWorkflowAction(res);
	
	
										//TODO: Refresh opportunity header here
										if(self.currentTaskKey=="READY_TO_INVEST"){
	//										self.parent.fetchOpportunityData(self.opportunityId);
	//										self.parent.renderHeader();
											$('#legalNameDiv > text').html(self.legalName);
	
										}
										var statusNotallowedForClosing = ["Ready to Invest","Purchase Agreement Created","Purchase Agreement Executed","Offer Created","Seller Counter Received","Investor Counter Submitted","Offer Submitted","Offer Accepted"];							
										if(statusNotallowedForClosing.indexOf(res.hopResponseDto.propertyStatus)!=-1){
											self.trigger('closingAllowedStatusChange');
										}
										
									},
									error: function(res){
										$.unblockUI();
										errorMessage=JSON.parse(res.responseText);
										if(self.currentTaskKey=="READY_TO_INVEST"){
											var proofOfFundsDoc = self.currentForm.find("input[name=proofOfFunds]");
											if(proofOfFundsDoc && proofOfFundsDoc.val() == "") {
												proofOfFundsDoc.attr("disabled",false);
											}
											var preQualDoc = self.currentForm.find("input[name=preQualDocument]");
											if(preQualDoc && preQualDoc.val() == "") {
												preQualDoc.attr("disabled",false);
											}
											$('#readyToInvestErrorMessage').show();
											if(errorMessage && errorMessage.message){
											$('#readyToInvestErrorMessage > text').html(errorMessage.message);
											}
											App.scrollTo($('#readyToInvestErrorMessage'), -200);
											$('#readyToInvestErrorMessage').delay(2000).fadeOut(4000);
										}
	//									self.fetchOpportunityProperties();
										//TODO: Refresh opportunity header here
	//									self.parent.fetchOpportunityData(self.opportunityId);
	//									self.parent.renderHeader();
									}
	
								});
							}
							self.oppPropertyModalData.callBack = callBack;
						
							popup.modal("show");
							return false;
						}
					}
				/*if(self.envelopeStatus!='sent' && self.envelopeStatus!='completed'){
						console.log('envelope not sent/complete');
//						$('.envelopeErrorMessage').html("<p style='color:red;'>Please send the envelope.</p>");
//						return;
						if (confirm('Are you sure you want to save without uploading PA to docusign?')) {
							 // continue
						} else {
						   return;
						}
					} else {
						$('.envelopeErrorMessage').html("");
					}*/
				}else if((self.currentTaskKey=="OFFER_RESPONSE" && form.find('input[name=counterType]:checked').val()=='Seller' ) || (self.currentTaskKey=="OFFER_RESPONSE" && (form.find('input[name=offerResponse]').val()=='Accept' || form.find('input[name=offerResponse]').val()=='Review')) ) {
					console.log('not setting object, objectId 1');
//					postData.objectId=self.currentObjectId;
//					postData.object=self.currentObject;
				} else {
					console.log('setting object, objectId 2');
					postData.objectId=self.currentObjectId;
					postData.object=self.currentObject;
				}

		    	/*if(postData.taskKey=="SUBMIT_OFFER" && form.find('#investorSignMsg').text()!=''){
					var errorEl = self.$el.find('.alert-danger');
					errorEl.show();
					errorEl.find('text').html("Purchase Agreement is not yet signed. Please submit offer once it is signed by the investor.");
					App.scrollTo(errorEl, -200);
					errorEl.delay(2000).fadeOut(4000);
					console.log("Error in moving property to recommended");
					return;
				} */

				self.continueFormSubmit(form,postData);

			} else {
				var proofOfFundsDoc = self.currentForm.find("input[name=proofOfFunds]");
				if(proofOfFundsDoc && proofOfFundsDoc.val() == "") {
					proofOfFundsDoc.attr("disabled",false);
				}
				var preQualDoc = self.currentForm.find("input[name=preQualDocument]");
				if(preQualDoc && preQualDoc.val() == "") {
					preQualDoc.attr("disabled",false);
				}
			}

			if(document) {
				$("#uploadPAformAlertFailure").hide();
			}
		},
		continueFormSubmit:function(currForm,data){
			var self= this;
			var form = currForm;
			var postData = data;
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});

			form.attr("enctype","multipart/form-data");
			form.ajaxSubmit({
				url: app.context()+'/hilOpportunityProperty/process',
				async:true,
				data:postData,
				success: function(res){
					$.unblockUI();
					// self.fetchOpportunityProperties();
					self.refreshAfterWorkflowAction(res);


					//TODO: Refresh opportunity header here
					if(self.currentTaskKey=="READY_TO_INVEST"){
//						self.parent.fetchOpportunityData(self.opportunityId);
//						self.parent.renderHeader();
						$('#legalNameDiv > text').html(self.legalName);

					}
					if(self.currentTaskKey=="SUBMIT_OFFER"){
						if(!jQuery.isEmptyObject(self.listingAgentEmail)){
							$('#hilGroupMessage').removeClass("alert-success alert-danger");
							$('#hilGroupMessage').addClass("alert-success");
							$('#hilGroupMessage > text').html("Successfully sent the offer email to "+self.listingAgentEmail);
							$('#hilGroupMessage').show();
							App.scrollTo($('#hilGroupMessage'), -200);
							$('#hilGroupMessage').delay(4000).fadeOut(4000);
						}
					}
					var statusNotallowedForClosing = ["Ready to Invest","Purchase Agreement Created","Purchase Agreement Executed","Offer Created","Seller Counter Received","Investor Counter Submitted","Offer Submitted","Offer Accepted"];							
					if(res!=""&&statusNotallowedForClosing.indexOf(res.hopResponseDto.propertyStatus)!=-1){
						self.trigger('closingAllowedStatusChange');
					}
					
				},
				error: function(res){
					$.unblockUI();
					errorMessage=JSON.parse(res.responseText);
					if(self.currentTaskKey=="READY_TO_INVEST"){
						var proofOfFundsDoc = self.currentForm.find("input[name=proofOfFunds]");
						if(proofOfFundsDoc && proofOfFundsDoc.val() == "") {
							proofOfFundsDoc.attr("disabled",false);
						}
						var preQualDoc = self.currentForm.find("input[name=preQualDocument]");
						if(preQualDoc && preQualDoc.val() == "") {
							preQualDoc.attr("disabled",false);
						}

						$('#readyToInvestErrorMessage').show();
						if(errorMessage && errorMessage.message){
							$('#readyToInvestErrorMessage > text').html(errorMessage.message);
						}
						App.scrollTo($('#readyToInvestErrorMessage'), -200);
						$('#readyToInvestErrorMessage').delay(2000).fadeOut(4000);
					}
//					self.fetchOpportunityProperties();
					//TODO: Refresh opportunity header here
//					self.parent.fetchOpportunityData(self.opportunityId);
//					self.parent.renderHeader();
				}

			});
		},
		refreshAfterWorkflowAction:function(res){
			var self = this;
			/*self.parent.fetchOpportunityData(self.opportunityId);
			self.parent.renderHeader();*/

			var requiredModel = self.collection.findWhere({hilOppPropertyId:res.hilOppPropertyId});
			console.log(requiredModel);
			var index = self.collection.indexOf(requiredModel);
			console.log(index);
			self.collection.remove(self.collection.at(index));
			self.collection.add(res.hopResponseDto, {at: index});
			self.render();

			// $(".amount").formatCurrency();
		},
		showInvestorReviewRow: function(evt){
			var showpopup = $(evt.currentTarget).data("showpopup");
			if(showpopup){
				var template = _.template(investorReviewRow)({targetAction:".investorReviewBtn"});
				$(evt.currentTarget).closest("tr").after(template);
				$(evt.currentTarget).data("showpopup",false);
			} else {
				$(evt.currentTarget).data("showpopup",true);
				this.hideHiddenRows($(evt.currentTarget).closest("tr").next());
			}
		},
		/*saveToggleBtnClick: function(evt){
			console.log("saveToggleBtnClick");
			var self = this;
			var savingDone = false;
			var targetAction = $(evt.currentTarget).parent().data("targetaction");
			var objectId=$(evt.currentTarget).closest('tr').prev().data('objectid');
			var object=$(evt.currentTarget).closest('tr').prev().data('object');


			switch(targetAction){
				case ".investorReviewBtn":
					//TODO: necessary validation and ajax for saving..
					//If done call
					// call ajax through collection
					//if success change savingDone to true
					//ajax should return the entire row data
					//add to collection and refresh the row 
				        break;
				case ".uploadRightBidAgreement":
					var tbody=$(evt.currentTarget).closest('tr').find("#bidOfferBody");
					savingDone=self.saveRBAgreement(object,objectId,tbody);
				        break;
				case ".uploadPurchaseAgreement":
					savingDone=self.saveuploadPurchaseAgreement(evt);

					break;
			    default:
			    	console.log("No action found for : " + targetAction);
			        // default code block
			}

			if(savingDone){
				self.cancelToggleBtnClick(evt);
				self.fetchOpportunityProperties();
			}
		},*/
		cancelToggleBtnClick: function(evt){
			var self = this;
			var row = $(evt.currentTarget).closest("tr");
			var previousRow = row.prev();
			// var targetAction = $(evt.currentTarget).parent().data("targetaction");
			var targetAction = previousRow.find(".formActionButton." + self.currentTaskKey);
			targetAction.data("showpopup",true);
			this.hideHiddenRows(row);
		},
		hideHiddenRows: function(row){
			var self = this;
			self.isRowInsertedToDT = false;
			$('.collapse.in').collapse('hide');
			setTimeout(function(){self.deleteHiddenRow(row)},500);
		},
		hideAllHiddenRows: function(){
			var self = this;
			var requiredRows = $(".collapse.in").closest("tr");
			// $('.collapse.in').collapse('hide');
			_.each(requiredRows,function(el){
				// self.deleteHiddenRow(el);
				$(el).prev().find(".formActionButton").data("showpopup",true);
				self.hideHiddenRows(el);
			});
		},
		deleteHiddenRow: function(row){
			$(row).remove();
		},
		initiateRightBid:function(evt){
			var self = this;
			var hilOpportunityPropertyId = $(evt.currentTarget).closest("tr").data("objectid");
			var callBack = function(){
				return self.collection.initiateRightBid(hilOpportunityPropertyId,{
					success:function(res){
						console.log(res);
						self.fetchOpportunityProperties();
					},
					error:function(res){
						console.log("Initiating Right Bid for the Property failed");
					}
				});
			}

			var popup = $("#oppPropertyYesNoModal");
			popup.find(".modal-title").html("Initiate RightBid");
			popup.find(".modal-body").html("Are you sure want to initiate rightBid for this property?");
			self.oppPropertyModalData = {};
			self.oppPropertyModalData.callBack = callBack;
			popup.modal("show");
		},
		showRemoveProperty:function(evt){
			var self = this;
			var hilOpportunityPropertyId = $(evt.currentTarget).closest("tr").data("objectid");
			var callBack = function(){
				return self.collection.removeProperty(hilOpportunityPropertyId,{
					success:function(res){
						console.log(res);
					},
					error:function(res){
						console.log("Removing Property from opportunity property list failed");
					}
				});
			}

			var popup = $("#oppPropertyYesNoModal");
			popup.find(".modal-title").html("Remove Property");
			popup.find(".modal-body").html("Are you sure want to remove this property?");
			self.oppPropertyModalData = {};
			self.oppPropertyModalData.callBack = callBack;
			popup.modal("show");
		},
		oppPropertyYesNoConfirmBtnClick:function(evt){
			var self = this;
			if(self.oppPropertyModalData.callBack){
				self.oppPropertyModalData.callBack();
			}
			$("#oppPropertyYesNoModal").modal("hide");
		},
		oppPropertyNoConfirmBtnClick:function(evt){
			var self = this;
			if(self.currentForm){
				var counterOfferDocument = self.currentForm.find("input[name=counterOfferDocument]");
				if(counterOfferDocument && counterOfferDocument.val() == "") {
					counterOfferDocument.attr("disabled",false);
				}
				var plainPaAgreement = self.currentForm.find("input[name=plainPaAgreement]");
				if(plainPaAgreement && plainPaAgreement.val() == "") {
					plainPaAgreement.attr("disabled",false);
				}
			}
		},
		showRightBidAgreementRow: function(evt){
			var self=this;
			var objectId = $(evt.currentTarget).closest("tr").data("objectid");
			var object = $(evt.currentTarget).closest("tr").data("object");

			var showpopup = $(evt.currentTarget).data("showpopup");
			if(showpopup){
				self.fetchOfferDetails(object,objectId);
				// self.hideAllHiddenRows();
				var template = _.template(uploadRightBidAgreementRow)({targetAction:".uploadRightBidAgreement",offers: self.offerDetails,object:object,objectId:objectId});
				$(evt.currentTarget).closest("tr").after(template);
				$(evt.currentTarget).data("showpopup",false);
			} else {
				$(evt.currentTarget).data("showpopup",true);
				this.hideHiddenRows($(evt.currentTarget).closest("tr").next());
			}

		},
		fileSelectedRightBidAgg:function(evt){
			if($(evt.currentTarget).val()){
				$(evt.currentTarget).parent().find(".createEnvelopeButton").prop("disabled",false);
			} else {
				$(evt.currentTarget).parent().find(".createEnvelopeButton").prop("disabled",true);
			}
		},
		fetchOfferDetails : function(object,objectId){
			var self=this;
			$.ajax({
				url: app.context()+'/offer/getOfferDetails/'+object+'/'+objectId,
				type: 'GET',
				async:false,
				success: function(res){
					console.log('Get offer status '+res);
					self.offerDetails=res;
				},
				error: function(res){
					console.log('Failed to get the offer details '+res);
				}
			});
		},

		createEnvelopeAndUploadFile : function(evt){
			var target= $(evt.currentTarget);
			var self=this;
			self.currentForm=target.closest('form');


			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Creating Envelope... </div>'
			});
			this.currentForm.attr("enctype","multipart/form-data");
			this.currentForm.ajaxSubmit({
				url: app.context()+'/offer/uploadAgreement',
				success: function(res){
					$.unblockUI();
					console.log('successfully created envelope embraceEnvelopeId '+res.embraceEnvelopeId+" docusignEnvelopeId "+res.docusignEnvelopeId+' message '+res.message);
					self.currentForm.find('.envelopeMessage').html('Envelope Created');
					self.currentForm.find('[name=rightBidAgreement]').remove();
					self.currentForm.find('#plainPaAgreement').remove();
					if(!jQuery.isEmptyObject(res.embraceEnvelopeId)){
						self.currentForm.find('#createPAbuttnBox').remove();
					}
					self.embraceEnvelopeId=res.embraceEnvelopeId;
					//self.refreshEnvelopeStatus(res.embraceEnvelopeId,self.currentForm);
					self.refreshEnvelopeStatusBlocking(res.embraceEnvelopeId,self.currentForm);
					self.handleCounterType();
					//$('#optionTagAndSend').modal('show');
					self.handleTagAndSend();
				},
				error: function(res){
					$.unblockUI();
					console.log('failed to create envelope '+res.message);
					self.currentForm.find('.envelopeMessage').html('Envelope Creation Failed');
				}
			});
		},

		tagAndSendEnvelope : function(evt){
			var self=this;
			var target = $(evt.currentTarget);
			var embraceEnvelopeId = target.data('envelopeid');
			this.embraceEnvelopeId = embraceEnvelopeId;

			self.currentForm=target.closest('form');

			this.handleTagAndSend();
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
		reviewPACloseHandler : function(evt) {
			console.log('Closing reviewPA popup');
			var self = evt.data.self;
			//self.refreshEnvelopeStatus(self.embraceEnvelopeId,self.currentForm);
			console.log(self.envelopeStatus);
			self.envelopeData.docusignEnvelopeRecipients.every(function(recipient) {
				if(recipient.role=='ILM') {
//					if(recipient.status=='completed' || recipient.status=='signed') {
						self.handleSendRecipientLink();
						return false;
					//}
				}
			});
		},
		reviewPA: function(evt) {
			var self=this;
			var target = $(evt.currentTarget);
			var embraceEnvelopeId = target.data('envelopeid');
			var recipientLink = target.data('recipientlink');
			this.embraceEnvelopeId = embraceEnvelopeId;

			self.currentForm=target.closest('form');
			
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Opening PA Review Page... </div>'
			});

			var embraceEnvelopeId = this.embraceEnvelopeId;
			
			$.unblockUI();

			var reviewPABox = $.colorbox({href: recipientLink,
							iframe:true,fastIframe:false,title:'Review Purchase Agreement',closeButton:true,width:'100%',height:'100%',
							escKey:false,overlayClose:false});
			$('#cboxOverlay').css('z-index',99998);
			$('#colorbox').css('z-index',99999);

			$('#cboxClose').unbind('click',self.mgmtConsoleCloseHandler);
			$('#cboxClose').unbind('click',self.tagAndSendCloseHandler);
			$('#cboxClose').unbind('click',self.reviewPACloseHandler);
			$('#cboxClose').unbind('click',self.generateDocusignLink);
			
			$('#cboxClose').on('click', {self: self}, self.reviewPACloseHandler);
		},
		viewPA: function(evt) {
			var self=this;
			var target = $(evt.currentTarget);
			var embraceEnvelopeId = target.data('envelopeid');
			var recipientLink = target.data('recipientlink');
			this.embraceEnvelopeId = embraceEnvelopeId;
			self.currentForm=target.closest('form');
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Opening PA Review Page... </div>'
			});
			var embraceEnvelopeId = this.embraceEnvelopeId;
			$.unblockUI();
			var reviewPABox = $.colorbox({href: recipientLink,
							iframe:true,fastIframe:false,title:'Review Purchase Agreement',closeButton:true,width:'100%',height:'100%',
							escKey:false,overlayClose:false});
			$('#cboxOverlay').css('z-index',99998);
			$('#colorbox').css('z-index',99999);
			$('#cboxClose').unbind('click',self.mgmtConsoleCloseHandler);
			$('#cboxClose').unbind('click',self.tagAndSendCloseHandler);
			$('#cboxClose').unbind('click',self.reviewPACloseHandler);
			$('#cboxClose').unbind('click',self.generateDocusignLink);
			
			$('#cboxClose').on('click', {self: self}, self.generateDocusignLink);
		},
		generateDocusignLink : function(evt) {
			console.log('Inside generateDocusignLink');
			var self = evt.data.self;
			self.refreshEnvelopeStatus(self.embraceEnvelopeId,self.currentForm);
		},
		handleTagAndSend : function() {
			var self=this;
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Opening Tag & Send View... </div>'
			});

			var embraceEnvelopeId = this.embraceEnvelopeId;

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
						$('#cboxClose').unbind('click',self.reviewPACloseHandler);
						$('#cboxClose').unbind('click',self.generateDocusignLink);
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

		refreshEnvelopeStatus : function(embraceEnvelopeId,currentForm,showProgressBar) {
			var self=this;
			
			if(!showProgressBar) {
				showProgressBar = "show";
			}
			
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Refreshing Envelope Status... </div>'
			});

			//$('.envelopeMessage').html('Creating Envelope..');
			$.ajax({
				url: app.context()+'/docusign/envelope/refreshEnvelopeRecipientStatus/'+embraceEnvelopeId,
				type: 'GET',
				async:true,
				success: function(res){
					console.log(showProgressBar);
					if(showProgressBar=="show") {
						$.unblockUI();
					}
					console.log('Envelope status is '+res.envelopeStatus);
					//self.currentForm.find('.envelopeStatus').html(res);
					var formData = {};
					formData.embraceEnvelopeId = embraceEnvelopeId;
					formData.envelopeStatus = res.envelopeStatus;
					self.envelopeStatus=res.envelopeStatus;
					var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
					currentForm.find('.docusignEnvelopeArea').html("");
					res.app=app;
					currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));
					self.envelopeData = res;
					if(self.envelopeStatus!='sent' && self.envelopeStatus!='completed'){
						console.log('envelope not sent/complete');
						$('.envelopeErrorMessage').html("<p style='color:red;'>Please send the envelope.</p>");
						return;
					} else {
						$('.envelopeErrorMessage').html("");
					}
				},
				error: function(res){
					$.unblockUI();
					console.log('failed to get envelope status '+res);
					currentForm.find('.envelopeMessage').html('Failed to get envelope status');
				}
			});
		},

		refreshEnvelopeStatusBlocking : function(embraceEnvelopeId,currentForm,showProgressBar) {
			var self=this;
			
			//$('.envelopeMessage').html('Creating Envelope..');
			$.ajax({
				url: app.context()+'/docusign/envelope/refreshEnvelopeStatus/'+embraceEnvelopeId,
				type: 'GET',
				async:false,
				success: function(res){
					console.log('Envelope status is '+res);
					//self.currentForm.find('.envelopeStatus').html(res);
					var formData = {};
					formData.embraceEnvelopeId = embraceEnvelopeId;
					formData.envelopeStatus = res;
					self.envelopeStatus=res;
					self.refreshEnvelopeStatus(embraceEnvelopeId,currentForm,showProgressBar);
					//var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
					//formData.app=app;
					//currentForm.find('.docusignEnvelopeArea').html("");
					//currentForm.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:formData}));
					
				},
				error: function(res){
					console.log('failed to get envelope status '+res);
					currentForm.find('.envelopeMessage').html('Failed to get envelope status');
				}
			});
		},

		sendRecipientLink : function (evt) {
			var self=this;
			var button = $(evt.currentTarget);
			var embraceEnvelopeId = button.data('envelopeid');
			self.embraceEnvelopeId = embraceEnvelopeId;
			self.currentForm=button.closest('form');

			self.handleSendRecipientLink();
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

		showTagAndSendWarning : function(evt) {
			var self=this;
			alert('triggered');
			$('#optionCloseTagAndSend').modal('show');
			evt.preventDefault();
			evt.stopPropagation();
		},

		manualRefreshEnvelopeInfo : function(evt) {
			var self=this;
			var button = $(evt.currentTarget);
			self.currentForm=button.closest('form');
			var embraceEnvelopeId = button.data('envelopeid');
			this.embraceEnvelopeId = embraceEnvelopeId;
			this.refreshEnvelopeStatus(embraceEnvelopeId,self.currentForm);
		},
		mgmtConsoleCloseHandler : function(evt) {
			console.log('Closing management console popup');
			var self = evt.data.self;
			console.log(self);
			self.refreshEnvelopeStatusBlocking(self.embraceEnvelopeId,self.currentForm);
		},
		launchDocusignManagementConsole : function(evt) {
			var self=this;
			var button = $(evt.currentTarget);
			var embraceEnvelopeId = button.data('envelopeid');
			self.currentForm=button.closest('form');
			this.embraceEnvelopeId = embraceEnvelopeId;

			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Opening Docusign Management Console... </div>'
			});

			//$('.envelopeMessage').html('Creating Envelope..');
			$.ajax({
				url: app.context()+'/docusign/envelope/managementConsoleUrl',
				type: 'GET',
				async:false,
				success: function(res){
					$.unblockUI();
					console.log('Management Console Url is '+res);
					var managementConsole = $.colorbox({href: res,
						iframe:true,fastIframe:false,title:'Docusign Management Console - Manage -> Draft -> Complete & Send Previous Envelopes',closeButton:true,width:'100%',height:'100%',
						escKey:false,overlayClose:false});
					$('#cboxOverlay').css('z-index',99998);
					$('#colorbox').css('z-index',99999);

					console.log(managementConsole);
					$('#cboxClose').unbind('click',self.tagAndSendCloseHandler);
					$('#cboxClose').unbind('click',self.mgmtConsoleCloseHandler);
					$('#cboxClose').unbind('click',self.reviewPACloseHandler);
					$('#cboxClose').unbind('click',self.generateDocusignLink);
					$('#cboxClose').on('click', {self: self}, self.mgmtConsoleCloseHandler);
					//managementConsole.onCleanup = self.refreshEnvelopeStatus(embraceEnvelopeId,self.currentForm);
//					managementConsole.on('cbox_closed', function (e) {
//					console.log(e);
//					self.refreshEnvelopeStatus();
//					});
				},
				error: function(res){
					$.unblockUI();
					console.log('failed to get Management Console Url of envelope '+res);
					self.currentForm.find('.envelopeMessage').html('Failed to get Management Console URL');
				}
			});
		},
		hideAllFields:function(currentForm){
			var self = this;
			self.hideInputFields(currentForm,["titleConveyedTo","citizenship","address1","address2","city","state","postalCode","phoneNumber","emailAddress","maritalStatus"]);
		},
		hideStateSpecificFields:function(currentForm,state){
			var self = this;
			switch(state){
			case "OH":
				self.hideInputFields(currentForm,[]);
				break;
			case "TX":
				self.hideInputFields(currentForm,["maritalStatus","citizenship"]);
				break;
			case "TN":
				self.hideInputFields(currentForm,["maritalStatus","citizenship"]);
				break;
			case "FL":
				self.hideInputFields(currentForm,["phoneNumber","emailAddress"]);
				break;
			case "IN":
				self.hideInputFields(currentForm,["address1","address2","city","state","postalCode","phoneNumber","maritalStatus","citizenship"]);
				break;
			case "IL":
				self.hideInputFields(currentForm,["phoneNumber","emailAddress","maritalStatus","citizenship"]);
				break;
			case "Al":
				self.hideInputFields(currentForm,["address1","address2","city","state","postalCode","phoneNumber","emailAddress","maritalStatus","citizenship"]);
				break;
			case "GA":
				self.hideInputFields(currentForm,["maritalStatus","citizenship"]);
				break;
			default:
				break;
			}
		},
		hideInputFields:function(currentForm,inputArray){
			_.each(inputArray,function(name){
				if(name=="state"){
					$(currentForm).find("select[name=" + name + "]").prop( "disabled", true );
					$(currentForm).find("select[name=" + name + "]").parent().parent().parent().find(".required").hide();
					$(currentForm).find("textarea[name='existingaddress']").parent().parent().find(".required").hide();
				}else{
					$(currentForm).find("input[name=" + name + "]").prop( "disabled", true );
					$(currentForm).find("input[id=" + name + "]").prop( "disabled", true );
					$(currentForm).find("input[name=" + name + "]").parent().parent().find(".required").hide();
					$(currentForm).find("input[id=" + name + "]").parent().parent().find(".required").hide();
				}
			});
		},
		changeIsNormal:function(evt){
			console.log("changeIsNormal");
			if($(evt.currentTarget).val() == "No"){
				this.hideAllFields(this.currentForm);
				this.convertToOptionalInputFields(this.currentForm,["offerAmount_currency","emdAmount_currency"]);
				this.hideStateSpecificFields(this.currentForm,this.state);
			} else {
				console.log(this.currentForm);
				console.log(this.state);
				this.enableAllFields(this.currentForm,this.state,["offerAmount","emdAmount","downPayment","titleConveyedTo","citizenship","address1","address2","city","state","postalCode","phoneNumber","emailAddress","maritalStatus","offerAmount_currency","emdAmount_currency"]);
			}
		},
		enableAllFields:function(currentForm,state,inputArray){
			_.each(inputArray,function(name){
				if(name=="state"){
					$(currentForm).find("select[name=" + name + "]").prop( "disabled", false );
					$(currentForm).find("select[name=" + name + "]").parent().parent().parent().find(".required").show();
					$(currentForm).find("textarea[name='existingaddress']").parent().parent().find(".required").show();

				}else{
					$(currentForm).find("input[name=" + name + "]").prop( "disabled", false );
					$(currentForm).find("input[name=" + name + "]").parent().parent().find(".required").show();

					$(currentForm).find("input[id=" + name + "]").prop( "disabled", false );
					$(currentForm).find("input[id=" + name + "]").parent().parent().find(".required").show();
				}
			});
			this.hideStateSpecificFields(currentForm,state);
		},

		convertToOptionalInputFields:function(currentForm,inputArray){
			_.each(inputArray,function(name){

				$(currentForm).find("input[id=" + name + "]").parent().parent().find(".required").hide();
				$(currentForm).find("input[name=" + name + "]").parent().parent().find(".required").hide();
			});

		},
		investorReviewFormValidation:function(currentForm){
			var form1 = currentForm;
			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					reviewDate:{
						required:true
					}
				},
				invalidHandler: function (event, validator) { // display error alert on form submit

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
			if(currentForm.find("[name=postalCode]").val()){
				strArray.push(currentForm.find("[name=postalCode]").val());
			}
			fullArray.push(addressArray.join(" ,"));
			fullArray.push(strArray.join(" ,"));
			if(!jQuery.isEmptyObject(fullArray)){
				currentForm.find(".existingaddress").val(fullArray.join("\n"));
			}
		},
		redrawOppPropertyTableForStatus:function(statusId){
			var self = this;
			if($(self.oppPropertyTable).hasClass("dataTable")){
				$(self.oppPropertyTable).data("statusid", statusId);
				self.oppPropertyTable.fnDraw();
				App.handleUniform();
			}
		},
		showByHilGroup:function(evt){
			var self = this;
			var currentTarget = $(evt.currentTarget);
			if(currentTarget.data("hilgroupid") == "All"){
				app.selectedHilGroupList = [];
				self.oppPropertyTable.fnDraw();
				App.handleUniform();
				$(".hil-group-btn-selected").removeClass("hil-group-btn-selected");
				$(".hilGroupBtn").data("selected",false);
				return;
			}

			if($(self.oppPropertyTable).hasClass("dataTable") && !currentTarget.data("selected")){
				currentTarget.data("selected",true);
				app.selectedHilGroupList.push(currentTarget.data("hilgroupid"));
				self.oppPropertyTable.fnDraw();
				App.handleUniform();
				currentTarget.addClass("hil-group-btn-selected");
				currentTarget.children().addClass("hil-group-btn-selected");
			} else {
				currentTarget.data("selected",false);
				var index = app.selectedHilGroupList.indexOf(currentTarget.data("hilgroupid"));
				if (index > -1) {
					app.selectedHilGroupList.splice(index, 1);
				}
				self.oppPropertyTable.fnDraw();
				App.handleUniform();
				currentTarget.removeClass("hil-group-btn-selected");
				currentTarget.children().removeClass("hil-group-btn-selected");
			}
		},
		removeHilBtn:function(evt){
			evt.stopPropagation();

			var self = this;
			var requiredElement = $(evt.currentTarget).parent();
			var hilgroupid = requiredElement.data("hilgroupid");
			var callBack = function(){
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});

				$.ajax({
					url: app.context()+'/opportunity/removeZoneFromOpportunity/' + self.opportunityId + '/' + hilgroupid,
					contentType: 'application/json',
					dataType:'json',
					type: 'DELETE',
					async: true,
					success: function(res){
						$.unblockUI();
						requiredElement.remove();
						var index = app.selectedHilGroupList.indexOf(hilgroupid);
						if (index > -1) {
							app.selectedHilGroupList.splice(index, 1);
						}
						self.oppPropertyTable.fnDraw();
						App.handleUniform();
						// $(".hil-group-btn-selected").removeClass("hil-group-btn-selected");
						$('#hilGroupMessage').removeClass("alert-success alert-danger");
						$('#hilGroupMessage').addClass("alert-success");
						$('#hilGroupMessage > text').html("Successfully removed investment zone");
						$('#hilGroupMessage').show();
						$('#hilGroupMessage').delay(2000).fadeOut(4000);
						self.fetchInvestmentZones();
						$('#investmentZoneDiv > text').html(self.investmentZones);
					},
					error: function(res){
						$.unblockUI();
						$('#hilGroupMessage').removeClass("alert-success alert-danger");
						$('#hilGroupMessage').addClass("alert-danger");
						$('#hilGroupMessage > text').html("Cannot delete investment zone with properties");
						$('#hilGroupMessage').show();
						$('#hilGroupMessage').delay(2000).fadeOut(4000);
					}
				});
			}
			self.oppPropertyModalData.callBack = callBack;

			var popup = $("#oppPropertyYesNoModal");
			popup.find(".modal-title").html("Delete Investment Zone");
			popup.find(".modal-body").html("Are you sure want to delete this investment zone?");
			popup.modal("show");
		},
		showPurchaseAgreementRow:function(evt){
			var self=this;
			var objectId = $(evt.currentTarget).closest("tr").data("objectid");
			var object = $(evt.currentTarget).closest("tr").data("object");
			var model = self.collection.findWhere({"hilOppPropertyId":objectId.toString()});
			console.log(model.attributes.offers);
			var offers = [];
			var offerId = "";
			var offerAmount = 0;
			if(model != undefined){
				offers = model.attributes.offers;
			}
			_.each(offers,function(singleOffer){
				if(singleOffer.offerStatus == "Accepted"){
					offerId = singleOffer.offerId;
					offerAmount = singleOffer.offerAmount;
				}

			});

			var showpopup = $(evt.currentTarget).data("showpopup");
			if(showpopup){
//				var template = _.template(uploadPurchaseAgreementRow)({targetAction:".uploadPurchaseAgreement"});
				var template = _.template(uploadPurchaseAgreementRow)({targetAction:".uploadPurchaseAgreement",object:object,objectId:objectId,offerId:offerId,offerAmount:offerAmount});
				var requiredRow = $(evt.currentTarget).closest("tr");
				requiredRow.after(template);
				ComponentsPickers.init();
				$(evt.currentTarget).data("showpopup",false);
				$(".amount").formatCurrency();
				app.currencyFormatter("$");
				self.uploadPurchaseFormValidation(requiredRow.next().find("form"));
			} else {
				$(evt.currentTarget).data("showpopup",true);
				this.hideHiddenRows($(evt.currentTarget).closest("tr").next());
			}

		},

		saveRBAgreement: function(object,objectId,tbody){
			var self=this;
			var requestObj={};
			var entries=[];
			var returnVal;

			tbody.find('tr').each(function(){
				var obj={};
				obj.offerId=$(this).find("[name=offerId]").val();
				obj.comments=$(this).find("[name=comments]").val();
				if(obj.offerId){
					entries.push(obj);
				}
			});

			requestObj.offers=entries;
			requestObj.object=object;
			requestObj.objectId=objectId;


			$.ajax({
				url: app.context()+'/offer/save/rightBidAgreement',
				contentType: 'application/json',
				dataType:'json',
				type: 'POST',
				async:false ,
				data:JSON.stringify(requestObj),
				success: function(res){
					returnVal=true;
				},
				error: function(res){
					returnVal=false;
				}
			});
			return returnVal;
		},

		saveuploadPurchaseAgreement:function(evt){
			var self = this;
			var returnVal = false;
			var form = $(evt.currentTarget).closest("form");
			if (form.validate().form()){
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Uploading Purchase Agreement... </div>'
				});
				$(evt.currentTarget).closest("form").attr("enctype","multipart/form-data");
				$(evt.currentTarget).closest("form").ajaxSubmit({
					url: app.context()+'/offer/uploadAgreement',
					async:true,
					success: function(res){
						$.unblockUI();
						console.log('successfully created envelope embraceEnvelopeId '+res.embraceEnvelopeId+" docusignEnvelopeId "+res.docusignEnvelopeId+' message '+res.message);
						self.cancelToggleBtnClick(evt);
						self.fetchOpportunityProperties();
						returnVal = true;

					},
					error: function(res){
						returnVal = false;
						$.unblockUI();

					}
				});
			}
			return returnVal;
		},
		uploadPurchaseFormValidation :function(currentForm){
			var form1 = currentForm;
			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					paDate:{
						required:true
					},
					escrowDate:{
						required:true
					},
					paAgreement:{
						required:true
					},
					emdAmount:{
						required:true
					}
				},
				invalidHandler: function (event, validator) { // display error alert on form submit

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
		readyToInvestFormValidation:function(currentForm){
			var self=this;
			var form1 = currentForm;
			var hidesdiv1 = $('.hidesdiv1', form1);
			var viewsdiv1 = $('.viewsdiv1', form1);
			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					offerAmount:{
						required:   {
							depends:function(element){ 
								return $("input[name=isNormal]:checked").val()=="Yes"
							}
						},
						dollarsscents: true
					},

					emdAmount:{
						required:   {
							depends:function(element){ 
								return $("input[name=isNormal]:checked").val()=="Yes"
							}
						},
						dollarsscents: true
					},
					downPaymentPercentage:{
						range: [0, 100]
					},
					downPayment:{
						dollarsscents: true
					},
					interestRate:{
						range: [0, 100]
					},
					titleConveyedTo:{
						required:true
					},
					firstInvlegalName:{
						required:true
					},

					huSigner:{
						required:   {
							depends:function(element){ 
								return $("input[name=isLpoa]:checked").val()=="Y"
							}
						}
					},
					offerDate:{
						required:true
					},
					estimatedClosingDate:{
						required:true
					},
					financingType:{
						required:true
					},
					phoneNumber:{
						required:true,
						number: true
					},
					emailAddress:{
						required:true,
						email: true
					},
					secInvPhoneNumber:{
						number: true
					},
					secInvEmailAddress:{
						email: true
					},
					maritalStatus:{
						required:true
					},
					citizenship:{
						required:true
					},
					address1:{
						required:true
					},
					city:{
						required:true
					},
					state:{
						required:true
					},
					postalCode:{
						required:true,
						number: true
					}
				},
				invalidHandler: function (event, validator) { // display error alert on form submit

				},
				highlight: function (element) { // hightlight error inputs
					$(element).closest('.form-group').addClass('has-error'); // set error class to the control group
					if ($(".hidesdiv1 .has-error", form1).length > 0){ 
						viewsdiv1.hide();
						hidesdiv1.show();
					}
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

		openEmailOfferPopUp : function(){
			var self=this;

			$('#ilm-email').on('hidden.bs.modal',function() {
				var editor = CKEDITOR.instances.editorTextArea;
				if (editor) {
					editor.destroy(true); 
				}
			});
			
			var emailForm=$('#ilm-email');
			$('#emailformAlertFailure').hide();
			$('#emailformAlertSuccess').hide();

			emailForm.find('[name=subject]').val('');
			emailForm.find('[name=listingAgentEmailAddress]').val('');
			emailForm.find('[name=paAgreementDocs]').val('');
			emailForm.find('[name=messageText]').val('');

			emailForm.find('[name=listingAgentEmailAddress]').val(self.listingAgentEmailAddress);
			emailForm.find('[name=subject]').val(self.mailSubject);
			emailForm.find('[name=messageText]').val(self.mailBody);
			try {
				var editor = CKEDITOR.instances.messageText;
				if (editor) {
					editor.destroy(true); 
				}
			} catch(err) {
				console.log("Error in loading editor : err = " + err);
			}
			CKEDITOR.replace('messageText');
			this.sendOfferEmailFormValidation($("#sendOfferEmailForm"));
			$('#sendOfferEmailForm').find('.form-group').each(function() {
				$(this).removeClass('has-error');
				$(this).find('.help-block').hide();
			});
			$("#ilm-email").modal('show');
		},

		sendOfferEmailToListingAgent : function(){
			var self = this;
			if ($('#sendOfferEmailForm').validate().form()){

				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Sending Mail... </div>'
				});

				var document=$("#sendOfferEmailForm").find('[name=paAgreementDocs]');
				self.listingAgentEmail=$("#sendOfferEmailForm").find('[name=listingAgentEmailAddress]').val();
				
				if(document && document.val() == "") {
					document.attr("disabled","disabled");
				}
				this.CKupdate();
				$("#sendOfferEmailForm").attr("enctype","multipart/form-data");
				$("#sendOfferEmailForm").ajaxSubmit({
					url: app.context()+'/document/sendMailToUser',
					async:true,
					success: function(res){
						$.unblockUI();
						console.log('success');
//						$('#emailformAlertSuccess').show();
						$('#emailformAlertFailure').hide();

						$("#ilm-email").modal('hide');
						self.saveSubmitOfferFormForAction();
						
					},
					error: function(res){
						$.unblockUI();
						if(res.responseText){
							if(JSON.parse(res.responseText).message.indexOf('attach document does not exist')>-1){
								$("#paAttachFailure").show().delay(4000).fadeOut(4000);
							} else{
								$('#emailformAlertFailure').show().delay(4000).fadeOut(4000);
								$('#emailformAlertSuccess').hide();
							}
						} else {
							$('#emailformAlertFailure').show().delay(4000).fadeOut(4000);
							$('#emailformAlertSuccess').hide();
						}
						
						console.log('failure');
					}
				});
			}

			if(document) {
				document.removeAttr("disabled");
			}
		},
		createOfferFormValidation:function(currentForm){
			var self=this;
			var form1 = currentForm;
			//var hidesdiv1 = $('.hidesdiv1', form1);
			//var viewsdiv1 = $('.viewsdiv1', form1);
			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					offerAmount:{
						required:true,
						dollarsscents: true
					},
					emdAmount:{
						required:true,
						dollarsscents: true
					},
					offerDate:{
						required:true
					},
					estimatedClosingDate:{
						required:true
					},
					plainPaAgreement:{
						//required:true
					},
					finalPaAgreement:{
						//required:true
					},
					paDate:{
						required:true
					},
					paCloseEscrowDate:{
						required:true
					}

				},
				invalidHandler: function (event, validator) { // display error alert on form submit

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

		counterOfferFormValidation:function(currentForm){
			var self=this;
			var form1 = currentForm;
			//var hidesdiv1 = $('.hidesdiv1', form1);
			//var viewsdiv1 = $('.viewsdiv1', form1);
			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					counterOfferAmount:{
						required:true,
						dollarsscents: true
					},
					emdAmount:{
						required:true,
						dollarsscents: true
					},
					offerDate:{
						required:true
					},
					estimatedClosingDate:{
						required:true
					},
					counterOfferDocument:{
						//required:true
					},
					paDate:{
						required:true
					},

				},
				invalidHandler: function (event, validator) { // display error alert on form submit

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

		CKupdate:function(){
			CKEDITOR.instances.messageText.updateElement();
		},

		sendOfferEmailFormValidation:function(currentForm){
			var self=this;
			var form1 = currentForm;
			var hidesdiv1 = $('.hidesdiv1', form1);
			var viewsdiv1 = $('.viewsdiv1', form1);
			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					listingAgentEmailAddress:{
						required:true,
						email:true
					},
					messageText:{
						required:true
					}
				},
				invalidHandler: function (event, validator) { // display error alert on form submit

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
		uploadFinalPurchaseAgreementValidation:function(currentForm){
			var self=this;
			var form1 = currentForm;
			var hidesdiv1 = $('.hidesdiv1', form1);
			var viewsdiv1 = $('.viewsdiv1', form1);
			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {

					emdAmount:{
						required:true,
					},
					finalPaAgreement:{
						required:true
					},
					paDate:{
						required:true
					},
					paCloseEscrowDate:{
						required:true
					}

				},
				invalidHandler: function (event, validator) { // display error alert on form submit

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
		createPAFormValidation:function(currentForm){
			var self=this;
			var form1 = currentForm;
			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					plainPaAgreement:{
						//required:true
					}
				},
				invalidHandler: function (event, validator) { // display error alert on form submit

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

		showOfferHistory: function(evt){
			var self=this;
			var row= $(evt.target).closest('tr');
			var object = row.data('object');
			var objectId = row.data('objectid');
			var propertyName=row.find('.hopNameTooltip').data('original-title');

			if(!propertyName){
				propertyName=row.find('.hopNameTooltip').prop('title');
			}

			self.fetchOfferDetails(object,objectId);

			var tableHTML ="<table class='table table-striped table-bordered table-advance table-hover'>";
			tableHTML+="<thead><tr><th>Offer Date</th><th>Offer Amount</th><th>PA Date</th><th>Escrow Date</th><th>Terms</th><th>Offer Type</th><th>Status</th></tr></thead>";
			_.each(self.offerDetails,function(offer){
				tableHTML+="<tr>";
				tableHTML+="<td>"+offer.offerDate+"</td>";
				tableHTML+="<td class=amount>"+offer.offerAmount+"</td>";
				if(offer.paDate && offer.paDate!='null'){
					tableHTML+="<td>"+offer.paDate+"</td>";
				}
				else{
					tableHTML+="<td></td>";
				}
				if(offer.paCloseEscrowDate && offer.paCloseEscrowDate!='null'){
					tableHTML+="<td>"+offer.paCloseEscrowDate+"</td>";
				}
				else{
					tableHTML+="<td></td>";
				}
				if(offer.terms && offer.terms!='null'){
					tableHTML+="<td width= '25%'><div style='word-break: break-all;overflow-y: scroll;height: 40px;'>"
						+offer.terms+"</div></td>";
				}
				else{
					tableHTML+="<td></td>";
				}

				if(offer.offerType && offer.offerType!='null'){
					tableHTML+="<td>"+offer.offerType+"</td>";
				}
				else{
					tableHTML+="<td></td>";
				}

				if(offer.status && offer.status!='null'){
					tableHTML+="<td>"+offer.status+"</td>";
				}
				else{
					tableHTML+="<td></td>";
				}

				tableHTML+="</tr>";
			});
			tableHTML+="</table>";
			console.log(tableHTML);

			if(self.offerDetails.length>0){
				$("#offer-history").find(".renderOfferTable").html(tableHTML);
				$(".amount").formatCurrency(); 
			}
			else{
				$("#offer-history").find(".renderOfferTable").html("History not available");
			}

			$("#offer-history h4").text("Offer History for property:"+propertyName);

			$("#offer-history").modal('show');

		},
		fetchInvestmentZones:function(){
			var self=this;
			$.ajax({
				url: app.context()+'/opportunity/getInvestmentZones/'+self.opportunityId,
				contentType: 'application/json',
				async : false,
				dataType:'json',
				type: 'GET',
				success: function(res){
					self.investmentZones=res.investmentZones;
				},
				error: function(res){
					console.log('Error in fetching investmentZones');
				}

			});
		},
		finacingTypeChanged:function(evt){
			var currentForm = $(evt.currentTarget).closest("form");
			var financingType = currentForm.find("select[name=financingType] option:selected").text();
			var currentEstimatedClosingDate = $("#estimatedClosingDate").val();
			if(financingType == 'Cash'){
				currentForm.find('input[name=proofOfFunds]').val("");
				currentForm.find('input[name=proofOfFunds]').prop('disabled',false);
				currentForm.find('#proofOfFundsDocumentDiv').show();
				currentForm.find('#mortgageDetailsDiv').hide();
				currentForm.find('input[name=preQualDocument]').prop('disabled',true);
				currentForm.find('#uploadPreLetterDiv').hide();
				if(currentEstimatedClosingDate=="") {
					var nowPlus30Days = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
					var defEstimatedClosdate=$.datepicker.formatDate('mm-dd-yy', nowPlus30Days);
					$("#estimatedClosingDate").val(defEstimatedClosdate);
				}
				
				if( this.isProofOffundsuploaded=="Yes"){
					currentForm.find("#isProofdocsUploaded").removeClass("display-hide");
				}
			
			
				
				

			} else if(financingType == 'Mortgage') {
				currentForm.find('input[name=proofOfFunds]').prop('disabled',true);
				currentForm.find('#proofOfFundsDocumentDiv').hide();
				currentForm.find('#mortgageDetailsDiv').show();
				currentForm.find('input[name=preQualDocument]').prop('disabled',false);
				currentForm.find('#uploadPreLetterDiv').show();
				if(currentEstimatedClosingDate=="") {
					var nowPlus45Days = new Date(Date.now() + (45 * 24 * 60 * 60 * 1000));
					var defEstimatedClosdate=$.datepicker.formatDate('mm-dd-yy', nowPlus45Days);
					$("#estimatedClosingDate").val(defEstimatedClosdate);
				}
				
				if(this.isPreQualdocsuploaded=="Yes"){
					currentForm.find("#isPreQualdocsUploaded").removeClass("display-hide");
				}
				
				
			} else if(financingType == 'IRA Mortgage'){
				currentForm.find('input[name=proofOfFunds]').prop('disabled',true);
				currentForm.find('#proofOfFundsDocumentDiv').hide();
				currentForm.find('#mortgageDetailsDiv').show();
				currentForm.find('input[name=preQualDocument]').prop('disabled',true);
				currentForm.find('#uploadPreLetterDiv').hide();
				if(currentEstimatedClosingDate=="") {
					var nowPlus45Days = new Date(Date.now() + (45 * 24 * 60 * 60 * 1000));
					var defEstimatedClosdate=$.datepicker.formatDate('mm-dd-yy', nowPlus45Days);
					$("#estimatedClosingDate").val(defEstimatedClosdate);
				}
			} else {
				currentForm.find('input[name=proofOfFunds]').prop('disabled',true);
				currentForm.find('#proofOfFundsDocumentDiv').hide();
				currentForm.find('#mortgageDetailsDiv').hide();
				currentForm.find('input[name=preQualDocument]').prop('disabled',true);
				currentForm.find('#uploadPreLetterDiv').hide();
				if(currentEstimatedClosingDate=="") {
					if(financingType == 'IRA'){
						var nowPlus30Days = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
						var defEstimatedClosdate=$.datepicker.formatDate('mm-dd-yy', nowPlus30Days);
						$("#estimatedClosingDate").val(defEstimatedClosdate);
					}else{
						$("#estimatedClosingDate").val("");
					}
				}
			}


		},

		fetchHUSignerUsers:function(){
			var self = this;
			$.ajax({
				url: app.context()+'/user/LPOA Signer',
				contentType: 'application/json',
				async : false,
				type: 'GET',
				success: function(res){
					self.huSigners=res
					console.log(res);
				},
				error: function(res){
				}
			});
		},

		islpoaEvent:function(evt){
			var currentForm = $(evt.currentTarget).closest("form");
			var islpoaChecked = $('input[name="isLpoa"]');

			if(islpoaChecked.val()=='Y'){
				$('input[name="isLpoa"]').val('N');
				currentForm.find('#huSigner').hide();
			}else{
				$('input[name="isLpoa"]').val('Y');
				currentForm.find('#huSigner').show();
			}
		},
		
		saveSubmitOfferFormForAction: function(){
			console.log("emailOfferClick");
			var self=this;
			var form = self.currentForm;

			var postData={};
			postData.taskKey=self.currentTaskKey;

			postData.endDate=new Date();

			console.log(postData);
			console.log(form.validate().form());

			if (form.validate().form()){
				if(self.currentTaskKey=="SUBMIT_OFFER"){
					console.log('setting object, objectId  for submit offer');
					postData.objectId=self.currentObjectId;
					postData.object=self.currentObject;
					self.continueFormSubmit(form,postData);
			    }
			} else{
				$('#hilGroupMessage').removeClass("alert-success alert-danger");
				$('#hilGroupMessage').addClass("alert-success");
				$('#hilGroupMessage > text').html("Successfully sent the offer email to "+self.listingAgentEmail);
				$('#hilGroupMessage').show();
				App.scrollTo($('#hilGroupMessage'), -200);
				$('#hilGroupMessage').delay(4000).fadeOut(4000);
			}
				
		},

		showTasks: function(evt){
			var self=this;
			console.log("showTasks");
			if(!self.calendarView)
			{
				self.calendarView = new calendarView();
			}
			self.calendarView.hideAddTaskButton = true;
			self.calendarView.setElement($('#calendarModalBody')).render("Hil Opportunity Property",$(evt.target).attr("object-id"));
			$('#addTaskPopup').hide();
			$('a[href="taskPopup"]').css("color","black").removeAttr("href");

		},
		showippropertypage: function(evt){
			var propertyId = $(evt.currentTarget).data("objectid");
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			var oppIPPropertyPopup = window.open("","_blank");
			$.ajax({
				url: app.context()+'/property/getipproperty/'+propertyId,
				type: 'GET',
				success: function(res){
					$.unblockUI();
					oppIPPropertyPopup.location = res;
				},
				error: function(res){
					$.unblockUI();
					console.log('failed to get Investor Portal Link:'+res);
				}
			});
		},
		confirmCancelProperty: function(evt){
			var self = this;
			var errorFlag = false;
			$("#cancelReasonError").css("display","none");
			$("#cancelCommentError").css("display","none");
			if($(".cancelReason").val().trim() == "") {
				$("#cancelReasonError").css("display","block");
				errorFlag = true;
			}
			if($(".cancelComment").val().trim() == ""){
				$("#cancelCommentError").css("display","block");
				$(".cancelComment").val("");
				errorFlag = true;
			}
			if(errorFlag){
				return;
			}
			var postData = {};
			postData.hilOppPropId = $("#cancelHilOppPropId").val();
			postData.status = $(".cancelReason").val();
			postData.comment = $(".cancelComment").val();
			if($("#makePropertyAvailable").prop("checked") && $(".cancelReason").val() != "407"){
				postData.makePropAvl = "Y";
			} else {
				postData.makePropAvl = "N";
			}
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			$.ajax({
	                url: app.context() + '/hilOpportunityProperty/cancelProperty',
					dataType:'json',
					contentType: 'application/json',
					data: JSON.stringify(postData),
	                type: 'POST',
	                async:true,
	                success: function(res){
	                	$.unblockUI();
	                 	$("#form-cancel-property").modal("hide");
				      	setTimeout(function(){$('.modal-backdrop').remove()},500)
						$('.modal-backdrop').fadeOut(400);
						self.refreshAfterWorkflowAction(res);
	                },
	                error: function(res){
	                	$.unblockUI();
	                	$("#cancelPropertyError").show();
	                }
	          });
		},
		initiateCancelProperty: function(evt){
			$("#cancelHilOppPropId").val($(evt.currentTarget).data("objectid"));
			if($("#makePropertyAvailable").prop("checked")){
				$("#makePropertyAvailable").trigger("click");
			}
			$("#cancelPropertyError").hide();
			$(".cancelReason").val("");
			$(".cancelComment").val("");
			$("#cancelReasonError").css("display","none");
			$("#cancelCommentError").css("display","none");
		},
		cancelReasonChange: function(evt){
			if($(".cancelReason").val() == "407"){
				$("#propertyAvailableLabel").hide();
			} else {
				$("#propertyAvailableLabel").show();
			}
			if($("#makePropertyAvailable").prop("checked")){
				$("#makePropertyAvailable").trigger("click");
			}
		},
		initiateRollbackProperty: function(evt){
			var hilOppPropId = $(evt.currentTarget).data("objectid");
			this.fetchRollbackSteps(hilOppPropId);
			$("#rollbackHilOppPropId").val(hilOppPropId);
//			if($("#makePropertyAvailable").prop("checked")){
//				$("#makePropertyAvailable").trigger("click");
//			}
			$("#rollbackPropertyError").hide();
			$("#rollbackPropertyClosingError").hide();
			$(".rollbackReason").val("");
			$(".rollbackComment").val("");
			$("#rollbackReasonError").css("display","none");
			$("#rollbackCommentError").css("display","none");
			$("#rollbackStepError").css("display","none");
		},
		fetchRollbackSteps : function(hilOppPropId) {
			var self = this;
			$.ajax({
				url: app.context()+'/hilOpportunityProperty/rollbackSteps/'+hilOppPropId,
				contentType: 'application/json',
				async : false,
				type: 'GET',
				success: function(res){
					self.rollbackSteps=res;
					var rollbackStepList = $('select[name=rollbackStep]');
					var options = "<option value=''>select</option>";
					_.each(res,function(step){
						options+="<option value="+step.taskKey+">"+step.taskName+"</option>";
					});
					rollbackStepList.html(options);
					//console.log(res);
				},
				error: function(res){
					console.log('Failed to get rollback steps');
				}
			});
		},
		confirmRollbackProperty: function(evt){
			var self = this;
			var postData = {};
			var errorFlag = false;
			$("#rollbackStepError").css("display","none");
			if($(".rollbackStep").val().trim() == "") {
				$("#rollbackStepError").css("display","block");
				$(".rollbackComment").val("");
				errorFlag = true;
			}
			if(errorFlag){
				return;
			}
			
			postData.rollbackStep = $(".rollbackStep").val().trim();
			postData.hilOppPropId = $("#rollbackHilOppPropId").val();
			postData.comment = $(".rollbackComment").val();
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			$.ajax({
	                url: app.context() + '/hilOpportunityProperty/rollbackProperty',
					dataType:'json',
					contentType: 'application/json',
					data: JSON.stringify(postData),
	                type: 'POST',
	                async:true,
	                success: function(res){
	                	$.unblockUI();
	                	if(res.message=="A closing was initiated for this property. Please delete the closing before rolling back") {
	                		$("#rollbackPropertyClosingError").show();
	                	} else {
		                 	$("#form-rollback-property").modal("hide");
					      	setTimeout(function(){$('.modal-backdrop').remove()},500)
							$('.modal-backdrop').fadeOut(400);
							self.refreshAfterWorkflowAction(res);
	                	}
	                },
	                error: function(res){
	                	$.unblockUI();
	                	$("#rollbackPropertyError").show();
	                }
	          });
		},
		cancelledLostConfirmation:function(){
			if($('#cancelledLostForm').validate().form()){
				$('#optionCancelledLost').modal("hide");
				var self = this;
				var obj = {};
				obj.hilOppPropId = self.cancelledLostHilOppPropId;
				obj.comments = $('#cancelledLostComments').val();
				obj.hilOppPropObj = self.cancelledLostHilOppPropObj;
				obj.opportunityId = self.opportunityId;
				
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});
				$.ajax({
					url: app.context()+'/hilOpportunityProperty/cancelledLostProperty',
					contentType: 'application/json',
					dataType:'json',
					data:JSON.stringify(obj),
					type: 'POST',
					async: true,
					success: function(res){
						$.unblockUI();
						self.refreshAfterWorkflowAction(res);
					},
					error: function(res){
						$.unblockUI();
					}
				});
			}
		},
		undoCancelledLostConfirmation : function() {
			$('#optionUndoCancelledLost').modal("hide");
			var self = this;
			var obj = {};
			obj.hilOppPropId = self.cancelledLostHilOppPropId;
			obj.hilOppPropObj = self.cancelledLostHilOppPropObj;
			obj.opportunityId = self.opportunityId;
			
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			$.ajax({
				url: app.context()+'/hilOpportunityProperty/undoCancelledLostProperty',
				contentType: 'application/json',
				dataType:'json',
				data:JSON.stringify(obj),
				type: 'POST',
				async: true,
				success: function(res){
					$.unblockUI();
					self.refreshAfterWorkflowAction(res);
				},
				error: function(res){
					$.unblockUI();
				}
			});
		},
		cancelledLost : function(evt) {
			var self = this;
			self.cancelledLostFormValidation();
			self.cancelledLostHilOppPropId = $(evt.currentTarget.closest('tr')).data('objectid');
			self.cancelledLostHilOppPropObj = $(evt.currentTarget.closest('tr')).data('object');
			
			$('#optionCancelledLost').modal("show");
		},
		undoCancelledLost : function(evt) {
			var self = this;
			self.cancelledLostHilOppPropId = $(evt.currentTarget.closest('tr')).data('objectid');
			self.cancelledLostHilOppPropObj = $(evt.currentTarget.closest('tr')).data('object');
			
			$('#optionUndoCancelledLost').modal("show");
		},
		cancelledLostFormValidation : function() {
			var form1 = $('#cancelledLostForm');
			var error1 = $('.alert-danger', form1);
            var success1 = $('.alert-success', form1);
            
			form1.validate({
				errorElement: 'span', //default input error message container
                errorClass: 'help-block', // default input error message class
                focusInvalid: false, // do not focus the last invalid input
                ignore: ".ignore",
                rules:{
                	cancelledLostComments:{
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
		}
		
	});
	return opportunitiesPropertiesView;
});
