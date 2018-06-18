define([ "backbone","app" ], function(Backbone,app) {
	var rehabCategoryCollection = Backbone.Collection.extend({
		initialize: function () {

	    },
	    url: function (){
			return app.context()+'/rehabRepair/rehabDetailsPage/' + this.rehabId;
		}
	});

	return rehabCategoryCollection;

})