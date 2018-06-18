define(["backbone","app","text!templates/closingAppointmentModal.html","text!templates/closingAppointmentRow.html",
		"text!templates/closingAppointmentRowExpanded.html","text!templates/appointmentsListForInvestor.html","views/stateCodesView",
		"views/codesView",
		"components-pickers"],
	function(Backbone,app,closingAppointmentModal,closingAppointmentRow,closingAppointmentRowExpanded,appointmentsListPage,
		stateCodesView,codesView){

		var closingAppointmentView=Backbone.View.extend({
			initialize: function(){
			this.stateCodesView=new stateCodesView();
			this.appStatusCodesView = new codesView({codeGroup:'APPNT_STATUS'});
			},
			events : { 
				'click .appointmentHisTooltip': 'showAppointmentsForInvestor',
				'hidden.bs.modal .with-popover': 'bsModalHide',
				"click .popover-close" : "closePopover",
				'click .addOrEditAppointment':'addOrEditAppointment',
				'click .saveAppointment': 'saveAppointment',
				'click .cancelAppointmentRow':'cancelToggleBtnClick',
				'click .deleteAppointment':'deleteAppointment',
				'click #appointmentDeleteYesBtn':'appointmentDeleteYesBtn'
			},
			el:"#CLOSING_APPOINTMENT_RENDER_DIV",
			investorsDetails:{},
			type:null,
			investorId:null,
			appointmentId:null,
			investorAppointementItems:[],
			coBuyerAppointmentItems:[],
			callBackData:{},
			render : function (options) {
				var self = this;
				self.parentModel = options.parentModel;
				self.parentObject = options.parentObject;
				self.parentObjectId = options.parentObjectId;
				self.fetchAllInvestorsDetails();
				this.template = _.template(closingAppointmentModal);
				self.$el.html("");
				self.$el.html(this.template({object:self.parentObject,objectId:self.parentObjectId,investorsDetails:self.investorsDetails}));
				ComponentsPickers.init();
		    },
		    fetchAllInvestorsDetails:function(){
		    	var self = this;
		    	self.parentModel.fetchAllInvestorsDetails(self.parentObject, self.parentObjectId,{
		    		success:function(res){
		    			if(res){
		    				self.investorsDetails = res;
		    			}
		    		},
		    		error:function(res){
						console.log("Failed: fetchAllInvestorsDetails");
		    		}
		    	})
		    },
		    populateAppointmentItems: function(res){
		    	var self = this;
		    	self.investorAppointmentItems = res.investorAppointmentItems;
		    	self.renderInvestorAppointmentItemsTable();
		    	if(self.investorsDetails.coBuyerId){
		    		self.coBuyerAppointmentItems = res.coBuyerAppointmentItems;
			    	self.renderCoBuyerAppointmentItemsTable();
		    	}
		    },
		    renderInvestorAppointmentItemsTable: function(){
		    	var self = this;
		    	var tableTemplate = _.template(closingAppointmentRow)({appointmentItems:self.investorAppointmentItems});
		    	//self.$el.find("investorAppointmentDiv table tbody").html("");
		    	//self.$el.find("investorAppointmentDiv table tbody").html(tableTemplate);
		    	self.$el.find(".investorAppointmentDiv table thead .addOrEditAppointment").data("show",true);
		    	
		    	self.$el.find(".investorAppointmentDiv").find("table tbody").html("");
		    	self.$el.find(".investorAppointmentDiv").find("table tbody").html(tableTemplate);
		    	
		    	
		    	App.handleUniform();
		    },
		    renderCoBuyerAppointmentItemsTable: function(){
		    	var self = this;
		    	var tableTemplate = _.template(closingAppointmentRow)({appointmentItems:self.coBuyerAppointmentItems});
		    	self.$el.find(".coBuyerAppointmentDiv table thead .addOrEditAppointment").data("show",true);
		    	self.$el.find(".coBuyerAppointmentDiv table tbody").html("");
		    	self.$el.find(".coBuyerAppointmentDiv table tbody").html(tableTemplate);
		    	App.handleUniform();
		    },
		    addOrEditAppointment : function(evt){
		     	var self = this;
		    	var currentTarget = $(evt.currentTarget);
				var newRowTemplate = _.template(closingAppointmentRowExpanded);
				// var targetRow = currentTarget.data("target");
				var closestTable = currentTarget.closest('table');
				self.currentModelId = currentTarget.closest('tr').data("modelid");
				self.appointmentId =  currentTarget.data("appointmentid");
				self.type =  $(evt.currentTarget).data("type");
				self.investorId = $(evt.currentTarget).data("investorid");
				var model;
				var currentForm;
				var templateData = {};
				templateData.model = {};
//				templateData.inspectionCategories = self.propertyInspectionCategories;
				
				if(self.currentModelId){
					if(currentTarget.data("show")){
						self.hideAllHiddenRows(closestTable);
						var targetRow = currentTarget.data("target").split(".")[1];
//						model = _.find(self.inspectionIssues, function(e){ return e.inspectionItemId == self.currentModelId; });
						if(self.type=="Investor"){
							model = _.find(self.investorAppointmentItems,function(e){ return e.appointmentId == self.currentModelId; });
						}else{
							model = _.find(self.coBuyerAppointmentItems,function(e){ return e.appointmentId == self.currentModelId; });
						}
						templateData.model = model;
						// model = self.propertyUnitCollection.findWhere({unitId: self.currentModelId});
						currentTarget.closest("tr")
							.after(newRowTemplate({row:targetRow,singleData:templateData.model}));
						
						currentForm = currentTarget.closest("tr").next().find("form");
					} else {
						self.hideHiddenRows(closestTable,currentTarget.closest("tr").next());
					}
				} else {
					if(currentTarget.data("show")){
						var rowString="appointmentRow0";
						if(self.type=="Investor"){
							rowString="appointmentRowInvestor0";
						}else{
							rowString="appointmentRowCoBuyer0";
						}
						
						self.hideAllHiddenRows(closestTable,"thead");
						var firstRow = currentTarget.closest("table").find("tbody tr:first");
						
						if(firstRow && firstRow.length){
							currentTarget.closest("table").find("tbody tr:first")
								.before(newRowTemplate({row:rowString,singleData:templateData}));
						} else {
							currentTarget.closest("table").find("tbody").html(newRowTemplate({row:rowString,singleData:templateData}));
						}
						currentForm = currentTarget.closest("table").find("tbody tr:first form");
					} else {
						self.hideHiddenRows(closestTable,currentTarget.closest("table").find("tbody tr:first"));
					}
				}

				if(currentTarget.data("show")){
					currentTarget.data("show",false);
				} else {
					currentTarget.data("show",true);
				}
				
				self.stateCodesView.render({el:currentTarget.closest("table").find('.state')});
				self.appStatusCodesView.callback=function() {
					if(!_.isEmpty(templateData.model)){
						currentForm.find('input[name=appointmentDate]').val(templateData.model.appointmentDate);
						currentForm.find('.appointmentStatus select[name=appointmentStatus]').find('option:contains("' + templateData.model.appointmentStatus+ '")').attr('selected', 'selected');
						currentForm.find('.state select[name=state]').find('option[value="' + templateData.model.state+ '"]').attr('selected', 'selected');
					}else{
						currentForm.find('.appointmentStatus select[name=appointmentStatus]').find('option:contains("Active")').attr('selected', 'selected');
						currentForm.find('.appointmentStatus select[name=appointmentStatus]').addClass('disable-field');
					}
				}
				self.appStatusCodesView.render({el:currentTarget.closest("table").find(".appointmentStatus"),codeParamName:"appointmentStatus",addBlankFirstOption:"true"});
				
				if(!_.isEmpty(templateData.model)){
					currentForm.find('input[name=appointmentDate]').val(templateData.model.appointmentDate);
					currentForm.find('.appointmentStatus select[name=appointmentStatus]').find('option:contains("' + templateData.model.appointmentStatus+ '")').attr('selected', 'selected');
					currentForm.find('.state select[name=state]').find('option[value="' + templateData.model.state+ '"]').attr('selected', 'selected');
				}else{
					currentForm.find('.appointmentStatus select[name=appointmentStatus]').find('option:contains("Active")').attr('selected', 'selected');
					currentForm.find('.appointmentStatus select[name=appointmentStatus]').addClass('disable-field');
				}
				
				if(currentForm){
					self.saveAppointmentFormValidation(currentForm);
				}
			
			 	ComponentsPickers.init();
		    },
		    saveAppointmentFormValidation: function(currentForm){
		    	var form1 = currentForm;

				form1.validate({
					errorElement: 'span', //default input error message container
					errorClass: 'help-block', // default input error message class
					focusInvalid: false, // do not focus the last invalid input
					ignore: "",
					rules: {
						appointmentDate: {
							required: true
						},
						phoneNumber: {
							required: true
						},
						appointmentStatus: {
							required: true
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

					invalidHandler: function (event, validator) { //display error alert on form submit              

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
		    saveAppointment: function(evt){
		    	var self = this;
		    	var currentForm = $(evt.currentTarget).closest('tr').find('form');

		    	var data = {};
		    	data.type=self.type;
		    	data.investorId=self.investorId;
		        data.object = self.parentObject;
		    	data.objectId = self.parentObjectId;
		    	data.appointmentId = self.appointmentId;
		    	
		    	if(currentForm.validate().form()){
		    		$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
			    	self.parentModel.submitAppointmentData(currentForm,data,{
			    		success:function(res){
			    			if(res){
			    				if(self.type=="Investor"){
				    				var requiredItem = _.findWhere(self.investorAppointmentItems, { appointmentId: self.appointmentId });
				    				if(requiredItem){
				    					_.extend(requiredItem, res);
				    					// _.extend(_.findWhere(self.inspectionIssues, { inspectionItemId: self.currentModelId }), res.responseDTO);
				    				} else {
				    					if(!self.investorAppointmentItems){self.investorAppointmentItems=[];}
				    					self.investorAppointmentItems.push(res);
				    				}
				    				self.renderInvestorAppointmentItemsTable(res);
			    				}else{
			    					var requiredItem = _.findWhere(self.coBuyerAppointmentItems, { appointmentId: self.appointmentId });
				    				if(requiredItem){
				    					_.extend(requiredItem, res);
				    					// _.extend(_.findWhere(self.inspectionIssues, { inspectionItemId: self.currentModelId }), res.responseDTO);
				    				} else {
				    					if(!self.coBuyerAppointmentItems){self.coBuyerAppointmentItems=[];}
				    					self.coBuyerAppointmentItems.push(res);
				    				}
				    				self.renderCoBuyerAppointmentItemsTable();
			    				}
			    			}
			    			$.unblockUI();
			    			self.$el.find(".alert-success").show();
							self.$el.find(".alert-success").delay(2000).fadeOut(4000);
			    		},
			    		error:function(res){
							console.log("Failed: submitAppointmentData");
							$.unblockUI();
							self.$el.find(".alert-danger").show();
							self.$el.find(".alert-danger").delay(2000).fadeOut(4000);
			    		}
			    	})
		    	
		    	}
		    },
		    cancelToggleBtnClick: function(evt){
				var self = this;
				var targetAction;
				// self.$el.find("#addUnitsModal thead .addOrEditNewItem").data("show",true);
				var closestTable = $(evt.currentTarget).closest("table");
				var row = $(evt.currentTarget).closest("tr");
				var previousRow = row.prev();
				if(previousRow.length){
					targetAction = previousRow.find(".addOrEditAppointment");
				} else {
					targetAction = closestTable.find("table thead .addOrEditAppointment"); // Thead
				}
				
				targetAction.data("show",true);
				this.hideHiddenRows(closestTable,row);
			},
		    hideHiddenRows: function(closestTable,row){
				var self = this;
				closestTable.find('.collapse.in').collapse('hide');
				setTimeout(function(){self.deleteHiddenRow(row)},500);
			},
			deleteHiddenRow: function(row){
				$(row).remove();
			},
			hideAllHiddenRows: function(closestTable,args){
				var self = this;
				var requiredRows = closestTable.find(".collapse.in").closest("tr");
				if(args != "thead"){
					closestTable.find("thead .addOrEditAppointment").data("show",true);
				}
				_.each(requiredRows,function(el){
					$(el).prev().find(".addOrEditAppointment").data("show",true);
					self.hideHiddenRows(closestTable,el);
				});
			},
			deleteAppointment:function(evt){
		    	var self = this;
		    	var popup = self.$el.find("#appointmentDeleteModal");
		    	var appointmentId = $(evt.currentTarget).closest('tr').data('modelid');
		    	var type = $(evt.currentTarget).data('type');
		    	self.callBackData = {};

		    	var callBack = function(){
					$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
					self.parentModel.deleteAppointment(appointmentId,{
						success: function(res){
							if(type=="Investor"){
				    			self.investorAppointmentItems = _.reject(self.investorAppointmentItems, function(el) { return el.appointmentId == appointmentId; });
				    			self.renderInvestorAppointmentItemsTable();
								$.unblockUI();
		    				}else{
		    					self.coBuyerAppointmentItems = _.reject(self.coBuyerAppointmentItems, function(el) { return el.appointmentId == appointmentId; });
		    					self.renderCoBuyerAppointmentItemsTable();
								$.unblockUI();
		    				}
						},
						error: function(res){
							$.unblockUI();
							console.log("failure");
						}
					});
				}
		    	self.callBackData = callBack;
		    	popup.modal("show");
		    },
		   appointmentDeleteYesBtn:function(){
		    	var self = this;		    	
		    	self.callBackData();
		    	self.callBackData = {};
		    	self.$el.find("#appointmentDeleteModal").modal("hide");
		    },
			showAppointmentsForInvestor:function (evt) {
				evt.preventDefault();
				evt.stopPropagation();
				var self = this;
				var isVisible = $(evt.currentTarget).data('show');

				if(isVisible == true){
					var msgContent =""; 
						
					msgContent=self.getAppointmentsForInvestor($(evt.currentTarget).data('object'),$(evt.currentTarget).data('objectid'), $(evt.currentTarget).data('investorid'));
					
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
						$(evt.currentTarget).attr("data-content","No Appointments");
					}
					$(evt.currentTarget).popover("show");
				} else {
					$(evt.currentTarget).popover("hide");
					$(evt.currentTarget).data('show',true);
					$(evt.currentTarget).removeClass("tooTip-shown");
				}
			},
			getAppointmentsForInvestor:function(object,objectId,investorId) {
				var self = this;
				var object = object || self.parentObject;
		    	var objectId = objectId || self.parentObjectId;
				var appointmentContent;

				self.parentModel.getAppointments(object,objectId,investorId,{
					success : function (model,res) {
						appointmentContent = res.appointmentDatas;
					},
					error: function (model,res){
						console.log("Fetching Appointments For Investor failed");
					}
				});
				
				if(appointmentContent && appointmentContent.length == 0){
					return "";
				} else {
					var popOverMsgTemplate = _.template( appointmentsListPage )({appointmentDatas:appointmentContent});
					return popOverMsgTemplate;
				}
			},
			bsModalHide:function(evt) {
				evt.preventDefault();
				evt.stopPropagation();
				$('.appointmentHisTooltip').popover("hide");
				$('.appointmentHisTooltip').data('show',true);
				$('.appointmentHisTooltip').removeClass("tooTip-shown");
			},
			closePopover:function(evt) {
				evt.preventDefault();
				evt.stopPropagation();
				$(evt.currentTarget).parent().parent().parent().parent().parent().find(".appointmentHisTooltip").popover("hide");
				$(evt.currentTarget).parent().parent().parent().parent().parent().find(".appointmentHisTooltip").data('show',true);
				$(evt.currentTarget).parent().parent().parent().parent().parent().find(".appointmentHisTooltip").removeClass("tooTip-shown");
			}
		});
		return closingAppointmentView;
});
