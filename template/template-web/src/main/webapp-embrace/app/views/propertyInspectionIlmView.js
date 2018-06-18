define(["backbone","app","text!templates/propertyInspectionIlmModal.html","text!templates/propertyInspectionIlmCategoryRow.html",
		"text!templates/propertyInspectionIlmCategoryRowExpanded.html"],
	function(Backbone,app,propertyInspectionIlmModal,inspectionCategoryRow,inspectionCategoryRowExpanded){
		var propertyInspectionIlmView=Backbone.View.extend({
			initialize: function(){
				var self = this;
			},
			events : { 
				'click .addOrEditInspectionIlmCategory': 'addOrEditInspectionIlmCategory',
				'click .saveInspectionIlmCategory': 'saveInspectionIlmCategory',
				'click .cancelInspectionRow':'cancelToggleBtnClick',
				'click .deleteInspectionCategory':'deleteInspectionCategory',
				'click #inspectionDeleteYesBtn':'inspectionDeleteYesBtn',
				'click #table_excel' : 'exportTable2excel'
			},
			el:"#PROPERTY_INSPECTION_ILM_RENDER_DIV",
			propertyInspectionCategories:[],
			inspectionIssues:[],
			inspectionId:"",
			callBackData:{},
			render : function (options) {
				var self = this;
				self.parentView = options.parentView;
				self.parentModel = options.parentModel;
				self.parentObject = options.parentObject;
				self.parentObjectId = options.parentObjectId;
				self.taskKey = options.taskKey;
				self.taskName = options.taskName;
				self.$el.html("");
				/*if(self.taskKey == "CONTRACTOR_QUOTE"){
					screen.value="isContractorQuote";
				}*/
				self.$el.html(_.template(propertyInspectionIlmModal)({title:self.taskName,taskKey:self.taskKey}));
				self.fetchIlmInspectionCategoryData();
				self.fetchInspectionIssueSources();
		    },
		    addOrEditInspectionIlmCategory : function(evt){
		     	var self = this;
		    	var currentTarget = $(evt.currentTarget);
				var newRowTemplate = _.template(inspectionCategoryRowExpanded);
				// var targetRow = currentTarget.data("target");
				self.currentModelId = currentTarget.closest('tr').data("modelid");
				var model;
				var currentForm;
				var templateData = {};
				templateData.model = {};
				templateData.inspectionCategories = self.propertyInspectionCategories;
				templateData.inspectionIssueSources = self.inspectionIssueSources;
				
				if(this.taskKey== "CONTRACTOR_QUOTE"){
					templateData.flag="isContractorQuote";
				}
				
				else{
					templateData.flag="isHUInspectionReview";
				}

				if(self.currentModelId){
					if(currentTarget.data("show")){
						self.hideAllHiddenRows();
						var targetRow = currentTarget.data("target").split(".")[1];
						model = _.find(self.inspectionIssues, function(e){ return e.inspectionItemId == self.currentModelId; });
						templateData.model = model;
						// model = self.propertyUnitCollection.findWhere({unitId: self.currentModelId});
						currentTarget.closest("tr")
							.after(newRowTemplate({row:targetRow,singleData:templateData}));
						currentForm = currentTarget.closest("tr").next().find("form");
					} else {
						self.hideHiddenRows(currentTarget.closest("tr").next());
					}
				} else {
					if(currentTarget.data("show")){
						self.hideAllHiddenRows("thead");
						var firstRow = currentTarget.closest("table").find("tbody tr:first");
						if(firstRow && firstRow.length){
							currentTarget.closest("table").find("tbody tr:first")
								.before(newRowTemplate({row:"inspectionRow0",singleData:templateData}));
						} else {
							currentTarget.closest("table").find("tbody").html(newRowTemplate({row:"inspectionRow0",singleData:templateData}));
						}
						currentForm = currentTarget.closest("table").find("tbody tr:first form");
					} else {
						self.hideHiddenRows(currentTarget.closest("table").find("tbody tr:first"));
					}
				}

				if(currentTarget.data("show")){
					currentTarget.data("show",false);
					/*self.statusCodesView.render({el:currentTarget.closest("table").find(".unitStatus"),codeParamName:"unitStatusId",addBlankFirstOption:"true"});
					self.stateCodesView.render({el:currentTarget.closest("table").find('.state')});
					currentTarget.closest("table").find(".unitStatus select[name=unitStatusId]").val(model ? model.attributes.unitStatusId : "");
					currentTarget.closest("table").find(".state select[name=state]").val(model ? model.attributes.state : self.propertyDetails.state);
				*/} else {
					currentTarget.data("show",true);
				}
				/*if(currentForm){
					self.saveNewUnitFormValidation(currentForm);
				}
				*/
				$(".currency").formatCurrency();
				app.currencyFormatter("$");
		    },
		    populateInspectionItems: function(res){
		    	var self = this;
		    	console.log(res);
		    	self.inspectionId = res.inspectionId;
		    	self.inspectionIssues = res.inspectionItems;
		    	self.$el.find("#inspectionRehabCost").html(res.rehabCost);
		    	if(!jQuery.isEmptyObject( res.documentId )){
		    		self.$el.find("#inspectionDocument").html("<a href=document/download/"+res.documentId+" target=_blank style=word-wrap:break-word;>"+res.documentName+"</a>");
		    	}
		    	self.renderInspectionTable();
		    },
		    renderInspectionTable: function(){
		    	var self = this;
		    	self.$el.find("table thead .addOrEditInspectionIlmCategory").data("show",true);
		    	var tableTemplate = _.template(inspectionCategoryRow)({issues:self.inspectionIssues,categories:self.propertyInspectionCategories});
		    	self.$el.find("table tbody").html("");
		    	self.$el.find("table tbody").html(tableTemplate);

		    	var totalAmount = 0;
		    	_.each(self.inspectionIssues,function(issue){
		    		if(issue.repairedBy=='Investor' && issue.estimate){
		    			totalAmount += parseFloat(issue.estimate);
		    		}
		    	});
		    	self.$el.find("#inspectionTotal").html(totalAmount);
		    	self.$el.find(".amount").formatCurrency();
		    },
		    saveInspectionIlmCategory: function(evt){
		    	var self = this;
		    	var currentForm = $(evt.currentTarget).closest('form');
		    	self.addInspectionFormValidation(currentForm);
		    	var data = {};
		    	data.object = self.parentObject;
		    	data.objectId = self.parentObjectId;
		    	data.inspectionId = self.inspectionId;
		    	data.taskKey = self.taskKey;

		    	if(!currentForm.validate().form()){
		    		return;
		    	}
		    	$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});
		    	self.parentModel.submitIlmInspectionCategoryData(currentForm,data,{
		    		success:function(res){
		    			console.log("Success: saveInspectionIlmCategory");
		    			if(res && res.responseDTO){
		    				var requiredIssue = _.findWhere(self.inspectionIssues, { inspectionItemId: self.currentModelId });
		    				if(requiredIssue){
		    					_.extend(requiredIssue, res.responseDTO);
		    				} else {
		    					if(!self.inspectionIssues){self.inspectionIssues=[];}
		    					self.inspectionIssues.push(res.responseDTO);
		    				}
		    				if(!self.inspectionId){
		    					self.inspectionId = res.responseDTO.inspectionId;
		    				}
		    			}
		    			self.renderInspectionTable();
		    			$.unblockUI();
		    		},
		    		error:function(res){
						console.log("Failed: saveInspectionIlmCategory");
						$.unblockUI();
		    		}
		    	})
		    },
		    deleteInspectionCategory:function(evt){
		    	var self = this;
		    	var popup = self.$el.find("#inspectionDeleteModal");
		    	var inspectionIssueId = $(evt.currentTarget).closest('tr').data('modelid');
		    	self.callBackData = {};

		    	var callBack = function(){
					$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
					self.parentModel.deleteInspectionIssue(inspectionIssueId,{
						success: function(res){
			    			self.inspectionIssues = _.reject(self.inspectionIssues, function(el) { return el.inspectionItemId == inspectionIssueId; });
			    			self.renderInspectionTable();
							$.unblockUI();
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
		    inspectionDeleteYesBtn:function(){
		    	var self = this;		    	
		    	self.callBackData();
		    	self.callBackData = {};
		    	self.$el.find("#inspectionDeleteModal").modal("hide");
		    },
		    fetchIlmInspectionCategoryData:function(){
		    	var self = this;
		    	self.parentModel.fetchIlmInspectionCategoryData(self.parentObject,self.parentObjectId,{
					success:function(res){
						if(res && res.propertyInspectionCategories){
							self.propertyInspectionCategories = res.propertyInspectionCategories;
						}
					},
					error:function(res){
						console.log("Error in fetching propertyInspectionCategories");
					}
				});
		    },
		    fetchInspectionIssueSources:function(){
		    	var self = this;
		    	self.parentModel.fetchInspectionIssueSourcesData({
					success:function(res){
						if(res){
							self.inspectionIssueSources = res;
						}
					},
					error:function(res){
						console.log("Error in fetching inspectionIssueSources");
					}
				});
		    },
		    cancelToggleBtnClick: function(evt){
				var self = this;
				var targetAction;
				// self.$el.find("#addUnitsModal thead .addOrEditNewItem").data("show",true);
				var row = $(evt.currentTarget).closest("tr");
				var previousRow = row.prev();
				if(previousRow.length){
					targetAction = previousRow.find(".addOrEditInspectionIlmCategory");
				} else {
					targetAction = self.$el.find("table thead .addOrEditInspectionIlmCategory"); // Thead
				}
				
				targetAction.data("show",true);
				this.hideHiddenRows(row);
			},
		    hideHiddenRows: function(row){
				var self = this;
				$('.collapse.in').collapse('hide');
				setTimeout(function(){self.deleteHiddenRow(row)},500);
			},
			deleteHiddenRow: function(row){
				$(row).remove();
			},
			hideAllHiddenRows: function(args){
				var self = this;
				var requiredRows = $(".collapse.in").closest("tr");
				if(args != "thead"){
					self.$el.find("thead .addOrEditInspectionIlmCategory").data("show",true);
				}
				_.each(requiredRows,function(el){
					$(el).prev().find(".addOrEditInspectionIlmCategory").data("show",true);
					self.hideHiddenRows(el);
				});
			},
			addInspectionFormValidation:function(currentForm){
				var form1 = currentForm;

				form1.validate({
					errorElement: 'span', //default input error message container
					errorClass: 'help-block', // default input error message class
					focusInvalid: false, // do not focus the last invalid input
					ignore: "",
					rules: {
						category:{
							required: true
						},
						repairedBy:{
							required: true
						},
						/*estimate:{
							required: true
						},*/
						referenceNo:{
							number: true
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
			exportTable2excel: function() {
				var self = this;
				var propertyName = "";
				try {
				    propertyName = self.parentView.parentView.model.toJSON().propertyResponse.propertyDisplayId;
				}
				catch(err) {
				    console.log("Cannot find property Id.")
				}
				self.$el.find("#inspection_table").tableExport({
		            //formats: ["xlsx", "xls", "csv", "txt"]
		            formats: ["xlsx"],
		            fileName: self.taskName+"_"+propertyName+"_"+moment(new Date($.now())).format('YYYYMMDDHHmmss'),//do not include extension
		            context:app.context()
		        });
				/*$("#inspection_table").table2excel({
				    exclude: ".noExl", // exclude CSS class
				    name: "Inspection Issues",
				    filename: self.taskName+"_"+moment(new Date($.now())).format('DDMMYYYYHHmmss'),//do not include extension
				    context:app.context()
				});*/
			}
		});
		return propertyInspectionIlmView;
});
