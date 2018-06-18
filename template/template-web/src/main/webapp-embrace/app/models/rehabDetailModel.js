define([ "backbone", "app" ], function(Backbone, app) {
	var rehabDetailModel = Backbone.Model.extend({

		initialize: function () {

        },
		defaults : {
			rehabId : null,
		},
		url :function (){
			var gurl=app.context()+ "/rehab";
			return gurl;
		},
		getRehabInfo: function(rehabId,callback){
			$.ajax({
                url: this.url()+'/'+rehabId,
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

	return rehabDetailModel;

});