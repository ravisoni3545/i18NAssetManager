define(["backbone","app","text!templates/document.html","views/codesView","views/documentEditView",
        "views/documentTemplatesView","views/documentLinkedMessageView",
        "views/messagesView","collections/messagesCollection","views/documentPreviewView","views/emailView",
        "text!templates/sendToList.html","text!templates/emailTemplateList.html","jquery.form","jquery.blockui.min"],
		function(Backbone,app,documentPage,codesView,documentEditView,documentTemplatesView,documentLinkedMessageView,
			messagesView,messagesCollection,documentPreviewView,emailView,sendToNames,emailTemplates){
	
	var DocumentView = Backbone.View.extend( {
		initialize: function(options){
			var self = this;
			this.fetchDocObj(options.financialDocObj);
			this.fetchDocAttachmentCode();
			self.folderType = 'FOLDER_TYPE';
			if(options && options.folderType){
				self.folderType = options.folderType;
			}
			this.folderNames = new codesView({codeGroup:self.folderType});
			this.msgFetchError = false;
			this.linkedMessagesRetrieved = false;
		},
		events:{
			"click a[href=#document-form1]":"showAddDocumentModal",
			"click a[href=#document-form-templates]":"showDocumentTemplatesModal",
			"hidden.bs.modal #document-form1": "hideAddDocumentModal",
			"click a.edit_doc":"showEditDocumentModal",
//			"hidden.bs.modal #document-form-edit": "hideEditDocumentModal",
			"keyup input#fileName":"checkFileName",
			"click a.linked-message" : "showLinkedMessage",
			"click #submittDoc":"submitDocForm",
			"click #editDoc":"submitEditedDoc",
			"click a[name='deleteDocument']":"showDeleteDocumentModal",
		    "click #deleteDocumentConfirmationButton":"deleteDocument",
		    "click input[name='vaultUpload']":"showFolderTypes"
		},
		el:"#documentsTab",
		propertyModel:{},
		object:{},
		objectId:{},
		docTypes:{},
		docIdToBeDeleted:{},
		docAttachmentCode: null,
		msgFetchError: false,
		linkedMessagesRetrieved: false,
		msgCollection: null,
		render:function () {
			var thisPtr=this;
	    	if(!app.documentPreview){
	    		 app.documentPreview=new documentPreviewView();
	    	}
			
			this.template = _.template(documentPage);
			var templateData=thisPtr.collection.toJSON();
			this.$el.html(" ");
			//--------------------Opportunity related changes start
			if(this.object=='Opportunity'){
				this.fetchDocType();
			}
			
			//--------------------end

			this.$el.html(this.template({docTypes:thisPtr.docTypes,templateData:templateData}));
			this.folderNames.render({el:$('#sharefileFolderDD'),codeParamName:"folderCodelistId"});
			$("#folderDiv").hide();
			this.docFormValidation();
			this.folderNames.render({el:$('#editSharefileFolderDD'),codeParamName:"folderCodelistId"});
			$("#editFolderDiv").hide();
			
			this.applyPermissions();
			
			if(this.object=='Vendor' || this.object=='Opportunity' || this.object=='Property'){
				$('table.eVaultHide th:nth-child(5),table.eVaultHide td:nth-child(5)').hide();
				$('#sharefileFolderDD').remove();
				$('#vaultUpload').parent().find('span').remove();
				$('#vaultUpload').remove();
			}

			this.trigger('DocumentViewLoaded');
			// this.emailFormValidation();
            $('.hopNameTooltip').tooltip({
                animated: 'fade',
                placement: 'left'
            });
			return this;
		},
		showAddDocumentModal:function(evt){
			$(this.el).find("#document-form1 #documentForm #documentErrorSpan").addClass("hide");
			app.documentUploadView.initializeFileUpload($(this.el).find("#document-form1"),$(this.el).find('#document-form1 #submittDoc'));
		},
		hideAddDocumentModal:function(evt){
			app.documentUploadView.fileUploadDeleteAll($(evt.currentTarget).find("form"));
		},
		showEditDocumentModal:function(evt){
			console.log("in showEditDocumentModal",evt,this.collection);
			if(!app.documentEditView){
				app.documentEditView = new documentEditView();
			}
			$(this.el).find("#document-form-edit #editedDocumentForm #documentErrorSpan").addClass("hide");
			var thisModel = this.collection.findWhere(
					{documentId:evt.currentTarget.attributes.getNamedItem("documentid").value});
			console.log("selected model", thisModel, evt.currentTarget.attributes.getNamedItem("documentid"));
			app.documentEditView.model=thisModel;
			app.documentEditView.initializeFileEdit($(this.el).find("#document-form-edit"),$(this.el).find('#document-form-edit #submittDoc'));
			$('#document-form-edit').modal("show");
		},
		hideEditDocumentModal:function(evt){
//			app.documentEditView.fileEditDeleteAll($(evt.currentTarget).find("form"));
		},
		showDocumentTemplatesModal: function(evt){
			var self=this;
			if(!app.documentTemplatesView){
				app.documentTemplatesView = new documentTemplatesView();
			}
			app.documentTemplatesView.object = this.object;
			app.documentTemplatesView.objectId = this.objectId;
			app.documentTemplatesView.render();
			$('#document-form-templates').on('hidden.bs.modal',function() {
        		self.fetchDocument();
			});

		},
		hideDocumentTemplatesModal: function(evt){
			console.log("in hideDocumentTemplatesModal",evt);
		},

		checkFileName:function(evt) {
        	var newFileName = $("input#fileName").val();
        	var fnValid = /^[-\w^&'@{}[\],$=!#()%+~][-\w^&'@{}[\],$=!#()%+~ ]*[-\w^&'@{}[\],$=!#()%+~]$/;
        	if (!fnValid.test(newFileName)) {
        		if (!$("div#fileNameDiv span#documentErrorSpan").length)
        			$("div#fileNameDiv").append(
    					'<span id="documentErrorSpan" class="help-block" style="color:red;">* File ' +
    					'name should be at least 2 legal characters. No leading or trailing spaces.</span>'
    					);
        	} else {
        		$("span.help-block").remove();
        	}
		},
		showDeleteDocumentModal:function(evt){
			this.docIdToBeDeleted=$(evt.currentTarget).attr('documentId');
			$('#optionDeleteDocument').modal("show");
		},
		showLinkedMessage:function(evt){
			var waitCtr = 10000;  // safety to insure message doesn't go infinite
			console.log("in showLinkedMessage, starting the wait loop.  evt:",evt);
			console.log($(evt.currentTarget),$(evt.currentTarget).attr("data-id"));
			while (waitCtr>0 && !this.linkedMessagesRetrieved && !this.msgFetchError) {
				waitCtr--;
			}
			if (waitCtr>0 && this.linkedMessagesRetrieved && !this.msgFetchError && this.msgCollection.length>0) {
				console.log("success in showLinkedMessage",this.msgCollection);
				if(!app.documentLinkedMessageView){
					app.documentLinkedMessageView = new documentLinkedMessageView();
				}
				var thisMessageModel = this.msgCollection.findWhere({messageId:$(evt.currentTarget).attr("data-id")});
				console.log("thisMessageModel",thisMessageModel);
				app.documentLinkedMessageView.model=thisMessageModel;
				app.documentLinkedMessageView.initializeLinkedMessage($(this.el).find("#formShowMessage"));
				$('#formShowMessage').modal("show");
			} else {
				console.log("error with show linked message",this.msgCollection, waitCtr, this.linkedMessagesRetrieved, this.msgFetchError);
			}

		},
		deleteDocument:function(){
			var self=this;
			 $.ajax({
	                url: app.context()+'document/deleteDocument/'+this.docIdToBeDeleted,
	                contentType: 'application/json',
	                dataType:'text',
	                type: 'DELETE',
	                success: function(res){
	                	$("#optionDeleteDocument").modal('hide');
	                	$('#optionDeleteDocument').on('hidden.bs.modal',function() {
							self.fetchDocument();
						});
	                },
	                error: function(res){
	                   alert(res.message);
	                   $("#optionDeleteLase").modal('hide');
	                }
	            });
		},
		fetchDocObj:function(docObj){
			 var self = this;
			 //docObj = docObj || "DOC_OBJ";
			 if(!docObj){
				 docObj = "DOC_OBJ";
			 }
	    	 var allcodesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+ "/code/all/" + docObj,
					async : false
				});
				allcodesResponseObject.done(function(response) {
					self.docTypes=response;
				});
				allcodesResponseObject.fail(function(response) {
					console.log("Error in retrieving codes "+response);
				});
	     },
	     submitDocForm:function(){
	    	 var self=this;
	    	 
	        	var formId = $('#documentForm').data("formid");
	        	var documentField = $('#documentForm').find('input[name=document]');
	        	var fileUploadValidate = !!($("#documentForm .files tbody").html());
	        	if(fileUploadValidate && $('#documentForm').validate().form()){
	        		$("#documentForm #documentErrorSpan").addClass("hide");
		        	$.blockUI({
			     		baseZ: 999999,
			     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			     	}
			     	);
			     documentField.prop("disabled", true);
			     $('#documentForm').attr("enctype","multipart/form-data");
	    	 	 $('#documentForm').ajaxSubmit({
	    	        url: app.context()+"document/uploadDocument/"+self.object+"/"+self.objectId,
	    	        async:true,
	    	        data: {"formId":formId},
	    	        beforeSubmit: function(){
	    	        },
	    	        success: function (res) {
	    	        	$.unblockUI();
	    	        	
	    	        	$('#documentForm').resetForm();
	    	        	$("#document-form1").modal('hide');
	    	        	$('#document-form1').on('hidden.bs.modal',function() {
	    	        		self.fetchDocument();
						});
						documentField.prop("disabled", false);
	    	        },
	    	        error:function(res){
	    	        	$.unblockUI();
	    	        	$('#documentForm').resetForm();
	    	        	$("#document-form1").modal('hide');
	    	        	documentField.prop("disabled", false);
	    	        }
	    	    });
	        	} else {
	        		$("#documentForm #documentErrorSpan").removeClass("hide");
	        	}
	    	    return false;
	     },
	     docFormValidation:function(){
    	  	 var form1 = $('#documentForm');
             var error1 = $('.alert-danger', form1);
             var success1 = $('.alert-success', form1);
             form1.validate({
            	 errorElement: 'span', //default input error message container
                 errorClass: 'help-block', // default input error message class
                 focusInvalid: false, // do not focus the last invalid input
                 ignore: "",
                 rules: {
                	 document: {
                	 	//implement Custom validator
                		 required: false
                     }
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
         },
        submitEditedDoc : function(evt) {
        	var self=this;
        	$("#document-form-edit #documentErrorSpan").addClass("hide");
        	console.log("in submitEditedDoc, event is",evt);
        	console.log("form data:",$("#document-form-edit form"));
     	
			var formVals = $("#document-form-edit form").serializeArray();
			console.log("formVals",formVals);

			updatedVals = {'formId':"document-form-edit"};
			var modelFileName = app.documentEditView.model.get('fileName');
			console.log("modelFileName",modelFileName);
			if (modelFileName==null) modelFileName="";
			var existingFileExtension = (modelFileName.indexOf('.')>=0) ?
				"." + modelFileName.split('.').pop()         :      "";
			_.each(formVals,function(el,i,l){ 
				updatedVals[el.name]=
					(el.name=="fileName" ? el.value+existingFileExtension : 
					(el.name=="docType" ?  parseInt(el.value)             : 
					el.value)); 
			});
			console.log("updatedVals",updatedVals);
			
			$.blockUI({
	     		baseZ: 999999,
	     		message: '<div><img src="assets/img/loading.gif" /> Updating the document...</div>'
	     	});
 			app.documentEditView.model.save(updatedVals,{
 				patch: true,
        		success: function(model,res, opts){
        			$.unblockUI();
        			$("#document-form-edit").modal('hide');
        			$(".modal-backdrop").hide();
        			self.fixDocType(model);
        			console.log("success in submitEditedDoc", model, res, opts); 
        			console.log("document collection",self.collection);
        			self.render();
        		},
        		error: function(model,res, opts){ 
        			$.unblockUI();
        			console.log("error in submitEditedDoc", model, res, opts); 
        		}
        	});
       	
        },
        fixDocType : function (mdl) {
        	var self = this;
        	var docTypeDisplay = _.findWhere(self.docTypes,{codeDisplay:mdl.get("documentType")});
    		if (typeof docTypeDisplay!="undefined") {
    			mdl.set({docType: docTypeDisplay.id.toString() });
    		} else {
    			mdl.set({docType: mdl.get("documentType") });
    			docTypeDisplay = _.findWhere(self.docTypes,{id:parseInt(mdl.get("documentType"))});
    			if (typeof docTypeDisplay!="undefined")
    				mdl.set({documentType: docTypeDisplay.codeDisplay });
    		}
        },
        fetchDocument : function(){
    	 	var thisPtr=this;
    	 	thisPtr.collection.object=thisPtr.object;
    	 	thisPtr.collection.objectId=thisPtr.objectId;
    	 	$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
    		thisPtr.collection.fetch({
        		reset: true,
                success: function (res) {
                	$.unblockUI();
                	_.each(thisPtr.collection.models, function(m,i,c) {
                		thisPtr.fixDocType(m);
                		m.set("isEmailAttachment",m.get("subObject")==thisPtr.docAttachmentCode)
                	});
                	thisPtr.render();
                	thisPtr.fetchLinkedMessages();
                },
                error   : function () {
                	$.unblockUI();
                	$('.alert-danger').show();
                }
            });

        },
        fetchLinkedMessages : function ()
        {
        	console.log("fetch message");
        	var thisPtr = this;
			if(!this.messagesView){
				this.messagesView=new messagesView({collection:new messagesCollection()});
			}
			this.messagesView.setElement(thisPtr.$el.find("#messagesViewRenderId"));
			this.msgCollection = this.messagesView.collection;
			this.msgCollection.object=this.object;
			this.msgCollection.objectId=this.objectId;
			thisPtr = this;
			this.msgCollection.fetch({
                success: function (res) {
                	thisPtr.msgFetchError = false;
                	thisPtr.linkedMessagesRetrieved = true;
                },
                error   : function () {
                	console.log("in doc view initialize fetch messages, error:", res);
                	thisPtr.msgFetchError = true;
                	thisPtr.linkedMessagesRetrieved = true;
                }
            });
        },
        
        applyPermissions : function() {
        	if(this.object=='Asset' && $.inArray('AssetManagement', app.sessionModel.attributes.permissions)==-1){
        		$('a[href="#document-form1"]').remove();
	    		$(".delete_red").remove();
	    		$(".email_doc").remove();
			}
			else if(this.object=='Investment' && $.inArray('ClosingManagement', app.sessionModel.attributes.permissions)==-1){
				$('a[href="#document-form1"]').remove();
	    		$(".delete_red").remove();
	    		$(".email_doc").remove();
			}
			else if(this.object=='Vendor' && $.inArray('VendorManagement', app.sessionModel.attributes.permissions)==-1){
				$('a[href="#document-form1"]').remove();
	    		$(".delete_red").remove();
	    		$(".email_doc").remove();
			}	else if(this.object=='Rehab' && $.inArray('RehabManagement', app.sessionModel.attributes.permissions)==-1){
				$('a[href="#document-form1"]').remove();
	    		$(".delete_red").remove();
	    		$(".email_doc").remove();
			}
			// Add permission for investor later
	    },
	    
	    showFolderTypes: function(){
	    	if($('#vaultUpload').is(':checked')==true){
	    		$("#folderDiv").show();
	    	}
	    	else{
	    		$("#folderDiv").hide();
	    	}
	    	if($('#editVaultUpload').is(':checked')==true){
	    		$("#editFolderDiv").show();
	    	}
	    	else{
	    		$("#editFolderDiv").hide();
	    	}
	    },
	    
	    fetchDocType:function(){
	    	 var self = this;
	    	 var allcodesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+ "/code/all/DOC_TYPE",
					async : false
				});
				allcodesResponseObject.done(function(response) {
					self.docTypes=response;
				});
				allcodesResponseObject.fail(function(response) {
					console.log("Error in retrieving codes "+response);
				});
	     },
	     
	     fetchDocAttachmentCode: function() {
	    	 var self=this;
	    	 var allcodesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+ "/code/all/MSG_TYP",
					async : false
				});
				allcodesResponseObject.done(function(response) {
					_.each(response,function(el, i, l){
						if (el.codeDisplay=="Incoming Email Attachment") self.docAttachmentCode = el.id;
					});
				});
				allcodesResponseObject.fail(function(response) {
					console.log("Error in retrieving Msg type codes ",response);
				});
	     }
	     		
	});
	return DocumentView;
});