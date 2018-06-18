define([
"backbone",
"app",
"text!templates/underConstruction.html",
"models/propertyModel",
"models/listingModel",
"accounting"
], function(Backbone,app,propertyCompsDetailTpl,propertyModel,listingModel,accounting){
	var propertyCompsDetailView = Backbone.View.extend({

		initialize: function(){

		 },
		 el:"#propertyCompsTab",
		 model:propertyModel,
		 events          : {
	         
	     },
	     render : function (options) {

	     	console.log(app.propertyModel.toJSON());	
	    	this.template = _.template( propertyCompsDetailTpl );
	     	this.$el.html("");
	     	this.$el.html(this.template());

	     	return this;
	    }

	 });
	 return propertyCompsDetailView;
});