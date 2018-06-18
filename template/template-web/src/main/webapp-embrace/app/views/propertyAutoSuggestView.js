define(["text!templates/propertyAutoSuggest.html", "backbone", "app", "views/codesView"],
		function(autoSuggestTemplate, Backbone, app, codesView){
	
	var propertyAutoSuggestView = Backbone.View.extend( {
		initialize: function(){
			this.oppPropertyStatusCodesView = new codesView({codeGroup:'OPP_PROP_STA'});
		},
		//This is Id of the div in which bootstrap select2 box with investor records will be loaded. 
		el:"#addPropertyOpportunity",
		opportunityId:"",
		render : function (context) {
			console.log("propertyAutoSuggest View Render");
			/*var templateOptions = {};
			if(context) {
				this.$el = context.el;
			}*/
			this.template = _.template( autoSuggestTemplate );
			this.$el.html("");
			this.$el.html(this.template({opportunityId:this.opportunityId}));
			this.oppPropertyStatusCodesView.render({el:$('#oppPropertyStatusSelect'),codeParamName:"propertyStatus",addFirstOptionShowAll:true});
			this.setupBootstrapSelect();
	     	return this;
		},
		setupBootstrapSelect : function() {
			var self = this;
			 this.investorNamesSelect = $('#propertyAutoSuggestDD').select2({
				 placeholder: "Search and Add Properties here",
				 multiple: false,
				 minimumInputLength: 1,
				 query: function (query) 
				 {
					 // if($.trim(query.term)!=""){
						 console.log("setupBootstrapSelect");
				 		 console.log(query);
						 var data = {results: []};
						 
						 var allPropertiesResponseObject = $.ajax({
							type : "GET",
							// url : app.context()+ "/investors/investorNames/"+query.term,
							url : app.context()+ "/property/autoSugggest/"+query.term+'/'+self.opportunityId,
							async : false
						 });
						 allPropertiesResponseObject.done(function(responses) {
							_.each(responses, function(response){
								
								data.results.push({id: response.propertyId, text: response.name});
							});
						 });
						 allPropertiesResponseObject.fail(function(response) {
							console.error("Error in retrieving properties "+response);
						 });
						 
						 query.callback(data);
					 // }
				 }
			 });
		},
	
	});
	return propertyAutoSuggestView;
});