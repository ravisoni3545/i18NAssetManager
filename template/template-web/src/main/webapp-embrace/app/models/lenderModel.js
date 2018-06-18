define([ "backbone" ], function(Backbone) {
	var lenderModel = Backbone.Model.extend({

		defaults : {
			orgId:null,
			orgName:null
		},
		
		url :function (){
			var gurl=app.context()+ "/lender";
			return gurl;
		},
	});

	return lenderModel;

})