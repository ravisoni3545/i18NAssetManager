define([ "backbone", "app" ], function(Backbone, app) {
	var searchModelInvestors = Backbone.Model.extend({

		initialize: function () {
			_.bindAll(this);
        },
		
		defaults : {
			fname : null,
			email:null,
			tag:null,
			solutionSpecialist:null,
			currentInvestor:false
		},
		
		url :function (){
			var gurl=app.context();
			return gurl;
		},
		
		searchInvestor: function(opts,callback){
			var postdata=opts.attributes;
			
			$.ajax({
	                url: this.url()+'/investors/search/',
	                contentType: 'application/json',
	                type: 'POST',
	                data: JSON.stringify(postdata),
	                success: function(res){
	                	
	                    if(res){
	                        callback.success('',res);
	                    }else{
	                        callback.error('',res);
	                    }
	                },
	                error: function(res){
	                	console.log("Failed in investor search Model");
	                    callback.error('','Failed');
	                }
	            });
        }
        
        
	});
	
	return searchModelInvestors;

});