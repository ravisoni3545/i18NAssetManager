define([ "backbone", "app","models/propertyUnitModel" ], function(Backbone, app,unitModel){
	var propertyUnitCollection = Backbone.Collection.extend({
        model: unitModel,
      	investmentId:null,
        assetId:null,
        REPLACE_MODEL:"REPLACE_MODEL",
        DELETE_MODEL:"DELETE_MODEL",
        url: function() {
            return app.context() + '/propertyUnits/fetch/' + this.investmentId;
      	},
        fetch : function(callBack) {
          var collection = this;
          $.ajax({
              type : 'GET',
              url : collection.url(),
              dataType : 'json',
              async: false,
              success : function(data) {
                  console.log(data);
                  collection.reset(data.propertyUnits);
                  callBack.success(data);
                  collection.trigger("CollectionChanged",collection);
              },
              error : function(data){
                callBack.error();
              }
          });
        },
        savePropertyUnit:function(obj,callBack){
          var self = this;
          $.ajax({
              url: app.context()+'propertyUnits/addNewUnit',
              contentType: 'application/json',
              dataType:'json',
              type: 'POST',
              data: JSON.stringify(obj),
              success: function(res){
                self.refreshCollection(res.singleUnit,self.REPLACE_MODEL);
                callBack.success();
              },
              error: function(res){
                console.log("Error in saving property unit data");
                 callBack.error(res);
              }
          });
        },
        deletePropertyUnit:function(unitId,callBack){
          var self = this;
          $.ajax({
              url: app.context()+'propertyUnits/deleteUnit/' + unitId,
              contentType: 'application/json',
              dataType:'json',
              type: 'DELETE',
              success: function(res){
                self.refreshCollection(res.singleUnit,self.DELETE_MODEL);
                callBack.success();
              },
              error: function(res){
                console.log("Error in deleting property unit");
                 callBack.error();
              }
          });
        },
        refreshCollection:function(propertyUnit,arg){
          var self = this;
          var requiredModel = self.findWhere({unitId:propertyUnit.unitId});
          var index = self.indexOf(requiredModel);
          if(arg == self.REPLACE_MODEL){
            self.remove(self.at(index));
            self.add(propertyUnit, {at: index});
          } else if (arg == self.DELETE_MODEL){
            self.remove(self.at(index));
          }
          self.trigger("CollectionChanged",self);
        }
	});
  return propertyUnitCollection;
});