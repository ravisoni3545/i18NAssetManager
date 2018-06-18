define(['backbone',
	'app',
	'text!templates/editTemplateModal.html',
	"models/codeModel"],function(backbone, app, editTemplateModalTpl, codeModel){
		var editTemplateModalView = Backbone.View.extend({
		initialize : function(){

		},
		events : {
			"click button[name=saveTemplateBtn]":"saveChanges",
			"click a[name=showPreview]":"showPreview",
		},
		el:"#editTemplateModalDiv",
		render : function(templateId, theModel){
			if(!app.codeModel)
			{
				app.codeModel = new codeModel();
			}
			this.model = theModel;
			//console.log("rendering edit template Modal");
	    	this.template = _.template( editTemplateModalTpl );
	     	this.$el.html("");	     	
	     	var self = this;

	    	theModel.getTemplateInfo(templateId,{
	    			success: function(res){	    			
	    				//console.log("sucess templateInfo");
	     					app.codeModel.fetchByCodeGroup("OBJ_TYPE",{
				    			success: function(res2){
				    				//console.log("success objects");
							     	self.$el.html(self.template({templateInfo:res, objects: res2}));
				    				$("#editTemplateModal").modal('show');
				    				self.editUserFormValidation();
				    			},
				    			error: function(res2){
				    				console.log(res2);
				    				console.log("error in getting objects");
				    			}
				    	});
	    			},
	    			error: function(res){
	    				console.log(res);
	    				console.log("error in getting the template` INfo");
	    			}
	    	});

	    	

		},
		showPreview : function(){
		 CKEDITOR.replace( 'editorOverview1' );
		 $('#preview').show();
		 CKEDITOR.instances.templateTextPreview.setData($('#templateText').val());

		},
		saveChanges : function(evt){
			var form1 = $('#editTemplateForm');
			var self = this;
			var data = {};

			//console.log("edit obj val: " + $('#editObject').val());

			console.log("tt val: "+ $('#templateText').val());

			if(form1.valid()){
				data["templateId"] = $(evt.target).closest('button').attr('template-id');
				data["templateName"]=$('#editTemplateName').val();
				data["templateSubject"]=$('#editTemplateSubject').val();
				data["templateObject"]=$('#editObject').val();
				data["templateFileName"]=$('#editTemplateFileName').val();
				data["templateText"]= $('#templateText').val();
				data["bccRec"]= $("#editBccRecipients").val();
				data["ccRec"]= $("#editCcRecipients").val();
				data["isDisplay"]=$("#editIsDisplayTemplate").val();
				data["isActive"]=$("#editIsActiveTemplate").val();
				data["fromName"]=$("#editTemplateFromName").val();
				data["fromEmail"]=$("#editTemplateFromEmail").val();
				data["toRole"]=$("#editTemplateToRole").val();
				data["bccRole"]=$("#editTemplateBccRole").val();
				data["ccRole"]=$("#editTemplateCcRole").val();

				

				self.model.editTemplate(data, {
									success: function(res){
					    				console.log("success edit");
					     				
					    			},
					    			error: function(res){
					    				console.log(res);
					    				console.log("error with edit");
					    			}
				});
				$('#editTemplateModal').modal('hide');
				$('body').removeClass('modal-open');
				$('.modal-backdrop').remove();

				app.messageTemplatesView.render();
			}
			else{
				console.log("form not valid");
			}


		},
		editUserFormValidation: function(){
		         // for more info visit the official plugin documentation: 
		             // http://docs.jquery.com/Plugins/Validation
		             console.log("edit form validation here");
		             var form1 = $('#editTemplateForm');
		             var error1 = $('#editTemplateFormError', form1);
		             var success1 = $('.alert-success', form1);

		             form1.validate({
		                 errorElement: 'span', //default input error message container
		                 errorClass: 'help-block', // default input error message class
		                 focusInvalid: false, // do not focus the last invalid input
		                 ignore: "",
		                 rules: {
		                     templateName: {
		                         minlength: 2,
		                         required: true
		                     },
		                     templateSubject: {
		                         minlength: 2
		                     },
		                     templateFileName :{
		                     	 minlength: 2,
		                     	 required: true
		                     },
		                     bccRecipients: {
		                         minlength: 2,
		                     },
		                     ccRecipients: {
		                         minlength: 2,
		                     },
		 					
		                 },

		                 invalidHandler: function (event, validator) { //display error alert on form submit              
		                     success1.hide();
		                     error1.show();
		                     App.scrollTo(error1, -200);
		                 },

		                 highlight: function (element) { // hightlight error inputs
		                     $(element)
		                         .closest('.form-group').addClass('has-error'); // set error class to the control group
		                 },

		                 unhighlight: function (element) { // revert the change done by hightlight
		                     $(element)
		                         .closest('.form-group').removeClass('has-error'); // set error class to the control group
		                 },

		                 success: function (label) {
		                     label
		                         .closest('.form-group').removeClass('has-error'); // set success class to the control group
		                 }
		             });

		     }


	});
		return editTemplateModalView;
});