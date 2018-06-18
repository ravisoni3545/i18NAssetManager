define(["backbone","app","SecurityUtil","text!templates/propertySearchDetail.html","models/propertyModel","models/listingModel",
"collections/documentCollection","collections/messagesCollection","views/propertyInfoDetailView","views/propertyLocationDetailView",
"views/propertyFinancialDetailView","views/propertyCompsDetailView","views/propertyPhotosDetailView","views/propertyWishlistsDetailView",
"views/documentView","accounting","text!templates/codes.html","views/tagView","views/rehabEstimatorTabView","views/messagesView"],
function(Backbone,app,securityUtil,propertySearchDetailTpl,propertyModel,listingModel,documentCollection,messagesCollection,propertyInfoDetailView,propertyLocationDetailView,
	propertyFinancialDetailView,propertyCompsDetailView,propertyPhotosDetailView,propertyWishlistsDetailView,documentView,accounting,codesTemplate, tagView, rehabEstTabView, messagesView){

	var propertyDetailView = Backbone.View.extend({

		initialize: function(){
			var propertyDetailMlsLink=["PropertyDetailMlsLink"];
			var propertyDetailEdit=["PropertyDetailEdit"];
			var huPropertyStatusEdit=["huPropertyStatusEdit"];
			var PropertyMLSStatusEdit=["PropertyMLSStatusEdit"];
			var propertySearch=["PropertySearch"];
			var propertyTagEdit = ["PropertyTagEdit"];
			this.viewpermissions = {
									'propertyDetailMlsLink':securityUtil.isAuthorised(propertyDetailMlsLink, app.sessionModel.attributes.permissions),
									'propertyDetailEdit':securityUtil.isAuthorised(propertyDetailEdit, app.sessionModel.attributes.permissions),
									'huPropertyStatusEdit':securityUtil.isAuthorised(huPropertyStatusEdit, app.sessionModel.attributes.permissions),
									'PropertyMLSStatusEdit':securityUtil.isAuthorised(PropertyMLSStatusEdit, app.sessionModel.attributes.permissions),
			 						'propertySearch':securityUtil.isAuthorised(propertySearch,app.sessionModel.attributes.permissions),
			 						'propertyTagEdit':securityUtil.isAuthorised(propertyTagEdit,app.sessionModel.attributes.permissions)

			 };
		 },
		 object:"Property",
		 el:"#maincontainer",
		 model:undefined,
		 events          : {
		 	"click #propertyInfo" : "showPropertyInfoTab",
		 	"click #proeprtyLocation" : "showPropertyLocationTab",
		 	"click #propertyFinancials" : "showPropertyFinancialsTab",
		 	"click #propertyComps" : "showPropertyCompsTab",
		 	"click #propertyPhotos" : "showPropertyPhotosTab",
		 	"click #propertyWishlists" : "showPropertyWishlistsTab",
			"click #propertyDocuments" : "showPropertyDocumentsTab",
			"click #rehabEstimator" : "showRehabEstimatorTab",
			"click #propertyMessages" : "showPropertyMessagesTab",
			"click .ippropertypage":"showippropertypage",
			"click #hustatus-edit":"openHuStatusDropdownModal",
			"click #mlsstatus-edit":"openMlsStatusDropdownModal",
			"click #save-hu-status":"saveHuStatus",
			"click #save-mls-status":"saveMlsStatus"
	     },
	     render : function (options) {
	    	// console.log(this.PropertyMLSStatusEdit);
	    	// console.log(this.huPropertyStatusEdit);
	    	// console.log(this.viewpermissions);
	     	var self = this;
	     	this.propertyId = options.propertyId; 
	     	if(!app.propertyModel){
	    		app.propertyModel = new propertyModel();
	    	}
	    	if(!app.listingModel){
	    		app.listingModel = new listingModel();
	    	}

	      	app.propertyModel.set({"propertyId":options.propertyId});
	     	app.propertyModel.fetch({async:false}); 
	     	app.listingModel.set({propertyId:options.propertyId,urlParam:"byProperty"});
	     	app.listingModel.fetch({async:false});
	     	this.address = app.propertyModel.toJSON().propertyFullAddress;
	     	app.propertyModel.getHUSelectProperty({
	    			success: function(res){
	     				self.huSelect = res.huselect;
	    			},
	    			error: function(res){
	    				console.log("error in getting the huSelect");
	    			}
	    	});
	    	this.template = _.template( propertySearchDetailTpl );
	     	this.$el.html("");
	     	var isAdmin=app.sessionModel.attributes.roles.indexOf("Administrator");
	     	var isAdminHuPermission=app.sessionModel.attributes.permissions.indexOf("huPropertyStatusEdit");
	     	var permissionHUEditallowed=((isAdmin!=-1)&&(isAdminHuPermission!=-1));
	     	var domain = (app.context().indexOf('embrace.')>=0)?app.context().replace('embrace','idxrets'):app.context().replace("/embrace2","");
	     	this.$el.html(this.template({theProperty:app.propertyModel.toJSON(),theListing:app.listingModel.toJSON(),theHUSelect:this.huSelect,theDomain:domain,accounting:accounting,viewpermissions:this.viewpermissions,isAdmin:permissionHUEditallowed}));
	     	if(parseInt(localStorage["showRehab"+options.propertyId])){
	     		self.showRehabEstimatorTab();
	     		localStorage.removeItem("showRehab"+options.propertyId);
	     	} else {
	     		this.showPropertyInfoTab(options);	
	     	}
	     	 //if(this.huPropertyStatusEdit){
	    	 	if(!this.tagView){
	    	 		this.tagView = new tagView();
	    	 	}
	    	 	this.tagView.object = 450;
	    	 	this.tagView.objectId = options.propertyId;
	    	 	console.log(this.viewpermissions.propertyTagEdit + ", ptedit");
	    	 	this.tagView.canEdit = this.viewpermissions.propertyTagEdit;
	    	 	this.tagView.canView = true;
	    	 	this.tagView.setElement($('#propertyTags')).render({parentView:this});
	    	// }
	     	return this;
	    },
	    openHuStatusDropdownModal: function(evt){
			 var self=this;
			 var currTarget=$(evt.currentTarget);
				var currenForm=$('.statusHuUpdateForm');
				if(currenForm){
					console.log(currenForm);
					currenForm.find(".form-group").removeClass('has-error');
					currenForm.find(".help-block").remove();
				}
			 
			 self.fetchHuStatusValues();
		},
		fetchHuStatusValues: function(){
			var self = this;
			$.ajax({
				url: app.context()+'/code/all/property/HUS',
				contentType: 'application/json',
				async : true,
				dataType:'json',
				type: 'GET',
				success: function(res){
					var templateOptions = {};
					templateOptions.codeParamName = 'huStatus';
					templateOptions.addBlankFirstOption = false;
					templateOptions.addFirstOptionShowAll = false;
					templateOptions.codes = res;
					templateOptions.multiple = false;
					template = _.template( codesTemplate, templateOptions);
					$('#huStatusEditDiv').html("");
					$('#huStatusEditDiv').html(template);
					
					//$('#huStatusEditDiv').css({"margin-right":"280px","margin-bottom":"10px"});
					$("#huStatusEditDiv [name=huStatus]").val($('#huStatusVal').val());
					 
					$("#huStatusEdit").modal("show");
					self.StatusUpdateFormValidation($(".statusHuUpdateForm"));
				},
				error: function(res){
					console.log("Error fetching hu status codelist");
				}

			});
		},
		saveHuStatus : function(){
			 var self=this;
			 var huStatus=$('#huStatusEditDiv').find('[name=huStatus] option:selected').val();
			 var comments=$('.statusHuUpdateForm').find("#comments").val();
			 if($('.statusHuUpdateForm').validate().form()){
			 $.ajax({
				 url: app.context()+'/property/updateHuStatus',
	             contentType: 'application/json',
	             async : true,
	             dataType:'text',
	             type: 'POST',
	             data:JSON.stringify({'propertyId':app.propertyModel.get("propertyId"),'dataStr':huStatus,'comments':comments}),
	             success: function(res){
	            	$("#huStatusEdit").modal("hide");
	            	$("#huStatusEdit").on('hidden.bs.modal', function (e) {
	            		self.render({'propertyId':app.propertyModel.get("propertyId")});
	            	});
	             },
	             error: function(res){
	            	$("#huStatusEdit").modal("hide"); 
	            	$("#huStatusEdit").on('hidden.bs.modal', function (e) {
	            		self.render({'propertyId':app.propertyModel.get("propertyId")});
	            	});
	             }
				});}
		},
		openMlsStatusDropdownModal: function(evt){
			 var self=this;
			 var currTarget=$(evt.currentTarget);
			var currenForm=$('.statusMlsUpdateForm');
			if(currenForm){
				console.log(currenForm);
				currenForm.find(".form-group").removeClass('has-error');
				currenForm.find(".help-block").remove();
			}
			 self.fetchMlsStatusValues();
		},
		fetchMlsStatusValues: function(){
			var self = this;
			$.ajax({
				url: app.context()+'/code/all/property/PRS',
				contentType: 'application/json',
				async : true,
				dataType:'json',
				type: 'GET',
				success: function(res){
					var templateOptions = {};
					templateOptions.codeParamName = 'mlsStatus';
					templateOptions.addBlankFirstOption = false;
					templateOptions.addFirstOptionShowAll = false;
					templateOptions.codes = res;
					templateOptions.multiple = false;
					template = _.template( codesTemplate, templateOptions);
					$('#mlsStatusEditDiv').html("");
					$('#mlsStatusEditDiv').html(template);
					
					//$('#mlsStatusEditDiv').css({"margin-right":"280px","margin-bottom":"10px"});
					$("#mlsStatusEditDiv [name=mlsStatus]").val($('#mlsStatusVal').val());
					 
					$("#mlsStatusEdit").modal("show");
					self.StatusUpdateFormValidation($(".statusMlsUpdateForm"));
				},
				error: function(res){
					console.log("Error fetching mls status codelist");
				}

			});
		},
		saveMlsStatus : function(){
			 var self=this;
			 var mlsStatus=$('#mlsStatusEditDiv').find('[name=mlsStatus] option:selected').val();
			 var comments=$('.statusMlsUpdateForm').find("#comments").val();
			 if($('.statusMlsUpdateForm').validate().form()){
			 $.ajax({
				 url: app.context()+'/property/updateMlsStatus',
	             contentType: 'application/json',
	             async : true,
	             dataType:'text',
	             type: 'POST',
	             data:JSON.stringify({'propertyId':app.propertyModel.get("propertyId"),'dataStr':mlsStatus,'comments':comments}),
	             success: function(res){
	            	$("#mlsStatusEdit").modal("hide");
	            	$("#mlsStatusEdit").on('hidden.bs.modal', function (e) {
	            		self.render({'propertyId':app.propertyModel.get("propertyId")});
	            	});
	             },
	             error: function(res){
	            	$("#mlsStatusEdit").modal("hide"); 
	            	$("#mlsStatusEdit").on('hidden.bs.modal', function (e) {
	            		self.render({'propertyId':app.propertyModel.get("propertyId")});
	            	});
	             }
				});
			 }
		},
	    showPropertyInfoTab: function(opts){
	    	this.removeActiveTab();
	    	if(!app.propertyInfoDetailView){
	    		app.propertyInfoDetailView = new propertyInfoDetailView();
	    	}
			app.propertyInfoDetailView.setElement($('#propertyInfoTab')).render({parentView:this,"propertyId":this.propertyId});
			$('#propertyInfo').parent().addClass('active');
			$('#propertyInfoTab').addClass('active');	
			$("html, body").animate({ scrollTop: 0 });	
	    },
		removeActiveTab:function(){
			$("li[name=propertyInfoNav].active").removeClass("active");
			$('div[name=propertyInfoTab].active').empty().removeClass("active");
		},
		showPropertyLocationTab:function(){
			this.removeActiveTab();
			if(!app.propertyLocationDetailView){
	    		app.propertyLocationDetailView = new propertyLocationDetailView();
	    	}
			app.propertyLocationDetailView.setElement($('#proeprtyLocationTab')).render({parentView:this});
			$('#proeprtyLocation').parent().addClass('active');
			$('#proeprtyLocationTab').addClass('active');
		},
		showPropertyFinancialsTab:function(){
			this.removeActiveTab();
			if(!app.propertyFinancialDetailView){
	    		app.propertyFinancialDetailView = new propertyFinancialDetailView();
	    	}
			app.propertyFinancialDetailView.setElement($('#propertyFinancialsTab')).render({parentView:this,"propertyId":this.propertyId});
			$('#propertyFinancials').parent().addClass('active');
			$('#propertyFinancialsTab').addClass('active');
		},
		showPropertyCompsTab:function(){
			this.removeActiveTab();
			if(!app.propertyCompsDetailView){
	    		app.propertyCompsDetailView = new propertyCompsDetailView();
	    	}
			app.propertyCompsDetailView.setElement($('#propertyCompsTab')).render({parentView:this});
			$('#propertyComps').parent().addClass('active');
			$('#propertyCompsTab').addClass('active');
		},
		showPropertyPhotosTab:function(){
			this.removeActiveTab();
			if(!app.propertyPhotosDetailView){
	    		app.propertyPhotosDetailView = new propertyPhotosDetailView();
	    	}
			app.propertyPhotosDetailView.setElement($('#propertyPhotosTab')).render({parentView:this,"propertyId":this.propertyId,"filter":"photo"});
			$('#propertyPhotos').parent().addClass('active');
			$('#propertyPhotosTab').addClass('active');    
			app.propertyPhotosDetailView.addJcar();                                                                                                                                                                                                                                                                                                                          
		},
		showPropertyWishlistsTab:function(){
			this.removeActiveTab();
			if(!app.propertyWishlistsDetailView){
	    		app.propertyWishlistsDetailView = new propertyWishlistsDetailView();
	    	}
			app.propertyWishlistsDetailView.setElement($('#propertyWishlistsTab')).render({parentView:this,"propertyId":this.propertyId,"address":this.address});
			$('#propertyWishlists').parent().addClass('active');
			$('#propertyWishlistsTab').addClass('active');                                                                                                                                                                                                                                                                                                                      
		},
		showPropertyDocumentsTab:function(){
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
			
			
			if(!app.propertyDetailView.documentView){
				app.propertyDetailView.documentView=new documentView({collection: new documentCollection()});
			}

			app.propertyDetailView.documentView.object=this.object;
			app.propertyDetailView.documentView.objectId=this.propertyId;
			app.propertyDetailView.documentView.setElement($('#propertyDocumentsTab')).fetchDocument();
			$("#propertyDocuments").parent().addClass('active')
			$("#propertyDocumentsTab").addClass("active");
		},
		showRehabEstimatorTab: function(){
			this.removeActiveTab();
			if(!app.propertyDetailView.rehabEstTabView){
				app.propertyDetailView.rehabEstTabView=new rehabEstTabView();
			}
			app.propertyDetailView.rehabEstTabView.propertyId=this.propertyId;
			app.propertyDetailView.rehabEstTabView.huSelect=this.huSelect;
			app.propertyDetailView.rehabEstTabView.setElement($('#rehabEstimatorTab')).render();
			$("#rehabEstimator").parent().addClass('active')
			$("#rehabEstimatorTab").addClass("active");
		},
		
		showPropertyMessagesTab:function(){
			this.removeActiveTab();
			
			if(app.mypropertyView && app.mypropertyView.messagesView){
				app.mypropertyView.messagesView.close();
				app.mypropertyView.messagesView.remove();
			}
			if(app.homeView && app.homeView.messagesView){
				app.homeView.messagesView.close();
				app.homeView.messagesView.remove();
			}
			if(app.closingView && app.closingView.messagesView){
				app.closingView.messagesView.close();
				app.closingView.messagesView.remove();
			}
			if(app.opportunityView && app.opportunityView.messagesView){
				app.opportunityView.messagesView.close();
				app.opportunityView.messagesView.remove();
			}
			
			
			if(!app.propertyDetailView.messagesView){
				app.propertyDetailView.messagesView=new messagesView({collection: new messagesCollection()});
			}
			
			app.propertyDetailView.messagesView.collection.objectId=this.propertyId;
			app.propertyDetailView.messagesView.collection.object=this.object;
			app.propertyDetailView.messagesView.propertyModel.object=this.object;
			app.propertyDetailView.messagesView.propertyModel.objectId=this.propertyId;
			app.propertyDetailView.messagesView.setElement($('#propertyMessagesTab')).fetchMessages();
			$("#propertyMessages").parent().addClass('active')
			$("#propertyMessagesTab").addClass("active");
		},
		showippropertypage: function(evt){
			var propertyId = $(evt.currentTarget).data("objectid");
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			var propIPPropertyPopup = window.open("","_blank");
			$.ajax({
				url: app.context()+'/property/getipproperty/'+propertyId,
				type: 'GET',
				success: function(res){
					$.unblockUI();
					propIPPropertyPopup.location = res;
				},
				error: function(res){
					$.unblockUI();
					console.log('failed to get Investor Portal Link:'+res);
				}
			});
		},
		StatusUpdateFormValidation:function(currentForm){
			var form1 =currentForm ;
			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
				comments:{
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
	 });
	 return propertyDetailView;
});
