define([ "backbone", "app" ], function(Backbone, app) {
	var listingModel = Backbone.Model.extend({

		initialize: function () {
			_.bindAll(this);
        },
		defaults : {
			"listingId" : null,
			"propertyId" : null,
			"urlParam" : null
		},
		
		url :function (){

			return app.context()+"/listing/"+((this.get("urlParam") == null || this.get("urlParam") == '')?"":this.get("urlParam")+"/")+((this.get("urlParam") == null || this.get("urlParam") == '')?encodeURIComponent(this.get("listingId")):encodeURIComponent(this.get("propertyId")));
		},
		updateModel: function (callback){

			var postdata = this.attributes;	
			postdata.dataStr = JSON.stringify(this.attributes.dataStr);

			$.ajax({
                url: app.context()+'/listing/edit',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(postdata),
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
		},
		getLastEditHistory : function (callback){

			$.ajax({
                url: app.context()+'/listing/lastEdit/'+encodeURIComponent(this.get('propertyId')),
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                success: function(res){
                	console.log(res);
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
		},

		deletePhoto : function(data, callback){
			$.ajax({
                url: app.context()+'/listing/photos/',
                contentType: 'application/json',
                dataType:'json',
                type: 'DELETE',
                data: JSON.stringify(data),
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });

		},

		makeDefaultPhoto : function(data, callback){
			$.ajax({
                url: app.context()+'/listing/photos/makeDefault',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(data),
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });

		},
		
		toggleShowOnWeb : function(data, callback){
			$.ajax({
                url: app.context()+'/listing/photos/toggleWeb',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(data),
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });

		}
		/*propertyDetail: function(opts,callback){
			
			var postdata=opts.attributes;
			
			$.ajax({
	                url: this.url()+'/'+,
	                contentType: 'application/json',
	                dataType:'json',
	                type: 'POST',
	                data: JSON.stringify(postdata),
	                success: function(res){
	                	//alert(res);
	                    if(res){
	                        callback.success('',res);
	                    }else{
	                        callback.error('',res);
	                    }
	                },
	                error: function(res){
	                    callback.error('','Failed');
	                }
	            });
        }*/
          
	});

	return listingModel;

});