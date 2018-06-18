define([ "backbone", "app","models/vendorContactModel" ], function(Backbone, app,vendorContactModel){
	var contacts = Backbone.Collection.extend({
        model: vendorContactModel,
        
/*        initialize: function(models, options) {
            this.id = options.id;
          },*/
        
        url: function() {
            return app.context()+'/contact/readByObjectId/Vendor/'+app.vendorId;
          }      
    	});

return contacts;
});