define([ "backbone", "app" ], function(Backbone, app) {
	var docPreviewModel = Backbone.Model.extend({

		initialize: function () {

        },
        loadDocumentPreview: function(docId,callback) {
        	$.ajax({
        		url:app.context()+'/document/downloadUrl/'+docId,
        		contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: true,
                success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
        	});
        }
	});

	return docPreviewModel;

});