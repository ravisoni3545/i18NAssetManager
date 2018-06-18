define(["text!templates/vendorServiceGeographies.html", "backbone","app","models/vendorServiceGeographyModel","collections/vendorServiceGeographiesCollection"
        ,"views/geographiesView"],
	function(vendorServicesGeographiesPage, Backbone, app, vendorServiceGeographyModel, vendorServiceGeographiesCollection, geographiesView){

		var VendorServiceGeographiesView = Backbone.View.extend( {
			initialize: function(){
				
			},
			coll: new vendorServiceGeographiesCollection(),
			model : new vendorServiceGeographyModel(),
		       
			el:"#vendorServiceGeographiesPortlet",
			self:this,
			
			events: {
				'click #addGeographicCoverageLink'   : 'openGeographicCoverageModal',
				'click #addGeographiesButton'	:  'addVendorServiceGeographies',
				'click #deleteGeographyLink'	:	'openDeleteConfirmationModal',
				'click #deleteGeographyConfirmationButton'	:	'deleteVendorServiceGeography',
				'click #reloadGeographicCoverageLink'	:	'refreshVendorServiceGeographies'
			},
	        
			deleteVendorServiceGeography : function() {
				var self=this;
				this.model.set('geographyId',this.geographyIdToBeDeleted);
				this.model.deleteVendorServiceGeography({
                    success : function ( model, res ) {
                    	$("#optionDeleteGeography").modal('hide');
                    	$('#optionDeleteGeography').on('hidden.bs.modal', function (e) {
                    		self.refreshVendorServiceGeographies();
                    	});
                    	
                    	var success1 = $('#alertDeleteGeographySuccess', $('#alertsForm'));
                    	success1.show();
                    	App.scrollTo(success1, -200);
                    	success1.delay(2000).fadeOut(2000);
                    },
                    error   : function ( model, res ) {
                    	$("#optionDeleteGeography").modal('hide');
                    	$('#optionDeleteGeography').on('hidden.bs.modal', function (e) {
                    		self.refreshVendorServiceGeographies();
                    	});
                    	var error1 = $('#alertDeleteGeographyFailure', $('#alertsForm'));
   		             	error1.show();
                    	App.scrollTo(error1, -200);
                    	error1.delay(2000).fadeOut(2000);
                    }
                });
			},
			openDeleteConfirmationModal : function(evt) {
				this.geographyIdToBeDeleted = $(evt.target).data('recordid');
			},
			openGeographicCoverageModal : function() {
				if(!this.geographiesView) {
					this.geographiesView = new geographiesView({'minInput':3});
				}
				this.geographiesView.setElement(this.$('#geographies')).render();
				$('#coverage-form1').modal('show');
			},
			addVendorServiceGeographies  :  function() {
				var self=this;
				var values = this.geographiesView.geographiesSelect.val();
				values = values.substring(0,values.length-1);
				if(values.indexOf('),')) {
					values = values.split('),');
				}
				if(values.length > 0) {
					$('#addGeographiesButton').removeAttr('disabled');
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
		        	
		        	this.coll.reset();
					for(var i=0; i<values.length; i++) {
						var geographies = values[i].split('('); 
						this.coll.add(new vendorServiceGeographyModel({'orgId':orgId,'serviceId':selectedServiceId,'geographyName':geographies[0].trim(),'geographyType':geographies[1].trim()}));
					}
					this.coll.addVendorServiceGeographies({
	                    success : function ( model, res ) {
	                    	$("#coverage-form1").modal('hide');
	                    	$('#coverage-form1').on('hidden.bs.modal', function (e) {
	                    		self.refreshVendorServiceGeographies();
	                    	});
	                    	var success1 = $('#alertAddServiceGeographySuccess', $('#alertsForm'));
	                    	success1.show();
	                    	App.scrollTo(success1, -200);
	                    	success1.delay(2000).fadeOut(2000);
	                    },
	                    error   : function ( model, res ) {
	                    	$("#coverage-form1").modal('hide');
	                    	$('#coverage-form1').on('hidden.bs.modal', function (e) {
	                    		self.refreshVendorServiceGeographies();
	                    	});
	                    	var error1 = $('#alertAddServiceGeographyFailure', $('#alertsForm'));
	   		             	error1.show();
	                    	App.scrollTo(error1, -200);
	                    	error1.delay(2000).fadeOut(2000);
	                    }
	                });
				} else {
					$('#geographiesList').toggle( "highlight" );
					$('#addGeographiesButton').attr('disabled','disabled');
				}
			},
			refreshVendorServiceGeographies: function() {
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
	        	
				this.coll.refreshRecords(new vendorServiceGeographyModel({'orgId':orgId,'serviceId':selectedServiceId}),
            				{
	    	                    success : function ( model, res ) {
	    	                    	$("#coverage-form1").modal('hide');
	    	                    	self.coll.reset();
	    	                    	_(res.vendorServiceGeographies).each(function(geography) {
	    	                    		self.coll.add(new vendorServiceGeographyModel(geography));
	    	                    	});
	    	                    	self.render(self.coll);
	    	                    },
	    	                    error   : function ( model, res ) {
	    	                    	$('#geographyPortletBody').html('<div style="text-align: center;">Error in fetching records.</div>');
	    	                    }
    	                    });
			},
	        render : function (geographiesData) {
				this.template = _.template( vendorServicesGeographiesPage );
				this.$el.html("");
				var refresh = false;
				
				if(!geographiesData){
					geographiesData={};
					refresh = true;
				} else {
					geographiesData = geographiesData.toJSON();
					refresh = false;
				}
				
				this.$el.html(this.template({vendorServiceGeographies:geographiesData}));
				
				if(refresh) {
					this.refreshVendorServiceGeographies();
				}
				$('body').off();
				this.applyPermissions();
				return this;
			 },
			 applyPermissions : function() {
		    	 if($.inArray('VendorManagement', app.sessionModel.attributes.permissions)==-1) {
		    		 $('#addGeographicCoverageLink').remove();
		    		 $('#addGeographiesButton').remove();
		    		 $('a[id=deleteGeographyLink]').each(function(){
		    			 $(this).remove();
		    		 });
		    	 }
		     }
		});
		return VendorServiceGeographiesView;
});