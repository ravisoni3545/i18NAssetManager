define([
"backbone",
"app",
"text!templates/underConstruction.html",
"models/propertyModel",
"models/listingModel",
"accounting"
], function(Backbone,app,underConstrucionTpl,propertyModel,listingModel,accounting){
	var propertyLocationDetailView = Backbone.View.extend({

		initialize: function(){

		 },
		 el:"#proeprtyLocationTab",
		 model:propertyModel,
		 events          : {
	         
	     },
	     render : function (options) {

	    	this.template = _.template( underConstrucionTpl );
	     	this.$el.html("");
	     	this.$el.html(this.template());

	     	return this;
	    }

	 });
	 return propertyLocationDetailView;
});