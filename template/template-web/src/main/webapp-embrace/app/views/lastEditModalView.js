define([
"backbone",
"app",
"text!templates/lastEditModal.html",
"models/propertyModel",
"models/listingModel"
], function(Backbone,app,lastEditModalTpl,propertyModel,listingModel){
	var lastEditModalView = Backbone.View.extend({

		initialize: function(){

		},
		el:"#lastEditModalDiv",
		propertyId:"",
		events : {

	    },
	    render : function (theModel) {

	 		var self = this;
	    	this.template = _.template( lastEditModalTpl );
	     	this.$el.html("");
	    	theModel.getLastEditHistory({
	    			success: function(res){
	     				self.$el.html(self.template({theData:res}));
	    				$("#lastEditModal").modal('show');
	    			},
	    			error: function(res){
	    				console.log(res);
	    				console.log("error in getting the history");
	    			}
	    	});

	    }

	 });
	 return lastEditModalView;
});