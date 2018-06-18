define(["backbone","app","text!templates/requestForRepairsModal.html","text!templates/requestForRepairsRow.html",
	 "text!templates/docusignEnvelope.html","text!templates/uploadformRequestForRepairs.html"],
	function(Backbone,app,requestForRepairsModal,requestForRepairsRow,docusignEnvelopeTemplate,uploadFormTemplate){
		var requestForRepairsView=Backbone.View.extend({
			initialize: function(){
				var self = this;
			},
			events : { 
				'click .deleteInspectionCategory':'deleteInspectionCategory',
				'click #inspectionDeleteYesBtn':'inspectionDeleteYesBtn'
			},
			el:"#REQUEST_FOR_REPAIRS_RENDER_DIV",
			propertyInspectionCategories:[],
			inspectionIssues:[],
			inspectionId:"123",
			callBackData:{},
			render : function (options) {
				var self = this;
				self.parentModel = options.parentModel;
				self.parentObject = options.parentObject;
				self.parentObjectId = options.parentObjectId;
				
				self.$el.html("");
				self.$el.html(_.template(requestForRepairsModal));
				self.fetchIlmInspectionCategoryData();
		    },
		    populateInspectionItems: function(res){
		    	var self = this;
		    	console.log(res);
		    	self.inspectionId = res.inspectionId;
		    	self.inspectionIssues = res.inspectionItems;
		    	if(!jQuery.isEmptyObject( res.documentId )){
		    		self.$el.find("#inspectionDocument").html("<a href=document/download/"+res.documentId+" target=_blank style=word-wrap:break-word;>"+res.documentName+"</a>");
		    	}
		    	self.renderInspectionTable(res);
		    	self.populateDocusignArea(res);
		    },
		    renderInspectionTable: function(res){
		    	var self = this;
		    	var tableTemplate = _.template(requestForRepairsRow)({issues:self.inspectionIssues,categories:self.propertyInspectionCategories});
		    	self.$el.find("#inspectionTableRR").find("tbody").html("");
		    	self.$el.find("#inspectionTableRR").find("tbody").html(tableTemplate);
		    },
		    populateDocusignArea:function(res){	
		    	var self=this;
		    	if(!res. embraceEnvelopeId){
			    	var uploadTemplate=_.template(uploadFormTemplate);
			    	self.$el.find("#uploadformRequestRepairs").html(uploadTemplate);
		    	} else {
		    		self.$el.find("#uploadformRequestRepairs").remove();
		    		self.$el.find(".docusignEnvelopeArea").addClass("col-md-6");
		    	}
		    	res.app=app;
	     		var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
		     	//self.$el.find('.docusignEnvelopeArea').html(uploadTemplate);
		     	res.documentTaskKey = 'REPAIRS_REQUEST';
		     	res.envelopeTaskKey = 'REPAIRS_REQUEST_SIGNATURE';
		     	res.documentTypes = 'PA Addendum';
		     	self.embraceEnvelopeId = res.embraceEnvelopeId;
		     	self.$el.find('.docusignEnvelopeArea').html("");
		     	self.$el.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));
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
			    			self.renderInspectionTable(res);
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
		    fetchSubmitData: function(evt){
		    	var self = this;
		    	var returnObj = {};
		    	var categoryDataList = [];
		    //	var categoriesRows = self.$el.find("table tbody tr");
		    	var categoriesRows=self.$el.find("#inspectionTableRR tbody tr:not(.dummy-row)");
		    	_.each(categoriesRows,function(rowData){
		    		var categoryData = _.findWhere(self.inspectionIssues, { inspectionItemId: $(rowData).data("modelid") })
		    		categoryData.investorComments = $(rowData).find("textarea[name=investorComments]").val();
		    		categoryDataList.push(categoryData);
		    	});
		    	returnObj.inspectionCategories = categoryDataList;
		    	returnObj.endDate = self.$el.find("input[name=endDate]").val();
		    	returnObj.comments = self.$el.find("textarea[name=comments]").val();
		    	return returnObj;
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
		    }
		});
		return requestForRepairsView;
});
