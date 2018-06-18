define([ "backbone", "app","models/opportunitesPropertiesModel" ], function(Backbone, app,opportunitesPropertiesModel) {
	
	var opportunitesPropertiesCollection = Backbone.Collection.extend({
		model: opportunitesPropertiesModel,
		opportunityId:"",
		initialize: function () {
	    },
	    url: function() {
            return app.context()+'/hilOpportunityProperty/fetchOpportunityProperties/' + this.opportunityId;
      	},
      	fetch : function(callBack) {
		    // store reference for this collection
		    var collection = this;
		    $.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
		    $.ajax({
		        type : 'GET',
		        url : collection.url(),
		        dataType : 'json',
		        success : function(data) {
		        	$.unblockUI();
		            console.log(data);
		            collection.reset(data.opportunityPropertyResponse);
		            callBack.success(data);
		        },
		        error : function(data){
		        	$.unblockUI();
		        	callBack.error(data);
		        }
		    });
		},
		initiateRightBid:function(hilOpportunityPropertyId,callBack){
			var collection = this;
			$.ajax({
                url: app.context()+'/hilOpportunityProperty/initiateRightBidProcess/' + hilOpportunityPropertyId,
                contentType: 'application/json',
                dataType:'text',
                type: 'GET',
                success: function(res){
                	/*if(res && JSON.parse(res).id && !_.isEmpty(JSON.parse(res).opportunityPropertyResponse)){
                		var model = collection.findWhere({hilOppPropertyId: JSON.parse(res).opportunityPropertyResponse.hilOppPropertyId});
                		console.log(model);
                		collection.findWhere({hilOppPropertyId: JSON.parse(res).opportunityPropertyResponse.hilOppPropertyId}) = JSON.parse(res).opportunityPropertyResponse;
                		console.log(collection.findWhere({hilOppPropertyId: JSON.parse(res).opportunityPropertyResponse.hilOppPropertyId}));
                	}*/
                	callBack.success(res);
                },
                error: function(res){
                   callBack.error(res);
                }
            });
		},
		removeProperty:function(hilOpportunityPropertyId,callBack){
			$.ajax({
                url: app.context()+'/hilOpportunityProperty/removeProperty/' + hilOpportunityPropertyId,
                contentType: 'application/json',
                dataType:'text',
                type: 'DELETE',
                success: function(res){
                	callBack.success(res);
                },
                error: function(res){
                   callBack.error(res);
                }
            });
		}
	});
	return opportunitesPropertiesCollection;
})