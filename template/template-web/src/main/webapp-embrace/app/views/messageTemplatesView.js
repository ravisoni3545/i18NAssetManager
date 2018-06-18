define(["text!templates/messageTemplates.html", "backbone","app","models/messageTemplateModel", "views/editTemplateModalView", "models/codeModel"],
		function(messageTemplatesTemplate, Backbone,app,messageTemplateModel, editTemplateModalView, codeModel){
	
	var messageTemplatesView = Backbone.View.extend( {
		initialize: function(options){
			
		},
		el:"#mainContainer",
		events: {
			"click button[name=createTemplateBtn]":"createTemplate",
			"click a[name=editTemplate]":"showEditTemplateModal",
			"click button[name=deleteTemplateConfirm]": "deleteTemplate",
			"click a[name=deleteTemplateBtn]":"prepareTemplateForDelete",
			"click button[name=cancelCreate]":"cancelCreateFn"

		},
		render : function () {
		//	var templateOptions = {};
			
			this.template = _.template( messageTemplatesTemplate );
			this.$el.html("");
			var self=this;

			if(!app.messageTemplateModel)
			{
				app.messageTemplateModel = new messageTemplateModel();
			}
			if(!app.codeModel)
			{
				app.codeModel = new codeModel();
			}
			app.codeModel.fetchByCodeGroup("OBJ_TYPE", {
				success: function(res){
					console.log("success in getting");
					self.$el.html(self.template({objects: res}));
					app.messageTemplateModel.fetch();
					self.model = app.messageTemplateModel;
					self.showDataTable();
					self.createMessageTemplateFormValidation();

						},
				error: function(res){
					console.log("error: " + res);
				}

			});
			
			
	     	return this;
		},
		cancelCreateFn : function(){
			var self=this;
			$('#createTemplateModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			self.render();
		},
		createMessageTemplateFormValidation: function(){
		         // for more info visit the official plugin documentation: 
		             // http://docs.jquery.com/Plugins/Validation
		             console.log("edit form validation here");
		             var form1 = $('#createTemplateForm');
		             var error1 = $('#createTemplateFormError', form1);
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
		                         minlength: 2,
		                     },
		                     templateFileName: {
		                     	 minlength: 2,
		                     	 required : true
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

		     },
		prepareTemplateForDelete : function(evt){
			this.templateToDelete = $(evt.target).attr('template-id');
			console.log("template set for delete: " + this.templateToDelete);
		},
		deleteTemplate: function(){
			var self = this;
			console.log("deleteing template");
			var data = {};
			data["templateId"] = self.templateToDelete;
			app.messageTemplateModel.deleteTemplate(data,{
				success: function(res){
					console.log("success: ");
				},
				error: function(res){
					console.log("error deleting template");
				}
			});
			$('#deleteTemplateConfirmationModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			self.render();

		},
		createTemplate : function(){
			var form1 = $('#createTemplateForm');
			if(form1.valid())
			{
				var self = this;
				var data = {};
				data["templateName"] = $("#createTemplateName").val();
				data["templateFileName"] = $("#createTemplateFileName").val();
				data["templateText"] = $("#createTemplateText").val();
				data["templateSubject"] = $("#createTemplateSubject").val();
				data["templateObject"] = $("#createObject").val();
				data["bccRec"]= $("#createBccRecipients").val();
				data["ccRec"]= $("#createCcRecipients").val();
				data["isDisplay"]=$("#createIsDisplayTemplate").val();
				data["isActive"]=$("#createIsActiveTemplate").val();
				data["fromName"]=$("#createTemplateFromName").val();
				data["fromEmail"]=$("#createTemplateFromEmail").val();
				data["toRole"]=$("#createTemplateToRole").val();
				data["bccRole"]=$("#createTemplateBccRole").val();
				data["ccRole"]=$("#createTemplateCcRole").val();
				
				app.messageTemplateModel.createTemplate(data, {
					success: function(){
						console.log("created template successfuly");
					},
					error: function(){
						console.log("error creating template");
					}
				});
				$('#createTemplateModal').modal('hide');
				$('body').removeClass('modal-open');
				$('.modal-backdrop').remove();
				self.render();
			}
			else{
				console.log("template not validated");
			}
		},
		showEditTemplateModal: function(evt){
			console.log("showEditTemplateModal");
			var self = this;
			if(!app.editTemplateModalView)
	    		app.editTemplateModalView = new editTemplateModalView();
	    	app.editTemplateModalView.setElement($("#editTemplateModalDiv"));
	    	var id = $(evt.target).closest("a").attr('template-id');
	    	self.model.set({"template Id": $(evt.target).closest("a").attr('template-id')});
	    	app.editTemplateModalView.render(id,self.model);	

		},
		showDataTable : function(){
		    var self = this;
			// ----------------------------DataTable
			// start-----------------------------------
			var oTable = $('#messageTemplateInfoTable').dataTable(
							{
								"bServerSide" : false,
								"bProcessing" : true,
								"bFilter": true,
								//"scrollY" : "300px",
								//"scrollX" : "100%",
								"sAjaxSource" : app.context()+ '/messageTemplates/',
								"sAjaxData" : 'aaData',
								//"pagingType" : "simple",
								"sServerMethod":"GET",
								"oLanguage" : {
									"sLengthMenu" : "_MENU_ records",
									"sZeroRecords" : "No matching records found",
									"sInfo" : "Showing _START_ to _END_ of _TOTAL_ entries",
									"sInfoEmpty" : "No records available",
									"sInfoFiltered" : "(filtered from _MAX_ total entries)",
								},

								"aoColumns" : [
										{
											"mData" : "templateId",
											"sTitle" : "Action"
										},{
											"mData" : "templateName",
											"sTitle" : "Name"
										},{
											"mData" : "templateFileName",
											"sTitle" : "File"
										},{
											"mData" : "subject",
											"sTitle" : "Subject"
										},{
											"mData" : "object",
											"sTitle" : "Object"
										},{
											"mData" : "bccRecipients",
											"sTitle": "Bcc Recipients"
										},{
											"mData" : "ccRecipients",
											"sTitle": "Cc Recipients"
										},{
											"mData" : "isDisplay",
											"sTitle": "Displayed"
										}, {
											"mData" : "lastModifiedBy",
											"sTitle": "Last Modified By"
										}, {
											"mData" : "lastModifiedDate",
											"sTitle": "Last Modified Date"
										}, {
											"mData" : "createdBy",
											"sTitle": "Created By"
										},{
											"mData" : "createdDate",
											"sTitle" : "Created Date"
										}],

								"aoColumnDefs" : [
										{
											"aTargets" : [ 0 ],
											"bSortable": false,
											"mRender" : function(
													data, type,
													full) {
												return '<div class="btn-group" style="text-align:left!important;">'
 								                      	+'<button data-toggle="dropdown" class="btn dropdown-toggle gear2button myaction" type="button"><i class="fa fa-gear"></i></button>'
			                       					  	+'<ul template-id="'+full.templateId+'" role="menu" class="dropdown-menu" style="margin-left:30px!important;margin-top:-20px!important; padding:5px; position: relative; z-index: 1; ">'
														+'<li><a name="editTemplate" template-id="'+full.templateId+'"data-toggle="modal" class="btn btn-xs green textalignleft"><i class="fa fa-pencil"></i> Edit Template</a></li>'
                                                        +'<li><a name="deleteTemplateBtn" href="#deleteTemplateConfirmationModal" data-toggle="modal" template-id="'+full.templateId+'" class="btn btn-xs red textalignleft"><i class="fa fa-star"></i> Delete Template</a></li>'
                        								+'</ul></div>'
											}
										},
										{
											"aTargets": [ 4 ],
											"mRender" : function(
													data, type,
													full) {
												if(full.object != null)
													return full.object.codeDisplay;
												else
													return "";
											}


										},
										{
											"aTargets": [ 11 ],
											"mRender" : function(
													data, type,
													full) {
												if(full.createdDate != null)
													return $.datepicker.formatDate('mm-dd-yy', new Date(full.createdDate));
												else
													return "";
											}


										},
										{
											"aTargets": [ 9 ],
											"mRender" : function(
													data, type,
													full) {
												if(full.lastModifiedDate != null)
													return $.datepicker.formatDate('mm-dd-yy', new Date(full.lastModifiedDate));
												else
													return "";
											}


										},

								],

								"fnServerData" : function(
										sSource, aoData,
										fnCallback, oSettings) {
									console.log("fnServerData");
									var paramMap = {};
									for (var i = 0; i < aoData.length; i++) {
										paramMap[aoData[i].name] = aoData[i].value;
										console.log("aoData[i] name: " + aoData[i].name);
										console.log("aoData value: " + aoData[i].value)
									}
									var pageSize = oSettings._iDisplayLength;
									var start = (paramMap.iDisplayStart>0)?paramMap.iDisplayStart:0;

									var pageNum = (start / pageSize);
									var sortCol = paramMap.iSortCol_0;
									var sortDir = paramMap.sSortDir_0;
									var sortName = paramMap['mDataProp_'
											+ sortCol];
									self.model.set("sortDir",
											sortDir);
									self.model.set("sortName",
											sortName);
									self.model.set("pageNum",
											pageNum);
									self.model.set("pageSize",
											pageSize);
									//$("#investorSearch").attr('disabled','disabled');
									$.ajax({
												"dataType" : 'json',
												"contentType" : "application/json",
												"type" : "GET",
												"url" : sSource,
												"success" : function(
														res) {
													res.iTotalRecords = res.iTotalRecords;
													res.iTotalDisplayRecords = res.iTotalRecords;
													fnCallback(res);
													//$("#investorSearch").removeAttr('disabled');
												},
												"error" : function(res) {
													 console.log("Failed in user Accounts View: " + res);
													
									                 
												}
											});
								}

							});
			$('select[name=messageTemplateInfoTable_length]').addClass('form-control');
			//$('#investorSearchResultsTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");
		}
	});
	return messageTemplatesView;
});