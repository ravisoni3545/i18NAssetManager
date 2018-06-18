define(["backbone","app","text!templates/investorReportSearch.html","text!templates/investorList.html","models/investorReportModel",
        "text!templates/genericDropdown.html","text!templates/reportResults.html","components-dropdowns","components-pickers"],
		function(Backbone,app,investorReportSearch,investorListPage,investorReportModel,genericDropdown,reportResultPage){
	var InvestorReportSearchView=Backbone.View.extend({
		initialize: function(){

		},
		events : {
			"click #searchInvestorReports":"searchInvestorReports",
			"click #reportCheckboxAll":"reportCheckboxAll",
			"click #reportResultsTable tbody input[type='checkbox']": "changeCheckBoxSelection",
			"click #publishInvestorReports":"publishInvestorReports"
		},
		self:this,
		el:"#maincontainer",
		propertyModel:{},
		messageIdToBeDeleted:{},
		render : function () {
			var thisPtr = this;
			thisPtr.template = _.template(investorReportSearch);
			thisPtr.$el.html("");

			this.$el.html(this.template());
			
	    	this.getInvestors();
	    	var genericDropdownTemplate = _.template(genericDropdown);
	    	$('#investorsDropdown').html('');
	    	$('#investorsDropdown').html(genericDropdownTemplate({name:'investorId',id:'investorId',items:this.investorsData,addBlankFirstOption:true,addNewOption:false}));
			this.applyValidations();
			ComponentsPickers.init();
			return this;
		},

		getInvestors : function(){
			var self = this;
			$.ajax({
					url: app.context()+'/investors/getInvestorsWithAssets',
	                contentType: 'application/json',
	                async : false,
	                dataType:'json',
	                type: 'GET',
	                success: function(res){
	                	self.investorsData=res;
	                },
	                error: function(res){
//	                	var error1 = $('#errMsgDiv', $('#investorReportSearchForm'));
//   		            error1.show();
//                    	App.scrollTo(error1, -200);
//                    	error1.delay(2000).fadeOut(2000);
	                }
					
				});
		},

		searchInvestorReports:  function(cb){
			var self=this;
    	 	var obj={};
    	    var unindexed_array = $('#investorReportSearchForm').serializeArray();
    	    $.map(unindexed_array, function(n, i){
    	    	var value=n['value'];
    	    	var name=n['name'];
    	    	obj[name]=value;
    	    });
    	    self.month = obj["month"];
    	    self.year = obj["year"];
    	    if($('#investorReportSearchForm').validate().form()){
    	    	$.blockUI({	
            		baseZ: 999999,
            		message: '<div><img src="assets/img/loading.gif" />Just a moment...</div>'
            	});
	    	    $.ajax({
	                url: app.context()+'investorReport/search',
	                contentType: 'application/json',
	                dataType:'json',
	                type: 'POST',
	                data: JSON.stringify(obj),
	                async:true,
	                success: function(res){
	                	$.unblockUI();
	                	self.timePeriod = res.timePeriod;
	                	self.reportlist = res.reportResponses;
	                	self.showReportList();
	                },
	                error: function(x, t, m) {
	                	if(t==="timeout") {
//	                		console.log("timeout");
	                	}else{
	                		$.unblockUI();
		                	var error1 = $('#errMsgDiv', $('#investorReportSearchForm'));
	   		             	error1.show();
	                    	App.scrollTo(error1, -200);
	                    	error1.delay(2000).fadeOut(2000);
	                	}
	                },
	                complete:function(){
	                	if(cb && 'callback' in cb) cb.callback();
	                }
	            });
     		}

		},
		showReportList: function(){
			var self=this;
			var reportResulttemplate = _.template(reportResultPage);
			$('#reportSearchResultDiv').html("");
			$('#reportSearchResultDiv').html(reportResulttemplate({reportsData:this.reportlist,timePeriod:this.timePeriod,downloadLink:app.context()+'/resources/reports/'}));
		
			self.table = $('#reportResultsTable').DataTable({
				"searching": true,
				"deferRender": true,
				"paging": true,
				"aaSorting": [], 
				"columnDefs": [
				    { "type": "html", "targets": 0, 'searchable':false, 'orderable':false,'width':'1%',
				    	'className': 'dt-body-center' },
				    { "type": "html", "targets": 1 ,'orderable':false},
				    { "type": "html", "targets": 2 },
				    { "type": "html", "targets": 3 },
				    { "type": "html", "targets": 4 },
				    { "type": "html", "targets": 5 },
				    { "type": "html", "targets": 6 },
				    { "type": "html", "targets": 7 },
				    { "type": "html", "targets": 8 },
				    { "type": "html", "targets": 9 }
				  ]
			});
		},
		applyValidations:function(){

			var form1 = $('#investorReportSearchForm');

			form1.validate({
				errorElement: 'span', //default input error message container
				errorClass: 'help-block', // default input error message class
				focusInvalid: false, // do not focus the last invalid input
				ignore: "",
				rules: {
					month: {
						required: true
					},
					year: {
						required: true
					}
				},

				invalidHandler: function (event, validator) { //display error alert on form submit              

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
		// Handle click on "Select all" control
		reportCheckboxAll:function(evt){
			// Check/uncheck all checkboxes in the table
			var self= this;
			var isChecked = $("#reportCheckboxAll").prop('checked');
			var rows = self.table.rows({ 'search': 'applied' }).nodes();
    		$('input[type="checkbox"]', rows).prop('checked', isChecked);
		},
		// Handle click on checkbox to set state of "Select all" control
		changeCheckBoxSelection : function(evt){
			// If checkbox is not checked uncheck select all checkbox
			var isChecked = $(evt).prop('checked');
		    if(!isChecked){
		         var el = $('#reportCheckboxAll').get(0);
		         // If "Select all" control is checked and has 'indeterminate' property
		         if(el && el.checked && ('indeterminate' in el)){
		            // Set visual state of "Select all" control 
		            // as 'indeterminate'
		            el.indeterminate = true;
		         }
		    }
		},
		publishInvestorReports:function(){
			var self=this;
			var checkedVals =[];
			self.isThereCheckBoxes = false;
//			$('#reportResultsTable tbody input[type="checkbox"]').each(function(){
//				checkedVals.push(this.value);
//			});
			
			self.table.$('input[type="checkbox"]').each(function(){
		         // If checkbox doesn't exist in DOM
//		         if(!$.contains(document, this)){
		            // If checkbox is checked
					self.isThereCheckBoxes = true;
		            if(this.checked){
		            	checkedVals.push(this.value);
		            }
//		         }
			});
		
			if(checkedVals == null || jQuery.isEmptyObject(checkedVals)){
				if(!self.isThereCheckBoxes){
					$('#publishErrMsgDiv').html('');
					$('#publishErrMsgDiv').html("All reports are Published/Non-Balanced.");
				}else{
					$('#publishErrMsgDiv').html('');
					$('#publishErrMsgDiv').html("No report has been selected. Please select a report first.");
				}
				$('#publishErrMsgDiv').show();
				App.scrollTo($('#publishErrMsgDiv'), -200);
				$('#publishErrMsgDiv').delay(2000).fadeOut(2000);
			}else{
				$.blockUI({	
            		baseZ: 999999,
            		message: '<div><img src="assets/img/loading.gif" />Just a moment...</div>'
            	});
	    	    $.ajax({
	                url: app.context()+'investorReport/publish',
	                contentType: 'application/json',
	                dataType:'json',
	                type: 'POST',
	                data: JSON.stringify({ reportGenLogIds: checkedVals,month:self.month,year:self.year }),
	                success: function(res){
	                	$.unblockUI();
	                	self.searchInvestorReports({'callback': function(){
	                		var success1 = $('#publishSuccessMsgDiv');
		                	success1.show();
	                    	App.scrollTo(success1, -200);
	                    	success1.delay(2000).fadeOut(2000);
	                	}});
	                },
	                error: function(x, t, m) {
	                	if(t==="timeout") {
//	                		console.log("timeout");
	                	}else{
	                		$.unblockUI();
	                		self.searchInvestorReports({'callback': function(){
	                			var error1 = $('#publishErrMsgDiv');
			                	error1.html('');//as it is being used above
			                	error1.html('Error in publishing reports');
		   		             	error1.show();
		                    	App.scrollTo(error1, -200);
		                    	error1.delay(2000).fadeOut(2000);
	                		}});
	                	}
	                }
	            });
			}		
		}
		
		
	});
	return InvestorReportSearchView;
});