define(["backbone", "app"],function(Backbone, app){
	var MessagesModel=Backbone.Model.extend({
		defaults : {
			messageID:null,
			subject:null,
			messageText:null,
			createdDate:null,
			createdBy:null
	   }
	});
	return MessagesModel;

})