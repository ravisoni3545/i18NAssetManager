define([ "backbone","app" ], function(Backbone,app) {
	
	var vendorServiceContractsCollection = Backbone.Collection.extend({

		initialize: function (model, options) {
	    },
	    url: function (){
			var gurl=app.context()+ "/vendor/contract";
			return gurl
		},
		refreshRecords: function(model,callback){
        	$.ajax({
                url: this.url()+'/all/'+model.get('orgId')+"/"+model.get('serviceId'),
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        }
	});

	return vendorServiceContractsCollection;

})