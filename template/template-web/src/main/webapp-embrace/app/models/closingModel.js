define([ "backbone", "app" ], function(Backbone, app) {
	var closingModel = Backbone.Model.extend({

		initialize: function () {

        },
		defaults : {
			investmentId : null,
		},
		url :function (){
			var gurl=app.context()+ "/closing";
			return gurl;
		},
		getClosingInfo: function(investmentId,callback){
			$.ajax({
                url: this.url()+'/'+investmentId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
//		updateClosingInfo: function(updateRequestData,callback){
//			var postdata = updateRequestData;
//			$.ajax({
//                url: this.url()+'/update',
//                contentType: 'application/json',
//                dataType:'json',
//                type: 'PUT',
//                data: JSON.stringify(postdata),
//                success: function(res){
//                	callback.success({},res);
//                },
//                error: function(res){
//                    callback.error({},res);
//                }
//            });
//        },
        cancelClosing: function(callback){
			var postdata = this.attributes;
			$.ajax({
                url: this.url()+'/cancel',
                contentType: 'application/json',
                dataType:'json',
                type: 'DELETE',
                data: JSON.stringify(postdata),
                success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        getOtherInvestments: function(investorId,investmentId,callback){
			$.ajax({
                url: app.context()+ '/investment/otherInvestments/'+investorId+'/'+investmentId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        reopenClosing: function(requestObj,callback){
            var self = this;
            $.ajax({
                url: self.url() + '/reopenClosing/',
                contentType: 'application/json',
                dataType:'json',
                data:JSON.stringify(requestObj),
                type: 'POST',
                async: true,
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        },
        deleteClosing: function(requestObj,callback){
            var self = this;
            $.ajax({
                url: self.url() + '/deleteClosing/',
                contentType: 'application/json',
                dataType:'json',
                data:JSON.stringify(requestObj),
                type: 'POST',
                async: true,
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        }
        
	});

	return closingModel;

});