define([
"backbone",
"app",
"text!templates/pixeetViewerModal.html"
], function(Backbone,app,pixeetModalTpl){
	var vimeoModalView = Backbone.View.extend({

		initialize: function(){

		},
		el:"#pixeetModalDiv",
		events : {

	    },
	    render : function (link) {
           
	 		var self = this;
	    	this.template = _.template( pixeetModalTpl );
	     	this.$el.html("");
                self.$el.html(self.template({link:link}));
	            $("#pixeetModal").modal('show');


	    }
	 });
	 return vimeoModalView;
});