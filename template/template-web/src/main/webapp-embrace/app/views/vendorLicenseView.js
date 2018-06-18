define(["text!templates/vendorLicense.html", 
        "backbone","app","models/vendorLicenceModel","text!templates/editVendorLicenseForm.html","jquery.form","components-dropdowns","components-pickers","jquery.blockui.min"],
		function(licensePage, Backbone,app,vendorlicensemodel,editPage){
	var VendorLicenseView = Backbone.View.extend( {
		 initialize: function(){
			 this.fetchStates();
			 this.fetchLicenseType();
			},
			el:"#licensesTab",
			self:this,
			collection:null,
			models:{},
			 model:{},
			 licenseToBeEdited:{},
			 licenseToBeDeleted:{},
			 states:{},
			 licenseType:{},
			 events : {
				 "click #addLicense":"addVendorLicense",
				 "click a[name='showEditLicenseForm']":"showEditLicenseView",
				 "click a[name='DeleteLicense']":"showDeleteLicenseConfirmation",
				 "click #editLicenseButton":"editLicense",
				 'click #deleteLicenseConfirmationButton':'deleteLicense',
				 "change #insuranceFiles":"verifyFile"
		     },
			render : function () {
		 	 		this.template = _.template(licensePage);
			     	this.$el.html("");
			     	data=app.homeView.licenseView.collection.models;
			     	console.log(app.homeView.licenseView.collection.models);
					if(data==null){
						data="";
					}
			     	this.$el.html(this.template({states:self.states,codes:self.licenseType,licenseModel:data}));
			     	$(".amount").formatCurrency();
			     	ComponentsDropdowns.init();
			     	ComponentsPickers.init();
			     	this.applyPermissions();
			     	this.licenseFormValidation();
			     	return this;
		     },
		     showDeleteLicenseConfirmation:function(evt){
		    	 this.licenseToBeDeleted=$(evt.target).data('licenseid');
		     },
		     deleteLicense:function(evt){
		    	 var self=this;
		    	 var selectedLicenseId=this.licenseToBeDeleted;
		    	 var license=this.collection.findWhere({licenseId: selectedLicenseId});
	        	 $.ajax({
	                 url: app.context()+'vendorLicense/delete/'+selectedLicenseId+"/"+license.attributes.licenseType.id+"/"+app.vendorId,
	                 contentType: 'application/json',
	                 dataType:'json',
	                 async : true,
	                 type: 'DELETE',
	                 success: function(res){
	                	 $('#optionDeleteLicense').modal('hide'); 
	                	 $('#optionDeleteLicense').on('hidden.bs.modal', function (e) {
	                		 self.addLicenseRow();
	                    	});
	                	 
	                 },
	                 error: function(res){
	                     callback.error('','Failed');
	                 }
	             });
	        	
		     },
		     addVendorLicense:function(){
		    	 	var self=this;
		    	 	if($('#licenseForm').validate().form()){
		    	 		
			        	$.blockUI({
				     		baseZ: 999999,
				     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				     	}
				     	);
			        	$('#licenseForm').attr("enctype","multipart/form-data");
		    	 	 $('#licenseForm').ajaxSubmit({
		    	        url: app.context()+"vendorLicense/create/"+app.vendorId,
		    	        async:true,
		    	        beforeSubmit: function(){

		    	        },
		    	        success: function (res) {
		    	        	$('#licenses-form1').modal('hide');
		    	        	$('#licenses-form1').on('hidden.bs.modal', function (e) {
		    	        		self.addLicenseRow();
	                    	});
		    	        	$.unblockUI();
		    	           
		    	        },
		    	        error:function(res){
		    	        	$('#licenses-form1').modal('hide');
		    	        	$('#licenses-form1').on('hidden.bs.modal', function (e) {
		    	        		self.addLicenseRow();
	                    	});
		    	        	$.unblockUI();
		    	        }
		    	    });
		    	 	}
		    	    return false;
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
			fetchLicenseType:function(){
					    	 var allcodesResponseObject = $.ajax({
									type : "GET",
									url : app.context()+ "/code/all/LICENSE_TYPE",
									async : false
								});
								allcodesResponseObject.done(function(response) {
									self.licenseType=response;
								});
								allcodesResponseObject.fail(function(response) {
									console.log("Error in retrieving codes "+response);
								});
					     },
		     addLicenseRow : function(){
		    	 	var thisPtr=this;
//		        	if(app.vendorId){
		        		thisPtr.collection.fetch({
		                success: function (res) {
		                	thisPtr.render();
		                },
		                error   : function () {
	                    	$('.alert-danger').show();
	                    }
		            });
		        	/*}
		        	else{
		        		thisPtr.render();
		        	}*/

		        },
		        showEditLicenseView:function(evt){
		        	var selectedLicenseId=$(evt.target).data('licenseid');
		        	var license=this.collection.findWhere({licenseId: selectedLicenseId});
		        	$("#editLicense").empty();
		        	var edittemplate = _.template(editPage);
		        	var states=[];
		        	var statesInModel=license.attributes.statesCovered;
		        	$.each(statesInModel, function( key, value ) {
		        		 states.push(statesInModel[key].state);
		        		});
		        	$("#editLicense").html(edittemplate({states:self.states,codes:self.licenseType,licenseModel:license,addedState:states}));
		        	ComponentsDropdowns.init();
			     	ComponentsPickers.init();
			     	this.applyPermissions();
		        	$("#editLicense").modal('show');
		        	self.licenseToBeEdited=selectedLicenseId;
		        },
		        licenseFormValidation:function(){
	        	  	 var form1 = $('#licenseForm');
		             var error1 = $('.alert-danger', form1);
		             var success1 = $('.alert-success', form1);
		             form1.validate({
		            	 errorElement: 'span', //default input error message container
		                 errorClass: 'help-block', // default input error message class
		                 focusInvalid: false, // do not focus the last invalid input
		                 ignore: "",
		                 rules: {
		                	 licenseName: {
		                         minlength: 2,
		                         required: true
		                     },
		                     licenseNumber: {
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
		        editLicense:function(){
		        	var self=this;
		        	var formField=$('#editlicenseForm').find('#insuranceFiles');
		        	var fileinput =  $('#editlicenseForm').find('#insuranceFiles').val();
	   	        	 if(!fileinput){
	   	        		formField[0].remove()
	   	        	 }
		        	$.blockUI({
			     		baseZ: 999999,
			     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			     	}
			     	);
		        	$('#editlicenseForm').attr("enctype","multipart/form-data");
		        	$('#editlicenseForm').ajaxSubmit({
		    	        url:app.context()+ "vendorLicense/update/"+licenseToBeEdited+"/"+app.vendorId,
		    	        async:true,
		    	        type:"POST",
		    	        beforeSubmit: function(){
		    	        	formField.insertAfter( "#fileLabel" );
		    	        },
		    	        success: function (res) {
		    	        	$('#editLicense').modal('hide');
		    	        	$('#editLicense').on('hidden.bs.modal', function (e) {
		    	        		self.addLicenseRow();
	                    	});
		    	        	$.unblockUI();
		    	        },
		    	        error:function(res){
		    	        	$('#editLicense').modal('hide');
		    	        	$('#editLicense').on('hidden.bs.modal', function (e) {
		    	        		self.addLicenseRow();
	                    	});
		    	        	$.unblockUI();
		    	        }
		        	});
		        },
		        verifyFile:function(evt){
		        },
		        applyPermissions : function() {
			    	 if($.inArray('VendorManagement', app.sessionModel.attributes.permissions)==-1) {
			    		 $('#addLicenseDiv').remove();
			    		 $('#editLicenseButton').remove();
			    		 $("a[name='DeleteLicense']").remove();
			    	 }
			     }

		     
		     

	});
	return VendorLicenseView;
});
