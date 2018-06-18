define(["backbone","app","text!templates/propertyInspectionInvestorModal.html","text!templates/propertyInspectionInvestorCategoryRow.html",
		"text!templates/propertyInspectionIlmCategoryRowExpanded.html","views/codesView"],
	function(Backbone,app,propertyInspectionInvestorModal,inspectionCategoryRow,inspectionCategoryRowExpanded,codesView){
		var propertyInspectionInvestorView=Backbone.View.extend({
			initialize: function(){
				var self = this;
				self.investorResponseView = new codesView({codeGroup:'INVESTOR_RES'});
			},
			events : { 
				'change select[name=investorResponse]':'setTotalAmount',
				'change select[name=repairedBy]':'setTotalAmount'
			},
			el:"#PROPERTY_INSPECTION_INVESTOR_RENDER_DIV",
			propertyInspectionCategories:[],
			inspectionIssues:[],
			inspectionId:"",
			render : function (options) {
				var self = this;
				self.parentModel = options.parentModel;
				self.parentObject = options.parentObject;
				self.parentObjectId = options.parentObjectId;

				self.$el.html("");
				self.$el.html(_.template(propertyInspectionInvestorModal));
				self.fetchIlmInspectionCategoryData();
		    },
		    populateInspectionItems: function(res){
		    	var self = this;
		    	console.log(res);
		    	self.inspectionId = res.inspectionId;
		    	self.inspectionIssues = res.inspectionItems;
		    	self.$el.find("#inspectionRehabCost").html(res.rehabCost);
		    	if(!jQuery.isEmptyObject( res.documentId )){
		    		self.$el.find("#inspectionDocument").html("<a href=document/download/"+res.documentId+" target=_blank style=word-wrap:break-word;>"+res.documentName+"</a>")
		    	}
		    	self.renderInspectionTable();
		    },
		    renderInspectionTable: function(){
		    	var self = this;
//		    	var tableTemplate = _.template(inspectionCategoryRow)({issues:self.inspectionIssues,categories:self.propertyInspectionCategories});
//		    	self.$el.find("table tbody").html("");
//		    	self.$el.find("table tbody").html(tableTemplate);

		    	var tBody = self.$el.find("table tbody");
		    	tBody.html("");

		    	// if(self.inspectionIssues && self.inspectionIssues.length){
	    		_.each(self.inspectionIssues, function (issue) {
		    		var rowTemplate = _.template(inspectionCategoryRow)({issue:issue,categories:self.propertyInspectionCategories});
		    		var requiredEl = $(rowTemplate).appendTo(tBody);
		    		self.investorResponseView.callback = function() {
		    			$(requiredEl).find(".investorResponseDD select[name=investorResponse]").find('option:contains("' +issue.investorResponse+ '")').attr('selected', 'selected');
		    		}
		    		self.investorResponseView.render({el:$(requiredEl).find(".investorResponseDD"),codeParamName:"investorResponse"});
		    		$(requiredEl).find(".investorResponseDD select[name=investorResponse]").find('option:contains("' +issue.investorResponse+ '")').attr('selected', 'selected');
		    	});
		    	/*} else {
			    	tBody.append('<tr><td colspan="5" style="text-align:center;">No inspection item found.</td></tr>');
		    	}*/
		    	tBody.find("select[name=investorResponse]").css("padding","6px 1px");
		    	
		    	self.setTotalAmount();
		    	
		    },
		    fetchSubmitData: function(){
		    	var self = this;
		    	var returnObj = {};
		    	var categoryDataList = [];
		    	var categoriesRows = self.$el.find("table tbody tr");
		    	_.each(categoriesRows,function(rowData){
		    		var data = _.findWhere(self.inspectionIssues, { inspectionItemId: $(rowData).data("modelid") })
//		    		Data will be saved and notification for huComments will be sent again as
//		    		we are using common method in backend so created new object to store only data to be saved
		    		var categoryData = {};
		    		categoryData.inspectionId = data.inspectionId;
		    		categoryData.inspectionItemId = $(rowData).data("modelid");
		    		categoryData.repairedBy = $(rowData).find("select[name=repairedBy]").val();
//		    		categoryData.isInvestorAccepted = $(rowData).find("input[name=isInvestorAccepted]").prop("checked");
		    		categoryData.investorResponse = $(rowData).find("select[name=investorResponse]").val();
		    		categoryData.investorComments = $(rowData).find("textarea[name=investorComments]").val();
		    		categoryData.estimate = data.estimate;
		    		categoryData.referenceNo = data.referenceNo;
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
		    },
		    setTotalAmount : function(){
		    	var self=this;
		    	var totalAmount = 0;
		    	var categoryDataList = [];
		    	var categoriesRows = self.$el.find("table tbody tr");
		    	_.each(categoriesRows,function(rowData){
		    		var categoryData = _.findWhere(self.inspectionIssues, { inspectionItemId: $(rowData).data("modelid") })
		    		categoryData.repairedBy = $(rowData).find("select[name=repairedBy]").val();
//		    		categoryData.isInvestorAccepted = $(rowData).find("input[name=isInvestorAccepted]").prop("checked");
//		    		categoryData.investorResponse = $(rowData).find("select[name=investorResponse]").val();
		    		categoryData.investorResponse = $(rowData).find("select[name=investorResponse] option:selected").text();
		    		categoryDataList.push(categoryData);
		    	});
		    	
		    	_.each(categoryDataList,function(categoryData){
		    		if(categoryData.repairedBy=='Investor' && categoryData.investorResponse=='Fix Now' && categoryData.estimate){
		    			totalAmount += parseFloat(categoryData.estimate);
		    		}
		    	});
		    	
		    	self.$el.find("#inspectionTotal").html(totalAmount);
		    	self.$el.find(".toggle-one").bootstrapToggle();	
		    	self.$el.find(".amount").formatCurrency();
		    }
		});
		return propertyInspectionInvestorView;
});