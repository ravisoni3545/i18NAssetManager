define([ "backbone", "app" ], function(Backbone, app) {
	var VendorCompanyModel = Backbone.Model.extend({

		defaults : {
			orgId:null,
			orgName:null,
			address1:null,
			address2:null,
			city:null,
			state:null,
			postalCode:null,
			revenueInformation:null,
			phone:null,
			url:null,
			parentOrganizationName:null,
			email:null,
			employees:null,
			nooffices:null,
			statusId:null
		},
		
		url :function (){
			
		},
		saveVendor:function(callback){
			
			var postdata=app.vendorCompanyModel.attributes;
			var url = null;
			var httpMethod = null;
			if (app.vendorUpdateFlow) {
				postdata.orgId = app.vendorId;
				url='update';
				httpMethod='PUT';
			} else {
				url='create';
				httpMethod='POST'
			}
			postdata.orgTypeId="1";
            $.ajax({
                url: app.context() + 'company/'+url,
                contentType: 'application/json',
                dataType: 'json',
                type: httpMethod,
                data: JSON.stringify(postdata),
                success: function (res) {
                	app.vendorCompanyModel.set(res);
                    if (!res.error) {
                        if (callback && 'success' in callback) callback.success('',res);
                    } else {
                        if (callback && 'error' in callback) callback.error('',res);
                    }
                },
                error: function (mod, res) {
                    if (callback && 'error' in callback) callback.error(res);
                }
            });
		},
		getVendor:function(callback){
			var self= this;
			$.ajax({
                url: app.context() + 'company/'+app.vendorId,
                contentType: 'application/json',
                dataType: 'json',
                type: 'GET',
                success: function (res) {
                	if(!app.vendorCompanyModel){
		    			app.vendorCompanyModel= self;
		    		}
                	app.vendorCompanyModel.set(res);
                    if (!res.error) {
                        if (callback && 'success' in callback) callback.success('',res);
                    } else {
                        if (callback && 'error' in callback) callback.error('',res);
                    }
                },
                error: function (mod, res) {
                    if (callback && 'error' in callback) callback.error(res);
                }
            });
		}
	});

	return VendorCompanyModel;

})