define([ "backbone", "app" ], function(Backbone, app) {
	var codeModel = Backbone.Model.extend({

		defaults : {
			id: null,
			codeDescription: null,
			codeDisplay: null,
			codeGroup: null,
			isDefault: null,
			isDeleted: null
		},
		
		url :function (){
			var gurl=app.context()+ "/code";
			return gurl
		},
		fetchByCodeGroup : function(codeGroup, callback){
			$.ajax({
                url: this.url() + '/all/' + codeGroup,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                success: function(res){
                	console.log(res);
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
		},
	});

	return codeModel;

})