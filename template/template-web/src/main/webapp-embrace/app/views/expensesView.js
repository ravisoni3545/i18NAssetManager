define(["backbone","app","text!templates/expenses.html","text!templates/editExpense.html","views/codesView","components-dropdowns","components-pickers"],
	function(Backbone,app,expensesPage,editExpensePage,codesView){
		var expensesView=Backbone.View.extend({
			initialize: function(){
				this.feeTypes = new codesView({codeGroup:'EXP_TYPE'});
				this.frequencyTypes = new codesView({codeGroup:'EXP_FREQ'});
			},
			 events : {
				 "click #addExpense":"addExpense",
				 "click a[name='editExpense']":"showEditExpenseModal",
			     "click #editExpense":"editExpense",
			     "click a[name='deleteExpense']":"showDeleteExpenseModal",
			     "click #deleteExpenseConfirmationButton":"deleteExpense"
		     },
			self:this,
			el:"#expensesTab",
			propertyModel:{},
			expenseIdToBeDeleted:{},
			states:{},
			render : function () {
				var thisPtr = this;
				thisPtr.template = _.template(expensesPage);
				thisPtr.$el.html("");
				var templateData=thisPtr.collection.toJSON();
				this.$el.html(this.template({expenseData:templateData[0].expResponses}));
				
				this.feeTypes.render({el:$('#FeeTypeDD'),codeParamName:"feeTypeId"});
				this.frequencyTypes.render({el:$('#FreqTypeDD'),codeParamName:"freqTypeId"});
				
				/*loading editExpenseDiv here to avoid slow loading of 
				feeTypes and frequencyTypes dropdowns which causes issue while selecting the edit values
				if dropdowns not loaded by the time the values are selected as the calls are async
				*/
				var editTemplate = _.template(editExpensePage);
				$("#editExpenseDiv").empty();
				$("#editExpenseDiv").html(editTemplate({}));
				
				this.feeTypes.render({el:$('#editFeeTypeDD'),codeParamName:"feeTypeId"});
				this.frequencyTypes.render({el:$('#editFreqTypeDD'),codeParamName:"freqTypeId"});
				
				this.applyPermissions();
				ComponentsDropdowns.init();
		     	ComponentsPickers.init();
		     	$(".amount").formatCurrency();
		     	app.currencyFormatter();
		     	this.expenseFormValidation();
                $('.hopNameTooltip').tooltip({
                    animated: 'fade',
                    placement: 'left'
                });
				return this;
			},
			addExpense:function(){
				
				var self=this;
	    	 	var obj={};
	    	 	var assetId=this.propertyModel.get("assetId");
	    	 	
	    	 	var unindexed_array = $('#expenseForm').serializeArray();
	    	    $.map(unindexed_array, function(n, i){
	    	    	var value=n['value'];
	    	    	var name=n['name'];
	    	    	obj[name]=value;
	    	    });
	    	    
	    	    if($('#expenseForm').validate().form()) {
		    	    $.ajax({
		                url: app.context()+'expenses/createExpense/'+assetId,
		                contentType: 'application/json',
		                dataType:'text',
		                type: 'POST',
		                data: JSON.stringify(obj),
		                success: function(res){
		                	$("#add-expenses-form1").modal('hide');
		                	$('#add-expenses-form1').on('hidden.bs.modal',function() {
	 							self.fetchExpenses();
	 						});
		                },
		                error: function(res){
		                   alert("Failed in creating new expense");
		                   $("#add-expenses-form1").modal('hide');
		                }
		            });
	     		}
			},
			expenseFormValidation :function(){
	   	  	 var form1 = $('#expenseForm');
	            var error1 = $('.alert-danger', form1);
	            var success1 = $('.alert-success', form1);
	            $.validator.addMethod("dollarsscents", function(value, element) {
	                return this.optional(element) || /^\d{1,8}(\.\d{0,2})?$/i.test(value);
	            }, "Maximum 8 digits and 2 decimal places allowed");
	            $.validator.addMethod("notEqual",function(value, element, param){
	            	return this.optional(element) || value != param;
	            },"Non-zero value is required");
	            
	            form1.validate({
	           	 errorElement: 'span', //default input error message container
	                errorClass: 'help-block', // default input error message class
	                focusInvalid: false, // do not focus the last invalid input
	                ignore: "",
	                rules: {
	                	expAmount : {
	                		required:true,
							number : true,
							dollarsscents : true,
							notEqual:0
						},
						nextDueDate: {
							required:true
						}
	                },
	                invalidHandler: function (event, validator) { // display error alert on form submit
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
	       showEditExpenseModal :function(evt){
				var thisPtr=this;
				var clickedExpenseId=$(evt.currentTarget).attr('expenseId');
				this.expenseIdToBedited=clickedExpenseId;
				
				var results = $.map( this.collection.models[0].attributes.expResponses, function(e,i){
					if( e.expId === clickedExpenseId ) return e; 
				});
				var clickedExpenseModel=results[0];
				$("#editExpenseDiv [name=expAmount]").val(clickedExpenseModel.amount);
				$("#editExpenseDiv #expAmount_currency").val(clickedExpenseModel.amount);
				$("#editExpenseDiv [name=lastPaymentDate]").val(clickedExpenseModel.lastPaymentDate);
				$("#editExpenseDiv [name=nextDueDate]").val(clickedExpenseModel.nextPaymentDate);
				$("#editFeeTypeDD [name=feeTypeId]").val(clickedExpenseModel.expTypeId);
				$("#editFreqTypeDD [name=freqTypeId]").val(clickedExpenseModel.expFrequencyId);
				
				app.currencyFormatter();
				$(".currency").formatCurrency({symbol:""});
				this.applyPermissions();
				ComponentsDropdowns.init();
		     	ComponentsPickers.init();
				this.editFormValidation();
				$("#editExpenseModal").modal('show');
			},
			editExpense:function(){
		    	 var self=this;
		    	 	var obj={};
		    	    var unindexed_array = $('#editExpenseForm').serializeArray();
		    	    $.map(unindexed_array, function(n, i){
		    	    	var value=n['value'];
		    	    	var name=n['name'];
		    	    	obj[name]=value;
		    	    });
		    	    if($('#editExpenseForm').validate().form()){
		    	    	 $.ajax({
				                url: app.context()+'expenses/editExpense/'+self.expenseIdToBedited,
				                contentType: 'application/json',
				                dataType:'text',
				                type: 'POST',
				                data: JSON.stringify(obj),
				                success: function(res){
				                	$("#editExpenseModal").modal('hide');
				                	$('#editExpenseModal').on('hidden.bs.modal',function() {
			 							self.fetchExpenses();
			 						});
				                },
				                error: function(res){
				                   alert(res.message);
				                   $("#editExpenseModal").modal('hide');
				                }
				            });
		    	    }
		     },
			editFormValidation :function(){
		   	  	 var form1 = $('#editExpenseForm');
		            var error1 = $('.alert-danger', form1);
		            var success1 = $('.alert-success', form1);
//		            $.validator.addMethod("dollarsscents", function(value, element) {
//		                return this.optional(element) || /^\d{1,8}(\.\d{0,2})?$/i.test(value);
//		            }, "Maximum 8 digits and 2 decimal places allowed");
		            form1.validate({
		           	 errorElement: 'span', //default input error message container
		                errorClass: 'help-block', // default input error message class
		                focusInvalid: false, // do not focus the last invalid input
		                ignore: "",
		                rules: {
		                	expAmount : {
		                		required:true,
								number : true,
								dollarsscents : true,
								notEqual:0
							},
							nextDueDate: {
								required:true
							}
		                },
		                invalidHandler: function (event, validator) { // display error alert on form submit
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
			
		    showDeleteExpenseModal:function(evt){
				this.expenseIdToBeDeleted=$(evt.currentTarget).attr('expenseId');
				$('#optionDeleteExpense').modal("show");
			},
			deleteExpense:function(){
				var self=this;
				 $.ajax({
		                url: app.context()+'expenses/deleteExpense/'+this.expenseIdToBeDeleted,
		                contentType: 'application/json',
		                dataType:'text',
		                type: 'DELETE',
		                success: function(res){
		                	$("#optionDeleteExpense").modal('hide');
		                	$('#optionDeleteExpense').on('hidden.bs.modal',function() {
								self.fetchExpenses();
							});
		                },
		                error: function(res){
		                   alert(res.message);
		                   $("#optionDeleteExpense").modal('hide');
		                }
		            });
			},
			fetchExpenses : function(){
	    	 	var thisPtr=this;
	    	 	thisPtr.collection.assetId=this.propertyModel.get("assetId");
	        		thisPtr.collection.fetch({
	                success: function (res) {
	                	thisPtr.render();
	                },
	                error   : function (err) {
	                	console.log("Fetch Expenses: Error::" + err);
	                	$('.alert-danger').show();
	                }
	            });
	        },
	        applyPermissions : function() {
		    	 if($.inArray('AssetManagement', app.sessionModel.attributes.permissions)==-1) {
		    		 $('#showAddExpenseModal').remove();
		    		 $('#editExpense').remove();
		    		 $("a[name='deleteExpense']").remove();
		    	 }
		     }
		});
		return expensesView;
});