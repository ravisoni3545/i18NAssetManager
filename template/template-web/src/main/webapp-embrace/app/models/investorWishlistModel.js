define([ "backbone", "app" ], function(Backbone, app) {
	var investorWishlistModel = Backbone.Model.extend({

		initialize: function () {

        },
		defaults : {
			fname : null,
		},
		url :function (){
			var gurl=app.context()+ "/investors";
			return gurl;
		},
		getInvestors: function(callback){
			var postData = app.invWishlistModel.attributes;
        	$.blockUI({	
        		baseZ: 999999,
        		message: '<div><img src="assets/img/loading.gif" />Just a moment...</div>'
        	});
			$.ajax({
                url: this.url()+'/searchInvestorsWishlist',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data:JSON.stringify(postData),
                async: false,
                success:function(res){
        			if(res){
        				callback.success(res);
        			}
        			else{
        				callback.error(res);
        			}
        			$.unblockUI();
        		},
        		error: function(res){
        			callback.error(res);
        			$.unblockUI();	
        		}
            });
        }
		
	});

	return investorWishlistModel;

});