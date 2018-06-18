define(["backbone","app","models/utilityModel","text!templates/utilityInformationViewRow.html",
        "text!templates/utilityInformationExpandedRow.html","views/codesView","views/statesView",
        "text!templates/companyDropDown.html","text!templates/companyAddressForm.html",
        "components-dropdowns","components-pickers"],
        function(Backbone,app,utilityModel,utilityInformationViewRow,utilityInformationExpandedRow,
        		codesView,statesView,companyDropDown,companyAddressForm){

	var utilityView = Backbone.View.extend( {
		initialize: function() {
			
		},
		el:"#renderUtilityInformation",
		propertyInspectionCategories:[],
		propertyUtilities:[],
		events          : {
			"click .addOrEditUtility":"addOrEditUtility",
			"change [name=utilityType]":"fetchVendorByService",
			"click .submitUtilityForm" :"saveUtilityInformation",
			"change [name=companyDropdown]":"showHideCompanyName",
			"click .cancelUtilityForm":"hideUtilityRow",
			'click .deleteUtilityButton': 'deleteUtility',
			'click #confirmDeleteUtility':'deleteUtilityConfirmation'
		},
		render : function (options) {
			console.log("utility view render");
			var self = this;
			if(options){
				self.object = options.object;
				self.objectId = options.objectId;
				self.taskKey= options.taskKey;
			}
			self.fetchUtilityData();
			self.$el.find("table thead .addOrEditUtility").data("show",true);
			var tableTemplate = _.template(utilityInformationViewRow)({utilities:self.propertyUtilities});
			self.$el.find("table tbody").html("");
			self.$el.find("table tbody").html(tableTemplate);
			ComponentsPickers.init();
		},

		fetchUtilityData:function(){
			var self=this;
			self.propertyUtilities=[];
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

		addOrEditUtility : function(evt){
			console.log("addOrEditUtility");
			var self = this;
			var currentTarget = $(evt.currentTarget);
			var newRowTemplate =_.template(utilityInformationExpandedRow);
						
			var companyDD=_.template(companyDropDown);
			// var targetRow = currentTarget.data("target");
			self.currentModelId =currentTarget.closest('tr').data("modelid");

			var model;
			var currentForm;
			var templateData = {};
			//templateData.inspectionCategories = self.propertyInspectionCategories;

			if(self.currentModelId){
				if(currentTarget.data("show")){
					self.hideAllHiddenRows();
					var targetRow = currentTarget.data("target").split(".")[1];
					model = _.find(self.propertyUtilities, function(e){ return e.id == self.currentModelId; });
					templateData = model;
					currentTarget.closest("tr")
					.after(newRowTemplate({row:targetRow,company:templateData}));
					currentForm = currentTarget.closest("tr").next().find("form");
					
					self.fetchVendorByService(null,templateData.name);
					currentForm.find(".renderCompanyDD").html(companyDD({orgList:self.companies}));
					if(!this.utilities) {
						this.utilities = new codesView({codeGroup:'UTILITY_TYPE'});
					}
					this.utilities.callback = function() {
						currentForm.find("[name=utilityType]").val(templateData.utilityType);
					}
					this.utilities.render({el:$('.utilityDD'),codeParamName:"utilityType",addBlankFirstOption:"true"});

					if(!this.states){
						this.states= new statesView();
					}
					this.states.render({el:$('.state')});
					$('.companyName').hide();
					currentForm.find("[name=utilityType]").val(templateData.utilityType);
					currentForm.find("[name=companyDropdown]").val(templateData.orgId);
					currentForm.find("[name=state]").val(templateData.state);
					//--
				} else {
					self.hideHiddenRows(currentTarget.closest("tr").next());
				}
			} else {
				if(currentTarget.data("show")){
					self.hideAllHiddenRows("thead");
					var firstRow = currentTarget.closest("table").find("tbody tr:first");

					if(firstRow && firstRow.length){
						currentTarget.closest("table").find("tbody tr:first")
						.before(newRowTemplate({row:"utilityRow0",company:templateData}));
					} else {
						currentTarget.closest("table").find("tbody").html(newRowTemplate({row:"utilityRow0",company:templateData}));
					}
					currentForm = currentTarget.closest("table").find("tbody tr:first form");
				} else {
					self.hideHiddenRows(currentTarget.closest("table").find("tbody tr:first"));
				}

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
			}

			if(currentTarget.data("show")){
				currentTarget.data("show",false);
			} 
			else{
				currentTarget.data("show",true);
			}

			/*if(currentForm){
				self.saveNewUnitFormValidation(currentForm);
			}
			$(".currency").formatCurrency({symbol:""});
			app.currencyFormatter();*/
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

		saveUtilityInformation : function(evt){
			var self=this;
			var form = $(evt.target).closest('form');
			self.saveUtilityFormValidation(form);
			if(!form.validate().form()){
				return;
			}
			var unindexed_array = form.serializeArray();
			if(!self.model){
				self.model= new utilityModel();
			}
			$.map(unindexed_array, function(n, i){
				var value=n['value'];
				var name=n['name']
				self.model.set(name,value);
			});

			self.model.set('object',self.object);
			self.model.set('objectId',self.objectId);
			self.model.set('taskKey',self.taskKey);
			self.model.set('serviceName',form.find('[name=utilityType] option:selected').text());

			if(form.find('[name=companyDropdown] option:selected').val()=='addNewCompany'){
				console.log("Need to create new company");
				self.model.set('orgId',null);
			}
			else{
				self.model.set('orgId',form.find('[name=companyDropdown] option:selected').val()); 
			}
			var postdata=self.model.attributes;

			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});

			$.ajax({
				url: app.context() + '/company/createVendorAndVendorServiceAndUtility',
				contentType: 'application/json',
				dataType: 'json',
				type: "POST",
				data: JSON.stringify(postdata),
				success: function (res) {
					console.log('Successfully create vendor and vendor service');
					$.unblockUI();
					self.render();

				},
				error: function (res) {
					console.log('Failed to create vendor and vendor service');
					$.unblockUI();
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
		showHideCompanyName: function(evt){
			var self=this;
			var selectedVal=$(evt.target);

			var companyAddressFormHtml=_.template(companyAddressForm);
			if(selectedVal.find('option:selected').val()=='addNewCompany'){
				$('.companyName').show();
				$('.companyName').find("input[name=orgName]").attr("disabled",false);
				selectedVal.closest('form').find('[name=orgName]').val('');
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
				selectedVal.closest('form').find("[name=state]").val(self.companyData.state);
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
			// self.$el.find("#addUnitsModal thead .addOrEditUtility").data("show",true);
			var row = $(evt.currentTarget).closest("tr");
			var previousRow = row.prev();
			if(previousRow.length){
				targetAction = previousRow.find(".addOrEditUtility");
			} else {
				targetAction = self.$el.find("table thead .addOrEditUtility"); // Thead
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
				self.$el.find("thead .addOrEditUtility").data("show",true);
			}
			_.each(requiredRows,function(el){
				$(el).prev().find(".addOrEditUtility").data("show",true);
				self.hideHiddenRows(el);
			});
		},
		deleteUtility: function(evt){
			var self=this;
			self.utilityId=$(evt.target).closest('tr').data('modelid');
		},
		deleteUtilityConfirmation: function(evt){
			var self=this; 
			$.ajax({
	                url: app.context()+ '/utility/archiveUtility/'+this.utilityId,
	                contentType: 'application/json',
	                dataType:'json',
	                async:false,
	                type: 'DELETE',
	                success: function(res){
	                	self.render();
	                	status=res.statusCode;
	                },
	                error: function(res){
	                	console.log("error while deleting utility");
	                }
	            });
			
			$('#deleteUtilityModal').modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
		},
		isUtilityItemSaved: function(){
			var self = this;
			if(self.propertyUtilities && self.propertyUtilities.length){
				return true;
			} else {
				return false;
			}
		},
		showError: function(arg){
			var self = this;
			if(arg='NO_UTILITY_SAVED'){
				self.$el.find(".alert.alert-danger #textValue").html("Please save atleast one utility.");
				self.$el.find(".alert.alert-danger").show().delay(2000).fadeOut(2000);
			}
		}
	});
	return utilityView;
});