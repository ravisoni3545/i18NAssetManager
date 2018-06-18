define(["backbone","app","text!templates/sendEmail.html","text!templates/sendToList.html","text!templates/emailTemplateList.html",
		"components-dropdowns","components-pickers","ckeditor"],
		function(Backbone,app,emailPage,sendToNames,emailTemplates){
	var EmailView=Backbone.View.extend({
		initialize: function(){
		 	// this.render();
		},
		 events : {
			 "click a[name='emailDocument']":"showAddMessageModal",
		     "change #emailMessageTemplateID":"getTemplate",
		     "click #mail_add_cc":"ShowCcDropdown",
		     "click #mail_add_bcc":"ShowBccDropdown",
		     "click #showEmailPreview" : "ShowEmailPreview",
		     "click #sendDocEmail":"sendEmail"
       },
		self:this,
		el:"#maincontainer",
		sendToList:{},
		select2_ary : [],
		render : function () {
			console.log("reached emailView");
			var thisPtr = this;
			
			var sendEmailEl =  $("#emailDoc-form1");	
	 		if(!sendEmailEl.length){
	    	 	thisPtr.template = _.template(emailPage);
				this.$el.append(this.template());
				
				this.emailFormValidation();
			
				$('#emailForm #mailSubject').val('');
				
	//		     CKEDITOR.instances.editorTextArea.setData("");
			     $('.select2-container').select2('val', '');
			     $('#emailForm').find('.form-group').removeClass('has-error');
			     $('#emailForm').find('.help-block').remove();
				 $("#mail_add_cc").show();
				 $("#mail_add_bcc").show();
				 $("#cc_container").hide();
				 $("#bcc_container").hide();
    	 	}

			return this;
		},
		showAddMessageModal:function(evt){
			this.render();
			this.docIdToBeMailed = $(evt.currentTarget).attr('documentId');
			this.object = $(evt.currentTarget).attr('object');
			this.objectId = $(evt.currentTarget).attr('objectid');
			var thisPtr = this;
			$('#emailformFailure > text').html("");
			$('#emailForm #mailSubject').val('');
			_($("#emailForm .form-group")).each(function(error){
				$(error).removeClass('has-error');
			});
			_($("#emailForm .help-block")).each(function(error){
				$(error).remove();
			});
			
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
			
			if(this.object != 'Property')
			this.fetchSendToList();
			else
				$(".emailTemplateDiv").hide();
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
			
		    CKEDITOR.instances.editorTextArea.setData("");
		    $('.select2-container').select2('val', '');
		    $('#emailForm').find('.form-group').removeClass('has-error');
		    $('#emailForm').find('.help-block').remove();

			$('#emailDoc-form1').modal('show');	
			$("#mail_add_cc").show();
			$("#mail_add_bcc").show();
			$("#cc_container").hide();
			$("#bcc_container").hide();

		},
		sendEmail:function(){
	    	 	var self=this;
	    	 	var obj={};
	    	 	var objectId=this.objectId;
	    	 	var object=this.object;
	    	 	this.CKupdate();
	    	 	
	    	 	 obj['documentId'] = self.docIdToBeMailed;
		         obj['messageType'] = "email";

	    		if($('#emailForm').validate().form()){
	    			$.blockUI({
			     		baseZ: 999999,
			     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			     	});

	    			$('#emailForm').ajaxSubmit({
		                url: app.context()+'messages/createMessage/'+objectId+'/'+object,
		                contentType: 'application/json',
		                async:true,
		                dataType:'text',
		                type: 'POST',
		                data: obj,
		                success: function(res){
		                	$.unblockUI();
		                	
	                		$("#emailDoc-form1").modal('hide');
		                	$('#emailDoc-form1').on('hidden.bs.modal',function() {
		                		var editor = CKEDITOR.instances.editorTextArea;
		            			// console.log($('#editorTextArea'));
	            			    if (editor) {
	            			        editor.destroy(true); 
	            			    }
	 						});
		                	
		                },
		                error: function(res){
		                	$.unblockUI();
		                	$('#emailformFailure').show();
		                	$('#emailformFailure > text').html("Error in sending the mail");
	    					App.scrollTo($('#emailformFailure'), -200);
	    					$('#emailformFailure').delay(2000).fadeOut(2000);
		                }
		            });
	     		}
	     },
	     CKupdate:function(){
	    	 CKEDITOR.instances.editorTextArea.updateElement();
//		    	 for (instance in CKEDITOR.instances) {
//	             CKEDITOR.instances[instance].updateElement();
//		    	 }
	     },
	     emailFormValidation:function(){
	    	 var thisPtr = this;
    	  	 var form1 = $('#emailForm');
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
//	                     success1.hide();
//	                     error1.show();
//	                     App.scrollTo(error1, -200);
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
	     ShowCcDropdown : function() {
	    	$("#cc_container").show();
 			$("#add_cc").hide();
 			if($("#bcc_container").is(":visible") === true){
 				$("#hideCcLabel").hide();
 			}
	     },
	     ShowBccDropdown : function() {
    		$("#bcc_container").show();
			$("#add_bcc").hide();
			if($("#cc_container").is(":visible") === true){
				$("#hideCcLabel").hide();
			}
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
				
				var investors = [];
				_(codes.investor).each(function(investor){
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
	    	 var object=this.object;

	    	 var thisPtr=this;
				var allcodesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+'messages/templateList/'+object,
					async : false
				});

				if(this.object != 'Property')
					$("#mailTemplateDD").html(_.template( emailTemplates )({elementId:"emailMessageTemplateID",codes:JSON.parse(allcodesResponseObject.responseText)}));
	     },
	     getTemplate:function(){
	    	 var messageTemplateID = $('#emailMessageTemplateID').val();
	    	 var objectId = this.objectId;
	    	 var object=this.object;
	    	 if(messageTemplateID!=""){
		    	 $.ajax({
		    		  type: "GET",
		    		  url: "messages/getEmailTemplate/"+messageTemplateID+'/'+objectId+'/'+object,
		    		  async : false,
		    		  success: function(res){
	//		    		    CKEDITOR.instances['editorTextArea'].setData(msg);
		    			$('#mailSubject').val(res.subject);
		    		    CKEDITOR.instances.editorTextArea.setData(res.fileContent);
		    		  },
		    		  error:function(){
		    			 $('#emailformFailure').show();
		                 $('#emailformFailure > text').html("Error in fetching email template");
	  					 App.scrollTo($('#emailformFailure'), -200);
		    		  }
		    	});
	    	 }else{
	    		 $('#mailSubject').val("");
	    		 CKEDITOR.instances.editorTextArea.setData("");
	    	 }
	    	 
	     },
	     ShowEmailPreview : function() {
	    	 var mailToRecipients = $("#mailToRecipients").val();
	    	 var mailCcRecipients = $("#mailCcRecipients").val();
	    	 var mailBccRecipients = $("#mailBccRecipients").val();
	    	 if(mailToRecipients== undefined || mailToRecipients==""){
	    	 		$('#emailformFailure > text').html("Please enter recipients.");
	    			$('#emailformFailure').show();
	    			$('.modal').animate({ scrollTop: 0 }, 'slow');
					$('#emailformFailure').delay(3000).fadeOut(3000);
					return;
	    	 }
	    	 CKEDITOR.instances.editorTextArea.updateElement();
	    	 if($('#emailForm').validate().form()){
		    	 $('#formEmailPreview').modal("show");
		    	 $("#toRecipients").html(mailToRecipients);
		    	 if(mailCcRecipients!= undefined && mailCcRecipients!=""){
		    		 $('#cc').show();
		    		 $("#ccRecipients").html(mailCcRecipients);
		    		 console.log("mailCcRecipients :::"+mailCcRecipients);
		    	 }
		    	 if(mailBccRecipients!= undefined && mailBccRecipients!=""){
		    		 $('#bcc').show();
		    		 $("#bccRecipients").html(mailBccRecipients);
		    		 console.log("mailBccRecipients :::"+mailBccRecipients);
		    	 }
		    	 var subject = $("#mailSubject").val();
		    	 $("#formEmailPreview #subject").html(subject);
		    	 var editorTextArea = $("#editorTextArea").val();
		    	 $("#emailPreview").html(editorTextArea);
	    	 }
	     },
	     validatemail : function(email) { 
			    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			    return re.test(email);
		 }
		 		 
	});
	return EmailView;
});
