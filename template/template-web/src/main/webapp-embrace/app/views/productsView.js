define(["text!templates/products.html", "backbone","app","models/productModel","collections/productsCollection","text!templates/searchProducts.html"],
		function(productsTemplate, Backbone,app,productModel,products,productsSearchTemplate){
	
	var productsView = Backbone.View.extend( {
		initialize: function() {
			this.serviceId = null;
		},
		all:true,
		el:"#productsList",
		populateView: function() {
			var productList = new products(null, { view: this } );
			var orgId = "";
			if(app.vendorCompanyModel) {
				orgId = app.vendorCompanyModel.get("orgId");
			}
			
			//orgId = "8b475d56-b1d9-454e-98ef-fc1f7303e006";
			if(this.all){
				orgId="";
			}
			
			var allProductsResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/vendor/product/all/"+this.serviceId+"/"+orgId,
				async : false
			});
			allProductsResponseObject.done(function(response) {
				_.each(response, function(product){
					productList.add(new productModel (product));
				});
			});
			allProductsResponseObject.fail(function(response) {
				console.log("Error in retrieving products "+response);
			});
			this.productsList = productList;
		},
		render : function (serviceId) {
			if(serviceId) {
				this.serviceId = serviceId;
			}
			this.populateView();
			this.template = _.template( productsTemplate, { productList: this.productsList.toJSON() });
			this.$el.html("");
			this.$el.html(this.template);
			
			$('#productsDropdown').selectpicker({
		    	iconBase: 'fa',
		        tickIcon: 'fa-check'
		    });
	     	return this;
		},
		
		renderForSearch : function (serviceId) {
			if(serviceId) {
				this.serviceId = serviceId;
			}
						
			this.populateView();
			var prodList=this.productsList.toJSON();
			if(serviceId===""){
				prodList=[];
			}
			this.template = _.template( productsSearchTemplate, { productList:prodList });
			this.$el.html("");
			this.$el.html(this.template);

			return this;
		}
		
	});
	return productsView;
});