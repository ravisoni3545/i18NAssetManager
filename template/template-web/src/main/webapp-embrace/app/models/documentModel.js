define(["backbone","app"],function(Backbone,app){
	var DocumentModel=Backbone.Model.extend( {
		defaults : {
			documentId:"",
			docType:"",
			fileName:"",
			object:null,
			objectId:null,
			vaultUpload:"",
			folderCodelistId:"",
			formId:null,
		},
		url :function (){
			var theURL = app.context()+'/document/update/' + this.get('documentId');
			return theURL;
		},
		idAttribute: "documentId",
		parse:function(response, options) {
			this.set(response);
			if (this.get('vaultUpload')=="on") this.set('isVaultUpload',"Y");
			else this.set('isVaultUpload',"N");
			return response;
		}
	});
	return DocumentModel;
});