define(["backbone","app","text!templates/investorResponseForRepairsModal.html",
	"text!templates/investorResponseForRepairsCategoryRow.html"],
	function(Backbone,app,investorResponseModal,inspectionCategoryRow){
		var investorResponseForRepairsView=Backbone.View.extend({
			initialize: function(){
				
			},
			events : { 
				
			},
			el:"#INVESTOR_RESPONSE_REPAIRS_RENDER_DIV",
			propertyInspectionCategories:[],
			inspectionIssues:[],
			inspectionId:"",
			render : function (options) {
				var self = this;
				self.parentModel = options.parentModel;
				self.parentObject = options.parentObject;
				self.parentObjectId = options.parentObjectId;
				self.taskKey = options.taskKey;

				self.$el.html("");
				self.$el.html(_.template(investorResponseModal));
				self.fetchIlmInspectionCategoryData();
		    },
		    populateInspectionItems: function(res){
		    	var self = this;
		    	self.inspectionId = res.inspectionId;
		    	self.inspectionIssues = res.inspectionItems;
		    	if(!jQuery.isEmptyObject( res.documentId )){
		    		self.$el.find("#inspectionDocument").html("<a href=document/download/"+res.documentId+" target=_blank style=word-wrap:break-word;>"+res.documentName+"</a>");
		    	}
		    	self.renderInspectionTable();
		    },
		    renderInspectionTable: function(){
		    	var self = this;
		    	var tBody = self.$el.find("table tbody");
		    	tBody.html("");

		    	var tableTemplate = _.template(inspectionCategoryRow)({issues:self.inspectionIssues,categories:self.propertyInspectionCategories});
		    	tBody.html("");
		    	tBody.html(tableTemplate);
				self.$el.find(".toggle-one").bootstrapToggle();				
				self.$el.find(".toggle-on, .toggle-off").css({"line-height":""});
				
				
			 	var totalAmount = 0;
		    	_.each(self.inspectionIssues,function(issue){
		    		
		    		/*if(issue.estimate &&(( issue.repairedBy=='Investor'&& issue.investorResponse=="Fix Now")||(issue.repairedBy=='Seller'&&issue.sellerResponse &&issue.sellerResponse!="Seller to repair")) ){
		    			totalAmount += parseFloat(issue.estimate);
		    		}*/
		    		if(issue.estimate && issue.sellerResponse!="Seller to repair" && issue.investorResponse=="Fix Now"){
		    			totalAmount += parseFloat(issue.estimate);
		    		}
		    	});
		    	self.$el.find("#estimateTotalAmount").html(totalAmount);
		    	self.$el.find(".amount").formatCurrency();
		    },
		    fetchSubmitData: function(evt){
		    	var self = this;
		    	var returnObj = {};
		    	var categoryDataList = [];
		    	var categoriesRows = self.$el.find("table tbody tr:not(.dummy-row)");
		    	_.each(categoriesRows,function(rowData){
		    		var categoryData = _.findWhere(self.inspectionIssues, { inspectionItemId: $(rowData).data("modelid") })
		    		categoryData.investorComments = $(rowData).find("textarea[name=investorComments]").val();
		    		categoryData.isInvestorAccepted = $(rowData).find("input[name=isInvestorAccepted]").prop("checked");
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
		return investorResponseForRepairsView;
});
