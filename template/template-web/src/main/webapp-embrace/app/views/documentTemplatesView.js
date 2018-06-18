define(["backbone","app",
        "text!templates/documentTemplateDocSelector.html","text!templates/documentTemplateRecSelector.html",
        "models/docuSignEnvelopeModel",
        "collections/documentTemplatesCollection","collections/docusignTemplateCollection",
        "collections/documentCollection","collections/codesCollection","views/documentUploadView"],
		function(Backbone,app,documentTemplateDocSelector,documentTemplateRecSelector,
				docuSignEnvelopeModel, documentTemplatesCollection, 
				theDocusignCollection,documentCollection,codesCollection,docmentuploadview){
	
	var DocumentTemplatesView = Backbone.View.extend( {
		initialize: function(){
			this.baseTitle = "Document Templates";
			this.codes = new codesCollection();
			var self=this;
			this.codes = this.getCodes("DOC_RECIP");
			this.docObjs = this.getCodes("DOC_OBJ");
			this.envTypes = this.getEnvTypes();
			console.log("codes",this.codes,"env types",this.envTypes,"doc object types",this.docObjs);
		},
		events:{
			'click #documentTemplatesForm input[type="checkbox"]' : "getCheckedRecipients"
			 //"click #cboxClose":"handleSendRecipientLink"
		},
		el:"#maincontainer",
		sendToList:{},
		select2_ary : [],
		render:function () {
			this.resetForm();
			this.showModal();
			this.showUploadDocuments();
			return this;
		},
		resetForm : function() {
			if (typeof this.collection != "undefined") this.collection.reset();
			if (typeof this.docuploadview != "undefined") {
				this.docuploadview.fileUploadDeleteAll('#documentTemplatesForm');
			}
			$("#document-form-templates table.files").empty();
			$("#formDocs").empty();
			$("#formRecips").empty();
		},
		showUploadDocuments : function () {
			$(this.el).find("#document-form-templates #documentTemplatesForm #documentErrorSpan").addClass("hide");
			if (typeof this.docuploadview == "undefined") this.docuploadview = new docmentuploadview();
			console.log(this.docuploadview,
					$(this.el).find("#document-form-templates .modal-dialog"),
					$(this.el).find('#document-form-templates #createEnv'));
			this.docuploadview.initializeFileUpload(
				$(this.el).find("#document-form-templates .modal-dialog"),
				$(this.el).find('#document-form-templates #createEnv') 
			);
			console.log("initial state of form",$('#documentTemplatesForm'));
			$('#documentTemplatesForm input[type="file"]').change(this,this.addFileRecipients);
		},
		showModal : function () {
			var self = this;
			var thisDocumentTabType = this.getDocTabType();
			var newTitle = $('#document-form-templates .modal-title');
			newTitle.text(thisDocumentTabType + " " + this.baseTitle);
			this.setDocTemplateSet();
			$('button[name="goToDocumentTemplates"]')
				.click(function(){ 
					$('button[name="cancelDocumentTemplates"]').click();
					app.router.navigate("#documentTemplateStatus", {trigger: true}); 
				});
			$('button[name="cancelDocumentTemplates"]').click(function(){
				$(".modal-backdrop").remove();
			});
			this.fetchSendToList();
			$("button#createEnv").hide();
			$('#document-form-templates .modal-dialog').modal("show").draggable({handle:".modal-header"});
			$(".modal-backdrop").addClass("modal");
			$("button#createEnv").click(self,self.submitEnvelope);
		},
		setDocTemplateSet : function() {
			var self = this;
			if (typeof this.collection == "undefined") this.collection = new documentTemplatesCollection();
			if (this.collection.length==0) {
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Fetching Document Template Data... </div>'
				});
				$.ajax({
					url: self.collection.url,
				}).done(function(res){
					self.collection.add(res.documentTemplates);
					self.showTemplates();
					$.unblockUI();
				}).error(function(res){
					console.log("in setDocTemplateSet, error",res);
					$.unblockUI();
				});
			} else this.showTemplates();	
		},
		showTemplates : function () {
			var docusignTemplates = this.collection.where({
				templateType : this.getDocTabType().toLowerCase() });
			var selectTemplate = _.template(documentTemplateDocSelector);
			var selectHtml = selectTemplate({ "docusigntemplateData" : docusignTemplates });
			console.log("showTemplates",docusignTemplates);
			$('#document-form-templates .modal-body form #formDocs').html(selectHtml);
			$('#documentTemplatesForm input.dSignRec').change(this,this.inputValueChange);
			this.selectedDocTemplates = {};
			if (typeof this.docusignCollection == "undefined") this.docusignCollection = new theDocusignCollection();
			if (this.docusignCollection.length<=0) this.docusignCollection.fetch();
		},
		getDocTabType : function() {
			return this.object.replace("Investment","Closing");
		},
		// Bring the recipients or remove them from the Recipient list when a template is selected or deselected
		getCheckedRecipients : function (evt) {
			var dSignTemplId = $(evt.currentTarget).attr("data-docusign");
			console.log ("dSignTemplId",dSignTemplId);
			var correspondingDocusignModel = this.docusignCollection.findWhere({templateId : dSignTemplId});
			console.log ("correspondingDocusignModel",correspondingDocusignModel);
			evt.data = this;
			this.addFileRecipients(evt);
/*			if (typeof correspondingDocusignModel != "undefined") {
				if (evt.currentTarget.checked) this.addCheckedRecipients(correspondingDocusignModel);
				else this.removeCheckedRecipients(correspondingDocusignModel);
			}
*/
			console.log("selectedDocTemplates", this.selectedDocTemplates);
/*			if (_.size(this.selectedDocTemplates) > 0) {
				this.showRecipients();
				$('input.dSignRec').change(this,this.checkValidRecips);
			} else {
				$('#document-form-templates .modal-body form #formRecips').html("");
			} */
		},
		showRecipients : function () {
			console.log("showRecipients");
			var self = this;
			var selectRecTemplate = _.template(documentTemplateRecSelector);
			var selectRecHtml = selectRecTemplate( { "recipienttemplateData": this.selectedDocTemplates });
			$('#document-form-templates .modal-body form #formRecips').html(selectRecHtml);
/*			$('input.dSignS2').select2({
				createSearchChoice:function(term, data) { 
					console.log("createSearchChoice",term,data);
					if(self.validatemail(term)){
				        if ($(data).filter(function() { 
				            return this.text.localeCompare(term)===0; 
				        }).length===0) 
				        	{return {id:term, text:term};} 
					}
			    },
				multiple: false,
			    data: this.select2_ary,
			    selectOnBlur: true
			});
			_.each($('input.dSignS2'),function(e){
				var nm = e.attributes.name.value;
				//console.log(nm,this.selectedDocTemplates);
				$(e).select2('data',this.selectedDocTemplates[nm].value);
			},self);
*/
			$('input.docsS2').select2({
				multiple: true,
			    data: this.select2_ary,
			    selectOnBlur: true
			});
			if (this.selectedDocTemplates.hasOwnProperty('Other'))
				$('input.docsS2').select2('data',this.selectedDocTemplates.Other.value);
			
		},
		addCheckedRecipients : function (dSignModel) {
			var theRecipients = dSignModel.get("recipients");
			for(var recip in theRecipients) {
				var role = theRecipients[recip].recipient;
				if (this.selectedDocTemplates.hasOwnProperty(role)) {
					this.selectedDocTemplates[role].templates.push(dSignModel.get("templateId"));
				} else {
					var displayValCode = _.findWhere(this.codes,{ "codeKey" : role });
					var displayVal = (typeof displayValCode != "undefined") ? displayValCode.codeDisplay : role;
					this.selectedDocTemplates[role] = 
						{ "type" : theRecipients[recip].type, "templates" : [dSignModel.get("templateId")],
							"display" : displayVal, "value" : "" };
				}
			}
		},
		removeCheckedRecipients : function (dSignModel) {
			var temp = [];
			var theRecipients = dSignModel.get("recipients");
			for(var recip in theRecipients) {
				var role = theRecipients[recip].recipient;
				if ( this.selectedDocTemplates.hasOwnProperty(role) ) {
					temp = _.without(this.selectedDocTemplates[role].templates,dSignModel.get("templateId"));
					if (temp.length<=0) delete this.selectedDocTemplates[role];
					else this.selectedDocTemplates[role].templates=temp;
				}
			}
		},
		addFileRecipients : function(evt) {
			var self = evt.data;
			console.log("addFileRecipients",evt,"selectedDocTemplates",self.selectedDocTemplates);
			if ($('#documentTemplatesForm tr.template-upload').length>0 &&
					$('#documentTemplatesForm input:checkbox:checked').length==0
				) {
				$(".file-upload-delete").click(self,self.deleteFileRecipients);
				if (!self.selectedDocTemplates.hasOwnProperty("Other")) { 
					
					self.selectedDocTemplates.Other = {
							display : "Envelope Recipients",
							templates : [],
							type : "nonTemplate",
							value : ""
					};
					self.showRecipients();
					console.log("selectedDocTemplates didn't have Other",self.selectedDocTemplates, $(".docsS2"));
					self.checkValidRecips(evt);
					$('input.dSignRec').change(self,self.checkValidRecips);
				}
			} else {
				if (self.selectedDocTemplates.hasOwnProperty("Other")) {
					delete self.selectedDocTemplates.Other;
					self.showRecipients();
				}
			}
			self.checkValidRecips(evt);
		},
		deleteFileRecipients : function(evt) {
			// file-upload-delete
			var self = evt.data;
			console.log("deleteFileRecipients",evt,"selectedDocTemplates",self.selectedDocTemplates,
					$('#documentTemplatesForm tr.template-upload'));
			var theRows = $('#documentTemplatesForm tr.template-upload');
			var rowCount = theRows.length;
			var currentRow = $(evt.currentTarget).closest("tr")[0];
			var currentRowId = parseInt(currentRow.attributes.id.value);
			var rowIds = theRows.map(function() {
			    return this.id;
			  }).get().join();
			console.log("theRows, rowCount, currentRow, rowIds, currentRowId",theRows, rowCount, currentRow, rowIds,currentRowId);
			console.log("index",rowIds.indexOf(currentRowId));
			if (rowCount<=0 || (rowIds.indexOf(currentRowId)>=0 && rowCount==1)) {
				delete self.selectedDocTemplates.Other;
				console.log("selectedDocTemplates",self.selectedDocTemplates);
				self.showRecipients();
			}
			self.checkValidRecips(evt);
		},
	    validatemail : function(email) { 
			    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			    return re.test(email);
		},
		checkValidRecips : function(evt) {
			console.log("checkValidRecips",evt);
			var self=evt.data;
			console.log("input dsignrec",$("input.dSignRec"));
			var formData = $("input.dSignRec").serializeArray();
			console.log("formdata before",formData);
			_.each(formData,function(e){ console.log(e); self.selectedDocTemplates[e.name].value = 
				$('input.dSignRec[name="'+e.name+'"]').select2('data'); });
			console.log("formData after",formData,self.selectedDocTemplates);
			$('div.recipErrors').html("");
			var missingRecips = _.findWhere(formData,{value : ""});
			console.log("missingRecips",missingRecips);
			if (typeof missingRecips != "undefined" ) {
				$('div.recipErrors').html('<p class="text-center" style="color:red;">All recipients must be selected.</p>');
				$("button#createEnv").hide();
			} else {
				$("button#createEnv").show(); // .click(self,self.submitEnvelope);
			}
			if ($.isEmptyObject(self.selectedDocTemplates)) $("button#createEnv").hide();
			if ($('#documentTemplatesForm input:checkbox:checked').length>0) {
				$("button#createEnv").show();
			}
		},
		submitEnvelope : function (evt) {
			var self = evt.data;
			var formData = $("#documentTemplatesForm").serializeArray();
			console.log("submitEnvelope",evt);
			console.log("formData",formData);
			console.log("object info", self.object, self.objectId);
			console.log("object code:",self.envTypes[self.object.replace("Investment","Closing")]);
			console.log("s2 array",self.select2_ary);
			console.log("sendToList",self.sendToList);
			var dSignEnvelope = new docuSignEnvelopeModel();
			
			var templates = [];
			var emails = [];
			var roles = [];
			var names = [];
			var clids = [];
			var ccNames = [];
			var ccEmails = [];
			var ccClids = [];
			var ccRoles = [];
			var others = [];
			var otherNames = [];
			var otherRoles = [];
			var otherClIds = [];
			for (item in formData) {
				if (formData[item].name=="Other") {
					var theOthers = formData[item].value.split(",");
					//others = others.concat(theOthers);
					console.log("the Others:",theOthers);
					_.each(theOthers,function(e){
						console.log(e);
						/*
						otherNames.push(self.sendToList[e].name);
						otherClIds.push(self.sendToList[e].clid);
						otherRoles.push("Other");
						*/
						emails.push(e);
						/*
						 * if (self.sendToList[e].type=="embrace")
							roles.push("HUsigner");
						else roles.push("signer");
						*/
						roles.push(self.sendToList[e].type);
						names.push(self.sendToList[e].name);
						clids.push(self.sendToList[e].clid);
					})
				} else
					if (formData[item].name.indexOf("template_")==0) {
						var docuSignId = formData[item].name.replace("template_","");
						templates.push(docuSignId);
					} /* else {
						 if (self.selectedDocTemplates[formData[item].name].type=="signers") {
							emails.push(formData[item].value);
							roles.push(formData[item].name);
							names.push(self.sendToList[formData[item].value].name);
							clids.push(self.sendToList[formData[item].value].clid);
							
						} else {
							if (formData[item].name=="docops") { 
								ccNames.push("DocOps");
								ccEmails.push(formData[item].value);
								ccClids.push("");
								ccRoles.push("docops");
							}
						}
					} */
			}
			
			ccNames.push("DocOps");
			ccEmails.push("docops@homeunion.com");
			ccClids.push("");
			ccRoles.push("docops");
			
			
			dSignEnvelope.set({
				templates  : templates,      roles      : roles,
				emails     : emails,         names      : names,
				clids      : clids,
				
				ccNames    : ccNames,        ccEmails   : ccEmails,
				ccClids    : ccClids,        ccRoles    : ccRoles,
				
				others     : others,         otherNames : otherNames,
				otherClids : otherClIds,     otherRoles : otherRoles,
				
				object     : self.envTypes[self.object.replace("Investment","Closing")].toString(),
				objectId   : self.objectId,
				
				returnUrl  : "",
				
				files      : []  // File names
			});
			console.log("dSignEnvelope",dSignEnvelope.toJSON());

			if ($("#documentTemplatesForm tr.template-upload").length>0) {
				console.log("files to upload");
				var theFiles = [];
				_.each($("#documentTemplatesForm table span.name"), function(e){
					theFiles.push($(e).text());
				});
				console.log("the files", theFiles);
				
				self.submitDocForm(function(outcome){
					// Documents have been stored in ShareFile
                    if (outcome=="error") {
                    	self.submitForEnvelope(dSignEnvelope);
    	        	} else {
    	        		dSignEnvelope.set({ "files" : theFiles,"storeDocumentIds":outcome });
    	        		console.log("dSignEnvelope before submit",dSignEnvelope);
    	        		self.submitForEnvelope(dSignEnvelope);
    	        	}
				}); 
			} else {  // No attached documents to the envelope
				self.submitForEnvelope(dSignEnvelope);
			}

		},
		submitForEnvelope : function (envMdl) {
			var self=this;
			$.blockUI({
	     		baseZ: 999999,
	     		message: '<div><img src="assets/img/loading.gif" /> Creating the envelope ...</div>'
	     	});
			data = envMdl.toJSON();
			console.log ("submitForEnvelope data");
			console.log (data);

			$.ajax({
				url: app.context()+"docusign/envelope/createFromTemplatesAndDocuments",
    	        async:true,
    	        data: JSON.stringify(data),
    	        type: "POST",
    	        dataType: "json",
    	        contentType: "application/json",
    	        success : function (res) {
    	        	$.unblockUI();
    	        	console.log("success in submitForEnvelope",res);
    	        	// bring up the tag and send iframe
    	        	console.log("tands URL:",res.tagAndSendUrl);
    	        	if (res.tagAndSendUrl!=null) {
    	        		var tagSendBox = $.colorbox({href: res.tagAndSendUrl,
  	                	  iframe:true,fastIframe:false,title:'Tag and Send Documents for Signature',closeButton:true,width:'100%',height:'100%',
  	                	  escKey:false,overlayClose:false});
  	                    console.log("tagSendBox",tagSendBox);
  	                    $('#cboxOverlay').css('z-index',99998);
  	                    $('#colorbox').css('z-index',99999);
  	                    
  	                  $('#cboxClose').unbind('click',self.handleSendRecipientLink);
  	                  $('#cboxClose').on('click',{embraceEnvelopeId:res.embraceEnvelopeId},self.handleSendRecipientLink);
    	        	} else {
    	        		console.log("couldn't bring up the tag and send iframe - need a message to the user");
    	        	}
    	        	$('#documentTemplatesForm').resetForm();
    	        	$("#document-form-templates").modal('hide');
    	        },
    	        error : function (res) {
    	        	$.unblockUI();
    	        	console.log("error with submitForEnvelope",res);
    	        	$('#documentTemplatesForm').resetForm();
    	        	$("#document-form-templates").modal('hide');
    	        }
	    	});
			
		},
		handleSendRecipientLink : function(evt) {
			var embraceEnvelopeId = evt.data.embraceEnvelopeId;
			console.log("embraceEnvelopeId:"+embraceEnvelopeId);
			var self=this;
			$.blockUI({
	     		baseZ: 999999,
	     		message: '<div><img src="assets/img/loading.gif" /> Sending Envelope For Signature...</div>'
	     	});
			$.ajax({
				url: app.context()+'/docusign/envelope/sendForRBASignature/'+embraceEnvelopeId,
				type: 'GET',
				async:true,
				success: function(res){
					$.unblockUI();
					console.log('Success sending envelope for signature '+res);
				},
				error: function(res){
					$.unblockUI();
					console.log('failed to send envelope for signature '+res);
					//.currentForm.find('.envelopeMessage').html('Failed to send. Try again.');
				}
			});
		},
	    submitDocForm:function(cb){
	    	var self=this;
	    	 
        	var formId = $('#documentTemplatesForm').data("formid");
        	var docType = _.findWhere(this.docObjs,{codeDisplay : "Other"}).id;
        	console.log("docType")
        	var documentField = $('#documentTemplatesForm').find('input[name=document]');
        	var fileUploadValidate = !!($("#documentTemplatesForm .files tbody").html());
        	if(fileUploadValidate && $('#documentTemplatesForm').validate().form()){
        		$("#documentTemplatesForm #documentErrorSpan").addClass("hide");
	        	$.blockUI({
		     		baseZ: 999999,
		     		message: '<div><img src="assets/img/loading.gif" /> Uploading the documents ...</div>'
		     	}
		     	);
			    documentField.prop("disabled", true);
			    $('#documentTemplatesForm').attr("enctype","multipart/form-data");
	    	 	$('#documentTemplatesForm').ajaxSubmit({
	    	        url: app.context()+"document/uploadtosharefile/"+self.object+"/"+self.objectId,
	    	        async:true,
	    	        data: {"formId":formId,"docType":docType},
	    	        beforeSubmit: function(){
	    	        },
	    	        success: function (res) {
	    	        	$.unblockUI();
	    	        	console.log("success in uploading doc(s)",res);
						documentField.prop("disabled", false);
						cb(res);
	    	        },
	    	        error:function(res){
	    	        	$.unblockUI();
	    	        	console.log("error in uploading doc(s)",res);
	    	        	$('#documentTemplatesForm').resetForm();
	    	        	$("#document-form-templates").modal('hide');
	    	        	documentField.prop("disabled", false);
	    	        	cb('error');
	    	        }
	    	    });
        	} else {
        		$("#documentTemplatesForm #documentErrorSpan").removeClass("hide");
        	}
    	    return false;
	    },
	    fetchSendToList:function(){
	    	 var self=this;
	    	 var objectId=this.objectId;
	    	 var object=this.object;

	    	 var thisPtr=this;
				var allcodesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+'messages/sendToList/'+object+'/'+objectId,
					async : false
				});
				var codes = JSON.parse(allcodesResponseObject.responseText);
				console.log ("in fetchSendToList", codes);
				
				var investors = [];
				_(codes.investor).each(function(investor) {
					investors.push({id:investor.emailAddress,text:investor.name, clid:investor.id});
					self.sendToList[investor.emailAddress] = {name:investor.name, clid:investor.id, type : "investor"};
				});				


				var embraceUsers = [];
				_(codes.embraceUsers).each(function(embraceUser) {
					embraceUsers.push({id:embraceUser.emailAddress,text:embraceUser.name, clid:embraceUser.id});
					self.sendToList[embraceUser.emailAddress] = {name:embraceUser.name, clid:embraceUser.id, type : "embrace"};
				});
				embraceUsers = _.sortBy(embraceUsers, 'text');
				
				var vendors = [];
				_(codes.vendors).each(function(vendor) {
					vendors.push({id:vendor.emailAddress,text:vendor.name, clid: vendor.id});
					self.sendToList[vendor.emailAddress] = {name:vendor.name, clid:vendor.id, type : "vendor"};
				});
				vendors = _.sortBy(vendors, 'text');
				

				if (codes.investor!=null) this.sendToList[codes.investor.emailAddress] = {
						name: codes.investor.name,
			            clid: codes.investor.id,
			            type: "investor"
			    };
				if (codes.coBuyer!=null) this.sendToList[codes.coBuyer.emailAddress] = {
						name: codes.coBuyer.name,
			            clid: codes.coBuyer.id,
			            type: "investor"
			    };

				
				console.log("sendToList",this.sendToList);
				
				this.select2_ary = [];
				if (codes.investor!=null) this.select2_ary.push(
			    	{
				        text: 'Investor',
				        children:  investors
				    });
			    if (codes.coBuyer!=null) this.select2_ary.push({
				        text: 'Co-Buyer',
				        children: [{
				            id: codes.coBuyer.emailAddress,
				            text: codes.coBuyer.name,
				            clid: codes.coBuyer.id
				        }]
				    });
			    this.select2_ary.push(
			    	{
				        text: 'Embrace Internal Users',
				        children: embraceUsers
				    }, {
				        text: 'Vendors',
				        children: vendors
				    }
			    );
	    	 
	     },
	     getEnvTypes : function () {
	    	 /*
			 * Investor, Opportunity, Asset,     Closing,   Vendor
			 *                        ASSET_TYPE INVEST_OBJ ORG_TYPE
			 */
	    	 var eTypes = {};
	    	 eTypes.Investor = _.findWhere(this.getCodes("USER_GROUP"),{codeDisplay : "Investor"}).id;
	    	 eTypes.Opportunity = _.findWhere(this.getCodes("OPP_OBJ"),{codeDisplay : "Opportunity"}).id;
	    	 eTypes.Asset = _.findWhere(this.getCodes("ASSET_TYPE"),{codeDisplay : "Asset"}).id;
	    	 eTypes.Closing = _.findWhere(this.getCodes("INVEST_OBJ"),{codeDisplay : "Investment"}).id;
	    	 eTypes.Vendor = _.findWhere(this.getCodes("ORG_TYPE"),{codeDisplay : "Vendor"}).id;
	    	 eTypes.Rehab = _.findWhere(this.getCodes("REHAB_OBJ"),{codeDisplay : "Rehab"}).id;
	    	 return eTypes;
	     },
	     getCodes : function (codeGroup) {
	    	var codes = null;
			$.ajax({
				type : "GET",
				url : app.context()+ "/code/all/" + codeGroup,
				async : false
			}).done(function(res){
					codes=res;
				}).error(function(res){
					console.log("codes not available",res);
			});
			return codes;
	     },
	     inputValueChange : function(evt) {
	    	 console.log("inputValueChange",evt);
	    	 var self = evt.data;
	    	 
	     }

	});

	return DocumentTemplatesView;
});