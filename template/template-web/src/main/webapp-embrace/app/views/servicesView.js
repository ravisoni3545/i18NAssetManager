define(["text!templates/services.html", "backbone","app","models/serviceModel","collections/servicesCollection"],
		function(servicesTemplate, Backbone,app,serviceModel,services){
	
	var servicesView = Backbone.View.extend( {
		initialize: function() {
			
		},
		el:"#servicesList",
		populateView: function() {
			var selectedServicesList = new services(null, { view: this } );
			var availableServicesList = new services(null, { view: this } );
			var orgId = "";
			if(app.vendorCompanyModel) {
				orgId = app.vendorCompanyModel.get("orgId");
			}
			
			//orgId = "8b475d56-b1d9-454e-98ef-fc1f7303e006";
			
			var allServicesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/vendor/service/all/"+orgId,
				async : false
			});
			allServicesResponseObject.done(function(response) {
				_.each(response.selectedServices, function(service){
					selectedServicesList.add(new serviceModel (service));
				});
				_.each(response.availableServices, function(service){
					availableServicesList.add(new serviceModel (service));
				});
			});
			allServicesResponseObject.fail(function(response) {
				console.log("Error in retrieving services "+response);
			});
			this.selectedServicesList = selectedServicesList;
			this.availableServicesList = availableServicesList;
		},
		render : function (el) {
			this.populateView();
			if(el) {
				this.$el = el.el;
			}
			this.template = _.template( servicesTemplate, { services: {selectedServices:this.selectedServicesList.toJSON(),
								availableServices:this.availableServicesList.toJSON()} });
			this.$el.html("");
			this.$el.html(this.template);
			
			$('#servicesDropdown').selectpicker({
		    	iconBase: 'fa',
		        tickIcon: 'fa-check'
		    });
	     	return this;
		},
	});
	return servicesView;
});