define(["backbone","app","views/codesView","views/statesView",
        "text!templates/companyDropDown.html","text!templates/companyAddressForm.html",
        "text!templates/utilityTransferViewRow.html","text!templates/utilityTransferExpandedRow.html",
        "text!templates/utilityTransferEditRow.html","components-dropdowns","components-pickers"],
        function(Backbone,app,codesView,statesView,companyDropDown,companyAddressForm,utilityTransferViewRow,
        		utilityTransferExpandedRow,utilityTransferEditRow){

	var utilityTransferView = Backbone.View.extend( {
		initialize: function() {
			var self=this;
		},
		el:"#renderUtilityTransfer",
		propertyUtilities:[],
		events          : {
			"change [name=utilityType]":"fetchVendorByService",
			"change [name=companyDropdown]":"showHideCompanyName",
			"click .cancelUtilityForm":"hideUtilityRow",
			'click .deleteUtilityButton': 'deleteUtility',
			'click #confirmDeleteUtility':'deleteUtilityConfirmation',
			'click .addUtilityTransfer':'addUtilityTransferRow',
			'click .submitUtilityTransferForm':'saveUtilityTransfer',
			'click .addUtilityTransferEditRow':'addUtilityTransferEditRow',
			'click .updateUtilityTransfer':'updateUtility',
			"click .cancelUtilityEditForm":"hideUtilityEditRow",
		},


		renderUtilityTransfer : function (options) {
			console.log("utility transfer render");
			var self = this;
			if(options){
				self.object = options.object;
				self.objectId = options.objectId;
				self.taskKey= options.taskKey;
			}
			self.fetchUtilityData();
			self.$el.find("table thead .addUtilityTransfer").data("show",true);
			var tableTemplate = _.template(utilityTransferViewRow)({utilities:self.propertyUtilities});
			self.$el.find("table tbody").html("");
			self.$el.find("table tbody").html(tableTemplate);
		},

		fetchUtilityData:function(){
			var self=this;
			$.ajax({
				url: app.context()+'/utility/fetchUtilities/'+self.object+'/'+self.objectId,
				contentType: 'application/json',
				dataType:'json',
				type: 'GET',
				async: false,
				success: function(res){
					self.propertyUtilities=res;
				},
				error: function(res){
					console.log("Error while fetching utilities");
				}
			});
		},

		fetchVendorByService: function(evt,serviceNameVal){
			var self=this;
			if(evt || serviceNameVal){
				var selectedVal={};
				var serviceName={};
				if(evt){
					selectedVal=$(evt.target);
					serviceName=selectedVal.find('option:selected').text();
				}
				else if(serviceName){
					serviceName=serviceNameVal;
				}

				var allCompaniesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+ "/company/service/"+serviceName,
					async : false
				});
				allCompaniesResponseObject.done(function(response) {
					self.companies=response;
				});
				allCompaniesResponseObject.fail(function(response) {
					console.log("Couldn't fetch vendors for service:"+serviceName);
					self.companies=[];
				});
				if(evt){
					var companyDD=_.template(companyDropDown);
					$(evt.target).closest('form').find('.renderCompanyDD').html("");
					$(evt.target).closest('form').find('.renderCompanyDD').html(companyDD({orgList:self.companies}));
					$('.companyName').hide();
					$('.companyName').find("input[name=orgName]").attr("disabled","disabled");
					var companyAddressFormHtml=_.template(companyAddressForm);
					$(evt.target).closest('form').find('.companyAddressForm').html("");
					$(evt.target).closest('form').find('.companyAddressForm').html(companyAddressFormHtml({company:{}}));
				}
			}
			else{
				self.companies=[];
			}
		},

		showHideCompanyName: function(evt){
			var self=this;
			var selectedVal=$(evt.target);

			var companyAddressFormHtml=_.template(companyAddressForm);
			if(selectedVal.find('option:selected').val()=='addNewCompany'){
				$('.companyName').show();
				$('.companyName').find("input[name=orgName]").attr("disabled",false);
				selectedVal.closest('form').find('.companyAddressForm').html("");
				selectedVal.closest('form').find('.companyAddressForm').html(companyAddressFormHtml({company:{}}));
				if(!this.states){
					this.states= new statesView();
				}
				this.states.render({el:$('.state')});
			}
			else{
				$('.companyName').hide();
				$('.companyName').find("input[name=orgName]").attr("disabled","disabled");
				self.orgId=selectedVal.find('option:selected').val();
				self.fetchVendorData();
				selectedVal.closest('form').find('.companyAddressForm').html("");
				selectedVal.closest('form').find('.companyAddressForm').html(companyAddressFormHtml({company:self.companyData}));
				selectedVal.closest('form').find('[name=orgName]').val(self.companyData.orgName);
				if(!this.states){
					this.states= new statesView();
				}
				this.states.render({el:$('.state')});
			}
		},

		fetchVendorData:function(){
			var self=this;

			$.ajax({
				url: app.context() + '/company/'+self.orgId,
				contentType: 'application/json',
				dataType: 'json',
				type: 'GET',
				async:false,
				success: function (res) {
					self.companyData=res;
				},
				error: function (res) {
					self.companyData={};  
				}
			});
		},

		hideUtilityRow : function(evt){
			var self = this;
			var targetAction;
			// self.$el.find("#addUnitsModal thead .addOrEditNewItem").data("show",true);
			var row = $(evt.currentTarget).closest("tr");
			var previousRow = row.prev();
			if(previousRow.length){
				targetAction = previousRow.find(".addUtilityTransfer");
			} else {
				targetAction = self.$el.find("table thead .addUtilityTransfer"); // Thead
			}

			targetAction.data("show",true);
			this.hideHiddenRows(row);
		},
		hideHiddenRows: function(row){
			var self = this;
			$('.collapse.in').collapse('hide');
			setTimeout(function(){self.deleteHiddenRow(row)},500);
		},
		deleteHiddenRow: function(row){
			$(row).remove();
		},
		hideAllHiddenRows: function(args){
			var self = this;
			var requiredRows = self.$el.find(".collapse.in").closest("tr");
			if(args != "thead"){
				self.$el.find("thead .addUtilityTransfer").data("show",true);
			}
			_.each(requiredRows,function(el){
				$(el).prev().find(".addUtilityTransferEditRow").data("show",true);
				self.hideHiddenRows(el);
			});
		},
		deleteUtility: function(evt){
			var self=this;
			self.utilityId=$(evt.target).closest('tr').data('modelid');
		},
		deleteUtilityConfirmation : function(evt){
			var self=this; 
			$.ajax({
				url: app.context()+ '/utility/archiveUtility/'+this.utilityId,
				contentType: 'application/json',
				dataType:'json',
				async:false,
				type: 'DELETE',
				success: function(res){
					self.renderUtilityTransfer();
					status=res.statusCode;
				},
				error: function(res){
					console.log("error while deleting utility");
				}
			});

			$('#deleteUtilityModal_1').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
		},

		addUtilityTransferRow: function(evt){
			var self = this;
			var currentTarget = $(evt.currentTarget);
			var newRowTemplate =_.template(utilityTransferExpandedRow);
			var companyDD=_.template(companyDropDown);

			var model;
			var currentForm;
			var templateData = {};

			if(currentTarget.data("show")){
				self.hideAllHiddenRows("thead");
				var firstRow = currentTarget.closest("table").find("tbody tr:first");

				if(firstRow && firstRow.length){
					currentTarget.closest("table").find("tbody tr:first")
					.before(newRowTemplate({row:"unitRow0",company:templateData}));
				} else {
					currentTarget.closest("table").find("tbody").html(newRowTemplate({row:"unitRow0",company:templateData}));
				}
				currentForm = currentTarget.closest("table").find("tbody tr:first form");
				
				var startDatePicker = currentForm.find('[name=transferRequestedDate]');
				startDatePicker.parent().datepicker('setEndDate','+0d').datepicker('update');
				
//				if(startDatePicker.length>0) {
//					$(startDatePicker[0]).parent().datepicker().on('changeDate', function (evt) {
//						var selectedDate = new Date(evt.date.valueOf());
//						var endDatePicker = currentForm.find('[name=transferEffectiveDate]');
//						if(endDatePicker.length>0) {
//							var endDatePickerWidget = $(endDatePicker[0]).parent();
//							var endDate = endDatePickerWidget.datepicker("getDate");
//							if(endDate<selectedDate) {
//								endDatePickerWidget.data({date: selectedDate}).datepicker('update');
//								var month = selectedDate.getMonth()+1;
//								if(String(month).length<2) {
//									month = '0'+month;
//								}
//								$(endDatePicker[0]).val(month+"-"+selectedDate.getDate()+"-"+selectedDate.getFullYear());
//							}
//							endDatePickerWidget.datepicker('setStartDate', selectedDate);
//						}
//					});
//				}
				
				$(".renderCompanyDD").html(companyDD({orgList:[]}));
				if(!this.utilities) {
					this.utilities = new codesView({codeGroup:'UTILITY_TYPE'});
				}
				this.utilities.render({el:$('.utilityDD'),codeParamName:"utilityType",addBlankFirstOption:"true"});

				if(!this.states){
					this.states= new statesView();
				}
				this.states.render({el:$('.state')});
				$('.companyName').hide();
				
			} else {
				self.hideHiddenRows(currentTarget.closest("table").find("tbody tr:first"));
			}

			if(currentTarget.data("show")){
				currentTarget.data("show",false);
			} 
			else{
				currentTarget.data("show",true);
			}
			ComponentsPickers.init();
		},

		saveUtilityTransfer: function(evt){
			var self=this;
			var form = $(evt.target).closest('form');
			self.saveUtilityFormValidation(form);
			if(!form.validate().form()){
				return;
			}
			var postData={};
			postData.object=self.object;
			postData.objectId=self.objectId;
			postData.taskKey=self.taskKey;
			postData.serviceName=form.find('[name=utilityType] option:selected').text();

			if(form.find('[name=companyDropdown] option:selected').val()=='addNewCompany'){
				console.log("Need to create new company");
			}
			else{
				postData.orgId=form.find('[name=companyDropdown] option:selected').val();
			}

			var document = form.find('input[name=transferDocuments]');
            if(document && document.val() == "") {
            	document.prop("disabled", true);
            }
			
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});

			form.attr("enctype","multipart/form-data");
			form.ajaxSubmit({
				url: app.context()+'/utility/save',
				async:false,
				data:postData,
				success: function(res){
					$.unblockUI();
					self.renderUtilityTransfer();
				},
				error: function(res){
					$.unblockUI();
					self.renderUtilityTransfer();
				}
			});
		},
		saveUtilityFormValidation: function(requiredForm){
			requiredForm.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					utilityType:{
						required: true
					},
					address1:{
						required: true
					},
					phone:{
						required: true
					},
					orgName:{
						required: true
					},
					companyDropdown:{
						required: true
					},
					transferRequestedDate:{
						required: true
					},
					transferEffectiveDate:{
						required: true
					},
					accountNumber:{
						required: true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					
				},
				highlight: function (element) { // hightlight error inputs
					$(element)
					.closest('.form-group').addClass('has-error'); // set error class to the control group
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

		addUtilityTransferEditRow: function(evt){
			var self =this;
			var model;
			var currentForm;
			var templateData = {};
			var currentTarget = $(evt.currentTarget);
			var newRowTemplate =_.template(utilityTransferEditRow);

			//templateData.inspectionCategories = self.propertyInspectionCategories;
			self.currentModelId =currentTarget.closest('tr').data("modelid");
			if(self.currentModelId){
				if(currentTarget.data("show")){
					self.hideAllHiddenRows();
					var targetRow = currentTarget.data("target").split(".")[1];
					model = _.find(self.propertyUtilities, function(e){ return e.id == self.currentModelId; });
					templateData = model;
					currentTarget.closest("tr")
					.after(newRowTemplate({row:targetRow,company:templateData}));
					currentForm = currentTarget.closest("tr").next().find("form");
					
					var startDatePicker = currentForm.find('[name=transferRequestedDate]');
					startDatePicker.parent().datepicker('setEndDate','+0d').datepicker('update');
					
//					if(startDatePicker.length>0) {
//						$(startDatePicker[0]).parent().datepicker().on('changeDate', function (evt) {
//							var selectedDate = new Date(evt.date.valueOf());
//							var endDatePicker = currentForm.find('[name=transferEffectiveDate]');
//							if(endDatePicker.length>0) {
//								var endDatePickerWidget = $(endDatePicker[0]).parent();
//								var endDate = endDatePickerWidget.datepicker("getDate");
//								if(endDate<selectedDate) {
//									endDatePickerWidget.data({date: selectedDate}).datepicker('update');
//									var month = selectedDate.getMonth()+1;
//									if(String(month).length<2) {
//										month = '0'+month;
//									}
//									$(endDatePicker[0]).val(month+"-"+selectedDate.getDate()+"-"+selectedDate.getFullYear());
//								}
//								endDatePickerWidget.datepicker('setStartDate', selectedDate);
//							}
//						});
//					}

					$('input[name=turnedOn]:checked').removeAttr('checked').parent().removeClass('checked');
					$('input[id=turnedOn'+templateData.turnedOn+'][name=turnedOn]').attr('checked','checked').parent().addClass('checked');
					$('input[id=turnedOn'+templateData.turnedOn+'][name=turnedOn]').parent().click();
					
				} else {
					self.hideHiddenRows(currentTarget.closest("tr").next());
				}
			}
			
			if(currentTarget.data("show")){
				currentTarget.data("show",false);
			} 
			else{
				currentTarget.data("show",true);
			}
			
			ComponentsPickers.init();
		},
		
		updateUtility: function(evt){
			
			var self=this;
			var form = $(evt.target).closest('form');
			self.updateUtilityFormValidation(form);
			if(!form.validate().form()){
				return;
			}
			var postData={};
			postData.object=self.object;
			postData.objectId=self.objectId;
			postData.taskKey=self.taskKey;
			
			var document = form.find('input[name=transferDocuments]');
            if(document && document.val() == "") {
            	document.prop("disabled", true);
            }
			
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});

            form.attr("enctype","multipart/form-data");
			form.ajaxSubmit({
				url: app.context()+'/utility/update',
				async:true,
				data:postData,
				success: function(res){
					$.unblockUI();
					self.renderUtilityTransfer();
				},
				error: function(res){
					$.unblockUI();
					self.renderUtilityTransfer();
				}
			});
		},
		updateUtilityFormValidation: function(requiredForm){
			requiredForm.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					transferRequestedDate:{
						required: true
					},
					transferEffectiveDate:{
						required: true
					},
					accountNumber:{
						required: true
					}
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					
				},
				highlight: function (element) { // hightlight error inputs
					$(element)
					.closest('.form-group').addClass('has-error'); // set error class to the control group
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
		hideUtilityEditRow : function(evt){
			var self = this;
			var targetAction;
			// self.$el.find("#addUnitsModal thead .addOrEditNewItem").data("show",true);
			var row = $(evt.currentTarget).closest("tr");
			var previousRow = row.prev();
			if(previousRow.length){
				targetAction = previousRow.find(".addUtilityTransferEditRow");
			} else {
				targetAction = self.$el.find("table thead .addUtilityTransferEditRow"); // Thead
			}

			targetAction.data("show",true);
			this.hideHiddenRows(row);
		}
	});
	return utilityTransferView;
});