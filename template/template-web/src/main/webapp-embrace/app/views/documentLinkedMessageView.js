define(["backbone","app"],
		function(Backbone,app){
	
	var DocumentLinkedMessageView = Backbone.View.extend( {
		initialize: function(){
			console.log("Reached documentLinkedMessageView");
		},
		events:{
//			"click .file-upload-delete":"fileUploadDelete"
		},
		el:"#maincontainer",
		render:function () {
		},
		initializeLinkedMessage:function(formEl){
			console.log("formEl is",formEl,$(formEl));
			console.log("initializeLinkedMessage", this.model );
			formEl.find("#subject").html(this.model.get("subject"));
			formEl.find("#showMessage").html(this.model.get("messageTextPart2"));
		},
		
	});
	return DocumentLinkedMessageView;
});