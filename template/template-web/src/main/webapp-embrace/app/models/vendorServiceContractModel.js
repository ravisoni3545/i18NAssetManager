define([ "backbone", "app" ], function(Backbone, app) {
	var vendorServiceContractModel = Backbone.Model.extend({

		initialize: function () {

        },
		defaults : {
			orgId:null,
			serviceId:null,
        	vendorServiceId:null,
			contractId:null,
			dateSigned:null,
			effectiveDate:null,
			expirationDate:null,
			comments:null,
			documentId:null
		},
		url :function (){
			var gurl=app.context()+ "/vendor/contract";
			return gurl
		},
		addVendorServiceContract: function(form,callback){
			form.attr("enctype","multipart/form-data");
			form.ajaxSubmit({
    	        url: this.url()+'/create',
    	        async:false,
    	        success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
    	    });
        },
        getVendorServiceContract: function(contractId,callback){
        	$.ajax({
                url: this.url()+'/'+contractId,
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
        updateVendorServiceContract: function(form,callback){
        	form.attr("enctype","multipart/form-data");
        	form.ajaxSubmit({
    	        url: this.url()+'/update',
    	        async:false,
    	        success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
    	    });
        },
        deleteVendorServiceContract: function(callback){
			$.ajax({
                url: this.url()+'/delete'+'/'+this.get('contractId'),
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

	return vendorServiceContractModel;

});