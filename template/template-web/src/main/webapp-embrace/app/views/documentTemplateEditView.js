define(["backbone",
	"app",
	"text!templates/documentTemplateStatus.html","text!templates/documentTemplateEdit.html",
	"collections/documentTemplatesCollection", "collections/docusignTemplateCollection"

	],
	function(Backbone, app, docTemplStatusPage, docTemplEditPage, documentTemplatesCollection, docusignTemplateCollection){
	
		var DocumentTemplateEditView = Backbone.View.extend({
			initialize: function(options){
				console.log("DocumentTemplateEditView initialize");
				this.templateTypes = ["closing","asset","investor","vendor","opportunity","rehab"];
				this.templateFormats = ["PDF","Word","Excel"];
			},
			el:"#mainContainer",
			render : function(){
				var formContent = _.template(docTemplEditPage);
				var formHtml = formContent(this.formData);
				$("#documentTemplateView .documentTemplateArea").html(formHtml);
				$("#documentTemplateView .modal-footer").html(this.footerButtonsTemplate( { action : this.action } ) );
				$("#documentTemplateView").modal("show");
				
				$('.modal input[name="templateType"]').on("change",this,this.validateTemplateType);
				$('.modal input[name="templateFormat"]').on("change",this,this.validateTemplateFormat);
				$('.modal input[type="text"]').on("change",this,this.checkBlanks);
				$('.modal').on('keypress', function(e) {
			        if ( e.keyCode == 13 ) {  // detect the enter key
			            $('button.submit').click();
			        }
			    });
				return this;
			},
			validateTemplateType : function (evt) {
				console.log("validateTemplateType",evt);
				var typeVal = $(evt.currentTarget).val();
				var self = evt.data;
				var msg = "";
				var typ = "type";
				console.log("self.templateTypes",self.templateTypes,typeVal,self.templateTypes.indexOf(typeVal));
				if (self.templateTypes.indexOf(typeVal)<0) {
					msg = "Task Type must be one of these: " + self.templateTypes.join(", ");
					self.showError(typ,msg);
				} else self.clearErrors(typ); 
			},
			validateTemplateFormat : function (evt) {
				console.log("validateTemplateFormat",evt);
				var typeVal = $(evt.currentTarget).val();
				var self = evt.data;
				var msg = "";
				var typ = "format";
				if (self.templateFormats.indexOf(typeVal)<0) {
					msg = "Document Format must be one of these: " + self.templateFormats.join(", ");
					self.showError(typ,msg);
				} else self.clearErrors(typ);
			},
			checkBlanks : function (evt) {
				console.log("checkBlanks",evt);
				var foundError=false;
				_.each($('.modal input[type="text"]'),function(itm){
					if ($(itm).val()=="") foundError=true;
				})
				var msg = "Title, Task Type, and Content must not be blank";
				var typ = "blanks";
				if (foundError) evt.data.showError(typ,msg);
				else evt.data.clearErrors(typ);
			},
			showError : function (typ, msg) {
				console.log("showError",$("p."+typ).length);
				if ($("p."+typ).length==0)
					$(".documentTemplateErrorMessage").append(this.errorTemplate({ "err" : typ, "message" : msg }));
				$("button.submit").prop( "disabled", true );
			},
			clearErrors : function (typ) {
				$(".documentTemplateErrorMessage p."+typ).remove();
				if ($(".documentTemplateErrorMessage").html()=="")
					$("button.submit").prop( "disabled", false );
			},
			errorTemplate : _.template('<p class="<%= err %>" style="color:red;text-align:center;"><%= message %></p>'),
			footerButtonsTemplate : _.template(
				'<button name="cancelCreateTemplate" type="button"  class="btn default" data-dismiss="modal"> CANCEL</button>' +
				'<button name="<%= action %>TemplateBtn" type="button" class="submit btn blue" > <%= action.toUpperCase() %></button>'
			) // CREATE or EDIT
		});
		
		
		
		return DocumentTemplateEditView;
});