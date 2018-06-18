define(["backbone","app", "text!templates/opportunitesPropertyActions.html"],
		function(Backbone,app,opportunitesPropertyActionsTemplate){
	
	var opportunityPropertyActionsView = Backbone.View.extend( {
		initialize: function(options){
			this.template = _.template(opportunitesPropertyActionsTemplate);
			this.html = this.template();
		},
		el:"#opportunityProperties",
		render : function (context) {
		},
		getButtonsView: function (taskKey) {
			var buttonHtml = $(this.html).find('#buttonsViews #'+taskKey).html();
			return buttonHtml;
		},
		getActionView: function (taskKey) {
			var formHtml = $(this.html).find('#actionsViews #'+taskKey+'_FORM tbody')[0].innerHTML;
			return formHtml;
		}
	});
	return opportunityPropertyActionsView;
});
