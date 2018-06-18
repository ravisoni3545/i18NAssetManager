define([ "backbone", "app" ], function(Backbone, app) {
	var vendorContactModel = Backbone.Model.extend({

		initialize: function () {
            _.bindAll(this);

        },
		
		defaults : {
			contactName : null,
			contactType:null,
			objectId:null,
			createdBy:null
		},
		
		url :function (){
			var gurl=app.context()+ "/contact";
			return gurl;
		},
		
		saveVendorContact: function(opts,callback){
			var postdata=opts.attributes;
			
			//postdata.contactType=$("#contactType").val();
			postdata.objectId=app.vendorId;
			postdata.createdBy=app.sessionModel.attributes.userId;
			//console.log("CreatedBy"+app.sessionModel.userId);
			
			console.log("saving contact"+postdata);
			//alert($("#addressType").val());
            $.ajax({
                url: this.url()+'/create',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(postdata),
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
        },
        
    	editVendorContact: function(opts,callback){
    		//console.log(app.vendorContactModel);
			var postdata=opts.attributes;
			
			postdata.objectId=app.vendorId;
			postdata.lastModifiedBy=app.sessionModel.attributes.userId;
			
			console.log("in vendor contact model"+postdata);
            $.ajax({
                url: this.url()+'/update',
                contentType: 'application/json',
                dataType:'json',
                type: 'PUT',
                data: JSON.stringify(postdata),
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
        },
        
        deleteVendorContact: function(opts,callback){
    		//console.log(app.vendorContactModel);
			//var postdata=opts.attributes;
			//postdata.objectId=app.vendorId;
        	console.log("delete contact id"+opts.attributes.contactId);
			console.log("in vendor contact delete model");
            $.ajax({
                url: this.url()+'/delete/'+opts.attributes.contactId,
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

	return vendorContactModel;

});