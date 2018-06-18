define([ "backbone", "app","models/myTasksModel"], function(Backbone, app,myTasksModel){
	var tasks = Backbone.Collection.extend({
        model: myTasksModel,
        
/*        initialize: function(models, options) {
            this.id = options.id;
          },*/
        
        url: function() {
            return app.context()+'/mytasks/'+app.sessionModel.get("userId");
          }      
    	});

return tasks;
});