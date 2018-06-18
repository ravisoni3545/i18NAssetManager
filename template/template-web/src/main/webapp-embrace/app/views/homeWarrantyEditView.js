define(["text!templates/homeWarrantyEdit.html", "backbone","app",
        "models/homeWarrantyModel"],
		function(homeWarrantyEdit, Backbone, app, homeWarrantyModel){

	var HomeWarrantyEditView = Backbone.View.extend( {
		initialize: function(){
			var self = this;
			self.homeWarrantyModel = new homeWarrantyModel();
		},
		events : {
			"click #homeWarrantyEditSave":"saveHomeWarranty"
		},
		fetchWarrantyInformation: function(){
			var self = this;
			self.homeWarrantyModel.fetchHomeWarrantyDetails({
				success:function(){
					self.render();
				},
				error:function(){
					console.log("Error in fetching warranty information");
				}
			});
		},
		render : function () {
			var self = this;
			self.$el.html("");
			var template = _.template(homeWarrantyEdit)({warrantyData:self.homeWarrantyModel.toJSON(),
				investmentId:self.homeWarrantyModel.investmentId});
			self.$el.html(template);
			self.homeWarrantyFormValidation($("#HOME_WARRANTY_EDIT_POPUP #homeWarrantyEditForm"));
			self.$el.find("#HOME_WARRANTY_EDIT_POPUP").modal('show');
			ComponentsPickers.init();
		},
		saveHomeWarranty:function(){
			var self = this;
			var currentForm = self.$el.find("#homeWarrantyEditForm");
			var warrantyDoc = currentForm.find("input[name=warrantyDocument]");

			if(currentForm.validate().form()){
				if(!warrantyDoc.val()){
					warrantyDoc.attr("disabled","disabled");
				}

				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});
				self.homeWarrantyModel.saveHomeWarranty(currentForm,{
					success:function(){
						$.unblockUI();
						self.afterSaveHomeWarranty();
					},
					error:function(){
						$.unblockUI();
						console.log("editHomeWarranty error");
					}
				});
			}
		},
		afterSaveHomeWarranty:function(){
			var self = this;
			self.$el.find("#HOME_WARRANTY_EDIT_POPUP").modal('hide');
	 		self.trigger("Home_Warranty_Edited");
	 		$(".modal-backdrop.fade.in").remove();
		},
		homeWarrantyFormValidation:function(homeWarrantyform){
			var error1 = $('.alert-danger', homeWarrantyform);
			var success1 = $('.alert-success', homeWarrantyform);
			homeWarrantyform.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					homeWarrantyCompanyName:{
						required: true
					},
					policyNumber:{
						required: true
					},
					validFromDate:{
						required: true
					},
					validToDate:{
						required: true
					}/*,
					warrantyDocument:{
						required: true
					}*/
				},
				invalidHandler: function (event, validator) { //display error alert on form submit              
					success1.hide();
				},

				highlight: function (element) { // hightlight error inputs
					$(element).closest('.form-group').addClass('has-error'); // set error class to the control group
				},

				unhighlight: function (element) { // revert the change done by hightlight
					$(element).closest('.form-group').removeClass('has-error'); // set error class to the control group
				},

				success: function (label) {
					label.closest('.form-group').removeClass('has-error'); // set success class to the control group
				}

			});
		}
	});
	return HomeWarrantyEditView;
});