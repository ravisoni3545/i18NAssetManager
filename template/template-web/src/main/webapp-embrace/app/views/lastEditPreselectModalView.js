
define([
"backbone",
"app",
"text!templates/lastEditModal.html",
"models/propertyPreselectModel",
], function(Backbone,app,lastEditModalTpl,propertyPreselectModel){
	var lastEditPreselectModalView = Backbone.View.extend({

		initialize: function(){

		},
		el:"#lastEditModalDiv",
		huSelectId:"",
		events : {

	    },
	    render : function (theModel) {
            console.log("rendering");
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
	 return lastEditPreselectModalView;

});