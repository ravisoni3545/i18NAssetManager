define([ "backbone", "app" ], function(Backbone, app) {
	var investorDetailstModel = Backbone.Model.extend({

		initialize: function () {

        },
		
		defaults : {
		},
		
		url :function (){
			var gurl=app.context()+ "/investorDetails";
			return gurl;
		},
		
		saveInvDetails: function(opt1,opt2,callback){
			var postdata=opt2.attributes;
			postdata.investorId=opt1;
			
            $.ajax({
                url: this.url()+'/updateInvestor',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(postdata),
                success: function(res){
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

	return investorDetailstModel;

});