define([ "backbone", "app", "text!templates/investorProfile.html","views/investorDetailsView",
         "views/investorInvestmentTabView","views/wishlistView","collections/wishlistCollection","views/financialView",
         "views/documentView","collections/documentCollection","views/contactView","collections/contactCollection","views/messagesView","collections/messagesCollection",
         "views/investorOffersTabView","views/investorClosingsTabView","views/investorAssetsTabView","views/documentTooltipView","views/documentPreviewView",
         "views/investorDepositView","views/investorPreferencesView", "views/tagView",
         "components-dropdowns", "components-pickers" ], 
		function(Backbone, app, investorProfilePage,investorDetailsView,
				investorInvestmentDetailsView,wishlistView,wishlistCollection,financialView,documentView,documentCollection,
				contactView,contactCollection,messagesView,messagesCollection,investorOffersTabView,
				investorClosingsTabView,investorAssetsTabView,documentTooltipView,documentPreviewView,
				investorDepositView,investorPreferencesView,tagView) {

	var InvestorProfileView = Backbone.View.extend({
		initialize : function(options){
			this.navPermission = options.navPermission;
		},
		events : {
			"click #investorDetails":"showInvestorDetailsTab",
			"click #investorPreferences":"showinvestorPreferencesTab",
//			"click #investorContactDetails":"showContactDetailsTab",
			"click #offerDetails":"showOfferDetailsTab",
			"click #closingDetails":"showClosingDetailsTab",
			"click #assetDetails":"showAssetDetailsTab",
			"click #wishlistDetails":"showWishlistTab",
			"click #financialDetails":"showFinancialTab",
			"click #investorDocuments":"showDocumentTab",
			"click #investorContacts":"showContactsTab",
			"click #investorMessages":"showInvestorsMessagesTab",
			"click .ipperformancepage":"showipPerformancepage",
			"click .ipdocvaultpage":"showipDocVaultpage"
		},
		self : this,
		model:{},
		object:"Investor",
		investorId:{},
		el:"#maincontainer",
		render : function (options) {
			
			if(!app.documentTooltipView){
				app.documentTooltipView=new documentTooltipView();
			}
			
			if(!app.documentPreview){
				app.documentPreview=new documentPreviewView();
			}
			
			 $(".modal-backdrop.in").hide();
			 App.scrollTo(0);
	    	 this.investorId = options.investorId;
			 this.fetchinvestorProfileData(this.investorId);
	    	 
			 this.template = _.template( investorProfilePage );
	     	 this.$el.html("");
	     	 var imagelink=this.fetchInvestorImage();
	     	 this.$el.html(this.template({profileData:this.model,imglink:imagelink}));
	     	 this.showInvestorDetailsTab();
	     	 this.loadInvestorDepositView();
	     	 this.showOffersCount();
	     	 this.showClosingsCount();
	     	 this.showAssetsCount();

	     	 if(!this.tagView){
	    	 		this.tagView = new tagView();
	    	 		this.tagView.investorProfile = true;
	    	 	}
	    	 	this.tagView.object = 203;
	    	 	this.tagView.objectId = options.investorId;
	    	 	this.tagView.canEdit = this.navPermission.investorManagement;
	    	 	this.tagView.canView = this.navPermission.investorManagement === true? this.navPermission.investorManagement:this.navPermission.investorView;
	    	 	this.tagView.setElement($('#investorTagsDiv')).render({parentView:this});

	     	 return this;
	     },
		fetchinvestorProfileData : function(investorId) {
			var self=this;
			$.ajax({
                url: app.context()+'/investors/'+investorId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                	self.model =res;
                	if(app.sessionModel){
                		self.model.performanceView = ($.inArray("InvestorPerformanceView" , app.sessionModel.attributes.permissions) != -1 ? true : false);
                		self.model.docVaultView = ($.inArray("InvestorDocVaultView" , app.sessionModel.attributes.permissions) != -1 ? true : false);
                		}
                },
                error: function(res){
                	$('#investorProfileErrorMessage').html('Error in fetching Profile information');
                }
            });
	     },
	     showInvestorDetailsTab:function() {
	    	 this.removeActiveTab();
		  	 if(!this.investorDetailsView){
		  		this.investorDetailsView=new investorDetailsView();
			 }
			app.investorProfileView.investorDetailsView.propertyModel.investorId = this.investorId;
			
		  	 this.investorDetailsView.setElement($('#investorDetailsTab')).render({parentView:this});
			 $("#investorDetails").parent().addClass('active');
			 $("#investorDetailsTab").addClass("active");
	     },
	     showinvestorPreferencesTab:function() {
    	 	this.removeActiveTab();
	  	 	if(!this.investorPreferencesView){
	  			this.investorPreferencesView=new investorPreferencesView();
		 	}
			app.investorProfileView.investorPreferencesView.preferencesModel.investorId = this.investorId;
	  	 	this.investorPreferencesView.setElement($('#investorPreferencesTab')).fetchInvestorPreferences();
		 	$("#investorPreferences").parent().addClass('active');
		 	$("#investorPreferencesTab").addClass("active");
	     },
		removeActiveTab:function(){
			$("li[name=investorInfoNav].active").removeClass("active");
			$('div[name=investorInfoTab].active').empty().removeClass("active");
		},
		showInvestmentDetailsTab:function() {
	    	 console.log("Reached showInvestmentDetailsTab");
	    	 this.removeActiveTab();
		  	 if(!this.investorInvestmentDetailsView){
		  		this.investorInvestmentDetailsView=new investorInvestmentDetailsView();
			 }
			app.investorProfileView.investorInvestmentDetailsView.investorId = this.investorId;
			
		  	 this.investorInvestmentDetailsView.setElement($('#investorInvestmentDetailsTab')).render();
			 $("#investorInvestmentDetails").parent().addClass('active');
			 $("#investorInvestmentDetailsTab").addClass("active");
	     },
		showWishlistTab: function(){
			var thisPtr=this;
			this.removeActiveTab();
			
			if(app.opportunityView && app.opportunityView.wishlistView){
				app.opportunityView.wishlistView.close();
				app.opportunityView.wishlistView.remove();
			}
			
			if(!app.investorProfileView.wishlistView){
				app.investorProfileView.wishlistView=new wishlistView({collection:new wishlistCollection()});
			}
			app.investorProfileView.wishlistView.collection.investorId=this.investorId;
			app.investorProfileView.wishlistView.setElement($('#investorWishlistDetailsTab')).render();
			$("#wishlistDetails").parent().addClass('active');
			$("#investorWishlistDetailsTab").addClass("active");	
			return this; 
		},
		showContactsTab: function(){
			var thisPtr=this;
			this.removeActiveTab();
			
			if(!app.investorProfileView.contactView){
				app.investorProfileView.contactView=new contactView({collection:new contactCollection()});
			}
			app.investorProfileView.contactView.collection.objectId=thisPtr.investorId;
			app.investorProfileView.contactView.collection.object=thisPtr.object;
			app.investorProfileView.contactView.object=thisPtr.object;
			app.investorProfileView.contactView.objectId=thisPtr.investorId;

			app.investorProfileView.contactView.setElement($('#contactsTab')).render();
			$("#investorContacts").parent().addClass('active');
			$("#contactsTab").addClass("active");	
			return this; 
		},
		showFinancialTab:function() {
			this.removeActiveTab();
			
			if(app.mypropertyView && app.mypropertyView.financialView){
				app.mypropertyView.financialView.close();
				app.mypropertyView.financialView.remove();
			}
			if(!app.investorProfileView.financialView){
				app.investorProfileView.financialView=new financialView({folderType:'FOLD_TYP_INV'});
			}
			app.investorProfileView.financialView.reTriggerEvents();
			app.investorProfileView.financialView.propertyModel.object = this.object;
			app.investorProfileView.financialView.propertyModel.objectId = this.investorId;
			app.investorProfileView.financialView.setElement($('#investorFinancialTab')).render();
			$("#financialDetails").parent().addClass('active');
			$("#investorFinancialTab").addClass("active");	
		},
		showDocumentTab:function() {
			this.removeActiveTab();
			
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
			if(app.opportunityView && app.opportunityView.documentView){
				app.opportunityView.documentView.close();
				app.opportunityView.documentView.remove();
			}
			
			
			if(!app.investorProfileView.documentView){
				app.investorProfileView.documentView=new documentView({collection: new documentCollection(),folderType:'FOLD_TYP_INV'});
			}

			app.investorProfileView.documentView.object=this.object;
			app.investorProfileView.documentView.objectId=this.investorId;
			app.investorProfileView.documentView.setElement($('#investorDocumentTab')).fetchDocument();
			$("#investorDocuments").parent().addClass('active')
			$("#investorDocumentTab").addClass("active");
		},
		fetchInvestorImage: function() {
			var object="Investor";
			var response = $.ajax({
				type : "GET",
				url : app.context()+ "/image/link/"+object+"/"+this.investorId,
				async : false
			});
			
			var imglink=response.responseText
			return imglink;
		},
		showInvestorsMessagesTab: function(){
			var thisPtr=this;
	       	var object="Investor";
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
			
			if(app.opportunityView && app.opportunityView.messagesView){
				app.opportunityView.messagesView.propertyModel = {};
				app.opportunityView.messagesView.close();
				app.opportunityView.messagesView.remove();
			}
			
			if(!app.investorProfileView.messagesView){
				app.investorProfileView.messagesView=new messagesView({collection:new messagesCollection()});
			}
			app.investorProfileView.messagesView.propertyModel.objectId =this.investorId;
			app.investorProfileView.messagesView.propertyModel.object = object;
			app.investorProfileView.messagesView.collection.objectId=this.investorId;
			app.investorProfileView.messagesView.collection.object=object;
	
			app.investorProfileView.messagesView.setElement($('#investorMessagesTab')).fetchMessages();
			 
			$("#investorMessages").parent().addClass('active');
			$("#investorMessagesTab").addClass("active");
			return this;
		},
		showipPerformancepage: function(evt){
			var investorId = this.investorId;
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			var invperformancePagePopup = window.open("","_blank");
			$.ajax({
				url: app.context()+'/investors/getipperformance/'+investorId,
				type: 'GET',
				success: function(res){
					$.unblockUI();
					invperformancePagePopup.location = res;
				},
				error: function(res){
					$.unblockUI();
					console.log('failed to get Investor Portal Performance Link:'+res);
				}
			});
		},
		showipDocVaultpage: function(evt){
			var investorId = this.investorId;
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			var invperformancePagePopup = window.open("","_blank");
			$.ajax({
				url: app.context()+'/investors/getipdocvault/'+investorId,
				type: 'GET',
				success: function(res){
					$.unblockUI();
					invperformancePagePopup.location = res;
				},
				error: function(res){
					$.unblockUI();
					console.log('failed to get Investor Portal Doc-Vault Link:'+res);
				}
			});
		},
		showOfferDetailsTab:function() {
	    	this.removeActiveTab();
		  	if(!this.investorOffersTabView){
		  		this.investorOffersTabView=new investorOffersTabView();
			}
		  	console.log("1:"+this.investorId);
			app.investorProfileView.investorOffersTabView.investorId = this.investorId;
			
		  	this.investorOffersTabView.setElement($('#investorOfferDetailsTab')).render();
			$("#offerDetails").parent().addClass('active');
			$("#investorOfferDetailsTab").addClass("active");
	    },
		showOffersCount:function(){
			var self=this;
			$.ajax({
                url: app.context()+'/investorProfile/getOffersCount/'+this.investorId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                	$('#investorOffersCount').html(res);
                },
                error: function(res){
                	$('#investorProfileErrorMessage').html('Error fetching investor offers count');
                }
            });
		},
		showClosingDetailsTab:function() {
	    	this.removeActiveTab();
		  	if(!this.investorClosingsTabView){
		  		this.investorClosingsTabView=new investorClosingsTabView();
			}
		  	console.log("1:"+this.investorId);
			app.investorProfileView.investorClosingsTabView.investorId = this.investorId;
			
		  	this.investorClosingsTabView.setElement($('#investorClosingDetailsTab')).render();
			$("#closingDetails").parent().addClass('active');
			$("#investorClosingDetailsTab").addClass("active");
	    },
		showClosingsCount:function(){
			var self=this;
			$.ajax({
                url: app.context()+'/investorProfile/getCurrentClosingsCount/'+this.investorId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                	$('#investorClosingsCount').html(res);
                },
                error: function(res){
                	$('#investorProfileErrorMessage').html('Error fetching investor closings count');
                }
            });
		},
		showAssetDetailsTab:function() {
	    	this.removeActiveTab();
		  	if(!this.investorAssetsTabView){
		  		this.investorAssetsTabView=new investorAssetsTabView();
			}
		  	console.log("1:"+this.investorId);
			app.investorProfileView.investorAssetsTabView.investorId = this.investorId;
			
		  	this.investorAssetsTabView.setElement($('#investorAssetDetailsTab')).render();
			$("#assetDetails").parent().addClass('active');
			$("#investorAssetDetailsTab").addClass("active");
	    },
		showAssetsCount:function(){
			var self=this;
			$.ajax({
                url: app.context()+'/investorProfile/getAssetsCount/'+this.investorId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                	$('#investorAssetsCount').html(res);
                },
                error: function(res){
                	$('#investorProfileErrorMessage').html('Error fetching investor assets count');
                }
            });
		},
		loadInvestorDepositView: function(){
			var self=this;
			if(app.opportunityView && app.opportunityView.investorDepositView){
				app.opportunityView.investorDepositView.depositDataModel.clear();
				app.opportunityView.investorDepositView.close();
				app.opportunityView.investorDepositView.remove();
			}
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
			
			if(!app.investorProfileView.investorDepositView){
				app.investorProfileView.investorDepositView = new investorDepositView({navPermission:this.navPermission});
			}
			app.investorProfileView.investorDepositView.depositDataModel.investorId = self.investorId;
			app.investorProfileView.investorDepositView.depositDataModel.parentObject = "Investor";
			app.investorProfileView.investorDepositView.setElement(self.$el.find('#investorDepositDiv')).fetchInvestorDepositData();
		}
	});
	return InvestorProfileView;
});
