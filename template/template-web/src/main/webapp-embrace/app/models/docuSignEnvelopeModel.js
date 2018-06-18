define(["backbone","app"],function(Backbone,app){
	
	var DocuSignEnvelopeModel = Backbone.Model.extend({
		initialize: function() {
		},
		defaults : {
			templates  : [],
			roles      : [],
			emails     : [],
			object     : "",
			objectId   : ""
		}
	});
	return DocuSignEnvelopeModel;
});