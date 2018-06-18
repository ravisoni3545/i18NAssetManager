define([
"backbone",
"app",
"text!templates/vimeoViewerModal.html"
], function(Backbone,app,vimeoModalTpl){
	var vimeoModalView = Backbone.View.extend({

		initialize: function(){

		},
		el:"#vimeoModalDiv",
		events : {

	    },
	    render : function (link) {
	 		var self = this;
	    	this.template = _.template( vimeoModalTpl );
	     	this.$el.html("");
                self.$el.html(self.template({link:link}));
	            $("#vimeoModal").modal('show');


	    }
	 });
	 return vimeoModalView;
});