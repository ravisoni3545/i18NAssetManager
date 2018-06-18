define([ "backbone" ], function(Backbone) {
	var serviceModel = Backbone.Model.extend({

		defaults : {
			serviceId:null,
			serviceName:null,
			keyId:null
		},
		
		url :function (){
			var gurl=app.context()+ "/vendor/service";
			return gurl;
		},
	});

	return serviceModel;

})