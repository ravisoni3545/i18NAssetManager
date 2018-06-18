define(["text!templates/vendorPayment.html", "backbone","models/vendorPaymentModel","views/codesView","app"],
	function(paymentPage, Backbone, vendorpaymentmodel,codesView,app){

		var VendorPaymentView = Backbone.View.extend( {
		model :null,
		modelClone : null,
		initialize: function(){
			this.codesView = new codesView({codeGroup:'PAYMENT_GRP'});
		},
		      
		el:"#paymentTab",

		events          : {
			 'change #paymentMethod' 		: 'changePaymentType',
			 'click #savePaymentForm'   : 'submitPaymentForm',
			 'click #resetPaymentForm' 	: 'resetPaymentForm',
			 'click #confirmPaymentsave' 	: 'insertPaymentType'
	        },
		getPaymentFormDet : function(){
			var formModel = null;
			var self = this;
			var field = $('select[name="paymentMethod"]').val();
			if(self.modelClone){
			if(field == self.modelClone.attributes.tblcodeList.id){
				formModel = self.modelClone.clone();
			}else{
				formModel = new vendorpaymentmodel();
			}
			}else{
				formModel = new vendorpaymentmodel();
			}
			var unindexed_array = $('#paymentForm').serializeArray();
    	    $.map(unindexed_array, function(n, i){
    	    	var value=n['value'];
    	    	var name=n['name']
    	    	formModel.set(name,value);
    	    });
			return formModel;
		},
	        submitPaymentForm:function(){
		    	 var self = this;
		    	 console.log("app:");
		    	 console.log(app);
		    	 console.log(app.vendorPaymentModel);
		    	 if ($('#paymentForm').validate().form()) {
		    		 app.vendorPaymentModel  = self.getPaymentFormDet();
		    		 app.vendorPaymentModel.unset("organization");
		    		 app.vendorPaymentModel.unset("tblcodeList");
		    		 app.vendorPaymentModel.unset("tblcontact");
		    		 
		    		 var field = $('select[name="paymentMethod"]').val();
		 			if(self.modelClone){
		 			if(field == self.modelClone.attributes.tblcodeList.id){
		 				self.updatePaymentType();
		 			}else{
		 				//self.insertPaymentType();
		 				$('#changePaymentMethodWarningBox').modal('show');
		 			}
		 			}else{
		 				self.insertPaymentType();
		 			}
		    	 }
		     },    
	 
		render : function () {
			this.template = _.template( paymentPage );
			this.$el.html("");
			var self = this;

			if(!app.vendorPaymentModel){
				app.vendorPaymentModel=new vendorpaymentmodel();
				app.vendorPaymentModel.readVendorPayment({
	                success : function ( mod, res ) {
	                	app.vendorPaymentModel = new vendorpaymentmodel(res);
	                	self.modelClone = app.vendorPaymentModel.clone();
	                	$("#payment").parent().addClass('active')
	       	    	 	$("#paymentTab").addClass("active");
	                },
	                error   : function ( mod, res ) {
	                	$('.alert-danger').show();
	                }
	            });
			}
			console.log(app.vendorPaymentModel.attributes);
			this.$el.html(this.template({model:app.vendorPaymentModel}));
			this.codesView.callback = function() {
				if(app.vendorPaymentModel.attributes.tblcodeList)
					$('select[name="paymentMethod"]').val(app.vendorPaymentModel.attributes.tblcodeList.id);
			}
			this.codesView.render({el:$('#paymentMethod'),codeParamName:"paymentMethod"});
			console.log($('select[name="paymentMethod"]').val());
			if(app.vendorPaymentModel.attributes.tblcodeList)
				$('select[name="paymentMethod"]').val(app.vendorPaymentModel.attributes.tblcodeList.id);
			this.showPaymentType();
			this.paymentFormValidation();
			this.applyPermissions();
			$("#accountName").focus();
			return this;
		},
		applyPermissions : function() {
	    	if($.inArray('VendorManagement', app.sessionModel.attributes.permissions)==-1) {
	    		 $('#paymentButtonsArea').remove();
	    	}
	    },
		resetPaymentForm:function(){
			var currentType=$('select[name="paymentMethod"]').val();
			$('#paymentForm')[0].reset();
			$('select[name="paymentMethod"]').val(currentType);
			this.showPaymentType();
		},
		changePaymentType: function() {
	    	$("input[name$='accountName']").val('');
	    	$("input[name$='bankName']").val('');
	    	$("input[name$='routingNumber']").val('');
	    	$("input[name$='accountNumber']").val('');
			this.showPaymentType();
		},
		showPaymentType: function() {
			var msg= $('select[name="paymentMethod"]').val();
			if(msg=="19")
			{	
				$("#billingcontact").hide();
				$("#paymentdetails").hide();
			}
			else if(msg=="20")
			{
				$("#billingcontact").hide();
				$("#paymentdetails").show();
				$("#accountName").focus();
			}
			else if(msg=="21")
			{
				$("#billingcontact").hide();
				$("#paymentdetails").show();
				$("#accountName").focus();
			}
			else
			{
				$("#billingcontact").hide();
				$("#paymentdetails").hide();
			}
		},
		
		insertPaymentType: function(){
			var self = this;
			console.log(app.vendorPaymentModel);
			app.vendorPaymentModel.saveVendorPayment({
                success : function ( mod, res ) {
                	app.vendorPaymentModel = new vendorpaymentmodel(res);
                	console.log(self.modelClone);
                	self.modelClone = app.vendorPaymentModel.clone();
                	console.log("after");
                	console.log(self.modelClone);
                	$("#payment").parent().addClass('active')
       	    	 	$("#paymentTab").addClass("active");
                	var success1 = $('.alert-success', $('#paymentForm'));
                	success1.show();
                	$('.alert-success span').text(res.message);
                	App.scrollTo(success1, -200);
                	success1.delay(2000).fadeOut(2000);
                	//$('#savePaymentForm').attr('disabled','disabled');
                	//$('#resetPaymentForm').attr('disabled','disabled');
                },
                error   : function ( mod, res ) {
                	$('.alert-danger').show();
                	var error1 = $('.alert-danger', $('#paymentForm'));
                	error1.show();
                	App.scrollTo(error1, -200);
                	error1.delay(2000).fadeOut(2000);
                	
                	
                }
            });
		},
		
		updatePaymentType: function(){
			var self = this;
			console.log(app.vendorPaymentModel);
			app.vendorPaymentModel.updateVendorPayment({
                success : function ( mod, res ) {
                	app.vendorPaymentModel = new vendorpaymentmodel(res);
                	self.modelClone = app.vendorPaymentModel.clone();
                	$("#payment").parent().addClass('active')
       	    	 	$("#paymentTab").addClass("active");
                	var success1 = $('.alert-success', $('#paymentForm'));
                	success1.show();
                	$('.alert-success span').text(res.message);
                	App.scrollTo(success1, -200);
                	success1.delay(2000).fadeOut(2000);
                	//$('#savePaymentForm').attr('disabled','disabled');
                	//$('#resetPaymentForm').attr('disabled','disabled');
                },
                error   : function ( mod, res ) {
                	$('.alert-danger').show();
                	var error1 = $('.alert-danger', $('#paymentForm'));
                	error1.show();
                	App.scrollTo(error1, -200);
                	error1.delay(2000).fadeOut(2000);
                }
            });
		},
		
		paymentFormValidation: function() {
	         // for more info visit the official plugin documentation: 
	             // http://docs.jquery.com/Plugins/Validation

	             var form1 = $('#paymentForm');
	             var error1 = $('.alert-danger', form1);
	             var success1 = $('.alert-success', form1);

	             form1.validate({
	                 errorElement: 'span', //default input error message container
	                 errorClass: 'help-block', // default input error message class
	                 focusInvalid: false, // do not focus the last invalid input
	                 ignore: "",
	                 rules: {
	                	 paymentMethod: {
	                         required: true
	                     },
	                     accountName: {
	                    	 maxlength: 100
	                     },
	                     bankName: {
	                    	 maxlength: 100
	                     },
	                     routingNumber: {
	                    	 maxlength: 20
	                     },
	                     accountNumber: {
	                    	 maxlength: 20
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

	     }
	});
	return VendorPaymentView;
});