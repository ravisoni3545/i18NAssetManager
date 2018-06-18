define([ "backbone", "app" ], function(Backbone, app) {
	var wishlistModel = Backbone.Model.extend({

		initialize: function () {
            _.bindAll(this);

        }
        
	});

	return wishlistModel;

});