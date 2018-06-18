define([ "backbone" ,"models/AMAgreementsModel","app"], function(Backbone,AMAgreementsModel,app) {
	
	var AMAgreementsCollection = Backbone.Collection.extend({

		initialize: function () {
			
	    },
	    assetId:null,
	    model:AMAgreementsModel,
	    url: function() {
            return app.context()+'/AMAgreements/'+this.assetId;
        },
  		getAMAgreements: function(callback){
  			var self=this;
        	$.ajax({
                url: this.url(),
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                success: function(res){
                	//console.log(res.purchasePrice);
                	self.reset(res.agreementsResponses);
                	callback.success(res.purchasePrice,res.rent);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        }
	});

	return AMAgreementsCollection;

})