define([ "backbone", "app" ], function(Backbone, app) {
	var MyAssetsModel = Backbone.Model.extend({

		defaults : {
			investorName:null,
			propertyStatus:null,
			propertyId:null,
			investorId:null,
			propertyManagerName:null,
			propertyManagerId:null,
			propertyInfo:null,
			assetManagerId:null,
			hil:null,
			expiringLeases:null,
			tag:null
		},
		assetId:null,
		url :function (){
			return app.context()+'/myAssets/singleAsset/'+this.assetId;
		},
		updateAssetInfo: function(req, callback){
			var postdata = req;
			$.ajax({
                url: app.context()+'/myAssets/update',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(postdata),
                success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
	

	});

	return MyAssetsModel;

})