define([ "backbone","app" ], function(Backbone,app) {
	
	var closingStepsCollection = Backbone.Collection.extend({

		initialize: function (model, options) {
	    },
	    object: 'Investment',
	    url: function (){
			var gurl=app.context()+ "/closing/tasks";
			return gurl;
		},
		getClosingSteps: function(investmentId,callback){
        	$.ajax({
                url: this.url()+'/all/'+this.object+"/"+investmentId,
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

	return closingStepsCollection;

})