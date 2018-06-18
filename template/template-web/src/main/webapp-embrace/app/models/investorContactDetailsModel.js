define([ "backbone", "app" ], function(Backbone, app) {
	var investorContactDetailsModel = Backbone.Model.extend({

		initialize: function () {
            _.bindAll(this);

        },
		
		defaults : {
		},
		
		url :function (){
			var gurl=app.context()+ "/investorContactDetails";
			return gurl;
		},
		
		updateContact: function(opt1,opt2,callback){
			var postdata=opt2.attributes;
			postdata.investorId=opt1;
			
            $.ajax({
                url: this.url()+'/updateContactDetails',
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

	return investorContactDetailsModel;

});