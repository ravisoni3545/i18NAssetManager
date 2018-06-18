define([ "backbone", "app" ], function(Backbone, app) {
	var messageTemplateModel = Backbone.Model.extend({

		initialize: function () {
			_.bindAll(this);
        },
		
		defaults : {
			
		},
		
		url :function (){
			
			return app.context() + "/messageTemplates/";
		},

		deleteTemplate : function(data, callback){
			$.ajax({
                url: app.context()+'/messageTemplates/',
                contentType: 'application/json',
                dataType:'json',
                type: 'DELETE',
                async:false,
                data: JSON.stringify(data),
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });

		},
		editTemplate : function(data, callback){
			$.ajax({
                url: app.context()+'/messageTemplates/',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                async: false,
                data: JSON.stringify(data),
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });

		},
		createTemplate: function(data, callback){
			$.ajax({
                url: app.context()+'/messageTemplates/',
                contentType: 'application/json',
                dataType:'json',
                type: 'PUT',
                async: false,
                data: JSON.stringify(data),
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });

		},
		getTemplateInfo : function(id, callback){
			console.log("fetchin template info");
			$.ajax({
                url: app.context()+'/messageTemplates/' + id,
                contentType: 'application/json',
                type: 'GET',
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });

		},
	
        
	});
	
	return messageTemplateModel;

});