define([ "backbone", "app" ], function(Backbone, app) {
	var vendorServiceProductModel = Backbone.Model.extend({

		initialize: function () {

        },
		defaults : {
			orgId:null,
			serviceId:null,
        	vendorServiceId:null,
			productId:null,
			vendorServiceProductId:null,
			effectiveDate:null,
			expirationDate:null,
			feeAmountUsd:null,
			productName:null
		},
		url :function (){
			var gurl=app.context()+ "/vendor/product";
			return gurl
		},
		addVendorServiceProduct: function(callback){
			$.ajax({
                url: this.url()+'/create',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(this.attributes),
                success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        getVendorServiceProduct: function(productId,callback){
        	$.ajax({
                url: this.url()+'/'+productId,
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
        },
        updateVendorServiceProduct: function(callback){
        	$.ajax({
                url: this.url()+'/update',
                contentType: 'application/json',
                dataType:'json',
                type: 'PUT',
                data: JSON.stringify(this.attributes),
                success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        deleteVendorServiceProduct: function(productId,callback){
			$.ajax({
                url: this.url()+'/delete'+'/'+productId,
                contentType: 'application/json',
                dataType:'json',
                type: 'DELETE',
                success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        }
        
	});

	return vendorServiceProductModel;

});