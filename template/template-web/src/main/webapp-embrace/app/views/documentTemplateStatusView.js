define(["backbone",
	"app",
	"text!templates/documentTemplateStatus.html",
	"collections/documentTemplatesCollection", "collections/docusignTemplateCollection",
	"models/documentTemplateModel",
	"views/documentTemplateEditView"

	],
	function(Backbone, app, docTemplStatusPage, documentTemplatesCollection, docusignTemplateCollection, 
				documentTemplateModel, documentTemplateEditView){
	
		var DocumentTemplateStatusView = Backbone.View.extend({
			initialize: function(){
				console.log("DocumentTemplateStatusView initialize");
				$("button[name='refreshDocusign']").addClass("disabled");
				if (typeof this.documentTemplateCollection == "undefined") this.documentTemplateCollection = new documentTemplatesCollection();
				if (typeof this.docusignTemplateCollection == "undefined") this.docusignTemplateCollection = new docusignTemplateCollection();
			},
			initializeData : function() {
				var self = this;
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Fetching Document Template Data... </div>'
				});
				this.docusignTemplateCollection.fetch({ reset : true, 
					success : function(res) {
						$.ajax({
							url: self.documentTemplateCollection.url,
						}).done(function(res){
							console.log("done",res);
							self.documentTemplateCollection.add(res.documentTemplates);
							console.log("self.documentTemplateCollection",self.documentTemplateCollection);
							self.showDataTable();
							$.unblockUI();
						}).error(function(res){
							console.log("error",res);
							$.unblockUI();
							$("button[name='refreshDocusign']").removeClass("disabled");
						});
					},
					error : function(res) {
						console.log("Unable to fetch docusign templates!");
						$.unblockUI();
						$("button[name='refreshDocusign']").removeClass("disabled");
					}
				});
			},
			events          : {
				"click a.openDocTemplate"              : "showDocTemplate",
				'click button[name="createTemplate"]'  : "newDocTemplate",
				'click a.deleteDocTemplate'            : "deleteDocumentTemplate",
				'click button[name="refreshDocusign"]' : "refreshDocusign",
				'click button[name="buildDocusign"]'   : "launchDocusignManagementConsole"
			},
			el:"#mainContainer",
			render : function(){
				var self = this;
				this.template = _.template( docTemplStatusPage );
				this.$el.html("");			     	
				this.$el.html(this.template());
				this.initializeData();
				return this;
			},
			showDocTemplate : function (evt) {
				console.log("showDocTemplate",evt,$(evt.currentTarget));
				var selectedModel = this.documentTemplateCollection.findWhere({documentTemplateId : $(evt.currentTarget).attr("data-id")});
				console.log("selectedModel",selectedModel);
				var formData = selectedModel.toJSON();
				formData["docusigns"] = this.docusignTemplateCollection.toJSON();
				if (typeof this.docTemplEditView == "undefined") this.docTemplEditView = 
					new documentTemplateEditView;
				this.docTemplEditView.action = "edit";
				this.docTemplEditView.formData = formData;
				this.docTemplEditView.render();
				$('.modal button[name="editTemplateBtn"]').on("click",this,this.editDocumentTemplate);
			},
			
			newDocTemplate : function (evt) {
				console.log("newDocTemplate",evt,$(evt.currentTarget));
				var formData = {
					docusignTemplatePath     : null,     templateContent        : "",
					templateFormat         : "PDF",
					templateTitle          : "",       templateType           : ""
				};
				formData["docusigns"] = this.docusignTemplateCollection.toJSON();
//				this.documentTemplateCollection.add([selectedModel]);
				console.log("formData",formData);
				if (typeof this.docTemplEditView == "undefined") this.docTemplEditView = 
					new documentTemplateEditView();
				this.docTemplEditView.action = "create";
				this.docTemplEditView.formData = formData;
				this.docTemplEditView.render();
				$('.modal button[name="createTemplateBtn"]').on("click",this,this.createDocumentTemplate);
			},
			editDocumentTemplate : function (evt) {
				console.log("editDocumentTemplate",evt,evt.data);
				var self = evt.data;
				evt.data = evt.data.docTemplEditView; // change the evt.data pointer to point to subview
				self.docTemplEditView.checkBlanks(evt);
				if ($(".documentTemplateErrorMessage").html()=="") {
					var formData = self.convertFormData($("form#documentEditForm").serializeArray());
					console.log("editDocumentTemplate",formData);
					var theModel = self.documentTemplateCollection.findWhere({documentTemplateId : formData.documentTemplateId});
					console.log("theModel",theModel);
					theModel.save(formData,{
						success : function (res) {
							console.log("editDocument save successful", res);
							$("button.close").click();
							var theTr = $('[data-id="' + theModel.get("documentTemplateId") + '"]').closest("tr")[0];
							console.log("theModel", theModel.toJSON(), theTr);
							self.oTable.fnUpdate(theModel.toJSON(),theTr);
						},
						error : function (res) {
							console.log("editDocument save failed", res);
							$("button.close").click();
						}
					});
				}
			},
			createDocumentTemplate : function (evt) {
				console.log("createDocumentTemplate",evt,evt.data);
				var self = evt.data;
				evt.data = evt.data.docTemplEditView; // change the evt.data pointer to point to subview
				self.docTemplEditView.checkBlanks(evt);
				if ($(".documentTemplateErrorMessage").html()=="") {
					var formData = self.convertFormData($("form#documentEditForm").serializeArray());
					console.log("createDocumentTemplate",formData);
					self.documentTemplateCollection.create(formData,{
						success : function (res) {
							delete res.documentTemplates;
							console.log("model added on the server", res);
							$("button.close").click();
							self.oTable.fnAddData(res.toJSON(),true);
						},
						error : function (res) {
							console.log("model could not be added",res);
							self.collection.remove(self.model);
							$("button.close").click();
						}
					});
				}
			},
			deleteDocumentTemplate : function (evt) {
				console.log("in deleteDocumentTemplate",evt);
				var self = this;
				var idToDelete = $(evt.currentTarget).attr("data-id");
				var rowToDelete = $(evt.currentTarget).closest("tr")[0];
				var modelToDelete = this.documentTemplateCollection.findWhere({documentTemplateId : idToDelete});
				console.log("in deleteDocumentTemplate",idToDelete,modelToDelete,rowToDelete);
				modelToDelete.destroy({
					success : function (res) {
						console.log("model marked deleted on the server", res);
						self.oTable.fnDeleteRow(rowToDelete);
					},
					error : function (res) {
						console.log("error in deleting model from the server", res);
					}
				});
			},
			convertFormData : function (data ) {
				var hash = {};
				_.each(data,function(itm){
					hash[itm.name] = itm.value;
				});
				return hash;
			},
			refreshDocusign : function (evt) {
				$("button[name='refreshDocusign']").addClass("disabled");
				$(".fa-spinner").addClass("fa-spin");
				console.log("about to refresh docusign templates");
				this.docusignTemplateCollection.fetch({ reset : true, 
					success : function(res) {
						console.log("Docusign templates refreshed!");
						$("button[name='refreshDocusign']").removeClass("disabled");
						$(".fa-spinner").removeClass("fa-spin");
					},
					error : function(res) {
						console.log("Unable to fetch docusign templates!");
						$("button[name='refreshDocusign']").removeClass("disabled");
						$(".fa-spinner").removeClass("fa-spin");
					}
				});
			},
			launchDocusignManagementConsole : function(evt) {
				var self=this;
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Opening Docusign Management Console... </div>'
				});
				$.ajax({
	                url: app.context()+'/docusign/envelope/managementConsoleUrl',
	                type: 'GET',
	                success: function(res){
	                	$.unblockUI();
	                    console.log('Management Console Url is '+res);
	                    var managementConsole = $.colorbox({
	                    	  href: res, iframe:true,fastIframe:false,
		                	  title:'Docusign Management Console - Manage -> Templates -> DocumentTemplates -> Actions -> New Template',
		                	  closeButton:true,width:'100%',height:'100%', escKey:false,overlayClose:false
		                });
	                    $('#cboxOverlay').css('z-index',99998);
	                    $('#colorbox').css('z-index',99999);
	                    console.log(managementConsole);
	                    managementConsole.onCleanup = self.refreshDocusignStatus;
	                },
	                error: function(res){
	                	$.unblockUI();
	                	console.log('failed to get Management Console Url of envelope '+res);
	                	$('.envelopeMessage').html('Failed to get Management Console URL');
	                }
	            });
			},
			showDataTable : function(){
				var self = this;
				console.log("collection json",self.documentTemplateCollection.toJSON());
				this.oTable = $('#docTemplStatusTable').dataTable({
					"bServerSide" : false,
					"bProcessing" : true,
					"bFilter": true,
					//"scrollY" : "300px",
					"scrollX" : "100%",
					"aaData" : self.documentTemplateCollection.toJSON(),
					//"pagingType" : "simple",
					"aButtons": ["refresh"],
					"oLanguage" : {
						"sLengthMenu" : "_MENU_ records",
						"sZeroRecords" : "No matching records found",
						"sInfo" : "Showing _START_ to _END_ of _TOTAL_ entries",
						"sInfoEmpty" : "No records available",
						"sInfoFiltered" : "(filtered from _MAX_ total entries)",
					},
					"aoColumns" : [
						{
							"mData" : "templateTitle",
							"sTitle" : "Document Template" // ,
							//"className" : "tblRowSelectors"
						},{
							"mData" : "templateFormat",
							"sTitle" : "Template Format"
						},{
							"mData" : "templateType",
							"sTitle" : "Template Type"
						},{
							"mData" : "docusignTemplatePath",
							"sTitle" : "Docusign Template"
						},{
							"mData" : "documentTemplateId",
							"sTitle" : "",
							"bSortable": false
						}
					],
					"aoColumnDefs" : [
		  				{
		  					"aTargets": [ 0 ],
		  					"mRender" : function(data, type, full) {
	  							var resp = "";
	  							if (data!=null) {
		  							if (type=="display")
		  								resp = '<a style="cursor:pointer;" data-id="' + full.documentTemplateId + 
		  									'" data-title="' + data + '" class="openDocTemplate" ' +
		  									'title="Open Document Template">' + data + '</a>' ;
		  							else resp = data;
	  							}
	  							return resp;	
		  					}
		  				},{
		  					"aTargets": [ 3 ],
		  					"mRender" : function( data, type, full) {
	  							var resp = data;
	  							if (data!=null && data!="" && data!="0") {
	  								resp = data.substr(data.indexOf("/") + 1);
	  							} else {
	  								if (type=="display") 
	  									resp='<a style="cursor:pointer;" data-id="' + full.documentTemplateId + 
	  										'" data-title="' + data + '" class="openDocTemplate" ' +
	  										'title="Open Document Template">Assign Docusign Template</a>';
	  							}
	  							return resp;
		  					}
		  				},{
		  					"aTargets": [ 4 ],
		  					"mRender" : function( data, type, full) {
	  							var resp = data;
	  							if (type=="display") {
	  								resp = '<a style="cursor:pointer;" data-id="' + full.documentTemplateId + 
										'" data-title="' + data + '" class="deleteDocTemplate" ' +
  										'title="Delete Document Template"><i class="text-danger fa fa-trash-o"></i></a>';
  								}
	  							else resp = data;
	  							return resp;
		  					}
		  				}
		  			],
				});
				$("#docTemplStatusTable_wrapper .dataTables_scrollHead table").css("margin-top","0px");
				$("#docTemplStatusTable_wrapper .dataTables_scrollBody table").css("margin-top","-3px");
				$('select[name=docTemplStatusTable_length]').addClass('form-control');
			}
		});
		
		return DocumentTemplateStatusView;
});