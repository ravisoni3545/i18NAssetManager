define(["text!templates/opportunity.html", "text!templates/opportunityHeader.html","text!templates/genericDropdown.html",
        "text!templates/opportunityLpoaStatus.html","text!templates/opportunityLpoaProperties.html","text!templates/usersDropdown.html","accounting",
        "models/opportunityModel","text!templates/usersDropdown.html","text!templates/investmentZoneDropdown.html",
        "views/codesView","views/documentTooltipView","views/lendersView","views/documentPreviewView", "views/propertyAutoSuggestView",
        "views/opportunityPropertiesView","views/wishlistView","collections/wishlistCollection", "views/documentView","collections/documentCollection",
        "views/messagesView","collections/messagesCollection","views/contactView","collections/contactCollection","text!templates/commentsPopup.html",
        "views/emailView","views/ownershipTypeView","views/investorDepositView",
        "backbone", "app"],

        function(opportunityPage, opportunityHeaderPage,genericDropdown,opportunityLpoaStatusPage,opportunityLpoaPage,usersDropdown,accounting,opportunityModel,usersDropdown,investmentZoneDropdown,
        		codesView, documentTooltipView, lendersView, documentPreviewView, propertyAutoSuggestView, 
        		opportunityPropertiesView,wishlistView,wishlistCollection,documentView,documentCollection,
        		messagesView,messagesCollection,contactView,contactCollection,commentsPopup,emailView,ownershipTypeView,
        		investorDepositView,
        		Backbone, app){


	var OpportunityView = Backbone.View.extend( {
		initialize: function(){
		this.investorProfileView = new codesView({codeGroup:'INV_PROF'});
		this.investorTypeView = new codesView({codeGroup:'INV_TYPE'});
		this.realEstateKnowledgeView = new codesView({codeGroup:'REAL_EST_KNW'});
		this.huExpView = new codesView({codeGroup:'HU_EXP'});
		this.invGoalView = new codesView({codeGroup:'INV_GOAL'});
		this.timeFrameView = new codesView({codeGroup:'TIME_FRAME'});
		this.finTypeView = new codesView({codeGroup:'OPP_FIN_TYPE'});
		this.oppStatusView = new codesView({codeGroup:'OPP_STATUS'});
		this.lendersView = new lendersView();
		this.rehabPrefView = new codesView({codeGroup:'RHB_PREF'});
		this.closingOppReasonCodesView = new codesView({codeGroup:'OPP_CLOS_RSN'});
	},
	model:new opportunityModel(),
	el:"#maincontainer",
	//		 states:{},
	//		 propertyModel:{},
	navPermission:{},
	isNotCollapsed:null,
	status:{},
	isCloseAllowed:null,
	events          : {
		"click  #showEditInvestorBreadbox":"showEditInvestorBreadbox",
		"click  a[href='#editInvestmentZone']":"showEditInvestmentZone",
		"click #editOpportunityDetailsBtn":"showEditOpportunity",
		"click #saveInvestmentZone":"saveInvestmentZone",   
		"click #showOppOwnershipModal":"showOppOwnershipModal",
		"click .acquisitionAggrementBtn":"sendAssetAggrement",
		"click #lpoabutton":"createLpoa",
		"click #savelpoaData":"savelpoaData",
		"click #sendAndSaveLpoaData":"sendAndSaveLpoaData",
		"click .lpoaPropertyMove":"moveLpoaProperty",
		"click .lpoaViewModel":"showlpoaDetails",
		'keyup #numberOfProperties': "calculateDepositAmount",
		'change #numberOfProperties': "calculateDepositAmount",
		"change .lpoafinanced" : "calculateDepAmtFinancial",
		"click #saveOpportunityDetails":"saveOpportunityDetails",
		"click #cancelOpportunityDetails":"cancelOpportunityDetails",
		//			 "click #saveInvestorBreadbox":"saveInvestorBreadbox",
		'change [name=preQualified]': 'showUploadDiv',
		"click #showAddComments":"showAddComments",
		"click #saveComments":"saveBreadboxComments",
		"click #addPropertyToOpportunity":"addPropertyToOpportunity",
		"change #lendersDropdown" : "showNewLender",
		"click #opportunityProperties": "showPropertiesTab",
		"click #wishlistDetails":"showWishlistTab",
		"change #oppPropertyStatusSelect select[name=propertyStatus]":"redrawOppPropertyTable",
		"click #opportunityDocuments":"showDocumentsTab",
		"click #opportunityMessages":"showMessagesTab",
		"click #opportunityContacts":"showContactsTab",
		"click .closeOpportunityButton":"closeOpportunity",
		"click #closeopportunitypop":"showCloseOppPopUP",
		"click .reoPenOpportunityButton":"reOpenOpportunity",
		"click .showMoreMessage" : "showMoreContent",
		"click .showLessMessage" : "showLessContent",
		"click #chevron":"showHideInvestmentCriteria",
		"change [name=financingType]" : "showProofOfFundsDocDiv",
		"click .cancelLpoa" : "showcancelLpoaPopup",
		"click .cancellpoaButton" : "cancelLpoa",
		"click .lpoauploadButton" : "uploadLpoaDocument"
	},
	render : function (options) {

		var self=this;

		if(!app.documentTooltipView){
			app.documentTooltipView=new documentTooltipView();
		}
		if(!app.documentPreview){
			app.documentPreview=new documentPreviewView();
		}

		this.navPermission = options.navPermission;
		this.opportunityId = options.opportunityId;

		this.template = _.template( opportunityPage );
		this.$el.html("");
		//		     	 this.$el.html(this.template());
		//		     	console.log("opportunityData ::"+this.model.attributes);
		//		     	 this.$el.html(this.template({opportunityData:this.model.attributes}));
		this.$el.html(this.template());
		this.fetchOpportunityData(this.opportunityId);
		this.renderHeader();
		$(".amount").formatCurrency();
		//		     	 this.showClosingStepsTab();
		//		     	 this.applyPermissions();
		//		     	 this.scrollPageUp();
		//Start
		//				self.fetchIlmUsers();
		self.fetchHilGroups();
		//				var usersDropdownTemplate = _.template(usersDropdown);
		//				$('#ilmDropdown').html('');
		//				$('#ilmDropdown').html(usersDropdownTemplate({name:'ilmUserId',id:'ilmUserId',users:self.ilmUsers,addBlankFirstOption:true,investorName:null}));

		var investmentZoneDropdownTemplate = _.template(investmentZoneDropdown);
		$('#investmentZoneDropdown').html('');
		$('#investmentZoneDropdown').html(investmentZoneDropdownTemplate({name:'investmentZone',id:'investmentZone',values:this.hilGroups,addBlankFirstOption:true}));

		//End

		//breadbox start
		this.investorProfileView.render({el:$('#investorProfileDropdown'),codeParamName:"clientInvestorProfile",addBlankFirstOption:"true"});
		this.investorTypeView.render({el:$('#investorTypeDropdown'),codeParamName:"investorType",addBlankFirstOption:"true"});
		this.realEstateKnowledgeView.render({el:$('#realEstateKnowledgeDropdown'),codeParamName:"realEstateKnowledge",addBlankFirstOption:"true"});
		this.huExpView.render({el:$('#huExperienceDropdown'),codeParamName:"priorExperienceWithHu",addBlankFirstOption:"true"});
		this.invGoalView.render({el:$('#investmentGoalDropdown'),codeParamName:"investmentGoal",addBlankFirstOption:"true"});
		this.timeFrameView.render({el:$('#buyingTimeframeDropdown'),codeParamName:"buyingTimeframe",addBlankFirstOption:"true"});
		this.finTypeView.render({el:$('#financingTypeDropdown'),codeParamName:"financingType",addBlankFirstOption:"true"});
		this.oppStatusView.render({el:$('#statusDropdown'),codeParamName:"status"});
		this.rehabPrefView.render({el:$('#rehabPreferenceDropdown'),codeParamName:"rehabPreference",addBlankFirstOption:"true"});
		
		

		this.lendersView.render({el:$('#lendersList')});
		$('#lendersList .form-control').attr('id', 'lendersDropdown');

		_.each(self.hilGroups, function(index,value) {
			$('#interestedLocations').append('<option value="'+index+'">'+index+'</option>');
		});
		if(this.isNotCollapsed=='Yes'){
			//					 $("#collapseOne").addClass("in");
			$("#collapseOne").collapse('show');
		}
		$('#collapseOne').on('hidden.bs.collapse', function () {
			$('#collapseOne').trigger('classChange');
		});
		$('#collapseOne').on('shown.bs.collapse', function () {
			$('#collapseOne').trigger('classChange');
		});
		$('#collapseOne').on('classChange', function () {
			if($('#plusIcon').hasClass("fa-plus-circle")){
				$('#plusIcon').removeClass('fa-plus-circle');
				$('#plusIcon').addClass('fa-minus-circle');
			}else{
				$('#plusIcon').removeClass('fa-minus-circle');
				$('#plusIcon').addClass('fa-plus-circle');
			}	
		});
		//bradbox end

		//Adding Opportunities
		if(!this.propertyAutoSuggestView) {
			this.propertyAutoSuggestView = new propertyAutoSuggestView();
		}
		this.propertyAutoSuggestView.opportunityId=this.opportunityId;
		this.propertyAutoSuggestView.setElement(this.$('#addPropertyOpportunity')).render();
		
		this.getLpoaMasterData();
		this.showPropertiesTab();
		this.loadInvestorDepositView();
		app.currencyFormatter("$");
		//				this.investorBreadboxFormValidation();
		this.opportunityDetailsFormValidation();

		/*if(self.status && self.status=='Closed'){
					$('.btn').attr('disabled','disabled');
				}*/
	
		

		return this;
	},
	renderHeader : function () {
		var self = this;
		this.headerTemplate = _.template( opportunityHeaderPage );
		var headerEl = this.$el.find('#opportunityHeader');
		headerEl.html("");
		headerEl.html(this.headerTemplate({navPermission:this.navPermission,opportunityData:this.model.attributes}));
		this.closingOppReasonCodesView.render({el:headerEl.find('#closingReasonTypes'),codeParamName:"closingReasonTypes",addBlankFirstOption:"true"});
		this.closingReasonTypesformValidation();
		$('#showOpportunityDetails').show();
		$('#editOpportunityDetails').hide();
		$('#investmentCriteriaDiv').hide();

		ComponentsPickers.init();
		return this;
	},
	fetchOpportunityData : function(opportunityId) {
		var self= this;
		this.model.getOpportunityInfo(opportunityId,
				{	success : function ( model, res ) {
			self.model.clear();
			self.model.set(res);
			self.investorId=res.opportunityResponse.investorId;
			self.investorName=res.opportunityResponse.investorName;
			self.ownershipTypeId=res.opportunityResponse.ownershipTypeId;
			self.object = res.investorBreadboxResponse.object;
			self.subObject = res.investorBreadboxResponse.subObject;
			self.investorBreadboxId=res.investorBreadboxResponse.investorBreadboxId; 
			self.status=res.opportunityResponse.status;
			self.isCloseAllowed=res.closingAllowed;
			$('#opportunityErrorMessage').css('display','none');
		},
		error   : function ( model, res ) {
			self.model.clear();
			$('#opportunityErrorMessage').css('display','block');
		}
				});
	},

	showEditInvestmentZone : function(evt){
		this.opportunityId=$(evt.target).data('opportunity');
		$("#editInvestmentZone #formAlertFailure").hide();
	},

	fetchIlmUsers: function(){
		var self=this;
		$.ajax({
			url: app.context()+'/user/ILM',
			contentType: 'application/json',
			async : false,
			dataType:'json',
			type: 'GET',
			success: function(res){
			self.ilmUsers=res;
		},
		error: function(res){
			console.log('Error in fetching ILM users');
		}

		});
	},

	fetchHilGroups:function(){
		var self=this;
		$.ajax({
			url: app.context()+'/opportunity/getHilGroups',
			contentType: 'application/json',
			async : false,
			dataType:'json',
			type: 'GET',
			success: function(res){
			self.hilGroups=res;
			console.log(self.hilGroups);
		},
		error: function(res){
			console.log('Error in fetching Hil groups');
		}

		});
	},

	saveInvestmentZone : function(){
		var self=this;
		var formData;
		if($("#editInvestmentZone #investmentZone").val()==""){
			$("#editInvestmentZone #formAlertFailure").show();
			return;
		}
		else{
			$("#editInvestmentZone #formAlertFailure").hide();
			formData= $('#investmentZoneForm').serializeArray();
			var oppModel=new opportunityModel();

			$.map(formData, function(n, i){
				var value=n['value'];
				var name=n['name'];

				oppModel.set(name,value);

			});
			/*if($("#sendMailToInvestor").parent().attr('class')=="checked"){
						oppModel.set("sendMailToInvestor",true);
					}
					else{
						oppModel.set("sendMailToInvestor",false);
					}*/

			if($('#sendBreadBoxInfoToILM').is(":checked")==true){
				oppModel.set("sendBreadBoxInfoToILM",true);
			}
			else{
				oppModel.set("sendBreadBoxInfoToILM",false);
			}

			oppModel.set("opportunityId",this.opportunityId);
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});

			$.ajax({
				url: app.context()+'/opportunity/recommendedZone',
				contentType: 'application/json',
				dataType:'json',
				type: 'POST',
				data: JSON.stringify(oppModel.attributes),
				success: function(res){
				$.unblockUI();
				//			                	console.log('Successfully created/updated recommended zone');
				var options={};
				options.navPermission=self.navPermission;
				options.opportunityId=self.opportunityId;
				var popup = $("#editInvestmentZone");
				popup.modal("hide");
				$(".modal-backdrop.in").hide();
				var isExpanded = false;
				if($('#chevron').hasClass('fa-chevron-up')){
					isExpanded = true;
				}
				self.render(options);
				if(isExpanded){
					$('#investmentCriteriaDiv').show();
					$('#chevron').removeClass('fa-chevron-down');
					$('#chevron').addClass('fa-chevron-up');
				}
				App.scrollTo(0);
			},
			error: function(res){
				$.unblockUI();
				//			                	console.log('Failed to create/update recommended zone');

				var options={};
				options.navPermission=self.navPermission;
				options.opportunityId=self.opportunityId;
				var popup = $("#editInvestmentZone");
				popup.modal("hide");
				$(".modal-backdrop.in").hide();
				var isExpanded = false;
				if($('#chevron').hasClass('fa-chevron-up')){
					isExpanded = true;
				}
				self.render(options);
				if(isExpanded){
					$('#investmentCriteriaDiv').show();
					$('#chevron').removeClass('fa-chevron-down');
					$('#chevron').addClass('fa-chevron-up');
				}
				App.scrollTo(0);
			}
			});
		}
	},
	//		    showEditInvestorBreadbox : function(){
	//		    	 var self=this;
	//		    	
	//				 var opportunityData=this.model.attributes;
	//				 var res= opportunityData.investorBreadboxResponse;
	//				 
	//				 $("#investorProfileDropdown").find('select').val(res.clientInvestorProfileId);
	//				 $("#investorTypeDropdown").find('select').val(res.investorTypeId);
	//				 $("#realEstateKnowledgeDropdown").find('select').val(res.realEstateKnowledgeId);
	//				 $("#huExperienceDropdown").find('select').val(res.priorExperienceWithHuId);
	//				 $("#investmentGoalDropdown").find('select').val(res.investmentGoalId);
	//				 $("#buyingTimeframeDropdown").find('select').val(res.buyingTimeframeId);
	//				 $("#financingTypeDropdown").find('select').val(res.financingTypeId);
	//				 $("#rehabPreferenceDropdown").find('select').val(res.rehabPreferenceId);
	//				 
	//				 $("#returnsPercentageFrom").val(res.returnsPercentageFrom);
	//				 $("#returnsPercentageTo").val(res.returnsPercentageTo);
	//				 $("#investmentAmountFrom").val(res.investmentAmountFrom);
	//				 $("#investmentAmountFrom_currency").val(res.investmentAmountFrom);
	//				 $("#investmentAmountTo").val(res.investmentAmountTo);
	//				 $("#investmentAmountTo_currency").val(res.investmentAmountTo);
	//				 $("#priceRangeFrom").val(res.priceRangeFrom);
	//				 $("#priceRangeFrom_currency").val(res.priceRangeFrom);
	//				 $("#priceRangeTo").val(res.priceRangeTo);
	//				 $("#priceRangeTo_currency").val(res.priceRangeTo);
	//				 $("#totalInvestmentPotentialFrom").val(res.totalInvestmentPotentialFrom);
	//				 $("#totalInvestmentPotentialFrom_currency").val(res.totalInvestmentPotentialFrom);
	//				 $("#totalInvestmentPotentialTo").val(res.totalInvestmentPotentialTo);
	//				 $("#totalInvestmentPotentialTo_currency").val(res.totalInvestmentPotentialTo);
	//				 
	//				 var interestedLocations = res.interestedLocations;
	//				 if(interestedLocations!=null){
	//					 var values = interestedLocations.split(", ");
	//					 $("#interestedLocations").val(values);
	//				 }
	//				 
	//				 $("#propertyCount").val(res.propertyCount);
	//				 $("#saleComments").val(res.saleComments);
	//				 if(self.navPermission.opportunityView){
	//					 $("#saleComments").attr('readonly','readonly'); 
	//				 }
	//				 
	//				 var form1 = $('#investorBreadboxForm');
	//				 var error1 = $('.alert-danger', form1);
	//				 var success1 = $('.alert-success', form1);
	//				 var suggestions = $('.has-error', form1);
	//				 suggestions.removeClass('has-error');
	//				 $('.help-block').remove();
	//				 error1.hide();
	//				 success1.hide();
	//				 $('#editInvestorBreadbox').modal('show');
	//		     },
	showOppOwnershipModal:function(){
		var thisPtr=this;
		if(app.closingView && app.closingView.ownershipTypeView){
			app.closingView.ownershipTypeView.close();
			app.closingView.ownershipTypeView.remove();
		}
		if(!app.opportunityView.ownershipTypeView){
			app.opportunityView.ownershipTypeView = new ownershipTypeView();
			thisPtr.listenTo(app.opportunityView.ownershipTypeView, 'ownershipTypeChangedSuccess', thisPtr.ownershipTypeSuccessListener);
			thisPtr.listenTo(app.opportunityView.ownershipTypeView, 'ownershipTypeChangedFailure', thisPtr.ownershipTypeFailureListener);
		}
		app.opportunityView.ownershipTypeView.setElement(thisPtr.$el.find("#ownershipDiv"));
		app.opportunityView.ownershipTypeView.ownershipTypeModel.objectId = this.opportunityId;;
		app.opportunityView.ownershipTypeView.ownershipTypeModel.object = "Opportunity";
		app.opportunityView.ownershipTypeView.render();
	},

	sendAssetAggrement:function(){
		var self = this;
		$.blockUI({
			baseZ: 999999,
			message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
		});
		$.ajax({
			url: app.context()+'/opportunity/createaaagreement/'+self.opportunityId,
			contentType: 'application/json',
			dataType:'json',
			type: 'POST',
			async: true,
			data: null,
			success: function(res){
			$.unblockUI();
			$('#assetAcquisitionAggrementSuccess').modal('show');
			$("#reSendforsignDiv").show();
			$("#sendforsignDiv").hide();
		},
		error: function(res){
			$.unblockUI();
			$('#opportunityErrorMessage').show();
			$('#opportunityErrorMessage').html('');
			$('#opportunityErrorMessage').html("Failed to create Asset Acquisition Agreement.");
			App.scrollTo($('#opportunityErrorMessage'), -200);
			$('#opportunityErrorMessage').delay(2000).fadeOut(3000);
			return this;
		}
		});
	},
	createLpoa:function(){
		var self=this;
		if(self.ownershipTypeId==null){
			$('#opportunityErrorMessage').show();
			$('#opportunityErrorMessage').html('');
			$('#opportunityErrorMessage').html("Please set the ownership type before creating an LPOA.");
			App.scrollTo($('#opportunityErrorMessage'), -200);
			$('#opportunityErrorMessage').delay(2000).fadeOut(3000);
			return this;
		}else{
			var values = new Array();
			$.each($(".lpoaCheck:checked",self.opportunityPropertiesView.oppPropertyTable.fnGetNodes()), function() {
				values.push($(this).data('objectid'));
			});
			if(values.length==0){
				$('#lpoaStatusErrorMessage').show();
				$('#lpoaStatusErrorMessage > text').html('');
				$('#lpoaStatusErrorMessage > text').html("To create an LPOA you must select at least one property from the table below.");
				App.scrollTo($('#lpoaStatusErrorMessage'), -200);
				$('#lpoaStatusErrorMessage').delay(2000).fadeOut(3000);
				return this;
			}
			var maxSelect=10;
			/*var amendmentmsg='';
						if(self.lopaAmendment){
							maxSelect=5;
							amendmentmsg='Amendment';
						}*/
			if(values.length>maxSelect){
				$('#lpoaStatusErrorMessage').show();
				$('#lpoaStatusErrorMessage > text').html('');
				$('#lpoaStatusErrorMessage > text').html("A maximum of "+maxSelect+" properties may be selected for LPOA");
				App.scrollTo($('#lpoaStatusErrorMessage'), -200);
				$('#lpoaStatusErrorMessage').delay(2000).fadeOut(3000);
				return this;
			}else{
				self.editLpoaDataModal(values);
			}
		}
	},
	editLpoaDataModal:function(values){
		var self=this;
		$.ajax({
			url: app.context()+'/lpoaopportunity/getPropertiesForlpoa/'+self.opportunityId,
			contentType: 'application/json',
			dataType:'json',
			type: 'POST',
			async: false,
			data: JSON.stringify(values),
			success: function(res){
			if(!jQuery.isEmptyObject(res)){
				self.buildLpoaModalFormResponse(res);
				$('.priorityCount').hide();
				var usersDropdownTemplate = _.template(usersDropdown);
				var lpoahuSigners=self.opportunityPropertiesView.huSigners;
				$('#lpoaSignerDropdown').html(usersDropdownTemplate({name:'lpoahuSignerid',id:'lpoahuSignerid',users:lpoahuSigners,addBlankFirstOption:true,investorName:null}));
				$(".lpoafinanced").removeAttr("disabled");
				$('#savelpoaData').show();
				$('#sendAndSaveLpoaData').show();
				if(self.lopaAmendment){
					$('.lpoaAmmendmentHide').hide();
				}
				self.numberOfPropertiesSelected=res.opportunitylpoaPropertyList.length;
				var depositAmountCashList= new Array();
				var depositAmountFinancedList= new Array();
				$.each(res.opportunitylpoaPropertyList, function(key,value) {
					depositAmountCashList.push(value.depositAmountCash);
					depositAmountCashList.sort(function(a, b){return b-a});
					depositAmountFinancedList.push(value.depositAmountFinancial);
					depositAmountFinancedList.sort(function(a, b){return b-a});
				});
				self.depositAmountCashList=depositAmountCashList;
				self.depositAmountFinancedList=depositAmountFinancedList;
				self.lpoaFormValidation($('#lpoamainDiv').find("form"));
				console.log("res:"+res);
				console.log(res);
			}
		},
		error: function(res){
			$('#lpoaStatusErrorMessage').show();
			$('#lpoaStatusErrorMessage > text').html('');
			if(JSON.parse(res.responseText)){
				$('#lpoaStatusErrorMessage > text').html(JSON.parse(res.responseText).message);
				App.scrollTo($('#opportunityErrorMessage'), -200);
			}else{
				$('#lpoaStatusErrorMessage > text').html("Failed to retrieve properties For LPOA");
				App.scrollTo($('#lpoaStatusErrorMessage'), -200);
			}
			$('#lpoaStatusErrorMessage').delay(2000).fadeOut(3000);
		}
		});
	},
	moveLpoaProperty:function(evt){
		var button = $(evt.currentTarget);
		var row = button.parents("tr:first");
		if (button.is(".lpoaup")) {
			row.insertBefore(row.prev());
		} else {
			row.insertAfter(row.next());
		}
	},
	sendAndSaveLpoaData: function(){
		var self=this;
		var url = app.context()+'/lpoaopportunity/saveOpplpoaAndSendMail/'+self.opportunityId;
		self.savelpoaDataRequest(url,true);
	},
	savelpoaData: function(){
		var self=this;
		var url = app.context()+'/lpoaopportunity/saveOpplpoa/'+self.opportunityId;
		self.savelpoaDataRequest(url,false);
	},
	savelpoaDataRequest:function(url,loadInvestorDeposit){
		var self=this;
		var currentForm = $('#lpoaPorpertiesForm');
		if(currentForm.validate().form()){
			var obj={};
			obj.lpoaOpportunityId=currentForm.data("lpoaId");
			obj.opportunityid=self.opportunityId;
			obj.numberOfProperties=$("#numberOfProperties").val();
			if(!self.lopaAmendment){
				obj.depositAmount=$("#lpoaDepositAmount").val();
			}else{
				obj.additional=$(".additionalPurchase").prop("checked");
			}
			obj.huSigner=$("#lpoahuSignerid").val();
			obj.financed=$(".lpoafinanced").prop("checked");
			var objproperties= new Array();
			var amountValidation=true;
			$("#lpoaPropertyDataTable tr.lpoaitem").each(function() {
				var subobj={};
				subobj.hilOppPropertyId=$(this).data("objectid");
				subobj.lpoaOppPropertyId=$(this).data("lpoaOppPropertyId");
				subobj.priority=$(this).find("input.lpoapriority").val();
				subobj.minbid=$(this).find("input.minBid").val();
				subobj.maxbid=$(this).find("input.maxBid").val();
				if(subobj.minbid<=0 || subobj.maxbid<=0){
					amountValidation=false;
				}
				objproperties.push(subobj);
			});
			if(!self.lopaAmendment && !obj.depositAmount){
				$('#lpoaFormerrorMsg').show();
				$('#lpoaFormerrorMsg > text').html('');
				$('#lpoaFormerrorMsg > text').html("Deposit Amount is required.");
				App.scrollTo($('#lpoaFormerrorMsg'), -200);
				$('#lpoaFormerrorMsg').delay(2000).fadeOut(2000);
				return;
			}
			if(!amountValidation){
				$('#lpoaFormerrorMsg').show();
				$('#lpoaFormerrorMsg > text').html('');
				$('#lpoaFormerrorMsg > text').html("Min Bid and Max Bid are required");
				App.scrollTo($('#lpoaFormerrorMsg'), -200);
				$('#lpoaFormerrorMsg').delay(2000).fadeOut(2000);
				return;
			}
			if($("#lpoaSignerDropdown option:selected").text()=='select'){
				$('#lpoaSignererrorMsg > text').html('');
				$('#lpoaSignererrorMsg > text').html('Please select LPOA HomeUnion Signer.');
				$('#lpoaSignererrorMsg').show();
				$('#lpoaSignererrorMsg').delay(2000).fadeOut(2000); 
				return;
			}
			obj.lpoaOpportunityProperties=objproperties;
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			$.ajax({
				/*url: app.context()+'/lpoaopportunity/saveOpplpoa/'+self.opportunityId,*/
				url: url,
				contentType: 'application/json',
				dataType:'json',
				type: 'POST',
				async: true,
				data: JSON.stringify(obj),
				success: function(res){
				$.unblockUI();
				self.getLpoaMasterData();
				self.showPropertiesTab();
				if(loadInvestorDeposit && self.investorDepositView){
					self.investorDepositView.fetchInvestorDepositData();
				}
				$("#lpoaPropertModal").modal("hide");
				$('#lpoaStatusSuccessMessage').show();
				$('#lpoaStatusSuccessMessage > text').html('');
				if(loadInvestorDeposit){
					$('#lpoaStatusSuccessMessage > text').html("Successfully Created LPOA and Sent mail to investor");
				}else{
					$('#lpoaStatusSuccessMessage > text').html("Successfully Created LPOA");
				}
				App.scrollTo($('#lpoaStatusSuccessMessage'), -200);
				$('#lpoaStatusSuccessMessage').delay(2000).fadeOut(3000);
			},
			error: function(res){
				$.unblockUI();
				$('#lpoaFormerrorMsg').show();
				$('#lpoaFormerrorMsg > text').html('');
				if(loadInvestorDeposit){
					$('#lpoaFormerrorMsg > text').html("Failed to Create LPOA and Send mail to investor");
				}else{
					$('#lpoaFormerrorMsg > text').html("Failed to Create LPOA");
				}
				App.scrollTo($('#lpoaFormerrorMsg'), -200);
				$('#lpoaFormerrorMsg').delay(2000).fadeOut(3000);
			}
			});
		}
	},
	uploadLpoaDocument:function(evt){
		var self=this;
		var button = $(evt.currentTarget);
		var lpoaId=button.data('objectid');
		var recipient=button.data('recipient');
		/*if(!$("#"+recipient+"Lpoadocument").val()){
			return;
		}*/
		var lpoaForm=$("."+recipient+"LpoaUploadForm");
		if (lpoaForm.validate().form()){
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			lpoaForm.ajaxSubmit({
				url: app.context()+'/lpoaopportunity/uploadlpoa/'+recipient+"/"+lpoaId,
				async:true,
				success: function(res){
					$.unblockUI();
					self.getLpoaMasterData();
					self.buildLpoaModalFormResponse(res);
					$('.priorityArrow').hide();
					if(res.isAmendment && res.isAmendment=='Y'){
						$('.lpoaAmmendmentHide').hide();
					}else if(res.lpoaStatus=='Signed'){
						if(self.investorDepositView){
							self.investorDepositView.fetchInvestorDepositData();
						}
					}
					var usersDropdownTemplate = _.template(usersDropdown);
					var lpoahuSigners=self.opportunityPropertiesView.huSigners;
					$('#lpoaSignerDropdown').html(usersDropdownTemplate({name:'lpoahuSignerid',id:'lpoahuSignerid',users:[{userId:null,userName:res.huSigner}],addBlankFirstOption:false,investorName:null}));
					$('#lpoamainDiv').find("form input").attr('readonly', 'readonly');
					$(".additionalPurchase").attr("disabled", true);
					$(".lpoafinanced").attr("disabled", true);
					$('#savelpoaData').hide();
					$('#sendAndSaveLpoaData').hide();
					$('#lpoaFormSuccessMessage').show();
					$('#lpoaFormSuccessMessage > text').html("Successfully Uploaded LPOA document");
					App.scrollTo($('#lpoaFormSuccessMessage'), -200);
					$('#lpoaFormSuccessMessage').delay(2000).fadeOut(2000);
				},
				error: function(res){
					$.unblockUI();
					console.log("failed to upload LPOA document");
					$('#lpoaFormerrorMsg').show();
					$('#lpoaFormerrorMsg > text').html("Failed to Uploaded LPOA document");
					App.scrollTo($('#lpoaFormerrorMsg'), -200);
					$('#lpoaFormerrorMsg').delay(2000).fadeOut(3000);
				}
			});
		}
	},
	uploadInvestorLpoaFormValidation:function(currentForm){
		var self= this;
		var form1 = currentForm;
		form1.validate({
			errorElement: 'span', //default input error message container
			errorClass: 'help-block', // default input error message class
			focusInvalid: false, // do not focus the last invalid input
			ignore: "",
			rules: {
				investorLpoadocument:{
							required: true
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
	uploadCobuyerLpoaFormValidation:function(currentForm){
		var self= this;
		var form1 = currentForm;
		form1.validate({
			errorElement: 'span', //default input error message container
			errorClass: 'help-block', // default input error message class
			focusInvalid: false, // do not focus the last invalid input
			ignore: "",
			rules: {
				cobuyerLpoadocument:{
							required: true
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
	showcancelLpoaPopup:function(evt){
		var self=this;
		var lpoaId=$(evt.currentTarget).data('lpoaid');
		$('#cancellpoapopup').find('.form-group').each(function() {
			$(this).removeClass('has-error');
			$(this).find('.help-block').hide();
		});
		$('.cancellpoaButton').data('lpoaid',lpoaId);
		$('#cancellpoaComment').val("");
		$("#cancellpoapopup").modal("show");
		self.cancelLpoaFormValidation($('#cancellpoapopup').find("form"));
	},
	cancelLpoa:function(evt){
		if($('.cancellpoaReasonForm').validate().form()){
			var self=this;
			var lpoaId=$(evt.currentTarget).data('lpoaid');
			var cancellpoaComment=$('#cancellpoaComment').val();
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Cancelling unsigned LPOA/Amendment...</div>'
			});
			$.ajax({
				url: app.context()+'/lpoaopportunity/cancellpoa/'+lpoaId,
				contentType: 'application/json',
				dataType:'json',
				type: 'POST',
				async: true,
				data: cancellpoaComment,
			success: function(res){
				$("#cancellpoapopup").modal("hide");
				$.unblockUI();
				self.showPropertiesTab();
				self.getLpoaMasterData();
				if(self.investorDepositView){
					self.investorDepositView.fetchInvestorDepositData();
				}
				$('#lpoaStatusSuccessMessage').show();
				$('#lpoaStatusSuccessMessage > text').html('');
				$('#lpoaStatusSuccessMessage > text').html("Successfully Cancelled LPOA/Amendment");
				App.scrollTo($('#lpoaStatusSuccessMessage'), -200);
				$('#lpoaStatusSuccessMessage').delay(2000).fadeOut(3000);
			},
			error: function(res){
				$("#cancellpoapopup").modal("hide");
				$.unblockUI();
				$('#lpoaStatusErrorMessage').show();
				$('#lpoaStatusErrorMessage > text').html('');
				$('#lpoaStatusErrorMessage > text').html("Failed to Cancel LPOA/Amendment");
				App.scrollTo($('#lpoaStatusErrorMessage'), -200);
				$('#lpoaStatusErrorMessage').delay(2000).fadeOut(3000);
			}
			});
		}
	},
	cancelLpoaFormValidation:function(currentForm){
		var self= this;
		var form1 = currentForm;
		form1.validate({
			errorElement: 'span', //default input error message container
			errorClass: 'help-block', // default input error message class
			focusInvalid: false, // do not focus the last invalid input
			ignore: "",
			rules: {
				cancellpoaComment:{
							required: true
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
	lpoaFormValidation:function(currentForm){
		var self= this;
		var form1 = currentForm;
		form1.validate({
			errorElement: 'span', //default input error message container
			errorClass: 'help-block', // default input error message class
			focusInvalid: false, // do not focus the last invalid input
			ignore: "",
			rules: {
				numberOfProperties: {
					required: true,number: true,min: 1,max: self.numberOfPropertiesSelected
				}/*,
						lpoahuSignerid:{
							required: true
						}*/
		/*minBid: {
							required: true,number: true
						},
						maxBid: {
							required: true,number: true
						}*/
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
	getLpoaMasterData:function(){
		var self=this;
		$.ajax({
			url: app.context()+'/lpoaopportunity/getlpoamasterdata/'+self.opportunityId,
			contentType: 'application/json',
			dataType:'json',
			type: 'GET',
			async: false,
			success: function(res){
			console.log("res");
			console.log(res);
			self.lopaAmendment=res.amendment;
			self.lpoaSigned=res.lpoaSigned;
			self.lastLpoaStatus=res.lastLpoaStatus;
			self.lastLpoaInvestorEnvelopeId=res.lastLpoaInvestorEnvelopeId;
			var oppLpoaStatusTemplate = _.template(opportunityLpoaStatusPage);
			$('#lpoaStatusDiv').html(oppLpoaStatusTemplate({lpoadata:res}));
			if(self.lopaAmendment){
				$(".lpoasavebtn").text("Add Properties");
			}
			self.disableButtons();
		},
		error: function(res){
			$('#lpoaStatusErrorMessage').show();
			$('#lpoaStatusErrorMessage > text').html('');
			$('#lpoaStatusErrorMessage > text').html("Failed to get LPOA Status Data.");
			App.scrollTo($('#lpoaStatusErrorMessage'), -200);
			$('#lpoaStatusErrorMessage').delay(2000).fadeOut(3000);
		}
		});
	},
	buildLpoaModalFormResponse:function(res){
		var self=this;
		var opportunityLpoaPropTemplate = _.template(opportunityLpoaPage);
		console.log(opportunityLpoaPropTemplate);
		$("#lpoamainDiv").html(" ");
		$('#lpoamainDiv').html(opportunityLpoaPropTemplate({
			LpoaData:res,accounting:accounting}
				));
		var dataTable = $("#lpoaPropertyDataTable").dataTable({
			"bPaginate": false,  
			"bInfo": false,  
			"bFilter": false,
			"bAutoWidth": false,
			"bStateSave": true,
			"deferRender": true,
			"aoColumnDefs": [
			                 { "sWidth": "5%", "aTargets": [ 0 ], "bSortable": false },
			                 { "sWidth": "30%", "aTargets": [ 1 ], "bSortable": false },
			                 { "sWidth": "15%", "aTargets": [ 2 ], "bSortable": false },
			                 { "sWidth": "25%", "aTargets": [ 3 ], "bSortable": false },
			                 { "sWidth": "25%", "aTargets": [ 4 ], "bSortable": false }
			                 ],
			                 "aaSorting": []
		});
		if(res.financed){
			$('.lpoaDepositAmountCashDiv').hide();
			$('.lpoaDepositAmountFinancialDiv').show();
		}else{
			$('.lpoaDepositAmountCashDiv').show();
			$('.lpoaDepositAmountFinancialDiv').hide();
		}
		$(".currency").formatCurrency({symbol:""});
		app.currencyFormatter();
		$("#lpoaPropertModal").modal("show");
		self.uploadInvestorLpoaFormValidation($('.investorLpoaUploadForm'));
		self.uploadCobuyerLpoaFormValidation($('.cobuyerLpoaUploadForm'));
		self.disableButtons();
	},
	showlpoaDetails:function(evt){
		var self=this;
		var lpoaId=$(evt.currentTarget).data('lpoaid');
		$.ajax({
			url: app.context()+'/lpoaopportunity/getlpoaDetails/'+lpoaId,
			contentType: 'application/json',
			dataType:'json',
			type: 'GET',
			async: false,
			success: function(res){
			if(!jQuery.isEmptyObject(res)){
				self.buildLpoaModalFormResponse(res);
				/*$(".priorityArrow").each(function(indx) {
	   			    		 	$(this).html('<label class="control-label">'+(indx+1)+'</label>');
	                		});*/
				$('.priorityArrow').hide();
				if(res.isAmendment && res.isAmendment=='Y'){
					$('.lpoaAmmendmentHide').hide();
				}
				var usersDropdownTemplate = _.template(usersDropdown);
				var lpoahuSigners=self.opportunityPropertiesView.huSigners;
				$('#lpoaSignerDropdown').html(usersDropdownTemplate({name:'lpoahuSignerid',id:'lpoahuSignerid',users:lpoahuSigners,addBlankFirstOption:false,investorName:null}));
				$('#lpoaSignerDropdown select[name=lpoahuSignerid]').val(res.huSignerUserId)
				
				if(res.lpoaStatus!='Cancelled' && res.lpoaStatus=='Draft'){
					//saved data case
					$('#savelpoaData').show();
					$('#sendAndSaveLpoaData').show();
					self.numberOfPropertiesSelected=res.opportunitylpoaPropertyList.length;
					var depositAmountCashList= new Array();
					var depositAmountFinancedList= new Array();
					$.each(res.opportunitylpoaPropertyList, function(key,value) {
						depositAmountCashList.push(value.depositAmountCash);
						depositAmountCashList.sort(function(a, b){return b-a});
						depositAmountFinancedList.push(value.depositAmountFinancial);
						depositAmountFinancedList.sort(function(a, b){return b-a});
					});
					self.depositAmountCashList=depositAmountCashList;
					self.depositAmountFinancedList=depositAmountFinancedList;
					self.lpoaFormValidation($('#lpoamainDiv').find("form"));
				} else {
					$('#lpoamainDiv').find("form input").attr('readonly', 'readonly');
					$('#lpoaSignerDropdown select[name=lpoahuSignerid]').attr("disabled",true);
					$(".additionalPurchase").attr("disabled", true);
					$(".lpoafinanced").attr("disabled", true);
					$('#savelpoaData').hide();
					$('#sendAndSaveLpoaData').hide();
				}
			}
		},
		error: function(res){
			$('#lpoaStatusErrorMessage').show();
			$('#lpoaStatusErrorMessage > text').html('');
			$('#lpoaStatusErrorMessage > text').html("Failed to retrieve LPOA Data");
			$('#lpoaStatusErrorMessage').delay(2000).fadeOut(3000);
		}
		});
	},
	calculateDepositAmount:function(){
		var self=this;
		if($('#lpoaPorpertiesForm').validate().form()){
			if(!self.lopaAmendment){
				var propertyCount = $('#numberOfProperties').val();
				var depositAmountList= self.depositAmountCashList;
				if($(".lpoafinanced").prop("checked")){
					depositAmountList=self.depositAmountFinancedList;
				}
				var depositTotal=0;
				for(var i = 0; i < propertyCount; i++) {
					depositTotal += depositAmountList[i];
				}
				/*$(".lpoaDepositAmount").html("<div>"+accounting.formatMoney(depositTotal,'$',2)+"</div>");*/
				$("#lpoaDepositAmount").val(depositTotal);
				$("#lpoaDepositAmount_currency").val(accounting.formatMoney(depositTotal,'',2));
			}
		}
	},
	calculateDepAmtFinancial:function(){
		var self=this;
		var propertyCount = $('#numberOfProperties').val();
		var depositAmountList= self.depositAmountCashList;
		$('.lpoaDepositAmountCashDiv').show();
		$('.lpoaDepositAmountFinancialDiv').hide();
		if($(".lpoafinanced").prop("checked")){
			depositAmountList=self.depositAmountFinancedList;
			$('.lpoaDepositAmountCashDiv').hide();
			$('.lpoaDepositAmountFinancialDiv').show();
		}
		var depositTotal=0;
		for(var i = 0; i < propertyCount; i++) {
			depositTotal += depositAmountList[i];
		}
		/*$(".lpoaDepositAmount").html("<div>"+accounting.formatMoney(depositTotal,'$',2)+"</div>");*/
		$("#lpoaDepositAmount").val(depositTotal);
		$("#lpoaDepositAmount_currency").val(accounting.formatMoney(depositTotal,'',2));
	},
	showUploadDiv:function(){
		var form1 = $('#opportunityDetailsForm');
		var preQualified=$('input[name=preQualified]:checked').val();

		if(preQualified=='No') {
			form1.find('input[name=preQualDocument]').val("");
			form1.find('input[name=preQualDocument]').prop('disabled',true);
			$('#preQualDocumentErrDiv').hide();
			$('#preQualDocumentDiv').hide();
		} else {
			form1.find('input[name=preQualDocument]').prop('disabled', false);
			$('#preQualDocumentErrDiv').hide();
			$('#preQualDocumentDiv').show();
		}
	},
	showProofOfFundsDocDiv : function(){
		var form1 = $('#opportunityDetailsForm');
		var financingType = $("#financingTypeDropdown option:selected").text();
		if(financingType!='Cash'){
			form1.find('input[name=proofOfFundsDocument]').val("");
			form1.find('input[name=proofOfFundsDocument]').prop('disabled',true);
			$('#proofOfFundsDocErrDiv').hide();
			$('#proofOfFundsDocumentDiv').hide();
		} else {
			form1.find('input[name=proofOfFundsDocument]').prop('disabled', false);
			$('#proofOfFundsDocErrDiv').hide();
			$('#proofOfFundsDocumentDiv').show();
		}
	},
	showEditOpportunity :  function(evt){
		var self=this;
		//		    	this.opportunityId=$(evt.target).data('opportunity');

		var opportunityData=this.model.attributes;
		var oppRes= opportunityData.opportunityResponse;

		$('#investorLegalName').val(oppRes.investorLegalName);
		//				$('input[name=createdDate]').val(oppRes.createdDate);
		//				$('input[name=dateClosed]').val(oppRes.dateClosed);

		var text = $("#lendersDropdown option[value='"+oppRes.lenderCompanyName+"']").text();
		$('.bootstrap-select .filter-option').text(text);
		$('#lendersDropdown').val(oppRes.lenderCompanyName);

		//		    	$("#statusDropdown").find('select').val(oppRes.statusId); 

		$('input[name=preQualified]:checked').removeAttr('checked').parent().removeClass('checked');
		$('input[id=preQualified'+oppRes.preQualified+']').attr('checked','checked').parent().addClass('checked');;
		$('input[id=preQualified'+oppRes.preQualified+']').parent().click();
		this.showUploadDiv();

		var opportunityDetailsForm = $('#opportunityDetailsForm');
		//				var startDatePicker = opportunityDetailsForm.find('[name=createdDate]');
		//				
		//				if(startDatePicker.length>0) {
		//					$(startDatePicker[0]).parent().datepicker().on('changeDate', function (evt) {
		//						var selectedDate = new Date(evt.date.valueOf());
		//						var endDatePicker = opportunityDetailsForm.find('[name=dateClosed]');
		//						if(endDatePicker.length>0) {
		//							var endDatePickerWidget = $(endDatePicker[0]).parent();
		//							var endDate = endDatePickerWidget.datepicker("getDate");
		//							if(endDate<selectedDate) {
		//								endDatePickerWidget.data({date: selectedDate}).datepicker('update');
		//								var month = selectedDate.getMonth()+1;
		//								if(String(month).length<2) {
		//									month = '0'+month;
		//								}
		//								$(endDatePicker[0]).val(month+"-"+selectedDate.getDate()+"-"+selectedDate.getFullYear());
		//							}
		//							endDatePickerWidget.datepicker('setStartDate', selectedDate);
		//						}
		//					});
		//				}

		var opportunityData=this.model.attributes;
		var res= opportunityData.investorBreadboxResponse;

		$("#investorProfileDropdown").find('select').val(res.clientInvestorProfileId);
		$("#investorTypeDropdown").find('select').val(res.investorTypeId);
		$("#realEstateKnowledgeDropdown").find('select').val(res.realEstateKnowledgeId);
		$("#huExperienceDropdown").find('select').val(res.priorExperienceWithHuId);
		$("#investmentGoalDropdown").find('select').val(res.investmentGoalId);
		$("#buyingTimeframeDropdown").find('select').val(res.buyingTimeframeId);
		$("#financingTypeDropdown").find('select').val(res.financingTypeId);
		this.showProofOfFundsDocDiv();
		$("#rehabPreferenceDropdown").find('select').val(res.rehabPreferenceId);

		$("#returnsPercentageFrom").val(res.returnsPercentageFrom);
		$("#returnsPercentageTo").val(res.returnsPercentageTo);
		$("#investmentAmountFrom").val(res.investmentAmountFrom);
		$("#investmentAmountFrom_currency").val(res.investmentAmountFrom);
		$("#investmentAmountTo").val(res.investmentAmountTo);
		$("#investmentAmountTo_currency").val(res.investmentAmountTo);
		$("#priceRangeFrom").val(res.priceRangeFrom);
		$("#priceRangeFrom_currency").val(res.priceRangeFrom);
		$("#priceRangeTo").val(res.priceRangeTo);
		$("#priceRangeTo_currency").val(res.priceRangeTo);
		$("#totalInvestmentPotentialFrom").val(res.totalInvestmentPotentialFrom);
		$("#totalInvestmentPotentialFrom_currency").val(res.totalInvestmentPotentialFrom);
		$("#totalInvestmentPotentialTo").val(res.totalInvestmentPotentialTo);
		$("#totalInvestmentPotentialTo_currency").val(res.totalInvestmentPotentialTo);

		var interestedLocations = res.interestedLocations;
		if(interestedLocations!=null){
			var values = interestedLocations.split(", ");
			$("#interestedLocations").val(values);
		}

		$("#propertyCount").val(res.propertyCount);
		$("#saleComments").val(res.saleComments);
		if(self.navPermission.opportunityView){
			$("#saleComments").attr('readonly','readonly'); 
		}

		var form1 = $('#opportunityDetailsForm');
		var error1 = $('.alert-danger', form1);
		var success1 = $('.alert-success', form1);
		var suggestions = $('.has-error', form1);
		suggestions.removeClass('has-error');
		$('.help-block').remove();
		error1.hide();
		success1.hide();

		$('.breadbox > .toggleform').toggle();
	},
	//		    saveInvestorBreadbox: function(){
	//		    	var self=this;
	//		    	
	//		    	var investorBreadboxForm = $('#investorBreadboxForm');
	//		    	 if(investorBreadboxForm.validate().form()){
	//		    		 
	//					var formData = $('#investorBreadboxForm').serializeArray();
	//					var oppModel=new opportunityModel();
	//					
	//					$.map(formData, function(n, i){
	//						var value=n['value'];
	//						var name=n['name'];
	//					
	//						oppModel.set(name,value);
	//		
	//					});
	//					
	//					oppModel.set("opportunityId",self.opportunityId);
	//
	//					var interestedLocations =  $('#interestedLocations').val();
	//					oppModel.set("interestedLocations",interestedLocations);					
	//					
	//					$.ajax({
	//			                url: app.context()+'/opportunity/saveInvestorBreadbox',
	//			                async:true,
	//			                contentType: 'application/json',
	//			                dataType:'json',
	//			                type: 'POST',
	//			                data: JSON.stringify(oppModel),
	//			                success: function(res){
	////			                    console.log('Successfully created/updated Investor Breadbox');
	//			                    var options={};
	//			                    options.navPermission=self.navPermission;
	//			                    options.opportunityId=self.opportunityId;
	//			                    var popup = $("#editInvestorBreadbox");
	//								popup.modal("hide");
	//								popup.on('hidden.bs.modal', function (e) {
	//									self.render(options);
	////									$("#collapseOne").addClass("in");
	//									 $("#collapseOne").collapse('show');
	//								});
	//			                    
	//			                },
	//			                error: function(res){
	////			                	console.log('Failed to create/update Investor Breadbox');
	//			                	
	//			                	 var options={};
	//			                	    options.navPermission=self.navPermission;
	//				                    options.opportunityId=self.opportunityId;
	//				                    var popup = $("#editInvestorBreadbox");
	//									popup.modal("hide");
	//									popup.on('hidden.bs.modal', function (e) {
	//										self.render(options);
	////										$("#collapseOne").addClass("in");
	//										 $("#collapseOne").collapse('show');
	//									});
	//			                }
	//			            });
	//				  }
	//		     },
	//		    investorBreadboxFormValidation:function(){
	//					var form1 = $('#investorBreadboxForm');
	//					var error1 = $('.alert-danger', form1);
	//					var success1 = $('.alert-success', form1);
	//					var suggestions = $('.has-error', form1);
	//					suggestions.removeClass('has-error');
	//					$('.help-block').remove();
	//					error1.hide();
	//					$.validator.addMethod("dollarsscents", function(value, element) {
	//						return this.optional(element) || /^\d{1,8}(\.\d{0,2})?$/i.test(value);
	//					}, "Maximum 8 digits and 2 decimal places allowed");
	//					form1.validate({
	//						errorElement: 'span', //default input error message container
	//						errorClass: 'help-block', // default input error message class
	//						focusInvalid: false, // do not focus the last invalid input
	//						ignore: "",
	//						rules: {
	//							returnsPercentageFrom:{
	//								number: true,
	//								percentage : true
	//							},
	//							returnsPercentageTo:{
	//					    		number : true,
	//					    		percentage : true
	//							},
	//							investmentAmountFrom:{
	//								number: true,
	//								dollarsscents: true
	//							},
	//							investmentAmountTo:{
	//								number: true,
	//								dollarsscents: true
	//							},
	//							priceRangeFrom:{
	//								number: true,
	//								dollarsscents: true
	//							},
	//							priceRangeTo:{
	//								number: true,
	//								dollarsscents: true
	//							},
	//							totalInvestmentPotentialFrom:{
	//								number: true,
	//								dollarsscents: true
	//							},
	//							totalInvestmentPotentialTo:{
	//								number: true,
	//								dollarsscents: true
	//							},
	//							capRateFrom:{
	//					    		number : true,
	//					    		percentage : true
	//							},
	//							capRateTo:{
	//					    		number : true,
	//					    		percentage : true
	//							},
	//							propertyCount:{
	//								number:true
	//							}
	//
	//						},
	//						invalidHandler: function (event, validator) { //display error alert on form submit              
	//							success1.hide();
	//						    error1.show();
	//						    App.scrollTo(error1, -200);
	//						},
	//
	//						highlight: function (element) { // hightlight error inputs
	//							$(element)
	//							.closest('.form-group').addClass('has-error'); // set error class to the control group
	//						},
	//
	//						unhighlight: function (element) { // revert the change done by hightlight
	//							$(element)
	//							.closest('.form-group').removeClass('has-error'); // set error class to the control group
	//						},
	//
	//						success: function (label) {
	//							label
	//							.closest('.form-group').removeClass('has-error'); // set success class to the control group
	//						}
	//
	//					});
	//				},
	showAddComments : function(){
		var self = this;
		self.fetchComments();
		var commentsTemplate = _.template(commentsPopup);
		$('#commentsDiv').html('');
		$('#commentsDiv').html(commentsTemplate({msgDatas:self.messages,investorId:self.investorId,investorName:self.investorName,
			objectId:self.opportunityId,subObjectId:self.investorBreadboxId}));
		self.commentsFormValidation();
		$('#commentsModal').modal('show');
	},
	fetchComments:function(){
		var self= this;
		var object = self.object;
		var objectId = self.opportunityId;
		var subObject = self.subObject;
		var subObjectId = self.investorBreadboxId;

		$.ajax({
			url: app.context()+'/messages/subObjectMessages/'+object+'/'+objectId+'/'+null+'/'+subObject+'/'+subObjectId,
			contentType: 'application/json',
			dataType:'json',
			type: 'GET',
			async: false,
			success: function(res){
			console.log("msg datas ::"+res);
			if(!jQuery.isEmptyObject(res)){
				self.messages = res;
			}
		},
		error: function(res){
			//error
		}
		});
	},
	showMoreContent : function(evt){
		$(evt.currentTarget).parent().parent().find(".showLessContent").hide();
		$(evt.currentTarget).parent().parent().find(".showMoreContent").show();
	},
	showLessContent : function(evt){
		$(evt.currentTarget).parent().parent().find(".showMoreContent").hide();
		$(evt.currentTarget).parent().parent().find(".showLessContent").show();
	},
	saveBreadboxComments : function(){
		var self = this;
		var form = $("#commentsForm");
		var formData = $('#commentsForm').serializeArray();
		if(form.validate().form()){

			var oppModel=new opportunityModel();

			$.map(formData, function(n, i){
				var value=n['value'];
				var name=n['name'];

				oppModel.set(name,value);

			});
			
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			$.ajax({
				url: app.context()+'/opportunity/saveBreadboxComments',
				async:true,
				contentType: 'application/json',
				dataType:'json',
				type: 'POST',
				data: JSON.stringify(oppModel.attributes),
				success: function(res){
				$.unblockUI();
				//			                    console.log('Successfully saved Investor Breadbox Comments');
				var options={};
				options.navPermission=self.navPermission;
				options.opportunityId=self.opportunityId;
				var popup = $("#commentsModal");
				popup.modal("hide");
				popup.on('hidden.bs.modal', function (e) {
					$('#successDiv').show();
					$('#successDiv > text').html('');
					$('#successDiv > text').html("Successfully saved the comments");
					App.scrollTo($('#successDiv'), -200);
					$('#successDiv').delay(2000).fadeOut(3000);

					$('#investmentCriteriaDiv').show();
					$(evt.target).removeClass('fa-chevron-down');
					$(evt.target).addClass('fa-chevron-up');

					//										self.render(options);
					//									$("#collapseOne").addClass("in");
					//									 $("#collapseOne").collapse('show');
				});

			},
			error: function(res){
				$.unblockUI();
				//			                	console.log('Failed to save Investor Breadbox Comments');

				var options={};
				options.navPermission=self.navPermission;
				options.opportunityId=self.opportunityId;
				var popup = $("#commentsModal");
				popup.modal("hide");
				popup.on('hidden.bs.modal', function (e) {
					$('#failureDiv').show();
					$('#failureDiv > text').html('');
					$('#failureDiv > text').html("Error in saving the comments");
					App.scrollTo($('#failureDiv'), -200);
					$('#failureDiv').delay(2000).fadeOut(3000);

					$('#investmentCriteriaDiv').show();
					$(evt.target).removeClass('fa-chevron-down');
					$(evt.target).addClass('fa-chevron-up');

					//											self.render(options);
					//										$("#collapseOne").addClass("in");
					//										 $("#collapseOne").collapse('show');
				});
			}
			});
		}
	},
	commentsFormValidation: function(){
		var form1 = $('#commentsForm');
		//					var error1 = $('.alert-danger', form1);
		//					var success1 = $('.alert-success', form1);
		var suggestions = $('.has-error', form1);
		suggestions.removeClass('has-error');
		$('.help-block').remove();
		//					error1.hide();
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
			//							success1.hide();
			//						    error1.show();
			//						    App.scrollTo(error1, -200);
			//						    error1.delay(3000).fadeOut(3000);
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
	saveOpportunityDetails : function(){
		var self=this;
		var options={};
		options.navPermission=self.navPermission;
		options.opportunityId=self.opportunityId;
		var opportunityDetailsForm = $('#opportunityDetailsForm');
		if(opportunityDetailsForm.validate().form()){

			var preQualified = opportunityDetailsForm.find('input[name=preQualified]:checked').val();
			var preQualDoc = opportunityDetailsForm.find('input[name=preQualDocument]');
			var preQualDocVal = opportunityDetailsForm.find('input[name=preQualDocument]').val();
			var proofOfFundsDoc = opportunityDetailsForm.find('input[name=proofOfFundsDocument]');
			var proofOfFundsDocVal = opportunityDetailsForm.find('input[name=proofOfFundsDocument]').val();
			if(preQualDocVal=="") {
				preQualDoc.prop('disabled', true);
			}
			if(proofOfFundsDocVal=="") {
				proofOfFundsDoc.prop('disabled', true);
			}

			var lender=$("#lendersDropdown option:selected").val();
			var nonHuLender=$("#newlender").val();
			if(lender=="newlender"){
				if(nonHuLender == ""){
					$('#editOpportunityDetails #formAlertFailure >text').html("Please enter New Lender.");
					$('#editOpportunityDetails #formAlertFailure').show();
					App.scrollTo($('#editOpportunityDetails #formAlertFailure'), -200);
					$('#editOpportunityDetails #formAlertFailure').delay(3000).fadeOut(3000);
					return;
				}else{
					$('#lenderCompanyName').val(nonHuLender);
				}
			}else{
				$('#lenderCompanyName').val(lender);
			}	

			var oppModel=new opportunityModel();
			var interestedLocations =  $('#interestedLocations').val();
			oppModel.set("interestedLocations",interestedLocations);

			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			opportunityDetailsForm.attr("enctype","multipart/form-data");
			opportunityDetailsForm.ajaxSubmit({
				url: app.context()+'/opportunity/saveOpportunityDetails',
				async:true,
				contentType:'multipart/form-data',
				type: 'POST',
				data: JSON.stringify(oppModel.attributes),
				success: function(res){
				$.unblockUI();
				//					                    console.log('Successfully created/updated Opportunity details');
				//					                    var popup = $("#editOpportunityDetails");
				//										popup.modal("hide");
				//										popup.on('hidden.bs.modal', function (e) {
				//											if($("#collapseOne").hasClass("in")){
				//												self.isNotCollapsed="Yes";
				//											}else{
				//												self.isNotCollapsed="No";
				//											}
				//											self.render(options);
				//										});
				self.render(options);
				$('#investmentCriteriaDiv').show();
				$('#chevron').removeClass('fa-chevron-down');
				$('#chevron').addClass('fa-chevron-up');
				$('#successDiv').show();
				$('#successDiv > text').html('');
				$('#successDiv > text').html("Successfully saved the opportunity details");
				App.scrollTo($('#successDiv'), -200);
				$('#successDiv').delay(2000).fadeOut(3000);

			},
			error: function(res){
				$.unblockUI();
				//					                	console.log('Failed to create/update Opportunity details');

				//						                    var popup = $("#editOpportunityDetails");
				//											popup.modal("hide");
				//											popup.on('hidden.bs.modal', function (e) {
				//												if($("#collapseOne").hasClass("in")){
				//													self.isNotCollapsed="Yes";
				//												}else{
				//													self.isNotCollapsed="No";
				//												}
				//												self.render(options);
				//											});
				self.render(options);
				$('#investmentCriteriaDiv').show();
				$('#chevron').removeClass('fa-chevron-down');
				$('#chevron').addClass('fa-chevron-up');
				$('#failureDiv').show();
				$('#failureDiv > text').html('');
				$('#failureDiv > text').html("Error in saving the opportunity details");
				App.scrollTo($('#failureDiv'), -200);
				$('#failureDiv').delay(2000).fadeOut(3000);
			}
			});
		}
	},
	cancelOpportunityDetails:function() {
		$('#editOpportunityDetails').hide();
		$('#showOpportunityDetails').show();
		//			        $('#editOpportunityDetailsBtn').show();
		App.scrollTo(0);
	},
	showNewLender: function() {
		var lenderCompany = $("#lendersDropdown").val();
		if(lenderCompany=="newlender"){
			$("#newlender").prop("disabled", false);
		}else{
			$("#newlender").prop("disabled", true);
		}
	},
	addPropertyToOpportunity: function(evt){
		var self = this;
		var propertyId = $(evt.currentTarget).parent().parent().find("#propertyAutoSuggestDD").val();
		console.log("addPropertyToOpportunity");
		var oppId = this.opportunityId;
		if(propertyId){
			$.ajax({
				url: app.context()+'/hilOpportunityProperty/addOpportunityProperty/' + propertyId+'/'+oppId,
				contentType: 'application/json',
				async : false,
				dataType:'json',
				type: 'POST',
				success: function(res){
					self.opportunityPropertiesView.addRecentlyAddedatFirst(res.recentlyAddedHilOppProp);
					$('#propertyAutoSuggestDD').select2('data', null);
					$("#oppPropertyStatusSelect [name=propertyStatus]").val("showAll");
				},
				error: function(res){
					console.log('Error in Adding Opportunity Property');
				}
			});
		}
	},
	opportunityDetailsFormValidation: function(){
		var form1 = $('#opportunityDetailsForm');
		var error1 = $('.alert-danger', form1);
		var success1 = $('.alert-success', form1);
		var suggestions = $('.has-error', form1);
		suggestions.removeClass('has-error');
		$('.help-block').remove();
		error1.hide();
		form1.validate({
			errorElement: 'span', //default input error message container
			errorClass: 'help-block', // default input error message class
			focusInvalid: false, // do not focus the last invalid input
			ignore: "",
			rules: {
			returnsPercentageFrom:{
			number: true,
			percentage : true
		},
		returnsPercentageTo:{
			number : true,
			percentage : true
		},
		investmentAmountFrom:{
			number: true,
			dollarsscents: true
		},
		investmentAmountTo:{
			number: true,
			dollarsscents: true
		},
		priceRangeFrom:{
			number: true,
			dollarsscents: true
		},
		priceRangeTo:{
			number: true,
			dollarsscents: true
		},
		totalInvestmentPotentialFrom:{
			number: true,
			dollarsscents: true
		},
		totalInvestmentPotentialTo:{
			number: true,
			dollarsscents: true
		},
		capRateFrom:{
			number : true,
			percentage : true
		},
		capRateTo:{
			number : true,
			percentage : true
		},
		propertyCount:{
			number:true
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
	showPropertiesTab:function() {
		var self = this;
		this.removeActiveTab();
		if(!this.opportunityPropertiesView){
			this.opportunityPropertiesView = new opportunityPropertiesView({parent:this});
			self.listenTo(self.opportunityPropertiesView, 'PropertiesTableDrawn', self.propertiesTableDrawn);
			self.listenTo(app.opportunityView.opportunityPropertiesView, 'closingAllowedStatusChange', self.closingAllowedStatusChange);
		}
		app.opportunityView.opportunityPropertiesView.opportunityId = this.opportunityId;
		app.opportunityView.opportunityPropertiesView.collection.opportunityId = this.opportunityId;

		this.opportunityPropertiesView.setElement($('#opportunityPropertiesTab')).fetchOpportunityProperties({parentView:this});
		$("#opportunityProperties").parent().addClass('active')
		$("#opportunityPropertiesTab").addClass("active");
	},
	propertiesTableDrawn:function(){
		var self = this;
		self.disableButtons();
	},
	removeActiveTab:function(){
		$("li[name=opportunityInfoNav].active").removeClass("active");
		$('div[name=opportunityInfoTab].active').empty().removeClass("active");
	},

	showWishlistTab: function(){
		var thisPtr=this;
		this.removeActiveTab();

		if(app.investorProfileView && app.investorProfileView.wishlistView){
			app.investorProfileView.wishlistView.close();
			app.investorProfileView.wishlistView.remove();
		}

		if(!app.opportunityView.wishlistView){
			app.opportunityView.wishlistView=new wishlistView({collection:new wishlistCollection()});
			thisPtr.listenTo(app.opportunityView.wishlistView, 'WishlistTableDrawn', thisPtr.wishlistTableDrawn);
		}
		app.opportunityView.wishlistView.collection.investorId=this.investorId;
		app.opportunityView.wishlistView.opportunityId=this.opportunityId;
		app.opportunityView.wishlistView.setElement($('#opportunityWishlistDetailsTab')).render();
		$("#wishlistDetails").parent().addClass('active');
		$("#opportunityWishlistDetailsTab").addClass("active");
		return this; 
	},
	wishlistTableDrawn:function(){
		var self = this;
		self.disableButtons();
	},
	redrawOppPropertyTable:function(evt){
		console.log($(evt.currentTarget).val());
		var statusId = $(evt.currentTarget).val();
		this.opportunityPropertiesView.redrawOppPropertyTableForStatus(statusId);
	},
	showDocumentsTab : function(){
		var self = this;
		this.removeActiveTab();
		this.object="Opportunity";

		if(app.mypropertyView && app.mypropertyView.documentView){
			app.mypropertyView.documentView.close();
			app.mypropertyView.documentView.remove();
		}
		if(app.homeView && app.homeView.documentView){
			app.homeView.documentView.close();
			app.homeView.documentView.remove();
		}
		if(app.closingView && app.closingView.documentView){
			app.closingView.documentView.close();
			app.closingView.documentView.remove();
		}
		if(app.investorProfileView && app.investorProfileView.documentView){
			app.investorProfileView.documentView.close();
			app.investorProfileView.documentView.remove();
		}

		if(!app.opportunityView.documentView){
			app.opportunityView.documentView=new documentView({collection: new documentCollection()});
			self.listenTo(app.opportunityView.documentView, 'DocumentViewLoaded', self.documentViewLoaded);
		}

		app.opportunityView.documentView.object=this.object;
		app.opportunityView.documentView.objectId=this.opportunityId;
		app.opportunityView.documentView.setElement($('#opportunityDocumentsTab')).fetchDocument();
		$("#opportunityDocuments").parent().addClass('active')
		$("#opportunityDocumentsTab").addClass("active");
	},
	showMessagesTab: function(){
		var thisPtr=this;
		var object="Opportunity";
		this.removeActiveTab();

		if(app.mypropertyView && app.mypropertyView.messagesView){
			app.mypropertyView.messagesView.propertyModel.clear();
			app.mypropertyView.messagesView.close();
			app.mypropertyView.messagesView.remove();
		}

		if(app.closingView && app.closingView.messagesView){
			app.closingView.messagesView.propertyModel = {};
			app.closingView.messagesView.close();
			app.closingView.messagesView.remove();
		}

		if(app.investorProfileView && app.investorProfileView.messagesView){
			app.investorProfileView.messagesView.propertyModel = {};
			app.investorProfileView.messagesView.close();
			app.investorProfileView.messagesView.remove();
		}


		if(!app.opportunityView.messagesView){
			app.opportunityView.messagesView=new messagesView({collection:new messagesCollection()});
			this.listenTo(app.opportunityView.messagesView,"MessagesTableDrawn",thisPtr.messagesTableDrawn);
		}
		app.opportunityView.messagesView.propertyModel.objectId =this.opportunityId;
		app.opportunityView.messagesView.propertyModel.object = object;
		app.opportunityView.messagesView.collection.objectId=this.opportunityId;
		app.opportunityView.messagesView.collection.object=object;

		app.opportunityView.messagesView.setElement($('#opportunityMessagesTab')).fetchMessages();

		$("#opportunityMessages").parent().addClass('active');
		$("#opportunityMessagesTab").addClass("active");
		return this;
	},
	messagesTableDrawn:function(){
		var self = this;
		self.disableButtons();
	},
	showContactsTab: function(){
		var thisPtr=this;
		var object="Opportunity";
		this.removeActiveTab();

		if(!app.opportunityView.contactView){
			app.opportunityView.contactView=new contactView({collection:new contactCollection()});
		}
		app.opportunityView.contactView.collection.objectId=thisPtr.opportunityId;
		app.opportunityView.contactView.collection.object=object;
		app.opportunityView.contactView.object=object;
		app.opportunityView.contactView.objectId=thisPtr.opportunityId;

		app.opportunityView.contactView.setElement($('#opportunityContactsTab')).render();
		$("#opportunityContacts").parent().addClass('active');
		$("#opportunityContactsTab").addClass("active");
		this.disableButtons();
		return this; 
	},
	showCloseOppPopUP:function(evt){
		
		var self=this;
		
	
		
		
		if(this.isCloseAllowed==false){
			console.log("cannot close");
			$('#closingErrormsg').show();
			$('#closingErrormsg > text').html('');
			$('#closingErrormsg > text').html("Opportunity cannot be close since one or more property is still in offer/closing process.");
			App.scrollTo($('#closingErrormsg'), -200);
			$('#closingErrormsg').delay(2000).fadeOut(3000);
			
			
		}
		else{

		$('#closeopportunitypopup').find('.form-group').each(function() {
			$(this).removeClass('has-error');
			$(this).find('.help-block').hide();
		});
		$('[name=closingReasonTypes]').val('select');
		$('#closeopportunitypopup').modal('show');
		}
		
		
	},
	
	closingAllowedStatusChange:function(evt){
		
		this.isCloseAllowed=false;
	},
	
	closeOpportunity: function(evt){
		var self = this;
		var requestObj={};
	
	
	
		if ($('.closingReasonTypesForm').validate().form()){
		formData= $(evt.currentTarget).closest('form').serializeArray();
		var value=$('#closingReasonTypes option:selected').text();
		requestObj.closingReason=value;
		
		$.blockUI({
			baseZ: 999999,
			message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
		});

		
	
		$.ajax({
			
			url: app.context()+'/opportunity/close/'+this.opportunityId,
			contentType: 'application/json',
			async : true,
			dataType:'json',
			type: 'POST',
			data: JSON.stringify(requestObj),
			success: function(res){
			$.unblockUI();
			console.log('successfully closed the opportunity');
			$('#closeopportunity').modal('hide');
			self.status=res.opportunityStatus;
			
			self.fetchOpportunityData(self.opportunityId);
			self.renderHeader();
			self.getLpoaMasterData();
			self.disableButtons();
			$(".modal-backdrop.fade.in").remove()
		},
		error: function(res){
			$.unblockUI();
			$('#closeopportunity').modal('hide');
			console.log('Error occured while closing the opportunity');
			$(".modal-backdrop.fade.in").remove()
		}

		});
		}
		
	},

	reOpenOpportunity: function(evt){
		var self = this;
		
		$.blockUI({
			baseZ: 999999,
			message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
		});

		
		
		
		$.ajax({
			url: app.context()+'/opportunity/reopen/'+this.opportunityId,
			contentType: 'application/json',
			async : true,
			dataType:'json',
			type: 'GET',
			success: function(res){
			$.unblockUI();
			console.log('successfully reopen the opportunity');
			$('#reopenopportunity').modal('hide');
			self.status=res.opportunityStatus;
		  
			self.fetchOpportunityData(self.opportunityId);
			self.renderHeader();
			self.getLpoaMasterData();
			 self.disableButtons();
			$(".modal-backdrop.fade.in").remove()
		},
		error: function(res){
			$.unblockUI();
			$('#reopenopportunity').modal('hide');
			console.log('Error occured while closing the opportunity');
			$(".modal-backdrop.fade.in").remove()
		}
		});
	},
	disableButtons: function(){
		var self=this;
		if(self.status && self.status=='Closed'){
			// $('.btn').attr('disabled','disabled');
			$('.btn').addClass("disable-field");
			$('.fa-wrench').addClass("disable-field");
			$('.fa-edit').addClass("disable-field");
			$('.fa-trash-o').addClass("disable-field");
			$('.fa-gear').addClass("disable-field");

			//custom class to add for disabling
			$('.disable-needed').addClass("disable-field");
			$('.disable-field-remove').removeClass('disable-field');
			//$(".lpoaCheckDiv").addClass("disable-field");
			//$(".lpoasavebtn").hide();
			$('a.disable-needed').prop("disabled","disabled");
			$(".lpoaCheckDiv").hide();
			//$('.lpoaCheckDiv').prop("disabled","disabled");
			//$('.lpoaCheckDiv input').prop("disabled","disabled");
			
			  
		}else{
			$(".disable-field").removeClass("disable-field");
			$(".lpoaCheckDiv").show();
			//$(".lpoaCheckDiv").removeClass("disable-field");
			
			//$('.lpoaCheckDiv').prop("disabled",false);
			//$('.lpoaCheckDiv input').prop("disabled",false);
			//$('a.disable-needed').prop("disabled",false);
			//$('.checker').removeClass("disabled");
			//$('.lpoaCheckDiv').removeClass("disabled");
			
		}

		/**
		 * Condition only for LPOA saved for the first time. 
		 * Not applicable if it is for signature.
		 * Not applicable for amendments also.
		 */
		if(self.lastLpoaStatus=='Draft'){
			$(".lpoaCheckDiv").hide();
		}

		if(self.lopaAmendment && !self.lpoaSigned){
			$(".lpoaCheckDiv").hide();
			//$(".lpoaCheckDiv").addClass("disable-field");
			//$('.lpoaCheckDiv input').prop("disabled","disabled");
		}

	},
	documentViewLoaded:function(evt){
		var self =this;
		self.disableButtons();
	},
	showHideInvestmentCriteria : function(evt){
		if($('#chevron').hasClass('fa-chevron-down')){
			$('#investmentCriteriaDiv').show();
			$('#chevron').removeClass('fa-chevron-down');
			$('#chevron').addClass('fa-chevron-up');
		}else{
			$('#investmentCriteriaDiv').hide();
			$('#chevron').removeClass('fa-chevron-up');
			$('#chevron').addClass('fa-chevron-down');
		}
	},
	ownershipTypeSuccessListener:function(){
		var self = this;
		var isChevronUp = false;
		if($(chevron).hasClass('fa-chevron-up')){
			isChevronUp = true;
		}

		this.fetchOpportunityData(this.opportunityId);

		this.headerTemplate = _.template( opportunityHeaderPage );
		var headerEl = this.$el.find('#opportunityHeader');
		headerEl.html("");
		headerEl.html(this.headerTemplate({navPermission:this.navPermission,opportunityData:this.model.attributes}));
		$('#showOpportunityDetails').show();
		$('#editOpportunityDetails').hide();
		$('#investmentCriteriaDiv').hide();

		ComponentsPickers.init();

		if(isChevronUp){
			$('#investmentCriteriaDiv').show();
			$('#chevron').removeClass('fa-chevron-down');
			$('#chevron').addClass('fa-chevron-up');
		}
		this.refreshContactsTab();
	},
	refreshContactsTab:function(){
		if(app.opportunityView.contactView){
			app.opportunityView.contactView.render();
		}
	},
	ownershipTypeFailureListener:function(){
		$('#ownershipTypeFormMsg > text').html('Error in updating ownership details.');
		$('#ownershipTypeFormMsg').show();
		$('#ownershipTypeFormMsg').delay(2000).fadeOut(2000); 
	},
	
	closingReasonTypesformValidation: function() {

		var form1 = $('.closingReasonTypesForm');

		form1.validate({
			errorElement: 'span', //default input error message container
			errorClass: 'help-block', // default input error message class
			focusInvalid: false, // do not focus the last invalid input
			ignore: "",
			rules: {
			closingReasonTypes: {
					required: true
				}
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
	loadInvestorDepositView: function(){
		var self=this;
		if(app.closingView && app.closingView.investorDepositView){
			app.closingView.investorDepositView.depositDataModel.clear();
			app.closingView.investorDepositView.close();
			app.closingView.investorDepositView.remove();
		}
		if(app.rehabDetailView && app.rehabDetailView.investorDepositView){
			app.rehabDetailView.investorDepositView.depositDataModel.clear();
			app.rehabDetailView.investorDepositView.close();
			app.rehabDetailView.investorDepositView.remove();
		}
		if(app.investorProfileView && app.investorProfileView.investorDepositView){
			app.investorProfileView.investorDepositView.depositDataModel.clear();
			app.investorProfileView.investorDepositView.close();
			app.investorProfileView.investorDepositView.remove();
		}
		
		if(!app.opportunityView.investorDepositView){
			app.opportunityView.investorDepositView = new investorDepositView({navPermission:this.navPermission});
		}
		app.opportunityView.investorDepositView.depositDataModel.investorId = self.investorId;
		app.opportunityView.investorDepositView.depositDataModel.parentObject = "Opportunity";
		app.opportunityView.investorDepositView.setElement(self.$el.find('#investorDepositDiv')).fetchInvestorDepositData();
	}
	
	});
	return OpportunityView;
});
