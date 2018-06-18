define(["backbone","app","text!templates/marketingFromAssetDtls.html","components-dropdowns","components-pickers","ckeditor"],
		function(Backbone,app,iniMktPage){
	var InitiateMarketingView=Backbone.View.extend({
		initialize: function(){
		 	// this.render();
		},
		 events : {
		     "click #initiateMarketingBtn":"initiateAssetMarketing"
       },
		self:this,
		el:"#initiateMarketingDiv",
		propertyModel: {},
		units: [],
		render : function () {
			console.log("reached initiateMarketingView");
			var thisPtr = this;
			thisPtr.fetchPropertyUnits();

			return this;
		},

		fetchPropertyUnits : function(){
	     	var thisPtr=this; 
	     	$.ajax({
	     		url: app.context()+'/propertyUnits/fetchForMarketing/'+thisPtr.propertyModel.objectId,
	     		contentType: 'application/json',
	     		dataType:'json',
	     		type: 'GET',
	     		async: false,
	     		success: function(res){
	     			thisPtr.units = res.propertyUnits;
	     			thisPtr.showPropertyUnits();
				},
				error: function(res){
					console.log("Fectching property units data failed");
				}
			});
		},

		showPropertyUnits: function(){
			var thisPtr = this;
			var modalTemplate = _.template(iniMktPage);
			var noOfUnits = 0;
			thisPtr.$el.html("");
			if(thisPtr.units)
				noOfUnits = thisPtr.units.length;
			thisPtr.$el.html(modalTemplate({unitsList:thisPtr.units, noOfUnits:noOfUnits}));
			ComponentsPickers.init();
			$("#initiate-marketing-for-asset-modal").modal('show');
		},
		
		initiateAssetMarketing: function() {
	     	var thisPtr = this;
	     	var postData = {};
	     	postData.assetId = thisPtr.propertyModel.assetId;
	     	postData.unitId = $("#asset-unit-id").val();
	     	$.ajax({
	                url: 'assetMarketing/initiate',
					dataType:'json',
					contentType: 'application/json',
					data: JSON.stringify(postData),
	                type: 'POST',
	                async:true,
	                success: function(res){
	                 	$("#initiate-marketing-for-asset-modal").modal("hide");
				      	setTimeout(function(){$('.modal-backdrop').remove()},500)
						$('.modal-backdrop').fadeOut(400);
			            app.router.navigate('marketing/' + res.entityId,{ trigger:true, replace: true });
	                },
	                error: function(res){
	                	$("#initiate-marketing-for-asset-modal").modal("hide");
				      	setTimeout(function(){$('.modal-backdrop').remove()},500)
						$('.modal-backdrop').fadeOut(400);
			            
	                },
	                complete: function(){
	    				
	    			}
	          });
	    }
	     
	});

	return InitiateMarketingView;
});
