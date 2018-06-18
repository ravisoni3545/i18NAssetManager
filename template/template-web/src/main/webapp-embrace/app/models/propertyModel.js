define([ "backbone", "app" ], function(Backbone, app) {
	var propertyModel = Backbone.Model.extend({

		initialize: function () {
			_.bindAll(this);
        },
		defaults : {
			"propertyId" : null
		},
		
		url :function (){
			return app.context()+"/property/"+encodeURIComponent(this.get("propertyId"));
		},
		updateModel: function (callback){
	
			var postdata = this.attributes;	
			postdata.dataStr = JSON.stringify(this.attributes.dataStr);
            console.log("postdata: " + postdata.dataStr);

			$.ajax({
                url: app.context()+'/property/edit',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(postdata),
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
		},
		getLastEditHistory : function (callback){

			$.ajax({
                url: app.context()+'/property/lastEdit/'+encodeURIComponent(this.get('propertyId')),
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
		},
		getHUSelectProperty : function(callback){

			$.ajax({
                url: app.context()+'/preSelectProperty/property/'+encodeURIComponent(this.get('propertyId')),
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async : false,
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
		}
          
	});

	return propertyModel;

});