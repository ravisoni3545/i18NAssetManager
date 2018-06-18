define([ "backbone", "app" ], function(Backbone, app) {
	var labelModel = Backbone.Model.extend({

		initialize: function () {
            _.bindAll(this);

        },
		
		defaults : {

		}
	});

	return labelModel;

});