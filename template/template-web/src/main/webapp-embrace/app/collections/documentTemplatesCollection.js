define([ "backbone" ,"models/documentTemplateModel","app"], function(Backbone,documentTemplateModel,app) {
	
	var DocumentTemplatesCollection = Backbone.Collection.extend ({
		initialize : function() {
			var self = this;
		},
		model : documentTemplateModel,
		url : app.context() + "/documenttemplates"
	
	});
	return DocumentTemplatesCollection;
})