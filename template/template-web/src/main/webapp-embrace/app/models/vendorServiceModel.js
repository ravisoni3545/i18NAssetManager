define([ "backbone", "app" ], function(Backbone, app) {
	var vendorServiceModel = Backbone.Model.extend({

		initialize: function () {

        },
		defaults : {
			orgId : null,
			serviceId : null,
		},
		url :function (){
			var gurl=app.context()+ "/vendor/service";
			return gurl
		},
		addVendorService: function(callback){
			var postdata = this.attributes;
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
        deleteVendorService: function(callback){
			var postdata = this.attributes;
			$.ajax({
                url: this.url()+'/delete',
                contentType: 'application/json',
                dataType:'json',
                type: 'DELETE',
                data: JSON.stringify(postdata),
                success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        }
        
	});

	return vendorServiceModel;

});