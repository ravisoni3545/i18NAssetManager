define([ "backbone", "app","models/inspectionCategoryModel" ], function(Backbone, app,inspectionCategoryModel){
	var inspectionCategoryCollection = Backbone.Collection.extend({
        model: inspectionCategoryModel,
        url: function() {
            return app.context()+ '/inspectionCategory/fetchInspectionCategoryData';
      	}     
	});

	return inspectionCategoryCollection;
});