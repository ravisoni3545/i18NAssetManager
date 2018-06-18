define(["text!templates/vendorInsuranceInformation.html", "backbone","models/vendorInsuranceInformationModel","app",
        "text!templates/editVendorInsuranceForm.html","jquery.form","components-dropdowns","components-pickers","jquery.blockui.min"],function(vendorInsuranceInformationPage, Backbone, vendorinsuranceinformationmodel,app,editPage){
	
	var vendorInsuranceInformationView = Backbone.View.extend( {
		 initialize: function(){
			 this.fetchStates();
			 this.fetchInsuranceType();
			},
			el:"#insuranceTab",
			insuranceToBeEdited:{},
			insuranceToBeDeleted:{},
			states:{},
			insuranceType:{},
			render : function () {
		 	 		this.template = _.template( vendorInsuranceInformationPage );
			     	this.$el.html("");
			     	data=app.homeView.vendorinsuranceinformationview.collection.models;
			     	this.$el.html(this.template({states:self.states,codes:self.insuranceType,insuranceModel:data}));
			     	$(".amount").formatCurrency();
			     	app.currencyFormatter();
			     	ComponentsDropdowns.init();
			     	ComponentsPickers.init();
			     	this.applyPermissions();
			     	this.insuranceFormValidation();
			     	return this;
		     },
		     events: {
		    	 'click #addInsurance': 'submitInsuranceForm',
				 "click a[name='showEditInsuranceForm']":"showEditInsuranceView",
				 "click a[name='DeleteInsurance']":"showDeleteInsuranceConfirmation",
				 'click #deleteInsuranceConfirmationButton':'deleteInsurance',
				 "click #editInsuranceButton":"editInsurance"
		        },
			     showDeleteInsuranceConfirmation:function(evt){
			    	 	
			    	this.insuranceToBeDeleted=$(evt.target).data('insuranceid');
			     },
		     submitInsuranceForm: function(){		    	 
		    	 var self=this;
//		    	 	if($('#licenseForm').validate().form()){
		    	 
		        	
		        	if($('#insuranceForm').validate().form()){
		        		var formField=$('#insuranceForm').find('#insuranceFiles');
			        	var fileinput =  $('#insuranceForm').find('#insuranceFiles').val();	
			        	if(!fileinput){
		   	        		formField[0].remove()
		   	        	 }
		        		
			        	$.blockUI({
				     		baseZ: 999999,
				     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				     	}
				     	);
			        	$('#insuranceForm').attr("enctype","multipart/form-data");
		    	 	 $('#insuranceForm').ajaxSubmit({
		    	        url: app.context()+"VendorInsurance/create/"+app.vendorId,
		    	        async:true,
		    	        beforeSubmit: function(){
		    	        	formField.insertAfter( "#fileLabel" );
		    	        },
		    	        success: function (res) {
		    	        	$('#insurance-form1').modal('hide');
		    	        	$('#insurance-form1').on('hidden.bs.modal', function (e) {
		    	        		self.addInsuranceRow();
	                    	});
		    	        	$.unblockUI();
		    	        },
		    	        error:function(res){
		    	        	$('#insurance-form1').modal('hide');
		    	        	$('#insurance-form1').on('hidden.bs.modal', function (e) {
		    	        		self.addInsuranceRow();
	                    	});
		    	        	$.unblockUI();
		    	        }
		    	    });
		        	}
//		    	 	}
		    	    return false;
		    	 
		     },
		     deleteInsurance:function(evt){
		    	 var self=this;
		    	 var selectedInsuranceId=this.insuranceToBeDeleted;
		    	 var insurance=this.collection.findWhere({insuranceId: selectedInsuranceId});
	        	 $.ajax({
	                 url: app.context()+'VendorInsurance/delete/'+selectedInsuranceId+"/"+insurance.attributes.tblcodeList.id+"/"+app.vendorId,
	                 contentType: 'application/json',
	                 dataType:'json',
	                 type: 'DELETE',
	                 success: function(res){
	                	 $('#optionDeleteInsurance').modal('hide'); 
	                	 $('#optionDeleteInsurance').on('hidden.bs.modal', function (e) {
	                		 self.addInsuranceRow();
	                    	});
	                	 
	                 },
	                 error: function(res){
	                     callback.error('','Failed');
	                 }
	             });
	        	
		     },
		     fetchStates:function(){
		    	 var allStatesResponseObject = $.ajax({
						type : "GET",
						url : app.context()+ "/state/all",
						async : false
					});
					allStatesResponseObject.done(function(response) {
						self.states=response;
					});
					allStatesResponseObject.fail(function(response) {
						console.log("Error in retrieving states "+response);
					});
		     },
			fetchInsuranceType:function(){
					    	 var allcodesResponseObject = $.ajax({
									type : "GET",
									url : app.context()+ "/code/all/INSURANCE_TY",
									async : false
								});
								allcodesResponseObject.done(function(response) {
									self.insuranceType=response;
								});
								allcodesResponseObject.fail(function(response) {
									console.log("Error in retrieving codes "+response);
								});
					     },
		     addInsuranceRow : function(){
		    	 	var thisPtr=this;
					        	if(app.vendorId){
		        		thisPtr.collection.fetch({
		                success: function (res) {
		                	thisPtr.render();
		                },
		                error   : function () {
	                    	$('.alert-danger').show();
	                    }
		            });
		        	}
		        	else{
		        		thisPtr.render();
		        	}

		        },
		        showEditInsuranceView:function(evt){
		        	
		        	var selectedInsuranceId=$(evt.target).data('insuranceid');
		        	console.log(this.collection);
		        	var insurance=this.collection.findWhere({insuranceId: selectedInsuranceId});
		        	console.log(insurance);
		        	$("#editInsurance").empty();
		        	var edittemplate = _.template(editPage);
		        	var states=[];
		        	var statesInModel=insurance.attributes.statesCovered;
		        	$.each(statesInModel, function( key, value ) {
		        		 states.push(statesInModel[key].state);
		        		});
		        	console.log(insurance.attributes.tblcontact);
		        	$("#editInsurance").html(edittemplate({states:self.states,codes:self.insuranceType,insuranceModel:insurance,addedState:states}));
		        	ComponentsDropdowns.init();
			     	ComponentsPickers.init();
			     	
			     	this.applyPermissions();
			     	this.editinsuranceFormValidation();
		        	$("#editInsurance").modal('show');
		        	app.currencyFormatter();
		        	$(".currency").formatCurrency({symbol:""});
		        	self.insuranceToBeEdited=selectedInsuranceId;
		        },
		        editInsurance:function(){
		        	var self=this;
		        	if($('#editInsuranceForm').validate().form()){
			        	var formField=$('#editInsuranceForm').find('#insuranceFiles');
			        	var fileinput =  $('#editInsuranceForm').find('#insuranceFiles').val();	
			        	if(!fileinput){
		   	        		formField[0].remove()
		   	        		
		   	        	 }
			        	
			        	
			        	$.blockUI({
				     		baseZ: 999999,
				     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				     	}
				     	);
			        	$('#editInsuranceForm').attr("enctype","multipart/form-data");
			    	 	 $('#editInsuranceForm').ajaxSubmit({
			    	        url: app.context()+"VendorInsurance/update/"+insuranceToBeEdited+"/"+app.vendorId,
			    	        async:true,
			    	        beforeSubmit: function(){
			    	        	formField.insertAfter( "#editfileLabel" );
			    	        	 
			    	        },
			    	        success: function (res) {
			    	        	$('#editInsurance').modal('hide');
			    	        	$('#editInsurance').on('hidden.bs.modal', function (e) {
			    	        		self.addInsuranceRow();
		                    	});
			    	        	 
			    	        	$.unblockUI();
			    	        	
			    	        },
			    	        error:function(res){
			    	        	$('#editInsurance').modal('hide');
			    	        	$('#editInsurance').on('hidden.bs.modal', function (e) {
			    	        		self.addInsuranceRow();
		                    	});
			    	        	$.unblockUI();
			    	        }
			    	    });
			    	 }
			    	    return false;
		        },
		        insuranceFormValidation:function(){
	        	  	 var form1 = $('#insuranceForm');
		             var error1 = $('.alert-danger', form1);
		             var success1 = $('.alert-success', form1);
		             $.validator.addMethod("dollarsscents", function(value, element) {
		                 return this.optional(element) || /^\d{1,8}(\.\d{0,2})?$/i.test(value);
		             }, "Maximum 8 digits and 2 decimal places allowed");
		             form1.validate({
		            	 errorElement: 'span', //default input error message container
		                 errorClass: 'help-block', // default input error message class
		                 focusInvalid: false, // do not focus the last invalid input
		                 ignore: "",
		                 rules: {
		                	 coverageAmountUsdString: {
		                		 required: true,
		                    	 number: true,
		                         dollarsscents: true
		                     },
		                     insuranceProvider: {
		                         minlength: 2,
		                         required: true
		                     },
		                     insuranceFiles:{
		                    	 required: true
		                     }
		                 },
		                 invalidHandler: function (event, validator) { //display error alert on form submit              
		                     success1.hide();
		                     error1.show();
		                     App.scrollTo(error1, -200);
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
		        editinsuranceFormValidation:function(){
	        	  	 var form1 = $('#editInsuranceForm');
		             var error1 = $('.alert-danger', form1);
		             var success1 = $('.alert-success', form1);
		             $.validator.addMethod("dollarsscents", function(value, element) {
		                 return this.optional(element) || /^\d{1,8}(\.\d{0,2})?$/i.test(value);
		             }, "Maximum 8 digits and 2 decimal places allowed");
		             form1.validate({
		            	 errorElement: 'span', //default input error message container
		                 errorClass: 'help-block', // default input error message class
		                 focusInvalid: false, // do not focus the last invalid input
		                 ignore: "",
		                 rules: {
		                	 coverageAmountUsdString: {
		                		 required: true,
		                    	 number: true,
		                         dollarsscents: true
		                     }
		                 },
		                 invalidHandler: function (event, validator) { //display error alert on form submit              
		                     success1.hide();
		                     error1.show();
		                     App.scrollTo(error1, -200);
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
		        applyPermissions : function() {
			    	 if($.inArray('VendorManagement', app.sessionModel.attributes.permissions)==-1) {
			    		 $('#addInsuranceDiv').remove();
			    		 $('#editInsuranceButton').remove();
			    		 $("a[name='DeleteInsurance']").remove();
			    	 }
			     }
	});
	return vendorInsuranceInformationView;
});