define([ "backbone" ,"models/documentModel","app"], function(Backbone,documentModel,app) {
	
	var DocumentCollection = Backbone.Collection.extend({

		initialize: function () {
			
	    },
	    model:documentModel,
	    object:{},
	    objectId:{},
	    url: function() {
            return app.context()+'/document/fetchDocument/'+this.object+'/'+this.objectId;
          },
        parse: function (response, options) {
        	return response;
        }
	});
	return DocumentCollection;
})