define([
"backbone",
"app",
"text!templates/propertySearchAddSelectedModal.html",
"text!templates/investorWishlistResults.html",
"models/propertyModel"
], function(Backbone,app,propertySearchAddSelectedTpl,investorWishlistResultsTpl,propertyModel){
	var propertySearchAddSelectedView = Backbone.View.extend({

		initialize: function(){

            this.template = _.template( propertySearchAddSelectedTpl );
            this.$el.html("");
            this.$el.html(this.template);
            $('#investorWishlistSearchResults').html(
                    _.template(investorWishlistResultsTpl)({
                        templateData : null
            }));

		 },
		 el:"#propertySearchAddSelectedDiv",
		 model:propertyModel,
		 events          : {
	         
	     },
	     render : function (options) {

            $("#recommendedModal").modal('show');
	     	/*if(!app.propertyModel){
	    		app.propertyModel = new propertyModel();
	    		app.propertyModel.set({"propertyId":options.propertyId});
		     	app.propertyModel.fetch({async:false});
	    	}

	     	if(!app.listingModel){
	     		app.listingModel = new listingModel();
	     		app.listingModel.set({propertyId:options.propertyId,urlParam:"byProperty"});
	     		app.listingModel.fetch({async:false});
	     	}

	     	var dataFinal = app.propertyModel.toJSON();
	     	$.extend(dataFinal,app.listingModel.toJSON());
	    	this.template = _.template( propertyPhotosDetailTpl );
	     	this.$el.html("");
	     	this.$el.html(this.template({theData:dataFinal,accounting:accounting}));
            */
	     	return this;
	    }

	 });
	 return propertySearchAddSelectedView;
});