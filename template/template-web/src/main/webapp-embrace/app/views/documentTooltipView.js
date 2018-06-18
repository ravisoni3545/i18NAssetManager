define(["backbone", "app","text!templates/documentListForTask.html","text!templates/messagesListForTask.html","models/documentTooltipModel"],
		function(Backbone, app, documentForTaskPage, messageForTaskPage, documentTooltipModel){
	 var DocumentTooltipView = Backbone.View.extend( {
		 initialize: function(options){
		 	// this.render();
		 },
		 model:new documentTooltipModel(),
		 el:"#maincontainer",
		 hidePreviewTimer:null,
		 previousDocId:null,
		 UrlArray:[],
		 events          : {
		 	'click .showDocumentTooltip_2': 'showDocumentsForTask',
			'click .showMessageTooltip_2': 'showMessagesForTask',
			'hidden.bs.modal .with-popover': 'bsModalHide', // check for double events (closingStepsView)
			"click .showMoreMessage" : "showMoreContent", // check for double events (closingStepsView)
			"click .showLessMessage" : "showLessContent", // check for double events (closingStepsView)
			"shown.bs.popover .showMessageTooltip_2" : "rearrangeMessageTooltip",
			"click .popover-close" : "closePopover" // check for double events (closingStepsView)
	     },
	     render:function() {
	     	console.log("Reached DocumentTooltipView");
	     	this.initializeTooltipEffects();
	     	// this.$el.append(documentPreview);;
	     },
	     showMessagesForTask:function (evt) {
			evt.preventDefault();
			evt.stopPropagation();
			var self = this;
			var isVisible = $(evt.currentTarget).data('show');



			if(isVisible == true){
				var msgContent =""; 
					
				/*if($(evt.currentTarget).data('object')){
					msgContent=self.getMessagesForTask($(evt.currentTarget).data('taskkey'),$(evt.currentTarget).data('object'),$(evt.currentTarget).data('objectid'));
				}
				else{*/
					msgContent=self.getMessagesForTask($(evt.currentTarget).data('taskkey_2'),$(evt.currentTarget).data('taskkey_1'), $(evt.currentTarget).data('object'),$(evt.currentTarget).data('objectid'),$(evt.currentTarget).data('subobject'),$(evt.currentTarget).data('subobjectid') );
				// }
				
				var els = $(".tooTip-shown");
				_.each(els,function(el){
					$(el).removeClass("tooTip-shown");
					$(el).popover("hide");
					$(el).data('show',true);
				});
				$(evt.currentTarget).addClass("tooTip-shown");
				$(evt.currentTarget).data('show',false);
				if(msgContent.length>0){
					$(evt.currentTarget).attr("data-content",msgContent);
				}
				else{
					$(evt.currentTarget).attr("data-content","No messages");
				}
				$(evt.currentTarget).popover("show");
			} else {
				$(evt.currentTarget).popover("hide");
				$(evt.currentTarget).data('show',true);
				$(evt.currentTarget).removeClass("tooTip-shown");
			}
		},
		getMessagesForTask:function(taskKey_2,taskKey_1,object,objectId,subObject,subObjectId) {
			/*var taskKey = taskKey || this.currentTaskKey;
			var excludedTaskKeys = ['INSURANCE_QUOTES_REVIEW','INSURANCE_VENDOR_SELECTION'];
			var object = object || this.currentObject;
			var objectId = objectId || this.currentObjectId;*/
			var msgContent;
			 taskKey_1 = taskKey_1 || null;
	    	 taskKey_2 = taskKey_2 || null;
	    	 subObject = subObject || null;
	    	 subObjectId = subObjectId || null;

			/*if(!subObject){
				this.model.loadEachTaskMessage(taskKey,object,objectId,{
					success : function ( model, res ) {
						msgContent = res;
					},
					error: function (model,res){
						console.log("Fetching Messages for each task failed");
					}
				});
			}
			else{
				if(excludedTaskKeys.indexOf(taskKey)!=-1){
		    		 taskKey = null;
		    	}*/
				this.model.loadTaskSubObjectMessages(taskKey_2,taskKey_1,object,objectId,subObject,subObjectId,{
					success : function ( model, res ) {
						msgContent = res;
					},
					error: function (model,res){
						console.log("Fetching Document for each task failed");
					}
				});
			// }
			
			if(msgContent && msgContent.length == 0){
				return "";
			} else {
				var popOverMsgTemplate = _.template( messageForTaskPage )({msgDatas:msgContent});
				return popOverMsgTemplate;
			}
		},
	    showDocumentsForTask:function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			var self = this;
			var isVisible = $(evt.currentTarget).data('show');

			if(isVisible == true){
				var msgContent =""; 
					/*if($(evt.currentTarget).data('object')){
						msgContent=self.getDocumentsForTask( $(evt.currentTarget).data('doc'),$(evt.currentTarget).data('taskkey'),$(evt.currentTarget).data('object'),$(evt.currentTarget).data('objectid') );
					}
					else{*/
						msgContent=self.getDocumentsForTask($(evt.currentTarget).data('taskkey_2'),$(evt.currentTarget).data('taskkey_1'), $(evt.currentTarget).data('object'),$(evt.currentTarget).data('objectid'),$(evt.currentTarget).data('subobject'),$(evt.currentTarget).data('subobjectid') );
					// }
				
				var els = $(".tooTip-shown");
				_.each(els,function(el){
					$(el).removeClass("tooTip-shown");
					$(el).popover("hide");
					$(el).data('show',true);
				});

				$(evt.currentTarget).addClass("tooTip-shown");
				$(evt.currentTarget).data('show',false);
				
				var hasContent = false;
				if(msgContent.length>0){
					hasContent = true;
				}
				if(hasContent){
					$(evt.currentTarget).attr("data-content",msgContent);
				}
				else{
					$(evt.currentTarget).attr("data-content",_.template('<span id="tooltipAddDocument"></span><span>Documents not uploaded</span>')());
				}
				$(evt.currentTarget).popover("show");
				self.trigger('Document-Tooltip-shown',{'evt':evt,'hasContent':hasContent});
			} else {
				$(evt.currentTarget).popover("hide");
				$(evt.currentTarget).data('show',true);
				$(evt.currentTarget).removeClass("tooTip-shown");
			}
		},
		getDocumentsForTask:function(taskKey_2,taskKey_1,object,objectId,subObject,subObjectId) {
			/*var taskKey = taskKey || this.currentTaskKey;
			if(taskKey == "INSURANCE_APPLICATION_SIGNATURE"){
	    		 taskKey = "INSURANCE_APPLICATION";
	    	 }
	    	 var object = object || this.currentObject;
	    	 var objectId = objectId || this.currentObjectId;
	    	 var subTask = subTask || this.currentSubTask;*/
	    	 var docsContent;
	    	 taskKey_1 = taskKey_1 || null;
	    	 taskKey_2 = taskKey_2 || null;
	    	 subObject = subObject || null;
	    	 subObjectId = subObjectId || null;

			/*if(!subObject){
				this.model.loadEachTaskDocument(taskKey,object,objectId,subTask,{
					success : function ( model, res ) {
						docsContent = res;
					},
					error: function (model,res){
						console.log("Fetching Document for each task failed");
					}
				});
			}
			else{*/
				this.model.loadTaskSubObjectDocuments(taskKey_2,taskKey_1,object,objectId,subObject,subObjectId,{
					success : function ( model, res ) {
						docsContent = res;
					},
					error: function (model,res){
						console.log("Fetching Document for each task failed");
					}
				});
			// }
			
			
			if(docsContent && docsContent.length == 0){
				return "";
			} else {
				var popOverDocTemplate = _.template( documentForTaskPage )({documentDatas:docsContent});
				return popOverDocTemplate;
			}
		},
		closePopover:function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			if($(evt.currentTarget).data("item") === "msg") {
				$(evt.currentTarget).parent().parent().parent().find(".showMessageTooltip_2").popover("hide");
				$(evt.currentTarget).parent().parent().parent().find(".showMessageTooltip_2").data('show',true);
				$(evt.currentTarget).parent().parent().parent().find(".showMessageTooltip_2").removeClass("tooTip-shown");
			} else {
				$(evt.currentTarget).parent().parent().parent().parent().parent().parent().parent().find(".showDocumentTooltip_2").popover("hide");
				$(evt.currentTarget).parent().parent().parent().parent().parent().parent().parent().find(".showDocumentTooltip_2").data('show',true); 
				$(evt.currentTarget).parent().parent().parent().parent().parent().parent().parent().find(".showDocumentTooltip_2").removeClass("tooTip-shown");
			}
		},
		rearrangeMessageTooltip:function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			if(evt.currentTarget.nextElementSibling && evt.currentTarget.nextElementSibling.firstChild){
				evt.currentTarget.nextElementSibling.firstChild.style.display = 'none';
			}
		},
		showMoreContent : function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$(evt.currentTarget).closest('td').find(".showLessContent").hide();
			$(evt.currentTarget).closest('td').find(".showMoreContent").show();
		},
		showLessContent : function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$(evt.currentTarget).closest('td').find(".showMoreContent").hide();
			$(evt.currentTarget).closest('td').find(".showLessContent").show();
		},
		initializeTooltipEffects:function(){
			$('.showMessageTooltip_2').popover({ 
				trigger: 'manual',
				'placement': 'right',
				hide: function() {
					$(this).animate({marginLeft: -200}, function() {
						$(this).css({marginLeft: ''});
					});
				},
				show: function () {
					$(this).fadeIn(500);
				}
			});
			$('.showDocumentTooltip_2').popover({ 
				trigger: 'manual',
				'placement': 'right',
				hide: function() {
					$(this).animate({marginLeft: -10}, function() {
						$(this).css({marginLeft: ''});
					});
				},
				show: function () {
					$(this).fadeIn(200);
				}
			});
		},
		bsModalHide:function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			$('.showMessageTooltip_2').popover("hide");
			$('.showMessageTooltip_2').data('show',true);
			$('.showMessageTooltip_2').removeClass("tooTip-shown");
			$('.showDocumentTooltip_2').popover("hide");
			$('.showDocumentTooltip_2').data('show',true);
			$('.showDocumentTooltip_2').removeClass("tooTip-shown");
		}
		/*initializeTooltipPopup:function(popupId) {
			this.initializeTooltipEffects();

			if(this.getMessagesForTask() == "") {
				$('#'+popupId).find('.showMessageTooltip').hide();
			} else {
				$('#'+popupId).find('.showMessageTooltip').show();
			}
			if(this.getDocumentsForTask() == "") {
				$('#'+popupId).find('.showDocumentTooltip').hide();
			} else {
				$('#'+popupId).find('.showDocumentTooltip').show();
			}
		}*/

	 });
	 return DocumentTooltipView;
});
