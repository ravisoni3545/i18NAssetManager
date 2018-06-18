define([ "backbone", "app","models/rehabRepairModel" ], function(Backbone, app,rehabRepairModel){
	var rehabRepairCollection = Backbone.Collection.extend({
        model: rehabRepairModel,
      	object:null,
        objectId:null,
        url: function() {
            return app.context()+'/rehabRepair/' + this.objectId;
      	},
      	saveRepairDetails: function(obj,callBack){
      		var self = this;
      		$.ajax({
                url: app.context()+'rehabRepair/saveRepairDetails/' + self.object + '/' + self.objectId,
                contentType: 'application/json',
                dataType:'text',
                type: 'POST',
                data: JSON.stringify(obj),
                success: function(res){
                	callBack.success(res);
                },
                error: function(res){
                   callBack.error(res);
                }
            });
      	},
      	deleteRepairDetails: function(rehabId,callBack){
      		$.ajax({
    				url: app.context() + 'rehabRepair/deleteRepairDetails/'+ rehabId,
    				contentType: 'application/json',
    				type: 'DELETE',
    				success: function(res){
    					callBack.success(res);
    				},
    				error: function(res){
    					callBack.error(res);
    				}
    			});
      	},
      	saveCategoryDetails: function(obj,callBack){
      		var self = this;
      		$.ajax({
                url: app.context()+'rehabRepair/saveRepairItem/' + self.object + '/' + self.objectId,
                contentType: 'application/json',
                dataType:'text',
                type: 'POST',
                data: JSON.stringify(obj),
                success: function(res){
                	callBack.success(res);
                },
                error: function(res){
                   callBack.error(res);
                }
            });
      	},
      	deleteCategoryDetails: function(rehabItemId,callBack){
          		$.ajax({
    				url: app.context() + 'rehabRepair/deleteRepairItem/'+ rehabItemId,
    				contentType: 'application/json',
    				type: 'DELETE',
    				success: function(res){
    					callBack.success(res);
    				},
    				error: function(res){
    					callBack.error(res);
    				}
    			});
      	},
        fetchRehabQuotedAmount: function(callBack){
          var self = this;
          $.ajax({
                url: app.context() + 'rehabRepair/quotedRehabEstimate/'+ self.object + '/' + self.objectId,
                contentType: 'application/json',
                type: 'GET',
                async:false,
                success: function(res){
                  callBack.success(res);
                },
                error: function(res){
                  callBack.error(res);
                }
              });
        }       
	});

return rehabRepairCollection;
});