define(["text!templates/vendorServiceProducts.html", "backbone","app","models/vendorServiceProductModel","collections/vendorServiceProductsCollection","views/productsView"],
	function(vendorServicesProductsPage, Backbone, app, vendorServiceProductModel, vendorServiceProductsCollection, productsView){

		var VendorServiceProductsView = Backbone.View.extend( {
			initialize: function(){
				
			},
			coll: new vendorServiceProductsCollection(),
			model : new vendorServiceProductModel(),
		       
			el:"#vendorServiceProductsPortlet",
			self:this,
			
			events: {
				'click #addProductLink'   : 'openAddProductModal',
				'click #addProductButton'	:  'addVendorServiceProduct',
				'click #editProductLink'	:	'openEditProductModal',
				'click #updateProductButton'	:	'updateVendorServiceProduct',
				'click #deleteProductLink'	:	'openDeleteConfirmationModal',
				'click #deleteProductConfirmationButton'	:	'deleteVendorServiceProduct',
				'click #reloadProductLink'	:	'refreshVendorServiceProducts'
			},
	        
			deleteVendorServiceProduct : function() {
				var self=this;
				this.model.set('productId',this.productIdToBeDeleted);
				this.model.deleteVendorServiceProduct(this.productIdToBeDeleted,{
                    success : function ( model, res ) {
                    	$("#optionDeleteProduct").modal('hide');
                    	$('#optionDeleteProduct').on('hidden.bs.modal', function (e) {
                    		self.refreshVendorServiceProducts();
                    	});
                    	
                    	var success1 = $('#alertDeleteServiceProductSuccess', $('#alertsForm'));
                    	success1.show();
                    	App.scrollTo(success1, -200);
                    	success1.delay(2000).fadeOut(2000);
                    },
                    error   : function ( model, res ) {
                    	$("#optionDeleteProduct").modal('hide');
                    	$('#optionDeleteProduct').on('hidden.bs.modal', function (e) {
                    		self.refreshVendorServiceProducts();
                    	});
                    	var error1 = $('#alertDeleteServiceProductFailure', $('#alertsForm'));
   		             	error1.show();
                    	App.scrollTo(error1, -200);
                    	error1.delay(2000).fadeOut(2000);
                    }
                });
			},
			openDeleteConfirmationModal : function(evt) {
				this.productIdToBeDeleted = $(evt.target).data('recordid');
			},
			openEditProductModal : function(evt) {
				evt.preventDefault();
				var self = this;
				this.productIdToBeEdited = $(evt.target).data('recordid');
				$('#updateProductForm #productId').val(this.productIdToBeEdited);
				this.model.getVendorServiceProduct(this.productIdToBeEdited,{
                    success : function ( model, res ) {
                    	if(!self.productsView) {
        					self.productsView = new productsView();
        				}
                    	self.productsView.all=true;
        				self.productsView.setElement($('#update-product-form1 #productsList')).render($('#servicesDropdown').val());
        				
        				for(attr in res) {
	       		    		 var formElement = $('#updateProductForm [name='+attr+']');
	       		    		 if(formElement) {
	       		    			 formElement.val(res[attr]);
	       		    		 }
	       		    		if (attr == "feeAmountUsd") {
	       		    			 formElement = $('#updateProductForm [id='+attr+'_currency]');
	       		    			if(formElement) {
		       		    			 formElement.val(res[attr]);
		       		    			 $(".currency").formatCurrency({symbol:""});
		       		    		 }
	       		    		 }
      		    	 	}
        				
        				$('#productsDropdown').val(res.productId);
        				$('#productsDropdown').selectpicker('refresh');
        				
        				$('#productsDropdown').attr('disabled','disabled');
        				$('#update-product-form1').modal('show');
                    },
                    error   : function ( model, res ) {
                    	var error1 = $('#alertGetServiceProductFailure', $('#alertsForm'));
   		             	error1.show();
                    	App.scrollTo(error1, -200);
                    	error1.delay(2000).fadeOut(2000);
                    }
				});
			},
			openAddProductModal : function(evt) {
				evt.preventDefault();
				if(!this.productsView) {
					this.productsView = new productsView();
				}
				this.productsView.all=false;
				this.productsView.setElement($('#add-product-form1 #productsList')).render($('#servicesDropdown').val());
				var productsList = $('#productsDropdown');
				if(productsList.val()==null || productsList.val()=="") {
					$('#add-product-form1 #addProductButton').attr('disabled','disabled');
				}
        		$('#add-product-form1').modal('show');
			},
			updateVendorServiceProduct	:	function() {
				var self=this;
				
				var selectedServiceId = $('#servicesDropdown').val();
	        	var orgId = "";
	        	if(app.vendorCompanyModel) {
					orgId = app.vendorCompanyModel.get("orgId");
				} else {
					//Throw error saying 'Add organization first'
					/*var error1 = $('.alert-danger', $('#companyForm'));
		             	error1.show();
                	App.scrollTo(error1, -200);*/
				}
	        	
	        	//var orgId = "8b475d56-b1d9-454e-98ef-fc1f7303e006";
	        	
	        	var unindexed_array = $('#updateProductForm').serializeArray();
	    	    $.map(unindexed_array, function(n, i){
	    	    	var value=n['value'];
	    	    	var name=n['name'];
	    	    	self.model.set(name,value);
	    	    });
	    	    
	    	    this.model.set({'orgId':orgId,'serviceId':selectedServiceId,'vendorServiceProductId':this.productIdToBeEdited});
	        	
				var updateProductForm = $('#updateProductForm');
				if(updateProductForm.validate().form()) {
					this.model.updateVendorServiceProduct({
	                    success : function ( model, res ) {
	                    	$("#update-product-form1").modal('hide');
	                    	$('#update-product-form1').on('hidden.bs.modal', function (e) {
	                    		self.refreshVendorServiceProducts();
	                    	});
	                    	var success1 = $('#alertUpdateServiceProductSuccess', $('#alertsForm'));
	                    	success1.show();
	                    	App.scrollTo(success1, -200);
	                    	success1.delay(2000).fadeOut(2000);
	                    },
	                    error   : function ( model, res ) {
	                    	$("#update-product-form1").modal('hide');
	                    	$('#update-product-form1').on('hidden.bs.modal', function (e) {
	                    		self.refreshVendorServiceProducts();
	                    	});
	                    	var error1 = $('#alertUpdateServiceProductFailure', $('#alertsForm'));
	   		             	error1.show();
	                    	App.scrollTo(error1, -200);
	                    	error1.delay(2000).fadeOut(2000);
	                    }
	                });
		    	}
				
				return false;
			},
			addVendorServiceProduct  :  function() {
				var self=this;
				
				var selectedServiceId = $('#servicesDropdown').val();
	        	var orgId = "";
	        	if(app.vendorCompanyModel) {
					orgId = app.vendorCompanyModel.get("orgId");
				} else {
					//Throw error saying 'Add organization first'
					/*var error1 = $('.alert-danger', $('#companyForm'));
		             	error1.show();
                	App.scrollTo(error1, -200);*/
				}
	        	
	        	//var orgId = "8b475d56-b1d9-454e-98ef-fc1f7303e006";
	        	var unindexed_array = $('#addProductForm').serializeArray();
	    	    $.map(unindexed_array, function(n, i){
	    	    	var value=n['value'];
	    	    	var name=n['name'];
	    	    	self.model.set(name,value);
	    	    });
	        	
	        	this.model.set({'orgId':orgId,'serviceId':selectedServiceId});
	        	
				if($('#addProductForm').validate().form()) {
					this.model.addVendorServiceProduct({
	                    success : function ( model, res ) {
	                    	$("#add-product-form1").modal('hide');
	                    	$('#add-product-form1').on('hidden.bs.modal', function (e) {
	                    		self.refreshVendorServiceProducts();
	                    	});
	                    	var success1 = $('#alertAddServiceProductSuccess', $('#alertsForm'));
	                    	success1.show();
	                    	App.scrollTo(success1, -200);
	                    	success1.delay(2000).fadeOut(2000);
	                    },
	                    error   : function ( model, res ) {
	                    	$("#add-product-form1").modal('hide');
	                    	$('#add-product-form1').on('hidden.bs.modal', function (e) {
	                    		self.refreshVendorServiceProducts();
	                    	});
	                    	var error1 = $('#alertAddServiceProductFailure', $('#alertsForm'));
	   		             	error1.show();
	                    	App.scrollTo(error1, -200);
	                    	error1.delay(2000).fadeOut(2000);
	                    }
	                });
		    	}
				
		    	return false;
			},
			refreshVendorServiceProducts: function() {
				var self=this;
				var selectedServiceId = $('#servicesDropdown').val();
	        	var orgId = "";
	        	if(app.vendorCompanyModel) {
					orgId = app.vendorCompanyModel.get("orgId");
				} else {
					//Throw error saying 'Add organization first'
					/*var error1 = $('.alert-danger', $('#companyForm'));
		             	error1.show();
                	App.scrollTo(error1, -200);*/
				}
	        	
	        	//var orgId = "8b475d56-b1d9-454e-98ef-fc1f7303e006";
	        	
				this.coll.refreshRecords(new vendorServiceProductModel({'orgId':orgId,'serviceId':selectedServiceId}),
            				{
	    	                    success : function ( model, res ) {
	    	                    	$("#add-product-form1").modal('hide');
	    	                    	self.coll.reset();
	    	                    	_(res).each(function(product) {
	    	                    		self.coll.add(new vendorServiceProductModel(product));
	    	                    	});
	    	                    	self.render(self.coll);
	    	                    },
	    	                    error   : function ( model, res ) {
	    	                    	$('#productPortletBody').html('<div style="text-align: center;">Error in fetching records.</div>');
	    	                    }
    	                    });
			},
	        render : function (productsData) {
				this.template = _.template( vendorServicesProductsPage );
				this.$el.html("");
				var refresh = false;
				
				if(!productsData){
					productsData={};
					refresh = true;
				} else {
					productsData = productsData.toJSON();
					refresh = false;
				}
				
				var selectedServiceId = $('#servicesDropdown').val();
				var selectedServiceName = $('#servicesDropdown option#'+selectedServiceId).text();
				var orgId = "";
	        	if(app.vendorCompanyModel) {
					orgId = app.vendorCompanyModel.get("orgId");
				}
	        	
				this.$el.html(this.template({vendorServiceProducts:productsData,orgId:orgId,serviceId:selectedServiceId,serviceName:selectedServiceName}));
				$(".amount").formatCurrency();
				app.currencyFormatter();
				
				if(refresh) {
					this.refreshVendorServiceProducts();
				}
				
				$('body').off();
				
				ComponentsPickers.init();
				
				this.addProductFormValidation();
				this.updateProductFormValidation();
				this.handleDate();
				this.applyPermissions();
				return this;
			 },
			 applyPermissions : function() {
		    	 if($.inArray('VendorManagement', app.sessionModel.attributes.permissions)==-1) {
		    		 $('#addProductLink').remove();
		    		 $('#addProductButton').remove();
		    		 $('#updateProductButton').remove();
		    		 $('a[id=deleteProductLink]').each(function(){
		    			 $(this).remove();
		    		 });
		    	 }
		     },
			 addProductFormValidation:function(){
        	  	 var form1 = $('#addProductForm');
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
	                	 productId:{
	                    	 required: true
	                     },
	                     feeAmountUsd:{
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
	        updateProductFormValidation:function(){
       	  	 var form1 = $('#updateProductForm');
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
	                	 productId:{
	                    	 required: true
	                     },
	                     feeAmountUsd:{
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
	        handleDate:function(){
	        	$('.dateSigned').datepicker({
					rtl: App.isRTL(),
	                autoclose: true
				})
				    .on('changeDate', function(selected){
				    	$("input[name='effectiveDate']").val(' ');
				    	//$('.effectiveDate').datepicker('update', new Date(selected.date.valueOf()));
				        startDate = new Date(selected.date.valueOf());
				        startDate.setDate(startDate.getDate(new Date(selected.date.valueOf())));
				        $('.effectiveDate').datepicker('setStartDate', startDate);
				    });
				$('.effectiveDate').datepicker({
					rtl: App.isRTL(),
	                autoclose: true
				})
				    .on('changeDate', function(selected){
				    	$("input[name='expirationDate']").val(' ');
				        startDate = new Date(selected.date.valueOf());
				        startDate.setDate(startDate.getDate(new Date(selected.date.valueOf())));
				        $('.expirationDate').datepicker('setStartDate', startDate);
				    });
				$('.expirationDate').datepicker({
					rtl: App.isRTL(),
	                autoclose: true
				});
	        }
		});
		return VendorServiceProductsView;
});