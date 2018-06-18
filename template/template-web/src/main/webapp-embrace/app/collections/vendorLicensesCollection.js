define([ "backbone" ,"models/vendorLicenceModel","app"], function(Backbone,vendorlicensemodel,app) {
	
	var VendorLicensesCollection = Backbone.Collection.extend({

		initialize: function () {
	    },
	    model:vendorlicensemodel,
	    url: function() {
            return app.context()+'/vendorLicense/readLicensesByOrgId/'+app.vendorId;
          }  
	});

	return VendorLicensesCollection;

})