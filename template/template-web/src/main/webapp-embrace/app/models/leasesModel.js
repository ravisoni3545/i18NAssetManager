define(["backbone", "app"],function(Backbone, app){
	var LeasesModel=Backbone.Model.extend({
		defaults : {
			assetId:null,
			leaseId:null,
			startDate:null,
			endDate:null,
			moveinDate:null,
			moveoutDate:null,
			securityDeposit:null,
			monthlyRent:null,
			leaseContact:null
		}
	});
	return LeasesModel;

})