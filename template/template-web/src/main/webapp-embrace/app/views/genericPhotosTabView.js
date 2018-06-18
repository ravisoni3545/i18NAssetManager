define(["text!templates/genericPhotosTab.html", "views/editImageDetailsModalView","models/genericPhotosModel","SecurityUtil","app","backbone"],
		function(photosTab, editImageDetailsModalView, genericPhotosModel ,securityUtil,app, Backbone){
	
	var GenericPhotosTabView = Backbone.View.extend({
		initialize: function(){
			
			console.log("genPhotosview initialize");
			var self= this;
		

		},
        events          : {
            "change input[name=showTitles]": "toggleTitles",
            "click #startUploadButton": "uploadPhotos",
            "click button[name=filterButton]":"changeFilter",
            "click #createFolderBtn":"createFolder",
            "click button[name=cancelPButton]": "resetForm",
            "click #uploadPhotos":"resetForm",
            "click #createFolder":"resetForm",
            //"click button[name=createFolderBtn]": "createFolder",
             "click button[name=deleteFolderConfirm]":"deleteFolder",
            // "click button[name=deleteAllFoldersConfirm]":"deleteAllFolders",
             "click .aimg": "renderImageDetails",
            // "click .radio-list input[name='uploadType']":'showUploadType'
           // "click h2[name=foldertitle]": "showFolder"

        },
		render : function () {
			var self=this;
			self.apilink = app.context() + '/photoUpload/addPhotos';
			if(this.object === 'Marketing'){
				self.defaultFolderName = 'Leasing Photos';
			}else{
				self.defaultFolderName = this.object + ' Photos';
			}
				console.log('Detault Folder name: ' + self.defaultFolderName);
				self.defaultFolderShortName = self.defaultFolderName.replace(/\s+/g, '');
				console.log('defaultFolderShortname: ' + self.defaultFolderShortname);
				self.currentFolderDescription = self.defaultFolderShortName;

			console.log("genPhotosview render");
			console.log("object: " + self.object);
			console.log("object Id: " + self.objectId);
			console.log("parent Id: " + self.parentId);
			console.log("property Id: " + self.propertyId);
	    	if(!self.genericPhotosModel)
	    	{
	    		self.genericPhotosModel = new genericPhotosModel();
	    	}
	    	 self.genericPhotosModel.object = self.object;
	    	 self.genericPhotosModel.objectId = self.objectId;
	    	 self.genericPhotosModel.getFolders({
	    	 	success : function(res){
		    	 	console.log('getFolders success:');
		    	 	self.photoSet = res.folder;
		    	 	self.length = self.photoSet.length;
		    	 	console.log("length: " + self.length);
		    	 	self.hasPhotos = false;
		    	 	if(self.length >= 1)
		    	 	{
		    	 		self.allF = true;
		    	 		self.hasPhotos = true;
		    	 		self.initialFolder = self.photoSet[0].folderDescription;
		    	 		self.currentFolderId = self.photoSet[0].photoFolderId;
		    	 		console.log("has photos. initial folder: " + self.initialFolder + " id: " + self.currentFolderId);
		    	 	}
		    	 	else
		    	 	{
		    	 		console.log('has no photos');
		    	 		//self.initialFolder = defaultFolderName;
		    	 	}
		    	 	
		    	 	self.template = _.template( photosTab );
					self.$el.html("");
					console.log("render template");
					self.$el.html(self.template({modifiedFolderId: self.modifiedFolderId,initialFolderName: self.initialFolder,length:self.length,hasPhotos : self.hasPhotos,folders: self.photoSet,object:self.object,objectId:self.objectId,parentId:self.parentId,propertyId:self.propertyId, apilink:self.apilink, defaultFolderName:self.defaultFolderName,defaultFolderShortName: self.defaultFolderShortName}));
					$('button[name=filterButton].active').click();
					console.log("template rendered");

					var options = { 
		            target: '#response', 
		            url:        self.apilink,
		            async: false,
		            success:    function() { 
		                console.log('success in uploading photos');
		            },
		            error: function(){
		                console.log("error in uploading photos");
		            } 
		        	};
		             
		            $('#uploadPhotosForm').ajaxForm(function(options) { 
		                console.log("success in uploading photos");
		                self.render();
		                $.unblockUI();
		            }); 

					var options2 = { 
		            target: '#responseCreate', 
		            url:        self.apilink,
		            async: false,
		            success:    function() { 
		                console.log('success in uploading photos');
		            },
		            error: function(){
		                console.log("error in uploading photos");
		            } 
		        	};
		            $('#createFolderForm').ajaxForm(function(options2) { 
		                console.log("success in creating folders and uploading photos");
		                self.render();
		                $.unblockUI();

		            }); 
	    	 
			    	}, 
			    error : function(res){
			    		console.log("error in creating folders and uploading folders:" + res);
			    	}
	   		 });

			//if(self.modifiedFolderId)

	    	 console.log('called get Folders successfully');

		    },


	    toggleTitles : function(evt){
	    	console.log("toggle titles");
	    	if($(evt.target).is(':checked'))
	    	{
	    		console.log("checked");
	    		$('.foldertitle').removeClass('hidden');
	    	}
	    	else
	    	{
	    		console.log("not checked");
	    		$('.foldertitle').addClass('hidden');
	    	}

	    },

	    createFolder : function(){
	    	if($('#createFolderName').val() === '' || $('#createFolderFiles').get(0).files.length === 0)
	    	{
	    		$('#genericCreateFolderError').show();
	    		console.log('no files selected');
	    	} else{
	    		console.log("length: " + $('#createFolderFiles').get(0).files.length);
		    	$.blockUI({
							baseZ: 999999,
							message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
						});
		    	console.log("createFolder called");
		    	var folderName = $('#createFolderName').val();
		    	console.log("folderName:" + folderName);
		    	$('#createFolderSubmit').click();
		    	$('#createFolderModal').modal('hide');
				$('body').removeClass('modal-open');
				$('.modal-backdrop').remove();
			}
	    },

	    deleteFolder : function(){
	    	$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
	    	var self=this;
	    	var data ={};
	    	data["photoFolderId"]=self.currentFolderId;
	    	data["deleteFolder"]="Y";
	    	console.log("delete Folder");
	    	// _.each(self.photoSet, function(folder){
	    	// 	if(folder.photoFolderId === self.currentFolderId){
	    	// 		console.log('found folder');
	    	// 		_.each(folder.photos, function(photo){
	    	// 			data.fileList.push(photo.photoId);
	    	// 		});
	    	// 	}
	    	// });
			self.currentFolderId = null;
	    	
	    	self.deleteImages(data, {
	    		success: function(res){
	    			self.modifiedFolderId = null;
	    			console.log('mass delete of images success');
	    			self.render();
	    			$.unblockUI();
	    		},
	    		error: function(res){
	    			console.log('mass delete of images failed: ' + res);
	    			$.unblockUI();

	    		}
	    	});




	    	$('#deleteFolderConfirmationModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
	    },

	    deleteImages: function(data, callback){

	    	$.ajax({
                url: app.context() +'/photoUpload/deletePhotos',
                contentType: 'application/json',
                dataType:'json',
                type: 'DELETE',
                data: JSON.stringify(data),
                success: function(res){          
                    callback.success();
                },
                error: function(res){
                    callback.error(res);
                }
            });
	    },

	    deleteAllFolders : function(){
	    	console.log("delete All folders Confirm");
	    },

	    renderImageDetails : function(evt){
	    	var self=this;
	    	console.log("renderImageDetails Modal");
	    	if(!self.editImageDetailsModalView)
	    	{
	    		self.editImageDetailsModalView = new editImageDetailsModalView();
	    	}

	    	
		    	var folderId = $(evt.target).attr('folder-id');
		    	var photoId = $(evt.target).attr('photo-id');
		    	var photoSrc = $(evt.target).attr('photo-src');
		    	var photoDescription = $(evt.target).attr('photo-description');
		    	var folderName = $(evt.target).attr('folder-name');
		    	
		    	console.log("photoId: " + photoId + " folderId:" + folderId + " folderName: "+ folderName + " photoSrc: " + photoSrc + " photoDescription:" +photoDescription );
		    	
		    	self.editImageDetailsModalView.folderId = folderId;
		    	self.editImageDetailsModalView.photoId = photoId;
		    	console.log("photoID: " + photoId);
		    	self.editImageDetailsModalView.currentFolderDescription = folderName;
		    	self.editImageDetailsModalView.currentPhotoSrc= photoSrc;
		    	self.editImageDetailsModalView.currentPhotoDescription = photoDescription;
		    	self.editImageDetailsModalView.parentView = self;
		    	var counter = -1;
		    	if(self.allF === true)
		    	{
		    		_.each(self.photoSet, function(set){
			    		if(set.photoFolderId === folderId){
			    			console.log("found folder");
			    				self.editImageDetailsModalView.photos = set.photos;
			    				_.each(set.photos, function(photo){
			    					console.log("inc counter");
			    					counter++;
			    					console.log("photoID: " + self.editImageDetailsModalView.photoId + " photo.photoId:" + photo.photoId);
			    					if(photo.photoId === self.editImageDetailsModalView.photoId)
			    					{
			    						console.log("found photo");
			    						self.editImageDetailsModalView.currentPhotoNum = counter;
			    					}
			    				});
			    			} });
		    	}else{
		    		
			    	_.each(self.photoSet, function(set){
			    		if(set.photoFolderId === folderId){
			    			console.log("found folder");
			    				self.editImageDetailsModalView.photos = set.photos;
			    				_.each(set.photos, function(photo){
			    					console.log("inc counter");
			    					counter++;
			    					console.log("photoID: " + self.editImageDetailsModalView.photoId + " photo.photoId:" + photo.photoId);
			    					if(photo.photoId === self.editImageDetailsModalView.photoId)
			    					{
			    						console.log("found photo");
			    						self.editImageDetailsModalView.currentPhotoNum = counter;
			    					}
			    				});
			    			} });
			    }

		  
	    	//self.editImageDetailsModalView.photos = self.photoSet;
	    	self.editImageDetailsModalView.setElement($('#editImageDetailsModalDiv')).render({parentView: self});
	    },

	    showUploadType : function(evt){
	    	var value = $(evt.target).val();
	    	console.log("showUploadType: " + value);
	    	if(value === 'single')
	    	{
	    		$('#multiPhotoUploadDiv').hide();
	    		$('#singlePhotoUploadDiv').show();
	    	}
	    	else{
	    		$('#singlePhotoUploadDiv').hide();
	    		$('#multiPhotoUploadDiv').show();
	    	}
	    },

	    uploadPhotos : function(){
	    	$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
	    	 var self= this;
	    	 self.modifiedFolderId = self.currentFolderId;
	    	 console.log('uploadPhotosClicked');
	    	 $('#uploadPhotosSubmit').click();
	    	 $('#uploadPhotos').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
			//self.render();
	    	// var data = {};
	    	// data["object"]= this.object;
	    	// data["objectId"]=this.objectId;
	    	// data["parentId"]=this.parentId;
	    	// data["propertyId"]=this.propertyId;
	    	// data["description"]=this.currentFolderDescription;
	    	// self.genericPhotosModel.uploadPhotos();
	    	// self.render();
	    },

	    showFolder : function(evt){
	    	// console.log("show Folder");
	    	// var name = $(evt.target).attr('title');
	    	// console.log("title: " + name);
	    	// $(":button").each(function(){ if($(this).hasClass(name)){ $(this).click();}});

	    },
	    changeFilter : function(evt){
	    		var self=this;
	    		var val = $(evt.target).text();
	    		var id = $(evt.target).attr('folder-id');
		         var filter = $(evt.target).attr('class');
		         self.modifiedFolderId = id;
		         
		      if ( $(evt.target).hasClass('all') ) {
		      	self.allF = true;
		      	console.log("clicked allll");
		         $('.post').removeClass('hidden');
		         $( "#filter button" ).removeClass('active');
		          $(evt.target).addClass('active');
		         $("#filter button").attr("disabled", false);
		         $(evt.target).attr("disabled", true);
		         $('.deleteFolder').addClass('hidden');
		         $('.uploadPhotos').addClass('hidden');
		         $('#editFolder').addClass('hidden');
		         $('#titleToggle').removeClass('hidden');
		         $('#createFolder').removeClass('hidden');
		         if($('#showTitles').is(':checked')){
		    			$('.foldertitle').removeClass('hidden');
		    			console.log('checked');
	    			}
	    		 else{
			    		$('.foldertitle').addClass('hidden');
			    		console.log('not checked');
			    	}
		      }
		      else {
		      	self.allF = false;
		      	console.log("prev: " + self.currentFolderDescription);
		         self.currentFolderDescription = val;
		         self.currentFolderId = id; 
		         console.log("currentFolderDescription: " + self.currentFolderDescription + " id: " + self.currentFolderId);
		         $('#folderDescription').val(self.currentFolderDescription);
		         console.log("currentFolderDescriptionval: " + $('#folderDescription').val());
		         $(evt.target).removeClass('active');
		      	var clicked = $(evt.target).attr('class');
		      	console.log("clicked: " + clicked);
		      	//hide the posts
		         $('.post').addClass('hidden');
		         $('.post').each(function(){ if($(this).hasClass(clicked)){$(this).removeClass('hidden');  } });
		         // $('.hidden').contents().appendTo('#posts').hide().show('slow');
		         // $('.post:not(.' + filter + ')').appendTo('.hidden').hide('slow');
		         $( "#filter button" ).removeClass('active');
		         $(evt.target).addClass('active');
		         $("#filter button").attr("disabled", false);
		         $(evt.target).attr("disabled", true);
		         $('.deleteFolder').removeClass('hidden');
		         $('.uploadPhotos').removeClass('hidden');
		         $('#editFolder').removeClass('hidden');
		         $('#titleToggle').addClass('hidden');
		         console.log('checking selflength: ' + self.length);
		         if(self.length > 1)
		         {
		         	console.log("length greater thatn 1");
		        	 $('#createFolder').addClass('hidden');
		        } else{
		        	 $('#createFolder').removeClass('hidden');
		        }



		      }
	    },
	    resetForm : function(){
	    	console.log('called reset form');
	    	$('#genericCreateFolderError').hide();
	    	$('#uploadPhotoFiles').val('');
	    	$('#createFolderName').val('');
	    	$('#createFolderFiles').val('');

	    },
		
		
	});
	return GenericPhotosTabView;
});