define(["text!templates/documentPreview.html","backbone", "app","models/documentPreviewModel", "collections/closingStepsCollection"],
		function(documentPreview, Backbone, app, documentPreviewModel, closingStepsCollection){
	 var DocumentPreviewView = Backbone.View.extend( {
		 initialize: function(options){
		 	this.render();
		 },
		 model:new documentPreviewModel(),
		 collection:new closingStepsCollection(),
		 el:"#maincontainer",
		 // showPreviewTimer:null,
		 hidePreviewTimer:null,
		 previousDocId:null,
		 UrlArray:[],
		 events          : {
			 'click .document-show': 'loadShowDocumentPreviewTimer',
			 'click .document-hide': 'loadHideDocumentPreviewTimer',
//			 'mouseover .document-hover': 'loadShowDocumentPreviewTimer',
//			 'mouseout .document-hover': 'loadHideDocumentPreviewTimer',
//			 'mouseover #evHoverPreview': 'clearHideDocumentPreviewTimer',
//			 'mouseout #evHoverPreview' : 'loadHideDocumentPreviewTimer'
	     },
	     render:function() {
	     	this.$el.append(documentPreview);
	     },
	     loadShowDocumentPreviewTimer:function(evt) {
	    	 evt.stopPropagation();
	    	 var self = this;
	    	 
	    	 var docId = $(evt.currentTarget).data("id");
	    	 $(".document-preview").removeClass('document-hide').addClass('document-show');
	    	 $(evt.currentTarget).removeClass('document-show').addClass('document-hide');
	    	 if (self.previousDocId == docId) { // No Need to process the request again
	    		 if(self.hidePreviewTimer != null) { clearTimeout(self.hidePreviewTimer); }
	    	 } else {
	    		 self.previousDocId = docId;
		    	 self.showDocumentPreview(self,evt);
	    	 }
	     },
	     showDocumentPreview: function(self, evt) {
	    	 $("#evHoverPreview").hide();
	    	 this.clearHideDocumentPreviewTimer();

	    	 var newEl =  $("#evHoverPreview");	
	    	 if(newEl.length){
	    	 	$(evt.currentTarget).parent().append(newEl);
	    	 } else {
	    	 	$(evt.currentTarget).parent().append(documentPreview);
	    		newEl =  $(evt.currentTarget).parent().find("#evHoverPreview");
	    	 }
	    	 
	    	 // Setting the left position of the preview
	    	 var correctedLeft = 0;
	    	 var windowWidth = self.getWindowWidth();
	    	 var offsetLeft = $(evt.currentTarget).offset().left || 0;
	    	 var previewWidth = 300; // Copy from html
	    	 var distanceFromTargetLeft = 190;
	    	 if(offsetLeft+previewWidth+distanceFromTargetLeft > windowWidth) {
	    		 correctedLeft = offsetLeft+previewWidth+distanceFromTargetLeft - windowWidth + 400;
	    	 }
	    	 $(newEl).css("left",distanceFromTargetLeft - correctedLeft + "px");
	    	 
	    	 // Setting the top position of preview
	    	 var correctedTop = 0;
	    	 var windowHeight = self.getWindowHeight();
	    	 var offsetTop = ($(evt.currentTarget).offset().top - window.pageYOffset) || 0;
	    	 var previewHeight = 150; 
	    	 var distanceFromTargetTop = 40;
	    	 if(offsetTop+previewHeight-distanceFromTargetTop > windowHeight) {
	    		 correctedTop = offsetTop+previewHeight-distanceFromTargetTop - windowHeight;
	    	 }
	    	 $(newEl).css("top",0 - distanceFromTargetTop - correctedTop + "px");
	    	 
	    	 $(newEl).css("zIndex",(parseInt($(newEl).css("zIndex")) || 0) + 1000);
	    	
	    	 $(newEl).find("#EVTNviewer").html("");
	    	 $(newEl).find("#EVTNviewer").attr( "src", "" );
	    	 $(newEl).find("#EVTNImgViewer > img").attr( "src", "" );
	    	 $(newEl).find("#previewCaption").html($(evt.currentTarget).attr( "docName"));
	    	 $(newEl).find("#EVTNviewer").hide();
	    	 $(newEl).find("#EVTNImgViewer").hide();
	    	 $(newEl).show();
	    	 
	    	 var docId = $(evt.currentTarget).data("id");
	    	 var downloadUrl = "";
	    	 var UrlObj = _.find(self.UrlArray, function(obj) { return obj.id == docId });
	    	 if(!UrlObj){
	    	 	self.model.loadDocumentPreview(docId,{
	                success : function ( model, res ) {
	                	downloadUrl = res.downloadUrl;
	                	self.UrlArray.push({id:docId,directUrl:downloadUrl});
	                	self.loadPreviewApi(evt,downloadUrl,newEl);
	                },
	                error: function (model,res){
	               	 	console.log("Fetching Document Preview failed");
	                }
	    	 	});
	    	 } else {
	    	 	downloadUrl = UrlObj.directUrl;
	    	 	self.loadPreviewApi(evt,downloadUrl,newEl);
	    	 }
	     },
	     loadPreviewApi:function(evt,downloadUrl,newEl){
	     	 var listOfImages = ["jpg","jpeg","jif","jfif","jp2","jpx","j2k","j2c","fpx","pcd","png","tif","tiff","gif"];
	    	 var indexOf = listOfImages.indexOf($(evt.currentTarget).data("docname").split(".")[1].toLowerCase());
	    	 if( indexOf != -1 ) {
	    		 var src = downloadUrl; //image
	    		 $(newEl).find("#EVTNImgViewer").attr( "url", src );
	    		 $(newEl).find("#EVTNImgViewer > img").attr( "src", src );
	    		 $(newEl).find("#EVTNImgViewer").show();
	    	 } else {
	    		 var src = "https://docs.google.com/gview?url=" + downloadUrl + "&embedded=true"; // documents
	    		 $(newEl).find("#EVTNviewer").attr( "src", src );
	    		 $(newEl).find("#EVTNviewer").show();
	    	 }	 
	     },
	     loadHideDocumentPreviewTimer:function(evt) {
	    	 var self = this;
	    	 $(".document-preview").removeClass('document-hide').addClass('document-show');
	    	 // $(evt.currentTarget).removeClass('document-hide').addClass('document-show');
	    	 self.hidePreviewTimer = setTimeout(function() {
	    		 self.previousDocId = null;
	    		 $("#evHoverPreview").hide();
	    	 }, 500);
	     },
	     clearHideDocumentPreviewTimer:function() {
	    	 if(this.hidePreviewTimer != null) { clearTimeout(this.hidePreviewTimer); }
	     },
	     getWindowWidth:function() {
	    	  if (window.innerHeight) {
	    	    return window.innerWidth;
	    	  }

	    	  if (document.documentElement && document.documentElement.clientHeight) {
	    	    return document.documentElement.clientWidth;
	    	  }

	    	  if (document.body) {
	    	    return document.body.clientWidth;
	    	  }
	    	  return 0;
    	 },
    	 getWindowHeight:function() {
    		 if (window.innerHeight) {
			    return window.innerHeight;
			  }

			  if (document.documentElement && document.documentElement.clientHeight) {
			    return document.documentElement.clientHeight;
			  }

			  if (document.body) {
			    return document.body.clientHeight;
			  }
			  return 0;
    	 }
	 });
	 return DocumentPreviewView;
});
