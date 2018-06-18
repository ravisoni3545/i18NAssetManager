define([ "backbone" ], function(Backbone) {
	var utilityModel = Backbone.Model.extend({

		defaults : {
			
		},
		
		url :function (){
			var gurl=app.context()+ "/state";
			return gurl
		},
		
		fetchCompanies : function(serviceName,callback){
			
			var self=this;
			var allCompaniesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+ "/company/service/"+serviceName,
					async : false
				});
	    	 allCompaniesResponseObject.done(function(response) {
					self.escrowCompanies=response;
				});
	    	 allCompaniesResponseObject.fail(function(response) {
					
				});
		}
	});

	return utilityModel;

});