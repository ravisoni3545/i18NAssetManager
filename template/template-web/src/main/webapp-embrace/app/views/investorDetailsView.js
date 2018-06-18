define(["text!templates/investorDetails.html", "backbone","app",
        "models/investorDetailsModel", "views/stateCodesView"],
		function(investorDetailsPage, Backbone, app, investorDetailsModel, stateCodesView){

	var InvestorDetailsView = Backbone.View.extend( {
		initialize: function(){
//			var ad = this;
			this.stateCodesView = new stateCodesView();
		},

		model : new investorDetailsModel(),
		el:"#investorDetailsTab",
		self:this,
		investorId:{},
		propertyModel:{},
		events : {
			"click #resetInvPassword":"resetPassword",
			"click #showEditInvestorDetails":"showEditInvestorDetails",
			"click #deActivate":"deActivate",
			"click #activate":"activate",
			"click #showEditInvestorDetails":"showEditInvestorDetails",
			"click #editInvestorDetails":"editInvestorDetails",
			"click #cancelEditInvestorDetails":"cancelEditInvestorDetails"
		},
		render : function () {
			var thisPtr=this;
			thisPtr.investorId = thisPtr.propertyModel.investorId;
			
			$.ajax({
			    url: app.context()+'investorDetails/getInvestorDetails/'+thisPtr.investorId,
			    contentType: 'application/json',
			    async:false,
			    type: 'GET',
					success: function (res) {
						thisPtr.data=res;
					},
					error   : function () {
						$('#alertFailure').show();
					}
				});
			this.template = _.template( investorDetailsPage );
			if(!this.solutionSpecialistUsers){
	    		 this.fetchSolutionSpecialistUsers();
			 }
			this.$el.html("");
			this.$el.html(this.template({investorDetails:thisPtr.data,solutionSpecialists:this.solutionSpecialistUsers}));
			
			this.stateCodesView.render({el:$('#stateHome')});
			this.stateCodesView.render({el:$('#stateWork')});
			
			$('#stateHome .states').attr('name', 'stateHome').val(thisPtr.data.stateHome);
			$( '#stateWork .states').attr('name', 'stateWork').val(thisPtr.data.stateWork);
			$("#CreateDate").html("Create Date : " + thisPtr.data.dateCreated);
			this.formInvestorDetailsValidation();
	     	ComponentsPickers.init();
	     	App.handleUniform();
			return this;
		},
		resetPassword:function(event){
			var emailId=$(event.currentTarget).data('id');
//			var postData = [];
//			postData.push(emailId.trim());
			var postData = emailId.trim();
			$.ajax({
			    url: app.context()+'investors/resetPassword',
			    contentType: 'application/json',
			    type: 'POST',
//			    data: JSON.stringify(postData),
			    data: postData,
			    success: function(res){
			    	if(res.statusCode=="1"){ 
			        	$('#resetPasswordSuccess').show();
			            $('#resetPasswordSuccess > text').html("Email with new password has been sent.");
			            App.scrollTo($('#resetPasswordSuccess'), -200);
			            $('#resetPasswordSuccess').delay(2000).fadeOut(2000);
			    	}else{
			            $('#resetPasswordError').show();
			            $('#resetPasswordError > text').html("Error in sending password reset email.");
			            App.scrollTo($('#resetPasswordError'), -200);
			            $('#resetPasswordError').delay(2000).fadeOut(2000);
			    	}
			    },
			    error: function(res){
			        $('#resetPasswordError').show();
			        $('#resetPasswordError > text').html("Error in sending password reset email.");
			        App.scrollTo($('#resetPasswordError'), -200);
			        $('#resetPasswordError').delay(2000).fadeOut(2000);
			    }
			        
			});
	     },
		showEditInvestorDetails:function(evt){
			$(".hideform1").show();
			$(".hideviewtable1").hide();
			if($.inArray('NPIManagement', app.sessionModel.attributes.permissions)==-1){
				$(".dob").remove();
				$(".ssn").remove();
			}
		    $(".viewaddressdetailsform1").hide();
		},
		fetchSolutionSpecialistUsers:function(){
	    	 var self = this;
			 $.ajax({
					url: app.context()+'/user/Solution Specialist',
	                contentType: 'application/json',
	                async : false,
	                dataType:'json',
	                type: 'GET',
	                success: function(res){
	                	self.solutionSpecialistUsers=res;
	                },
	                error: function(res){
	                	console.log('Error in fetching solution specialist users');
	                }
					
				});
		 },
		deActivate:function(evt){
			$('input[name$="isActive"]').val("No");
			$( "#status2" ).show();
			$( "#status1" ).hide();
		},
		activate:function(evt){
			$('input[name="isActive"]').val("Yes");
			$( "#status1" ).show();
			$( "#status2" ).hide();
		},
		editInvestorDetails:function(){
			var thisPtr = this;
			var detailsModel=new investorDetailsModel();
			var unindexed_array = $('#formInvestorDetails').serializeArray();
			$.map(unindexed_array, function(n, i){
				var value=n['value'];
				var name=n['name'];
				detailsModel.set(name,value);
			});
			if($('#formInvestorDetails').validate().form()){
				detailsModel.saveInvDetails(thisPtr.propertyModel.investorId, detailsModel,{
					success : function ( mod, res ) {
	
						app.investorProfileView.render({investorId:thisPtr.investorId});
						
						$("#investorDetails").parent().addClass('active');
						$("#investorDetailsTab").addClass("active");
						 $(".hideviewtable1").show();
						 $(".viewaddressdetailsform1").show();
						 $(".hideform1").hide();
					},
					error   : function ( mod, res ) {
						$('#formFailure > text').html("Error in updating investor details.");
						$('#formFailure').show();
				        App.scrollTo($('#formFailure'), -200);
				        $('#formFailure').delay(2000).fadeOut(2000);
					}
				});
			}
		},
		formInvestorDetailsValidation:function(){
    	  	 var form1 = $('#formInvestorDetails');
             var error1 = $('#alertFailure', form1);
             var success1 = $('#alertSuccess', form1);
             form1.validate({
            	 errorElement: 'span', //default input error message container
                 errorClass: 'help-block', // default input error message class
                 focusInvalid: false, // do not focus the last invalid input
                 ignore: "",
                 rules: {
                	 firstName:{
                		 required:true
                	 },
                	 lastName:{
                		 required:true
                	 },
                	 email:{
                		 email: true,
                		 required: true
                	 },
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
	            		 number: true
	            	 },
	            	 workPhone:{
	            		 number: true
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
		cancelEditInvestorDetails:function(evt){
			 this.render();
	    	 $(".hideviewtable1").show();
	    	 $(".viewaddressdetailsform1").show();
			 $(".hideform1").hide();
	     }
	
	});
	return InvestorDetailsView;
});