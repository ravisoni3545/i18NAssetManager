define([
"backbone",
"app",
"text!templates/propertyFinancialCalHeader.html",
"models/propertyModel",
"models/listingModel",
"views/financialReturnsCalculatorDetailView",
"accounting"
], function(Backbone,app,propertyFinancialCalHeaderTpl,propertyModel,listingModel,financialReturnsCalculatorDetailView,accounting){
	var financialReturnsCalculatorView = Backbone.View.extend({

		initialize: function(){

		 },
		 el:"#maincontainer",
		 model:propertyModel,
		 events          : {
	         
	     },
	     render : function (options) {

	     	if(!app.propertyModel){
	    		app.propertyModel = new propertyModel();
	    	}
	    	app.propertyModel.set({"propertyId":options.propertyId});
	     	app.propertyModel.fetch({async:false}); 
			if(!app.listingModel){
	    		app.listingModel = new listingModel();
	    	}
	    	app.listingModel.set({propertyId:options.propertyId,urlParam:"byProperty"});
	     	app.listingModel.fetch({async:false});
	     	console.log(app.listingModel.toJSON());
	     	var dataFinal = app.propertyModel.toJSON();
	     	$.extend(dataFinal,app.listingModel.toJSON());
	    	this.template = _.template( propertyFinancialCalHeaderTpl );
	     	this.$el.html("");
	     	this.$el.html(this.template({theData:dataFinal,accounting:accounting}));
			this.showPropertyFinancialCal(options);
	     	return this;
	    },
	    showPropertyFinancialCal: function(opts){
	    	
	    	if(!app.financialReturnsCalculatorDetailView){
	    		app.financialReturnsCalculatorDetailView = new financialReturnsCalculatorDetailView();
	    	}
			app.financialReturnsCalculatorDetailView.setElement($('#financialCal')).render({parentView:this,"propertyId":opts.propertyId});
	    }

	 });
	 return financialReturnsCalculatorView;
});