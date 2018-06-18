define([ "backbone" ], function(Backbone) {
	var stateModel = Backbone.Model.extend({

		defaults : {
			stateId: null,
			name: null,
			code: null
		},
		
		url :function (){
			var gurl=app.context()+ "/state";
			return gurl
		},
	});

	return stateModel;

})