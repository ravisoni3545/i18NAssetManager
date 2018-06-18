define(["text!templates/lenders.html", "backbone","app","models/lenderModel","collections/lendersCollection"],
		function(lendersTemplate, Backbone,app,lenderModel,lenders){
	
	var lendersView = Backbone.View.extend( {
		initialize: function() {
			
		},
		el:"#lendersList",
		populateView: function() {
			var huLendersList = new lenders(null, { view: this } );
			var nonHuLendersList = new lenders(null, { view: this } );
			var allLendersResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/company/lender/all/",
				async : false
			});
			allLendersResponseObject.done(function(response) {
				_.each(response.huLenders, function(lender){
					huLendersList.add(new lenderModel (lender));
				});
				_.each(response.nonHuLenders, function(lender){
					nonHuLendersList.add(new lenderModel (lender));
				});
			});
			allLendersResponseObject.fail(function(response) {
				console.log("Error in retrieving lenders "+response);
			});
			this.huLendersList = huLendersList;
			this.nonHuLendersList = nonHuLendersList;
		},
		render : function (el) {
			this.populateView();
			if(el) {
				this.$el = el.el;
			}
			this.template = _.template( lendersTemplate, { lenders: {huLenders:this.huLendersList.toJSON(),
				nonHuLenders:this.nonHuLendersList.toJSON()} });
			this.$el.html("");
			this.$el.html(this.template);
			
			/*$('#lendersDropdown').selectpicker({
		    	iconBase: 'fa',
		        tickIcon: 'fa-check'
		    });*/
	     	return this;
		},
	});
	return lendersView;
});