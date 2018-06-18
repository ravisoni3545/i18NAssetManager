define(["SecurityUtil","text!templates/closing.html", "text!templates/closingHeader.html", "text!templates/financialInformation.html","text!templates/ClosingCarousel.html",
        "text!templates/importantDates.html","text!templates/transactionMembersClosing.html","text!templates/insuranceVendor.html",
        "text!templates/sellerAgent.html","text!templates/usersDropdown.html" ,
        "backbone", "app", "models/closingModel", "text!templates/escrowCompany.html",
        "views/propertyInsuranceModalView","views/propertyTaxModalView","views/propertyHoaModalView","views/addPropertyUnitView",
        "views/codesView", "views/closingStepsView","views/contactView","collections/contactCollection",
        "views/documentView","collections/documentCollection","views/messagesView",
        "collections/messagesCollection","views/lendersView","views/documentTooltipView",
        "text!templates/completionStatus.html","views/rehabRepairView","text!templates/closingBtns.html",
        "text!templates/closingAdminBtns.html","text!templates/genericDropdown.html","views/ownershipTypeView",
        "text!templates/otherInvestmentsList.html","views/currentRemarksView","text!templates/rehabVendor.html",
        "views/investorDepositView","views/transactionMemberView",
        "jcarousel"],
        //"views/closingStepsView","views/vendorContactView","views/documentsView","collections/contacts","views/messagesView"
		function(securityUtil,closingPage, closingHeaderPage, financialInfoPage, closingCarouselPage, impDatesPage, transMemsPage, insuranceVendorPage, 
				sellerAgentPage, usersDropdown, Backbone, app, closingModel, 
				escrowCompanyPage,insuranceModalView,propertyTaxModalView,
				propertyHoaModalView,addPropertyUnitModalView,codesView,closingStepsView,contactView,
       		 contactCollection,documentView,documentCollection,messagesView,messagesCollection,lendersView,
       		 documentTooltipView,completionStatusPage,rehabRepairView,closingBtnsPage,closingAdminBtnsPage,genericDropdown,
       		 ownershipTypeView,otherInvestmentsListPage,currentRemarksView,rehabVendorPage,investorDepositView,transactionMemberView){

	 var ClosingView = Backbone.View.extend( {
		 initialize: function(options){
		 	 this.navPermission = options.navPermission;
			 this.fetchStates();
			 this.lendersView = new lendersView();
			 this.codesView = new codesView({codeGroup:'MORT_STATUS'});
			 
			 var DeleteClosingShow=["DeleteClosingShow"];
			 var ClosingReOpenShow=["ClosingReOpenShow"];
			 this.viewpermissions = {
					 'DeleteClosingShow':securityUtil.isAuthorised(DeleteClosingShow, app.sessionModel.attributes.permissions),
					 'ClosingReOpenShow':securityUtil.isAuthorised(ClosingReOpenShow, app.sessionModel.attributes.permissions)
				 };
				
		 },
		 model:new closingModel(),
		 el:"#maincontainer",
		 states:{},
		 propertyModel:{},
		 propertyUnits:{},
		 adminActionCallback:{},
		 closingStatus:null,
		 closingStatusData:{},
		 events          : {
			 "click a[href='propertyInsurance']":"loadPropertyInsuranceModal",
			 "click a[href='propertyTax']":"loadPropertyTaxModal",
			 "click a[href='propertyHoa']":"loadPropertyHoaModal",
			 "click a[href='addPropertyUnits']":"loadAddPropertyUnits",
			 "click a[href='initialRehab']":"loadInitialRehab",
			/* "click #showEscrowCompanyModal":"showEscrowCompanyModal",
			 "click #saveEscrowCompany":"saveEscrowCompany",*/
			 "click #closingSteps":"showClosingStepsTab",
			 "click #showOwnershipModal":"showOwnershipModal",
			 "click #closingContact":"showContactsTab",
			 "click #closingDocuments":"showClosingDocumentTab",
			 "click #closingMessages":"showClosingMessagesTab",
			 /*"change #lendersDropdown" : "showNewLender",
			 "change #lendersDropdownUpdate" : "showNewLenderUpdate",
			 "click #saveMortgage":"saveMortgage",
			 "change #escrowCompanyDropdown":"showAddEscrowForm",*/
			 "click #fin-info-edit":"toggleFinancialInfo",
			 "click #cancel-fininfo":"cancelFinancialInfo",
			 "click #save-fininfo":"saveFinancialInfo",
			 "click #impdate-edit":"toggleImpDates",
			 "click #cancel-impdate":"cancelImpDates",
			 "click #save-impdate":"saveImpDates",
			/* "click #transmem-edit":"openUserDropdownModal",
			 "click #cancel-transmem":"cancelTransMembers",
			 "click #save-trans-mem":"saveTransactionMember",
			 "click #showInsuranceVendorModal":"showInsuranceVendorModal",
			 "click #saveInsuranceVendor":"saveInsuranceVendor",
			 "click #showSellerAgentModal":"showSellerAgentModal",
			 "click #saveSellerAgent":"saveSellerAgent",*/
			 'click .investment-popover':'fetchOtherInvestments',
			 "click #closingAdminButtonsDiv #openClosingBtn":"showReopenClosingModal",
			 "click #closingAdminButtonsDiv #deleteClosingBtn":"showDeleteClosingModal",
			 "click #closingAdminActionModal #closingAdminActionModalYes":"submitAdminAction",
			 "click .popover-close" : "closePopover",
			 /*"click #rehabVendorEdit":"showRehabVendorModal",
			 "click #save-rehab-vendor":"saveRehabVendor"*/
	     },
	   
	     loadPropertyInsuranceModal: function() {
	    	 if(app.mypropertyView && app.mypropertyView.propertyInsuranceView){
					app.mypropertyView.propertyInsuranceView.close();
					app.mypropertyView.propertyInsuranceView.remove();
				}
			if(!app.closingView.propertyInsuranceView){
				app.closingView.propertyInsuranceView = new insuranceModalView();
			}
			app.closingView.propertyInsuranceView.setElement($("#propertyInsuranceRenderDiv"));
			app.closingView.propertyInsuranceView.propertyModel.objectId = this.investmentId;
			app.closingView.propertyInsuranceView.propertyModel.object = "Investment";
			app.closingView.propertyInsuranceView.propertyModel.objectCodeListId = "49";
			app.closingView.propertyInsuranceView.render();
	     },
	     loadPropertyTaxModal: function() {
	    	 if(app.mypropertyView && app.mypropertyView.propertyTaxView){
					app.mypropertyView.propertyTaxView.close();
					app.mypropertyView.propertyTaxView.remove();
				}
			if(!app.closingView.propertyTaxView){
				app.closingView.propertyTaxView = new propertyTaxModalView();
			}
			app.closingView.propertyTaxView.setElement($("#propertyTaxRenderDiv"));
			app.closingView.propertyTaxView.propertyModel.objectId = this.investmentId;
			app.closingView.propertyTaxView.propertyModel.object = "Investment";
			app.closingView.propertyTaxView.propertyModel.objectCodeListId = "49";
			app.closingView.propertyTaxView.render();
	     },
	     loadPropertyHoaModal: function() {
	    	 if(app.mypropertyView && app.mypropertyView.propertyHoaView){
					app.mypropertyView.propertyHoaView.close();
					app.mypropertyView.propertyHoaView.remove();
				}
			if(!app.closingView.propertyHoaView){
					app.closingView.propertyHoaView = new propertyHoaModalView();
				}
	    	 
			app.closingView.propertyHoaView.setElement($("#propertyHoaRenderDiv"));
			app.closingView.propertyHoaView.propertyModel.objectId = this.investmentId;
			app.closingView.propertyHoaView.propertyModel.object = "Investment";
			app.closingView.propertyHoaView.propertyModel.objectCodeListId = "49";
			app.closingView.propertyHoaView.render();
	     },
	     loadAddPropertyUnits: function() {
	     	var self = this;
    	 	if(app.mypropertyView && app.mypropertyView.addPropertyUnitView){
				app.mypropertyView.addPropertyUnitView.close();
				app.mypropertyView.addPropertyUnitView.remove();
			}
			if(!app.closingView.addPropertyUnitView){
				app.closingView.addPropertyUnitView = new addPropertyUnitModalView();
				self.listenTo(app.closingView.addPropertyUnitView.propertyUnitCollection, 'CollectionChanged', self.setPropertyUnitsData);
			}
	    	
			app.closingView.addPropertyUnitView.setElement(self.$el.find("#addUnitsRenderDiv"));
			app.closingView.addPropertyUnitView.propertyUnitCollection.investmentId = self.investmentId;
			app.closingView.addPropertyUnitView.propertyUnitCollection.assetId = self.model.attributes.investmentResponse.assetId;
			// app.closingView.addPropertyUnitView.propertyUnitCollection.object = "Investment";
			// app.closingView.addPropertyUnitView.propertyUnitCollection.objectCodeListId = "49";
			app.closingView.addPropertyUnitView.fetchProperyUnits();
	     },
	     setPropertyUnitsData:function(evt){
	     	var self = this;
	     	console.log("setPropertyUnitsData");
	     	console.log(evt);
	     	self.model.attributes.propertyUnits = [];
	     	_.each(evt.models,function(model){
	     		self.model.attributes.propertyUnits.push(model.attributes);
	     	})
	     	console.log(self.model);
	     },
	     loadInitialRehab: function(evt) {
	    	var self=this;
    	 	if(app.mypropertyView && app.mypropertyView.rehabRepairView){
				app.mypropertyView.rehabRepairView.close();
				app.mypropertyView.rehabRepairView.remove();
			}
    		if(!app.closingView.rehabRepairView){
				app.closingView.rehabRepairView = new rehabRepairView();
			}
			app.closingView.rehabRepairView.investmentId = self.investmentId;
			app.closingView.rehabRepairView.collection.objectId=this.model.attributes.investmentResponse.assetId;
			app.closingView.rehabRepairView.collection.object="Asset";
			app.closingView.rehabRepairView.fetchRehabDatas("INITIAL_REHAB_CLOSING");
			app.closingView.rehabRepairView.showEditRehabRepairModal(evt,"INITIAL_REHAB_CLOSING");
			self.listenTo(app.closingView.rehabRepairView, 'RehabSavedSuccessfully', self.redrawHeaderBtns);
		 },
		 redrawHeaderBtns:function(rehabid){
			 var self = this;
			 self.$el.find("a[href=initialRehab]").data("rehabid",rehabid);
		 },
		 drawHeaderBtns:function(){
			var self = this;
	    	this.closingBtnsTemplate = _.template( closingBtnsPage );
	     	var closingBtnsEl = this.$el.find('#closingBtnsDiv');
	    	closingBtnsEl.html("");
	    	self.initialRehabId=this.model.attributes.investmentResponse.initialRehabId;
	    	closingBtnsEl.html(this.closingBtnsTemplate({initialRehabId :this.model.attributes.investmentResponse.initialRehabId}));
		 },
	     fetchClosingData : function(investmentId) {
	    	 var self= this;
	    	 this.model.getClosingInfo(investmentId,
 				{	success : function ( model, res ) {
 						self.model.clear();
                    	self.model.set(res);
                    },
                    error   : function ( model, res ) {
                    	$('#closingErrorMessage').html('Error in fetching closing information');
                    }
                });
	     },
	     fetchIlmUsers:function(){
	    	 var self = this;
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
	                }
					
				});
		 },
		 fetchSolutionSpecialistUsers:function(){
	    	 var self = this;
			 $.ajax({
					url: app.context()+'/user/Solution Specialist',
	                contentType: 'application/json',
	                async : false,
	                dataType:'json',
	                type: 'GET',
	                success: function(res){
	                	self.solutionSpecialistUsers=res;
	                },
	                error: function(res){
	                }
					
				});
		 },
		 fetchClosingUsers:function(){
	    	 var self = this;
			 $.ajax({
					url: app.context()+'/user/Closer',
	                contentType: 'application/json',
	                async : false,
	                dataType:'json',
	                type: 'GET',
	                success: function(res){
	                	self.closingUsers=res;
	                },
	                error: function(res){
	                }
					
				});
		 },
		 fetchAssetManagerUsers:function(){
			 var self = this;
			 $.ajax({
					url: app.context()+'/user/Asset Manager',
					contentType: 'application/json',
					async : false,
					type: 'GET',
					success: function(res){
						self.assetManagers=res
					},
					error: function(res){
					}
			 });
		 },
		 fetchInsuranceVendors:function(){
			 var self = this;
			 $.ajax({
					url: app.context()+'/user/Insurance Vendor',
					contentType: 'application/json',
					async : false,
					type: 'GET',
					success: function(res){
						self.insuranceVendors=res
					},
					error: function(res){
					}
			 });
		 },
	     render : function (options) {
	     	if(!app.documentTooltipView){
				app.documentTooltipView=new documentTooltipView();
			}

	    	 this.investmentId = options.investmentId;
			 this.fetchClosingData(this.investmentId);
	    	 
			 this.template = _.template( closingPage );
	     	 this.$el.html("");
	     	 this.$el.html(this.template({closingData:this.model.attributes}));
	     	 this.renderCompletionStatus();
	     	 this.renderHeader();
	     	 this.renderImageCarousel();
	     	 this.renderFinancialInfo();
	     	 this.renderImpDates();
	     	 this.renderTransactionMembers();
	     	 this.drawHeaderBtns();
	     	 // this.drawAdminBtns();
	     	 this.showClosingStepsTab();
	     	 this.applyPermissions();

	     	
	     	 this.scrollPageUp();
	     	 this.setCurrentRemarks();
	     	 
	     	 if(options.taskKey){
	     		$('a[data-taskkey='+options.taskKey+']').click();
	     	 }
	     	 
	     	$('#collapseOne').on('shown.bs.collapse hidden.bs.collapse', function () {
	     	    $('#closingHeaderAccordion').find('.icon-toggle i').toggleClass('fa-chevron-up fa-chevron-down');
	     	});

	        $('.hopNameTooltip').tooltip({
	             animated: 'fade',
	             placement: 'left'
	        });
	     	
	     	$('.investment-popover').popover({
			 	trigger: 'manual',   
//				 content: self.getInvestmentsHtml(otherInvestments),
	        	html: true
	        });
	     	
	     	 return this;
	     },
	     renderCompletionStatus:function(){
	    	 var self = this;
	    	 this.headerTemplate = _.template( completionStatusPage );
	     	 this.fetchCompletionStatus();
	     	 $('#closingCompletionStatusDiv').html('');
	     	 $('#closingCompletionStatusDiv').html(this.headerTemplate({percent:this.percent}));
	     },
	     fetchCompletionStatus:function(){
	    	 var self = this;
	    	 var investmentId=this.investmentId;
	    	 $.ajax({
	                url: app.context()+'closing/getCompletionStatus/'+investmentId,
	                contentType: 'application/json',
	                async : false,
	                dataType:'json',
	                type: 'GET',
	                success: function(res){
	                	self.percent = res.percentage;
	                },
	                error: function(res){
	                }
	            });
	     },
	     addJcar: function() {
	            var connector = function(itemNavigation, carouselStage) {
	                return carouselStage.jcarousel('items').eq(itemNavigation.index());
	            };
	// Setup the carousels. Adjust the options for both carousels here.
	            var carouselStage = $('.carousel-stage').jcarousel({
	                wrap: 'circular'
	            })
	// .jcarouselAutoscroll({
	// target: '+=1',
	// interval: 6000
	// })
	                    ;
	            var carouselNavigation = $('.carousel-navigation').addClass('jcarousel-vertical').jcarousel();
	// We loop through the items of the navigation carousel and set it up
	// as a control for an item from the stage carousel.
	            carouselNavigation.jcarousel('items').each(function() {
	                var item = $(this);
	// This is where we actually connect to items.
	                var target = connector(item, carouselStage);
	                item
	                        .on('jcarouselcontrol:active', function() {
	                            carouselNavigation.jcarousel('scrollIntoView', this);
	                            item.addClass('active');
	                        })
	                        .on('jcarouselcontrol:inactive', function() {
	                            item.removeClass('active');
	                        })
	                        .jcarouselControl({
	                            target: target,
	                            carousel: carouselStage
	                        });
	            });
	// Setup controls for the stage carousel
	            $('.prev-stage')
	                    .on('jcarouselcontrol:inactive', function() {
	                        $(this).addClass('inactive');
	                    })
	                    .on('jcarouselcontrol:active', function() {
	                        $(this).removeClass('inactive');
	                    })
	                    .jcarouselControl({
	                        target: '-=1'
	                    });
	            $('.next-stage')
	                    .on('jcarouselcontrol:inactive', function() {
	                        $(this).addClass('inactive');
	                    })
	                    .on('jcarouselcontrol:active', function() {
	                        $(this).removeClass('inactive');
	                    })
	                    .jcarouselControl({
	                        target: '+=1'
	                    });
	// Setup controls for the navigation carousel
	            $('.prev-navigation')
	                    .on('jcarouselcontrol:inactive', function() {
	                        $(this).addClass('inactive');
	                    })
	                    .on('jcarouselcontrol:active', function() {
	                        $(this).removeClass('inactive');
	                    })
	                    .jcarouselControl({
	                        target: '-=5'
	                    });
	            $('.next-navigation')
	                    .on('jcarouselcontrol:inactive', function() {
	                        $(this).addClass('inactive');
	                    })
	                    .on('jcarouselcontrol:active', function() {
	                        $(this).removeClass('inactive');
	                    })
	                    .jcarouselControl({
	                        target: '+=5'
	                    });
	                    
	            $('.carousel-stage').on('jcarousel:targetout', 'li', function(event, carousel) {
	                // "this" refers to the item element
	                // "carousel" is the jCarousel instance

	               /* var players;

	                if ($(this).hasClass('video_item')) {
	                    players = $('.video_frame');
	                    var child = $(this).children('.video_frame');
	                    console.log($('.video_frame').index(child));
	                    $f(players[$('.video_frame').index(child)]).api('pause');

	                }*/

	            });
	        },
	     renderHeader : function () {
	    	 var self = this;
	    	 this.headerTemplate = _.template( closingHeaderPage );
	     	 var headerEl = this.$el.find('#closingHeader');
	     	 this.fetchClosingHeaderData();
	     	 headerEl.html("");
	     	 headerEl.html(this.headerTemplate({closingData:this.closingHeaderData}));
	     	 $(".amount").formatCurrency();
	     	 app.currencyFormatter();
	     	 ComponentsPickers.init();
	     	 self.loadInvestorDepositView();
	     	 self.drawAdminBtns();
	     	 return this;
	     },
	     renderImageCarousel:function(){
	    	 var self = this;
	    	 var closingCarouselTemplate = _.template( closingCarouselPage );
	    	 var carouselEl = this.$el.find('#closingcarouselDiv');
	    	 carouselEl.html("");
	    	 $.ajax({
	                url: app.context()+'property/getPropertyImageList/'+self.closingHeaderData.propertyResponse.propertyId,
	                contentType: 'application/json',
	                dataType:'json',
	                type: 'GET',
	                async : false,
	                success: function(res){
	                	carouselEl.html(closingCarouselTemplate({images:res,loading_img_medium:app.loading_img_base64_120x90,loading_img_thumbnail:app.loading_img_base64_70x50}));
	                	self.addJcar();
	                	app.router.checkPropImage();
	                },
	                error: function(res){
	                	console.log(res);
	                	carouselEl.html(closingCarouselTemplate({images:null,loading_img_medium:app.loading_img_base64_120x90,loading_img_thumbnail:app.loading_img_base64_70x50}));
	                	self.addJcar();
	                	app.router.checkPropImage();
	                }
	            });
	    	 
	     },
	     refreshClosingHeader : function () {
	    	 // this.fetchClosingHeaderData();
	    	 this.renderHeader();
	    	 this.applyPermissions();
	     },
	     saveEscrowCompany:function(){
	    	 var self=this;
	    	 var obj={};
	    	 var escrowCompany=$("#escrowCompanyDropdown option:selected").val();
	    	 
	    	 var investmentId=this.investmentId;
	    	 if(escrowCompany=='addNewEscrow'){
	    		 obj.companyName=$("#companyName").val();

		    	 if(jQuery.isEmptyObject(obj.companyName)){
		    		 $('#escrowCompanyFormMsg').show();
		    		 $('#escrowCompanyFormMsg > text').val('Please enter company name');
				     $('#escrowCompanyFormMsg').delay(2000).fadeOut(2000); 
				     return;
		    	 }
	    		 obj.contactName=$("#contactName").val();
	    		 obj.address1=$("#address1").val();
	    		 obj.address2=$("#address2").val();
	    		 obj.city=$("#city").val();
	    		 obj.state=$("#state").val();
	    		 obj.postalCode=$("#postalCode").val();
	    		 obj.phone1=$("#phone1").val();
	    		 obj.phone2=$("#phone2").val();
	    		 obj.fax=$("#fax").val();
	    		 obj.email=$("#email").val();
	    	 }
	    	 else{
	    		 obj.escrowCompanyId=escrowCompany;

		    	 if(jQuery.isEmptyObject(escrowCompany)){
		    		 $('#escrowCompanyFormMsg').show();
				     $('#escrowCompanyFormMsg').delay(2000).fadeOut(2000); 
				     return;
		    	 }
	    	 }
	    	 
	    	 $.ajax({
	                url: app.context()+'closing/saveEscrowCompany/'+investmentId,
	                contentType: 'application/json',
	                dataType:'json',
	                type: 'POST',
	                data:JSON.stringify(obj),
	                success: function(res){
	                	$("#escrowcompany").modal("hide");
	                	//$("#escrowcompany").on('hidden.bs.modal', function (e) {
	                		self.refreshTransactionMembers();
	                		$('#transMemsSuccessMsg').show();
							$('#transMemsSuccessMsg > text').html("Successfully updated escrow company.");
					        App.scrollTo($('#transMemsSuccessMsg'), -200);
					        $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
                    	//});
	                	self.refreshContactsTab();
	                },
	                error: function(res){
	                	self.refreshTransactionMembers();
	                	$('#transMemsFailureMsg').show();
						$('#transMemsFailureMsg > text').html("Error in updating escrow company.");
				        App.scrollTo($('#transMemsFailureMsg'), -200);
				        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);
	                }
	            });
	     },
	     showEscrowCompanyModal:function(){
	    	var self=this;
	    	var escrowCompanyTemplate= _.template(escrowCompanyPage);
	    	var investmentId=this.investmentId;
	    	var escrowOrganizationId = null;
	    	
	    	this.fetchEscrowCompanies();
	    	
	    	var investmentProps = self.otherTransMemsData;
	    	
	    	$("#escrowcompanyDiv").html(" ");
	    	$("#escrowcompanyDiv").html(
	    			escrowCompanyTemplate({
			    				states:self.states,
			    				escrowOrganization:{},
			    				escrowOrganizationContact:{},
			    				escrowOrgList:self.escrowCompanies
		    				})
	    				);
	    	
    		$('select[name= escrowCompanyDropdown]').val(investmentProps.escrowCompanyId);
	    	$("#escrowcompany").modal("show");
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
					
				});
	     },

	     showClosingStepsTab:function() {
	     	var self = this;
	    	 this.removeActiveTab();
    	  	 if(!this.closingStepsView){
    	  		this.closingStepsView=new closingStepsView();
			 }
			app.closingView.closingStepsView.propertyModel.objectId = this.investmentId;
			app.closingView.closingStepsView.propertyModel.object = "Investment";
			app.closingView.closingStepsView.propertyModel.closingStatus = this.model.attributes.investmentResponse.closingStatus;
			
    	  	 this.closingStepsView.setElement($('#closingStepsTab')).render({parentView:this});
			 $("#closingSteps").parent().addClass('active')
			 $("#closingStepsTab").addClass("active");
	     },
	     removeActiveTab:function(){
	    	 $("li[name=closingNav].active").removeClass("active");
	    	 $('div[name=closingInfoTab].active').empty().removeClass("active");
	     },

	     
	     showOwnershipModal:function(){
	    	 var thisPtr=this;
	    	 if(app.opportunityView && app.opportunityView.ownershipTypeView){
					app.opportunityView.ownershipTypeView.close();
					app.opportunityView.ownershipTypeView.remove();
				}
				if(!app.closingView.ownershipTypeView){
					app.closingView.ownershipTypeView = new ownershipTypeView();
					thisPtr.listenTo(app.closingView.ownershipTypeView, 'ownershipTypeChangedSuccess', thisPtr.ownershipTypeSuccessListener);
					thisPtr.listenTo(app.closingView.ownershipTypeView, 'ownershipTypeChangedFailure', thisPtr.ownershipTypeFailureListener);
				}
				app.closingView.ownershipTypeView.setElement(thisPtr.$el.find("#ownershipDiv"));
				app.closingView.ownershipTypeView.ownershipTypeModel.objectId = this.investmentId;
				app.closingView.ownershipTypeView.ownershipTypeModel.object = "Investment";
				app.closingView.ownershipTypeView.render();
		     },

			showContactsTab: function(){
					var thisPtr=this;
					var object="Investment";
					this.removeActiveTab();
					if(app.mypropertyView && app.mypropertyView.contactView){
						app.mypropertyView.contactView.close();
						app.mypropertyView.contactView.remove();
					}
					if(!app.closingView.contactView){
						app.closingView.contactView=new contactView({collection:new contactCollection()});
						thisPtr.listenTo(app.closingView.contactView, 'ContactChanged', thisPtr.contactEditDeleteListener);
					}
					app.closingView.contactView.collection.objectId=thisPtr.investmentId;
					app.closingView.contactView.collection.object=object;
					app.closingView.contactView.object=object;
					app.closingView.contactView.objectId=thisPtr.investmentId;
					
					app.closingView.contactView.setElement($('#contactsTab')).render();
					$("#contact").parent().addClass('active');
					$("#contactsTab").addClass("active");	
					return this;
					
			},
		     showClosingDocumentTab:function(){
		    	 var thisPtr=this;
					var object="Investment";
					this.removeActiveTab();
					if(app.mypropertyView && app.mypropertyView.documentView){
						app.mypropertyView.documentView.close();
						app.mypropertyView.documentView.remove();
					}
					if(app.homeView && app.homeView.documentView){
						app.homeView.documentView.close();
						app.homeView.documentView.remove();
					}
					if(app.investorProfileView && app.investorProfileView.documentView){
						app.investorProfileView.documentView.close();
						app.investorProfileView.documentView.remove();
					}
					if(app.opportunityView && app.opportunityView.documentView){
						app.opportunityView.documentView.close();
						app.opportunityView.documentView.remove();
					}
					

					if(!app.closingView.documentView){
						app.closingView.documentView=new documentView({collection: new documentCollection()});
					}
					app.closingView.documentView.object=object;
					app.closingView.documentView.objectId=thisPtr.investmentId;
					app.closingView.documentView.setElement($('#closingDocumentsTab')).fetchDocument();
					$("#closingDocuments").parent().addClass('active')
					$("#closingDocumentsTab").addClass("active");
					return this;
		     },
		     showClosingMessagesTab:function(){
					var thisPtr=this;
					var object="Investment";
					this.removeActiveTab();
					if(app.mypropertyView && app.mypropertyView.messagesView){
						app.mypropertyView.messagesView.propertyModel.clear();
						app.mypropertyView.messagesView.close();
						app.mypropertyView.messagesView.remove();						
					}
					if(app.investorProfileView && app.investorProfileView.messagesView)
						{
						app.investorProfileView.messagesView.propertyModel = {};
						app.investorProfileView.messagesView.close();
						app.investorProfileView.messagesView.remove();
						}
					
					if(app.opportunityView && app.opportunityView.messagesView){
						app.opportunityView.messagesView.propertyModel = {};
						app.opportunityView.messagesView.close();
						app.opportunityView.messagesView.remove();
					}
					
					if(!app.closingView.messagesView){
						app.closingView.messagesView=new messagesView({collection:new messagesCollection()});
					}
					app.closingView.messagesView.propertyModel.objectId = this.investmentId;
					app.closingView.messagesView.propertyModel.object = object;
					app.closingView.messagesView.propertyModel.propertyId = this.model.attributes.propertyResponse.propertyId;
					app.closingView.messagesView.collection.objectId=this.investmentId;
					app.closingView.messagesView.collection.object=object;

					app.closingView.messagesView.setElement($('#closingMessagesTab')).fetchMessages();
					 
					
					$("#closingMessages").parent().addClass('active');
					$("#closingMessagesTab").addClass("active");
					return this;
			},
			showNewLender: function() {
				var lenderCompany = $("#lendersDropdown").val();
				if(lenderCompany=="newlender"){
					$("#newlender").prop("disabled", false);
				}else{
					$("#newlender").prop("disabled", true);
				}
			},
			showNewLenderUpdate: function() {
				var lenderCompanyUpdate = $("#lendersDropdownUpdate").val();
				if(lenderCompanyUpdate=="newlender"){
					$("#newlenderUpdate").prop("disabled", false);
				}else{
					$("#newlenderUpdate").prop("disabled", true);
				}
			},
			saveMortgage:function() {
				 var self=this;
		    	 var obj={};
		    	 var investmentId=this.investmentId;
		    	 var lender=$("#lendersDropdownUpdate option:selected").val();
		    	 var nonHuLender=$("#newlenderUpdate").val();
		    	 obj.mortgageStatus=$("#statusListUpdate option:selected").val();
		    	 obj.investmentId=investmentId;
		    	 if(lender=="newlender"){
		    		 if(nonHuLender == ""){
		    		 	 $('#mortgageDetailsForm #formFailure #textValue').text("Please enter New Lender.");
		    			 $('#mortgageDetailsForm #formFailure').show();
		    			 App.scrollTo($('#mortgageDetailsForm #formFailure'), -200);
		                 $('#mortgageDetailsForm #formFailure').delay(2000).fadeOut(2000);
		    		 }else{
		    			 obj.lendingCompanyName=nonHuLender;
		    			 this.saveOrUpdateMortgage(obj);
		    		 }
		    	 }else{
		    		 obj.lendingCompanyName=lender;
		    		 if(jQuery.isEmptyObject(obj.lendingCompanyName)){
		    			 $('#mortgageDetailsForm #formFailure #textValue').text("Please select lender Company.");
		    			 $('#mortgageDetailsForm #formFailure').show();
		    			 App.scrollTo($('#mortgageDetailsForm #formFailure'), -200);
		                 $('#mortgageDetailsForm #formFailure').delay(2000).fadeOut(2000); 
					     return;
			    	 }
		    		 this.saveOrUpdateMortgage(obj);
		    	 }
			},
			saveOrUpdateMortgage:function(obj){ 	 
				 var self=this;
		    	 $.ajax({
		                url: app.context()+'closing/saveOrUpdateMortgage',
		                contentType: 'application/json',
		                aysnc:false,
		                dataType:'text',
		                type: 'POST',
		                data:JSON.stringify(obj),
		                success: function(res){
		                	$("#lendingcompany").modal("hide");
		                	$("#lendingcompany").on('hidden.bs.modal', function (e) {
		                			self.refreshTransactionMembers();
		                			$('#transMemsSuccessMsg').show();
									$('#transMemsSuccessMsg > text').html("Successfully updated mortgage company.");
							        App.scrollTo($('#transMemsSuccessMsg'), -200);
							        $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
	                    	});
		                	self.refreshContactsTab();
		                },
		                error: function(res){
		                	self.refreshTransactionMembers();
		                	$('#transMemsFailureMsg').show();
							$('#transMemsFailureMsg > text').html("Error in updating mortgage company.");
					        App.scrollTo($('#transMemsFailureMsg'), -200);
					        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);
		                }
		        });
			},
			applyPermissions : function() {
		    	 if($.inArray('ClosingManagement', app.sessionModel.attributes.permissions)==-1) {
		    		 $("#showOwnershipModal").remove();
		    		 $("#showEscrowCompanyModal").remove();
		    		 $("a[href='editClosingHeader']").remove();
		    		 $("a[href='#lendingcompany']").remove();
		    		 //$(".closingExportToExcel").remove();
		    		 $('a[href="#cancelclosing"]').remove();
		    		 $(".closingCompletedButton").remove();
		    		 $("a[href='#document-form1']").remove();
		    	 }
		    	 if($.inArray('Administrator', app.sessionModel.attributes.roles)==-1 && $.inArray('Closer', app.sessionModel.attributes.roles)==-1) {
		    		$("#closingAdminButtonsDiv").remove();
		    	 } else {
		    	 	$("#closingAdminButtonsDiv").show();
		    	 }
			},
			
			setCurrentRemarks : function(){
	    	  	 if(!this.currentRemarksView){
	     	  		this.currentRemarksView=new currentRemarksView();
	 			 }
	    	  	app.closingView.currentRemarksView.setElement($("#currentRemarks"));
	 			app.closingView.currentRemarksView.propertyModel.objectId = this.investmentId;
	 			app.closingView.currentRemarksView.propertyModel.object = "49";
	 			app.closingView.currentRemarksView.propertyModel.messageType = "CLOSING_REMARKS";
	 			app.closingView.currentRemarksView.propertyModel.closingStatus=this.closingStatusData.investmentResponse.closingStatus;
	 			app.closingView.currentRemarksView.propertyModel.investmentStatus=this.closingStatusData.investmentResponse.investmentStatus;
	 			this.currentRemarksView.fetchRemarks();
			},
			fetchEscrowCompanies : function(){
				
				var self=this;
				var serviceName='Escrow-Service';
		    	 var allCompaniesResponseObject = $.ajax({
						type : "GET",
						url : app.context()+ "/company/service/"+serviceName,
						async : false
					});
		    	 allCompaniesResponseObject.done(function(response) {
						self.escrowCompanies=response;
					});
		    	 allCompaniesResponseObject.fail(function(response) {
						
					});
			},
			
			showAddEscrowForm : function(){
				var escrowCompany=$("#escrowCompanyDropdown option:selected").val();
				
				if(escrowCompany=='addNewEscrow'){
					$('.addEscrowForm').show();
				}
				else{
					$('.addEscrowForm').hide();
				}
			},
			
			scrollPageUp : function(){
				 $('body').scrollTop(0);
			},
			
			fetchClosingHeaderData:function(){
				 var self = this;
				 var investmentId = this.investmentId;
				 $.ajax({
						url: app.context()+'/closing/getClosingHeaderInfo/'+investmentId,
		                contentType: 'application/json',
		                async : false,
		                dataType:'json',
		                type: 'GET',
		                success: function(res){
							 self.closingStatusData=res;
				             self.closingHeaderData=res;
				             self.model.attributes.investmentResponse.closingStatus = res.investmentResponse.closingStatus;
		                },
		                error: function(res){
		                	
		                }
						
					});
			},
			renderFinancialInfo:function(){
				var self = this;
		    	this.financialInfoTemplate = _.template( financialInfoPage );
		     	var financialInfoEl = this.$el.find('#financialInfoDiv');
		    	this.fetchFinancialInfo();
		     	financialInfoEl.html("");
		     	financialInfoEl.html(this.financialInfoTemplate({investmentResponse:this.financialInfoData}));
		     	$('#financial-edit').hide();
		     	
		     	$(".amount").formatCurrency();
  			    app.currencyFormatter("$","currencyInsurance");
		     	ComponentsPickers.init();
			},
			fetchFinancialInfo:function(){
				 var self = this;
				 var investmentId = this.investmentId;
				 $.ajax({
						url: app.context()+'/closing/getFinancialInformation/'+investmentId,
		                contentType: 'application/json',
		                async : false,
		                dataType:'json',
		                type: 'GET',
		                success: function(res){
		                	self.financialInfoData=res;
		                },
		                error: function(res){
		                	
		                }
						
					});
			},
			renderImpDates:function(){
				var self = this;
		    	this.impDatesTemplate = _.template( impDatesPage );
		     	var impDatesEl = this.$el.find('#impDatesDiv');
		    	this.fetchImpDates();
		    	impDatesEl.html("");
		    	impDatesEl.html(this.impDatesTemplate({investmentResponse:this.impDatesData}));
		    	$('#imp-date-edit').hide();
		    	
		    	this.currentForm = $('#impDatesDiv').find("form");
		    	var startDatePicker = this.currentForm.find('[name=closingStartDate]');
				if(startDatePicker.length>0) {
					$(startDatePicker[0]).parent().datepicker().on('changeDate', function (evt) {
						var selectedDate = new Date(evt.date.valueOf());
						var estEndDatePicker = self.currentForm.find('[name=estimatedClosingDate]');
						if(estEndDatePicker.length>0) {
							var estEndDatePickerWidget = $(estEndDatePicker[0]).parent();
							var estEndDate = estEndDatePickerWidget.datepicker("getDate");
							if(estEndDate<selectedDate) {
								estEndDatePickerWidget.data({date: selectedDate}).datepicker('update');
								var month = selectedDate.getMonth()+1;
								if(String(month).length<2) {
									month = '0'+month;
								}
//								$(estEndDatePicker[0]).val(month+"-"+selectedDate.getDate()+"-"+selectedDate.getFullYear());
							}
							estEndDatePickerWidget.datepicker('setStartDate', selectedDate);
						}
						/*var endDatePicker = self.currentForm.find('[name=closingEndDate]');
						if(endDatePicker.length>0) {
							var endDatePickerWidget = $(endDatePicker[0]).parent();
							var endDate = endDatePickerWidget.datepicker("getDate");
							if(endDate<selectedDate) {
								endDatePickerWidget.data({date: selectedDate}).datepicker('update');
								var month = selectedDate.getMonth()+1;
								if(String(month).length<2) {
									month = '0'+month;
								}
//								$(endDatePicker[0]).val(month+"-"+selectedDate.getDate()+"-"+selectedDate.getFullYear());
							}
							endDatePickerWidget.datepicker('setStartDate', selectedDate);
						}*/
					});
				}
		    	
		    	this.impDatesFormValidation($('#impDatesDiv').find("form"));
		    	ComponentsPickers.init();
			},
			fetchImpDates:function(){
				 var self = this;
				 var investmentId = this.investmentId;
				 $.ajax({
						url: app.context()+'/closing/getImportantDates/'+investmentId,
		                contentType: 'application/json',
		                async : false,
		                dataType:'json',
		                type: 'GET',
		                success: function(res){
		                	self.impDatesData=res;
		                },
		                error: function(res){
		                	
		                }
						
					});
			},
			renderTransactionMembers:function(){
				var object="Investment";
				var thisPtr=this;
				
				if(app.rehabDetailView && app.rehabDetailView.transactionMemberView){
					app.rehabDetailView.transactionMemberView.close();
					app.rehabDetailView.transactionMemberView.remove();
				}
				else if(app.assetMarketingDetailsView && app.assetMarketingDetailsView.transactionMemberView){
					app.assetMarketingDetailsView.transactionMemberView.close();
					app.assetMarketingDetailsView.transactionMemberView.remove();
				}
				else if(app.mypropertyView && app.mypropertyView.transactionMemberView){
					app.mypropertyView.transactionMemberView.close();
					app.mypropertyView.transactionMemberView.remove();
				}
				
				if(!app.closingView.transactionMemberView){
					app.closingView.transactionMemberView=new transactionMemberView({});
				}
				//app.closingView.transactionMemberView.collection.objectId=thisPtr.investmentId;
				//app.closingView.contactView.collection.object=object;
				app.closingView.transactionMemberView.object=object;
				app.closingView.transactionMemberView.objectId=thisPtr.investmentId;
				app.closingView.transactionMemberView.investmentId=thisPtr.investmentId;
				
				app.closingView.transactionMemberView.setElement($('#transMemsDiv')).render();
			},
			toggleFinancialInfo:function(){
				
				 var investmentProps = this.financialInfoData;
				 
				 $('input[name=purchasePrice]').val(investmentProps.purchasePrice);
		    	 $('input[id=purchasePrice_currency]').val(investmentProps.purchasePrice);
		    	 $('input[name=emdAmount]').val(investmentProps.emdAmount);
		    	 $('input[id=emdAmount_currency]').val(investmentProps.emdAmount);
		    	 $('input[name=commission]').val(investmentProps.commission);
		    	 $('input[id=commission_currency]').val(investmentProps.commission);
		    	 $('input[name=optionFee]').val(investmentProps.optionFee);
		    	 $('input[id=optionFee_currency]').val(investmentProps.optionFee);
		    	 
		    	 $(".amount").formatCurrency();
				 app.currencyFormatter("$","currencyInsurance");
				 $('.financialtoggle').toggle();
			},
			cancelFinancialInfo:function(){
				 $('#financial-edit').hide();
			     $('#financial-view').show();
			},
			saveFinancialInfo:function(){
				 var self=this;
				 var updateRequestData = {};
				 updateRequestData.investmentId = this.investmentId;
		    	 updateRequestData.purchasePrice = $('input[name=purchasePrice]').val();
		    	 updateRequestData.emdAmount = $('input[name=emdAmount]').val();
		    	 updateRequestData.optionFee = $('input[name=optionFee]').val();
		    	 updateRequestData.commission = $('input[name=commission]').val();
		    	 
		    	 $.ajax({
		                url: app.context()+'closing/updateFinancialInfo',
		                contentType: 'application/json',
		                dataType:'text',
		                type: 'POST',
		                data:JSON.stringify(updateRequestData),
		                success: function(res){
	 						self.refreshFinancialInfo();
	 						$('#finInfoSuccessMsg').show();
							$('#finInfoSuccessMsg > text').html("Successfully updated financial information.");
					        App.scrollTo($('#finInfoSuccessMsg'), -200);
					        $('#finInfoSuccessMsg').delay(2000).fadeOut(2000);
	 						self.refreshClosingHeader();
		                },
		                error: function(res){
		                	$('#finInfoFailureMsg').show();
							$('#finInfoFailureMsg > text').html("Error in updating financial information.");
					        App.scrollTo($('#finInfoFailureMsg'), -200);
					        $('#finInfoFailureMsg').delay(2000).fadeOut(2000);
		                }
		            });
				
				 $('#financial-edit').hide();
			     $('#financial-view').show();
			},
			refreshFinancialInfo:function(){
				this.fetchFinancialInfo();
		    	this.renderFinancialInfo();
			},
			toggleImpDates:function(){
				
				 var investmentProps = this.impDatesData;
				 
				 $('input[name=paDate]').val(investmentProps.paDate);
				 $('input[name=adjustedBookingDate]').val(investmentProps.adjustedBookingDate);
		    	 $('input[name=paCloseOfEscrowDate]').val(investmentProps.paCloseOfEscrowDate);
				 $('input[name=estimatedClosingDate]').val(investmentProps.estimatedClosingDate);
				 $('input[name=lastInvestorContactDate]').val(investmentProps.lastInvestorContactDate);
		    	 $('input[name=closingStartDate]').val(investmentProps.closingStartDate);
		    	 $('input[name=closingEndDate]').val(investmentProps.closingEndDate);
		    	 $('input[name=optionPeriodExpires]').val(investmentProps.optionPeriodExpires);
		    	 
				 $('.impdatetoggle').toggle();
			},
			cancelImpDates:function(){
			     $('#imp-date-edit').hide();
			     $('#imp-date-view').show();
			},
			saveImpDates:function(){
				 var self=this;
				 if($('#impDatesForm').validate().form()){
					 var updateRequestData = {};
					 updateRequestData.investmentId = this.investmentId;
					 
					 updateRequestData.paDate = $('input[name=paDate]').val();
					 updateRequestData.adjustedBookingDate=$('input[name=adjustedBookingDate]').val();
			    	 updateRequestData.paCloseOfEscrowDate = $('input[name=paCloseOfEscrowDate]').val();
					 updateRequestData.estimatedClosingDate = $('input[name=estimatedClosingDate]').val();
					 updateRequestData.lastInvestorContactDate = $('input[name=lastInvestorContactDate]').val();
			    	 updateRequestData.closingStartDate = $('input[name=closingStartDate]').val();
			    	 updateRequestData.optionPeriodExpires = $('input[name=optionPeriodExpires]').val();
			    	 
			    	 
			    	 $.ajax({
			                url: app.context()+'closing/updateImportantDates',
			                contentType: 'application/json',
			                dataType:'text',
			                type: 'POST',
			                data:JSON.stringify(updateRequestData),
			                success: function(res){
		 						self.refreshImpDates();
		 						$('#impDatesSuccessMsg').show();
								$('#impDatesSuccessMsg > text').html("Successfully updated important Dates.");
						        App.scrollTo($('#impDatesSuccessMsg'), -200);
						        $('#impDatesSuccessMsg').delay(2000).fadeOut(2000);
		 						self.renderCompletionStatus();
		 						self.refreshClosingHeader();
			                },
			                error: function(res){
			                	$('#impDatesFailureMsg').show();
								$('#impDatesFailureMsg > text').html("Error in updating important Dates.");
						        App.scrollTo($('#impDatesFailureMsg'), -200);
						        $('#impDatesFailureMsg').delay(2000).fadeOut(2000);
			                }
			            });
					
			    	  $('#imp-date-edit').hide();
					  $('#imp-date-view').show();
				 }
			},
			impDatesFormValidation:function(currentForm){
				var form1 = currentForm;

				form1.validate({
					errorElement: 'span', //default input error message container
					errorClass: 'help-block', // default input error message class
					focusInvalid: false, // do not focus the last invalid input
					ignore: "",
					rules: {
						paDate: {
							required: true
						},
						paCloseOfEscrowDate: {
							required: true
						},
						estimatedClosingDate: {
							required: true
						},
						closingStartDate: {
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
			refreshImpDates:function(){
				this.fetchImpDates();
		    	this.renderImpDates();
			},
			toggleTransMembers:function(){
				/*
				 var investmentProps = this.transMemsData;
				 
				 $('select[name=closer]').val(investmentProps.closerId);
		    	 $('select[name=ilm]').val(investmentProps.ilmId);
		    	 $('select[name=solutionSpecialist]').val(investmentProps.solutionSpecialistId);
		    	 $('select[name=assetManager]').val(investmentProps.assetManagerId);
		    	 
		    	 $('select[name= escrowCompanyDropdown]').val(investmentProps.escrowCompanyId);
		    	 
		    	 var lendingCompanyName = this.transMemsData.lendingCompanyName;
		     	 var mortgageStatus =  this.transMemsData.mortgageStatus;
		     	 
		     	 this.lendersView.render({el:$('#lendersList')});
		     	 $('#lendersList .form-control').attr('id', 'lendersDropdown');
		     	 this.lendersView.render({el:$('#lendersListUpdate')});
		     	 $('#lendersListUpdate .form-control').attr('id', 'lendersDropdownUpdate');
		     	 $('#lendersListUpdate .form-control').attr('name', 'lenderCompanyUpdate');
		     	 
		     	 this.showNewLender();
		     	 this.showNewLenderUpdate();
		     	 
		     	 this.codesView.render({el:$('#statusList'),codeParamName:"statusId",addBlankFirstOption:"true"});
		     	 $('#statusList .form-control').attr('id', 'statusId');
		     	 this.codesView.render({el:$('#statusListUpdate'),codeParamName:"statusId",addBlankFirstOption:"true"});
		     	 $('#statusListUpdate .form-control').attr('id', 'statusIdUpdate');
		     	 $('#statusListUpdate .form-control').attr('name', 'statusIdUpdate');
		     	 
		     	 var text = $("#lendersDropdown option[value='"+lendingCompanyName+"']").text();
	         	 $('.bootstrap-select .filter-option').text(text);
		    	 $('#lendersDropdown').val(lendingCompanyName);
		    	 
		    	 var text1 = $("#lendersDropdownUpdate option[value='"+lendingCompanyName+"']").text();
	         	 $('.bootstrap-select .filter-option').text(text1);
		    	 $('#lendersDropdownUpdate').val(lendingCompanyName);
		     	 
		     	 $('#statusId').val(mortgageStatus);
		     	 $('#statusIdUpdate').val(mortgageStatus);
		    	 
		    	 $('.transmemtoggle').toggle();*/
			},
			
			openUserDropdownModal: function(evt){
				 var self=this;
				 var currTarget=$(evt.currentTarget);
				 
				 self.processRoleId=currTarget.data("processroleid");
				 //self.currentTranMemberTarget=currTarget;
				 var roleName=currTarget.data('rolename');
				 var userId=currTarget.data('userid');
				 self.fetchUsersByRoleName(roleName);
				 self.roleName=roleName;
				 var usersDropdownTemplate = _.template(usersDropdown);
				 
				 $('#transactionMemberClosingDiv').html(usersDropdownTemplate({name:'transUser',id:'transUser',users:self.transUsers,addBlankFirstOption:true,investorName:null}));
				 $('#transactionMemberClosingDiv').css({"margin-right":"280px","margin-bottom":"10px"});
				 $("[name=transUser]").val(userId);
				 
				 $('#transMemberClosing').find('.modal-title').html(roleName);
				 $("#transMemberClosing").modal("show");
			 },
			 fetchUsersByRoleName:function(roleName){
		    	 var self = this;
				 $.ajax({
						url: app.context()+'/user/'+roleName,
		                contentType: 'application/json',
		                async : false,
		                dataType:'json',
		                type: 'GET',
		                success: function(res){
		                	self.transUsers=res;
		                },
		                error: function(res){
		                }
						
					});
			 },
			 saveTransactionMember : function(){
				 var self=this;
				 var userId=$('#transactionMemberClosingDiv').find('[name=transUser] option:selected').val();
				 $.ajax({
					 url: app.context()+'/transactionMembers/save/'+self.processRoleId+'/'+userId,
		             contentType: 'application/json',
		             async : false,
		             dataType:'text',
		             type: 'GET',
		             success: function(res){
		            	 
		            	$("#transMemberClosing").modal("hide");
		            	self.renderTransactionMembers();
		            	self.showClosingStepsTab();
		            	$('#transMemsSuccessMsg').show();
						$('#transMemsSuccessMsg > text').html("Successfully updated "+self.roleName +".");
					    App.scrollTo($('#transMemsSuccessMsg'), -200);
					    $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);

		             },
		             error: function(res){
		            	$("#transMemberClosing").modal("hide"); 
		            	self.renderTransactionMembers();
		             	$('#transMemsFailureMsg').show();
						$('#transMemsFailureMsg > text').html("Error in updating  "+self.roleName +".");
				        App.scrollTo($('#transMemsFailureMsg'), -200);
				        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);

		             }
					});
			 },
			
			cancelTransMembers:function(){
				/*$('#trans-mem-edit').hide();
		        $('#trans-mem-view').show();*/
			},
			saveTransMembers:function(){
				 /*var self=this;
				 var updateRequestData = {};
				 updateRequestData.investmentId = this.investmentId;
				 
		    	 updateRequestData.ilmId = $('select[name=ilm]').val();
		    	 updateRequestData.assetManagerId = $('select[name=assetManager]').val();
		    	 updateRequestData.closerId = $('select[name=closer]').val();
		    	 if(updateRequestData.closerId == "") {
			 		 $('#editClosingHeader #formFailure #textValue').text("Please select Closer");
			 		 $('#editClosingHeader #formFailure').show();
					 App.scrollTo($('#editClosingHeader #formFailure'), -200);
		             $('#editClosingHeader #formFailure').delay(3000).fadeOut(3000);
		             return;
		    	 }
		    	 updateRequestData.solutionSpecialistId = $('select[name=solutionSpecialist]').val();
		    	 
		    	 $.ajax({
		                url: app.context()+'closing/updateTransactionMembers',
		                contentType: 'application/json',
		                dataType:'text',
		                type: 'POST',
		                data:JSON.stringify(updateRequestData),
		                success: function(res){
	 						self.refreshTransactionMembers();
	 						$('#transMemsSuccessMsg').show();
							$('#transMemsSuccessMsg > text').html("Successfully updated transaction members.");
					        App.scrollTo($('#transMemsSuccessMsg'), -200);
					        $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
		                },
		                error: function(res){
		                	self.refreshTransactionMembers();
		                	$('#transMemsFailureMsg').show();
							$('#transMemsFailureMsg > text').html("Error in updating transaction members.");
					        App.scrollTo($('#transMemsFailureMsg'), -200);
					        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);
		                }
		            });
				
		    	 $('#trans-mem-edit').hide();
		         $('#trans-mem-view').show();*/
		    },
		    refreshTransactionMembers:function(){
				this.fetchTransactionMembers();
		    	this.renderTransactionMembers();
			},
		    showInsuranceVendorModal:function(){
		    	var self=this;
		    	if(!this.insuranceVendors) {
		    		this.fetchInsuranceVendors();
		    	}
		    	var insuranceVendorTemplate = _.template(insuranceVendorPage);
		    	
		    	$('#insuranceVendorDiv').html('');
		    	$('#insuranceVendorDiv').html(insuranceVendorTemplate({users:this.insuranceVendors,addBlankFirstOption:true}));
		    	 
		    	var investmentProps = self.otherTransMemsData;
		    	$('select[id=insuranceVendorDropdown]').val(investmentProps.insuranceVendorId);
		    	
		    	$("#insuranceVendor").modal("show");
		    },
		    saveInsuranceVendor:function(){
		    	 var self=this;
		    	 var obj={};
		    	 var investmentId=this.investmentId;
		    	 obj.investmentId=investmentId;
		    	 obj.insuranceVendorId=$("#insuranceVendorDropdown option:selected").val();
		    	 
		    	 if(jQuery.isEmptyObject(obj.insuranceVendorId)){
		    		 $('#insuranceVendorFormMsg').show();
				     $('#insuranceVendorFormMsg').delay(2000).fadeOut(2000); 
				     return;
		    	 }
		    	 
		    	 $.ajax({
		                url: app.context()+'closing/saveOrUpdateInsuranceVendor',
		                contentType: 'application/json',
		                dataType:'text',
		                type: 'POST',
		                data:JSON.stringify(obj),
		                success: function(res){
		                	$("#insuranceVendor").modal("hide");
		                	$("#insuranceVendor").on('hidden.bs.modal', function (e) {
		                		self.refreshTransactionMembers();
		                		$('#transMemsSuccessMsg').show();
								$('#transMemsSuccessMsg > text').html("Successfully updated insurance vendor.");
						        App.scrollTo($('#transMemsSuccessMsg'), -200);
						        $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
	                    	});
		                	self.refreshContactsTab();
		                },
		                error: function(res){
		                	self.refreshTransactionMembers();
		                	$('#transMemsFailureMsg').show();
							$('#transMemsFailureMsg > text').html("Error in updating insurance vendor.");
					        App.scrollTo($('#transMemsFailureMsg'), -200);
					        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);
		                }
		            });
		   
		     },
		     showSellerAgentModal:function(){
			    	var self=this;
			    	this.fetchSellerAgentData();
			    	var data = this.sellerAgentData;
			    	var sellerAgentTemplate = _.template(sellerAgentPage);
			    	
			    	$('#sellerAgentDiv').html('');
			    	$('#sellerAgentDiv').html(sellerAgentTemplate({}));
			    	
			    	if(!jQuery.isEmptyObject(data))
			    	{
				    	if(!jQuery.isEmptyObject(data.agentName)){
				    		 $('input[name=agentName]').val(data.agentName);
				    	}else{
				    		$('input[name=agentName]').val('');
				    	}
				    	if(!jQuery.isEmptyObject(data.agentEmail)){
				    		 $('input[name=agentEmail]').val(data.agentEmail);
				    	}else{
				    		$('input[name=agentEmail]').val('');
				    	}
				    	if(!jQuery.isEmptyObject(data.agentPhone)){
				    		 $('input[name=agentPhone]').val(data.agentPhone);
				    	}else{
				    		$('input[name=agentPhone]').val('');
				    	}
			    	}
			    	 
			    	this.sellerAgentFormValidation($('#sellerAgentDiv').find("form"));
			    	$("#sellerAgent").modal("show");
			 },
			 fetchSellerAgentData:function(){
				 var self = this;
				 var investmentId = this.investmentId;
				 $.ajax({
						url: app.context()+'/closing/getSellerAgentData/'+investmentId,
		                contentType: 'application/json',
		                async : false,
		                dataType:'json',
		                type: 'GET',
		                success: function(res){
		                	self.sellerAgentData=res;
		                },
		                error: function(res){
		                	
		                }
						
					});
			 },
			 saveSellerAgent:function(){
					var self = this;

					if($('#sellerAgentForm').validate().form()){
						var agentModel=new closingModel();
						var unindexed_array = $('#sellerAgentForm').serializeArray();
						$.map(unindexed_array, function(n, i){
							var value=n['value'];
							var name=n['name'];
							agentModel.set(name,value);
						});
						agentModel.set("investmentId",this.investmentId);

						$.blockUI({
							baseZ: 999999,
							message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
						});
						$.ajax({
				                url: app.context()+'/closing/saveOrUpdateSellerAgent',
				                async:true,
				                contentType: 'application/json',
				                dataType:'json',
				                type: 'POST',
				                data: JSON.stringify(agentModel.attributes),
				                success: function(res){
				                	$.unblockUI();
				                	$("#sellerAgent").modal("hide");
				                	self.refreshTransactionMembers();
				                	$('#transMemsSuccessMsg').show();
									$('#transMemsSuccessMsg > text').html("Successfully updated seller agent.");
							        App.scrollTo($('#transMemsSuccessMsg'), -200);
							        $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
				                	self.refreshContactsTab();
				                },
								error   : function ( mod, res ) {
									$.unblockUI();
//									var error1 = $('#sellerAgentFormFailure');
//									error1.show();
//			                    	App.scrollTo(error1, -200);
//			                    	error1.delay(2000).fadeOut(2000);
			                    	$('#transMemsFailureMsg').show();
									$('#transMemsFailureMsg > text').html("Error in updating seller agent.");
							        App.scrollTo($('#transMemsFailureMsg'), -200);
							        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);
									
								}
						});
					}

				},
				sellerAgentFormValidation:function(currentForm){
					var form1 = currentForm;

					form1.validate({
						errorElement: 'span', //default input error message container
						errorClass: 'help-block', // default input error message class
						focusInvalid: false, // do not focus the last invalid input
						ignore: "",
						rules: {
							agentName: {
								required: true
							},
							agentPhone: {
								number:true,
								required: true
							},
							agentEmail: {
								required: true,
								email: true
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
				contactEditDeleteListener:function(){
					var self = this;
					this.fetchSellerAgentData();
					var data = self.sellerAgentData;//after fetchSellerAgentData
			    	if(!jQuery.isEmptyObject(data.agentName)){
			    		self.$el.find('#sellerAgentName').html(data.agentName);
			    	}else{
			    		self.$el.find('#sellerAgentName').html('');
			    	}
				},
				refreshContactsTab:function(){
					if(app.closingView.contactView){
						app.closingView.contactView.render();
					}
				},
				ownershipTypeSuccessListener:function(){
					this.refreshClosingHeader();
					this.refreshContactsTab();
				},
				ownershipTypeFailureListener:function(){
				   	$('#ownershipFailure').show();
	    			App.scrollTo($('#ownershipFailure'), -200);
	                $('#ownershipFailure').delay(2000).fadeOut(2000);
				},
				
				fetchOtherInvestments: function(evt){
					evt.preventDefault();
					evt.stopPropagation();
					
					var otherInvestments;
					var self=this;
					var investorId=$(evt.target).data('investorid');
					var investmentId=$(evt.target).data('investmentid');
					var isVisible=$(evt.target).data('show');
					
					if(isVisible == true){
						this.model.getOtherInvestments(investorId,investmentId,{
							success : function ( model, res ) {
								otherInvestments = res;
							},
							error: function (model,res){
								console.log("Fetching all other investments for closing failed");
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
//						$('.investment-popover').attr("data-content",self.getInvestmentsHtml(otherInvestments));
//						$('.investment-popover').popover("show");
//						$(evt.target).data('show',false);
//					}
//					else{
//						$('.investment-popover').popover("hide");
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
				drawAdminBtns: function(){
					var self = this;
					var closingStatus = self.model.attributes.investmentResponse['closingStatus'];
			     	var closingAdminBtnsEl = self.$el.find('#closingAdminDiv');
			    	closingAdminBtnsEl.html("");
			    	closingAdminBtnsEl.html( _.template( closingAdminBtnsPage )());
		 
					if(closingStatus == 'Cancelled'){
						if(this.viewpermissions.ClosingReOpenShow){
							closingAdminBtnsEl.find("#openClosingBtn").show();
						}
						if(this.viewpermissions.DeleteClosingShow){
							closingAdminBtnsEl.find("#deleteClosingBtn").show();
						}
					}
					else if(closingStatus == 'Completed'){
						if(this.viewpermissions.ClosingReOpenShow){
							closingAdminBtnsEl.find("#openClosingBtn").show();
						}
					}
					else {
						if(this.viewpermissions.DeleteClosingShow){
							closingAdminBtnsEl.find("#deleteClosingBtn").show();
						}
					}
				},
				showReopenClosingModal: function(){
					var self = this;
					var modalEl = $("#closingAdminDiv #closingAdminActionModal");
					modalEl.find(".modal-title").html("Re-open Closing");
					modalEl.find("#actionDetails").html("Are you sure want to reopen this closing?");
					self.adminActionCallback = function(currentForm){
						self.adminActionFormValidation(currentForm);
						if(currentForm.validate().form()){
							var requestObj = {};
							requestObj.investmentId = self.investmentId;
							requestObj.comments = currentForm.find("textarea[name=comments]").val();

							$.blockUI({
								baseZ: 999999,
								message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
							});
							self.model.reopenClosing(requestObj,{
								success:function(res){
									self.model.attributes.investmentResponse['closingStatus'] = res.closingStatus;
									self.refreshClosingHeader();
									self.showClosingStepsTab();
									// self.drawAdminBtns();
									self.applyPermissions();
									self.setCurrentRemarks();

									$.unblockUI();
									var success1 = $('#alertReopenClosingSuccess', $('#alertsForm'));
									success1.show();
									App.scrollTo($('#alertReopenClosingSuccess'), -200);
							        $('#alertReopenClosingSuccess').delay(2000).fadeOut(2000);
									//Reload the header
								},
								error:function(){
									console.log("Failed to reopen the closing.");
									$.unblockUI();
									var error1 = $('#alertReopenClosingFailure', $('#alertsForm'));
									error1.show();
									App.scrollTo($('#alertReopenClosingFailure'), -200);
							        $('#alertReopenClosingFailure').delay(2000).fadeOut(2000);
								}
							});
							$("#closingAdminDiv #closingAdminActionModal").modal("hide");
						}
					};
					$("#closingAdminDiv #closingAdminActionModal").modal("show");
				},
				showDeleteClosingModal: function(){
					var self = this;
					var modalEl = $("#closingAdminDiv #closingAdminActionModal");
					modalEl.find(".modal-title").html("Delete Closing");
					modalEl.find("#actionDetails").html("Are you sure want to delete this closing?");
					self.adminActionCallback = function(currentForm){
						self.adminActionFormValidation(currentForm);
						if(currentForm.validate().form()){
							var requestObj = {};
							requestObj.investmentId = self.investmentId;
							requestObj.comments = currentForm.find("textarea[name=comments]").val();
							$.blockUI({
								baseZ: 999999,
								message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
							});
							self.model.deleteClosing(requestObj,{
								success:function(){
									$.unblockUI();
									var success1 = $('#alertDeleteClosingSuccess', $('#alertsForm'));
									success1.show();
									App.scrollTo($('#alertDeleteClosingSuccess'), -200);
							        $('#alertDeleteClosingSuccess').delay(2000).fadeOut(2000);
							        setTimeout(function(){app.router.navigate("myclosings",{ trigger:true, replace: true })},2000);
								},
								error:function(){
									console.log("Failed to delete the closing.");
									$.unblockUI();
									var error1 = $('#alertDeleteClosingFailure', $('#alertsForm'));
									error1.show();
									App.scrollTo($('#alertDeleteClosingFailure'), -200);
							        $('#alertDeleteClosingFailure').delay(2000).fadeOut(2000);
								}
							});
							$("#closingAdminDiv #closingAdminActionModal").modal("hide");
						}
					};
					$("#closingAdminDiv #closingAdminActionModal").modal("show");
				},
				submitAdminAction: function(){
					var self = this;
					var form = $("#closingAdminActionModal").find("form");
					self.adminActionCallback(form);
				},
				adminActionFormValidation :function(currentForm){
					var form1 = currentForm;
					form1.validate({
						errorElement: 'span', //default input error message container
						errorClass: 'help-block', // default input error message class
						focusInvalid: false, // do not focus the last invalid input
						ignore: "",
						rules: {
							comments:{
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
				closePopover:function(evt) {
					// if($(evt.currentTarget).data("item") === "msg") {
						$(evt.currentTarget).closest(".with-popover").find(".tooTip-shown").popover("hide");
						$(evt.currentTarget).closest(".with-popover").find(".tooTip-shown").data('show',true);
						$(evt.currentTarget).closest(".with-popover").find(".tooTip-shown").removeClass("tooTip-shown");
					// }
				},
				 showRehabVendorModal: function(){
			    	 var self=this;
					 var usersDropdownTemplate = _.template(rehabVendorPage);
					 this.fetchRehabVendorsAndServices();
					 $('#rehabVendorDiv').html(usersDropdownTemplate({name:'rehabVendor',id:'rehabVendor',users:self.rehabVendors,addBlankFirstOption:true}));
					 //$('#rehabVendorDiv').css({"margin-right":"280px","margin-bottom":"10px"});
					 //$('select[id=insuranceVendorDropdown]').val(investmentProps.insuranceVendorId);
					 $("#rehabVendor").modal("show");
				 },
				 fetchRehabVendorsAndServices:function(){
			         var self = this;
			         $.ajax({
			           url: app.context() + '/company/rehabVendorsAndServices',
			           contentType: 'application/json',
			           type: 'GET',
			           async:false,
			           success: function(res){
			            self.rehabVendors=res.rehabVendors;
			           },
			           error: function(res){
			        	   self.rehabVendors=[];
			           }
			         });
			     },
				 saveRehabVendor : function(){
					 var self=this;
					 self.vendorId=$('#rehabVendorDiv').find('[name=rehabVendor] option:selected').val();
					 
					 $.ajax({
						 url: app.context()+'/rehab/saveRehabVendor/'+self.initialRehabId+'/'+self.vendorId,
			             contentType: 'application/json',
			             async : false,
			             dataType:'text',
			             type: 'GET',
			             success: function(res){
			            	 
			            	$("#rehabVendor").modal("hide");
			             	$("#rehabVendor").on('hidden.bs.modal', function (e) {
			             		self.renderTransactionMembers();
			             		$('#transMemsSuccessMsg').show();
								$('#transMemsSuccessMsg > text').html("Successfully updated rehab vendor.");
							    App.scrollTo($('#transMemsSuccessMsg'), -200);
							    $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
			             	});
			             },
			             error: function(res){
			            	$("#rehabVendor").modal("hide");
			            	self.renderTransactionMembers();
			             	$('#transMemsFailureMsg').show();
							$('#transMemsFailureMsg > text').html("Error in updating rehab vendor.");
					        App.scrollTo($('#transMemsFailureMsg'), -200);
					        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);

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
					
					if(!app.closingView.investorDepositView){
						app.closingView.investorDepositView = new investorDepositView({navPermission:this.navPermission});
					}
					app.closingView.investorDepositView.depositDataModel.investorId = self.model.attributes.investmentResponse.investorId;
					app.closingView.investorDepositView.depositDataModel.parentObject = "Investment";
					app.closingView.investorDepositView.setElement(self.$el.find('#investorDepositDiv')).fetchInvestorDepositData();
				}
	 });
	 return ClosingView;
});
