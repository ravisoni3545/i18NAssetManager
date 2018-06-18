define([ "backbone", "app" ], function(Backbone, app) {
	var vendorPaymentModel = Backbone.Model.extend({

		initialize: function () {
            _.bindAll(this);

        },
		
		defaults : {
			//orgId:"1"
			orgId:app.vendorId
		},
		
		url :function (){
			var gurl=app.context()+ "/payment";
			return gurl
		},
		
		saveVendorPayment: function(callback){
			var postdata=app.vendorPaymentModel.attributes;
			postdata.orgId=app.vendorId;
			console.log(postdata);
			
            $.ajax({
                url: this.url()+'/create',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                async : false,
                data: JSON.stringify(postdata),
                success: function (res) {
                    if (!res.error) {
                        console.log("Successfully Registered");
                        console.log(res);
                        if (callback && 'success' in callback) callback.success('',res);
                    } else {
                        if (callback && 'error' in callback) callback.error('',res);
                    }
                },
                error: function (mod, res) {
                    if (callback && 'error' in callback) callback.error(res);
                }
            });
        },
        
        updateVendorPayment: function(callback){
			var postdata=app.vendorPaymentModel.attributes;
			postdata.orgId=app.vendorId;
            $.ajax({
                url: this.url()+'/update',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                async : false,
                data: JSON.stringify(postdata),
                success: function (res) {
                    if (!res.error) {
                        console.log("Successfully Updated");
                        console.log(res);
                        if (callback && 'success' in callback) callback.success('',res);
                    } else {
                        if (callback && 'error' in callback) callback.error('',res);
                    }
                },
                error: function (mod, res) {
                    if (callback && 'error' in callback) callback.error(res);
                }
            });
        },
        
        readVendorPayment: function(callback){
			var postdata=app.vendorPaymentModel.attributes;
			postdata.orgId=app.vendorId;
            $.ajax({
            	url: this.url()+'/'+postdata.orgId,
            	//url: this.url()+'/'+postdata.orgId+'/'+postdata.paymentMethod,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async : false,
                data: JSON.stringify(postdata),
                success: function (res) {
                    if (!res.error) {
                        console.log("Successfully Read");
                        console.log(res);
                        if (callback && 'success' in callback) callback.success('',res);
                    } else {
                        if (callback && 'error' in callback) callback.error('',res);
                    }
                },
                error: function (mod, res) {
                    if (callback && 'error' in callback) callback.error(res);
                }
            });
        }
        
	});

	return vendorPaymentModel;

});