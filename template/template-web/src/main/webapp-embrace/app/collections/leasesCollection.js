define([ "backbone" ,"models/leasesModel","app"], function(Backbone,leasesModel,app) {
	
	var LeasesCollection = Backbone.Collection.extend({

		initialize: function () {
			
	    },
	    assetId:null,
	    model:leasesModel,
	    url: function() {
            return app.context()+'/leases/'+this.assetId;
          }  
	});

	return LeasesCollection;

})