define([ "backbone" ], function(Backbone) {
	var productModel = Backbone.Model.extend({

		defaults : {
			serviceId:null,
			productId:null,
			productName:null
		},
		
		url :function (){
			var gurl=app.context()+ "/product";
			return gurl;
		},
	});

	return productModel;

})