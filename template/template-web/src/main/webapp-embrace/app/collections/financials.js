define([ "backbone", "app","models/financialModel" ], function(Backbone, app,financialModel){
	var financials = Backbone.Collection.extend({
        model: financialModel,
        
/*        initialize: function(models, options) {
            this.id = options.id;
          },*/
        objectId:{},
        object:{},
        
        url: function() {
            return app.context()+'/account/read/'+this.object+'/'+this.objectId;
          }      
    	});

return financials;
});