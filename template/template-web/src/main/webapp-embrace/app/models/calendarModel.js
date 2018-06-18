define([ "backbone", "app" ], function(Backbone, app) {
	var calendarModel = Backbone.Model.extend({

		initialize: function () {
            _.bindAll(this);

        },
		
		defaults : {

		}
	});

	return calendarModel;

});