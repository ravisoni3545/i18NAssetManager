define(["text!templates/codes.html", "backbone","app","models/codeModel","collections/codesCollection"],
		function(codesTemplate, Backbone,app,codeModel,codes){
	
	var codesView = Backbone.View.extend( {
		initialize: function(options){
			if (options) {
				this.codeGroup = options.codeGroup;
			}
		},
		el:"#codes",
		render : function (context) {
			this.promise = this.fetchAllCodes(context);
	     	return this;
		},
		fetchAllCodes : function(context) {
			var self = this;
			if(context && !context.multiple) {
				context.multiple = false;
			}
			//codesList = new codes(null, { view: this } );
			var allcodesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/code/all/"+this.codeGroup,
				async : true
			});
			allcodesResponseObject.done(function(response) {
//				_.each(response, function(code){
//					codesList.add(new codeModel (code));
//				});
				var templateOptions = {};
				if(context) {
					self.$el = context.el;
					templateOptions.codeParamName = context.codeParamName;
					templateOptions.addBlankFirstOption = context.addBlankFirstOption;
					templateOptions.addFirstOptionShowAll = context.addFirstOptionShowAll;
					templateOptions.multiple = context.multiple;
				}
				templateOptions.codes = response;
				if(!templateOptions.multiple) {
					templateOptions.multiple = false;
				}
				//console.log(templateOptions);
				self.template = _.template( codesTemplate, templateOptions);
				self.$el.html("");
				self.$el.html(self.template);
				ComponentsDropdowns.init();
				if(self.callback) {
					self.callback();
				}
			});
			allcodesResponseObject.fail(function(response) {
				console.log("Error in retrieving codes "+response);
			});
			//this.codesList = codesList;
			return allcodesResponseObject;
		}
	});
	return codesView;
});