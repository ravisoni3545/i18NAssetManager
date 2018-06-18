define(["backbone","app"],function(Backbone,app){
	
	var DocumentTemplateModel = Backbone.Model.extend({
		initialize: function() {
		},
		defaults : {
			templateContent: "",
			templateFormat: "PDF",
			templateTitle: "",
			templateType: ""
		},
		idAttribute: "documentTemplateId",
		parse : function (response, options) {
			console.log("DocumentTemplateModel parse",response);
			if (response.statusCode=="200 Ok") {
				if (response.documentTemplates!=null)
					return response.documentTemplates[0];
				else return this.toJSON();
			}
			else 
				return this.toJSON();
		}
	});
	return DocumentTemplateModel;
});
