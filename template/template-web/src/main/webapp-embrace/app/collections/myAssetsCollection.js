define([ "backbone" ,"models/myAssetsModel","app"], function(Backbone,myAssetsmodel,app) {
	
	var MyAssetsCollection = Backbone.Collection.extend({

		initialize: function () {
			
	    },
	    model:myAssetsmodel,
	    url: function() {
            return app.context()+'/myAssets/allAssets';
          }  
	});

	return MyAssetsCollection;

})