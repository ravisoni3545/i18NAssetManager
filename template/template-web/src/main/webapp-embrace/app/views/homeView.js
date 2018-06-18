define(["text!templates/home.html", "backbone","app","views/vendorCompanyView",
        "views/vendorContactView","views/vendorLicenseView","collections/vendorLicensesCollection",
        "models/vendorLicenceModel","collections/contacts","views/vendorServicesView",
        "models/vendorCompanyModel","views/vendorPaymentView","models/vendorInsuranceInformationModel",
        "collections/vendorInsuranceInformationCollection","views/vendorInsuranceInformationView",
        "views/documentView","collections/documentCollection"],
		function(homePage, Backbone,app,vendorcompanyview,
				vendorcontactview,vendorlicenseview,vendorlicensescollection,
				vendorLicenceModel,contacts,vendorservicesview,
				vendorcompanymodel,vendorpaymentview,vendorinsuranceinformationmodel,
				vendorInsuranceInformationCol,vendorinsuranceinformationview,
				documentView,documentCollection){
	 var HomeView = Backbone.View.extend( {
		 initialize: function(){
		 },
		 el:"#maincontainer",
		 events          : {
	         "click #company":"showCompanyTab",
	         "click #contacts":"showContactsTab",
	         "click #services":"showServicesTab",
	         "click #licenses":"showLicensesTab",
	         "click #insurance":"showInsuranceTab",
	         "click #payment":"showPaymentTab",
	         "click #vendorDocument":"showVendorDocumentTab"
	         
	     },
	     render : function (vendorId) {
	    	 /*if(app.vendorCompanyModel) {
	    		 app.vendorCompanyModel = null;
	    	 }*/
	    	 this.template = _.template( homePage );
	     	 this.$el.html("");
	     	 this.$el.html(this.template());
	     	 
	    	 if(vendorId) {
				 this.vendorId = vendorId;
				 app.vendorUpdateFlow = true;
    	  		 app.vendorId=vendorId;
    	  		 app.vendorCompanyModel = new vendorcompanymodel();
    	  		 app.vendorCompanyModel.set("orgId",vendorId);
			 } else {
				 this.vendorId = null;
				 app.vendorUpdateFlow = false;
    	  		 app.vendorCompanyModel = null;
		     	 app.vendorId = null;
			 }
	    	 
	     	 if(app.homeView.companyView) {
	     		app.homeView.companyView.model = new vendorcompanymodel();
	     	 }
	     	 this.showCompanyTab();
	     	 return this;
	     },
	     showCompanyTab:function(){
    	  	 this.removeActiveTab();
    	  	 if(!app.homeView.companyView){
	    		 app.homeView.companyView=new vendorcompanyview();
			 }
    	  	 
    	  	 /*app.vendorId="8b475d56-b1d9-454e-98ef-fc1f7303e006";
        	 app.vendorCompanyModel = new vendorcompanymodel();
        	 app.vendorCompanyModel.set("orgId","8b475d56-b1d9-454e-98ef-fc1f7303e006");*/
    	  	 
	    	 app.homeView.companyView.setElement($('#companyTab')).render();
			 $("#company").parent().addClass('active')
			 $("#companyTab").addClass("active");	    	  
	     },
	      showContactsTab:function(){
	    	  if(!app.vendorCompanyModel) {
	    		  this.displayCompanyWarning(); 
	    		  return false; 
			  }
	    	  this.removeActiveTab();
	    	  if(!app.homeView.contactView){
	    		  app.homeView.contactView=new vendorcontactview({collection:new contacts()});
			  }
	    	  app.homeView.contactView.setElement($('#contactTab')).addRow();
	    	  $("#contacts").parent().addClass('active')
	    	  $("#contactTab").addClass("active");
	      },
	      showServicesTab:function(){
	    	  if(!app.vendorCompanyModel) {
	    		  this.displayCompanyWarning(); 
	    		  return false; 
			  }
	    	  this.removeActiveTab();
	    	  if(!app.homeView.servicesView){
	    		  app.homeView.servicesView=new vendorservicesview();
			  }
	    	  app.homeView.servicesView.setElement($('#servicesTab')).render();
	    	  $("#services").parent().addClass('active')
	    	  $("#servicesTab").addClass("active");
	      },
	      showLicensesTab:function(){
	    	  if(!app.vendorCompanyModel) {
	    		  this.displayCompanyWarning(); 
	    		  return false; 
			  }
	    	  this.removeActiveTab();
	    	  if(!app.homeView.licenseView){
	    		  app.homeView.licenseView=new vendorlicenseview({ collection : new vendorlicensescollection()});
				}
	    	  app.homeView.licenseView.setElement($('#licensesTab')).addLicenseRow();
	    	  $("#licenses").parent().addClass('active')
	    	  $("#licensesTab").addClass("active");

	      },
	      showInsuranceTab:function(){
	    	  if(!app.vendorCompanyModel) {
	    		  this.displayCompanyWarning(); 
	    		  return false; 
			  }
	    	  this.removeActiveTab();
	    	  if(!app.homeView.vendorinsuranceinformationview){
	    		  app.homeView.vendorinsuranceinformationview=new vendorinsuranceinformationview({ collection : new vendorInsuranceInformationCol()});
				}
	    	  app.homeView.vendorinsuranceinformationview.setElement($('#insuranceTab')).addInsuranceRow();
	    	  $("#insurance").parent().addClass('active')
	    	  $("#insuranceTab").addClass("active");
	    	  
	      },
	      showPaymentTab:function(){
	    	  if(!app.vendorCompanyModel) {
	    		  this.displayCompanyWarning(); 
	    		  return false; 
			  }
	    	  this.removeActiveTab();
	    	  if(!app.homeView.paymentView){
		    		 app.homeView.paymentView=new vendorpaymentview();
				 }
		    	 app.homeView.paymentView.setElement($('#paymentTab')).render();
		    	 $("#payment").parent().addClass('active')
		    	  $("#paymentTab").addClass("active");

	        
	      
	      },
	      removeActiveTab:function(){
	    	  $("li[name=vendorNav].active").removeClass("active");
	    	  $('div[name=infoTab].active').empty().removeClass("active");
	      },
	      displayCompanyWarning:function(){
	    	  $('#addCompanyWarningBox').modal('show');
	      },
	      showVendorDocumentTab:function(){
		    	 var thisPtr=this;
					var object="Vendor";
					this.removeActiveTab();
					if(app.mypropertyView && app.mypropertyView.documentView){
						app.mypropertyView.documentView.close();
						app.mypropertyView.documentView.remove();
					}
					if(app.closingView && app.closingView.documentView){
						app.closingView.documentView.close();
						app.closingView.documentView.remove();
					}
					if(app.investorProfileView && app.investorProfileView.documentView){
						app.investorProfileView.documentView.close();
						app.investorProfileView.documentView.remove();
					}
					if(app.opportunityView && app.opportunityView.documentView){
						app.opportunityView.documentView.close();
						app.opportunityView.documentView.remove();
					}
					
					if(!app.homeView.documentView){
						app.homeView.documentView=new documentView({collection: new documentCollection()});
					}
					app.homeView.documentView.object=object;
					app.homeView.documentView.objectId=app.vendorId;
					app.homeView.documentView.setElement($('#vendorDocumentTab')).fetchDocument();
					$("#vendorDocument").parent().addClass('active')
					$("#vendorDocumentTab").addClass("active");
					
					return this;
		     }
	      
	      
	 });
	 return HomeView;
});