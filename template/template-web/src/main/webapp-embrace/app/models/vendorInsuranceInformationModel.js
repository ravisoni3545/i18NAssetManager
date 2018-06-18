define([ "backbone", "app" ], function(Backbone, app) {
	var vendorInsuranceInformationModel = Backbone.Model.extend({
		
        defaults:{            
        	insuranceId:null,
        	coverageAmountUsd:null,
        	coverageAmountUsdString:null,
        	insuranceProvider:null,
        	policyNumber:null,
        	tblcontact:null,
        	statesCovered:null,
        	documentId:null,
			tblcodeList:null
        }
	});

	return vendorInsuranceInformationModel;
})