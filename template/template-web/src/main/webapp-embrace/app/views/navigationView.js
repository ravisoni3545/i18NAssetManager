define(["text!templates/navigation.html", "backbone","app", "SecurityUtil","views/homeView","views/searchView","views/investorSearchView","views/investorReportView",
        "views/closingDashboardView","views/insuranceVendorHomeView","collections/insuranceCollection","views/assetDashboardView"],
		function(navigationPage, Backbone, app, securityUtil, homeView,searchView,investorSearchView,investorReportView,
				closingDashboardView,insuranceVendorHomeView,insuranceCollection,assetDashboardView){
	
	var NavigationView = Backbone.View.extend( {
		 initialize: function(){
			//console.log(app.sessionModel.attributes.permissions);
			//console.log(securityUtil.isAuthorised("VendorManagement", app.sessionModel.attributes.permissions))
             var self = this;
			 var vendorManagement = ["VendorManagement"];
			 var vendorSearch = ["VendorSearch"];
			 var closingManagement=["ClosingManagement"];
			 var closingView=["ClosingView"];
			 var assetManagement=["AssetManagement"];
			 var assetView=["AssetView"];
			 var insuranceManagement=["InsuranceManagement"];
			 var investorView=["InvestorView"];
			 var investorManagement=["InvestorManagement"];
			 var propertyManagement=["PropertyManagement"];
			 var opportunityView=["OpportunityView"];
			 var opportunityManagement=["OpportunityManagement"];
			 var userManagement=["UserManagement"];
			 var envelopeStatus=["EnvelopeStatus"];
			 var documentTemplateStatus=["DocumentTemplateStatus"];
			 var retsListing=["RETSListing"];
			 var bpoRETS=["BPORETS"];
			 var exceptionList=["ExceptionList"];
			 var viewMetrics=["ViewMetrics"];
			 var updateFinancials=["UpdateFinancials"];
			 var viewApprovedProperties=["ViewApprovedProperties"];
			 var reportsView=["ReportsView"];
			 var rehabView=["RehabView"];
			 var rehabManagement=["RehabManagement"];
			 var reviewListRehab=["ReviewListRehab"];
			 var reviewListRent=["ReviewListRent"];
			 var viewMaps=["viewMaps"];
			 var investorDepositView=["InvestorDepositView"];
			 var investorDepositEdit=["InvestorDepositEdit"];
			 
			 this.navpermissions = {'vendorManagement':securityUtil.isAuthorised(vendorManagement, app.sessionModel.attributes.permissions),
			                        'vendorSearch':securityUtil.isAuthorised(vendorSearch, app.sessionModel.attributes.permissions),
			                        'closingManagement':securityUtil.isAuthorised(closingManagement, app.sessionModel.attributes.permissions),
			                        'closingView':securityUtil.isAuthorised(closingView, app.sessionModel.attributes.permissions),
			                        'assetManagement':securityUtil.isAuthorised(assetManagement, app.sessionModel.attributes.permissions),
			                        'assetView':securityUtil.isAuthorised(assetView, app.sessionModel.attributes.permissions),
			                        'insuranceManagement':securityUtil.isAuthorised(insuranceManagement, app.sessionModel.attributes.permissions),
			                        'investorView':securityUtil.isAuthorised(investorView, app.sessionModel.attributes.permissions),
			                        'investorManagement':securityUtil.isAuthorised(investorManagement, app.sessionModel.attributes.permissions),
			                        'propertyManagement':securityUtil.isAuthorised(propertyManagement, app.sessionModel.attributes.permissions),
			                        'opportunityView':securityUtil.isAuthorised(opportunityView, app.sessionModel.attributes.permissions),
			                        'opportunityManagement':securityUtil.isAuthorised(opportunityManagement, app.sessionModel.attributes.permissions),
			                        'userManagement':securityUtil.isAuthorised(userManagement, app.sessionModel.attributes.permissions),
			                        'envelopeStatus':securityUtil.isAuthorised(envelopeStatus, app.sessionModel.attributes.permissions),
			                        'documentTemplateStatus':securityUtil.isAuthorised(documentTemplateStatus, app.sessionModel.attributes.permissions),
			                        'retsListing':securityUtil.isAuthorised(retsListing, app.sessionModel.attributes.permissions),
			                        'bpoRETS':securityUtil.isAuthorised(bpoRETS, app.sessionModel.attributes.permissions),
			                        'exceptionList':securityUtil.isAuthorised(exceptionList, app.sessionModel.attributes.permissions),
			                        'viewMetrics':securityUtil.isAuthorised(viewMetrics, app.sessionModel.attributes.permissions),
			                        'updateFinancials':securityUtil.isAuthorised(updateFinancials, app.sessionModel.attributes.permissions),
			                        'viewApprovedProperties':securityUtil.isAuthorised(viewApprovedProperties, app.sessionModel.attributes.permissions),
			                        'reportsView':securityUtil.isAuthorised(reportsView, app.sessionModel.attributes.permissions),
			                        'rehabView':securityUtil.isAuthorised(rehabView, app.sessionModel.attributes.permissions),
			                        'rehabManagement':securityUtil.isAuthorised(rehabManagement, app.sessionModel.attributes.permissions),
			                        'reviewListRehab':securityUtil.isAuthorised(reviewListRehab, app.sessionModel.attributes.permissions),
			                        'reviewListRent':securityUtil.isAuthorised(reviewListRent, app.sessionModel.attributes.permissions),
			                        'viewMaps':securityUtil.isAuthorised(viewMaps, app.sessionModel.attributes.permissions),
			                        'investorDepositView':securityUtil.isAuthorised(investorDepositView, app.sessionModel.attributes.permissions),
			                        'investorDepositEdit':securityUtil.isAuthorised(investorDepositEdit, app.sessionModel.attributes.permissions)
			                        
			 };

			 
			 if(app.headerView){
                 this.listenTo(app.headerView, 'showHideSideBar', self.showHideSideBar);
             }
			},
			events          : {
		         "click a[href=#vendor]":"showCreateVendorPage",
		         "click a[href=#search]":"showSearchPage",
		         "click .sub-menu":"handleMenuSwitch",
		         "click a[href=#investorSearch]":"ShowInvestorSearchPage",
		         "click a[href=#closingDashboard]":"ShowClosingDashboardPage",
		         "click a[href=#insurance]":"showInsuranceVendorHomeView",
		         "click a[href=#assetDashboard]":"ShowAssetDashboardPage"
		    },
			el:"#sideNavigation",
			navpermissions:null,
			render : function(){
		 	 		this.template = _.template( navigationPage );
			     	this.$el.html("");
			     	console.log(this.navpermissions);
			     	this.fetchNavigationMenuUrls();
			     	this.$el.html(this.template({navpermission:this.navpermissions,urlMap:this.urlMap}));
			     	return this;
		    },
		    showCreateVendorPage : function(evt) {
		    	
		    	if(!app.homeView){
		    		 app.homeView=new vendorcompanyview();
				}
		    	app.homeView.setElement($('#maincontainer')).render();
		    	this.handleMenuSwitch(evt);
		    },
		    
		    showSearchPage : function(evt) {
		    	this.handleMenuSwitch(evt);
		    	this.clearOrganizationData();
		    	if(!app.searchView){
		    		 app.searchView=new searchView();
				}
		    	app.searchView.setElement($('#maincontainer')).render();
		    },
		    clearOrganizationData : function() {
		    	app.vendorCompanyModel = null;
		     	app.vendorId = null;
		    },
		    handleMenuSwitch:function(evt) {
		    	$('li .active').removeClass('active');
		    	$(evt.target).parent().parent().parent().parent().find('.active').removeClass('active');
		    	$(evt.target).parent().parent().parent().parent().find('.selected').remove();
		    	$(evt.target).parent().addClass('active');
		    	
		    	$(evt.target).parent().parent().parent().addClass('open').addClass('active');
		    	$(evt.target).parent().parent().css("display","block");
		    	$(evt.target).parent().parent().parent().find('.arrow').addClass('open');
		    	$(evt.target).parent().parent().parent().find('a').append('<span class="selected"></span>');
		    },
		    ShowInvestorSearchPage : function(evt) {
		    	
		    	if(!app.investorSearchView){
		    		 app.investorSearchView=new investorSearchView();
				}
		    	//app.investorSearchView.setElement($('#maincontainer')).render();
		    	this.handleMenuSwitch(evt);
		    },
		    ShowClosingDashboardPage : function(evt) {
		    	if(!app.closingDashboardView){
		    		 app.closingDashboardView=new closingDashboardView();
				}
		    	this.handleMenuSwitch(evt);
		    },
		    
		    showInsuranceVendorHomeView : function(evt){
		    	if(!app.insuranceVendorHomeView){
		    		 app.insuranceVendorHomeView=new insuranceVendorHomeView({collection:new insuranceCollection()});
//		    		 app.insuranceVendorHomeView.fetchInsuranceSearch();
				}
		    	this.handleMenuSwitch(evt);
		    },
		    
		    ShowAssetDashboardPage : function(evt) {
		    	if(!app.assetDashboardView){
		    		 app.assetDashboardView=new assetDashboardView();
				}
		    	this.handleMenuSwitch(evt);
		    },
		    
		    fetchNavigationMenuUrls : function(){
		    	var self=this;
		    	  $.ajax({
		                url: app.context()+'/menu/getUrls',
		                contentType: 'application/json',
		                dataType:'json',
		                async:false,
		                type: 'GET',
		                success: function(res){
		                	self.urlMap=res;
		                },
		                error: function(res){
		                	console.log("error");
		                }
		            });
		    },
        showHideSideBar : function(element){
            console.log("showHideSideBar2");
            if(element.data("show")){
                $('body > #main-wrapper').addClass("page-sidebar-closed");
                element.data("show",false);
            } else {
                $('body > #main-wrapper').removeClass("page-sidebar-closed");
                element.data("show",true);
            }
            _.defer(function() { $(window).trigger('resize'); });
            
        }
		    
	});
	return NavigationView;
});