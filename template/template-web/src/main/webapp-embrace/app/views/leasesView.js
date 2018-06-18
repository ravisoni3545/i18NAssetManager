define(["backbone","app","text!templates/leases.html","text!templates/editLease.html",
        "collections/propertyUnitCollection","text!templates/propertyUnitDropdown.html",
        "views/codesView","components-dropdowns","components-pickers"],
		function(Backbone,app,leasesPage,editLeasePage,propertyUnitCollection,propertyUnitDropdown,codesView){
	var LeasesView=Backbone.View.extend({
		initialize: function(){
			this.fetchStates();
			this.leaseStatusTypes = new codesView({codeGroup:'LEASE_STATUS'});
		},
		 events : {
			 "click #addLease":"addLease",
			 "click a[name='editLease']":"showEditLeaseModal",
		     "click #editLease":"editLease",
		     "click a[href=#lease-form1]":"showAddLeaseModal",
		     "click a[name='deleteLease']":"showDeleteLeaseModal",
		     "click #deleteLeaseConfirmationButton":"deleteLease",
		     
	     },
		self:this,
		el:"#leasesTab",
		propertyModel:{},
		leaseIdToBeDeleted:{},
		states:{},
		render : function () {
			var thisPtr = this;
			thisPtr.template = _.template(leasesPage);
			thisPtr.$el.html("");
			var templateData=thisPtr.collection.toJSON();
			console.log("Data is");
			console.log(templateData);
			this.$el.html(this.template({states:self.states,templateData:templateData}));
			this.loadAddPropertyUnits(thisPtr.$el.find("#lease-form1"));
			this.leaseStatusTypes.render({el:$('#leaseStatusDropdown'),codeParamName:"statusId"});
			this.applyPermissions();
			$('#leaseDataTableMain').dataTable({
				"bFilter":false,
				"deferRender": true,
				"aoColumnDefs": [
				            	   {"aTargets": [ 5 ], "bSortable": false},
				            	   {"aTargets": [ 6 ], "bSortable": false},
				            	   {"aTargets": [ 9 ], "bSortable": false}
				            	]
		});
            $('select[name=leaseDataTableMain_length]').addClass('form-control');


            ComponentsDropdowns.init();
	     	ComponentsPickers.init();
	     	$(".amount").formatCurrency();
	     	app.currencyFormatter();
	     	this.leaseFormValidation();
            $('.hopNameTooltip').tooltip({
                animated: 'fade',
                placement: 'left'
            });
			return this;
		},
		
		showDeleteLeaseModal:function(evt){
			this.leaseIdToBeDeleted=$(evt.currentTarget).attr('leaseId');
			$('#optionDeleteLase').modal("show");
		},
		deleteLease:function(){
			var self=this;
			 $.ajax({
	                url: app.context()+'leases/deleteLease/'+this.leaseIdToBeDeleted,
	                contentType: 'application/json',
	                dataType:'text',
	                type: 'DELETE',
	                success: function(res){
	                	$("#optionDeleteLase").modal('hide');
	                	$('#optionDeleteLase').on('hidden.bs.modal',function() {
							self.fetchLeases();
						});
	                },
	                error: function(res){
	                   alert(res.message);
	                   $("#optionDeleteLase").modal('hide');
	                }
	            });
		},
		showAddLeaseModal:function(evt){
			var thisPtr = this;
			this.loadAddPropertyUnits(thisPtr.$el.find("#lease-form1"));
		},
		showEditLeaseModal:function(evt){
			var thisPtr=this;
			var clickedLeaseId=$(evt.currentTarget).attr('leaseId');
			this.leaseIdToBedited=clickedLeaseId;
			var clickedleaseModel=this.collection.findWhere({leaseId: clickedLeaseId});
			console.log(clickedleaseModel.toJSON());
			var editTemplate = _.template(editLeasePage);
			$("#editLeaseDiv").empty();
			$("#editLeaseDiv").html(editTemplate({states:self.states,leaseModel:clickedleaseModel.toJSON()}));
			this.loadAddPropertyUnits(thisPtr.$el.find("#editLeaseModal"),clickedleaseModel.toJSON().unitId);
			this.leaseStatusTypes.callback = function() {
				$("#editleaseStatusDropdown [name=statusId]").val(clickedleaseModel.toJSON().statusId);
			}
			this.leaseStatusTypes.render({el:$('#editleaseStatusDropdown'),codeParamName:"statusId"});
			$("#editleaseStatusDropdown [name=statusId]").val(clickedleaseModel.toJSON().statusId);
			app.currencyFormatter();
			$(".currency").formatCurrency({symbol:""});
			this.applyPermissions();
			ComponentsDropdowns.init();
	     	ComponentsPickers.init();
			this.editFormValidation();
			$("#editLeaseModal").modal('show');
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
	     addLease:function(){
	    	 	var self=this;
	    	 	var obj={};
	    	 	var assetId=this.propertyModel.get("assetId");
	    	    var unindexed_array = $('#leaseForm').serializeArray();
	    	    $.map(unindexed_array, function(n, i){
	    	    	var value=n['value'];
	    	    	var name=n['name'];
	    	    	obj[name]=value;
	    	    });
	    	    if($('#leaseForm').validate().form()){
		    	    $.ajax({
		                url: app.context()+'leases/createLease/'+assetId,
		                contentType: 'application/json',
		                dataType:'text',
		                type: 'POST',
		                data: JSON.stringify(obj),
		                success: function(res){
		                	$("#lease-form1").modal('hide');
		                	$('#lease-form1').on('hidden.bs.modal',function() {
	 							self.fetchLeases();
	 						});
		                },
		                error: function(res){
		                   alert(res.message);
		                   $("#lease-form1").modal('hide');
		                }
		            });
	     		}
	    	    
	     },
	     editLease:function(){
	    	 var self=this;
	    	 	var obj={};
	    	    var unindexed_array = $('#editleaseForm').serializeArray();
	    	    $.map(unindexed_array, function(n, i){
	    	    	var value=n['value'];
	    	    	var name=n['name'];
	    	    	obj[name]=value;
	    	    });
	    	    if($('#editleaseForm').validate().form()){
	    	    	 $.ajax({
			                url: app.context()+'leases/editLease/'+self.leaseIdToBedited,
			                contentType: 'application/json',
			                dataType:'text',
			                type: 'POST',
			                data: JSON.stringify(obj),
			                success: function(res){
			                	$("#editLeaseModal").modal('hide');
			                	$('#editLeaseModal').on('hidden.bs.modal',function() {
		 							self.fetchLeases();
		 						});
			                },
			                error: function(res){
			                   alert(res.message);
			                   $("#lease-form1").modal('hide');
			                }
			            });
	    	    }
	     },
	     leaseFormValidation:function(){
    	  	 var form1 = $('#leaseForm');
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
                	 tenantName:{
                		 required: true,
                		 minlength: 2
                	 },
                	 address:{
                		 
                		 minlength: 2
                	 },
                	 phone:{
                         phoneUS: true
                	 },
                	 email:{
                		 email: true
                	 },
                	 monthlyRent: {
                    	 number: true,
                         dollarsscents: true
                     },
                     securityDeposit:{
                    	 number: true,
                         dollarsscents: true
                     },
                     postalCode:{
                    	 number: true,
                    	 zipcodeUS:true
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
        editFormValidation:function(){
   	  	 var form1 = $('#editleaseForm');
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
               	 tenantName:{
               		 required: true,
               		 minlength: 2
               	 },
               	 address:{
               		 
               		 minlength: 2
               	 },
               	 phone:{
                        phoneUS: true
               	 },
               	 email:{
               		 email: true
               	 },
               	 monthlyRent: {
                   	 number: true,
                        dollarsscents: true
                    },
                    securityDeposit:{
                   	 number: true,
                        dollarsscents: true
                    },
                    postalCode:{
                   	 number: true,
                   	 zipcodeUS:true
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
        fetchLeases : function(){
    	 	var thisPtr=this;
    	 	thisPtr.collection.assetId=this.propertyModel.get("assetId");
//        	if(app.vendorId){
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
        handleDate:function(){
        	$('.startDate').datepicker({
				rtl: App.isRTL(),
                autoclose: true,
                defaultDate: null,
                todayHighlight:false
			})
			    .on('changeDate', function(selected){
			        startDate = new Date(selected.date.valueOf());
			        startDate.setDate(startDate.getDate(new Date(selected.date.valueOf())));
			        $('.endDate').datepicker('setStartDate', startDate);
			        $('.moveInDate').datepicker('setStartDate', startDate);
			    });
			$('.endDate').datepicker({
				rtl: App.isRTL(),
                autoclose: true,
                defaultDate: null,
                todayHighlight:false
			})
			    .on('changeDate', function(selected){
			        startDate = new Date(selected.date.valueOf());
			        startDate.setDate(startDate.getDate(new Date(selected.date.valueOf())));
			        $('.moveInDate').datepicker('setEndDate', startDate);
			    });
			$('.moveInDate').datepicker({
				rtl: App.isRTL(),
                autoclose: true,
                defaultDate: null
			});
			$('.moveOutDate').datepicker({
				rtl: App.isRTL(),
                autoclose: true,
                defaultDate: null
			});
        },
        applyPermissions : function() {
	    	 if($.inArray('AssetManagement', app.sessionModel.attributes.permissions)==-1) {
	    		 $('#showAddLeaseModal').remove();
	    		 $('#editLease').remove();
	    		 $("a[name='deleteLease']").remove();
	    	 }
	     },
	     
	     loadAddPropertyUnits: function(modalObject,unitId) {
	    	var self = this;
	    	unitId = unitId || "";
			if(!app.mypropertyView.leasesView.propertyUnitCollection){
				app.mypropertyView.leasesView.propertyUnitCollection = new propertyUnitCollection();
			}
			app.mypropertyView.leasesView.propertyUnitCollection.investmentId = app.mypropertyView.leasesView.propertyModel.attributes.investmentID;
			
			app.mypropertyView.leasesView.propertyUnitCollection.fetch({
	    		success:function(data){
	    			self.propertyUnits = data.propertyUnits;
	    			modalObject.find('#unitDropdown').html(_.template( propertyUnitDropdown )({units:self.propertyUnits,fieldName:"unitId"}));
	    			modalObject.find('#unitDropdown select[name=unitId]').val(unitId);
	    		},
	    		error:function(){
	    			console.log("fetch Error");
	    		}
	    	});
		  }
	});
	return LeasesView;
});