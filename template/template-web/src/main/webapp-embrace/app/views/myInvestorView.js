define(["text!templates/myInvestor.html","backbone","app","text!templates/initiateClosing.html","collections/investorsCollection","models/myInvestorsModel","jquery.form"],
		function(myInvestorPage,Backbone,app,initiateClosingPage,investors,myinvestorsmodel){
	var MyInvestorView = Backbone.View.extend( {
		initialize: function(){
			this.paymentcount=0;
			this.fetchDealType();
			this.fetchFinancingType();
			this.fetchClosingUser();
			this.fetchsolutionSpecialists();
			this.fetchIlmUsers();
			this.fetchAssetManagerUsers();
		},
		models:{},
		collection:new investors(),
		investorModel: new myinvestorsmodel(),
		investorIdAssociateWithDeletedPropertyId:null,
		propertyIdToBeDeleted:null,
		events:{
			"click a[name='showWishlist']":"showwishlist",
			"click a[name='hideWishList']":"hideWishList",
			"click #submitInitiateClosing":"submitInitiateClosing",
			"click a[name='initiateClosing']":"showinitiateClosingModal",
			"click .removeWishlist":"openDeleteContact",
			'click #confirmDeleteMyInvestor'  : 'removeFromWishlist',
			'change #purchaseAgreementDoc':'removeErrors'

		},
		dealType:{},
		financingType:{},
		self:this,
		closingUsers:{},
		solutionSpecialists:{},
		ilmUsers:{},
		assetManagers:{},
		render:function(){
			if($.inArray('InvestorView', app.sessionModel.attributes.permissions)!=-1 || $.inArray('InvestorManagement', app.sessionModel.attributes.permissions)!=-1){
				var thisPtr=this;
				thisPtr.template= _.template( myInvestorPage );

				thisPtr.$el.html("");
				thisPtr.showInvestors();

				data=this.models;
				if(data==null){
					data="";
				}
				thisPtr.$el.html(thisPtr.template({investorModels:data}));
				this.applyPermissions();
			}
		},
		showwishlist:function(evt){
			evt.stopPropagation();
			var investorId=$(evt.currentTarget).attr('investorid');
			$("#"+investorId+"showspan").hide();
			$("#"+investorId+"hidespan").show();
			$('#myInvestorTable').find('tr[name='+investorId+']').each(function(){
				$(this).show();
			})
		},
		hideWishList:function(evt){
			evt.stopPropagation();
			var investorId=$(evt.currentTarget).attr('investorid');
			$("#"+investorId+"hidespan").hide();
			$("#"+investorId+"showspan").show();
			$('#myInvestorTable').find('tr[name='+investorId+']').each(function(){
				$(this).hide();
			})	 
		},
		showinitiateClosingModal:function(evt){
			var thisPtr=this;
			var investor=thisPtr.collection.findWhere({investorId: $(evt.currentTarget).attr('investorid')});
			console.log(investor);
			var wishList=investor.get('wishlistPropertyInfo');
			var selectedProperty = _.find(wishList, function(obj) { return obj.propertyId == $(evt.currentTarget).attr('propertyId') });
			console.log(selectedProperty);
			if(!this.dealType){
				this.fetchDealType();
			}
			if(!this.financingType){
				this.fetchFinancingType();
			}
			if(!this.closingUsers){
				this.fetchClosingUser();
			}
			if(!this.assetManagers){
				this.fetchAssetManagerUsers();
			}
			if(!this.solutionSpecialists){
				this.fetchsolutionSpecialists();
			}
			if(!this.ilmUsers){
				this.fetchIlmUsers();
			}
			console.log(self.solutionSpecialists);
			console.log(self.ilmUsers);
			console.log(self.assetManagers);
			console.log(self.financingType);
			console.log(self.dealType);
			//console.log(JSON.parse( self.closingUsers ));
			var initiateClosingModal = _.template(initiateClosingPage);
			$("#initiateClosingDiv").html(" ");
			$("#initiateClosingDiv").html(initiateClosingModal({property:selectedProperty,
				investorName:investor.attributes.investorName,
				investorId:investor.attributes.investorId,
				dealType:self.dealType,
				finacingType:self.financingType,
				closingUsers:self.closingUsers,
				solutionSpecialists:self.solutionSpecialists,
				ilmUsers:self.ilmUsers,
				assetManagers:self.assetManagers,
				currentUser:app.sessionModel.get("firstName")+" "+app.sessionModel.get("lastName")
			})
			);
			app.currencyFormatter("$");
			$("#initiateclosing").modal("show");
			this.initiateClosingFormValidation();
			
		},
		submitInitiateClosing:function(){
			var obj={};
			obj.investorId=$('#initiateClosingDiv span#investorId').html();
			obj.propertyId=$('#initiateClosingDiv span#propertyId').html();
			if( $('#initiateClosingForm').validate().form()){
				$.blockUI({
		     		baseZ: 999999,
		     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			    });
				$('#initiateClosingForm').attr("enctype","multipart/form-data");
				$('#initiateClosingForm').ajaxSubmit({
					url: app.context()+'closing/initiateClosing/'+obj.investorId+"/"+obj.propertyId,
					async:true,
					contentType:'multipart/form-data',
				    success: function(res){
						console.log(res);
						$("#initiateclosing").modal('hide');
						$("#initiateclosing").on('hidden.bs.modal', function (e) {
							if(res.statusCode=='500') {
								error = $('#inititateClosingFailure');
								error.find('text').html(res.message);
								error.show();
		                    	App.scrollTo(error, -200);
		                    	error.delay(2000).fadeOut(2000);
							} else {
								app.router.navigate('closing/'+res.investmentId,{ trigger:true, replace: true });
							}
						});
						$.unblockUI();
					},
					error: function(res){
						$("#initiateclosing").modal('hide');
						$("#initiateclosing").on('hidden.bs.modal', function (e) {
							console.log("Something Went Wrong");
						});
						console.log(res);
						$.unblockUI();
					}
				});
			  }
			},
		 removeErrors:function(evt){
				console.log($(evt.target).parent());
				$(evt.target).parent().find('.help-block').remove();
				$(evt.target).parent().removeClass('has-error');
		 },
		 initiateClosingFormValidation: function() {
				
			var form1 = $('#initiateClosingForm');
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
					purchasePrice: {
						required: true,
						number: true,
						dollarsscents: true
					},
					saleUserId: {
						required: true
					},
					purchaseAgreementDoc: {
						required: true
					}
				},

				invalidHandler: function (event, validator) { //display error alert on form submit              
					success1.hide();
//				error1.show();
				App.scrollTo(error1, -200);
				},

				highlight: function (element) { // hightlight error inputs
					$(element)
				.closest('.col-md-6.marg_top15').addClass('has-error'); // set error class to the control group
				},

				unhighlight: function (element) { // revert the change done by hightlight
					$(element)
					.closest('.col-md-6.marg_top15').removeClass('has-error'); // set error class to the control group
				},

				success: function (label) {
					label
					.closest('.col-md-6.marg_top15').removeClass('has-error'); // set success class to the control group
				}
			});

		},
		fetchsolutionSpecialists:function(){
				var UsersResponseObject = $.ajax({
					type : "GET",
					url : app.context()+ "/user/Solution Specialist",
					async : false
				});
				UsersResponseObject.done(function(response) {
					self.solutionSpecialists=response;
				});
				UsersResponseObject.fail(function(response) {
					console.log("Error in retrieving solutionSpecialists "+response);
				});
		},
		fetchIlmUsers:function(){
				var UsersResponseObject = $.ajax({
					type : "GET",
					url : app.context()+ "/user/ILM",
					async : false
				});
				UsersResponseObject.done(function(response) {
					self.ilmUsers=response;
				});
				UsersResponseObject.fail(function(response) {
					console.log("Error in retrieving ilmUsers "+response);
				});
		},
		fetchClosingUser:function(){
				$.ajax({
					url: app.context()+'/user/Closer',
					contentType: 'application/json',
					async : false,
					type: 'GET',
					success: function(res){
						self.closingUsers=res
						console.log(res);
					},
					error: function(res){
					}

				});
		},
		fetchAssetManagerUsers:function(){
			$.ajax({
				url: app.context()+'/user/Asset Manager',
				contentType: 'application/json',
				async : false,
				type: 'GET',
				success: function(res){
					self.assetManagers=res
					console.log(res);
				},
				error: function(res){
				}

			});
		},
		fetchDealType:function(){
				var allcodesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+ "/code/all/DEAL_TYPE",
					async : false
				});
				allcodesResponseObject.done(function(response) {
					self.dealType=response;
				});
				allcodesResponseObject.fail(function(response) {
					console.log("Error in retrieving codes "+response);
				});
		},
		fetchFinancingType:function(){
				var allcodesResponseObject = $.ajax({
					type : "GET",
					url : app.context()+ "/code/all/FIN_TYPE",
					async : false
				});
				allcodesResponseObject.done(function(response) {
					self.financingType=response;
				});
				allcodesResponseObject.fail(function(response) {
					console.log("Error in retrieving codes "+response);
				});
			},

		showInvestors: function(){
				var thisPtr=this;
				thisPtr.collection.fetch({async:false,
					success: function (data) {
						thisPtr.models=data.models;
					},
					error   : function () {
						console.log("fail");
						$('.alert-danger').show();
					}
				});
		},

		removeFromWishlist: function(){
				var thisPtr=this;
				var propId=thisPtr.propertyIdToBeDeleted;
				var investorId=thisPtr.investorIdAssociateWithDeletedPropertyId;

				this.investorModel.deleteWishlist(investorId,propId,{
					success : function ( mod, res ) {
						thisPtr.render();
					},
					error   : function ( mod, res ) {
						$('.alert-danger').show();
					}
				});
				$('#form-delete1').modal('hide');
				$('body').removeClass('modal-open');
				$('.modal-backdrop').remove();

		},
		openDeleteContact: function(evt){
				this.propertyIdToBeDeleted=$(evt.currentTarget).attr('propertyId');
				this.investorIdAssociateWithDeletedPropertyId=$(evt.currentTarget).attr('investorid');
			},

		applyPermissions : function() {
				if($.inArray('InvestorManagement', app.sessionModel.attributes.permissions)==-1) {
					$(".gear1button").remove();
				}
		}
	});
	return MyInvestorView;

});