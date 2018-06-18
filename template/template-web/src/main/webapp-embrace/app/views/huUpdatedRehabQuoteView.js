define(["backbone","app","text!templates/huUpdatedRehabQuoteModal.html","text!templates/huUpdatedRehabQuoteCategoryRow.html",
	"views/codesView","components-dropdowns","components-pickers"],
	function(Backbone,app,huUpdatedRehabQuoteModal,inspectionCategoryRow,codesView){
		var huUpdatedRehabQuoteView=Backbone.View.extend({
			initialize: function(){
				var self = this;
				//self.sellerResponseView = new codesView({codeGroup:'SELLER_RESP'});
				
				self.investorResponseView = new codesView({codeGroup:'INVESTOR_RES'});
			},
			events : { 
				// 'keyup #rehabQuoteTable input[id=estimate_currency]':'calculateClosingCostTotal'
			},
			el:"#HU_UPDATED_QUOTE_RENDER_DIV",
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
				self.$el.html(_.template(huUpdatedRehabQuoteModal));
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
		    	self.renderInspectionTable();
		    	self.addCalculateEstimateHandler();
		    	self.calculateTotalEstimateAmount();
		    	//self.populateDocusignArea(res);
		    },
		    addCalculateEstimateHandler: function(){
		    	var self = this;
	    		$('#rehabQuoteTable input[id="estimate_currency"]').on("keyup",function(evt){
	    			self.calculateTotalEstimateAmount(evt);
	    		});
		    },
		    calculateTotalEstimateAmount: function(evt){
		    	var totalEstimate = 0.00;
    			_.each($("#rehabQuoteTable tr[data-modelid]"), function(row){
    				if(($(row).find('td').eq(4).text().toLowerCase() != 'seller to repair') && $(row).find('td').eq(8).text() && ($(row).find('td').eq(8).text().toLowerCase() == "fix now") && ($($(row).find('td').eq(7)[0]).find('#estimate').val().trim() != "")){
    					totalEstimate = totalEstimate + parseFloat($($(row).find('td').eq(7)[0]).find('#estimate').val());
    				}
    			});
    			$("#estimateTotal").html(totalEstimate);
    			$("#estimateTotal").formatCurrency();
		    },
		    renderInspectionTable: function(){
		    	var self = this;
		    	var tBody = self.$el.find("#rehabQuoteTable.table tbody");
		    	tBody.html("");

		    	if(self.inspectionIssues && self.inspectionIssues.length){
		    		_.each(self.inspectionIssues, function (issue) {
			    		var rowTemplate = _.template(inspectionCategoryRow)({issue:issue,categories:self.propertyInspectionCategories});
			    		var requiredEl = $(rowTemplate).appendTo(tBody);
			    		
			    		//self.investorResponseView.render({el:$(requiredEl).find(".investorResponseDD"),codeParamName:"investorResponse"});
			    		//$(requiredEl).find(".investorResponseDD select[name=investorResponse]").find('option:contains("' +issue.investorResponse+ '")').attr('selected', 'selected');
			    		
			    		//self.sellerResponseView.render({el:$(requiredEl).find(".huUpdateQuote"),codeParamName:"sellerResponse"});
			    		//$(requiredEl).find(".huUpdateQuote select[name=sellerResponse]").val(issue.sellerResponse);
			    	});
		    	} else {
			    	tBody.append('<tr class="dummy-row"><td colspan="6" style="text-align:center;">No inspection item found.</td></tr>');
		    	}
		    	
		    	var totalAmount = 0;
		    	var creditAmount=0;
		    	_.each(self.inspectionIssues,function(issue){
		    		if(issue.estimate ||( issue.repairedBy=='Investor'&& issue.investorResponse=="Fix Now")||(issue.repairedBy=='Seller'&&issue.sellerResponse &&issue.sellerResponse!="Seller to repair")){
		    			totalAmount += parseFloat(issue.estimate);
		    		}
		    		if(issue.creditAmount ||( issue.repairedBy=='Investor'&& issue.investorResponse=="Fix Now")||(issue.repairedBy=='Seller'&&issue.sellerResponse &&issue.sellerResponse!="Seller to repair")){
		    			creditAmount += parseFloat(issue.creditAmount);
		    		}
		    		
		    	 
		    		
		    	});
		    	self.$el.find("#estimateTotal").html(totalAmount);
		    	self.$el.find("#creditTotal").html(creditAmount);
		    	self.$el.find(".amount").formatCurrency();
		    	
		    	tBody.find("select[name=sellerResponse]").css("padding","6px 1px");
		    	self.$el.find(".currencyTable").formatCurrency();
		    	app.currencyFormatter("$","currencyTable");
		    	ComponentsPickers.init();
		    },
		    
		    fetchSubmitData: function(evt){
		    	var self = this;
		    	var returnObj = {};
		    	var categoryDataList = [];
		    //	var categoriesRows = self.$el.find("table tbody tr");
		    	var categoriesRows=self.$el.find("#rehabQuoteTable tbody tr:not(.dummy-row)");
		    	_.each(categoriesRows,function(rowData){
		    		
		    		var categoryData = {};
		    		var categoryData = _.findWhere(self.inspectionIssues, { inspectionItemId: $(rowData).data("modelid") })
		    		categoryData.investorResponse = $(rowData).find("select[name=investorResponse]").val();
		    		categoryData.estimate = $(rowData).find("input[name=estimate]").val();
		    		categoryDataList.push(categoryData);
		    	
		    	});
		    	returnObj.inspectionCategories = categoryDataList;
		    	returnObj.endDate = self.$el.find("input[name=endDate]").val();
		    	returnObj.comments = self.$el.find("textarea[name=comments]").val();
		    	return returnObj;
		    },
		    
		 /*   populateDocusignArea:function(res){	
		    	var self=this;
		    	if(!res. embraceEnvelopeId){
		    		var uploadTemplate=_.template(uploadSellerFormTemplate);
			    	self.$el.find("#uploadSellerForm").html(uploadTemplate);
		    	} else {
		    		self.$el.find("#uploadSellerForm").remove();
		    		self.$el.find(".docusignEnvelopeArea").addClass("col-md-6");
		    	}
		    	res.app=app;
	     		var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
		     	//self.$el.find('.docusignEnvelopeArea').html(uploadTemplate);
		     	res.documentTaskKey = 'SELLER_RESPONSE_REPAIRS';
		     	res.envelopeTaskKey = 'SELLER_RESPONSE_REPAIRS_SIGNATURE';
		     	res.documentTypes = 'PA Addendum';
		     	self.embraceEnvelopeId = res.embraceEnvelopeId;
		     	self.$el.find('.docusignEnvelopeArea').html("");
		     	self.$el.find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:res}));
	    	}*/
		    submitQuoteResponseData: function(evt){
		    	var self = this;
		    	var requestObj = {};
		    	var categoryDataList = [];
		    	var categoriesRows = self.$el.find("#rehabQuoteTable.table tbody tr:not(.dummy-row)");
		    	_.each(categoriesRows,function(rowData){
		    		var categoryData = {};
		    		categoryData.inspectionItemId = $(rowData).data("modelid");
		    		categoryData.sellerComments = $(rowData).find("textarea[name=sellerComments]").val();
		    		categoryData.sellerResponse = $(rowData).find("select[name=sellerResponse]").val();
		    		categoryData.repairDate = $(rowData).find("input[name=repairDate]").val();
		    		categoryData.creditAmount = $(rowData).find("input[name=creditAmount]").val();
		    		categoryDataList.push(categoryData);
		    	});
		    	requestObj.taskKey = self.taskKey;
		    	requestObj.inspectionId = self.inspectionId;
		    	requestObj.object = self.parentObject;
		    	requestObj.objectId = self.parentObjectId;
		    	requestObj.categoryDataList = categoryDataList;

		    	self.parentModel.submitSellerResponseForRepairs(requestObj,{
		    		success:function(){
		    			console.log("success");
		    		},
		    		error:function(){
		    			console.log("error");
		    		}
		    	});
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
		return huUpdatedRehabQuoteView;
});
