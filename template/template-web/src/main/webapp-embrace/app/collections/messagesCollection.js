define([ "backbone" ,"models/messagesModel","app"], function(Backbone,messagesModel,app) {
	
	var MessagesCollection = Backbone.Collection.extend({

		initialize: function () {
			
	    },
	    object:{},
	    objectId:{},
	    model:messagesModel,
	    url: function() {
            return app.context()+'/messages/'+this.objectId+'/'+this.object;
          }  
	});

	return MessagesCollection;

})