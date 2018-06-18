define([ "backbone", "app" ], function(Backbone, app) {
	var investorProfileModel = Backbone.Model.extend({

		initialize: function () {

        },
		url :function (){
			var gurl=app.context()+ "/investorProfile";
			return gurl;
		}
		
	});

	return investorProfileModel;

});