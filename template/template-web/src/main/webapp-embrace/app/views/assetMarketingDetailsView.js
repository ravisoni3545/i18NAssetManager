define( ["backbone","app","text!templates/assetMarketingDetails.html","text!templates/assetMarketingDetailsData.html",
		 "views/contactView","collections/contactCollection","views/documentView","collections/documentCollection",
		 "views/messagesView","collections/messagesCollection","views/marketingStepsView","text!templates/marketingDtlsCarousel.html","views/codesView"
		 ,"text!templates/transactionMembersMarketing.html","text!templates/usersDropdown.html", "views/genericPhotosTabView",
		 "views/currentRemarksView","views/transactionMemberView"],
		function(Backbone,app,marketingDetailsPage,marketingDetailsData,contactView,
       		 contactCollection,documentView,documentCollection,messagesView,messagesCollection, marketingStepsView, mktDtlsCarousel, codesView, transMemsPage,
       		 usersDropdown, genericPhotosTabView,currentRemarksView,transactionMemberView){
	
	var AssetMarketingDetailsView = Backbone.View.extend( {
		initialize: function(options){
			
		},
		events:{
			"click #marketingContact":"showContactsTab",
			"click #marketingDocuments":"showMarketingDocumentTab",
			"click #marketingMessages":"showMarketingMessagesTab",
			//"click #marketingCalendar":"showCalendarTab",
			"click #mkt_dtls_save_btn":"handleSaveClick",
			"click #targetRentPopupSaveBtn":"saveTargetRent",
			"click #get-details-for-date": "getDateDetails",
			"click #showRentHistoryModal": "showRentHistory",
			"click #marketingSteps":"showMarketingStepsTab",
			//"click #transmem-edit":"openUserDropdownModal",
			//"click #save-trans-mem":"saveTransactionMember",
			"click #showChangeRentModal": "changeRentModalInit",
			"click #marketingPhotos": "showMarketingPhotosTab"
		},
		el:"#maincontainer",
		render : function (options) {
			var thisPtr = this;
			if(thisPtr.marketingDetailsResponse){
				thisPtr.marketingDetailsResponse = null;
			}
			thisPtr.marketingId = options.marketingId;
			thisPtr.template = _.template(marketingDetailsPage);
			thisPtr.$el.html("");
			thisPtr.$el.html(thisPtr.template({app:app}));
			thisPtr.getDetailsData(thisPtr.marketingId);
			thisPtr.showMarketingStepsTab();
			thisPtr.marketingInvestmentId = 
			_.defer(function () {
			});
			if(options.taskKey){
	     		$('a[data-taskkey='+options.taskKey+']').click();
	     	}
		},
		
		getDetailsData : function(){
			var thisPtr = this;
        	
			$.ajax({
                url: 'assetMarketing/assets/' + thisPtr.marketingId,
				dataType:'json',
                type: 'GET',
                async:true,
                success: function(res){
	                if(res.statusCode=="200") {
	                	thisPtr.marketingDetailsResponse =res;
	                	thisPtr.marketingAssetId = thisPtr.marketingDetailsResponse.assetId;
	                	thisPtr.marketingInvestmentId=thisPtr.marketingDetailsResponse.closingId;
                		thisPtr.marketingPropertyId= thisPtr.marketingDetailsResponse.propertyId;
	                	if(!thisPtr.marketingDetailsResponse.leadsThisWeek)
	                		thisPtr.marketingDetailsResponse.leadsThisWeek = 0;
	                	if(!thisPtr.marketingDetailsResponse.showingsThisWeek)
	                		thisPtr.marketingDetailsResponse.showingsThisWeek = 0;	
	                	if(!thisPtr.marketingDetailsResponse.applicationsThisWeek)
	                		thisPtr.marketingDetailsResponse.applicationsThisWeek = 0;
	                	if(!thisPtr.marketingDetailsResponse.rejectionsThisWeek)
	                		thisPtr.marketingDetailsResponse.rejectionsThisWeek = 0;
	                	if(!thisPtr.marketingDetailsResponse.upcomingShowings)
	                		thisPtr.marketingDetailsResponse.upcomingShowings = 0;
	                	if(!thisPtr.marketingDetailsResponse.totalLeads)
	                		thisPtr.marketingDetailsResponse.totalLeads = 0;
	                	if(!thisPtr.marketingDetailsResponse.totalApplications)
	                		thisPtr.marketingDetailsResponse.totalApplications = 0;
	                	if(!thisPtr.marketingDetailsResponse.totalRejections)
	                		thisPtr.marketingDetailsResponse.totalRejections = 0;
	                	if(!thisPtr.marketingDetailsResponse.totalShowings)
	                		thisPtr.marketingDetailsResponse.totalShowings = 0;	
	                	if(!thisPtr.marketingDetailsResponse.nir)
	                		thisPtr.marketingDetailsResponse.nir = "";
	                	else
	                		thisPtr.marketingDetailsResponse.nir = " NIR - " + thisPtr.marketingDetailsResponse.nir;
	                	thisPtr.showMarketingDetailsData();
	                } else {
	                	thisPtr.marketingDetailsResponse = null;
                   		thisPtr.showMarketingDetailsFailure();
	                }
                	
               },
                error: function(res){
                   thisPtr.marketingDetailsResponse = null;
                   thisPtr.showMarketingDetailsFailure();
                },
                complete: function(){
    			  thisPtr.addScrollBar();
    			  $(".amount").formatCurrency({roundToDecimalPlace: 0});
                }
            });
		},
		
		refreshMarketingHeader : function () {
	    	 // this.fetchClosingHeaderData();
	    	 this.getDetailsData();
	    },
		
		showMarketingDetailsData:function(){
			var thisPtr = this;
            this.dashboardtemplate = _.template(marketingDetailsData);
	     	var dashboardEl = this.$el.find('#marketingDetailsData');
	     	dashboardEl.html("");
	     	dashboardEl.html(this.dashboardtemplate({dtlsObj:thisPtr.marketingDetailsResponse}));
	     	
	     	if(!this.statusView) {
				this.statusView = new codesView({codeGroup:'MARK_STATUS'});
			}
	     	this.statusView.callback=function() {
	     		$("select[name=asset-marketing-status]").val(thisPtr.marketingDetailsResponse.status);
	     		if($.inArray("MarketingHeaderEdit", app.sessionModel.attributes.permissions) == -1){
         			$("select[name=asset-marketing-status]").attr("disabled", "disabled");
         		}
         		if($.inArray("MarketingHeaderEdit", app.sessionModel.attributes.permissions) != -1){
         			 $(".mkt-allow-admin-only").removeClass("disable-field-noOpacity");
         		}
			}
			this.statusView.render({el:$('#marketingStatusDiv'),codeParamName:"asset-marketing-status"});
			$("select[name=asset-marketing-status]").val(thisPtr.marketingDetailsResponse.status);
	     	
			ComponentsPickers.init();
			thisPtr.renderImageCarousel();
			this.renderTransactionMembers();
			 this.setCurrentRemarks();
		},
		
		setCurrentRemarks : function(){
			
   	  	 if(!this.currentRemarksView){
    	  		this.currentRemarksView=new currentRemarksView();
			 }
   	  	 	app.assetMarketingDetailsView.currentRemarksView.setElement($("#currentRemarks"));
			app.assetMarketingDetailsView.currentRemarksView.propertyModel.objectId = this.marketingId;
			app.assetMarketingDetailsView.currentRemarksView.propertyModel.object = "451";
			app.assetMarketingDetailsView.currentRemarksView.propertyModel.messageType = "MARKETING_REMARKS";
			this.currentRemarksView.fetchRemarks();
		},
		
		renderTransactionMembers:function(){
			/*var self = this;
			this.transMemsTemplate = _.template( transMemsPage );
			var transMemsEl = this.$el.find('#transMemsDiv');
			this.fetchTransactionMembers();
			transMemsEl.html("");
			transMemsEl.html(this.transMemsTemplate({transactionMemberResponse:this.transMemsData}));
			$('#collapseOne').on('shown.bs.collapse hidden.bs.collapse', function () {
				$('#toggleIcon').toggleClass('fa-chevron-up fa-chevron-down');
	     	});*/
			var object="Marketing";
			var self=this;
			if(app.closingView && app.closingView.transactionMemberView){
				app.closingView.transactionMemberView.close();
				app.closingView.transactionMemberView.remove();
			}
			else if(app.rehabDetailView && app.rehabDetailView.transactionMemberView){
				app.rehabDetailView.transactionMemberView.close();
				app.rehabDetailView.transactionMemberView.remove();
			}
			else if(app.mypropertyView && app.mypropertyView.transactionMemberView){
				app.mypropertyView.transactionMemberView.close();
				app.mypropertyView.transactionMemberView.remove();
			}
			
			if(!app.assetMarketingDetailsView.transactionMemberView){
				app.assetMarketingDetailsView.transactionMemberView=new transactionMemberView({});
			}
			app.assetMarketingDetailsView.transactionMemberView.object=object;
			app.assetMarketingDetailsView.transactionMemberView.objectId=self.marketingId;
			app.assetMarketingDetailsView.transactionMemberView.investmentId=self.marketingInvestmentId;
			
			
			app.assetMarketingDetailsView.transactionMemberView.setElement($('#transMemsDiv')).render();
			//$('#transMemsDiv').find(".borb").hide();
			
			$('#collapseOne').on('shown.bs.collapse hidden.bs.collapse', function () {
				$('#toggleIcon').toggleClass('fa-chevron-up fa-chevron-down');
	     	});
		},
		
		/*fetchTransactionMembers:function(){
			var self = this;
			var marketingId = this.marketingId;
			$.ajax({
				url: app.context()+'/transactionMembers/get/Marketing/'+marketingId,
				contentType: 'application/json',
				async : false,
				dataType:'json',
				type: 'GET',
				success: function(res){
					self.transMemsData=res;
				},
				error: function(res){
					console.log('Error fetching transaction members');
				}

			});
		},
		
		openUserDropdownModal: function(evt){
			 var self=this;
			 var currTarget=$(evt.currentTarget);
			 
			 self.processRoleId=currTarget.data("processroleid");
			 //self.currentTranMemberTarget=currTarget;
			 var roleName=currTarget.data('rolename');
			 var userId=currTarget.data('userid');
			 self.fetchUsersByRoleName(roleName);
			 
			 var usersDropdownTemplate = _.template(usersDropdown);
			 
			 $('#leasingCoordinatorDiv').html(usersDropdownTemplate({name:'leasingUser',id:'leasingUser',users:self.marketingUsers,addBlankFirstOption:false,investorName:null}));
			 $('#leasingCoordinatorDiv').css({"margin-right":"280px","margin-bottom":"10px"});
			 if(roleName!='Leasing Coordinator') {
				 $('#leasingCoordinator').find('.modal-title').html("Leasing Agent");
			 } else {
				 $('#leasingCoordinator').find('.modal-title').html("Leasing Coordinator");
			 }
			 $('#leasingUser').val(userId);
			 $("#leasingCoordinator").modal("show");
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
	                	self.marketingUsers=res;
	                },
	                error: function(res){
	                	console.log("Failed to fetch users for marketing");
	                }
					
				});
		 },
		
		saveTransactionMember : function(){
			 var self=this;
			 self.userId=$('#leasingCoordinatorDiv').find('[name=leasingUser] option:selected').val();
			 $.ajax({
				 url: app.context()+'/transactionMembers/save/'+self.processRoleId+'/'+self.userId,
	             contentType: 'application/json',
	             async : false,
	             dataType:'text',
	             type: 'GET',
	             success: function(res){
	            	 
	            	$("#leasingCoordinator").modal("hide");
	             	$("#leasingCoordinator").on('hidden.bs.modal', function (e) {
	             		self.renderTransactionMembers();
	             		$('#transMemsSuccessMsg').show();
						$('#transMemsSuccessMsg > text').html("Successfully updated leasing user.");
					    App.scrollTo($('#transMemsSuccessMsg'), -200);
					    $('#transMemsSuccessMsg').delay(2000).fadeOut(2000);
	             	});
	             },
	             error: function(res){
	            	$("#leasingCoordinator").modal("hide"); 
	            	self.renderTransactionMembers();
	             	$('#transMemsFailureMsg').show();
					$('#transMemsFailureMsg > text').html("Error in updating leasing user.");
			        App.scrollTo($('#transMemsFailureMsg'), -200);
			        $('#transMemsFailureMsg').delay(2000).fadeOut(2000);

	             }
				});
		 },*/
		
		handleSaveClick : function() {
			var thisPtr = this;
			var postData = {};
			postData.marketingId = thisPtr.marketingId;
			//postData.rehabType = $("#rehab-type").val();
			postData.status = $("select[name=asset-marketing-status]").val();
			postData.marketingStartDate = $("#mkt-start-dt").val();
			postData.marketingCompletionDate = $("#mkt-end-dt").val();
			postData.targetRent = $("#target-rent").val();
			postData.rentReady = $("#rent-ready-dt").val();
			postData.moveInDate = $("#move-in-dt").val();
			postData.leadsThisWeek = $("#leads-this-week").val();
			postData.showingsThisWeek = $("#showings-this-week").val();
			postData.upcomingShowings = "";
			postData.applicationsThisWeek = $("#applications-this-week").val();
			postData.applicationStatus = $("#application-status").val();
			postData.rejectionsThisWeek = $("#rejections-this-week").val();
			postData.reasonForRejection = $("#rejection-reason").val();
			postData.notes = $("#notes").val();
			if(!thisPtr.isDayMonday()) {
				thisPtr.showWeekStartDateNotMonday();
				return;
			} else {
				postData.weekStartDate = $("#week-start-dt").val();
			}
			$.ajax({
                url: 'assetMarketing/createUpdateMktDtls',
				dataType:'json',
				contentType: 'application/json',
				data: JSON.stringify(postData),
                type: 'POST',
                async:true,
                success: function(res){
                	if(res.statusCode == "200") {
                      	thisPtr.render({marketingId:thisPtr.marketingId});
                		thisPtr.showInsertOrUpdateSuccess();
                	} else {
                		thisPtr.showInsertOrUpdateFailure();
                	}
                },
                error: function(res){
                	thisPtr.showInsertOrUpdateFailure();
                },
                complete: function(){
    				
    			}
            });
		},
		
		hidePreviousMessages: function() {
			$('#marketingDetailsFailure').hide();
			$('#marketingDetailsSaveFailure').hide();
			$('#marketingDetailsSaveSuccess').hide();
			$('#weekStartNotMonday').hide();
		}, 
		
		showMarketingDetailsFailure : function(){
		   var thisPtr = this;
		   thisPtr.hidePreviousMessages();
		   $('#marketingDetailsFailure').show();
		   App.scrollTo($('#marketingDetailsFailure'), -200);
		},
		
		showInsertOrUpdateFailure : function() {
		   var thisPtr = this;
		   thisPtr.hidePreviousMessages();
		   $('#marketingDetailsSaveFailure').show();
		   App.scrollTo($('#marketingDetailsSaveFailure'), -200);
		},
		
		showInsertOrUpdateSuccess : function() {
		   var thisPtr = this;
		   thisPtr.hidePreviousMessages();
		   $('#marketingDetailsSaveSuccess').show();
		   App.scrollTo($('#marketingDetailsSaveSuccess'), -200);
		},
		
		showWeekStartDateNotMonday : function() {
		   var thisPtr = this;
		   thisPtr.hidePreviousMessages();
		   $('#weekStartNotMonday').show();
		   App.scrollTo($('#weekStartNotMonday'), -200);
		},
		
		addScrollBar : function(){
             $('.custom-scroll-dash').slimScroll({
                 height: '133px',
                 width: '100%',
                 alwaysVisible: true,
                 railColor: '#d09726',
                 railVisible: true
             });
             $('.custom-scroll-dash2').slimScroll({
                 height: '200px',
                 width: '100%',
                 alwaysVisible: true,
                 railColor: '#d09726',
                 railVisible: true
             });
         },
         
         removeActiveTab:function(){
	    	 $("li[name=marketingNav].active").removeClass("active");
	    	 $('div[name=marketingInfoTab].active').empty().removeClass("active");
	     },
	     showMarketingStepsTab:function() {
			var self = this;
			this.removeActiveTab();
			if(!this.marketingStepsView){
				this.marketingStepsView=new marketingStepsView();
			}
			//app.assetMarketingDetailsView.marketingStepsView = this.marketingStepsView;
			app.assetMarketingDetailsView.marketingStepsView.propertyModel.objectId = this.marketingId;
			app.assetMarketingDetailsView.marketingStepsView.propertyModel.object = "Marketing";
			//app.closingView.closingStepsView.propertyModel.closingStatus = this.model.attributes.investmentResponse.closingStatus;
			
			this.marketingStepsView.setElement($('#marketingStepsTab')).render({parentView:this});
			$("#marketingSteps").parent().addClass('active')
			$("#marketingStepsTab").addClass("active");
		 },
	     showContactsTab: function(){
					var thisPtr=this;
					var object="Marketing";
					this.removeActiveTab();
					if(app.mypropertyView && app.mypropertyView.contactView){
						app.mypropertyView.contactView.close();
						app.mypropertyView.contactView.remove();
					}
					if(!app.assetMarketingDetailsView.contactView){
						app.assetMarketingDetailsView.contactView=new contactView({collection:new contactCollection()});
						thisPtr.listenTo(app.assetMarketingDetailsView.contactView, 'ContactChanged', thisPtr.contactEditDeleteListener);
					}
					app.assetMarketingDetailsView.contactView.collection.objectId=thisPtr.marketingId;
					app.assetMarketingDetailsView.contactView.collection.object=object;
					app.assetMarketingDetailsView.contactView.object=object;
					app.assetMarketingDetailsView.contactView.objectId=thisPtr.marketingId;
					
					app.assetMarketingDetailsView.contactView.setElement($('#contactsTab')).render();
					$("#marketingContact").parent().addClass('active');
					$("#contactsTab").addClass("active");	
					return this;
					
		},
	    
	    showMarketingDocumentTab:function(){
	    	 var thisPtr=this;
				var object="Marketing";
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
				
				if(!app.assetMarketingDetailsView.documentView){
					app.assetMarketingDetailsView.documentView=new documentView({collection: new documentCollection()});
				}
				app.assetMarketingDetailsView.documentView.object=object;
				app.assetMarketingDetailsView.documentView.objectId=thisPtr.marketingId;
				app.assetMarketingDetailsView.documentView.setElement($('#marketingDocumentsTab')).fetchDocument();
				$("#marketingDocuments").parent().addClass('active')
				$("#marketingDocumentsTab").addClass("active");
				return this;
	     },
	     
	     showMarketingMessagesTab:function(){
				var thisPtr=this;
				var object="Marketing";
				this.removeActiveTab();
				if(app.mypropertyView && app.mypropertyView.messagesView){
					app.mypropertyView.messagesView.propertyModel.clear();
					app.mypropertyView.messagesView.close();
					app.mypropertyView.messagesView.remove();						
				}
				if(app.investorProfileView && app.investorProfileView.messagesView){
					app.investorProfileView.messagesView.propertyModel = {};
					app.investorProfileView.messagesView.close();
					app.investorProfileView.messagesView.remove();
				}
				
				if(app.opportunityView && app.opportunityView.messagesView){
					app.opportunityView.messagesView.propertyModel = {};
					app.opportunityView.messagesView.close();
					app.opportunityView.messagesView.remove();
				}
				
				if(!app.assetMarketingDetailsView.messagesView){
					app.assetMarketingDetailsView.messagesView=new messagesView({collection:new messagesCollection()});
				}
				app.assetMarketingDetailsView.messagesView.propertyModel.objectId = this.marketingId;
				app.assetMarketingDetailsView.messagesView.propertyModel.object = object;
				app.assetMarketingDetailsView.messagesView.propertyModel.propertyId = this.marketingDetailsResponse.propertyId;
				app.assetMarketingDetailsView.messagesView.collection.objectId=this.marketingId;
				app.assetMarketingDetailsView.messagesView.collection.object=object;

				app.assetMarketingDetailsView.messagesView.setElement($('#marketingMessagesTab')).fetchMessages();
				 
				
				$("#marketingMessages").parent().addClass('active');
				$("#marketingMessagesTab").addClass("active");
				return this;
		},
		
		showCalendarTab : function(){
			var thisPtr = this;
			thisPtr.removeActiveTab();
			if(!app.assetMarketingDetailsView.calendarView){
				app.assetMarketingDetailsView.calendarView=new calendarView();
			}
			app.assetMarketingDetailsView.calendarView.setElement($('#marketingCalendarTab')).render("Marketing",thisPtr.marketingId);
			$("#marketingCalendar").parent().addClass('active')
			$("#marketingCalendarTab").addClass("active");
			return this;
		},
		
		saveTargetRent: function() {
			var thisPtr = this;
			var errFlag = false;
			var postData = {};
			postData.marketingId = thisPtr.marketingId;
			postData.oldValue = $("#previous-target-rent").val();
			$("#new-target-rent-error").hide();
			$("#change-reason-error").hide();
			if($("#new-target-rent").val().toString().trim() && parseInt($("#new-target-rent").val())) {
				postData.newValue = $("#new-target-rent").val();
			} else {
				$("#new-target-rent-error").show();
				errFlag = true;
			}
			if(!errFlag) {
				if($("#reason-target-rent").val().toString().trim()) {
					postData.changeReason = $("#reason-target-rent").val();
				} else {
					$("#change-reason-error").show();
					errFlag = true;
				}
			}
			if(!errFlag) {
				//no errors encountered, so insert the record.
				postData.changeType = "TARGET_RENT";
				$.ajax({
	                url: 'assetMarketing/changeValues',
					dataType:'json',
					contentType: 'application/json',
					data: JSON.stringify(postData),
	                type: 'POST',
	                async:true,
	                success: function(res){
	                	$("#change-rent-modal").modal('hide');
	                	setTimeout(function(){$('.modal-backdrop').remove()},500)
			            $('.modal-backdrop').fadeOut(400);
			                	
	                	if(res.statusCode == "200") {
	                      	thisPtr.resetTargetRentValues();
	                    } else {
	                		thisPtr.showInsertOrUpdateFailure();
	                	}
	                },
	                error: function(res){
	                	$("#change-rent-modal").modal('hide');
	                	setTimeout(function(){$('.modal-backdrop').remove()},500)
			            $('.modal-backdrop').fadeOut(400);
			            
	                	thisPtr.showInsertOrUpdateFailure();
	                },
	                complete: function(){
	    				
	    			}
	            });
			}
			
			 
		},
		
		resetTargetRentValues: function() {
			var thisPtr = this;
			$("#target-rent").val($("#new-target-rent").val());
			$("#new-target-rent").val("");
			$("#previous-target-rent").val($("#target-rent").val());
			$("#reason-target-rent").val("");
			thisPtr.marketingDetailsResponse.targetRent = $("#target-rent").val();
	                	
		},
		
		getDateDetails: function() {
			var thisPtr = this;
			var weekStart = $("#week-start-dt").val();
			if(thisPtr.isDayMonday()) {
				thisPtr.hidePreviousMessages();
				$.ajax({
	                url: 'assetMarketing/getDateDetails/' + thisPtr.marketingId + '/' + weekStart,
					dataType:'json',
	                type: 'GET',
	                async:true,
	                success: function(res){
	                	if(res.statusCode == "200" || res.statusCode == "204") {
		                	if(!res.leadsThisWeek)
		                		res.leadsThisWeek = 0;
		                	if(!res.showingsThisWeek)
		                		res.showingsThisWeek = 0;	
		                	if(!res.applicationsThisWeek)
		                		res.applicationsThisWeek = 0;
		                	if(!res.rejectionsThisWeek)
		                		res.rejectionsThisWeek = 0;
		                	if(!res.upcomingShowings)
		                		res.upcomingShowings = 0;
		                	
		                	thisPtr.showDateDetails(res);
		               	} else {
		               		thisPtr.resetDateDetails();
		               	}
	               },
	                error: function(res){
	                  // thisPtr.marketingDetailsResponse = null;
	                  // thisPtr.showMarketingDetailsFailure();
	                },
	                complete: function(){
	    			 // thisPtr.addScrollBar();
	    			 // $(".amount").formatCurrency({roundToDecimalPlace: 0});
	                }
	            });
			} else {
				thisPtr.showWeekStartDateNotMonday();
			}
			
		},
		
		isDayMonday: function() {
			var parts = $("#week-start-dt").val().split("-");
			var d = new Date(parts[2],parts[0]-1,parts[1]);
			if(d.getDay() == 1) {
				return true;
			} else {
				return false;
			}
			
		},
		
		showDateDetails: function(response){
			var thisPtr = this;
			$("#upcoming-showings").val(response.upcomingShowings);
			$("#application-status").val(response.applicationStatus);
			$("#rejection-reason").val(response.primaryReasonForRejection);
			$("#leads-this-week").val(response.leadsThisWeek);
			$("#showings-this-week").val(response.showingsThisWeek);
			$("#applications-this-week").val(response.applicationsThisWeek);
			$("#rejections-this-week").val(response.rejectionsThisWeek);
			$("#notes").val(response.notes);
			thisPtr.marketingDetailsResponse.marketingStatusId = response.marketingStatusId;
		},
		
		resetDateDetails: function(){
			var thisPtr = this;
			$("#upcoming-showings").val("0");
			$("#application-status").val("");
			$("#rejection-reason").val("");
			$("#leads-this-week").val("0");
			$("#showings-this-week").val("0");
			$("#applications-this-week").val("0");
			$("#rejections-this-week").val("0");
			$("#notes").val("");
			thisPtr.marketingDetailsResponse.marketingStatusId = null;
		},
		
		showRentHistory: function(){
			var thisPtr = this;
			var rentHistory = [];
			$.ajax({
	                url: 'assetMarketing/getRentChanges/' + thisPtr.marketingId,
					dataType:'json',
	                type: 'GET',
	                async:true,
	                success: function(res){
	                	rentHistory = res;
	                },
	                error: function(res){
	                	rentHistory = [];
	                },
	                complete: function(){
	                	$("#rent-history-modal-body").html("");
	    				if(rentHistory.length == 0)
				    		$("#rent-history-modal-body").append('<tr><td colspan="5" style="text-align:center;"> History Not Available.</td></tr>');
				    	else {
				    		for(i = 0; i < rentHistory.length; i++) {
				    			$("#rent-history-modal-body").append('<tr><td>' + rentHistory[i].oldVal + '</td>' + 
				    													 '<td>' + rentHistory[i].newVal + '</td>' +
				    													 '<td>' + rentHistory[i].reason_for_change + '</td>' +
				    													 '<td>' + rentHistory[i].createdDate + '</td>' +
				    													 '<td>' + rentHistory[i].createdBy + '</td></tr>');
				    		}
				    	}
						$("#rent-history-modal").modal();
	    			}
	    		});
	    	
		
		},
		
		//this method will display carousel in marketing details page in header section of page
		renderImageCarousel:function(){
	    	 var self = this;
	    	 var mktDtlsCarouselTemplate = _.template( mktDtlsCarousel );
	    	 var carouselEl = this.$el.find('#mktDtlsCarouselDiv');
	    	 carouselEl.html("");
	    	 $.ajax({
	                url: app.context()+'property/getPropertyImageList/'+self.marketingDetailsResponse.propertyId,
	                contentType: 'application/json',
	                dataType:'json',
	                type: 'GET',
	                async : false,
	                success: function(res){
	                	carouselEl.html(mktDtlsCarouselTemplate({images:res,loading_img_medium:app.loading_img_base64_120x90,loading_img_thumbnail:app.loading_img_base64_70x50}));
	                	self.addJcar();
	                	app.router.checkPropImage();
	                },
	                error: function(res){
	                	console.log(res);
	                	carouselEl.html(mktDtlsCarouselTemplate({images:null,loading_img_medium:app.loading_img_base64_120x90,loading_img_thumbnail:app.loading_img_base64_70x50}));
	                	self.addJcar();
	                	app.router.checkPropImage();
	                }
	            });
	    	 
	     },
		
		
		 //this will create and assign functions to carousel buttons
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
	        
	        changeRentModalInit: function(){
	        	$("#new-target-rent-error").hide();
	        	$("#change-reason-error").hide();
	        	$("#new-target-rent").val("");
	        	$("#reason-target-rent").val("");
	        },

	        showMarketingPhotosTab : function(){

	        	console.log("showMarketingPhotosTab");
			 	var self = this;
		    	 this.removeActiveTab();
		    	 console.log("makinggenerivphotostabview");
			  	 if(!this.genericPhotosTabView){
			  		this.genericPhotosTabView = new genericPhotosTabView();
				 }
				 console.log("...success");
				 this.genericPhotosTabView.objectId= this.marketingId;
				 this.genericPhotosTabView.object="Marketing";
				 this.genericPhotosTabView.parentId=this.marketingAssetId;
				 this.genericPhotosTabView.propertyId=this.marketingPropertyId;
				// app.rehabDetailView.rehabStepsView.objectId = this.rehabId;
				// app.rehabDetailView.rehabStepsView.object = "Rehab";
				//app.closingView.rehabStepsView.closingStatus = this.model.attributes.investmentResponse.closingStatus;
				
			  	 this.genericPhotosTabView.setElement($('#marketingPhotosTab')).render({parentView:this});
				 $("#marketingPhotos").parent().addClass('active')
				 $("#marketingPhotosTab").addClass("active");


	        }
		
		
	});
	return AssetMarketingDetailsView;
});