define([
"backbone",
"app",
"text!templates/propertyFinancialDetail.html",
"models/propertyModel",
"models/listingModel",
"accounting"
], function(Backbone,app,propertyFinancialDetailTpl,propertyModel,listingModel,accounting){
	var propertyFinancialDetailView = Backbone.View.extend({

		initialize: function(){

		 },
		 el:"#propertyFinancialsTab",
		 model:propertyModel,
		 events          : {
	         
	     },
	     render : function (options) {
	     	
	     	if(!app.listingModel){
	     		app.listingModel = new listingModel();
	     		app.listingModel.set({propertyId:options.propertyId,urlParam:"byProperty"});
	     		app.listingModel.fetch({async:false});
	     	}
	     	this.fetchFinancialsData(app.listingModel.toJSON().listingDetails);
	    	//this.template = _.template( propertyFinancialDetailTpl );
	     	//this.$el.html("");
	     //	this.$el.html(this.template({theData:app.listingModel.toJSON(),accounting:accounting}));

	     	return this;
	    }, 
	    fetchFinancialsData : function(data){
	    	var self=this;
	    	var obj={};
			var propertyInput={};
			propertyInput.hil=data.hil;
			propertyInput.source=data.source;
			propertyInput.propertyTypeCode=data.propertyTypeCode;
			propertyInput.price=data.askingPrice;
			propertyInput.rehabCost=data.rehabEstimate;
			propertyInput.rent=data.leasedRent;
			propertyInput.tax=data.propertyTaxesAnnual;
			propertyInput.insurance=data.propertyInsuranceAnnual;
			propertyInput.hoa=data.hoaFeeAnnual;
			propertyInput.zillowAppreciation=data.appreciationRate;
			propertyInput.calculationFreezeDate=data.calculationFreezeDate;
			var userInput={};
			obj.propertyInput=propertyInput;
			obj.userInput=userInput;
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
	    	  $.ajax({
	                url: app.context()+ "/property/getfinancialsDetails",
	                contentType: 'application/json',
	                dataType:'json',
	                async:true,
	                data: JSON.stringify(obj),
	                type: 'POST',
	                success: function(res){
	                	$.unblockUI();
	                	if(res.successFlag){
	                		self.template = _.template( propertyFinancialDetailTpl );
	                		self.$el.html("");
	                		self.$el.html(self.template({theData:res,tblpropertyPropertyid:data.tblpropertyPropertyid,accounting:accounting}));
	                	}else{
	                		self.$el.html("");
	                		self.$el.html("<div class='pad_top30'><span class='font18' style='color: #a94442;'>Failed to get Financials Details : "+res.errorMsg+"</span></div>");
	                		console.log("error response:"+res.errorMsg);
	                	}
	                	return res;
	                },
	                error: function(res){
	                	$.unblockUI();
	                	self.$el.html("");
	                	self.$el.html("<div class='col-md-4'></div><div class='col-md-5 pad_top30'><span class='font18' style='color: #a94442;'>Failed to get Financials Details</span></div>");
	                	console.log("Failed to make request for financialsData");
	                }
	            });
	    }
	 });
	 return propertyFinancialDetailView;
});