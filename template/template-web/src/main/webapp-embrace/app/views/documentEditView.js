define(["backbone","app"],
		function(Backbone,app){
	
	var DocumentEditView = Backbone.View.extend( {
		initialize: function(){
			console.log("Reached documentEditView");
		},
		events:{
//			"click .file-upload-delete":"fileUploadDelete"
		},
		el:"#maincontainer",
		render:function () {
		},
		initializeFileEdit:function(formEl,submitBtn){
			var self = this;

			console.log("formEl is",formEl,$(formEl),"model is:",this.model);
			var fName = this.model.get("fileName");
			if (fName==null) fName="";
			var fExt = (fName.indexOf('.')>=0) ? '.' + fName.split('.').pop() : "";
			fName = fName.substring(0,fName.length-fExt.length);
			console.log("initializeFileEdit", this.model, fName, formEl.find("form input#fileName") );
			formEl.find("form input#fileName").attr("value",fName);
			formEl.find("form#editedDocumentForm [name='docType']").val(this.model.get("docType"));
			var chkbox = formEl.find("form #editVaultUpload");
			if (this.model.get("isVaultUpload")=="Y")
				chkbox.prop("checked",true);
			else chkbox.prop("checked",false);
			if (this.model.get("folderCodelistId")!="")
				formEl.find("form [name='folderCodelistId']").val(this.model.get("folderCodelistId"));
	    	if($('#editVaultUpload').is(':checked')==true){
	    		$("#editFolderDiv").show();
	    	}
	    	else{
	    		$("#editFolderDiv").hide();
	    	}
		}
		
	});
	return DocumentEditView;
});