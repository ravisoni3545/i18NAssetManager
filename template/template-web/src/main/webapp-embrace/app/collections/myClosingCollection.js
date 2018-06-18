define([ "backbone" ,"models/myClosingModel","app"], function(Backbone,myClosingModel,app) {
	
	var MyClosingCollection = Backbone.Collection.extend({
		initialize: function () {
			
	    },
	    model:myClosingModel,
	    url: function() {
	    	var url = app.context()+'/closing/allclosings';
	    	return url;
        },
        fetchMyClosings: function(formData, callback) {
        	var postdata=formData;
        	$.blockUI({
	     		baseZ: 999999,
	     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
		     });
			$.ajax({
	                url: this.url(),
	                contentType: 'application/json',
	                dataType:'json',
	                type: 'POST',
	                data: JSON.stringify(postdata),
	                success: function(res){
	                	//alert(res);
	                    if(res){
	                        callback.success(res);
	                    }else{
	                        callback.error(res);
	                    }
	                    $.unblockUI();
	                },
	                error: function(res){
	                    callback.error(res);
	                    $.unblockUI();
	                }
	            });
        }
	});

	return MyClosingCollection;

})