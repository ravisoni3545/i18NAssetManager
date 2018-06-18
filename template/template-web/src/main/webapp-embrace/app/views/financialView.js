define(["text!templates/financials.html","backbone","models/financialModel","app","collections/financials","collections/propertyUnitCollection",
		"views/codesView","text!templates/transactionTypes.html","text!templates/financialsRow.html","text!templates/editFinancialsNew.html",
		"views/documentView","collections/documentCollection","text!templates/accountsDropdown.html","text!templates/payDropdown.html","text!templates/propertyUnitDropdown.html","text!templates/documentAddToolTip.html",
        "components-dropdowns","components-pickers"],
        function(financialPage, Backbone, financialmodel,app,financials,propertyUnitCollection,codesView,
        	accountTypeDropdownPage,financialAddRowPage,editFinancialsPage,documentView,documentCollection,accountsDropdown,payDropDown,propertyUnitDropdown,documentAddToolTip){

	var financialView = Backbone.View.extend( {
		initialize: function(folderTypeOptions){
			var ad = this;
			this.fetchDocObj();
			self.folderType = folderTypeOptions.folderType;
			//this.folderNames = new codesView({codeGroup:self.folderType});
			this.transactionTypes = new codesView({codeGroup:'NW_TRAN_TYPE'});
			this.paymentMethods= new codesView({codeGroup:'PAYMENT_GRP'});
			
			

		},

		model : {},
		models:{},
		el:"#financialTab",
		self:this,
		collection:new financials(),
		propertyModel:{},
		transactionId:{},
		creditAmount:0,
		debitAmount:0,
		docTypes:{},
		docSubObjectId:"",

		events          : {
			'click #saveFinancialData'	: 'saveFinancialData',
			'change #transactionCategoryDropdown' :'populateTransactionTypes',
			'click #addFinancialRow' : 'addFinancialRow',
			'click a[name="editFinancialData"]' : 'editPopUpFinancialData',
			'click #addEditFinancialRow' : 'addFinancialRowToEdit',
			'change #editTransactionCategoryDropdown' :'populateEditTransactionTypes',
			'click #updateFinancialData'	: 'updateFinancialData',
//			'click input[name="creditAmt"]':'disableSiblingDebitInputBox',
			'keypress input[id="creditAmt_currency"]':'disableSiblingDebitInputBox',
//			'click input[name="debitAmt"]':'disableSiblingCreditInputBox',
			'keypress input[id="debitAmt_currency"]':'disableSiblingCreditInputBox',
			'click #showFinancialForm'         :'addSingleFinancialRow',
//			'input input[name="creditAmt"]':'calculateAmounts',
			'keyup input[id="creditAmt_currency"]':'calculateAmounts',
//			'input input[name="debitAmt"]':'calculateAmounts',
			'keyup input[id="debitAmt_currency"]':'calculateAmounts',
			//------------------------------------------------------
			'change .accountTypeDropDown' :'populateAccounts',
			'change .payDropDown':'showPaymentMethods',
			'click #payerRadio': 'showPayerLabel',
			'click #payeeRadio':'showPayeeLabel',
			'click #editPayerRadio': 'showPayerLabel',
			'click #editPayeeRadio':'showPayeeLabel',
			"click input[name='vaultUpload']":"showFolderTypes",
			"click #submitFinancialDoc":"submitDocForm",
			'click a[name="uploadFinancialDocOld"]' : 'showUploadTemplateOld',
			'click a[name="uploadFinancialDoc"]' : 'showUploadTemplate'
		},

		render : function () {
			var thisPtr=this;
			
			if(this.propertyModel.hasOwnProperty("assetId")) {
				thisPtr.propertyModel.objectId = this.propertyModel.get("assetId");
			}
				
			thisPtr.collection.objectId=thisPtr.propertyModel.objectId;
			thisPtr.collection.object=thisPtr.propertyModel.object;

			thisPtr.collection.fetch({async:false,
				success: function (data) {
					
					thisPtr.models=data.toJSON();
					console.log(thisPtr.models);
				},
				error   : function () {
					console.log("fail");
				}
			});

			thisPtr.template = _.template( financialPage );
			thisPtr.$el.html("");

			data=thisPtr.models;
			if(data==null){
				data="";
			}
			
			//object to pass in document tool tip
			var objectIntValue="";
			if(thisPtr.propertyModel.object=="Asset"){
				objectIntValue="96";
			}
			else if(thisPtr.propertyModel.object=="Investor"){
				objectIntValue="203";
			}
			this.$el.html(this.template({financialModels:data[0],object:objectIntValue,objectId:thisPtr.propertyModel.objectId}));
			
			$(".amount").formatCurrency();
			/*this.transactionCategories.render({el:$('#transactionCategoryDropdown'),codeParamName:"statusId"});
			this.populateTransactionTypes();
			this.applyPermissions();*/
			this.transactionTypes.render({el:$('#transactionTypeDD'),codeParamName:"transactionTypeId"});
			this.populateAccountTypes();
			this.populatePayDropDown();
			this.addFinancialRow();
			this.addFinancialRow();
			this.applyPermissions();
			var unitColumnHide = false;
			if(thisPtr.collection.object == "Asset"){
				unitColumnHide = true;
			}
			$('#financialDataTableMain').dataTable({
					"bFilter":true,
					"deferRender": true,
					"aoColumnDefs": [
					            	   {"aTargets": [ 4 ], "bSortable": false},
					            	   {"aTargets": [ 5 ], "bSortable": false},
					            	   {"aTargets": [ 7 ] , "bVisible": unitColumnHide},
					            	   {"aTargets": [ 9 ], "bSortable": false}
					            	]
			});
            $('select[name=financialDataTableMain_length]').addClass('form-control');
            $('#financialDataTableMain_filter input').css('border','1px solid #e5e5e5');
            $('#financialDataTableMain_filter label').after('<div class="addbtnposition pull-right margin-bottom-10 marg_right15"><a href="#financial-form" data-toggle="modal" id="showFinancialForm" class="btn green"><i data-toggle="tooltip" title="Add New Financial" class="fa fa-plus hopNameTooltip"></i> </a></div>')
            $('.hopNameTooltip').tooltip({
                animated: 'fade',
                placement: 'top'
            });
            
            /**
             * Add new document code.
             */
            this.documentView.object=thisPtr.propertyModel.object;
			this.documentView.objectId=thisPtr.propertyModel.objectId;
			this.documentView.setElement($('#documentsUploadDiv')).render();
			
			/**
			 * Specific case for aligning document tooltip. "placement":"left"
			 */
			$('.showDocumentTooltip_2').popover({ 
				trigger: 'manual',
				'placement': 'left',
				hide: function() {
					$(this).animate({marginLeft: -10}, function() {
						$(this).css({marginLeft: ''});
					});
				},
				show: function () {
					$(this).fadeIn(200);
				}
			});
            
			ComponentsPickers.init();
			return this;
		},
		
		fetchDocObj:function(){/*
			 var self = this;
	    	 var allcodesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+ "/code/all/DOC_OBJ",
					async : false
				});
				allcodesResponseObject.done(function(response) {
					self.docTypes=response;
				});
				allcodesResponseObject.fail(function(response) {
					console.log("Error in retrieving codes "+response);
				});
	     */},
	     
	     showFolderTypes: function(){/*
		    	if($('#vaultUploadFinancials').is(':checked')==true){
		    		$("#folderDivFinancials").show();
		    	}
		    	else{
		    		$("#folderDivFinancials").hide();
		    	}
	     */},
	     
	     showUploadTemplateOld:function(evt){/*
	    	 var thisPtr=this;
	    	 thisPtr.docSubObjectId = $(evt.currentTarget).attr('entryId');
				
	    	 var uploadTemplate = _.template( financialDocUploadPage );
	    	 $("#financialDocumentDiv").empty();
	    	 $("#financialDocumentDiv").html(uploadTemplate({docTypes:thisPtr.docTypes}));
	    	 this.folderNames.render({el:$('#sharefileFolderDDFinancials'),codeParamName:"folderCodelistId"});
	    	 $("#folderDivFinancials").hide();
	    	 
	    	 $("#document-form2").modal('show');
	     */},
	     
	     showUploadTemplate:function(evt){
	    	 var thisPtr=this;
	    	 var form = $(this.el).find('#documentsUploadDiv #document-form1 #documentForm');
	    	 thisPtr.docSubObjectId = $(evt.currentTarget).attr('subObjectId');
	    	 form.find('input[name=subObject]').remove();
	    	 form.find('input[name=subObjectId]').remove();
	    	 form.append('<input type="hidden" name="subObject" value="569" >');
	    	 form.append('<input type="hidden" name="subObjectId" value='+ thisPtr.docSubObjectId +">");
	    	 // create 2 new hidden fields and add to document . self.$el.find("#documentsUploadDiv #document-form1 #documentForm)
	    	 this.documentView.showAddDocumentModal(evt);
	     },
	     
	     hideDocument:function(){
	    	 this.$el.find('#documentTabTableRender').hide();
	     },
	     
	     reTriggerEvents:function(){
	    	if(!this.documentView){
	    		this.documentView=new documentView({collection: new documentCollection(),financialDocObj:'FIN_DOC_OBJ',folderType:folderType});
	    	}
	    	this.listenTo(this.documentView, 'DocumentViewLoaded', this.hideDocument);
			
			if(app.documentTooltipView){
				this.listenTo(app.documentTooltipView, 'Document-Tooltip-shown', this.documentTooltipShown);
			} 
	     },
	     
	     submitDocForm:function(){/*
	    	 var self=this;
	    	 
	        	var formId = $('#documentFormFinancials').data("formid");
	        	var documentField = $('#documentFormFinancials').find('input[name=document]');
	        	var fileUploadValidate = !!($("#documentFormFinancials .files tbody").html());
	        	if(fileUploadValidate && $('#documentFormFinancials').validate().form()){
	        		$("#documentFormFinancials #documentErrorSpanFinancials").addClass("hide");
		        	$.blockUI({
			     		baseZ: 999999,
			     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			     	}
			     	);
			     documentField.prop("disabled", true);
			     $('#documentFormFinancials').attr("enctype","multipart/form-data");
	    	 	 $('#documentFormFinancials').ajaxSubmit({
	    	        url: app.context()+"account/uploadDoc/" + this.propertyModel.object+"/" + this.propertyModel.objectId,
	    	        async:true,
	    	        data: {"formId":formId},
	    	        beforeSubmit: function(){
	    	        },
	    	        success: function (res) {
	    	        	$.unblockUI();
	    	        	
	    	        	$('#documentFormFinancials').resetForm();
	    	        	$("#document-form2").modal('hide');
	    	        	$('#document-form2').on('hidden.bs.modal',function() {
	    	        		self.render();
						});
						documentField.prop("disabled", false);
	    	        },
	    	        error:function(res){
	    	        	$.unblockUI();
	    	        	$('#documentFormFinancials').resetForm();
	    	        	$("#document-form2").modal('hide');
	    	        	documentField.prop("disabled", false);
	    	        }
	    	    });
	        	} else {
	        		$("#documentFormFinancials #documentErrorSpanFinancials").removeClass("hide");
	        	}
	    	    return false;
	     
	     */},

		populateTransactionTypes : function(){
			var val=$("#transactionCategoryDropdown option:selected").val();

			var allcodesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/code/parent/"+val,
				async : false
			});

			$('#transactionTypeDropdown').html(_.template( transactionTypeDropdownPage )({codes:JSON.parse(allcodesResponseObject.responseText)}));

		},

		addFinancialRow: function(){
			var rowtemplate = _.template( financialAddRowPage );
			var currentTarget;
			if($('#financialDataTable tr').last().size()>0){
				$('#financialDataTable tr').last().after(rowtemplate());
			}
			else{
				$('#financialDataTable').append(rowtemplate());

			}
			currentTarget=$('#financialDataTable tr').last();
			this.populateAccountTypes2(currentTarget);
			app.currencyFormatter("$", "currencyTable");
			ComponentsPickers.init();
		},

		addFinancialRowToEdit: function(){
			var rowtemplate = _.template( financialAddRowPage );
			var currentTarget;
			console.log(financialAddRowPage);
			console.log(rowtemplate());
			if($('#edit-form-financial tr').last().size()>0){
				$('#edit-form-financial tr').last().after(rowtemplate());
			}
			else{
				$('#edit-form-financial').append(rowtemplate());

			}
			currentTarget=$('#edit-form-financial tr').last();
			app.currencyFormatter("$", "currencyTable");
			this.populateAccountTypes2(currentTarget);
			ComponentsPickers.init();
		},

		saveFinancialData: function(){
			var self = this;
			if($("#totalDebitAmountCreate").val()!=$("#totalCreditAmountCreate").val()){
				$("#errorMsg").css("display","block");
				return;
			}
			else{
				$("#errorMsg").css("display","none");
			}
			var entries=[];
			var requestObj={};
			var self = this;
			requestObj.objectId= this.propertyModel.objectId;
			requestObj.transactionTypeId=$("[name='transactionTypeId']").val();
			requestObj.transactionDate=$("#transactionDate").val();
			requestObj.description=$("#description").val();
			requestObj.payType=this.payType;
			requestObj.payMethod=$("[name='payMethod']").val();
			requestObj.reference=$("[name='reference']").val();
			requestObj.payId=$("[name='payId']").val();
			requestObj.propertyUnitId=self.$el.find("#financial-form select[name=propertyUnitId]").val();
			
			var valid = true;
			$('#financialDataTable').find('tr').each(function(){

				var obj={};
				obj.accountTypeId=$(this).find("[name='accountTypeId']").val();
				obj.accountId=$(this).find("[name='accountId']").val();
				obj.description=$(this).find("[name='description']").val();
				obj.transactionDate=$(this).find("[name='transactionDate']").val();
				obj.creditAmt=$(this).find("[name='creditAmt']").val();
				obj.debitAmt=$(this).find("[name='debitAmt']").val();
				/*if(($(this).find("[name='creditAmount']").val()!="" || $(this).find("[name='debitAmount']").val()!="") 
						&& $(this).find("[name='detailDescription']").val()!=""){
					
				}*/
				if(parseFloat(obj.creditAmt)<0 || parseFloat(obj.debitAmt)<0) {
					var error = $('#operationErrorPopup');
					error.find('text').html("Negative values are not allowed.");
					error.show();
                	App.scrollTo(error, -200);
                	error.delay(2000).fadeOut(2000);
                	valid=false;
                	return false;
				}
				entries.push(obj);
			});
			
			if(!valid) {
				return false;
			}
			
			//return;
			requestObj.entries=entries;

			$.ajax({
				url: app.context()+'/account/addOrUpdate/'+self.propertyModel.object,
				contentType: 'application/json',
				dataType:'json',
				type: 'POST',
				data:JSON.stringify(requestObj),
				success: function(res){
					if(res.statusCode=='500') {
						var error = $('#operationErrorPopup');
						error.find('text').html(res.message);
						error.show();
                    	App.scrollTo(error, -200);
                    	error.delay(2000).fadeOut(2000);
					} else {
						$("#financial-form").modal('hide');
						
						$("#financial-form").on('hidden.bs.modal', function (e) {
							console.log("success");
							self.render();
						});
					}
				},
				error: function(res){
					console.log("failure");
				}
			});

		},

		editPopUpFinancialData : function(evt){
			var thisPtr=this;
			thisPtr.entryId = $(evt.currentTarget).attr('entryId');
			var financialFormResponse = $.ajax({
				type : "GET",
				url : app.context()+ "/account/readFinancialInfo/"+thisPtr.entryId,
				async : false
			});

			var data=JSON.parse(financialFormResponse.responseText);
			
			$('#edit-financial-form').html(_.template( editFinancialsPage )({financialData:data}));
			
			this.transactionTypes.callback=function() {
				$("#editTransactionTypeDD").find("[name='transactionTypeId']").val(data.transactionTypeId);
			}
			this.transactionTypes.render({el:$('#editTransactionTypeDD'),codeParamName:"transactionTypeId"});
			this.populateAccountTypes();
			this.populateEditPayDropDown();
			this.selectSavedAccount();
			this.paymentMethods.callback=function() {
				$("#editPaymentMethodDD").find("[name='payMethod']").val(data.payMethod);
			}
			this.paymentMethods.render({el:$('#editPaymentMethodDD'),codeParamName:"payMethod",addBlankFirstOption:true});
			//
			$("#editTransactionTypeDD").find("[name='transactionTypeId']").val(data.transactionTypeId);
			$("#editPayerDD").find("[name='payId']").val(data.payId);
			$("#editPaymentMethodDD").find("[name='payMethod']").val(data.payMethod);
			if(data.payType=='payer'){
				$("#editPayerRadio").prop('checked',true);
				this.showPayerLabel();
			}
			else{
				$("#editPayeeRadio").prop('checked',true);
				this.showPayeeLabel();
			}
			thisPtr.loadAddPropertyUnits(thisPtr.$el.find("#editFinancialForm"),data.propertyUnitId);
			$(".currencyTable").formatCurrency(); // for first time loading
			app.currencyFormatter("$", "currencyTable");
			this.calculateAmounts();
			this.applyPermissions();
			
			$('#editFinancialForm').modal('show');
			ComponentsPickers.init();

		},

		populateEditTransactionTypes : function(){
			var val=$("#editTransactionCategoryDropdown option:selected").val();

			var allcodesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/code/parent/"+val,
				async : false
			});

			$('#editTransactionTypeDropdown').html(_.template( transactionTypeDropdownPage )({codes:JSON.parse(allcodesResponseObject.responseText)}));

		},

		updateFinancialData : function(){
			
			if($("#totalCreditAmt").val()!=$("#totalDebitAmt").val()){
				$("#errorMsgEdit").css("display","block");
				return;
			}
			else{
				$("#errorMsgEdit").css("display","none");
			}
			
			var entries=[];
			var requestObj={};
			var self = this;
			requestObj.objectId= this.propertyModel.objectId;
			requestObj.transactionTypeId=$("#editTransactionTypeDD").find("[name='transactionTypeId']").val();
			requestObj.transactionDate=$("#editTransactionDate").val();
			requestObj.description=$("#editDescription").val();
			requestObj.payType=this.payType;
			requestObj.payMethod=$("#editPaymentMethodDD").find("[name='payMethod']").val();
			requestObj.reference=$("[name='editReference']").val();
			requestObj.payId=$("#editPayerDD").find("[name='payId']").val();
			requestObj.journalHeaderId=$("[name='journalHeaderId']").val();
			requestObj.propertyUnitId=self.$el.find("#editFinancialForm select[name=propertyUnitId]").val();
			
			var valid = true;

			$('#edit-form-financial').find('tr').each(function(){

				var obj={};
				obj.accountTypeId=$(this).find("[name='accountTypeId']").val();
				obj.accountId=$(this).find("[name='accountId']").val();
				obj.description=$(this).find("[name='description']").val();
				obj.transactionDate=$(this).find("[name='transactionDate']").val();
				obj.creditAmt=$(this).find("[name='creditAmt']").val();
				obj.debitAmt=$(this).find("[name='debitAmt']").val();
				obj.entryId=$(this).find("[name='journalEntryId']").val();
				/*if(($(this).find("[name='creditAmount']").val()!="" || $(this).find("[name='debitAmount']").val()!="") 
						&& $(this).find("[name='detailDescription']").val()!=""){
					
				}*/
				if(parseFloat(obj.creditAmt)<0 || parseFloat(obj.debitAmt)<0) {
					var error = $('#operationErrorPopupEdit');
					error.find('text').html("Negative values are not allowed.");
					error.show();
                	App.scrollTo(error, -200);
                	error.delay(2000).fadeOut(2000);
                	valid = false;
                	return false;
				}
				entries.push(obj);
			});
			
			if(!valid) {
				return false;
			}
			
			//return;
			requestObj.entries=entries;
			//return;
			$.ajax({
				url: app.context()+'/account/addOrUpdate/'+self.propertyModel.object,
				contentType: 'application/json',
				dataType:'json',
				type: 'POST',
				data:JSON.stringify(requestObj),
				success: function(res){
					if(res.statusCode=='500') {
						var error = $('#operationErrorPopupEdit');
						error.find('text').html(res.message);
						error.show();
                    	App.scrollTo(error, -200);
                    	error.delay(2000).fadeOut(2000);
					} else {
						$("#editFinancialForm").modal('hide');
	
						$("#editFinancialForm").on('hidden.bs.modal', function (e) {
							console.log("success");
							self.render();
						});
					}
				},
				error: function(res){
					console.log("failure");
				}
			});

		},

		disableSiblingDebitInputBox : function(evt){
			var currentTarget=$(evt.currentTarget);
			currentTarget.removeAttr('readOnly');
			currentTarget.parent().parent().parent().find('input[name="debitAmt"]').val("");
			currentTarget.parent().parent().parent().find('input[id="debitAmt_currency"]').val("");
			currentTarget.parent().parent().parent().find('input[name="debitAmt"]').attr('readOnly',true);
			this.calculateAmounts();
		},

		disableSiblingCreditInputBox : function(evt){
			var currentTarget=$(evt.currentTarget);
			currentTarget.removeAttr('readOnly');
			currentTarget.parent().parent().parent().find('input[name="creditAmt"]').val("");
			currentTarget.parent().parent().parent().find('input[id="creditAmt_currency"]').val("");
			currentTarget.parent().parent().parent().find('input[name="creditAmt"]').attr('readOnly',true);
			this.calculateAmounts();
		},

		calculateAmounts: function(){
			var self=this;
			self.creditAmount=0;
			self.debitAmount=0;
			$('#edit-form-financial').find('tr').each(function(){
				if($(this).find("[name='creditAmt']").val()!=""){
					self.creditAmount+=parseFloat($(this).find("[name='creditAmt']").val());
				}
				if($(this).find("[name='debitAmt']").val()!=""){
					self.debitAmount+=parseFloat($(this).find("[name='debitAmt']").val());
				}
			});

			$("#totalDebitAmt").val(self.debitAmount.toFixed(2));
			$("#totalCreditAmt").val(self.creditAmount.toFixed(2));
			//$("#totalAmount").val(parseFloat(self.creditAmount)-parseFloat(self.debitAmount));

			self.creditAmountCreate=0;
			self.debitAmountCreate=0;
			
			$('#financialDataTable').find('tr').each(function(){
				if($(this).find("[name='creditAmt']").val()!=""){
					self.creditAmountCreate+=parseFloat($(this).find("[name='creditAmt']").val());
				}
				if($(this).find("[name='debitAmt']").val()!=""){
					self.debitAmountCreate+=parseFloat($(this).find("[name='debitAmt']").val());
				}
			});

			$("#totalDebitAmountCreate").val(self.debitAmountCreate.toFixed(2));
			$("#totalCreditAmountCreate").val(self.creditAmountCreate.toFixed(2));
			//$("#totalAmountCreate").val(parseFloat(self.creditAmountCreate)-parseFloat(self.debitAmountCreate));
			
			$(".amount").formatCurrency();
		},

		addSingleFinancialRow: function(){
			var self = this;
			self.render();
			var rowtemplate = _.template( financialAddRowPage );
			if($('#financialDataTable tr').last().size()==0){
				$('#financialDataTable').append(rowtemplate());
			}
			self.loadAddPropertyUnits(self.$el.find("#financial-form"));
		},

		applyPermissions : function() {
			if(this.propertyModel.object=="Asset" && $.inArray('AssetManagement', app.sessionModel.attributes.permissions)==-1) {
				$('#showFinancialForm').remove();
				$('#updateFinancialData').remove();
				$("#addEditFinancialRow").remove();
			}
		},

		//---------------------------------------------------------------------------------------------
		populateAccountTypes2 : function(target){

			var currTarget;
			var allcodesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/account/types/",
				async : false
			});

			currTarget=target.find('div[class="accountTypeDD"]').html(_.template( accountTypeDropdownPage )({codes:JSON.parse(allcodesResponseObject.responseText)}));
			//$('.accountTypeDD').html(_.template( accountTypeDropdownPage )({codes:JSON.parse(allcodesResponseObject.responseText)}));
			this.populateAccounts2(currTarget);

		},
		
		populateAccountTypes : function(){

			var allcodesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/account/types/",
				async : false
			});

			$('.accountTypeDD').html(_.template( accountTypeDropdownPage )({codes:JSON.parse(allcodesResponseObject.responseText)}));
			this.populateAllAccounts();

		},
		populateAccounts : function(evt){
			var currentTarget=$(evt.currentTarget);	
			var val=currentTarget.val();

			var allcodesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/account/"+val,
				async : false
			});

			currentTarget.parent().parent().parent().find('div[class="accountDD"]').html(_.template( accountsDropdown )({codes:JSON.parse(allcodesResponseObject.responseText)}));
		},

		populateAllAccounts : function(){
			var val=$('.accountTypeDropDown').val();				
			var allcodesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/account/"+val,
				async : false
			});

			$(".accountDD").html(_.template( accountsDropdown )({codes:JSON.parse(allcodesResponseObject.responseText)}));
		},
		
		populateAccounts2 : function(target){
			var currentTarget=target;	
			var val=currentTarget.find('select').val();

			var allcodesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/account/"+val,
				async : false
			});

			currentTarget.parent().parent().find('div[class="accountDD"]').html(_.template( accountsDropdown )({codes:JSON.parse(allcodesResponseObject.responseText)}));
		},
		
		populatePayDropDown : function(){
			var thisPtr=this;
			var allcodesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/account/pay/"+thisPtr.propertyModel.object+"/"+thisPtr.propertyModel.objectId,
				async : false
			});

			$("#payerDD").html(_.template( payDropDown )({codes:JSON.parse(allcodesResponseObject.responseText)}));

		},
		
		showPaymentMethods: function(){
			this.paymentMethods.render({el:$('#paymentMethodDD'),codeParamName:"payMethod",addBlankFirstOption:true});
			//this.paymentMethods.render({el:$('#editPaymentMethodDD'),codeParamName:"payMethod"});
			$('#referenceNumber').css("display","block");
			//$('#editReferenceNumber').css("display","block");
			
		},
		
		showPayerLabel: function(){
			$('.payershow').css("display","block");
			$('.payeeshow').css("display","none");
			this.payType='payer';
		},
		showPayeeLabel:function(){
			$('.payeeshow').css("display","block");
			$('.payershow').css("display","none");
			this.payType='payee';
		},
		populateEditPayDropDown : function(){
			var thisPtr=this;
			var allcodesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/account/pay/"+thisPtr.propertyModel.object+"/"+thisPtr.propertyModel.objectId,
				async : false
			});

			$("#editPayerDD").html(_.template( payDropDown )({codes:JSON.parse(allcodesResponseObject.responseText)}));

		},
		selectSavedAccount: function(){
			var thisPtr=this;
			$('#edit-form-financial').find('tr').each(function(){
				var obj={};
				obj.accountTypeId=$(this).find("[name='hiddenAccountTypeId']").val();
				obj.accountId=$(this).find("[name='hiddenAccountId']").val();
				if(obj.accountTypeId || obj.accountId){
					$(this).find("[name='accountTypeId']").val(obj.accountTypeId);
					thisPtr.populateSavedAccounts($(this).find("[name='accountTypeId']"));
					$(this).find("[name='accountId']").val(obj.accountId);
				}
				
			});
		},
		populateSavedAccounts : function(target){
			var currentTarget=target;	
			var val=currentTarget.val();

			var allcodesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/account/"+val,
				async : false
			});

			currentTarget.parent().parent().parent().find('div[class="accountDD"]').html(_.template( accountsDropdown )({codes:JSON.parse(allcodesResponseObject.responseText)}));
		},
		loadAddPropertyUnits: function(modalObject,unitId) {
    	 	var self = this;
    	 	if(self.collection.object == "Asset"){
    	 		unitId = unitId || "";
				if(!self.propertyUnitCollection){
					self.propertyUnitCollection = new propertyUnitCollection();
				}
				self.propertyUnitCollection.investmentId = self.propertyModel.attributes.investmentID;
				
				self.propertyUnitCollection.fetch({
		    		success:function(data){
		    			self.propertyUnits = data.propertyUnits;
	    				modalObject.find('#unitDropdown').html(_.template( propertyUnitDropdown )({units:self.propertyUnits,fieldName:"propertyUnitId"}));
	    				modalObject.find('#unitDropdown select[name=propertyUnitId]').val(unitId);
		    		},
		    		error:function(){
		    			console.log("fetch Error");
		    		}
		    	});
    	 	} else {
    	 		modalObject.find("#unitDropdown").closest(".form-group").hide();
    	 	}
  		},
  		documentTooltipShown: function(args){
  			var self = this;
  			var currentTarget = $(args.evt.currentTarget);
  			self.$el.find(currentTarget.closest('tr')).find('#tooltipAddDocument').html(_.template(documentAddToolTip)({subObjectId:currentTarget.data('subobjectid'),name:'uploadFinancialDoc'}));
  			$('.addNewDocumentTooltip').tooltip({
                animated: 'fade',
                placement: 'top'
            });
  			if(!args.hasContent){
  				currentTarget.closest('td').addClass('popover-left');
  			}
  		}
	});
	return financialView;
});