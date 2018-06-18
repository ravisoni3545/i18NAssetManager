define([ "backbone", "app","models/labelModel" ], function(Backbone, app,labelModel){
	var labels = Backbone.Collection.extend({
        model: labelModel,
        
        labelValue:{},
        
        url: function() {
            return app.context()+'/label/searchByValue/'+this.labelValue;
          }      
    	});

return labels;
});