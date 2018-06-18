define([ "backbone", "app","models/rehabItemModel" ], function(Backbone, app,rehabItemModel){
	var rehabItemsCollection = Backbone.Collection.extend({
        model: rehabItemModel,
        rehabId:null,
        propertyName:"",
        REPLACE_MODEL:"REPLACE_MODEL",
        DELETE_MODEL:"DELETE_MODEL",
        gurl: function(){
          return app.context()+'/rehabItems/';
        },
        url: function() {
          return this.gurl() + this.rehabId;
      	},
      	fetchRehabItems:function(callback){
  			var self=this;
        	$.ajax({
                url: self.url(),
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                success: function(res){
                	self.reset(res.rehabItemResponseList);
                	callback.success(res.huFeeEstimated,res.huFeeActual);
                },
                error: function(res){
                    callback.error(res);
                }
            });
      	},
        saveRepairItemDetails: function(obj,callBack){
          var self = this;
          $.ajax({
                url: self.gurl() + 'saveRehabItem/' + self.rehabId,
                contentType: 'application/json',
                dataType:'text',
                type: 'POST',
                data: JSON.stringify(obj),
                success: function(res){
                  self.refreshCollection(JSON.parse(res),self.REPLACE_MODEL);
                  callBack.success();
                },
                error: function(){
                   callBack.error();
                }
            });
        },
        fetchRehabVendorsAndServices:function(callBack){
          var self = this;
          $.ajax({
            url: app.context() + 'company/rehabVendorsAndServices',
            contentType: 'application/json',
            type: 'GET',
            async:true,
            success: function(res){
              callBack.success(res);
            },
            error: function(res){
              callBack.error(res);
            }
          });
        },
      	deleteRehabItem: function(rehabItemId,callBack){
          var self = this;
      		$.ajax({
    				url: self.gurl() + 'deleteRehabItem/'+ rehabItemId,
    				contentType: 'application/json',
    				type: 'DELETE',
    				success: function(res){
              self.refreshCollection(res,self.DELETE_MODEL);
    					callBack.success(res);
    				},
    				error: function(res){
    					callBack.error(res);
    				}
    			});
      	},
        refreshCollection:function(repairItem,arg){
          var self = this;
          var requiredModel = self.findWhere({rehabItemId: repairItem.rehabItemId});
          var index = self.indexOf(requiredModel);
          if(arg == self.REPLACE_MODEL){
            self.remove(self.at(index));
            self.add(repairItem, {at: index});
          } else if (arg == self.DELETE_MODEL){
            self.remove(self.at(index));
          }
          // self.trigger("CollectionChanged",self);
        }  
	});

	return rehabItemsCollection;
});