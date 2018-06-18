define(["text!templates/investorListTemplate.html", "backbone", "app"],
		function(investorListTemplate, Backbone, app){
	
	var investorNamesView = Backbone.View.extend( {
		initialize: function(){
			
		},
		//This is Id of the div in which bootstrap select2 box with investor records will be loaded. 
		el:"#investorNames",
	
		render : function (context) {
			var templateOptions = {};
			if(context) {
				this.$el = context.el;
			}
			this.template = _.template( investorListTemplate, templateOptions);
			this.$el.html("");
			this.$el.html(this.template);
			this.setupBootstrapSelect(this);
	     	return this;
		},
		setupBootstrapSelect : function(view) {
			 this.investorNamesSelect = $('#investorNamesList').select2({
				 placeholder: "Enter investors name",
				 multiple: false,
				 query: function (query) 
				 {
				 if($.trim(query.term)!=""){
					 
					 var data = {results: []};
					 
					 var allInvestorsResponseObject = $.ajax({
						type : "GET",
						url : app.context()+ "/investors/investorNames/"+query.term,
						async : false
					 });
					 allInvestorsResponseObject.done(function(responses) {
						_.each(responses, function(response){
							
							data.results.push({id: response.id, text: response.name});
						});
					 });
					 allInvestorsResponseObject.fail(function(response) {
						console.error("Error in retrieving investors "+response);
					 });
					 
					 query.callback(data);
				 }
				 }
			 });
		},
	
	});
	return investorNamesView;
});