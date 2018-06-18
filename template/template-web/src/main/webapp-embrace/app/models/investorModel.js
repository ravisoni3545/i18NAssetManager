define([ "backbone", "app" ], function(Backbone, app) {
	var investorModel = Backbone.Model.extend({

		initialize: function () {

        },
		defaults : {
			investmentId : null,
		},
		url :function (){
			var gurl=app.context()+ "/investors";
			return gurl;
		},
		getInvestorInfo: function(investmentId,callback){
			$.ajax({
                url: this.url()+'/'+investmentId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        },
        addInvestorRecommendedlist: function (req, callback) {
        	var postdata = req;
        	$.ajax({
				url: this.url()+'/addInvestorsRecommendedlist',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data:JSON.stringify(postdata),
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }

			});
        },
        addInvestorWishlist2: function (req, callback) {
        	var postdata = req;
        	$.ajax({
				url: this.url()+'/addInvestorsWishlist',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data:JSON.stringify(postdata),
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }

			});
        },
        removeInvestorWishlist: function (wishlistId, callback) {
        	
        	$.ajax({
				url: this.url()+'/removeInvestorWishlist/'+encodeURIComponent(wishlistId),
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
        }
		
	});

	return investorModel;

});