define([ "backbone", "app" ], function(Backbone, app) {
	var VendorLicenseModel = Backbone.Model.extend({

		defaults : {
			statusCode:null,
			message:null,
			objId:null,
			licenseType:null,
			licenseName:null,
			licenseNumber:null,
			expirationDate:null,
			statesCovered:null,
			terms:null,
			brokerNumber:null,
			organizationId:null,
			status:null,
			documentId:null,
			dateString:null,
			licenseId:null,
		},
		
		url :function (){
			
		}

	});

	return VendorLicenseModel;

})