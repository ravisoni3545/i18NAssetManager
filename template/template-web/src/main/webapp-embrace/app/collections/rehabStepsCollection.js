define([ "backbone","app" ], function(Backbone,app) {
	
	var rehabStepsCollection = Backbone.Collection.extend({

		initialize: function (model, options) {
	    },
	    object: 'Rehab',
	    url: function (){
			var gurl=app.context()+ "/rehabSteps/tasks";
			return gurl;
		},
		getRehabSteps: function(rehabId,callback){
        	$.ajax({
                url: this.url()+'/all/'+this.object+"/"+rehabId,
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

	return rehabStepsCollection;

})