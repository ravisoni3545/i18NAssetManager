define([ "backbone", "app" ], function(Backbone, app) {
	var myInvestorsModel = Backbone.Model.extend({

		initialize: function () {
            _.bindAll(this);

        },
        
        url :function (){
			var gurl=app.context()+ "/myinvestors";
			return gurl;
		},
		
		defaults : {

		},
		 deleteWishlist: function(opt1,opt2,callback){

	        	//console.log("delete contact id"+opts.attributes.contactId);
				//console.log("in vendor contact delete model");
	            $.ajax({
	                url: this.url()+'/removeWishlist/member/'+opt1+'/property/'+opt2,
	                contentType: 'application/json',
	                dataType:'json',
	                type: 'DELETE',
	                //data: JSON.stringify(postdata),
	                success: function(res){
	                	//alert(res);
	                    if(!res.error){
	                        callback.success();
	                    }else{
	                        callback.error('',res);
	                    }
	                },
	                error: function(res){
	                    callback.error('','Failed');
	                }
	            });
	        }
        
	});

	return myInvestorsModel;

});