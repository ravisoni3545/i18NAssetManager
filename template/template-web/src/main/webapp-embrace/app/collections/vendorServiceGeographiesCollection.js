define([ "backbone","app" ], function(Backbone,app) {
	
	var vendorServiceGeographiesCollection = Backbone.Collection.extend({

		initialize: function (model, options) {
	    },
	    url: function (){
			var gurl=app.context()+ "/vendor/geography";
			return gurl
		},
		addVendorServiceGeographies: function(callback){
			var postdata = this.toJSON();
			$.ajax({
                url: this.url()+'/create',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(postdata),
                success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
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

	return vendorServiceGeographiesCollection;

})