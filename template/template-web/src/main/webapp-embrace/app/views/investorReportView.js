define(["backbone","app","text!templates/investorReports.html","text!templates/investorList.html","models/investorReportModel",
        "views/investorNamesView","text!templates/jasperReports.html",
        "components-dropdowns","components-pickers"],
		function(Backbone,app,investorReport,investorListPage,investorReportModel,investorNamesView,jasperReportsPage){
	var InvestorReportView=Backbone.View.extend({
		initialize: function(){

		},
		events : {
			"click #generateInvestorReport":"generateInvestorReport",
	        "click .jasperReportUrl":"showJasperReportInIframe"
		},
		self:this,
		el:"#maincontainer",
		propertyModel:{},
		messageIdToBeDeleted:{},
		render : function () {
			var thisPtr = this;
			thisPtr.template = _.template(investorReport);
			thisPtr.$el.html("");

			this.$el.html(this.template());
			if(!this.investorNamesView) {
	     	     this.investorNamesView = new investorNamesView();
	     	    }
	     	this.investorNamesView.setElement(this.$('#investorNames')).render();
			//this.populateInvestorNames();
			this.applyValidations();
			this.dateComparison();
			ComponentsPickers.init();
			return this;
		},

		populateInvestorNames : function(){

			var allcodesResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/investors/getInvestors",
				async : false
			});

			$('#investorNames').html(_.template( investorListPage )({codes:JSON.parse(allcodesResponseObject.responseText)}));

		},

//		generateInvestorReport:  function(){
//
//			if ($('#investorReportForm').validate().form()){
//				if(!app.investorReportModel){
//					app.investorReportModel=new investorReportModel();
//				}
//
//				var unindexed_array = $('#investorReportForm').serializeArray();
//				$.map(unindexed_array, function(n, i){
//					var value=n['value'];
//					var name=n['name'];
//					app.investorReportModel.set(name,value);
//				});
//
//				window.open(app.context()+'/investorReport/download/'+app.investorReportModel.get("investorNamesList")+"/"+app.investorReportModel.get("startDate")+"/"+app.investorReportModel.get("endDate"),"_blank");
//			}
//
//		},
		
		generateInvestorReport:  function(){

//			if ($('#investorReportForm').validate().form()){
//				if(!app.investorReportModel){
//					app.investorReportModel=new investorReportModel();
//				}
//
//				var unindexed_array = $('#investorReportForm').serializeArray();
//				$.map(unindexed_array, function(n, i){
//					var value=n['value'];
//					var name=n['name'];
//					app.investorReportModel.set(name,value);
//				});
//
//				window.open(app.context()+'/investorReport/download/'+app.investorReportModel.get("investorNamesList")+"/"+app.investorReportModel.get("startDate")+"/"+app.investorReportModel.get("endDate"),"_blank");
//			}
			
			var self=this;
    	 	var obj={};
    	    var unindexed_array = $('#investorReportForm').serializeArray();
    	    $.map(unindexed_array, function(n, i){
    	    	var value=n['value'];
    	    	var name=n['name'];
    	    	obj[name]=value;
    	    });
    	    if($('#investorReportForm').validate().form()){
    	    	var startMsg = $('#startMsgDiv', $('#investorReportForm'));
    	    	startMsg.show();
            	App.scrollTo(startMsg, -200);
            	startMsg.delay(2000).fadeOut(2000);
	    	    $.ajax({
	                url: app.context()+'investorReport/download',
	                contentType: 'application/json',
	                dataType:'text',
	                type: 'POST',
	                data: JSON.stringify(obj),
//	                timeout: 2000,
	                success: function(res){
//	                	startMsg.hide();
	                	var success1 = $('#successMsgDiv', $('#investorReportForm'));
	                	success1.html("");
	                	if(!jQuery.isEmptyObject(res) && !jQuery.isEmptyObject(JSON.parse(res).responseMessage)){
	                		success1.html(JSON.parse(res).responseMessage);
	                		startMsg.hide();
	                		success1.show();
	                	}
//	                	else{
//	                		success1.html("Successfully generated the reports.");
//	                	}
//                    	success1.show();
                    	App.scrollTo(success1, -200);
                    	success1.delay(2000).fadeOut(2000);
	                },
	                error: function(x, t, m) {
//	                	if(t==="timeout") {
//	                		console.log("timeout");
//	                	}else{
//	                		startMsg.hide();
//		                	var error1 = $('#errMsgDiv', $('#investorReportForm'));
//	   		             	error1.show();
//	                    	App.scrollTo(error1, -200);
//	                    	error1.delay(2000).fadeOut(2000);
//	                	}
	                }
	            });
     		}

		},

		applyValidations:function(){

			var form1 = $('#investorReportForm');
//			var error1 = $('.alert-danger', form1);
//			var success1 = $('.alert-success', form1);

			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {

//					startDate: {
//						required: true
//					},
//					endDate: {
//						required: true
//					}
					
					month: {
						required: true
					},
					year: {
						required: true
					}
				},

				invalidHandler: function (event, validator) { //display error alert on form submit              
//					success1.hide();
//					error1.show();
//					App.scrollTo(error1, -200);
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
					//success1.show();
//					error1.hide();
				}
			});
		},

		dateComparison:function(){

			var self=this;
			self.currentForm=$('#investorReportForm');
			var startDatePicker = self.currentForm.find('[name=startDate]');
			var endDatePicker = self.currentForm.find('[name=endDate]');

			if(startDatePicker.length>0) {
				$(startDatePicker[0]).parent().datepicker().on('changeDate', function (evt) {
					$('.datepicker').hide();
					var selectedDate = new Date(evt.date.valueOf());
					var endDatePicker = self.currentForm.find('[name=endDate]');
					if(endDatePicker.length>0) {
						var endDatePickerWidget = $(endDatePicker[0]).parent();
						var endDate = endDatePickerWidget.datepicker("getDate");
						if(endDate<selectedDate) {
							endDatePickerWidget.data({date: selectedDate}).datepicker('update');
							var month = selectedDate.getMonth()+1;
							if(String(month).length<2) {
								month = '0'+month;
							}
							$(endDatePicker[0]).val(month+"-"+selectedDate.getDate()+"-"+selectedDate.getFullYear());
						}
						endDatePickerWidget.datepicker('setStartDate', selectedDate);
					}
				});
			}

			_($('.date-picker')).each(function(datePicker) {
				$(datePicker).datepicker('setEndDate','+0d').datepicker('update');
			});

			$(endDatePicker[0]).parent().datepicker().on('changeDate', function (evt) {
				$('.datepicker').hide();
			});
		},
		
		renderOtherReports : function () {
			this.template = _.template( jasperReportsPage );
	     	this.$el.html("");
	     	this.fetchReportUrlsForLoggedInUser();
	     	
	     	this.$el.html(this.template({reportInfoList:this.reportInfoList}));
	     	return this;
		},
	    
	    fetchReportUrlsForLoggedInUser: function(){
	    	var self=this;
	    	
	    	  $.ajax({
	                url: app.context()+ '/report/fetchReportUrl',
	                contentType: 'application/json',
	                dataType:'json',
	                async:false,
	                type: 'GET',
	                success: function(res){
	                	self.reportInfoList=res.reportInfo;
	                },
	                error: function(res){
	                	console.log("error");
	                }
	            });
	    },
	    
	    showJasperReportInIframe:function(evt){
	    	var res=$(evt.target).data('url');
	    	var tagSendBox = $.colorbox({href: res,
				iframe:true,fastIframe:false,title:'Jasper Reports',closeButton:true,width:'80%',height:'100%',
				escKey:false,overlayClose:false});
			$('#cboxOverlay').css('z-index',99998);
			$('#colorbox').css('z-index',99999);
	    }
	});
	return InvestorReportView;
});