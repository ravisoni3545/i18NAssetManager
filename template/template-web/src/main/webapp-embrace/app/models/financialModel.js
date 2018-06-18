define([ "backbone", "app" ], function(Backbone, app) {
	var financialModel = Backbone.Model.extend({

		initialize: function () {
            _.bindAll(this);

        },
		
		defaults : {

		}
	});

	return financialModel;

});