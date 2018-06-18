define([ "backbone", "app" ], function(Backbone, app) {
	var opportunityModel = Backbone.Model.extend({

		initialize: function () {

        },
		defaults : {
			opportunityId : null
		},
		url :function (){
			var gurl=app.context()+ "/opportunity";
			return gurl;
		},
		getOpportunityInfo: function(opportunityId,callback){
			$.ajax({
                url: this.url()+'/get/'+opportunityId,
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

	return opportunityModel;

});