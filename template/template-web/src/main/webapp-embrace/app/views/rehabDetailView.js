define([ "backbone", "app","text!templates/rehabDetail.html", "text!templates/rehabDetailHeader.html",
         "models/rehabDetailModel","text!templates/completionStatus.html",
         "text!templates/ClosingCarousel.html","text!templates/rehabImportantDates.html",
         "text!templates/transactionMembersRehab.html","text!templates/usersDropdown.html",
         "views/documentTooltipView","views/contactView","views/documentView","views/messagesView",
         "collections/messagesCollection","collections/documentCollection","collections/contactCollection",
         "text!templates/rehabFinancialInformation.html","views/rehabItemsView","views/rehabStepsView",
         "text!templates/rehabVendor.html", "views/genericPhotosTabView","views/currentRemarksView",
         "views/investorDepositView","text!templates/rehabDateEditModal.html","views/initiateMarketingView",
         "views/homeWarrantyEditView","views/transactionMemberView",
         "jcarousel"],
         function(Backbone, app,rehabDetailPage, rehabHeaderPage,rehabDetailModel,
        		 completionStatusPage,closingCarouselPage,impDatesPage,transMemsPage,
        		 usersDropdown,documentTooltipView,contactView,documentView,messagesView,messagesCollection,
        		 documentCollection,contactCollection,financialInfoPage,rehabItemsView,rehabStepsViewObj,
        		 rehabVendorPage,genericPhotosTabView,currentRemarksView,investorDepositView,rehabDateEditModal,
        		 initiateMarketingModalView,homeWarrantyEditView,transactionMemberView,
        		 jcarousel){

	var RehabDetailView = Backbone.View.extend( {
		initialize: function(options){
			this.navPermission = options.navPermission;
			// this.fetchStates();
			//this.lendersView = new lendersView();
			// this.codesView = new codesView({codeGroup:'MORT_STATUS'});
		
	
		},
		model:new rehabDetailModel(),
		el:"#maincontainer",
		states:{},
		propertyModel:{},
		propertyUnits:{},
		rehabId:null,
		adminActionCallback:{},
		events          : {
			 "click #rehabItems":"showRehabItemsTab",
			 "click #rehabContact":"showRehabContactsTab",
			 "click #rehabPhotos":"showRehabPhotosTab",
			 "click #rehabDocuments":"showRehabDocumentTab",
			 "click #rehabMessages" :"showRehabMessageTab",
			 "click #rehabSteps":"showRehabStepsTab",
			 //"click #transmem-edit":"openUserDropdownModal",
			 //"click #save-trans-mem":"saveTransactionMember",
			 //"click #rehabVendorEdit":"showRehabVendorModal",
			 //"click #save-rehab-vendor":"saveRehabVendor",
			 "click #rehabDateEdit":"showRehabDateEditModal",
			 "click #rehabDateEditSubmitButton":"submitRehabDateEditForm",
			 "click a[href='assetsInitiateMarketing']":"loadInitiateAssetMarketing",
			 "click #editHomeWarranty":"showEditHomeWarranty"
		},

		render : function (options) {
			if(!app.documentTooltipView){
				app.documentTooltipView=new documentTooltipView();
			}

			this.rehabId = options.rehabId;
			this.fetchRehabData(this.rehabId);
			this.rehabInvestmentId=this.model.get("investmentResponse").investmentId;
			this.rehabPropertyId = this.model.get("propertyResponse").propertyId;

			this.template = _.template( rehabDetailPage );
			this.$el.html("");
			this.$el.html(this.template({rehabData:this.model.attributes}));
			//this.renderCompletionStatus();
			this.renderHeader();
			this.renderImageCarousel();
			/*this.renderFinancialInfo();
			this.renderImpDates();
			this.renderTransactionMembers();*/
			$('.showButtons').hide();
			//this.showRehabItemsTab();
			//this.drawHeaderBtns();
			// this.drawAdminBtns();
			this.showRehabStepsTab();
			//this.applyPermissions();

			//this.scrollPageUp();

			if(options.taskKey){
				$('a[data-taskkey='+options.taskKey+']').click();
			}

			$('#collapseOne').on('shown.bs.collapse hidden.bs.collapse', function () {
				$('#rehabHeaderAccordion').find('.icon-toggle i').toggleClass('fa-chevron-up fa-chevron-down');
			});

			$('.investment-popover').popover({
				trigger: 'manual',   
//				content: self.getInvestmentsHtml(otherInvestments),
				html: true
			});
			 this.setCurrentRemarks();

			return this;
		},

		fetchRehabData : function(rehabId) {
			var self= this;
			this.model.getRehabInfo(rehabId,
					{	success : function ( model, res ) {
						self.model.clear();
						self.model.set(res);
					},
					error   : function ( model, res ) {
						$('#rehabErrorMessage').html('Error in fetching rehab information');
					}
					});
		},

		renderCompletionStatus:function(){
			var self = this;
			this.headerTemplate = _.template( completionStatusPage );
			this.fetchCompletionStatus();
			$('#rehabCompletionStatusDiv').html('');
			$('#rehabCompletionStatusDiv').html(this.headerTemplate({percent:this.percent}));
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

		renderHeader : function () {
			var self = this;
			this.headerTemplate = _.template( rehabHeaderPage );
			var headerEl = this.$el.find('#rehabDetailHeader');
			this.fetchRehabHeaderData();
			headerEl.html("");
			headerEl.html(this.headerTemplate({rehabData:this.rehabHeaderData}));
			$(".amount").formatCurrency();
			app.currencyFormatter();
			ComponentsPickers.init();
			//self.drawAdminBtns();
			
			self.renderFinancialInfo();
			self.renderImpDates();
			self.renderTransactionMembers();
			self.checkIfAssetMarketed(this.rehabHeaderData.investmentResponse.isMarketed);
			return this;
		},

		fetchRehabHeaderData:function(){
			var self = this;
			var rehabId = this.rehabId;
			
			this.rehabVendorId=this.model.get("rehabVendorId");
			this.rehabVendorName=this.model.get("rehabVendorName");
			
			$.ajax({
				url: app.context()+'/rehab/getRehabHeaderInfo/'+rehabId,
				contentType: 'application/json',
				async : false,
				dataType:'json',
				type: 'GET',
				success: function(res){
					self.rehabHeaderData=res;
					self.rehabVendorId=res.rehabVendorId;
					self.rehabVendorName=res.rehabVendorName;
				},
				error: function(res){

				}

			});
		},

		renderImageCarousel:function(){
			var self = this;
			var closingCarouselTemplate = _.template( closingCarouselPage );
			var carouselEl = this.$el.find('#rehabcarouselDiv');
			carouselEl.html("");
			$.ajax({
				url: app.context()+'property/getPropertyImageList/'+self.rehabHeaderData.propertyResponse.propertyId,
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

		renderImpDates:function(){
			var self = this;
			this.impDatesTemplate = _.template( impDatesPage );
			var impDatesEl = this.$el.find('#impDatesDiv');
			//this.fetchImpDates();
			impDatesEl.html("");
			impDatesEl.html(this.impDatesTemplate({investmentResponse:this.rehabHeaderData.investmentResponse,rehabData:this.rehabHeaderData}));
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
//							$(estEndDatePicker[0]).val(month+"-"+selectedDate.getDate()+"-"+selectedDate.getFullYear());
						}
						estEndDatePickerWidget.datepicker('setStartDate', selectedDate);
					}
					var endDatePicker = self.currentForm.find('[name=closingEndDate]');
					if(endDatePicker.length>0) {
						var endDatePickerWidget = $(endDatePicker[0]).parent();
						var endDate = endDatePickerWidget.datepicker("getDate");
						if(endDate<selectedDate) {
							endDatePickerWidget.data({date: selectedDate}).datepicker('update');
							var month = selectedDate.getMonth()+1;
							if(String(month).length<2) {
								month = '0'+month;
							}
//							$(endDatePicker[0]).val(month+"-"+selectedDate.getDate()+"-"+selectedDate.getFullYear());
						}
						endDatePickerWidget.datepicker('setStartDate', selectedDate);
					}
				});
			}

			ComponentsPickers.init();
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
		renderTransactionMembers:function(){
			var object="Rehab";
			var self=this;
			if(app.closingView && app.closingView.transactionMemberView){
				app.closingView.transactionMemberView.close();
				app.closingView.transactionMemberView.remove();
			}
			else if(app.assetMarketingDetailsView && app.assetMarketingDetailsView.transactionMemberView){
				app.assetMarketingDetailsView.transactionMemberView.close();
				app.assetMarketingDetailsView.transactionMemberView.remove();
			}
			else if(app.mypropertyView && app.mypropertyView.transactionMemberView){
				app.mypropertyView.transactionMemberView.close();
				app.mypropertyView.transactionMemberView.remove();
			}
			
			if(!app.rehabDetailView.transactionMemberView){
				app.rehabDetailView.transactionMemberView=new transactionMemberView({});
			}
			app.rehabDetailView.transactionMemberView.object=object;
			app.rehabDetailView.transactionMemberView.objectId=self.rehabId ;
			app.rehabDetailView.transactionMemberView.investmentId=self.rehabInvestmentId;
			
			app.rehabDetailView.transactionMemberView.setElement($('#transMemsDiv')).render();
		},
		fetchTransactionMembers:function(){
			var self = this;
			var rehabId = this.rehabId;
			var rehabObject='Rehab';
			$.ajax({
				url: app.context()+'/transactionMembers/get/'+rehabObject+'/'+rehabId,
				contentType: 'application/json',
				async : false,
				dataType:'json',
				type: 'GET',
				success: function(res){
					self.transMemsData=res;
				},
				error: function(res){

				}

			});
		},

		renderFinancialInfo:function(){
			var self = this;
			this.financialInfoTemplate = _.template( financialInfoPage );
			var financialInfoEl = this.$el.find('#financialInfoDiv');
			//this.fetchFinancialInfo();
			financialInfoEl.html("");
			financialInfoEl.html(this.financialInfoTemplate({investmentResponse:this.rehabHeaderData.investmentResponse,rehabData:this.rehabHeaderData}));
			$('#financial-edit').hide();

			$(".amount").formatCurrency();
			app.currencyFormatter("$","currencyInsurance");
			self.loadInvestorDepositView();
			ComponentsPickers.init();

		},
		fetchFinancialInfo:function(){
			var self = this;
			var rehabId = this.rehabId;
			$.ajax({
				url: app.context()+'/rehab/getFinancialInformation/'+rehabId,
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
		showRehabItemsTab:function(){
			var self = this;
			self.removeActiveTab();

			if(!app.rehabDetailView.rehabItemsView){
				app.rehabDetailView.rehabItemsView = new rehabItemsView();
				self.listenTo(app.rehabDetailView.rehabItemsView, 'RehabItemsSaved', self.renderHeader);
			}
			app.rehabDetailView.rehabItemsView.collection.rehabId=self.rehabId;

			/*
			 * Below value should be set only after calling renderHeader().
			 */
			app.rehabDetailView.rehabItemsView.collection.propertyName=self.rehabHeaderData.propertyResponse.propertyDisplayId;
			/*app.rehabDetailView.rehabItemsView.collection.object=this.propertyModel.object;*/
			app.rehabDetailView.rehabItemsView.setElement($('#rehabItemsTab')).fetchRehabDatas();


			self.$el.find("#rehabItems").parent().addClass('active')
			self.$el.find("#rehabItemsTab").addClass("active");	
			return this;
		},
		showRehabContactsTab: function(){
			var thisPtr=this;
			var object="Rehab";
			//TODO change the object to REhab
			this.removeActiveTab();
			if(app.mypropertyView && app.mypropertyView.contactView){
				app.mypropertyView.contactView.close();
				app.mypropertyView.contactView.remove();
			}
			if(app.closingView && app.closingView.contactView){
				app.closingView.contactView.close();
				app.closingView.contactView.remove();
			}
			
			if(!app.rehabDetailView.contactView){
				app.rehabDetailView.contactView=new contactView({collection:new contactCollection()});
				
			}

			
			app.rehabDetailView.contactView.collection.objectId=thisPtr.rehabId;
			app.rehabDetailView.contactView.collection.object=object;
			app.rehabDetailView.contactView.object=object;
			app.rehabDetailView.contactView.objectId=thisPtr.rehabId;
			
			app.rehabDetailView.contactView.setElement($('#contactsTab')).render();
			$("#contact").parent().addClass('active');
			$("#contactsTab").addClass("active");	
			//this.applyPermissions();
			return this;
			
	},
	
	showRehabDocumentTab: function(){
		var thisPtr=this;
		var object="Rehab";
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
		
		if(app.mypropertyView && app.mypropertyView.documentView){
			app.mypropertyView.documentView.close();
			app.mypropertyView.documentView.remove();
			
		}
		if(!app.rehabDetailView.documentView){
			app.rehabDetailView.documentView=new documentView({collection: new documentCollection()});
			
		}
		app.rehabDetailView.documentView.object=object;
		app.rehabDetailView.documentView.objectId=thisPtr.rehabId;
		app.rehabDetailView.documentView.setElement($('#rehabDocumentsTab')).fetchDocument();
		$("#rehabDocuments").parent().addClass('active')
		$("#rehabDocumentsTab").addClass("active");	
		//this.applyPermissions();
	},
	
	
	showRehabMessageTab:function(evt){
		var thisPtr=this;
		var object="Rehab";
		this.removeActiveTab();
		if(app.closingView && app.closingView.messagesView)
		{
		
		app.closingView.messagesView.propertyModel = {};
		app.closingView.messagesView.close();
		app.closingView.messagesView.remove();
		
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
		
		if(app.mypropertyView && app.mypropertyView.messagesView){
			app.mypropertyView.messagesView.propertyModel.clear();
			app.mypropertyView.messagesView.close();
			app.mypropertyView.messagesView.remove();
		}
		
		if(!app.rehabDetailView.messagesView){
			app.rehabDetailView.messagesView=new messagesView({collection:new messagesCollection()});
		}
		
		
		app.rehabDetailView.messagesView.propertyModel.objectId=this.rehabId;
		app.rehabDetailView.messagesView.propertyModel.object=object;
		app.rehabDetailView.messagesView.propertyModel.propertyId = this.model.attributes.propertyResponse.propertyId;
		app.rehabDetailView.messagesView.collection.object=object;
		app.rehabDetailView.messagesView.collection.objectId=this.rehabId;
		
		app.rehabDetailView.messagesView.setElement($('#rehabMessagesTab')).fetchMessages();
		$("#rehabMessages").parent().addClass('active')
		$("#rehabMessagesTab").addClass("active");
		//this.applyPermissions();
		return this;
	},
	
	
	
	 removeActiveTab:function(){
   	 $("li[name=rehabNav].active").removeClass("active");
   	 $('div[name=rehabInfoTab].active').empty().removeClass("active");
    },
    
    applyPermissions : function() {
		if($.inArray('RehabManagement', app.sessionModel.attributes.permissions)==-1) {
		/*	$("#provideRehabEstimateButton").remove();
			$("button[id$=PopupSubmitButton]").remove();
			$('a[href="#cancelClosing"]').remove();*/
		
		
	
		}
	},
	showRehabStepsTab:function() {
     	var self = this;
    	 this.removeActiveTab();
	  	 if(!this.rehabStepsView){
	  		this.rehabStepsView=new rehabStepsViewObj();
	  		self.listenTo(self.rehabStepsView, 'RefreshRehabHeader', self.renderHeader);
		 }
		app.rehabDetailView.rehabStepsView.objectId = this.rehabId;
		app.rehabDetailView.rehabStepsView.object = "Rehab";
		//app.closingView.rehabStepsView.closingStatus = this.model.attributes.investmentResponse.closingStatus;
		
	  	 this.rehabStepsView.setElement($('#rehabStepsTab')).render({parentView:this});
		 $("#rehabSteps").parent().addClass('active')
		 $("#rehabStepsTab").addClass("active");
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
                	self.rehabUsers=res;
                },
                error: function(res){
                }
				
			});
	 },

	 openUserDropdownModal: function(evt){
		 var self=this;
		 var currTarget=$(evt.currentTarget);
		 
		 self.processRoleId=currTarget.data("processroleid");
		 //self.currentTranMemberTarget=currTarget;
		 var roleName=currTarget.data('rolename');
		 self.fetchUsersByRoleName(roleName);
		 
		 var usersDropdownTemplate = _.template(usersDropdown);
		 
		 $('#rehabCoordinatorDiv').html(usersDropdownTemplate({name:'rehabUser',id:'rehabUser',users:self.rehabUsers,addBlankFirstOption:true,investorName:null}));
		 $('#rehabCoordinatorDiv').css({"margin-right":"280px","margin-bottom":"10px"});
		 //$('select[id=insuranceVendorDropdown]').val(investmentProps.insuranceVendorId);
		 if(roleName!='Rehab Coordinator'){
			 $('#rehabCoordinator').find('.modal-title').html("Junior Rehab Coordinator");
		 }
		 else{
			 $('#rehabCoordinator').find('.modal-title').html("Senior Rehab Coordinator");
		 }
		 
		 $("#rehabCoordinator").modal("show");
	 },

	 saveTransactionMember : function(){
		 var self=this;
		 self.userId=$('#rehabCoordinatorDiv').find('[name=rehabUser] option:selected').val();
		 $.ajax({
			 url: app.context()+'/transactionMembers/save/'+self.processRoleId+'/'+self.userId,
             contentType: 'application/json',
             async : false,
             dataType:'text',
             type: 'GET',
             success: function(res){
            	 
            	$("#rehabCoordinator").modal("hide");
             	$("#rehabCoordinator").on('hidden.bs.modal', function (e) {
             		self.renderTransactionMembers();
             		self.showRehabStepsTab();
             		$('#transMemsSuccessMsg').show();
					$('#transMemsSuccessMsg > text').html("Successfully updated rehab co-ordinator.");
				    App.scrollTo($('#transMemsSuccessMsg'), -200);
				    $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
             	});
             },
             error: function(res){
            	$("#rehabCoordinator").modal("hide"); 
            	self.renderTransactionMembers();
             	$('#transMemsFailureMsg').show();
				$('#transMemsFailureMsg > text').html("Error in updating rehab co-ordinator.");
		        App.scrollTo($('#transMemsFailureMsg'), -200);
		        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);

             }
			});
	 },
	 
	 fetchSellerAgentData:function(){
		 var self = this;
		 var investmentId = self.rehabInvestmentId;
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
	 
     showRehabVendorModal: function(){
    	 var self=this;
		 var usersDropdownTemplate = _.template(rehabVendorPage);
		 this.fetchRehabVendorsAndServices();
		 $('#rehabVendorDiv').html(usersDropdownTemplate({name:'rehabVendor',id:'rehabVendor',users:self.rehabVendors,addBlankFirstOption:true}));
		 //$('#rehabVendorDiv').css({"margin-right":"280px","margin-bottom":"10px"});
		 //$('select[id=insuranceVendorDropdown]').val(investmentProps.insuranceVendorId);
		 $("#rehabVendor").modal("show");
	 },
	 
	 saveRehabVendor : function(){
		 var self=this;
		 self.vendorId=$('#rehabVendorDiv').find('[name=rehabVendor] option:selected').val();
		 
		 $.ajax({
			 url: app.context()+'/rehab/saveRehabVendor/'+self.rehabId+'/'+self.vendorId,
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

	 showRehabPhotosTab: function(){
	 	console.log("showRehabPhotosTab");
	 	var self = this;
    	 this.removeActiveTab();
    	 console.log("makinggenerivphotostabview");
	  	 if(!this.genericPhotosTabView){
	  		this.genericPhotosTabView = new genericPhotosTabView();
		 }
		 console.log("...success");
		 this.genericPhotosTabView.objectId= this.rehabId;
		 this.genericPhotosTabView.object="Rehab";
		 this.genericPhotosTabView.parentId = this.rehabInvestmentId;
		 this.genericPhotosTabView.propertyId = this.rehabPropertyId;
		// app.rehabDetailView.rehabStepsView.objectId = this.rehabId;
		// app.rehabDetailView.rehabStepsView.object = "Rehab";
		//app.closingView.rehabStepsView.closingStatus = this.model.attributes.investmentResponse.closingStatus;
		
	  	 this.genericPhotosTabView.setElement($('#rehabPhotosTab')).render({parentView:this});
		 $("#rehabPhotos").parent().addClass('active')
		 $("#rehabPhotosTab").addClass("active");

	 },
	setCurrentRemarks : function(){
	  	 if(!this.currentRemarksView){
 	  		this.currentRemarksView=new currentRemarksView();
			 }
	  	 	app.rehabDetailView.currentRemarksView.setElement($("#currentRemarks"));
			app.rehabDetailView.currentRemarksView.propertyModel.objectId = this.rehabId;
			app.rehabDetailView.currentRemarksView.propertyModel.object = "509";
			app.rehabDetailView.currentRemarksView.propertyModel.messageType = "REHAB_REMARKS";
			this.currentRemarksView.fetchRemarks();
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
		if(app.investorProfileView && app.investorProfileView.investorDepositView){
			app.investorProfileView.investorDepositView.depositDataModel.clear();
			app.investorProfileView.investorDepositView.close();
			app.investorProfileView.investorDepositView.remove();
		}
		
		if(!app.rehabDetailView.investorDepositView){
			app.rehabDetailView.investorDepositView = new investorDepositView({navPermission:this.navPermission});
		}
		app.rehabDetailView.investorDepositView.depositDataModel.investorId = self.model.get("investmentResponse").investorId;
		app.rehabDetailView.investorDepositView.depositDataModel.parentObject = "Rehab";
		app.rehabDetailView.investorDepositView.setElement(self.$el.find('#investorDepositDiv')).fetchInvestorDepositData();
	},
	
	showRehabDateEditModal: function(){
		 var self=this;
		 var rehabEditModal = _.template(rehabDateEditModal);
		 $("#renderDateEditModal").html(rehabEditModal);
		 
		 var formElement=$("#rehabDateEditPopup").find(".milestone-form");
		 
		 ComponentsPickers.init();
		 formElement.find("#estimatedStartDate").parent().data({date:this.rehabHeaderData.estimatedRehabStartDate }).datepicker('update');
		 formElement.find("#estimatedEndDate").parent().data({date: this.rehabHeaderData.estimatedRehabCompletionDate}).datepicker('update');
		 formElement.find("#investorEstimatedEndDate").parent().data({date: this.rehabHeaderData.investorEstimatedEndDate}).datepicker('update');
		 formElement.find("#estimatedStartDate").val(this.rehabHeaderData.estimatedRehabStartDate);
		 formElement.find("#estimatedEndDate").val(this.rehabHeaderData.estimatedRehabCompletionDate);
		 formElement.find("#investorEstimatedEndDate").val(this.rehabHeaderData.investorEstimatedEndDate);
		 this.rehabDateEditFormValidation();
		 $("#rehabDateEditPopup").modal("show");
	},
	
	submitRehabDateEditForm: function(evt){
		var self=this;
		var rehabId=this.rehabId;
		var popUp=$("#rehabDateEditPopup");
		var postData={};
		var formElement=$("#rehabDateEditPopup").find(".milestone-form");
		var unindexed_array = formElement.serializeArray();
		$.map(unindexed_array, function(n, i){
			var value=n['value'];
			var name=n['name'];
			postData[name]=value;
		});
		
		if(formElement.validate().form()) {
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			
			$.ajax({
	             url: app.context()+'/rehab/modifyRehabDate/'+rehabId,
	             contentType: 'application/json',
	             dataType:'json',
	             type: 'PUT',
	             async: true,
	             data: JSON.stringify(postData),
	             success: function(res){
	            	 $.unblockUI();
	            	 popUp.modal('hide');
	            	 console.log(res);
	            	 popUp.on('hidden.bs.modal', function (e) {
	            		 self.renderHeader();
	            	 });
	             },
	             error: function(res){
	            	 $.unblockUI();
	            	 popUp.modal('hide');
	            	 console.log(res);
	            	 popUp.on('hidden.bs.modal', function (e) {
	            		 self.renderHeader();
	            	 });
	             }
	         });
		}
	},
	
	loadInitiateAssetMarketing: function() {
		if(app.mypropertyView && app.mypropertyView.initiateMarketingView){
			app.mypropertyView.initiateMarketingView.close();
			app.mypropertyView.initiateMarketingView.remove();
		}
		
		if(!app.rehabDetailView.initiateMarketingView){
			app.rehabDetailView.initiateMarketingView = new initiateMarketingModalView();
		}
		app.rehabDetailView.initiateMarketingView.setElement($("#initiateMarketingDiv"));
		app.rehabDetailView.initiateMarketingView.propertyModel.objectId = this.rehabHeaderData.investmentResponse.investmentId;
		app.rehabDetailView.initiateMarketingView.propertyModel.object = "Investment";
		app.rehabDetailView.initiateMarketingView.propertyModel.objectCodeListId = "49";
		app.rehabDetailView.initiateMarketingView.propertyModel.assetId = this.rehabHeaderData.investmentResponse.assetId;
		app.rehabDetailView.initiateMarketingView.render();
     },
     
     checkIfAssetMarketed: function(isAssetMarketed) {
			if(isAssetMarketed == "Y")
				$("a[href='assetsInitiateMarketing']").addClass("disabled");
			else
				$("a[href='assetsInitiateMarketing']").removeClass("disabled");
	},
	rehabDateEditFormValidation:function(){
		var form1 =  $('.milestone-form');

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
	showEditHomeWarranty: function(){
		var self = this;
		if(!self.homeWarrantyEditView){
			self.homeWarrantyEditView = new homeWarrantyEditView();
			self.listenTo(self.homeWarrantyEditView,"Home_Warranty_Edited",self.renderHeader);
		}
		self.homeWarrantyEditView.homeWarrantyModel.investmentId = this.model.get("investmentResponse").investmentId;
		self.homeWarrantyEditView.setElement($("#homeWarrantLoadDiv")).fetchWarrantyInformation();
	}

	});
	return RehabDetailView;
});
