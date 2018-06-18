define([ "backbone" ,"models/insuranceModel","app"], function(Backbone,insuranceModel,app) {
	
	var InsuranceCollection = Backbone.Collection.extend({
		initialize: function () {
			
	    },
	    model:insuranceModel,
	    url: function() {
	    	var url = app.context()+'/insurance/insuranceClosings';
	    	return url;
        },
        fetchInsuranceClosings: function(formData, callback) {
        	var postdata=formData;
//        	$.blockUI({
//	     		baseZ: 999999,
//	     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
//		     });
			$.ajax({
	                url: this.url(),
	                contentType: 'application/json',
	                dataType:'json',
	                type: 'POST',
	                data: JSON.stringify(postdata),
	                success: function(res){
	                    if(res){
	                        callback.success(res);
	                    }else{
	                        callback.error(res);
	                    }
//	                    $.unblockUI();
	                },
	                error: function(res){
	                    callback.error(res);
//	                    $.unblockUI();
	                }
	            });
        }
	});

	return InsuranceCollection;

})