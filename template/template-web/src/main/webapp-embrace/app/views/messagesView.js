define(["backbone","app","text!templates/messages.html","text!templates/sendToList.html","text!templates/emailTemplateList.html",
		"components-dropdowns","components-pickers","ckeditor","jquery.blockui.min"],
		function(Backbone,app,messagesPage,sendToNames,emailTemplates){
	var MessagesView=Backbone.View.extend({
		initialize: function(){
			
		},
		 events : {
			 "click .saveMessageButton":"addMessage",
			 "click a[name='deleteMessage']":"showDeleteMessageModal",
		     "click #deleteMessageConfirmationButton":"deleteMessage",
		     "click #showAddMessageModal":"showAddMessageModal",
		     'hidden.bs.modal #message-form1': 'hideAddMessageModal',
		     "click .radio-list input[name='messageType']":'showToDropdown',
		     "change #messageTemplateID":"getTemplate",
		     "change #assetUnitSelect":"getTemplate",
		     "click #sendMail":"addMessage",
		     "click #add_cc":"ShowCcDropdown",
		     "click #add_bcc":"ShowBccDropdown",
		     "click .showMore" : "showMoreContent",
		     "click .showLess" : "showLessContent",
		     "click #showPreview" : "ShowEmailPreview",
		     "change input[name=messagesTabStatus]":"showMessagesbystatus",
		    // "click #showMessagesStatus":"showMessagesbystatus",
		    /* "click a[name='unifiedMessages']": "displayUnifiedMessagesSection",*/
		     "click a[name='umsg-search-btn']": "displayUnifiedMessagesTable",
		     "click .showCompleteMsg": "displayCompleteMsg",
		     "click .showSmallerMsg": "displaySmallerMsg",
		     "click #unifiedMessagesToExcel": "downloadUnifiedMessages",
		     "change #umsg-property-list": "addChangeHandlers",
		     "change #umsg-area-list": "addChangeHandlers", 
		     "change #umsg-type-list": "addChangeHandlers",
		     "click #umsg-sort-property": "sortByProperty",
		     "click #umsg-sort-added-on": "sortByDateTime"
       },
		self:this,
		el:"#messagesTab",
		propertyModel:{},
		messageIdToBeDeleted:{},
		sendToList:{},
		select2_ary : [],
		messageDataTable :{},
		messageStatus:"",
		messageTypeSelected: "comments",
		render : function () {
			var thisPtr = this;
			thisPtr.isAsset = false;
			var units = [];
			thisPtr.messageStatus="comments";
			console.log("thisPtr.propertyModel.attributes.investmentID: " + thisPtr.investmentId);
			if(thisPtr.propertyModel.object === "Asset")
			{
				thisPtr.investmentId = thisPtr.propertyModel.attributes.investmentID;
				console.log("AssetType");
				thisPtr.isAsset = true;
			}
			thisPtr.template = _.template(messagesPage);
			thisPtr.$el.html("");
			var templateData=thisPtr.collection.toJSON();
			if(thisPtr.propertyModel.object == "Investor" || thisPtr.propertyModel.object == "Opportunity" 
				|| thisPtr.propertyModel.object == "Investment" || thisPtr.propertyModel.object == "Asset"
				|| thisPtr.propertyModel.object == "Marketing" || thisPtr.propertyModel.object == "Rehab"){
				thisPtr.initializeMessagesTab();
			}
			if(!thisPtr.isAsset)
				this.$el.html(this.template({templateData:templateData,object:thisPtr.propertyModel.object,objectId:thisPtr.propertyModel.objectId}));
			else{
				$.ajax({
                url: app.context() + '/propertyUnits/fetch/' + thisPtr.investmentId ,
                contentType: 'application/json',
                async:false,
                type: 'GET',
                success: function(res){
                	console.log("success in fetching property Units for asset messages");
                	units = res.propertyUnits;
                },
                error: function(res){
					console.log("error in getting property units for asset messages");	
		        }
            });
				this.$el.html(this.template({units:units,templateData:templateData,object:thisPtr.propertyModel.object,objectId:thisPtr.propertyModel.objectId}));

			}

			$('#messagesTable').on( 'draw.dt', function () {
			    thisPtr.trigger('MessagesTableDrawn');
			});

			var msgDataTable = $('#messagesTable').DataTable( {
		          "scrollY": "100%",
		          "paging": true,  
		          "info": false,  
		          "searching": true,
		          "autoWidth": false,
		          "columnDefs": [
		              { "width": "15%", "targets": [ 0 ], "orderable": true },
		              { "width": "53%", "targets": [ 1 ], "orderable": true },
		              { "width": "10%", "targets": [ 2 ], "orderable": true },
		              { "width": "15%", "targets": [ 3 ], "orderable": true },
		              { "width": "7%", "targets": [ 4 ], "orderable": false }
		          ],
		          "order": []
		      } );
			$('#messagesTable_wrapper .dataTables_scrollBody').css({"overflow":"visible","width":"100%"});
			$("#messagesTable_wrapper .dataTables_scrollHead table").css("margin-top","0px");
			$("#messagesTable_wrapper .dataTables_scrollBody table").css("margin-top","-1px");
            $('select[name=messagesTable_length]').addClass('form-control');

			$("#messagesTable_filter").hide();
			thisPtr.messageDataTable=msgDataTable;
			this.applyPermissions();
			this.messageFormValidation();
			$("#common-type-list").val("Comment");
			if(thisPtr.propertyModel.object == "Investor" || thisPtr.propertyModel.object == "Opportunity" 
				|| thisPtr.propertyModel.object == "Investment" || thisPtr.propertyModel.object == "Asset"
				|| thisPtr.propertyModel.object == "Marketing" || thisPtr.propertyModel.object == "Rehab"){
				thisPtr.displayInitialMessagesByStatus("Comment");
			} else {
				this.showMessagesbystatus();
			}

            $('.hopNameTooltip').tooltip({
                animated: 'fade',
                placement: 'left'
            });

            $(window).on('resize', function () {
				thisPtr.messageDataTable.columns.adjust().draw('page');
				// thisPtr.messageDataTable.fnAdjustColumnSizing();
			});
			
			return this;
		},
		initializeMessagesTab: function(){
			var self = this;
			$.blockUI({
	     		baseZ: 999999,
	     		message: '<div><img id="myBlockUI" src="assets/img/loading.gif" /> Just a moment...</div>'
			});
       		$.ajax({
	    		  type: "GET",
	    		  url: "messages/unified/"+self.propertyModel.objectId+'/'+self.propertyModel.object,
	    		  async : true,
	    		  success: function(res){
	    		    $.unblockUI();
	    		  	$("#umsg-investor-id").html("");
	    		  	$("#umsg-investor-id").append('<a data-id="'+ res.investors[0].id +'" href="#investorProfile/'+res.investors[0].id+'">'+res.investors[0].name+'</a>');
	    		  	self.appendOptionsUsingObject(res.properties, "umsg-property-list");
	    		  	self.appendOptionsUsingObject(res.area, "umsg-area-list");
	    		  	//self.appendOptionsUsingObject(res.msgType, "common-type-list");
	    		  	// uncomment if business requires to display Added By User filter during search
	    		  	// self.appendOptionsUsingObject(res.addedByUsers, "umsg-added-by-list");
	    		  	$("#umsg-area-list").val(self.propertyModel.object);
    		  		$("#umsg-type-list").val("Comment");
    		  		if(self.propertyModel.object == "Investment" || self.propertyModel.object == "Asset" 
    		  				|| self.propertyModel.object == "Marketing" || self.propertyModel.object == "Rehab"){
    		  			$("#umsg-property-list").val(self.propertyModel.propertyId);
    		  		}
	    		  },
	    		  error:function(res){
	    		  	$.unblockUI();
	    		  	$("#unifiedMsgErrorText").html("Error occurred while getting search parameters");
	    		  	$("#unifiedMsgError").show();
	    		  }
		    });
		},
		showDeleteMessageModal:function(evt){
			this.messageIdToBeDeleted=$(evt.currentTarget).attr('messageId');
			$('#formMessagedelete').modal("show");
		},
		deleteMessage:function(){
			var self=this;
			 $.ajax({
	                url: app.context()+'messages/deleteMessage/'+this.messageIdToBeDeleted,
	                contentType: 'application/json',
	                dataType:'text',
	                type: 'DELETE',
	                success: function(res){
	                	$("#formMessagedelete").modal('hide');
	                	$('#formMessagedelete').on('hidden.bs.modal',function() {
							self.fetchMessages();
						});
	                },
	                error: function(res){
	                   $("#formMessagedelete").modal('hide');
	                   $('#msgFailure').show();
	                   $('#msgFailure > text').html("Error in deleting the message");
    				   App.scrollTo($('#msgFailure'), -200);
    				   $('#msgFailure').delay(2000).fadeOut(2000);
	                   
	                }
	            });
		},
		showAddMessageModal:function(){
			$.blockUI({
 	     		baseZ: 999999,
 	     		message: '<div><img id="myBlockUI" src="assets/img/loading.gif" /> Just a moment...</div>'
 			});
			var thisPtr = this;
			$("#messageForm")[0].reset();
			_($("#messageForm .form-group")).each(function(error){
				$(error).removeClass('has-error');
			});
			_($("#messageForm .help-block")).each(function(error){
				$(error).remove();
			});
			
			$('#msgformFailure > text').html("");
			
			try {
				var editor = CKEDITOR.instances.editorTextArea;
				console.log($('#editorTextArea'));
			    if (editor) {
			        editor.destroy(true); 
			    }
			} catch(err) {
                console.log("Error in loading editor : err = " + err);
            }
			CKEDITOR.replace('editorTextArea');
				
			this.fetchSendToList();
			this.fetchTemplateList();
			
			$('.sendToNamesDropDown').select2({
				createSearchChoice:function(term, data) { 
					if(thisPtr.validatemail(term)){
				        if ($(data).filter(function() { 
				            return this.text.localeCompare(term)===0; 
				        }).length===0) 
				        	{return {id:term, text:term};} 
					}
			    },
				multiple: true,
			    data: thisPtr.select2_ary
			});

			$('#message-form1').modal('show');	

			//Document upload Changes
			app.documentUploadView.initializeFileUpload($('#message-form1'),$('#message-form1 #showPreview'));

			$(".tomultipledrop").hide();
	   		$(".emailTemplateDiv").hide();
	   		$(".uploadDocDiv").hide();
	   		$(".saveMessageButton").show();
	   		$('#msgformFailure').hide();
	   		$('#unitIdDropdownDiv').hide();
	   		$.unblockUI();
		},
		hideAddMessageModal:function(evt){
			app.documentUploadView.fileUploadDeleteAll($(evt.currentTarget).find("form"));
		},
		addMessage:function(){
	    	 	var self=this;
	    	 	var obj={};
	    	 	var objectId=this.propertyModel.objectId;
	    	 	var object=this.propertyModel.object;
	    	 	var form1 = $('#messageForm');
	    	 	var formId = $(form1).data("formid");
	    	 	this.CKupdate();
	    	 	var mailDocument = form1.find('input[name=document]');
	            if(mailDocument && mailDocument.val() == "") {
	            	mailDocument.prop("disabled", true);
	            }
	            var messageType=form1.find('input[name=messageType]:checked').val();
	            var messageTemplateID = $("#messageTemplateID option:selected").val();

	    	    // var unindexed_array = $('#messageForm').serializeArray();
	    	    obj['formId'] = formId;
	    	   /* $.map(unindexed_array, function(n, i){
	    	    	var value=n['value'];
	    	    	var name=n['name'];
	    	    	obj[name]=value;
	    	    });*/

	    		if($('#messageForm').validate().form()){
	    			$.blockUI({
			     		baseZ: 999999,
			     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			     	});

	    	    	var form = $('#messageForm');
	    	    	form.attr("enctype","multipart/form-data");
	    	    	form.ajaxSubmit({
		                url: app.context()+'messages/createMessage/'+objectId+'/'+object,
		                contentType: 'application/json',
		                async:true,
		                dataType:'text',
		                type: 'POST',
		                data: obj,
		                success: function(res){
		                	$.unblockUI();
	                		$("#message-form1").modal('hide');
		                	$('#message-form1').on('hidden.bs.modal',function() {
		                		var editor = CKEDITOR.instances.editorTextArea;
		            			// console.log($('#editorTextArea'));
	            			    if (editor) {
	            			        editor.destroy(true); 
	            			    }
	 							self.fetchMessages();
	 						});
		                },
		                error: function(res){
		                	$.unblockUI();
		                	$('#msgformFailure').show();
		                	$('#msgformFailure > text').html(JSON.parse(res.responseText).message);
	    					App.scrollTo($('#msgformFailure'), -200);
	    					$('#msgformFailure').delay(2000).fadeOut(2000);
	    					self.enableFileUpload();
		                }
		            });
	     		}
	     },
	     CKupdate:function(){
	    	 CKEDITOR.instances.editorTextArea.updateElement();
//	    	 for (instance in CKEDITOR.instances) {
//             CKEDITOR.instances[instance].updateElement();
//	    	 }
	     },
	     messageFormValidation:function(){
	    	 var thisPtr = this;
    	  	 var form1 = $('#messageForm');
             var error1 = $('.alert-danger', form1);
             var success1 = $('.alert-success', form1);
             form1.validate({
            	 errorElement: 'span', //default input error message container
                 errorClass: 'help-block', // default input error message class
                 focusInvalid: false, // do not focus the last invalid input
                 ignore: "",
                 rules: {
                	 subject:{
                		 required: true,
                		 minlength: 2
                	 },
                	 editorTextArea:{
                		 required: true
                	 }
                 },
                 invalidHandler: function (event, validator) { //display error alert on form submit              
//                     success1.hide();
//                     error1.show();
//                     App.scrollTo(error1, -200);
                 },

                 highlight: function (element) { // hightlight error inputs
                     $(element)
                         .closest('.form-group').addClass('has-error'); // set error class to the control group
                     thisPtr.enableFileUpload();
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
	     fetchMessages : function(){
    	 	var thisPtr=this;
       		thisPtr.collection.fetch({
       			
                success: function (res) {
                	thisPtr.render();
                },
                error   : function () {
                	$('#msgFailure').show();
                	thisPtr.enableFileUpload();
                }
            });
        },
        applyPermissions : function() {
	    	var thisPtr=this;
	    	if(thisPtr.propertyModel.object=='Asset' && $.inArray('AssetManagement', app.sessionModel.attributes.permissions)==-1){
		    		 $('#showAddMessageModal').remove();
		    		 $("a[name='deleteMessage']").remove();
		    		 $(".downloadMessageButton").remove();
			}
			else if(thisPtr.propertyModel.object=='Investment' && $.inArray('ClosingManagement', app.sessionModel.attributes.permissions)==-1){
				$('#showAddMessageModal').remove();
	    		 $("a[name='deleteMessage']").remove();
	    		 $(".downloadMessageButton").remove();
			}	else if(thisPtr.propertyModel.object=='Rehab' && $.inArray('RehabManagement', app.sessionModel.attributes.permissions)==-1){
				$('#showAddMessageModal').remove();
	    		 $("a[name='deleteMessage']").remove();
	    		 $(".downloadMessageButton").remove();
			}
	     },
	     showToDropdown: function(){
	    	 if($('[name=messageType]:checked').val()=="email"){
	    		 $('#messageForm').get(0).reset();
	    		 var $radios = $('input:radio[name=messageType]');
	    	     $radios.filter('[value=email]').prop('checked', true);
	    	     CKEDITOR.instances.editorTextArea.setData("");
	    	     $('.select2-container').select2('val', '');
	    	     $('#messageForm').find('.form-group').removeClass('has-error');
	    	     $('#messageForm').find('.help-block').remove();
	    		 $(".tomultipledrop").show();
	    		 $(".emailTemplateDiv").show();
	    		 $("#hideCcLabel").show();
	    		 $("#add_cc").show();
	    		 $("#add_bcc").show();
	    		 $("#cc_container_div").hide();
	    		 $("#bcc_container_div").hide();
	    		 $(".uploadDocDiv").show();
	    		 $(".saveMessageButton").hide();
	    		 $("#displayToInvestorDiv").hide();
	    		 $("#unitIdDropdownDiv").show();
	    	 }
	    	 else{
	    		 $('#messageForm').get(0).reset();
	    		 var $radios = $('input:radio[name=messageType]');
	    	     $radios.filter('[value=comment]').prop('checked', true);
	    	     CKEDITOR.instances.editorTextArea.setData("");
	    	     $('#messageForm').find('.form-group').removeClass('has-error');
	    	     $('#messageForm').find('.help-block').remove();
	    		 $(".emailTemplateDiv").hide();
	    		 $("#add_cc").hide();
	    		 $("#add_bcc").hide();
	    		 $("#hideCcLabel").hide();
	    		 $("#cc_container_div").hide();
	    		 $("#bcc_container_div").hide();
	    		$("#unitIdDropdownDiv").hide();

	    		 $(".tomultipledrop").hide();
	    		 $(".uploadDocDiv").hide();
	    		 $(".saveMessageButton").show();
	    		 $("#displayToInvestorDiv").show();
	    	 }
	     },
	     ShowCcDropdown : function() {
	    	$("#cc_container_div").show();
 			$("#add_cc").hide();
 			if($("#bcc_container_div").is(":visible") === true){
 				$("#hideCcLabel").hide();
 			}
	     },
	     ShowBccDropdown : function() {
    		$("#bcc_container_div").show();
			$("#add_bcc").hide();
			if($("#cc_container_div").is(":visible") === true){
				$("#hideCcLabel").hide();
			}
	     },
	     fetchSendToList:function(){
	    	 var self=this;
	    	 var objectId=this.propertyModel.objectId;
	    	 var object=this.propertyModel.object;

	    	 var thisPtr=this;
				var allcodesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+'messages/sendToList/'+object+'/'+objectId,
					async : false
				});
				var codes = JSON.parse(allcodesResponseObject.responseText);
				
				var investors = [];
				_(codes.investor).each(function(investor) {
					investors.push({id:investor.emailAddress,text:investor.name});
				});

				var embraceUsers = [];
				_(codes.embraceUsers).each(function(embraceUser) {
					embraceUsers.push({id:embraceUser.emailAddress,text:embraceUser.name});
				});
				
				var vendors = [];
				_(codes.vendors).each(function(vendor) {
					vendors.push({id:vendor.emailAddress,text:vendor.name});
				});
				this.select2_ary = [];
			    this.select2_ary.push(
			    	{
				        text: 'Investor',
				        children: investors
				    }, {
				        text: 'Embrace Internal Users',
				        children: embraceUsers
				    }, {
				        text: 'Vendors',
				        children: vendors
				    }
			    );
	    	 
	     },
	     
	     fetchTemplateList:function(){
	    	 var self=this;
	    	 var object=this.propertyModel.object;

	    	 var thisPtr=this;
				var allcodesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+'messages/templateList/'+object,
					async : false
				});

				$("#emailTemplateDD").html(_.template( emailTemplates )({elementId:null,codes:JSON.parse(allcodesResponseObject.responseText)}));
	     },
	     getTemplate:function(){
	    	 var messageTemplateID = $('#messageTemplateID').val();
	    	 var objectId = this.propertyModel.objectId;
	    	 var object=this.propertyModel.object;
	    	 if(this.isAsset){
	    	 	var propertyUnit = $('#assetUnitSelect').val();
	    	 	console.log('propUnit: ' + propertyUnit);
	    	 	if(propertyUnit!=="" && propertyUnit !== undefined)
	    		 	var getUrl = "messages/getEmailTemplate/"+messageTemplateID+'/'+objectId+'/'+object + '/' + propertyUnit;
	    		else
	    			var getUrl = "messages/getEmailTemplate/"+messageTemplateID+'/'+objectId+'/'+object;

	    	 }
	    	 else
	    	 {
	    	 	var getUrl = "messages/getEmailTemplate/"+messageTemplateID+'/'+objectId+'/'+object;
	    	 }
	    	 if(messageTemplateID!=""){
		    	 $.ajax({
		    		  type: "GET",
		    		  url: getUrl,
		    		  async : false,
		    		  success: function(res){
	//	    		    CKEDITOR.instances['editorTextArea'].setData(msg);
		    			$('#mailSubject').val(res.subject);
		    		    CKEDITOR.instances.editorTextArea.setData(res.fileContent);
		    		  },
		    		  error:function(){
		    			 $('#msgformFailure').show();
		                 $('#msgformFailure > text').html("Error in fetching email template");
	  					 App.scrollTo($('#msgformFailure'), -200);
		    		  }
		    	});
	    	 }else{
	    		 $('#mailSubject').val("");
	    		 CKEDITOR.instances.editorTextArea.setData("");
	    	 }
	    	 
	     },
	     showMoreContent : function(evt){
	         $(evt.currentTarget).closest('td').find(".showLessContent").hide();
	         $(evt.currentTarget).closest('td').find(".showMoreContent").show();
	     },
	     showLessContent : function(evt){
	         $(evt.currentTarget).closest('td').find(".showMoreContent").hide();
	         $(evt.currentTarget).closest('td').find(".showLessContent").show();
	     },
	     ShowEmailPreview : function() {
	    	 var mailToRecipients = $("#mailToRecipients").val();
	    	 var mailCcRecipients = $("#mailCcRecipients").val();
	    	 var mailBccRecipients = $("#mailBccRecipients").val();
	    	 if(mailToRecipients== undefined || mailToRecipients==""){
	    	 		$('#msgformFailure > text').html("Please enter recipients.");
	    			$('#msgformFailure').show();
	    			$('.modal').animate({ scrollTop: 0 }, 'slow');
					$('#msgformFailure').delay(3000).fadeOut(3000);
					return;
	    	 }
	    	 CKEDITOR.instances.editorTextArea.updateElement();
	    	 if($('#messageForm').validate().form()){
		    	 $('#formMessagePreview').modal("show");
		    	 $("#toRecipients").html(mailToRecipients);
		    	 if(mailCcRecipients!= undefined && mailCcRecipients!=""){
		    		 $('#cc_div').show();
		    		 $("#ccRecipients").html(mailCcRecipients);
		    		 console.log("mailCcRecipients :::"+mailCcRecipients);
		    	 }
		    	 if(mailBccRecipients!= undefined && mailBccRecipients!=""){
		    		 $('#bcc_div').show();
		    		 $("#bccRecipients").html(mailBccRecipients);
		    		 console.log("mailBccRecipients :::"+mailBccRecipients);
		    	 }
		    	 var subject = $("#mailSubject").val();
		    	 $("#subject").html(subject);
		    	 var editorTextArea = $("#editorTextArea").val();
		    	 $("#emailPreview").html(editorTextArea);
	    	 }
	     },
	     validatemail : function(email) { 
			    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			    return re.test(email);
		 },
		 enableFileUpload: function(){
			 var mailDocument = $('#messageForm').find('input[name=document]');
	       	 mailDocument.prop("disabled", false);
		 },
		 // showMessagesbystatusNew: function(evt){
		 // 	var self = this;
		 // 	var curVal = $(evt.currentTarget).val();
		 // 	self.messageTypeSelected = curVal;
		 // 	if(curVal == "all"){
		 // 		self.displayUnifiedMessagesSection();
		 // 	}else{
		 // 		$("#common-type-list").val("Comment");
		 // 		self.showMessagesbystatus();
		 // 	}
		 // },
		 showMessagesbystatus :function(evt) {
		 	var self = this;
			var status ;
			if(self.propertyModel.object == "Investor" || self.propertyModel.object == "Opportunity"
				|| self.propertyModel.object == "Investment" || self.propertyModel.object == "Asset"
				|| self.propertyModel.object == "Marketing" || self.propertyModel.object == "Rehab") {
				$(".unified-msg-section").hide();
				$(".initialMsgView").show();
			}
			/*
		 	status = $("#common-type-list").val();
			if(status == "Comment"){
				status = "comments";
			} else if(status == "all") {
				status = "all";
			}
			self.messageStatus = status; */
			if(evt){
				status=$(evt.currentTarget).val();
			} else {
				status = self.messageStatus;
			}
			self.messageStatus = status;
			self.$el.find("#messagesTable").data("msgType",status);	
			// $(self.messageDataTable).data("msgType",status);	
			
			self.messageDataTable.draw();
			
			//deleting stray style elements;
			$('style').remove();
       	},
       	
       	displayUnifiedMessagesSection: function(evt){
       		var self = this;
       		$(".initialMsgView").hide();
       		$(".unified-msg-section").show();
       		$("#uni-msg-result").css("display","none");
       		$.blockUI({
	     		baseZ: 999999,
	     		message: '<div><img id="myBlockUI" src="assets/img/loading.gif" /> Just a moment...</div>'
			});
       		$.ajax({
	    		  type: "GET",
	    		  url: "messages/unified/"+self.propertyModel.objectId+'/'+self.propertyModel.object,
	    		  async : true,
	    		  success: function(res){
	    		    $.unblockUI();
	    		  	$("#umsg-investor-id").html("");
	    		  	$("#umsg-investor-id").append('<a data-id="'+ res.investors[0].id +'" href="#investorProfile/'+res.investors[0].id+'">'+res.investors[0].name+'</a>');
	    		  	self.appendOptionsUsingObject(res.properties, "umsg-property-list");
	    		  	self.appendOptionsUsingObject(res.area, "umsg-area-list");
	    		  	//self.appendOptionsUsingObject(res.msgType, "umsg-type-list");
	    		  	//self.appendOptionsUsingObject(res.addedByUsers, "umsg-added-by-list");
	    		  	self.displayUnifiedMessagesTable();
	    		  },
	    		  error:function(res){
	    		  	$.unblockUI();
	    		  	$("#unifiedMsgErrorText").html("Error occurred while getting search parameters");
	    		  	$("#unifiedMsgError").show();
	    		  }
		    });
       	},
       	addChangeHandlers: function(evt){
       		var self = this;
    		
    		if(self.propertyModel.object == $("#umsg-area-list").val() 
    			// && ($("#umsg-type-list").val() == "Comment" || $("#umsg-type-list").val() == "all")
    			&& (((self.propertyModel.object == "Investor" || self.propertyModel.object =="Opportunity") 
						&& $("#umsg-property-list").val() == "all")
					|| ((self.propertyModel.object == "Asset" || self.propertyModel.object =="Marketing" 
    						|| self.propertyModel.object == "Investment" || self.propertyModel.object =="Rehab") 
	    				&& $("#umsg-property-list").val() == self.propertyModel.propertyId))){
			// if(self.propertyModel.object == $("#umsg-area-list").val() 
			// 	&& ((self.propertyModel.object == "Investor" || self.propertyModel.object =="Opportunity") 
			// 		&& $("#umsg-property-list").val() == "all")
			// 	|| ( && ($("#umsg-property-list").val() == self.propertyModel.propertyId) ){
    			$(".unified-msg-section").hide();
    			$(".initialMsgView").show();
    			self.displayInitialMessagesByStatus($("#umsg-type-list").val());
    		} else {
    			$(".initialMsgView").hide();
       			$(".unified-msg-section").show();
    			self.displayUnifiedMessagesTable()
    		}
    		
       	},
       	
       	displayInitialMessagesByStatus: function(status){
       		var self = this;
   //     		if(status == "Comment"){
			// 	status = "comments";
			// } else if(status == "all") {
			// 	status = "all";
			// }
			// self.$el.find("#messagesTable").data("msgType",status);	
			
			// self.messageDataTable.draw();
			
			//deleting stray style elements;
			// $('style').remove();
			$("#messagesTable").find(".allRow").hide();
			$("#messagesTable").find(".noDataRow").hide();
			if($("#messagesTable").find("."+status.toLowerCase()+"Row").length){
				$("#messagesTable").find("."+status.toLowerCase()+"Row").show();
				self.messageDataTable.draw();
			} else if($("#messagesTable").find(".dataTables_empty").length == 0){
				//self.messageDataTable.draw();
				$("#messagesTable tbody").append('<tr class="noDataRow"><td colspan="5" style="text-align: center;">No data available in table</td></tr>');
			}
			
       	},
       	appendOptionsUsingObject: function(obj, listId){
       		var optForAll = '<option value="all">All</option>';
       		var opt = "";
       		for (var key in obj) {
			  if (obj.hasOwnProperty(key)) {
			    opt = opt + '<option value="'+key+'">'+obj[key]+'</option>';
			  }
			}
			$("#"+listId).html("");
			opt = optForAll + opt;
			$("#"+listId).append(opt);
       	},
       	
       	displayUnifiedMessagesTable: function(){
       		var self = this;
       		var investorId = $("#umsg-investor-id").find("a").data("id");
       		var propertyId = self.$el.find("#umsg-property-list").val();
       		var areaId = self.$el.find("#umsg-area-list").val();
       		var msgType = self.$el.find("#umsg-type-list").val();

       		/*var addedByUserId = self.$el.find("#umsg-added-by-list").val();*/
       		var addedByUserId = "all";

       		$.blockUI({
	     		baseZ: 999999,
	     		message: '<div><img id="myBlockUI" src="assets/img/loading.gif" /> Just a moment...</div>'
	     	});
       		$.ajax({
       			type: "GET",
       			async: true,
       			url: "messages/unified/"+ investorId +"/"+ propertyId +"/"+ areaId +"/"+ msgType +"/"+ addedByUserId,
       			success: function(res){
       				$.unblockUI();
				    var rows = "";
       				for(i=0; i<res.length; i++){
       					rows = rows + self.prepareUnifiedMsgRow(res[i]);
       				}
       				$("#unifiedMessagesTable").dataTable().fnDestroy();
       				self.resetSortingFor("umsg-sort-added-on");
	       			self.resetSortingFor("umsg-sort-property");
       				$("#unifiedMessagesTable tbody").html(rows);
       				$("#uni-msg-result").css("display","block");
		       		$("#unifiedMessagesTable").DataTable( {
				          "scrollY": "100%",
				          "paging": true,  
				          "info": true,  
				          "searching": true,
				          "autoWidth": true,
				          "destroy": true,
				          "columnDefs": [
				              { "width": "15%", "targets": [ 0 ], "orderable": true },
				              { "width": "85%", "targets": [ 1 ], "orderable": false }
				          ],
				          "order": [],
				          fnDrawCallback: function(){
				          	var table = $("#unifiedMessagesTable").DataTable();
				          	if(table.order()[0] && table.order()[0][0] == 0){
					          	self.resetSortingFor("umsg-sort-added-on");
	       						self.resetSortingFor("umsg-sort-property");
	       					}
				          }
				    });
				    $('#unifiedMessagesTable_wrapper .dataTables_scrollBody').css({"overflow":"visible","width":"100%"});
					$("#unifiedMessagesTable_wrapper .dataTables_scrollHead table").css("margin-top","0px");
					$("#unifiedMessagesTable_wrapper .dataTables_scrollBody table").css("margin-top","-1px");
				    $('select[name=unifiedMessagesTable_length]').addClass('form-control');
       			},
       			error: function(res){
       				$.unblockUI();
       				$("#unifiedMsgErrorText").html("Error occurred while getting messages for selected parameters");
       				$("#unifiedMsgError").show();
       			}
       		});
       	},
       	
       	prepareUnifiedMsgRow: function(data){
       	
       		var row = '<tr>';
       		var firstCol = '<td style="text-align: center;"><a href="#'+ data.areaUrl +'/'+ data.areaId +'">'+ data.area +'</a><br>';
			if(data.msgType == "E-mail"){
				firstCol = firstCol + '<i class="fa fa-envelope"></i>' + data.msgType +'</td>';
			} else if(data.msgType == "Alert") {
				firstCol = firstCol + '<i class="fa fa-exclamation"></i>' + data.msgType +'</td>';
			} else {
				firstCol = firstCol + '<i class="fa fa-comment"></i>' + data.msgType +'</td>';
			}
       		var secondCol = '<td><div class="row" style="margin-right: 0px;"><div class="col-md-6">' + 
       							data.addedByUserName + ' added on ' + data.addedOnDateTimeString + '</div>' + '<div class="col-md-6">';
       		if(data.propertyId){
       			secondCol = secondCol + '<i class="fa fa-home"></i><a href="#property/'+ data.propertyId +'">' + data.propertyAddress + '</a>';
       		}
 			secondCol = secondCol + '</div> </div> <div class="row" style="margin-top: 15px; margin-right: 0px;"> <strong style="margin-left: 15px;">Subject: </strong> ' +	data.msgSubject +
       					 '</div> <div class="row" style="margin-left: 0px; margin-right: 0px; margin-top: 5px;" id="unifiedMsgBody">';
       		if(data.msgBodyComplete){
				secondCol = secondCol + '<div class="smallerMsg">' + data.msgBody + '... <a class="showCompleteMsg" style="cursor: pointer">show more</a>' +
							 '</div> <div class="completeMsg" style="display:none;">' + data.msgBodyComplete + '... <a class="showSmallerMsg" style="cursor: pointer">show less</a></div>';       			
       		}else{
       			secondCol = secondCol + data.msgBody; 
       		}
       		secondCol = secondCol + '</div> </td>';
       		var propCol = '<td style="display:none;">'+ data.propertyAddress +'</td>';
       		var addedOnCol = '<td style="display:none;">'+ data.addedOnTime +'</td>';
       		row = row + firstCol + secondCol + propCol + addedOnCol + "</tr>";
       		return row;
       		
       	},
       	
       	displayCompleteMsg: function(evt){
       		$(evt.target).closest("td").find(".smallerMsg").hide();
       		$(evt.target).closest("td").find(".completeMsg").show();
       	},
       	
       	displaySmallerMsg: function(evt){
       		$(evt.target).closest("td").find(".completeMsg").hide();
       		$(evt.target).closest("td").find(".smallerMsg").show();
       	},
       	
       	downloadUnifiedMessages: function(){
       		var self = this;
       		var investorId = $("#umsg-investor-id").find("a").data("id");
       		var propertyId = self.$el.find("#umsg-property-list").val();
       		var areaId = self.$el.find("#umsg-area-list").val();
       		var msgType = self.$el.find("#umsg-type-list").val();

       		/*var addedByUserId = self.$el.find("#umsg-added-by-list").val();*/
       		var addedByUserId = "all";
       		
       		$("#unifiedMessagesToExcel")[0].href = "messages/downloadUnifiedMessages/" + investorId +"/"+ propertyId +"/"+ areaId +"/"+ msgType +"/"+ addedByUserId;

       },
       
       sortByProperty: function(evt){
       		var self = this;
       		evt.preventDefault();
       		self.resetSortingFor("umsg-sort-added-on");
       		self.resetSortingFor("umsg-sort-property");
       		var table = $("#unifiedMessagesTable").DataTable();
       		if(table.order()[0] && table.order()[0][0] == 2 && table.order()[0][1] == "asc"){
       			table.order([2, "desc"]).draw();
       			$("#umsg-sort-property").addClass("sorting_desc");
       		} else {
       			table.order([2, "asc"]).draw();
       			$("#umsg-sort-property").addClass("sorting_asc");
       		}
       },
       
       sortByDateTime: function(evt){
			var self = this;
       		evt.preventDefault();
       		self.resetSortingFor("umsg-sort-added-on");
       		self.resetSortingFor("umsg-sort-property");
       		var table = $("#unifiedMessagesTable").DataTable();
       		if(table.order()[0] && table.order()[0][0] == 3 && table.order()[0][1] == "asc"){
       			table.order([3, "desc"]).draw();
       			$("#umsg-sort-added-on").addClass("sorting_desc");
       		} else {
       			table.order([3, "asc"]).draw();
       			$("#umsg-sort-added-on").addClass("sorting_asc");
       		}
       },
       
       resetSortingFor: function(elem){
       		$("#"+elem).removeClass("sorting").removeClass("sorting_asc").removeClass("sorting_desc").addClass("sorting");
       }		
		 
	});
	return MessagesView;
});