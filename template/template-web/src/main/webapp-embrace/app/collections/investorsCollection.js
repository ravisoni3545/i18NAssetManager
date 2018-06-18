define([ "backbone", "app","models/myInvestorsModel"], function(Backbone, app,myInvestorsModel){
	var investors = Backbone.Collection.extend({
        model: myInvestorsModel,
        
/*        initialize: function(models, options) {
            this.id = options.id;
          },*/
        
        url: function() {
            return app.context()+'/myinvestors/'+app.sessionModel.get("userId");
          }      
    	});

return investors;
});