define([ "backbone", "app", "text!templates/mortgageSearchHeader.html","text!templates/mortgageSearchResults.html","components-dropdowns", "components-pickers"], 
	function(Backbone, app, mortgageSearchHeader,mortgageSearchResults) {
	
		var MortgageSearchView = Backbone.View.extend({
		initialize : function() {

		},
		events : {
			'click #searchMortgageRecords' : 'searchMortgageRecords'
		},
		self : this,
		el : {},
		
		render : function(){
			var thisPtr=this;
			thisPtr.template= _.template( mortgageSearchHeader );
			thisPtr.$el.html("");

			thisPtr.$el.html(thisPtr.template);
		},
		
		searchMortgageRecords : function(){
		alert("in search mortgage records");	
		}
		
			
	});
	return MortgageSearchView;
});