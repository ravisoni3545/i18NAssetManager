define(["backbone",
	"app",
	"text!templates/envelopeStatus.html",
	"text!templates/docusignEnvelope.html"
	],
		function(Backbone, app, envStatusPage, docusignEnvelopeTemplate){
	
	var EnvelopeStatusModel = Backbone.Model.extend({
		defaults : {
			sortDir : "", sortName : "", pageNum : "", pageSize : ""
		}
	});
	
	var EnvelopeStatusView = Backbone.View.extend({
		initialize: function(){
			console.log("EnvelopeStatusView initialize");
			this.model = new EnvelopeStatusModel;
			$("button[name='refreshDocusign']").addClass("disabled");
		},
		events          : {
			"click a.showDocs"                     : "showSubDocs",
			"click a.showRecipients"               : "showSubRecipients",
			"click a.objectItem"                   : "showObjectItem",
			"click button[name='refreshDocusign']" : "refreshDocusignStatus",
			"click a[name='viewEnvelope']"         : "viewEnvelope",
			"click a[name='sendToNext']"           : "sendToNext",
			"click a[name='addRecipient']"         : "addRecipient",
			"click a[name='refreshEnvelope']"      : "refreshEnvelope",
			"click a[name='deleteEnvelope']"       : "deleteEnvelope",
			"click button.close"                   : "closeModal",
			'click .launchManagementConsole'       : 'launchDocusignManagementConsole',
			'click .updateEnvelopeInfoButton'      : 'manualUpdateStatus'
		},
		el:"#mainContainer",
		render : function(){
			var self = this;
			this.template = _.template( envStatusPage );
			this.$el.html("");			     	
			this.$el.html(this.template());
			this.showDataTable();
			this.enableDragResize();
			return this;
		},
		refreshDocusignStatus : function(evt) {
			var self=this;
			console.log("got to refreshDocusignStatus",evt);
			$("button[name='refreshDocusign']").toggleClass("disabled yellow blue");
			$.ajax({
				"url" : app.context()+ '/docusign/envelope/refreshAllEnvelopeStatus',
				"contentType" : "application/json",
				"type" : "GET"		    		
			}).done(function(res){
				console.log("Success in refreshing Docusign Status",res);
				self.oTable.fnDraw(false);
				$(evt.currentTarget).toggleClass("disabled yellow blue");
			}).error(function(res){
				console.log("Error from refresh of Docusign Status",res);
				$(evt.currentTarget).toggleClass("disabled yellow blue");
			});
		},
		refreshEnvelope : function(evt) {
			var self=this;
			console.log("got to refreshEnvelope",evt);
			
			if ($(evt.currentTarget).is("[disabled]")) {
		        event.preventDefault();
		    } else {
		    	var envelopeId = $(evt.currentTarget).attr('envelopeId');
		    	var theRow = $(evt.currentTarget).closest('tr')[0];
		    	var savedColor = $(evt.currentTarget).find("i").css("color");
		    	$(evt.currentTarget).find("i").css("color","orange");
				$(evt.currentTarget).attr('disabled','disabled');
				$.ajax({
					"url" : app.context()+ '/docusign/envelope/refreshEnvelopeStatus/' + envelopeId,
					"contentType" : "application/json",
					"type" : "GET"		    		
				}).done(function(res){
					console.log("Success in refreshing Envelope Status:",res);
					self.oTable.fnUpdate(res,theRow,3); // updated the status column
					$(evt.currentTarget).removeAttr("disabled");
					$(evt.currentTarget).find("i").css("color",savedColor);
				}).error(function(res){
					console.log("Error from refresh of Envelope Status",res);
					$(evt.currentTarget).removeAttr("disabled");
					$(evt.currentTarget).find("i").css("color",savedColor);
				});	
		    }
		},
		manualUpdateStatus : function (evt) {
			var self=this;
			console.log("got to manualUpdateStatus",evt);
			
			if ($(evt.currentTarget).is("[disabled]")) {
		        event.preventDefault();
		    } else {
		    	var envelopeId = $(evt.currentTarget).attr('data-envelopeid');
		    	var savedColor = $(evt.currentTarget).find("i").css("color");
		    	$(evt.currentTarget).find("i").css("color","orange");
				$(evt.currentTarget).attr('disabled','disabled');
				$.ajax({
					"url" : app.context()+ '/docusign/envelope/refreshEnvelopeStatus/' + envelopeId,
					"contentType" : "application/json",
					"type" : "GET"		    		
				}).done(function(res){
					console.log("Success in refreshing manualUpdateStatus:",res);
					if (res==null || res=="") {
						$(self.el).find('.envelopeErrorMessage').html(
							'<p class="text-center" style="color:red;" >Error retrieving status. Envelope may not exist, try the management console.</p>'
						);
					} else {
						var formData = {};
	                    formData.embraceEnvelopeId = self.embraceEnvelopeId;
	                    formData.envelopeStatus = res;
	                    var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
				     	$(self.el).find('.docusignEnvelopeArea').html("");
				     	$(self.el).find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:formData}));
					}
					$(evt.currentTarget).removeAttr("disabled");
					$(evt.currentTarget).find("i").css("color",savedColor);
				}).error(function(res){
					console.log("Error from refresh manualUpdateStatus",res);
					$(evt.currentTarget).removeAttr("disabled");
					$(evt.currentTarget).find("i").css("color",savedColor);
				});	
		    }
		},
		sendToNext : function(evt) {
			var self=this;
			console.log("got to sendToNext",evt);
			if ($(evt.currentTarget).is("[disabled]")) {
		        event.preventDefault();
		    } else {
		    	var envelopeId = $(evt.currentTarget).attr('envelopeId');
		    	var theRow = $(evt.currentTarget).closest('tr')[0];
		    	var savedColor = $(evt.currentTarget).find("i").css("color");
		    	$(evt.currentTarget).find("i").css("color","orange");
				$(evt.currentTarget).attr('disabled','disabled');
				$.ajax({
					"url" : app.context()+ '/docusign/envelope/sendForSignature/' + envelopeId,
					"contentType" : "application/json",
					"type" : "GET"		    		
				}).done(function(res){
					console.log("Success in getting send for next URL:",res);
					$(evt.currentTarget).removeAttr("disabled");
					$(evt.currentTarget).find("i").css("color",savedColor);
					/*
					var signConsole = $.colorbox({href: res,
	                	  iframe:true,fastIframe:false,title:'Docusign Send for Next Signature',closeButton:true,width:'100%',height:'100%',
	                	  escKey:false,overlayClose:false});
                    $('#cboxOverlay').css('z-index',99998);
                    $('#colorbox').css('z-index',99999);
                    */
                    
				}).error(function(res){
					console.log("Error in getting send for next URL:",res);
					$(evt.currentTarget).removeAttr("disabled");
					$(evt.currentTarget).find("i").css("color",savedColor);
				});	
		    }
		},
		addRecipient : function(evt) {
			var self=this;
			console.log("got to addRecipient",evt);
			
		},
		documentSub : function ( d ) {
			var subCode = "";
			if (d==null)
				subCode = '<tr><td>No documents Found for this envelope.</td></tr>';
			else
			_.each(d,function(el,indx,l){
				subCode+='<tr>'+
					'<td ><b>FileName:</b></td>'+
					'<td >'+el.fileName+'</td>'+
					'<td ><b>Document Type:</b></td>'+
					'<td >'+el.documentType+'</td>'+
					(el.description !=null ?
					'<td ><b>Description:</b></td>'+
					'<td >'+ el.description +'</td>' : '' ) +
					'<td ><b>Uploaded to eVault:</b></td>'+
					'<td >'+(el.vaultUpload == null ? "N" : el.vaultUpload)+'</td>'+
				'</tr>';
			});
			subCode = '<table class="table envDetailDocuments" border="0" style="padding-left:50px;">' + 
				subCode + '</table>' ;
			return subCode;
		},
		showSubDocs : function (evt) {
			console.log("showSubDocs",evt);
			var envId = evt.currentTarget.getAttribute("data-env");
			var self = this;
			var topper = document.body.scrollTop;
			$.ajax({
				"url" : app.context()+ '/docusign/envelope/getdocs/' + envId,
				"contentType" : "application/json",
				"type" : "GET"
			}).done(function(res){
				console.log("success with showSubDocs", res);
				var docSubHtml = "";
				docSubHtml= self.documentSub(res.aaData);
				var tr = $(evt.currentTarget).closest('tr')[0];
				console.log("the row",tr);
				self.handleSubDocRow(envId,tr,docSubHtml);
				if (topper>0) window.scrollTo(0,topper);
			}).error(function(res){
				console.log("error in showSubDocs",res);
				var docSubHtml = self.documentSub(res.aaData);
				var tr = $(evt.currentTarget).closest('tr')[0];
				console.log("the row for no documents found",tr);
				self.handleSubDocRow(envId,tr,docSubHtml);
				if (topper>0) window.scrollTo(0,topper);
			});
		},
		handleSubDocRow : function (envId,tr,docSubHtml) {
			if ( this.oTable.fnIsOpen(tr) ) {
				var existingRecipients = $('td.'+envId+'-details table.envDetailRecipients');
				var existingDocuments = $('td.'+envId+'-details table.envDetailDocuments');
				if (existingRecipients.length>0)
					if (existingDocuments.length>0)
						$('td.'+envId+'-details table.envDetailDocuments').remove();
					else $('td.'+envId+'-details').prepend(docSubHtml);
				// This row is already open - close it
				else this.oTable.fnClose(tr);
			}
			else 
				// Open this row
				this.oTable.fnOpen(tr,docSubHtml,envId+'-details');
		},
		recipientsSub : function ( d, cb ) {
			var self=this;
			_.each(d,function(el,indx,l){
				self.getRecipientName(el,cb);
			});
		},
		getRecipientName : function (rec,cb) {
			console.log("in getRecipientName",rec,cb);
			if (rec.recipientType.codeGroup=="USER_GROUP") {
				if (rec.recipientType.codeDisplay=="Investor")
					$.ajax({
						"url" : app.context()+ '/investorDetails/getInvestorDetails/' + rec.recipientId,
						"contentType" : "application/json",
						"type" : "GET"
					}).done(function(res){
						console.log("success in fetching investor name",res);
						rec.recipientName = res.investorName;
						return cb(rec);
					}).error(function(res){
						console.log("error in fetching investor name");
						rec.recipientName = "Name Not Found";
						return cb(rec);
					});
				else // must be embrace User
					$.ajax({
						"url" : app.context()+ '/user/profile/' + rec.recipientId,
						"contentType" : "application/json",
						"type" : "GET"
					}).done(function(res){
						console.log("success in fetching user name",res);
						rec.recipientName = (res.firstName!=null ? res.firstName : "") + 
							(res.lastName!=null ? (res.lastName!="" ? " " + res.lastName : "") : "");
						return cb(rec);
					}).error(function(res){
						console.log("error in fetching user name");
						rec.recipientName = "Name Not Found";
						return cb(rec);
					});
					
			} else {
				// must be embrace Contact
				$.ajax({
					"url" : app.context()+ '/contact/read/' + rec.recipientId,
					"contentType" : "application/json",
					"type" : "GET"
				}).done(function(res){
					console.log("success in fetching contact name",res);
					rec.recipientName = (res.firstName!=null ? res.firstName : "") + 
						(res.lastName!=null ? (res.lastName!="" ? " " + res.lastName : "") : "");
					return cb(rec);
				}).error(function(res){
					console.log("error in fetching contact name");
					rec.recipientName = "Name Not Found";
					return cb(rec);
				});
			}
			
		},
		showSubRecipients : function (evt) {
			console.log("showSubRecipients",evt);
			var envId = evt.currentTarget.getAttribute("data-env");
			var self = this;
			var topper = document.body.scrollTop;
			var cb = function (rec) {
				var subRowCode='<tr>'+
				'<td><b>Recipient:</b></td>'+
				'<td>'+rec.recipientName+'</td>'+
				'<td><b>Signed Date:</b></td>'+
						'<td>'+(rec.signedDate!=null ? new Date(rec.signedDate).toLocaleDateString() : 'not yet signed' ) + '</td>' +
				'<!--td><a href="#" class="resend-env" title="Resend"><i class="fa fa-fw fa-envelope font14"></i></a></td-->' +
				 '</tr>';
				console.log("in cb, rec is ",rec,
						$("td."+rec.docusignEnvelope.envelopeId+"-details table.envDetailRecipients"));
				$("td."+rec.docusignEnvelope.envelopeId+"-details table.envDetailRecipients").append(subRowCode);
			}
			$.ajax({
				"url" : app.context()+ '/docusign/envelope/getrecipients/' + envId,
				"contentType" : "application/json",
				"type" : "GET"
			}).done(function(res){
				console.log("success with showSubRecipients", res);
				var tr = $(evt.currentTarget).closest('tr')[0];
				console.log("the row",tr);
				if ( self.oTable.fnIsOpen(tr) ) {
					var existingDocuments = $('td.'+envId+'-details table.envDetailDocuments');
					var existingRecipients = $('td.'+envId+'-details table.envDetailRecipients');
					if (existingDocuments.length>0)
						if (existingRecipients.length>0)
							$('td.'+envId+'-details table.envDetailRecipients').remove();
						else {
							$('td.'+envId+'-details')
								.append('<table class="table envDetailRecipients" border="0" style="padding-left:50px;"></table>');
							self.recipientsSub(res.aaData,cb);
						}
					// This row is already open - close it
					else self.oTable.fnClose(tr);
				}
				else {
					// Open this row
					self.oTable.fnOpen(tr,
						'<table class="table envDetailRecipients" border="0" style="padding-left:50px;"></table>',
						envId+'-details');
					self.recipientsSub(res.aaData,cb);
					if (topper>0) window.scrollTo(0,topper);
				}
				if (topper>0) window.scrollTo(0,topper);
			}).error(function(res){
				console.log("error in showSubRecipients",res);
			});
		},
		viewEnvelope : function(evt) {
			$("#docusignEnvView").removeClass("fade").show();
			console.log("in viewEnvelope",$(evt.currentTarget));
			
			this.openViewEnvelope(evt);
			
		},
		closeModal : function (evt) {
			console.log("in closeModal",$(evt.currentTarget).closest(".modal"));
			$(evt.currentTarget).closest(".modal").addClass("fade").hide();
			$('div.docusignEnvelopeArea').html("");
			$("div.envelopeErrorMessage").html("");
		},
		openViewEnvelope : function(evt){
			var self=this;
			var button = $(evt.currentTarget);
			//var embraceEnvelopeId = button.data('envelopeid');
			var embraceEnvelopeId = button.attr('documentId');
			console.log("in openViewEnvelope",embraceEnvelopeId);
			this.embraceEnvelopeId = embraceEnvelopeId;
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Opening Envelope View... </div>'
			});
			$.ajax({
                url: app.context()+'/docusign/envelope/tagAndSendUrl/'+embraceEnvelopeId,
                type: 'GET',
                success: function(res){
                	$.unblockUI();
                    console.log('Tag and Send Url is ',res);
                    if(res=='locked'){
                    	var formData = {};
                        formData.embraceEnvelopeId = self.embraceEnvelopeId;
                        formData.envelopeStatus = res;
                        var docusignEnvelopePage = _.template( docusignEnvelopeTemplate );
    			     	$(self.el).find('.docusignEnvelopeArea').html("");
    			     	$(self.el).find('.docusignEnvelopeArea').html(docusignEnvelopePage({popupData:formData}));
                    } else {
	                    var tagSendBox = $.colorbox({href: res,
	                	  iframe:true,fastIframe:false,title:'Tag and Send Documents for Signature',closeButton:true,width:'100%',height:'100%',
	                	  escKey:false,overlayClose:false});
	                    $('#cboxOverlay').css('z-index',99998);
	                    $('#colorbox').css('z-index',99999);
	                    console.log(tagSendBox);
	                    //tagSendBox.onCleanup = self.showViewWarning();
	                    tagSendBox.onClosed = self.refreshEnvelopeStatus(evt);
	                    $("button.cboxClose").click(function(){self.refreshEnvelopeStatus()});
                    }
                },
                error: function(res){
                	$.unblockUI();
                	console.log('failed to get Tag and Send Url of envelope '+res);
                	$('.envelopeMessage').html('Failed to get Tag and Send URL');
                }
            });
		},
		showViewWarning : function(evt) {
			var self=this;
			alert('triggered');
			$('#optionCloseTagAndSend').modal('show');
			evt.preventDefault();
			evt.stopPropagation();
		},
		refreshEnvelopeStatus : function() {
			console.log("in refreshEnvelopeStatus",$("#docusignEnvView"));
			$("#docusignEnvView").addClass("fade").hide();
			$('div.docusignEnvelopeArea').html("");
			$("div.envelopeErrorMessage").html("");
		},
		launchDocusignManagementConsole : function(evt) {
			var self=this;
			var button = $(evt.currentTarget);
			var embraceEnvelopeId = button.data('envelopeid');
			this.embraceEnvelopeId = embraceEnvelopeId;
			
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Opening Docusign Management Console... </div>'
			});

			//$('.envelopeMessage').html('Creating Envelope..');
			$.ajax({
                url: app.context()+'/docusign/envelope/managementConsoleUrl',
                type: 'GET',
                success: function(res){
                	$.unblockUI();
                    console.log('Management Console Url is '+res);
                    var managementConsole = $.colorbox({href: res,
	                	  iframe:true,fastIframe:false,title:'Docusign Management Console - Manage -> Draft -> Complete & Send Previous Envelopes',closeButton:true,width:'100%',height:'100%',
	                	  escKey:false,overlayClose:false});
                    console.log("got here ", $('#cboxOverlay').length,$('#colorbox').length);
                    $('#cboxOverlay').css('z-index',99998);
                    $('#colorbox').css('z-index',99999);
                    
                    //console.log(managementConsole);
                    managementConsole.onCleanup = self.refreshDocusignStatus;
                    /*managementConsole.on('cbox_closed', function (e) {
                    	console.log(e);
						self.refreshEnvelopeStatus();
					});*/
                },
                error: function(res){
                	$.unblockUI();
                	console.log('failed to get Management Console Url of envelope '+res);
                	$('.envelopeMessage').html('Failed to get Management Console URL');
                }
            });
		},
		deleteEnvelope : function(evt) {
			console.log("in deleteEnvelope",evt);
			var self = this;
			var assocRefresh = $(evt.currentTarget).closest('td').find("a[name='refreshEnvelope']")[0];
			var params = {"envelopeId": $(evt.currentTarget).attr("documentid"), "reason" : "Testing"};
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Voiding the envelope... </div>'
			});
			$.ajax({
                url: app.context()+'/docusign/envelope/voidenvelope',
                data: JSON.stringify(params),
                contentType: "application/json",
                type: 'PUT'
			}).done(function(res){
				console.log("success in voiding envelope",res);
				$.unblockUI();
				if (res.indexOf("status: 4")>=0) {
					var emsg = "";
					var msgParts = res.split('"message": "');
					emsg = msgParts[1];
					emsg = emsg.substr(0,emsg.length-2);
					$("div.envelopeErrorMessage").html('<div class="alert alert-danger text-center" role="alert">' + emsg + '</div>');
					$("#docusignEnvView").removeClass("fade").show();
					console.log("void not performed:",emsg);
				} else {
					var newEvt = evt;
					newEvt.currentTarget = assocRefresh;
					self.refreshEnvelope(newEvt);
				}
			}).error(function(res){
				console.log("error in voiding envelope",res);
				$.unblockUI();
				$("div.envelopeErrorMessage").html('<div class="alert alert-danger text-center" role="alert">Error in voiding the envelope.</div>');
				$("#docusignEnvView").removeClass("fade").show();
			});
                
		},
		enableDragResize : function() {
			$("#docusignEnvView .modal-content").draggable();
			console.log("enableDragResize",$("#docusignEnvView"));

		},
		showDataTable : function(){
			var self = this;
			// ----------------------------DataTable
			// start-----------------------------------
			this.oTable = $('#envStatusTable').dataTable({
				"bServerSide" : false,
				"bProcessing" : true,
				"bFilter": true,
				//"scrollY" : "300px",
				"scrollX" : "100%",
				"sAjaxSource" : app.context()+ '/docusign/envelope/getstatus',
				"sAjaxData" : 'aaData',
				//"pagingType" : "simple",
				"aButtons": ["refresh"],
				"sServerMethod":"GET",
				"oLanguage" : {
					"sLengthMenu" : "_MENU_ records",
					"sZeroRecords" : "No matching records found",
					"sInfo" : "Showing _START_ to _END_ of _TOTAL_ entries",
					"sInfoEmpty" : "No records available",
					"sInfoFiltered" : "(filtered from _MAX_ total entries)",
				},
				"aaSorting": [[ 7, "desc" ]],
				"aoColumns" : [
					{
						"mData" : "envelopeId",
						"sTitle" : "",
						"className" : "tblRowSelectors"
					},{
						"mData" : "object",
						"sTitle" : "Envelope Type, Address, Investor"
					},{
						"mData" : "task",
						"sTitle" : "Task"
					},{
						"mData" : "status",
						"sTitle" : "Status"
					}, {
						"mData" : "docusignEnvelopeId",
						"sTitle" : "SearchTerms",
					}, {
						"mData" : "propertyAddress",
						"sTitle" : "Property Address",
					}, {
						"mData" : "investorName",
						"sTitle" : "Investor Name",
					}, {
						"mData" : "createdDate",
						"sTitle" : "Created",
					}, {
						"mData" : "modifiedDate",
						"sTitle": "Modified"
					},{
						"mData" : "envelopeId",
						"sTitle" : "",
						"className" : "tblRowActions"
					}
				],

				"aoColumnDefs" : [
				{
					"aTargets": [ 0 ],
					"mRender" : function(
							data, type,
							full) {
//								console.log("parameter object", data,type,full);
							var resp = "";
							if (type=="display")
								resp = '<a href="#" data-env="' + data + '" class="showDocs" title="Show Documents">' +
											'<i class="fa fa-fw fa-files-o font14"></i></a>&nbsp;&nbsp;' +
										'<a href="#" data-env="' + data + '" class="showRecipients" title="Show Recipients">' +
											'<i class="fa fa-fw fa-users font14"></i></a>';
							else resp = data;
							return resp;	
					}
				},{
					"aTargets": [ 1 ],
					"mRender" : function(
							data, type,
							full) {
//								console.log("parameter object", data,type,full);
							var resp = "";
							if (data!=null)
								if (type=="display")
									resp = data.codeDisplay + 
										( full.propertyAddress!=null ? '<br/>' + full.propertyAddress : "" ) +
										( full.investorName!=null ? '<br/>' + full.investorName : "") ;
								else resp=data.codeDisplay;
							return resp;
							
					}
				},{
					"aTargets": [ 2 ],
					"mRender" : function(
							data, type,
							full) {
//								console.log("parameter task", data,type,full);
							var resp = "";
							if (data!=null)
								resp = data.taskName + ((data.status!=null ) ? "<br/>" + data.status : "");
							return resp;
					}
				},{
					"bVisible" : false,
					"aTargets": [ 4 ],
					"mRender" : function(
							data, type,
							full) {
							var resp = data;
//								if (type=="type") console.log("got to render for",data);
							if (type=="filter") {
//									console.log("search term for ",full.envelopeId);
								return full.searchTerms + "|" + full.investorName + "|" + full.propertyAddress

							}
							return resp;
					}
				},{
					"bVisible" : false,
					"aTargets": [ 5,6 ],
					"mRender" : function(
							data, type,
							full) {
							var resp = data;
//								if (type=="type") console.log("got to render for",data);
							return resp;
					}
				},{
					"aTargets": [ 7,8 ],
					"mRender" : function(
							data, type,
							full) {
							var resp = data;
							if (data==null)
								resp = ""
							else if (type=="display")
								resp = $.datepicker.formatDate('mm-dd-yy', new Date(data));
							return resp;
					}
				}, {
					"aTargets": [ 9 ],
					"mRender" : function(
							data, type,
							full) {
							var resp = data;
							if (type=="display")
								resp = 
									'<a style="cursor: pointer" data-toggle="modal" ' +
									' title="Send to next signer" name="sendToNext" ' +
									'envelopeId="' + data + '"><i class="fa fa-envelope"></i></a>&nbsp;&nbsp;' + 
									
									((full.status=="created") ?
									'<a style="cursor: pointer" data-toggle="modal" ' + 
									'class="gotoDocusign" title="View in Docusign" name="viewEnvelope" ' +
									'documentid="' + data + '" documenturl="' + 
									full.tagSendLink + '" > ' +
									'<i class="fa fa-external-link-square"></i></a><br/>' 
									:
									'<a style="cursor: pointer" data-toggle="modal" ' + 
									'class="launchManagementConsole" title="View in Docusign" ' +
									'documentid="' + data + '" > ' +
									'<i class="fa fa-external-link-square"></i></a><br/>'
									) +
									
									'<a style="cursor: pointer" data-toggle="modal" ' +
									' title="Refresh Envelope Status" name="refreshEnvelope" ' +
									'envelopeId="' + data + '"><i class="fa fa-refresh"></i></a>&nbsp;&nbsp;' + 
									
									'<!--a style="cursor: pointer" data-toggle="modal" ' +
									' title="Add Recipient" name="addRecipient" ' +
									'documentid="' + data + '">' +
									'<i class="fa fa-user"></i><i class="fa fa-plus"></i></a-->' + 
									
									
									'<a style="cursor: pointer" data-toggle="modal" ' + 
									'title="Delete" name="deleteEnvelope" ' +
									'documentid="' + data + '"><i class="fa fa-trash-o delete_red"></i></a>'
							return resp;
					}
				}
				],
	
				"fnServerData" : function(
						sSource, aoData, fnCallback, oSettings) {
					console.log("envelope fnServerData");
	
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
					console.log("in fnserver data, self model is",self.model);
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
						"success" : function(res) {
							console.log ("the datatable object",self.oTable);
							console.log ("success",res);
							res.iTotalRecords = res.iTotalRecords;
							res.iTotalDisplayRecords = res.iTotalRecords;
							$("button[name='refreshDocusign']").removeClass("disabled");
							//self.enableDragResize();
							fnCallback(res);
						},
						"error" : function(res) {
							 console.log("Failed in Envelope Status View: ", res);
	
						}
					});
				}
			});
			$("#envStatusTable_wrapper .dataTables_scrollHead table").css("margin-top","0px");
			$("#envStatusTable_wrapper .dataTables_scrollBody table").css("margin-top","-3px");
			$('select[name=envStatusTable_length]').addClass('form-control');
				
			setInterval( function () {
				self.oTable.fnDraw(false);
			}, 30000 );
		}

	});
	return EnvelopeStatusView;
});