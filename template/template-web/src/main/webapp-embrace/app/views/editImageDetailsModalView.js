define(["text!templates/editImageDetailsModal.html","SecurityUtil","app","backbone"],
		function(modal,securityUtil,app, Backbone){
	
	var editImageDetailsModalView = Backbone.View.extend({
		initialize: function(options){			
			console.log("genPhotosview initialize");
			

		},
        events          : {
            "click button[name=editImageDetailsConfirm]":"editImage",
            "click #deletePhoto":"showDeleteConfirm",
            "click #deletePhotoConfirm":"confirmDelete",
            "click #editPhotoPrev":"changeToPreviousImage",
            "click #editPhotoNext":"changeToNextImage",
            "click #editImageDetailsSaveChangesBtn":"saveChanges",
            "click #allowEditFolderName":"showEditFolderInput",
            "click #allowEditImageDesc":"showEditImageDescInput",
            "click #saveIName":"saveImageChanges",
            "click #saveFName":"saveFolderChanges",
            "click a[name=cancelChanges]":"cancelChanges"
          //  "click img": "renderImageDetails"
           // "click h2[name=foldertitle]": "showFolder"

        },
		render : function () {
			var self=this;
			self.photoCount = Object.keys(self.photos).length;
			console.log("imagedetails view render");
			this.template = _.template( modal );
			this.$el.html("");
			self.parentView.modifiedFolderId = self.folderId;
			if(self.parentView.allF === true){
				console.log("all folder Clicked");
			}
			self.allPhotos=self.parentView.allF;
			console.log();
			console.log("render template");
			console.log("photoSrc: " + self.currentPhotoSrc + " photoDescirption: " + self.currentPhotoDescription + 
			 " folderName: " + self.currentFolderDescriprtion +  " self.photoID: " + self.photoId +
			  " self.folderID: " + self.folderId + " self.folderName: " + self.folderName);
//			console.log("photoset: " + JSON.stringify(self.photos));
//			console.log('currentPhotoNum: ' + self.currentPhotoNum);
			this.$el.html(this.template({currentPhotoSrc: self.currentPhotoSrc, currentFolderDescription:self.currentFolderDescription, currentPhotoDescription: self.currentPhotoDescription}));
			//CKEDITOR.replace( 'editorOverview1' );
						$("#editImageDetailsModal").modal('show');
			console.log("template rendered");
			//self.runjs();
			//return this;
	    },

	    editImage : function(){
	    	console.log("editImageDetailsConfirm clicked");
	    },
	    showDeleteConfirm: function(){
	    	$('#editImageDeleteError').hide();
	    	console.log('sdc');
	    	$('#deletePhotoConfirmation').show();
	    },
	    confirmDelete : function(calback){
	    	var self = this;
	    	console.log('confirm delete');
	    	var data = {};
	    	if(self.currentPhotoNum === 0 && self.photoCount === 1){
	    		console.log('last photo being deleted');
	    		data["deleteFolder"]="Y";
	    		data["photoFolderId"]=self.folderId;
	    		self.parentView.modifiedFolderId= null;
	    	}else{
	    		//data["photoFolderId"]=self.folderId;
	    		data["fileList"] =[self.photoId];
	    	}
	    	self.deleteImage(data, {
	    		success: function(res){
	    			console.log('delete single image Success: ' + res.statusCode);
	    			self.renderParent();
			    	$('#editImageDetailsModal').modal('hide');
					$('body').removeClass('modal-open');
					$('.modal-backdrop').remove();
	    			$.unblockUI();
	    		},
	    		error: function(res){
	    			console.log('error deleting photo');
	    			$('#editImageDeleteError').show();
	    			$.unblockUI();
	    		}
	    	});
	    	$('#deletePhotoConfirmation').hide();



	    },

	    deleteImage: function(data, callback){
	    	$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
	    	$.ajax({
                url: app.context() +'/photoUpload/deletePhotos',
                contentType: 'application/json',
                dataType:'json',
                type: 'DELETE',
                data: JSON.stringify(data),
                success: function(res){ 
                	//console.log("statusCode: " + res.statusCode);
                	if(res.statusCode === "400")
                		callback.error(res);
                	else         
                   	 callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
	    },
	    changeToNextImage: function(){
	    	var self = this;
	    	console.log("change next image");

	    	if(self.allPhotos === true){
	    		if(self.currentPhotoNum < self.photoCount-1){
		    		self.currentPhotoNum+=1;
		    		self.updateCurrentImage();
		    	}
		    	else if(self.currentPhotoNum== self.photoCount-1){
		    		self.currentPhotoNum = 0;
		    		self.changeToNextFolder();

		    	}

	    	}else{

		    	if(self.currentPhotoNum < self.photoCount-1)
		    		self.currentPhotoNum+=1;
		    	else if(self.currentPhotoNum== self.photoCount-1)
		    		self.currentPhotoNum = 0;
		    	self.updateCurrentImage();
	    	}
 
	    },
	    changeToPreviousImage: function(){
	    		    	var self = this;
	    	console.log("change to prev image");	    	

	    	if(self.allPhotos === true){
	    		if(self.currentPhotoNum == 0){
		    		self.changeToPreviousFolder();
		    	}
		    	else if(self.currentPhotoNum >=1){
		    		self.currentPhotoNum-=1;
		    		self.updateCurrentImage();

		    	}

	    	}else{
		    	if(self.currentPhotoNum == 0)
		    		self.currentPhotoNum = self.photoCount-1;
		    	else if(self.currentPhotoNum >=1)
		    		self.currentPhotoNum-=1;
		    	self.updateCurrentImage();
		    }
	    },

	    changeToPreviousFolder : function(){
	    	var self = this;
	    	console.log("change to prev folder");
	    	var nextFolderInt = -9999;
	    	_.each(self.parentView.photoSet, function(folder, index){
	    		console.log('index: ' + index);
	    		if(folder.photoFolderId === self.folderId){
	    			nextFolderInt = index-1;
	    			console.log('nextFolderInt updated');
	    			if(nextFolderInt < 0){
	    				nextFolderInt = self.parentView.photoSet.length-1;
	    				console.log("goign to last folder");
	    			}
	    		}
	    	});
	    	console.log('nextFolderInt:' + nextFolderInt);
	    	if(nextFolderInt>=0)
	    		self.updateCurrentFolder(nextFolderInt,false);

	    },

	    changeToNextFolder : function(){
	    	var self = this;
	    	console.log('change to next folder');
	    	var nextFolderInt = -9999;
	    	_.each(self.parentView.photoSet, function(folder, index){
	    		console.log('index: ' + index);
	    		if(folder.photoFolderId === self.folderId){
	    			nextFolderInt = index+1;
	    			console.log("updatedNextFolderINt");
	    			if(nextFolderInt > self.parentView.photoSet.length-1){
	    				nextFolderInt = 0;
	    				console.log("going to first folder");
	    			}
	    		}
	    	});
	    	console.log("nextFolderInt: " + nextFolderInt);
	    	if(nextFolderInt>=0)
	    		self.updateCurrentFolder(nextFolderInt,true);

	    },
	    
	    updateCurrentImage : function(){	
	    	var self=this;
	    	console.log("currentPhotoNum: " + self.currentPhotoNum);
	    	self.photoId = self.photos[self.currentPhotoNum].photoId;
	    	self.currentPhotoSrc= self.photos[self.currentPhotoNum].largeLink;
	    	self.currentPhotoDescription = self.photos[self.currentPhotoNum].description;
	  //   		$('#editImageDetailsModal').modal('hide');
			// $('body').removeClass('modal-open');
			// $('.modal-backdrop').remove();
	    	// self.render();
	    	$('#editImageDetailsSrc').attr('src', self.currentPhotoSrc);
	    	$('#editImageDetailsImageName').val(self.currentPhotoDescription);
	    	$('#editImageDetailsImageName').text(self.currentPhotoDescription);

	    },

	    updateCurrentFolder : function(nextFolderInt,forward){
	    	var self=this;
	    	console.log('nextFolderInt: ' + nextFolderInt);
	    	var folder = self.parentView.photoSet[nextFolderInt];
	    	self.photos = folder.photos;
	    	self.folderId = folder.photoFolderId;
	    	if(forward)
	    		self.currentPhotoNum = 0;
	    	else
	    		self.currentPhotoNum = self.photos.length-1;

	    	self.photoId= folder.photos[self.currentPhotoNum].photoId;
	    	self.currentFolderDescription = folder.folderDescription;
	    	self.currentPhotoSrc = folder.photos[self.currentPhotoNum].largeLink;
	    	self.currentPhotoDescription = folder.photos[self.currentPhotoNum].description;
	    	$('#editImageDetailsModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			self.render();

	    },

	    saveChanges : function(){
	    	$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
	    	var self=this;
	    	if(self.currentFolderDescription !== $('#editImageDetailsFolderName').val())
	    		self.saveFolderChanges();
	    	if(self.currentPhotoDescription !== $('#editImageDetailsImageName').val())
	    		self.saveImageChanges();
	    },
	    saveFolderChanges : function(){
	    	var self = this;
	    	console.log('saving folder changes');
	    	var data = {};
	    	data["object"]= "folder";
	    	data["objectId"]= self.folderId;
	    	data["description"] = $('#editImageDetailsFolderName').val();
	    	self.edit(data, {
	    		success : function(res){
	    			console.log('success in updating folder name');
	    			$.unblockUI();
	    			self.renderParent();
	    		},
	    		error: function(res){
	    			console.log('error in updating folder name ' + res);
	    			$.unblockUI();

	    		}
	    	});

	    },
	    saveImageChanges : function(){

	    	var self = this;
	    	console.log('savingImageChanges');
	    	var data = {};
	    	data["object"]= "photo";
	    	data["objectId"]= self.photoId
	    	data["description"] = $('#editImageDetailsImageName').val();
	    	self.edit(data, {
	    		success : function(res){
	    			console.log('success in updating image name');
	    			self.renderParent();
	    		   $.unblockUI();


	    		},
	    		error: function(res){
	    			console.log('error in updating image name ' + res);
	    			$.unblockUI();


	    		}
	    	});

	    },
	    edit: function(data, callback){

	    	$.ajax({
                url: app.context() +'/photoUpload/edit/' + data.object + '/' + data.objectId,
                contentType: 'application/json',
                dataType:'json',
                type: 'PUT',
                data: JSON.stringify(data),
                success: function(res){          
                    callback.success();
                },
                error: function(res){
                    callback.error(res);
                }
            });

	    },
	    renderParent: function(){
	    	var self = this;
		   $('#editImageDetailsModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			self.parentView.render();
	    },
	    showEditFolderInput: function(){
	    	$('#allowEditFolderName').hide();
	    	$('#editImageDetailsFolderName').replaceWith('<div><input style="width:200px" id="editImageDetailsFolderName" name="imageName" type="text" value="'+$('#editImageDetailsFolderName').text()+'" class="form-control idata" ></input><div style="margin-left:138px"><a id="saveFName" class="btn btn-sm green"><i class="fa fa-pencil"></i></a><a name="cancelChanges" class="btn btn-sm red"><i class="fa fa-times"></i></a></div></div>');
	    },
	    showEditImageDescInput : function(){
	    	$('#allowEditImageDesc').hide();
	    	$('#editImageDetailsImageName').replaceWith(' <div> <input style="width:200px" id="editImageDetailsImageName" name="imageName" type="text" value="'+$('#editImageDetailsImageName').text()+'" class="form-control idata" ></input><div style="margin-left:138px"><a id="saveIName" class="btn btn-sm green"><i class="fa fa-pencil"></i></a><a name="cancelChanges" class="btn btn-sm red"><i class="fa fa-times"></i></a></div></div>');
	    },
	    cancelChanges : function(evt){
	    	var self=this;
	    	console.log('cancelCahnges');
	    	$('#editImageDetailsModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
	    	self.render();
	    },


	
		
		
	});
	return editImageDetailsModalView;
});