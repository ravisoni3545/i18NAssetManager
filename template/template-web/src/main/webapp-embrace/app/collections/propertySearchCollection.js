define([ "backbone" ,"models/propertySearchModel","app"], function(Backbone,propertySearchModel,app) {
	
	var propertySearchCollection = Backbone.Collection.extend({

		initialize: function () {
			
	    },
	    model:propertySearchModel,
	    url: function() {
            return app.context()+'/property/search/';
        },
        fetchPropertySearch: function(formData, callback){
        	var postData = formData;
        	$.blockUI({	
        		baseZ: 999999,
        		message: '<div><img src="assets/img/loading.gif" />Just a moment...</div>'
        	});
        	$.ajax({

        		url:this.url(),
        		contentType: 'application/json',
        		dataType:'json',
        		type:'POST',
        		data:JSON.stringify(postData),
        		success:function(res){
        			if(res){
        				callback.success(res);
        			}
        			else{
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

	return propertySearchCollection;

})