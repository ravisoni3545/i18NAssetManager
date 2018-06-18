define([ "app", "views/loginView", "views/homeView", "views/headerView", "views/navigationView",
         "models/SessionModel","views/searchView","views/myInvestorView", "views/closingView",
         "collections/myAssetsCollection","views/myAssetsView","models/myAssetsModel","views/myPropertyView",
         "views/myClosingView","collections/myClosingCollection","views/investorSearchView","views/investorProfileView",
         "views/changePasswordView","models/userModel","views/myTasksView","views/investorReportView",
         "views/migrationView","views/closingDashboardView","views/insuranceVendorHomeView","collections/insuranceCollection",
		 "views/propertySearchView","collections/propertySearchCollection",
         "views/propertyDetailView","views/financialReturnsCalculatorView",
		 "views/opportunitySearchView","views/opportunityView","views/essentialView","views/assetDashboardView","views/propertyPreselectView",
		 "views/userAccountsView", "views/messageTemplatesView","views/envelopeStatusView","views/assetMarketingView", 
		 "views/assetMarketingDetailsView","views/documentTemplateStatusView","views/endPointsTriggerView",
		 "views/rehabSearchView","collections/rehabCollection","views/rehabDetailView","views/notificationMessageDetailsView",
		 "views/investorReportSearchView","views/rolePermissionAdminView"],

		function(app, loginview, homeview, headerview, navigationview,
				sessionmodel,searchView,myInvestorView, closingView,myAssetsCollection,myAssetsView,myAssetsModel,myPropertyView,
				myClosingView,myClosingCollection,investorSearchView,investorProfileView,changepasswordView,userModel,myTasksView,investorReportView,
				migrationView,closingDashboardView,insuranceVendorHomeView,insuranceCollection,
				propertySearchView,propertySearchCollection,propertyDetailView,financialReturnsCalculatorView,
				opportunitySearchView,opportunityView,essentialView,assetDashboardView, propertyPreselectView, 
				userAccountsView, messageTemplatesView, envelopeStatusView, assetMarketingView, 
				assetMarketingDetailsView, documentTemplateStatusView,endPointsTriggerView,
				rehabSearchView,rehabCollection,rehabDetailView,notificationMessageDetailsView,
				investorReportSearchView,rolePermissionAdminView) {

				
			Backbone.View.prototype.close = function(){
			    //  this.remove();
				  this.unbind();
				  if (this.onClose){
					  this.onClose();
				  }
			};
			
			var AppRouter = Backbone.Router.extend({
				initialize : function() {
					if(!app.essentialView){
						app.essentialView = new essentialView();
					}
				},
				
				
				
				routes : {
					//"vendor/(:vendorId)" : "vendorUpdate",
					"vendor(/)(:vendorId)" : "vendor",
					"logout":"logout",
					"search":"vendorSearch",
					"properties":"myProperties",
					"investors":"myInvestors",
					"myclosings(/)(:filter)":"myClosings",
					"closing/:investmentId(/)(:taskKey)":"closing",
					"myAssets":"myAssets",
					"myProperties/:assetId(/)(:taskKey)":"myProperties",

					"investorSearch":"investorSearch",
					"investorProfile/:investorId":"investorProfile",

					"changePassword": "changePassword",
					"mytasks":"myTasks",
					"investorReport":"showInvestorReportPage",
					"migrate/closings(/)(:taskKey)":"migrateClosings",
					"closingDashboard" : "showclosingDashboardPage",
					"insurance":"showInsuranceVendorHomeView",
					"propertySearch" : "propertySearch",
					"property/:propertyId" : "property",
					"finance-calculator(/:propertyId)" : "calculator",
					"opportunitySearch":"opportunitySearch",
					"opportunity/:opportunityId":"opportunity",
					"mynotifications":"myNotifications",
					"assetDashboard":"showAssetDashboardPage",
					"assetMarketing":"showAssetMarketingPage",
					"marketing/:marketingId(/)(:taskKey)":"showAssetMarketingDetails",
                    "propertyPreselect/:propertyId":"showPropertyPreselectPage",
                    "otherReports":"showOtherReportsPage",
                    "userAccounts":"userAccounts",
                    "messageTemplates": "showMessageTemplatesPage",
                    "envelopeStatus":"envelopeStatus",
                    "documentTemplateStatus" : "documentTemplateStatus",
                    "endPoints" : "endPointsPage",
                    "rolePermissions":"showRolePermissionsPage",
                    "rehabSearch":"rehabSearch",
                    "rehab/:rehabId(/)(:taskKey)":"rehabDetail",
                    "investorReportSearch":"showInvestorReportSearchPage"
				},
				roleToLandingPageMap : {
											'Read Only':'search',
											'ILM':'mytasks',
											'Administrator':'closingDashboard',
											'Solution Specialist':'opportunitySearch',
											'Closer':'myclosings',
											'Asset Manager':'myAssets',
											'Property Manager':'properties',
											'NPI':'investors',
											'Insurance Vendor':'insurance',
											'LPOA Signer':'opportunitySearch',
											'Inventory Assistant':'mytasks',
											'Inventory Admin':'mytasks',
											'Inventory User':'mytasks',
											'Rehab Coordinator':'rehabSearch'
											
											
										},
				vendor : function(vendorId) {
					if($.inArray('VendorManagement', app.sessionModel.attributes.permissions)==-1 && !vendorId) {
						return false;
					} 
					if(!app.homeView){
						app.homeView=new homeview();
					}
					if(vendorId) {
						app.homeView.render(vendorId);
						App.scrollTo($('#mainContainer'), -200);
					} else {
						app.homeView.render();
					}
					if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
					
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
					
				},
				vendorSearch : function(){
					this.clearOrganizationData();
			    	if(!app.searchView){
			    		 app.searchView=new searchView();
					}
			    	app.searchView.setElement($('#maincontainer')).render();
			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
				},
				logout:function(){
					var resp=app.sessionModel.logout();
					app.sessionModel.clear()
					window.location.assign("login");
				},
				clearOrganizationData : function() {
			    	app.vendorCompanyModel = null;
			     	app.vendorId = null;
			    },
			    myInvestors:function(){
			    	if(!app.myInvestorView){
			    		 app.myInvestorView=new myInvestorView();
			    		 
					}
		    		app.myInvestorView.setElement($('#maincontainer')).render();
		    		if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
					
			    },
			    myNotifications:function(){
			    	 if(!app.notificationMessageDetailsView){
			    		 app.notificationMessageDetailsView=new notificationMessageDetailsView();
			    	 }
			    	 app.notificationMessageDetailsView.render();
			    	 if(!app.headerView){
			    		 app.headerView=new headerview();
			    		 app.headerView.render(app.sessionModel.get("userName"));
			    	 }
			    	 
			    	 if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
				    	App.init();
			    	 }
			    },
			    closings:function(){
			    	console.log('closings page');
			    },
			    closing:function(investmentId,taskKey){
		    		if(!app.headerView){
						app.headerView=new headerview();
				    	app.headerView.render(app.sessionModel.get("userName"));
					}
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}

			    	if(!app.closingView){
			    		 app.closingView=new closingView({navPermission:app.navigationView.navpermissions});
					}
		    		app.closingView.setElement($('#maincontainer')).render({investmentId:investmentId,taskKey:taskKey});

					/**
					 * 
					 */
					if (('localStorage' in window) && window['localStorage'] !== null) {
    			        localStorage.setItem('previousUrl', Backbone.history.fragment);
    			    }
					//-----------
			    },
			    myClosings:function(filter){
			    	if(!app.headerView){
						app.headerView=new headerview();
				    	app.headerView.render(app.sessionModel.get("userName"));
					}
			    	if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
			    	if(!app.myClosingView){
			    		 app.myClosingView=new myClosingView({navPermission:app.navigationView.navpermissions,collection:new myClosingCollection()});
					}
			    	app.myClosingView.render();
			    	if(filter) {
			    		app.myClosingView.fetchMyClosing(filter);
			    	} else {
			    		app.myClosingView.userFilter = false;
//			    		$("#currentClosings").prop("checked",false);

			    	}
			    },
			    myAssets:function(){
			    	if(!app.headerView){
						app.headerView=new headerview();
				    	app.headerView.render(app.sessionModel.get("userName"));
					}
			    	if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
			    	 if(!app.myAssetsView){
			    		 app.myAssetsView=new myAssetsView({collection:new myAssetsCollection()});
						}
			    	 //console.log(app.myAssetsView);
			    	 //app.myAssetsView.fetchMyAssets();
			    	 app.myAssetsView.render();
			    },
			    navigateToLandingPage:function() {
			    	$('#loadingMessage').html("&nbsp;");
			    	if(Backbone.history.fragment=='') {
//		    			this.navigate(this.roleToLandingPageMap[app.sessionModel.attributes.roles[0]],{ trigger:true, replace: true });
		    			this.navigate(app.sessionModel.attributes.landingPage,{ trigger:true, replace: true });
			    	} else {
		    			this.navigate(Backbone.history.fragment,{ trigger:true, replace: true });
		    		}
			    },
			    myProperties:function(assetId,taskKey){
			    	if(assetId){
			    		 if(!app.mypropertyView){
				    		 app.mypropertyView=new myPropertyView({model:new myAssetsModel()});
							}
			    		 app.mypropertyView.model.assetId=assetId;
			    		 app.mypropertyView.model.taskKey=taskKey;
			    		 app.mypropertyView.model.objectId=assetId;
			    		 app.mypropertyView.model.object="Asset";
			    		 app.mypropertyView.showPropertyDetail();
		    		 	 if(!app.headerView){
							app.headerView=new headerview();
							app.headerView.render(app.sessionModel.get("userName"));
						 }
					    	
						if(!app.navigationView){
							app.navigationView=new navigationview();
							app.navigationView.render();
							App.init();
						}
						
			    	}
			    	if (('localStorage' in window) && window['localStorage'] !== null) {
    			        localStorage.setItem('previousUrl', Backbone.history.fragment);
    			    }
			    },

			    investorSearch:function(){
			    	
			    	if(!app.investorSearchView){
			    		 app.investorSearchView=new investorSearchView();
					}
		    		app.investorSearchView.setElement($('#maincontainer')).render();
		    		if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
					
			    },
			    investorProfile:function(investorId){
		    		if(!app.headerView){
						app.headerView=new headerview();
				    	app.headerView.render(app.sessionModel.get("userName"));
					}
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}

					if(!app.investorProfileView){
			    		 app.investorProfileView=new investorProfileView({navPermission:app.navigationView.navpermissions});
					}
		    		app.investorProfileView.setElement($('#maincontainer')).render({investorId:investorId});

					if (('localStorage' in window) && window['localStorage'] !== null) {
				        localStorage.setItem('previousUrl', Backbone.history.fragment);
				    }
			    },
			    changePassword:function(){

			    	if(!app.changePasswordView){
			    		app.userModel = new userModel();
						app.changePasswordView= new changepasswordView();
					}
			    	app.changePasswordView.render(app.sessionModel.get("userId"));
					if(!app.headerView){
						app.headerView= new headerview();
				    	app.headerView.render(app.sessionModel.get("userName"));
					}
					if(!app.navigationView){
						app.navigationView= new navigationview();
						app.navigationView.render();
						App.init();
					}
					
					app.changePasswordView.initialFields();


			    },
			    
			    myTasks :function(){
			    	if(!app.myTasksView){
			    		 app.myTasksView=new myTasksView();
			    		 
					}
		    		app.myTasksView.setElement($('#maincontainer')).render();
		    		if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
					
			    },
			    
			    showInvestorReportPage : function() {
			    	
			    	if(!app.investorReportView){
			    		 app.investorReportView=new investorReportView();
					}
			    	app.investorReportView.setElement($('#maincontainer')).render();
			    	
			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
					
			    	
			    },
			    
			    migrateClosings : function(taskKey) {
			    	if(!app.migrationView){
			    		 app.migrationView=new migrationView();
					}
			    	if(taskKey) {
			    		app.migrationView.setElement($('#maincontainer')).render({'taskKey':taskKey});
			    	} else {
			    		app.migrationView.setElement($('#maincontainer')).render();
			    	}
			    	
			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
					
			    },
			    
			    showclosingDashboardPage : function() {
			    	if(!app.closingDashboardView){
			    		 app.closingDashboardView=new closingDashboardView();
					}
			    	app.closingDashboardView.setElement($('#maincontainer')).render();
			    	
			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
					
			    },
			    
			    showInsuranceVendorHomeView : function(){
			    	if(!app.headerView){
						app.headerView=new headerview();
				    	app.headerView.render(app.sessionModel.get("userName"));
					}
			    	if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
			    	
			    	if(!app.insuranceVendorHomeView){
			    		 app.insuranceVendorHomeView=new insuranceVendorHomeView({collection:new insuranceCollection()});
			    		 
					}
		    		app.insuranceVendorHomeView.setElement($('#maincontainer')).render();
		    		
		    		app.insuranceVendorHomeView.fetchInsuranceSearch();
		    							
			    },
				propertySearch:function(){
			    	if(!app.headerView){
						app.headerView=new headerview();
				    	app.headerView.render(app.sessionModel.get("userName"));
					}
			    	if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
			    	if(!app.propertySearchView){
			    		 app.propertySearchView=new propertySearchView({collection:new propertySearchCollection()});
					}	
			    	app.propertySearchView.render();
			    	app.propertySearchView.postProcess();

			    },
			    property:function(propertyId){
			    	if(!app.headerView){
						app.headerView=new headerview();
				    	app.headerView.render(app.sessionModel.get("userName"));
					}
			    	if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}	
					if(!app.propertyDetailView){
			    		 app.propertyDetailView=new propertyDetailView();
					}	
			    	app.propertyDetailView.render({propertyId:propertyId});

			    	if (('localStorage' in window) && window['localStorage'] !== null) {
    			        localStorage.setItem('previousUrl', Backbone.history.fragment);
    			    }
			    },
			    calculator: function(propertyId) {
		        	//alert("calculator IN Calculator"+property_id);
		        	if(!app.headerView){
						app.headerView=new headerview();
				    	app.headerView.render(app.sessionModel.get("userName"));
					}
			    	if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}	
		        	if (!app.financialReturnsCalculatorView) {
		                 app.financialReturnsCalculatorView = new financialReturnsCalculatorView();
		            }
		            app.financialReturnsCalculatorView.render({propertyId:propertyId});
		            //FinancialReturnsCalculatorView(), {requiresAuth: true, curr_page: app.session.get('curr_page')});
		        },
		        
		        opportunitySearch: function(){
		        	if(!app.headerView){
						app.headerView=new headerview();
				    	app.headerView.render(app.sessionModel.get("userName"));
					}
			    	if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}	
		        	if(!app.opportunitySearchView){
		        		app.opportunitySearchView=new opportunitySearchView();
		        	}
		        	app.opportunitySearchView.filterResultByUser=true;
		        	app.opportunitySearchView.render();
		        },
		        
		        opportunity:function(opportunityId){
		        	if(!app.headerView){
						app.headerView=new headerview();
				    	app.headerView.render(app.sessionModel.get("userName"));
					}
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
					
			    	if(!app.opportunityView){
			    		 app.opportunityView=new opportunityView();
					}
		    		app.opportunityView.setElement($('#maincontainer')).render({navPermission:app.navigationView.navpermissions,opportunityId:opportunityId});
		    		
		    		if (('localStorage' in window) && window['localStorage'] !== null) {
    			        localStorage.setItem('previousUrl', Backbone.history.fragment);
    			    }
			    },
			    
			    showAssetDashboardPage  : function() {
			    	if(!app.assetDashboardView){
			    		 app.assetDashboardView=new assetDashboardView();
					}
			    	app.assetDashboardView.setElement($('#maincontainer')).render();
			    	
			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
			    },
			    
			    showAssetMarketingPage  : function() {
			    	if(!app.assetMarketingView){
			    		 app.assetMarketingView=new assetMarketingView();
					}
			    	app.assetMarketingView.setElement($('#maincontainer')).render();
			    	
			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
			    },
                
                showAssetMarketingDetails:function(marketingId,taskKey){
			    	if(!app.assetMarketingDetailsView){
			    		 app.assetMarketingDetailsView=new assetMarketingDetailsView();
					}
		    		app.assetMarketingDetailsView.setElement($('#maincontainer')).render({marketingId:marketingId,taskKey:taskKey});
		    		if(!app.headerView){
						app.headerView=new headerview();
				    	app.headerView.render(app.sessionModel.get("userName"));
					}
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
					/**
					 * 
					 */
					if (('localStorage' in window) && window['localStorage'] !== null) {
    			        localStorage.setItem('previousUrl', Backbone.history.fragment);
    			    }
					//-----------
			    },
			    
                showPropertyPreselectPage : function(propertyId) {
                    console.log("dev: property preselect page" );
                    if(!app.propertyPreselectView){
			    		 app.propertyPreselectView = new propertyPreselectView();
					}
			    	app.propertyPreselectView.setElement($('#maincontainer')).render({propertyId:propertyId});
			    	
			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
                },
                
                showOtherReportsPage : function() {
			    	
			    	if(!app.investorReportView){
			    		 app.investorReportView=new investorReportView();
					}
			    	app.investorReportView.setElement($('#maincontainer')).renderOtherReports();
			    	
			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
			    },
			    checkPropImage: function() {
		            $('img.propImage').each(function() {
		                var currImg = $(this);
		                var src = currImg.data('src');
		                var size = currImg.data('size');
		                src=src.replace("/thumbnail/", "/"+size+"/");
		                src=src.replace("/medium/", "/"+size+"/");
		                src=src.replace("/large/", "/"+size+"/");
//		                if (src !== "assets/img/no-image.jpg") {
		                    var img = new Image();
		                    img.onload = function() {
		                        // code to set the src on success
		                        // console.log('image loaded');
		                       
		                    };
		                    img.onerror = function() {
		                        // doesn't exist or error loading
		                        //console.log('no image');
		                        src = "assets/img/not-found.jpg";
		                        currImg.attr('src', src);
		                    };
		                    setTimeout(function(){
		                        img.src = src; // fires off loading of image
		                        currImg.attr('src', src);
		                    },0);

//		                }
		            });
		        },

			    userAccounts : function() {

			    	if(!app.userAccountsView){
			    		app.userAccountsView=new userAccountsView();
			    	}
			    	app.userAccountsView.setElement($('#maincontainer')).render();

			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
			    },

			    showMessageTemplatesPage : function()
			    {
	
			    	if(!app.messageTemplatesView){
			    		app.messageTemplatesView=new messageTemplatesView();
			    	}
			    	app.messageTemplatesView.setElement($('#maincontainer')).render();
			    	
			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
					
			    },
			    
			    envelopeStatus : function () 
			    {
			    	if(!app.envelopeStatusView){
			    		app.envelopeStatusView=new envelopeStatusView();
			    	}
			    	app.envelopeStatusView.setElement($('#maincontainer')).render();
			    	
			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
			    },
			    
			    documentTemplateStatus : function () {
			    	
			    	if(!app.documentTemplateStatusView){
			    		app.documentTemplateStatusView=new documentTemplateStatusView();
			    	}
			    	app.documentTemplateStatusView.setElement($('#maincontainer')).render();
			    	
			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
			    },
			    endPointsPage : function () {
			    	
			    	if(!app.endPointsTriggerView){
			    		app.endPointsTriggerView=new endPointsTriggerView();
			    	}
			    	app.endPointsTriggerView.setElement($('#maincontainer')).render();
			    	
			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
					
			    },
			    rehabSearch : function () {
		        	if(!app.headerView){
						app.headerView=new headerview();
				    	app.headerView.render(app.sessionModel.get("userName"));
					}
			    	if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}	
			    	if(!app.rehabSearchView){
			    		 app.rehabSearchView=new rehabSearchView({collection:new rehabCollection()});
					}
			    	app.rehabSearchView.render();
			    },
			    rehabDetail : function(rehabId,taskKey){
		    		if(!app.headerView){
						app.headerView=new headerview();
				    	app.headerView.render(app.sessionModel.get("userName"));
					}
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
			    	
			    	if(!app.rehabDetailView){
			    		 app.rehabDetailView=new rehabDetailView({navPermission:app.navigationView.navpermissions});
					}
		    		app.rehabDetailView.setElement($('#maincontainer')).render({rehabId:rehabId,taskKey:taskKey});

					if (('localStorage' in window) && window['localStorage'] !== null) {
   			        localStorage.setItem('previousUrl', Backbone.history.fragment);
					}
			    },
			    showInvestorReportSearchPage : function() {
			    	
			    	if(!app.investorReportSearchView){
			    		 app.investorReportSearchView=new investorReportSearchView();
					}
			    	app.investorReportSearchView.setElement($('#maincontainer')).render();
			    	
			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
			    	
			    },
			    showRolePermissionsPage : function(){
			    	if(!app.headerView){
						app.headerView=new headerview();
						app.headerView.render(app.sessionModel.get("userName"));
					}
			    	
					if(!app.navigationView){
						app.navigationView=new navigationview();
						app.navigationView.render();
						App.init();
					}
			    	if(!app.navigationView.navpermissions.userManagement){
			    		return false;
			    	}
			    	if(!app.rolePermissionAdminView){
			    		 app.rolePermissionAdminView=new rolePermissionAdminView();
					}
			    	app.rolePermissionAdminView.setElement($('#maincontainer')).render();
			    }
		    
			});
			return AppRouter;
		});
