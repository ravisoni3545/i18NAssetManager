define(["text!templates/vendorService.html", "backbone","app","models/vendorServiceModel","collections/vendorServicesCollection"
        ,"views/servicesView","views/vendorServiceGeographiesView","views/vendorServiceContractsView","views/vendorServiceProductsView"],
	function(servicesPage, Backbone, app, vendorServiceModel, vendorServicesCollection, servicesView, vendorServiceGeographiesView, vendorServiceContractsView, vendorServiceProductsView){

		var VendorServicesView = Backbone.View.extend( {
			initialize: function(){
				this.servicesView = new servicesView();
			},
			coll: new vendorServicesCollection(),
			model : new vendorServiceModel(),
		       
			el:"#servicesTab",
			self:this,
			
			events: {
				'click #addServiceButton'   : 'associateServiceWithVendor',
				'click #deleteServiceConfirmationButton'   : 'deleteServiceFromVendor',
				'change #servicesDropdown'  : 'populateViewUsingSelectedService'
			},
	        
			associateServiceWithVendor : function(evt) {
				evt.preventDefault();
	        	var selectedServiceId = $('#servicesDropdown').val();
	        	var orgId = "";
	        	if(!app.vendorServiceModel){
	    			app.vendorServiceModel=this.model;
	    		}
	        	if(!app.vendorServiceView){
	    			app.vendorServiceView=this;
	    		}
	        	if(app.vendorCompanyModel) {
					orgId = app.vendorCompanyModel.get("orgId");
				} else {
					//Throw error saying 'Add organization first'
					/*var error1 = $('.alert-danger', $('#companyForm'));
		             	error1.show();
                	App.scrollTo(error1, -200);*/
				}
	        	
	        	//var orgId = "8b475d56-b1d9-454e-98ef-fc1f7303e006";
	        	
	        	this.model.set('orgId',orgId);
	        	this.model.set('serviceId',selectedServiceId);
	        	this.model.unset('vendorServiceId');
	        	this.model.addVendorService({
                    success : function ( model, res ) {
                    	app.vendorServiceModel.set("vendorServiceId",res.vendorServiceId);
                    	
                    	app.vendorServiceView.servicesView.render({el:$('#servicesList')});
                    	var text = $("#servicesDropdown option[value='"+res.serviceId+"']").text();
                    	$('.bootstrap-select .filter-option').text(text);
                    	$('#servicesDropdown').val(res.serviceId);
                    	app.vendorServiceView.populateViewUsingSelectedService();
                    	
                    	var success1 = $('#alertAddServiceSuccess', $('#alertsForm'));
                    	success1.show();
                    	App.scrollTo(success1, -200);
                    	success1.delay(2000).fadeOut(2000);
                    },
                    error   : function ( model, res ) {
                    	var error1 = $('#alertAddServiceFailure', $('#alertsForm'));
   		             	error1.show();
                    	App.scrollTo(error1, -200);
                    	error1.delay(2000).fadeOut(2000);
                    }
                });
			},
			deleteServiceFromVendor : function() {
				var selectedServiceId = $('#servicesDropdown').val();
	        	var orgId = "";
	        	if(!app.vendorServiceModel){
	    			app.vendorServiceModel=this.model;
	    		}
	        	if(!app.vendorServiceView){
	    			app.vendorServiceView=this;
	    		}
	        	if(app.vendorCompanyModel) {
					orgId = app.vendorCompanyModel.get("orgId");
				} else {
					console.error('orgId not found');
				}
	        	
	        	//var orgId = "8b475d56-b1d9-454e-98ef-fc1f7303e006";
	        	
	        	this.model.set('orgId',orgId);
	        	this.model.set('serviceId',selectedServiceId);
	        	this.model.unset('vendorServiceId');
	        	this.model.deleteVendorService({
                    success : function ( model, res ) {
                    	$("#optionDeleteService").modal('hide');
                    	app.vendorServiceView.servicesView.render({el:$('#servicesList')});
                    	var text = $("#servicesDropdown option[value='"+selectedServiceId+"']").text();
                    	$('.bootstrap-select .filter-option').text(text);
                    	$('#servicesDropdown').val(selectedServiceId);
                    	app.vendorServiceView.populateViewUsingSelectedService();
                    	
                    	var success1 = $('#alertDeleteServiceSuccess', $('#alertsForm'));
                    	success1.show();
                    	App.scrollTo(success1, -200);
                    	success1.delay(2000).fadeOut(2000);
                    },
                    error   : function ( model, res ) {
                    	$("#optionDeleteService").modal('hide');
                    	var error1 = $('#alertDeleteServiceFailure', $('#alertsForm'));
   		             	error1.show();
                    	App.scrollTo(error1, -200);
                    	error1.delay(2000).fadeOut(2000);
                    }
                });
			},
			populateViewUsingSelectedService : function() {
				var selectedServiceId = $('#servicesDropdown').val();
				var selectedServiceType = $('#'+selectedServiceId).attr('type');
				if(selectedServiceType == 'selected') {
					$('#addServiceButton').hide();
					$('#deleteServiceButton').show();
					$('#vendorServiceDetailsPanel').show();
					//Show refresh icon in each portlet here
					this.renderVendorServiceGeographiesView();
					this.renderVendorServiceContractsView();
					this.renderVendorServiceProductsView();
				} else if(selectedServiceType == 'available') {
					$('#addServiceButton').show();
					$('#deleteServiceButton').hide();
					$('#vendorServiceDetailsPanel').hide();
				}
			},
			renderVendorServiceProductsView	: function() {
				if(!this.vendorServiceProductsView) {
					this.vendorServiceProductsView = new vendorServiceProductsView();
				}
				this.vendorServiceProductsView.setElement(this.$('#vendorServiceProductsPortlet')).render();
			},
			renderVendorServiceContractsView : function() {
				if(!this.vendorServiceContractsView) {
					this.vendorServiceContractsView = new vendorServiceContractsView();
				}
				this.vendorServiceContractsView.setElement(this.$('#vendorServiceContractsPortlet')).render();
			},
			renderVendorServiceGeographiesView : function() {
				if(!this.vendorServiceGeographiesView) {
					this.vendorServiceGeographiesView = new vendorServiceGeographiesView();
				}
				this.vendorServiceGeographiesView.setElement(this.$('#vendorServiceGeographiesPortlet')).render();
			},
			render : function (data) {
			
				this.template = _.template( servicesPage );
				this.$el.html("");
				
				if(data==null){
					data="";
				}
				this.$el.html(this.template({test:data}));
				$('#select02_sample02').select2({
		            allowClear: true
		        });
				this.servicesView.render({el:$('#servicesList')});
				this.populateViewUsingSelectedService();
				this.applyPermissions();
				
				return this;
			 },
		     applyPermissions : function() {
		    	 if($.inArray('VendorManagement', app.sessionModel.attributes.permissions)==-1) {
		    		 $('#addServiceButton').remove();
		    		 $('#deleteServiceButton').remove();
		    	 }
		     }
		});
		return VendorServicesView;
});