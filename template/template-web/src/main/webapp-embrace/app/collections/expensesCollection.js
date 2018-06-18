define([ "backbone" ,"models/expensesModel","app"], function(Backbone,expensesModel,app) {
	
	var ExpensesCollection = Backbone.Collection.extend({

		initialize: function () {
			
	    },
	    assetId:null,
	    model:expensesModel,
	    url: function() {
            return app.context()+'/expenses/'+this.assetId;
          }  
	});

	return ExpensesCollection;

})