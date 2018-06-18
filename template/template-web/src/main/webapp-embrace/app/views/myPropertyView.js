define( ["backbone","app","text!templates/properties_detail.html","text!templates/propertyDetailHeader.html",
	"views/financialView","views/leasesView","collections/leasesCollection","views/expensesView","views/AMAgreementsView","collections/expensesCollection",
     "collections/AMAgreementsCollection","views/messagesView","collections/messagesCollection","views/rehabRepairView","views/contactView","collections/contactCollection",
	 "views/documentView","collections/documentCollection","text!templates/usersDropdown.html","text!templates/vendorsDropdown.html",
	 "views/codesView","views/calendarView","views/propertyHoaModalView","views/propertyTaxModalView","views/addPropertyUnitView",
  	 "views/propertyInsuranceModalView","views/documentTooltipView","views/emailView","views/initiateMarketingView","text!templates/otherInvestmentsList.html",
  	 "models/closingModel","views/currentRemarksView","views/documentPreviewView","views/tagView", "SecurityUtil", 
  	 "views/homeWarrantyEditView","views/transactionMemberView"
         ],
         function(Backbone,app,propertyDetailPage,propertyDetailHeader,financialView,leasesView,leasesCollection,expensesView,AMAgreementsView,
         	expensesCollection,AMAgreementsCollection,messagesView,messagesCollection,rehabRepairView,contactView,contactCollection,documentView,
         	documentCollection,usersDropdown,vendorsDropdown,codesView,calendarView,propertyHoaModalView,propertyTaxModalView,
         	addPropertyUnitModalView,insuranceModalView,documentTooltipView,emailView,initiateMarketingModalView, otherInvestmentsListPage,
         	closingModel,currentRemarksView,documentPreviewView, tagView,securityUtil,homeWarrantyEditView,transactionMemberView){
	var MyPropertyView = Backbone.View.extend( {
		initialize: function(){
			/*this.propertyModel
			this.propertyModel=options.propertyModel;*/
			this.assetTypeView = new codesView({codeGroup:'ASSET_GROUP'});
			this.assetStatusView = new codesView({codeGroup:'ASSET_STATUS'});
			var assetView=["AssetView"];
			var assetManagement=["AssetManagement"];

			this.viewpermissions = {
				'assetView':securityUtil.isAuthorised(assetView,app.sessionModel.attributes.permissions),
				'assetManagement':securityUtil.isAuthorised(assetManagement,app.sessionModel.attributes.permissions)
			 };
		},
		propertyModel:{},
		events:{
			"click #financial":"showFinancialTab",
			"click #leases":"showLeasesTab",
			"click #expenses":"showExpensesTab",
			"click #documents":"showDocumentTab",
			"click #contact":"showContactsTab",
			"click #messages":"showMessagesTab",
			"click #rehabrepair":"showRehabRepairsTab",
			"click #AMAgreements":"showAMAgreements",
			"click a[href='editAssetHeader']":"showEditAssetHeaderModal",
			"click #editHomeWarranty":"showEditHomeWarranty",
			"click #updateAssetHeaderButton":"updateAssetHeaderInfo",
			"click #calendar":"showCalendarTab",
            "click a[href='assetspropertyInsurance']":"loadPropertyInsuranceModal",
			"click a[href='assetspropertyTax']":"loadPropertyTaxModal",
			"click a[href='assetspropertyHoa']":"loadPropertyHoaModal",
			"click a[href='assetsaddPropertyUnits']":"loadAddPropertyUnits",
			"click a[href='assetsInitiateMarketing']":"loadInitiateAssetMarketing",
			"click .investment-popover-asset":"fetchOtherInvestments",
			"click .popover-close" : "closePopover"


		},
		el:"#maincontainer",
		render : function () {
			if(!app.documentTooltipView){
				app.documentTooltipView=new documentTooltipView();
			}
			
			if(!app.documentPreview){
				app.documentPreview=new documentPreviewView();
			}
			
			this.template = _.template(propertyDetailPage);
			this.$el.html(" ");
			this.$el.html(this.template());
			
			
			var currentPropertyHeader=this.propertyModel.toJSON();
			
			this.renderHeader();

	    	this.checkIfAssetMarketed(currentPropertyHeader.isMarketed);
	    	//this.showFinancialTab();
	    	this.showAMAgreements();
	    	//-------------------------------
	    	 if(this.propertyModel.taskKey){
	    		    this.showCalendarTab();
	    		    $('[href=taskPopup]' + 'a[data-taskkey='+this.propertyModel.taskKey+']').click();
		     	 }
			//-------------------------------
			this.setCurrentRemarks();
			$('#collapseOne').on('shown.bs.collapse hidden.bs.collapse', function () {
	     	    $('#assetHeaderAccordion').find('.icon-toggle i').toggleClass('fa-chevron-up fa-chevron-down');
	     	});
			return this;

		},
		renderHeader: function(){
			var currentPropertyHeader=this.propertyModel.toJSON();
			var headerTemplate=_.template(propertyDetailHeader);
			var propertyStatus="";
			var rehabStatusLink="";
			var marketingStatusLink=[];
			
			if(currentPropertyHeader.repairId){
				rehabStatusLink="#rehab/" + currentPropertyHeader.repairId;
				//propertyStatus="Rehab Details";
			}
			
			if(currentPropertyHeader.marketingIds){
				for(var i=0; i<currentPropertyHeader.marketingIds.length; i++){
					marketingStatusLink.push("#marketing/" + currentPropertyHeader.marketingIds[i]);
				}
				//propertyStatus="Marketing Details";
			}
		
			$("#propertyDetailHeader").html(" ");
			$("#propertyDetailHeader").html(headerTemplate({singleData:currentPropertyHeader,rehabStatusLink:rehabStatusLink,marketingStatusLink:marketingStatusLink}));
			this.assetTypeView.render({el:$('#assetTypeDropdown'),codeParamName:"assetTypeId",addBlankFirstOption:true});
	    	this.assetStatusView.render({el:$('#assetStatusDropdown'),codeParamName:"statusId",addBlankFirstOption:true});
	    	
	    	/**
			 * Specific case for aligning document tooltip. "placement":"left" in Asset Header
			 */
			this.$el.find('.assetHeaderToolTip').popover({ 
				trigger: 'manual',
				'placement': 'left',
				hide: function() {
					$(this).animate({marginLeft: -10}, function() {
						$(this).css({marginLeft: ''});
					});
				},
				show: function () {
					$(this).fadeIn(200);
				}
			});
	    	
	    	$(".amount").formatCurrency();
			App.handleUniform();

			if(!this.tagView){
				this.tagView = new tagView();
			}
			this.tagView.object = 96;
			this.tagView.objectId = this.propertyModel.get("assetId");
			//everyone can view if they can access this page.
			this.tagView.canView = true;
			this.tagView.canEdit = this.viewpermissions.assetManagement;
			this.tagView.setElement($('#assetTagsDiv')).render({parentView:this});
			this.renderTransactionMembers();

		},
		
		checkIfAssetMarketed: function(isAssetMarketed) {
			if(isAssetMarketed == "Y")
				$("a[href='assetsInitiateMarketing']").addClass("disabled");
			else
				$("a[href='assetsInitiateMarketing']").removeClass("disabled");
		},
		
		showEditAssetHeaderModal : function() {
			app.currencyFormatter();
	    	 if(!this.assetManagerUsers){
	    		 this.fetchAssetManagerUsers();
			 }
	    	 if(!this.propertyManagers){
	    		 this.fetchPropertyManagers();
			 }
	    	 
	    	 var usersDropdownTemplate = _.template(usersDropdown);
	    	 $('#assetManagerDropdown').html('');
	    	 $('#assetManagerDropdown').html(usersDropdownTemplate({name:'assetManagerId',id:'assetManager',users:this.assetManagerUsers,addBlankFirstOption:true,investorName:null}));
	    	 
	    	 var vendorsDropdownTemplate = _.template(vendorsDropdown);
	    	 $('#propertyManagerDropdown').html('');
	    	 $('#propertyManagerDropdown').html(vendorsDropdownTemplate({name:'propertyManagerId',id:'propertyManager',vendors:this.propertyManagers,addBlankFirstOption:true}));
	    	 
	    	 var currentPropertyHeader=this.propertyModel.toJSON();
	    	 $('select[name=assetManagerId]').val(currentPropertyHeader.assetManagerId);
	    	 $('select[name=propertyManagerId]').val(currentPropertyHeader.propertyManagerId);
	    	 $('select[name=assetTypeId]').val(currentPropertyHeader.assetTypeId);
	    	 $('select[name=statusId]').val(currentPropertyHeader.propertyStatusId);
	    	 $('input[name=rehabCost]').val(currentPropertyHeader.rehabCost);
	    	 $('#rehabCost_currency').val(currentPropertyHeader.rehabCost);
	    	 
			 $(".currency").formatCurrency({symbol:""});
	    	 $('#editAssetHeaderModal').modal('show');
	    },
	    fetchAssetManagerUsers:function(){
	    	 var self = this;
			 $.ajax({
					url: app.context()+'/user/Asset Manager',
	                contentType: 'application/json',
	                async : false,
	                dataType:'json',
	                type: 'GET',
	                success: function(res){
	                	self.assetManagerUsers=res;
	                },
	                error: function(res){
	                	console.log('Error in fetching asset manager users');
	                }
					
				});
		},
		fetchPropertyManagers:function(){
	    	 var self = this;
			 $.ajax({
					url: app.context()+'/company/service/Property Management',
	                contentType: 'application/json',
	                async : false,
	                dataType:'json',
	                type: 'GET',
	                success: function(res){
	                	self.propertyManagers=res;
	                },
	                error: function(res){
	                	console.log('Error in fetching property managers');
	                }
					
				});
		},
	    updateAssetHeaderInfo : function() {
	    	 var updateRequestData = {};
	    	 updateRequestData.assetManagerId = $('select[name=assetManagerId]').val();
	    	 updateRequestData.propertyManagerId = $('select[name=propertyManagerId]').val();
	    	 updateRequestData.assetTypeId = $('select[name=assetTypeId]').val();
	    	 updateRequestData.statusId = $('select[name=statusId]').val();
	    	 //updateRequestData.rehabCost = $('input[name=rehabCost]').val();
	    	 updateRequestData.assetId = this.propertyModel.get("assetId");
	    	 updateRequestData.isHoa = $("#hoaDiv input[type='radio'][name='hoa']:checked").val();
	    	 updateRequestData.isInsurance = $("#insuranceDiv input[type='radio'][name='insurance']:checked").val();
	    	 updateRequestData.isPropTax = $("#propTaxDiv input[type='radio'][name='propTax']:checked").val();
	    	 
	    	 var self= this;
	    	 this.model.updateAssetInfo(updateRequestData,
				{	success : function ( model, res ) {
						$('#editAssetHeaderModal').modal('hide');
						$('#editAssetHeaderModal').on('hidden.bs.modal',function() {
							self.showPropertyDetail();
						});
                   },
                   error   : function ( model, res ) {
                	    console.log('error '+res);
                   		$('#editAssetHeaderModal').modal('hide');
						$('#editAssetHeaderModal').on('hidden.bs.modal',function() {
							self.showPropertyDetail();
						});
                   }
               });
	    },
		showFinancialTab: function(){
			var object="Asset";
			this.removeActiveTab();

			if(app.investorProfileView && app.investorProfileView.financialView){
				app.investorProfileView.financialView.close();
				app.investorProfileView.financialView.remove();
			}
			if(!app.mypropertyView.financialView){
				app.mypropertyView.financialView=new financialView({folderType:'FOLDER_TYPE'});
			}
			app.mypropertyView.financialView.reTriggerEvents();
			app.mypropertyView.financialView.propertyModel=this.propertyModel;
			app.mypropertyView.financialView.setElement($('#financialTab')).render();
			$("#financial").parent().addClass('active')
			$("#financialTab").addClass("active");	
		},
		removeActiveTab:function(){
			$("li[name=propertyNav].active").removeClass("active");
			$('div[name=infoTab].active').empty().removeClass("active");
		},
		showLeasesTab:function(evt){
			this.removeActiveTab();
			if(!app.mypropertyView.leasesView){
				app.mypropertyView.leasesView=new leasesView({collection:new leasesCollection()});
			}
			app.mypropertyView.leasesView.propertyModel=this.propertyModel;
			app.mypropertyView.leasesView.setElement($('#leasesTab')).fetchLeases();
			$("#leases").parent().addClass('active')
			$("#leasesTab").addClass("active");
			return this;
		},
		showExpensesTab:function(evt){
			this.removeActiveTab();
			if(!app.mypropertyView.expensesView){
				app.mypropertyView.expensesView=new expensesView({collection:new expensesCollection()});
			}
			console.log("Show Expenses Tab");
			app.mypropertyView.expensesView.propertyModel=this.propertyModel;
			app.mypropertyView.expensesView.setElement($('#expensesTab')).fetchExpenses();
			$("#expenses").parent().addClass('active')
			$("#expensesTab").addClass("active");
			return this;
		},
		showAMAgreements:function(evt){
			var self = this;
			this.removeActiveTab();
			if(!app.mypropertyView.AMAgreementsView){
				app.mypropertyView.AMAgreementsView=new AMAgreementsView({collection:new AMAgreementsCollection()});
				self.listenTo(self.AMAgreementsView, 'FeeChanged', self.reRenderHeader);
			}
			
			app.mypropertyView.AMAgreementsView.propertyModel=this.propertyModel;
			app.mypropertyView.AMAgreementsView.setElement($('#AMAgreementsTab')).fetchAMAgreements();
			$("#AMAgreements").parent().addClass('active')
			$("#AMAgreementsTab").addClass("active");
			return this;
		},
		reRenderHeader:function(){
			var thisPtr=this;
			thisPtr.fetchPropertyDetailData({
				success:function(){
					thisPtr.renderHeader();
				}
			});
		},
		showPropertyDetail:function(requestedAssetId){
			var thisPtr=this;
			/*thisPtr.model.fetch({
				success: function (res) {
					console.log(res);
					thisPtr.propertyModel=thisPtr.model;
					thisPtr.render();
				},
				error   : function () {
				}
			});*/
			thisPtr.fetchPropertyDetailData({
				success:function(){
					thisPtr.render();
				}
			});

		},
		fetchPropertyDetailData: function(callBack){
			var thisPtr=this;
			thisPtr.model.fetch({
				success: function (res) {
					console.log(res);
					thisPtr.propertyModel=thisPtr.model;
					callBack.success();
				},
				error   : function () {
				}
			});
		},
		showDocumentTab: function(){
			var thisPtr=this;
			var object="Asset";
			this.removeActiveTab();

			if(app.investorProfileView && app.investorProfileView.documentView){
				app.investorProfileView.documentView.close();
				app.investorProfileView.documentView.remove();
			}
			if(app.homeView && app.homeView.documentView){
				app.homeView.documentView.close();
				app.homeView.documentView.remove();
			}
			if(app.closingView && app.closingView.documentView){
				app.closingView.documentView.close();
				app.closingView.documentView.remove();
			}
			if(app.opportunityView && app.opportunityView.documentView){
				app.opportunityView.documentView.close();
				app.opportunityView.documentView.remove();
			}
			
			if(!app.mypropertyView.documentView){
				app.mypropertyView.documentView=new documentView({collection: new documentCollection()});
			}
			app.mypropertyView.documentView.object=object;
			app.mypropertyView.documentView.objectId=thisPtr.propertyModel.get("assetId");
			
			app.mypropertyView.documentView.setElement($('#documentsTab')).fetchDocument();
			$("#documents").parent().addClass('active')
			$("#documentsTab").addClass("active");	
		},
		showContactsTab: function(){
			var thisPtr=this;
			var object="Asset";
			this.removeActiveTab();
			if(app.closingView && app.closingView.contactView){
				app.closingView.contactView.close();
				app.closingView.contactView.remove();
			}
			if(!app.mypropertyView.contactView){
				app.mypropertyView.contactView=new contactView({collection:new contactCollection()});
			}
			app.mypropertyView.contactView.collection.objectId=thisPtr.propertyModel.get("assetId");
			app.mypropertyView.contactView.collection.object=object;
			app.mypropertyView.contactView.object=object;
			app.mypropertyView.contactView.objectId=thisPtr.propertyModel.get("assetId");
			
			app.mypropertyView.contactView.setElement($('#contactsTab')).render();
			$("#contact").parent().addClass('active');
			$("#contactsTab").addClass("active");	
			//app.mypropertyView.contactView.delegateEvents();
			return this;
			
		},
		showMessagesTab:function(evt){
			this.removeActiveTab();
			if(app.closingView && app.closingView.messageView){
				app.closingView.messagesView.propertyModel.clear();
				app.closingView.messageView.close();
				app.closingView.messageView.remove();
			}
			
			if(app.investorProfileView && app.investorProfileView.messageView){
				app.investorProfileView.messagesView.propertyModel.clear();
				app.investorProfileView.messageView.close();
				app.investorProfileView.messageView.remove();
			}
			
			if(app.opportunityView && app.opportunityView.messageView){
				app.opportunityView.messagesView.propertyModel.clear();
				app.opportunityView.messageView.close();
				app.opportunityView.messageView.remove();
			}
			
			if(!app.mypropertyView.messagesView){
				app.mypropertyView.messagesView=new messagesView({collection:new messagesCollection()});
			}
			app.mypropertyView.messagesView.propertyModel=this.propertyModel;
			app.mypropertyView.messagesView.propertyModel.propertyId = this.propertyModel.attributes.propertyInfo.propertyId;
			app.mypropertyView.messagesView.collection.object=this.propertyModel.object;
			app.mypropertyView.messagesView.collection.objectId=this.propertyModel.objectId;
			app.mypropertyView.messagesView.setElement($('#messagesTab')).fetchMessages();
			$("#messages").parent().addClass('active')
			$("#messagesTab").addClass("active");
			return this;
		},
		
		showRehabRepairsTab:function(evt){
			var self = this;
			this.removeActiveTab();
			
			if(!app.mypropertyView.rehabRepairView){
				app.mypropertyView.rehabRepairView = new rehabRepairView();
			}
			app.mypropertyView.rehabRepairView.investmentId = self.propertyModel.attributes.investmentID;
			app.mypropertyView.rehabRepairView.collection.objectId=this.propertyModel.objectId;
			app.mypropertyView.rehabRepairView.collection.object=this.propertyModel.object;
			app.mypropertyView.rehabRepairView.setElement($('#rehabrepairTab')).fetchRehabDatas();
			$("#rehabrepair").parent().addClass('active')
			$("#rehabrepairTab").addClass("active");
			return this;
		},
		
		showCalendarTab : function(){
			this.removeActiveTab();
			if(!app.mypropertyView.calendarView){
				app.mypropertyView.calendarView=new calendarView();
			}
			app.mypropertyView.calendarView.parentPage = "AssetDetails";
			app.mypropertyView.calendarView.setElement($('#calendarTab')).initialRender(this,this.propertyModel.object,this.propertyModel.objectId);
			$("#calendar").parent().addClass('active')
			$("#calendarTab").addClass("active");
			return this;
		},
                           
		loadPropertyHoaModal: function() {
			if(app.closingView && app.closingView.propertyHoaView){
				app.closingView.propertyHoaView.close();
				app.closingView.propertyHoaView.remove();
			}
			if(!app.mypropertyView.propertyHoaView){
				app.mypropertyView.propertyHoaView = new propertyHoaModalView();
			}
			app.mypropertyView.propertyHoaView.setElement($("#propertyHoaRenderDiv"));
			app.mypropertyView.propertyHoaView.propertyModel.objectId = this.propertyModel.attributes.investmentID;
			app.mypropertyView.propertyHoaView.propertyModel.object = "Investment";
			app.mypropertyView.propertyHoaView.propertyModel.objectCodeListId = "49";
			app.mypropertyView.propertyHoaView.render();
	     },
	    loadPropertyTaxModal: function() {
	    	if(app.closingView && app.closingView.propertyTaxView){
				app.closingView.propertyTaxView.close();
				app.closingView.propertyTaxView.remove();
			}
			if(!app.mypropertyView.propertyTaxView){
				app.mypropertyView.propertyTaxView = new propertyTaxModalView();
			}
			app.mypropertyView.propertyTaxView.setElement($("#propertyTaxRenderDiv"));
			
			app.mypropertyView.propertyTaxView.propertyModel.objectId =this.propertyModel.attributes.investmentID;
			app.mypropertyView.propertyTaxView.propertyModel.object = "Investment";
			app.mypropertyView.propertyTaxView.propertyModel.objectCodeListId = "49";
			app.mypropertyView.propertyTaxView.render();
	     },        
		 loadPropertyInsuranceModal: function() {
			 if(app.closingView && app.closingView.propertyInsuranceView){
					app.closingView.propertyInsuranceView.close();
					app.closingView.propertyInsuranceView.remove();
				}
			if(!app.mypropertyView.propertyInsuranceView){
				app.mypropertyView.propertyInsuranceView = new insuranceModalView();
			}
			app.mypropertyView.propertyInsuranceView.setElement($("#propertyInsuranceRenderDiv"));
			app.mypropertyView.propertyInsuranceView.propertyModel.objectId = this.propertyModel.attributes.investmentID;
			app.mypropertyView.propertyInsuranceView.propertyModel.object = "Investment";
			app.mypropertyView.propertyInsuranceView.propertyModel.objectCodeListId = "49";
			app.mypropertyView.propertyInsuranceView.render();
	     },
	     loadAddPropertyUnits: function() {
	     	var self = this;
    	 	if(app.closingView && app.closingView.addPropertyUnitView){
				app.closingView.addPropertyUnitView.close();
				app.closingView.addPropertyUnitView.remove();
			}
			if(!app.mypropertyView.addPropertyUnitView){
				app.mypropertyView.addPropertyUnitView = new addPropertyUnitModalView();
				self.listenTo(app.mypropertyView.addPropertyUnitView.propertyUnitCollection, 'CollectionChanged', self.setPropertyUnitsData);
			}
	    	
	    	app.mypropertyView.addPropertyUnitView.setElement(self.$el.find("#addUnitsRenderDiv"));
			app.mypropertyView.addPropertyUnitView.propertyUnitCollection.investmentId = this.propertyModel.attributes.investmentID;
			app.mypropertyView.addPropertyUnitView.propertyUnitCollection.assetId = this.propertyModel.get("assetId");;
			app.mypropertyView.addPropertyUnitView.fetchProperyUnits();
	     },
	     getPropertyUnitsData:function(){
	    	 var self = this;
	    	 if(!app.mypropertyView.addPropertyUnitView){
					app.mypropertyView.addPropertyUnitView = new addPropertyUnitModalView();
					self.listenTo(app.mypropertyView.addPropertyUnitView.propertyUnitCollection, 'CollectionChanged', self.setPropertyUnitsData);
			 }
	    	 app.mypropertyView.addPropertyUnitView.propertyUnitCollection.investmentId = this.propertyModel.attributes.investmentID;
			 app.mypropertyView.addPropertyUnitView.propertyUnitCollection.assetId = this.propertyModel.get("assetId");
//			 Do not call app.mypropertyView.addPropertyUnitView.fetchProperyUnits()
//			 as it will open popup to add/edit new property Unit
			 app.mypropertyView.addPropertyUnitView.propertyUnitCollection.fetch({
		    		success:function(data){
		    			self.propertyDetails = data.propertyDetails;
		    		},
		    		error:function(){
		    			console.log("fetch Error");
		    		}
		    });
	     },
	     setPropertyUnitsData:function(evt){
		     	var self = this;
		     	console.log("mypropertyView : setPropertyUnitsData");
		     	console.log(evt);
		     	self.model.attributes.propertyUnits = [];
		     	_.each(evt.models,function(model){
		     		self.model.attributes.propertyUnits.push(model.attributes);
		     	})
		     	console.log(self.model);
		 },
	     loadInitiateAssetMarketing: function() {
	    	if(app.rehabDetailView && app.rehabDetailView.initiateMarketingView){
	 			app.rehabDetailView.initiateMarketingView.close();
	 			app.rehabDetailView.initiateMarketingView.remove();
	 		}
	    	if(!app.mypropertyView.initiateMarketingView){
				app.mypropertyView.initiateMarketingView = new initiateMarketingModalView();
			}
			app.mypropertyView.initiateMarketingView.setElement($("#initiateMarketingDiv"));
			app.mypropertyView.initiateMarketingView.propertyModel.objectId = this.propertyModel.attributes.investmentID;
			app.mypropertyView.initiateMarketingView.propertyModel.object = "Investment";
			app.mypropertyView.initiateMarketingView.propertyModel.objectCodeListId = "49";
			app.mypropertyView.initiateMarketingView.propertyModel.assetId = this.propertyModel.get("assetId");
			app.mypropertyView.initiateMarketingView.render();
	     },

	     fetchOtherInvestments: function(evt){
					evt.preventDefault();
					evt.stopPropagation();
					
					var otherInvestments;
					var self=this;
					var investorId=$(evt.target).data('investorid');
					var investmentid=$(evt.target).data('investmentid');
					var isVisible=$(evt.target).data('show');
					
					if(isVisible == true){
						if(!app.closingModel)
						{
							app.closingModel = new closingModel();
						}
						app.closingModel.getOtherInvestments(investorId, investmentid, {
							success : function ( model, res ) {
								otherInvestments = res;
							},
							error: function (model,res){
								console.log("Fetching all other investments for asset failed");
							}
						});
						
						var msgContent =""; 
							
						msgContent=self.getInvestmentsHtml(otherInvestments);
						
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
							$(evt.currentTarget).attr("data-content","No Other Investment Found");
						}
						$(evt.currentTarget).popover("show");
					} else {
						$(evt.currentTarget).popover("hide");
						$(evt.currentTarget).data('show',true);
						$(evt.currentTarget).removeClass("tooTip-shown");
					}
					
//					if(visible==true){
//						$('.investment-popover-asset').attr("data-content",self.getInvestmentsHtml(otherInvestments));
//						$('.investment-popover-asset').popover("show");
//						$(evt.target).data('show',false);
//					}
//					else{
//						$('.investment-popover-asset').popover("hide");
//						$(evt.target).data('show',true);
//					}
				},

				getInvestmentsHtml: function(otherInvestments){
					
					if(otherInvestments && otherInvestments.length == 0){
						return "";
					} else {
						var popOverMsgTemplate = _.template( otherInvestmentsListPage )({otherInvestments:otherInvestments});
						return popOverMsgTemplate;
					}
					
//					var invHtml = "";
//			        if(otherInvestments){
//						invHtml = invHtml + '<table class="table table-striped table-bordered table-advance table-hover table-responsive"><thead><tr><th>Property Address</th><th>Status</th><th>Closing</th><th>Asset Servicing</th></thead>';
//				        invHtml = invHtml + '<tbody>';
//				        $.each( otherInvestments, function(index,value ) {
//				        	invHtml = invHtml + '<tr><td>'+value.propertyAddress+'</td><td>'+value.status+'</td><td><a href=#closing/'+value.investmentId+'>View</a></td><td>';
//				        	if(value.assetId!=null){
//				        		invHtml = invHtml +'<a href=#myProperties/'+value.assetId+'>View</a>'
//				        	}
//				        	invHtml = invHtml+'</td></tr>';
//				        });
//				        invHtml = invHtml + "</tbody></table>";
//			        }
//			        else{
//			        	invHtml="No other investment found for the investor";
//			        }
//			        return invHtml; 
				},
				closePopover:function(evt) {
					// if($(evt.currentTarget).data("item") === "msg") {
						$(evt.currentTarget).closest(".with-popover").find(".tooTip-shown").popover("hide");
						$(evt.currentTarget).closest(".with-popover").find(".tooTip-shown").data('show',true);
						$(evt.currentTarget).closest(".with-popover").find(".tooTip-shown").removeClass("tooTip-shown");
					// }
				},
				
				setCurrentRemarks : function(){
					 if(app.closingView && app.closingView.currentRemarksView){
							app.closingView.currentRemarksView.close();
							app.closingView.currentRemarksView.remove();
						}
		   	  	 if(!this.currentRemarksView){
		    	  		this.currentRemarksView=new currentRemarksView();
					 }
		   	  	 	app.mypropertyView.currentRemarksView.setElement($("#currentRemarks"));
					app.mypropertyView.currentRemarksView.propertyModel.objectId = this.propertyModel.get("assetId");;
					app.mypropertyView.currentRemarksView.propertyModel.object = "96";
					app.mypropertyView.currentRemarksView.propertyModel.messageType = "ASSETS_REMARKS";
					this.currentRemarksView.fetchRemarks();
				},
				showEditHomeWarranty: function(){
					var self = this;
					if(!self.homeWarrantyEditView){
						self.homeWarrantyEditView = new homeWarrantyEditView();
						self.listenTo(self.homeWarrantyEditView,"Home_Warranty_Edited",self.showPropertyDetail);
					}
					self.homeWarrantyEditView.homeWarrantyModel.investmentId = this.propertyModel.get("investmentID");
					self.homeWarrantyEditView.setElement($("#homeWarrantLoadDiv")).fetchWarrantyInformation();
				},
				renderTransactionMembers:function(){
					var object="Asset";
					var thisPtr=this;
					
					if(app.rehabDetailView && app.rehabDetailView.transactionMemberView){
						app.rehabDetailView.transactionMemberView.close();
						app.rehabDetailView.transactionMemberView.remove();
					}
					else if(app.assetMarketingDetailsView && app.assetMarketingDetailsView.transactionMemberView){
						app.assetMarketingDetailsView.transactionMemberView.close();
						app.assetMarketingDetailsView.transactionMemberView.remove();
					}
					else if(app.closingView && app.closingView.transactionMemberView){
						app.closingView.transactionMemberView.close();
						app.closingView.transactionMemberView.remove();
					}
					
					if(!app.mypropertyView.transactionMemberView){
						app.mypropertyView.transactionMemberView=new transactionMemberView({});
					}
					//app.closingView.transactionMemberView.collection.objectId=thisPtr.investmentId;
					//app.closingView.contactView.collection.object=object;
					app.mypropertyView.transactionMemberView.object=object;
					app.mypropertyView.transactionMemberView.objectId=thisPtr.propertyModel.get("assetId");
					app.mypropertyView.transactionMemberView.investmentId=thisPtr.propertyModel.attributes.investmentID;
					app.mypropertyView.transactionMemberView.setElement($('#transMemsDiv')).render();
				}
				
	     
	});
	return MyPropertyView;
});
