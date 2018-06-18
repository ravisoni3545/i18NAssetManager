define(["text!templates/investorContactDetails.html", "backbone","app",
        "models/investorContactDetailsModel", "views/stateCodesView"],
		function(contactDetailsPage, Backbone, app, investorContactDetailsModel, stateCodesView){

	var InvestorContactView = Backbone.View.extend( {
		initialize: function(){
			var ad = this;
			this.stateCodesView = new stateCodesView();
		},

		model : new investorContactDetailsModel(),
		el:"#investorContactDetailsTab",
		self:this,
		investorId:{},
		propertyModel:{},
		events          : {
			"click #showEditContactDetails":"showEditContactDetails",
			"click #editContactDetails":"editContactDetails",
			"click #cancelEditContactDetails":"cancelEditContactDetails"
		},
		render : function () {
			var thisPtr=this;
			thisPtr.investorId = thisPtr.propertyModel.investorId;
			$.ajax({
			    url: app.context()+'investorContactDetails/getContactDetails/'+thisPtr.investorId,
			    contentType: 'application/json',
			    async:false,
			    type: 'GET',
					success: function (res) {
						thisPtr.model=res;
					},
					error   : function () {
						$('#alertFailure').show();
				        App.scrollTo($('#alertFailure'), -200);
				        $('#alertFailure').delay(2000).fadeOut(2000);
					}
				});
			this.template = _.template( contactDetailsPage );
			this.$el.html("");
			this.$el.html(this.template({contactDetails:thisPtr.model}));

			this.stateCodesView.render({el:$('#stateHome')});
			this.stateCodesView.render({el:$('#stateWork')});
			
			$('#stateHome .states').attr('name', 'stateHome').val(thisPtr.model.stateHome);
			$( '#stateWork .states').attr('name', 'stateWork').val(thisPtr.model.stateWork);
			this.contactDetailsFormValidation();
	     	App.handleUniform();
			return this;
		},
		showEditContactDetails:function(evt){
		     $(".viewaddressdetailsform1").hide();
			 $(".addressdetailsform1").show();
	     },
 	
		editContactDetails:function(){
			var self = this;
				var ContactDetailsModel=new investorContactDetailsModel();
				var unindexed_array = $('#investorContactDetailsForm').serializeArray();
				$.map(unindexed_array, function(n, i){
					var value=n['value'];
					var name=n['name'];
					ContactDetailsModel.set(name,value);
				});
				if($('#investorContactDetailsForm').validate().form()){
					ContactDetailsModel.updateContact(self.propertyModel.investorId, ContactDetailsModel,{
						success : function ( mod, res ) {
							self.render();
							$("#investorContactDetails").parent().addClass('active');
							$("#investorContactDetailsTab").addClass("active");
				    		$(".viewaddressdetailsform1").show();
				    		$(".addressdetailsform1").hide();
						},
						error   : function ( mod, res ) {
							$('#formFailure').show();
							 $('#formFailure > text').html("Error in updating contact details.");
					        App.scrollTo($('#formFailure'), -200);
					        $('#formFailure').delay(2000).fadeOut(2000);
						}
					});
				}

		 },
		 contactDetailsFormValidation:function(){
    	  	 var form1 = $('#investorContactDetailsForm');
             var error1 = $('#alertFailure', form1);
             var success1 = $('#alertSuccess', form1);
             form1.validate({
            	 errorElement: 'span', //default input error message container
                 errorClass: 'help-block', // default input error message class
                 focusInvalid: false, // do not focus the last invalid input
                 ignore: "",
                 rules: {
                	 address1Home:{
             		 	minlength:2
 	            	 },
 	            	 address2Home:{
 	            		 minlength:2
 	            	 },
 	            	 cityHome:{
 	            		minlength:2 
 	            	 },
 	            	 countryHome:{
 	             		minlength:2 
 	             	 },
 	            	 address1Work:{
 	            		 minlength:2
 	            	 },
 	            	 address2Work:{
 	            		 minlength:2
 	            	 },
 	            	 cityWork:{
 	             		minlength:2 
 	             	 },
 	             	 countryWork:{
 	            		minlength:2 
 	            	 },
 	            	 homeEmail:{
 	            		 email: true
 	            	 },
 	            	 workEmail:{
 	            		 email: true
 	            	 },
 	            	 mobilePhone:{
 	            		number: true
 	//            		phoneUS : true
 	            	 },
 	            	 homePhone:{
 	//            		 number: true
 	            	 },
 	            	 workPhone:{
 	//            		 number: true
 	            	 },
 	            	 postalcodeHome:{
 	                	 number: true
 	//                	 zipcodeUS:true
 	                 },
 	            	 postalcodeWork:{
 	                	 number: true
 	//                	 zipcodeUS:true
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
	     cancelEditContactDetails:function(evt){
	    	    this.render();
	    		$(".viewaddressdetailsform1").show();
	    		$(".addressdetailsform1").hide();
	     }
	
	});
	return InvestorContactView;
});