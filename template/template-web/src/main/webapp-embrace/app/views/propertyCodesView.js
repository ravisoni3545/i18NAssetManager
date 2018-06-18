define(["text!templates/propertyCodes.html", "backbone","app","models/codeModel","collections/codesCollection"],
		function(codesTemplate, Backbone,app,codeModel,codes){
	
	var codesView = Backbone.View.extend( {
		initialize: function(options){
			codesList = new codes(null, { view: this } );
			if (options) {
				this.codeGroup = options.codeGroup;
			}
			var allcodesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/code/all/property/"+this.codeGroup,
				async : false
			});
			allcodesResponseObject.done(function(response) {
				_.each(response, function(code){
					codesList.add(new codeModel (code));
				});
			});
			allcodesResponseObject.fail(function(response) {
				console.log("Error in retrieving codes "+response);
			});
			this.codesList = codesList;
		},
		el:"#codes",
		render : function (context) {
			var templateOptions = {};
			if(context) {
				this.$el = context.el;
				templateOptions.codeParamName = context.codeParamName;
				templateOptions.addBlankFirstOption = context.addBlankFirstOption;
				templateOptions.addFirstOptionShowAll = context.addFirstOptionShowAll;
			}
			templateOptions.codes = this.codesList.toJSON();
			this.template = _.template( codesTemplate, templateOptions);
			this.$el.html("");
			this.$el.html(this.template);
	     	return this;
		}
	});
	return codesView;
});