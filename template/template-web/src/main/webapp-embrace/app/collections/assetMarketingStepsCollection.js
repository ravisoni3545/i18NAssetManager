define([ "backbone","app" ], function(Backbone,app) {
	
	var assetMarketingStepsCollection = Backbone.Collection.extend({

		initialize: function (model, options) {
	    },
	    object: 'Marketing',
	    url: function (){
			var gurl=app.context()+ "/assetMarketing/tasks";
			return gurl;
		},
		getMarketingSteps: function(investmentId,callback){
        	$.ajax({
                url: this.url()+'/all/'+this.object+"/"+investmentId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        }
	});

	return assetMarketingStepsCollection;

})