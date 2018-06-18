define([ "backbone" ,"app","models/vendorInsuranceInformationModel"], function(Backbone,app,vendorInsuranceInformationModel) {
	
	var vendorInsuranceInformationCollection = Backbone.Collection.extend({

		initialize: function () {
	    },
	    model:vendorInsuranceInformationModel,
	    url: function() {
	    	 return app.context()+'/VendorInsurance/readInsuranceByOrgId/'+app.vendorId;
          }    
	});

	return vendorInsuranceInformationCollection;

})