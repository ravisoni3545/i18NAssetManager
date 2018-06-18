
define(["backbone","app"],

		function(Backbone,app){

	var documentFileTypeView = Backbone.View.extend({

		initialize: function(){


		},
		el:"#maincontainer",

		events : {


			"change input[type=file]":"validateFileType"



		},
		validateFileType : function (evt) {
			var allowedFiles = [".doc", ".docx", ".pdf",".txt",".csv",".jpg",".jpeg",".gif",".png",".xls",".xlsm",".xlsx",".ppt",".pptx"];
			console.log("File Type");
			var files = evt.target.files;
			
			var regex = new RegExp("([a-zA-Z0-9\s_\\.\-:\(\)])+(" + allowedFiles.join('|') + ")$");
			var currInvalidExt =[];
			for(i=0;i<files.length;i++){
				var file = files[i];
				console.log(file.name);
				var fileName=file.name;
				var ext = fileName.lastIndexOf('.')>-1?fileName.substr(fileName.lastIndexOf('.') + 1):"with no extension";
				console.log(ext);
				if (!regex.test(fileName.toLowerCase())){
					if(!(currInvalidExt.indexOf(ext) > -1)){//check for duplicate extension
				currInvalidExt.push(ext);}
				}
			}
			var extnotallowed=currInvalidExt.join(',');
			if(currInvalidExt.length>0){
				$(evt.currentTarget).before('<div class="fileExtnError " style="color:red">File type '+extnotallowed+' not allowed</div>');
				$(evt.currentTarget).parent().find('.fileExtnError').delay(1000).fadeOut(1000);
				$(evt.currentTarget).replaceWith($(evt.currentTarget).clone(true));
				
			}
		/*	
			if (!regex.test(fileName.toLowerCase())) {
				console.log("file rejected");
				var f=$(evt.currentTarget).attr('name');
				$(evt.currentTarget).before('<div class="fileExtnError " style="color:red">File type .'+ext+' not allowed</div>');
				$(evt.currentTarget).parent().find('.fileExtnError').delay(1000).fadeOut(1000);
				$(evt.currentTarget).replaceWith($(evt.currentTarget).clone(true));
				//return false;
			} 
			*/


		},

	});
	return documentFileTypeView;

});