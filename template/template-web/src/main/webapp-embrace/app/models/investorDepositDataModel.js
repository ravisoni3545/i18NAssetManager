define([ "backbone", "app", "collections/investorTransactionDetailCollection" ], 
	function(Backbone, app, investorTransactionDetailCollection) {

	var investorDepositDataModel = Backbone.Model.extend({
		defaults : {
			transactionDetails: new investorTransactionDetailCollection(),
		},
		investorId:"",
		parentObject:"",
		url :function (){
			var gurl=app.context()+ "/investorDeposit/";
			return gurl
		},
		fetchInvestorDepositData: function(callback){
			var self = this;
			self.fetch({
				url: self.url() + "getInvestorDeposits/" + self.investorId,
				success: function(res){
                	console.log(res);
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
			});
		},
		saveConfirmReceipt: function(postData,callback){
			var self = this;
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			$.ajax({
				url: self.url() + "confirmDepositReceipt/" + self.attributes.financialTransactionId,
				contentType: 'application/json',
				dataType:'json',
				type: 'POST',
				data: JSON.stringify(postData),
				success: function(res){
					$.unblockUI();
					callback.success(res);
				},
				error: function(res){
					$.unblockUI();
					callback.error(res);
				}
			});
		},
		parse: function(response, options) {
			response.financialTransactionDetails= new investorTransactionDetailCollection(response.financialTransactionDetails);
        	return response;
		},
       deleteInvestorPayment:function(paymentIdToDelete,callback){
           $.ajax({
                   url: this.url()+'deleteInvestorPayment/'+paymentIdToDelete,
                   contentType: 'application/json',
                   dataType:'json',
                   type: 'DELETE',
                   success: function(res){
                       callback.success(res);
                   },
                   error: function(res){
                       callback.error(res);
                   }
               });
       },
       fetchInvestorProperties:function(investorId,callback){
           $.ajax({
               url: this.url()+'getInvestorProperties/'+investorId,
               contentType: 'application/json',
               dataType:'json',
               type: 'GET',
               async:false,
               success: function(res){
                   callback.success(res);
               },
               error: function(res){
                   callback.error(res);
               }
           });
      },
      saveInvestorPayment: function(postData,financialTransactionId,callback){
	  	$.ajax({
          	url: this.url()+'createOrUpdateInvestorPayment/'+financialTransactionId,
         	contentType: 'application/json',
			dataType:'json',
			type: 'POST',
			data: JSON.stringify(postData),
          	success: function(res){
            	callback.success(res);
          	},
          	error: function(res){
          		callback.error(res);
          	}
      	});
      }
       
	});

	return investorDepositDataModel;

})