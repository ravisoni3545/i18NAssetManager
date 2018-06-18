define(["text!templates/currentRemarks.html","backbone","models/currentRemarksModel","text!templates/currentRemarksDetails.html"],
		function(currentRemarks,Backbone,currentRemarksModel,currentRemarksDetails){
	
	var currentRemarksView = Backbone.View.extend( {
		initialize: function(options){
	
		},
		el:"#currentRemarks",
		model:new currentRemarksModel(),
		propertyModel:{},
		remarksList:[],
		events : {
			'click #ShowFullRemarks': 'ShowFullRemarks',
			'click #currentRmksDetails':'preventClickDefaults',
			"click .popover-close" : "closePopover",
			"click #remarksSubmitButton":"submitRemarks",
			"click #remarksCancelButton":"closePopover",
			"click .popover-content":"preventClickDefaults"
			
		},
		render : function () {
			//this.fetchRemarks();
		
			var self=this;
			// console.log(self.remarksList);
				if(!self.remarksList.length){
					 var myObj = {};
					 myObj['messageTextPart2']="No current remarks.";  
					 self.remarksList[0]=myObj;
					 //console.log(self.remarksList);
				}
				self.template = _.template(currentRemarks)({remarks:self.remarksList});
				self.$el.html("");
				self.$el.html(self.template);
				
				if(self.propertyModel && self.propertyModel.object=="509"){
					self.$el.find("#currntRemrksDiv").css({"margin-right":"-15px"});
					self.$el.find("#currntRemrksDiv").removeClass("col-md-4");
					self.$el.find("#currntRemrksDiv").addClass("col-md-5");
					self.$el.find("#hoverTooltip").css({"width":"11em"});
				
				}else if(self.propertyModel && self.propertyModel.object=="96"){
					self.$el.css({"margin-top":"10px"});
					self.$el.find("#currntRemrksDiv").removeClass("col-md-4");
					self.$el.find("#currntRemrksDiv").addClass("col-md-5");
					self.$el.find("#currntRemrksDiv").addClass("row");
					self.$el.find("#currntRemrksDiv").css({"margin-right":"-10px"});
					self.$el.find("#hoverTooltip").css({"width":"82%"});
					
				}else if(self.propertyModel && self.propertyModel.object=="451"){
					self.$el.find("#currntRemrksDiv").removeClass("col-md-4");
					self.$el.find("#currntRemrksDiv").addClass("col-md-5");
					self.$el.find("#hoverTooltip").css({"width":"12em"});
				}
				
				
				$('.propNameTooltip').tooltip({
					animated: 'fade',
					placement: 'bottom'
				});

				$('.currentRemarksEditTooltip').popover({ 
					trigger: 'manual',
					'placement': 'right',
				});
				
			 
		},
		fetchRemarks : function(){
			var self=this;
			self.model.loadEachTaskMessage(self.propertyModel.messageType,self.propertyModel.object,self.propertyModel.objectId,{
				success : function ( model, res ) {
					//console.log(res);
					self.remarksList=res;
					self.render();
				},
			error   : function ( model, res ) {
					console.log('Error in fetching task data '+res);
					//self.remarksList=res;
				}
			});
		},
		
		ShowFullRemarks : function(evt){
			var self=this;
		//	var isVisible = $(evt.currentTarget).data('show');
			var isVisible =$(evt.currentTarget).find('.currentRemarksEditTooltip').data('show');
			var popOverMsgTemplate;
			//var tooltipShow=$(evt.currentTarget).find('.currentRemarksEditTooltip').data().show;
			if(isVisible==true){
				//if(self.remarksList.length==0)
					//self.remarksList.messageTextPart2="No current Messages";
				
					 popOverMsgTemplate = _.template( currentRemarksDetails )({msgDatas:self.remarksList});
				
			  //console.log($(evt.currentTarget));
				$(evt.currentTarget).find('.currentRemarksEditTooltip').data('show',false);
				if(popOverMsgTemplate.length>0){
					$(evt.currentTarget).find('.currentRemarksEditTooltip').attr("data-content",popOverMsgTemplate);
				}
				else{
					$(evt.currentTarget).find('.currentRemarksEditTooltip').attr("data-content","No messages");
				}
				$(evt.currentTarget).find('.currentRemarksEditTooltip').popover("show");
			}else{
				$(evt.currentTarget).find('.currentRemarksEditTooltip').popover("hide");
				$(evt.currentTarget).find('.currentRemarksEditTooltip').data('show',true);
			}
			
			if(self.propertyModel.object=="49" && self.propertyModel.closingStatus=="Completed" && self.propertyModel.investmentStatus=="Purchased"){
				$(evt.currentTarget).find('#remarksCancelButton').hide();
				$(evt.currentTarget).find('#remarksSubmitButton').hide();
				$(evt.currentTarget).find('#remarksText').prop('disabled', true);
				
			}
			self.remarksValidation();
			
		},
		
		preventClickDefaults :function(evt){
			//console.log("Defayks");
			evt.preventDefault();
			evt.stopPropagation();
		},
		
		closePopover:function(evt) {
			evt.stopPropagation();
			if($(evt.currentTarget).data("item") === "msg") {
				$(evt.currentTarget).parent().parent().parent().parent().find(".currentRemarksEditTooltip").popover("hide");
				$(evt.currentTarget).parent().parent().parent().parent().find(".currentRemarksEditTooltip").data('show',true);
				//$(evt.currentTarget).parent().parent().parent().parent().find(".currentRemarksEditTooltip").removeClass("tooTip-shown");
			} else{
				$(evt.currentTarget).parent().parent().parent().parent().parent().parent().find(".currentRemarksEditTooltip").popover("hide");
				$(evt.currentTarget).parent().parent().parent().parent().parent().parent().find(".currentRemarksEditTooltip").data('show',true);
				
			}
				
		},
		
		submitRemarks:function(){
			   	var self=this;
				var postData={};
				postData.taskKey=self.propertyModel.messageType;
				postData.objectId=self.propertyModel.objectId;
				postData.object=self.propertyModel.object;
				postData.messageText=$("#remarksText").val();
			
				if ($('.remarkstext-form').validate().form()){
	    	self.model.submitRemarks(postData,{
				success : function ( model, res ) {
					self.fetchRemarks();
					//self.remarksList=res;
					//self.render();
				},
			error   : function ( model, res ) {
					console.log('Error in saving remarks '+res);
					//self.remarksList=res;
				}
			});
				}
	    	
		},
		
		remarksValidation: function() {
			var form1 = $('.remarkstext-form');
			var error1 = $('#formAlertFailure', form1);
			var success1 = $('.alert-success', form1);
			var suggestions = $('.has-error', form1);
			suggestions.removeClass('has-error');
			$('.help-block').hide();
			error1.hide();

			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
				   remarks: {
						required: true
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
		
		
	});
	return currentRemarksView;
});