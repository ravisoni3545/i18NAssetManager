define(["backbone","app","text!templates/sellerResponseForRepairsModal.html","text!templates/sellerResponseForRepairsCategoryRow.html",
	"views/codesView","text!templates/uploadformSellerResponseForRepairs.html", "text!templates/docusignEnvelope.html","components-dropdowns","components-pickers"],
	function(Backbone,app,sellerResponseModal,inspectionCategoryRow,codesView,uploadSellerFormTemplate,docusignEnvelopeTemplate){
		var sellerResponseForRepairsView=Backbone.View.extend({
			initialize: function(){
				var self = this;
				self.sellerResponseView = new codesView({codeGroup:'SELLER_RESP'});
			},
			events : { 
				"click #sellerResponseRepairsPopupSubmitButton":"submitResponseData"
			},
			el:"#SELLER_RESPONSE_REPAIRS_RENDER_DIV",
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
				self.$el.html(_.template(sellerResponseModal));
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
		    	self.populateDocusignArea(res);
		    },
		    renderInspectionTable: function(){
		    	var self = this;
		    	var tBody = self.$el.find("#sellerResponseTable.table tbody");
		    	tBody.html("");

		    	if(self.inspectionIssues && self.inspectionIssues.length){
		    		_.each(self.inspectionIssues, function (issue) {
			    		var rowTemplate = _.template(inspectionCategoryRow)({issue:issue,categories:self.propertyInspectionCategories});
			    		var requiredEl = $(rowTemplate).appendTo(tBody);
			    		self.sellerResponseView.callback = function() {
			    			$(requiredEl).find(".sellerResponseDD select[name=sellerResponse]").val(issue.sellerResponse);
			    		}
			    		self.sellerResponseView.render({el:$(requiredEl).find(".sellerResponseDD"),codeParamName:"sellerResponse"});
			    		$(requiredEl).find(".sellerResponseDD select[name=sellerResponse]").val(issue.sellerResponse);
			    	});
		    	} else {
			    	tBody.append('<tr class="dummy-row"><td colspan="6" style="text-align:center;">No inspection item found.</td></tr>');
		    	}
		    	tBody.find("select[name=sellerResponse]").css("padding","6px 1px");
		    	self.$el.find(".currencyTable").formatCurrency();
		    	app.currencyFormatter("$","currencyTable");
		    	ComponentsPickers.init();
		    },
		    populateDocusignArea:function(res){	
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
	    	},
		    submitResponseData: function(evt){
		    	var self = this;
		    	var requestObj = {};
		    	var categoryDataList = [];
		    	var categoriesRows = self.$el.find("#sellerResponseTable.table tbody tr:not(.dummy-row)");
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
		return sellerResponseForRepairsView;
});