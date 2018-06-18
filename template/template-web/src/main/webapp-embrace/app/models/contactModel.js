define([ "backbone", "app" ], function(Backbone, app) {
	var contactModel = Backbone.Model.extend({

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
		
		saveContact: function(opt1,opt2,opt3,callback){
			var postdata=opt3.attributes;
			postdata.objectId=opt2;
			postdata.object=opt1;
			postdata.createdBy=app.sessionModel.attributes.userId;
			
			console.log("saving contact"+postdata);
            $.ajax({
                url: this.url()+'/create',
                contentType: 'application/json',
                async:false,
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
        
    	editContact: function(opts,callback){
			var postdata=opts.attributes;
			
			//postdata.objectId=app.vendorId;
			postdata.lastModifiedBy=app.sessionModel.attributes.userId;
			
            $.ajax({
                url: this.url()+'/update',
                contentType: 'application/json',
                async:false,
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
        
        deleteContact: function(opts,callback){
            $.ajax({
                url: this.url()+'/delete/'+opts.attributes.contactId,
                contentType: 'application/json',
                async:false,
                dataType:'json',
                type: 'DELETE',
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

	return contactModel;

});