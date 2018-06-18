define([ "backbone", "app","models/wishlistModel" ], function(Backbone, app,wishlistModel){
	var wishlists = Backbone.Collection.extend({
        model: wishlistModel,
        
        initialize: function() {
            //this.objectId = params.objectId;
          },
        
        url: function() {
            return app.context()+'/investorProfile/wishlist/'+this.investorId;
          }      
    	});

return wishlists;
});