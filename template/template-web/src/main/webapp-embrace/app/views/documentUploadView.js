define(["backbone","app","text!templates/document.html"],
		function(Backbone,app,documentPage){

	var DocumentUploadView = Backbone.View.extend( {
		initialize: function(){
			console.log("Reached documentUploadView");
		},
		events:{
			"click .file-upload-delete":"fileUploadDelete"
		},
		documentNo:0,
		/*documentArray:[],
		documentCountArray:[],*/
		documentUploadGUID:"",
		el:"#maincontainer",
		render:function () {
			// TODO: wirte code to reset documentArray,documentCountArray
			// TODO: and to remove all the hidden docTypeField
			/*documentCount = 0;
			documentArray = [];
			documentCountArray = [];*/
		},
		guid:function() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
			}
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
		},
		initializeFileUpload:function(formEl,submitBtn){
			var self = this;
			if($(formEl).find("form").data("formid")){
				console.log("Form already initialized. id:" + $(formEl).find("form").data("formid"));
				return;
			}
			console.log("initializeFileUpload");
			var formId = self.guid();
			$(formEl).find("form").data("formid",formId)
			self.documentNo = 0;
			/* var	formEl = $("#document-form1");*/
			// self.documentUploadGUID = self.guid();
			var url = app.context() + '/document/immediateUploadDocument/' + formId;
			/*uploadButton = $('<button/>')
		         .addClass('btn btn-primary')
		         .prop('disabled', true)
		         .text('Processing...')
		         .on('click', function () {
		             var $this = $(this),
		                 data = $this.data();
		             $this
		             .off('click')
		             .text('Abort')
		             .on('click', function () {
		                 $this.remove();
		                 data.abort();
		             });
		             data.submit().always(function () {
		                 $this.remove();
		             });
		         });*/

			self.file_upload = formEl.fileupload({
				url:url,
				dataType: 'json',
				// formData:{extra:1},
				autoUpload: false,
				fileInput: $(formEl).find("input:file"),
				maxFileSize: 5000000, // 5 MB
				acceptFileTypes: /(\.|\/)(?!exe|js)[^.]*$/i,  // was an mistake expression: /(\.|\/)(?!exe|js)$/i
				// Enable image resizing, except for Android and Opera,
				// which actually support image resizing, but fail to
				// send Blob objects via XHR requests:
				disableImageResize: /Android(?!.*Chrome)|Opera/
					.test(window.navigator.userAgent),
					previewMaxWidth: 100,
					previewMaxHeight: 100,
					previewCrop: true,
					filesContainer: $(formEl).find('table.files'),
					uploadTemplateId: null,
					downloadTemplateId: null,
					uploadTemplate: function (o) {
						var rows = $();
						$.each(o.files, function (index, file) {
							var row = $('<tr id="' + file.documentNo + '" class="template-upload fade col-md-12">' +
									'<td class="col-md-11"><span class="name"></span> <span class="size pull-right"></span>' +
									(file.error ? '<div class="error" style="color:rgb(221, 231, 240); background-color:rgb(244, 58, 58); border-radius: 5px !important;"></div>' : '') +
									(o.files.error ? '' : '<div style="padding-left:0;padding-right:0;"><div class="progress progress-striped active" style="background-color: green;width:0%;height: 8px; border-radius: 100px !important;" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="progress-bar progress-bar-success" style="width:0%;"></div></div></div>') +
									'</td>' +
									/*'<td class="col-md-6"><div class="col-md-4" style="padding-left:0; padding-right:0;"><p class="size"></p></div>' +
		                    	(o.files.error ? '' : '<div class="col-md-8" style="padding-left:0;padding-right:0;"><div class="progress progress-striped active" id="' + file.documentNo + '" style="background-color: green;width:0%;height: 10px; border-radius: 100px !important;" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="progress-bar progress-bar-success" style="width:0%;"></div></div></div>') +
		                    '</td>' +*/
									'<td class="col-md-1">' +
									(!index ? '<span style="cursor:pointer;" data-docno="'+ file.documentNo + '" class="cancel file-upload-delete"><i class="fa fa-times"></i></span>' : '') +
									'</td>' +
							'</tr>');
							row.find('.name').text(file.name);
							row.find('.size').text(o.formatFileSize(file.size));
							if (file.error) {
								row.find('.error').text(file.error);
								formEl.find(".files #" + file.documentNo).remove();
							}
							rows = rows.add(row);
						});
						return rows;
					}
			}).bind("fileuploadadd", function(e, data){
				/*console.log(data.files);
		        console.log(data.originalFiles);
		        self.filesList.push(data.files[0]);
		        console.log(e.delegatedEvent.target);
		        self.paramNames.push(e.delegatedEvent.target.name);*/
				/* data.context = $('<div/>').appendTo($(e.currentTarget).find(".fileInformationDiv"));

		        $.each(data.files, function (index, file) {
		        	// self.filesNameList.push(file.name);
		            var node = $('<p/>')
		                    .append($('<span/>').text(file.name));
		            if (!index) {
		                node
		                    .append('<br>')
		                    .append(uploadButton.clone(true).data(data));
		            }
		            node.appendTo(data.context);
		        });*/

				console.log(data.originalFiles[0].name);
				var currInvalidExt =[];
				for(i=0;i<data.originalFiles.length;i++){
					var ext=self.validateFileExt(data.originalFiles[i].name);
				if(ext!=true){
					if(!(currInvalidExt.indexOf(ext) > -1)){//check for duplicate extension
						currInvalidExt.push(ext);}
					
				}
				}
				var extnotallowed=currInvalidExt.join(',');
				
				if(currInvalidExt.length>0){
				formEl.find(".uploadDocDiv").before('<div class="fileExtnError " style="color:red; margin-bottom:10px;">File type '+extnotallowed+' not allowed</div>');
				formEl.find(".uploadDocDiv").parent().find('.fileExtnError').delay(1000).fadeOut(1000);
				return false;
				}
				
				
				submitBtn.attr("disabled",true);
				self.documentNo++;
				data.files[0]["documentNo"] = self.documentNo;
				data.submit();
			}).bind('fileuploadsubmit', function (e, data) {
				data.formData = {documentNo: self.documentNo};
			}).bind('fileuploadprocessalways', function (e, data) {
				console.log("fileuploadprocessalways");
				/*var index = data.index,
		            file = data.files[index],
		            node = $(data.context.children()[index]);
		        if (file.preview) {
		            node
		                .prepend('<br>')
		                .prepend(file.preview);
		        }
		        if (file.error) {
		            node
		                .append('<br>')
		                .append($('<span class="text-danger"/>').text(file.error));
		        }
		        if (index + 1 === data.files.length) {
		            data.context.find('button')
		                .text('Upload')
		                .prop('disabled', !!data.files.error);
		        }*/
				// }).bind('fileuploadprogressall', function (e, data) {
			}).bind('fileuploadprogress', function (e, data) {
				var progress = parseInt(data.loaded / data.total * 100, 10);
				$(data.form).find('#' + data.formData.documentNo + ' .progress').css(
						'width',
						progress + '%'
				);
			}).bind('fileuploaddone', function (e, data) {
				if(data.result.files){
					$.each(data.result.files, function (index, file) {
						if (file.url) {
							var link = $('<a>')
							.attr('target', '_blank')
							.prop('href', file.url);
							$(data.context.children()[index])
							.wrap(link);
						} else if (file.error) {
							var error = $('<span class="text-danger"/>').text(file.error);
							$(data.context.children()[index])
							.append('<br>')
							.append(error);
						}
					});
				}
			}).bind('fileuploadfail', function (e, data) {
				console.log("fileuploadfail");
				/*$.each(data.files, function (index) {
		            var error = $('<span class="text-danger"/>').text('File upload failed.');
		            $(data.context.children()[index])
		                .append('<br>')
		                .append(error);
		        });*/
			}).bind('fileuploadstop', function (e, data) {
				console.log("fileuploadstop");
				submitBtn.attr("disabled",false);
			});
		},
		fileUploadDelete:function(evt){
			var formId = $(evt.currentTarget).closest("form").data("formid");
			var docNoToDelete = $(evt.currentTarget).data("docno");

			$.ajax({
				url: app.context()+ '/document/immediateUploadDocumentDelete/' + formId + '/' +docNoToDelete,
				contentType: 'application/json',
				dataType:'text',
				type: 'DELETE',
				success: function(res){
					$(evt.currentTarget).closest("tr").remove();
				},
				error: function(res){
					console.log("Removing Document from cache failed");
				}
			});
		},
		fileUploadDeleteAll:function(form){
			var formId = $(form).data("formid");

			$.ajax({
				url: app.context()+ '/document/immediateUploadDocumentDeleteAll/' + formId,
				contentType: 'application/json',
				dataType:'text',
				type: 'DELETE',
				success: function(res){
					$(form).find(".uploadDocDiv .files tbody").empty();
				},
				error: function(res){
					console.log("Removing all form documents from cache failed");
				}
			});
		},
		validateFileExt:function(fileName){

			var allowedFiles = [".doc",".docx", ".pdf",".txt",".csv",".jpg",".jpeg",".gif",".png",".xls",".xlsm",".xlsx",".ppt",".pptx"];
			var ext = fileName.lastIndexOf('.')>-1?fileName.substr(fileName.lastIndexOf('.') + 1):"with no extension";
			//var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
			var regex = new RegExp("([a-zA-Z0-9\s_\\.\-:\(\)])+(" + allowedFiles.join('|') + ")$");

			if (!regex.test(fileName.toLowerCase())) {
				return ext;
			} 
			return true;

		}

	});
	return DocumentUploadView;
});