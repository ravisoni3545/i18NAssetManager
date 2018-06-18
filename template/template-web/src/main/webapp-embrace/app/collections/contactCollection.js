define([ "backbone", "app","models/contactModel" ], function(Backbone, app,contactModel){
	var contacts = Backbone.Collection.extend({
        model: contactModel,
        
        initialize: function() {
            //this.objectId = params.objectId;
          },
        
        url: function() {
            return app.context()+'/contact/readByObjectId/'+this.object+'/'+this.objectId;
          }      
    	});

return contacts;
});