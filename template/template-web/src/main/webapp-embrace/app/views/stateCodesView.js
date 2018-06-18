define(["text!templates/stateCodes.html", "backbone","app","models/stateModel","collections/statesCollection"],
		function(statesTemplate, Backbone,app,stateModel,states){
	
	var stateCodesView = Backbone.View.extend( {
		initialize: function(){
			statesList = new states(null, { view: this } );
			var allStatesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/state/all",
				async : false
			});
			allStatesResponseObject.done(function(response) {
				_.each(response, function(state){
					statesList.add(new stateModel (state));
				});
			});
			allStatesResponseObject.fail(function(response) {
				console.log("Error in retrieving states "+response);
			});
			this.statesList = statesList;
		},
		el:"#states",
		render : function (el) {
			if(el) {
				this.$el = el.el;
			}
			this.template = _.template( statesTemplate, {states:this.statesList.toJSON()});
			this.$el.html("");
			this.$el.html(this.template);
	     	return this;
		}
	});
	return stateCodesView;
});