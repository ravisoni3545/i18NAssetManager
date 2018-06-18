define([ "backbone", "app" ], function(Backbone, app) {
	var opportunitiesPropertyActionsModel = Backbone.Model.extend({

		initialize: function () {

        },
		defaults : {
			//investmentId : null,
		},
		url :function (){
			var gurl=app.context()+ "/hilOpportunityProperty";
			return gurl;
		},
		loadTaskData: function(taskKey,object,objectId,callback){
        	$.ajax({
                url: this.url()+'/task/'+object+'/'+objectId+'/'+taskKey,
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

	return opportunitiesPropertyActionsModel;

});