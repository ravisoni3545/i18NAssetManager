define([ "backbone", "app" ], function(Backbone, app) {
	var userModel = Backbone.Model.extend({
		initialize: function () {
			_.bindAll(this);
        },
		defaults : {
			"userId" : null,
			"roleId" : null
		},
		url :function (){
			return app.context()+ "/user";
			
		},
		addRole : function(data){

			$.ajax({
                url: app.context()+'/user/role/edit',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(data),
                async:false,
                success: function(res){
                	console.log(res);
                },
                error: function(res){
                    console.log(res);
                }
            });

		},
		deleteRole : function(data){

			$.ajax({
                url: app.context()+'/user/role/edit',
                contentType: 'application/json',
                dataType:'json',
                type: 'DELETE',
                data: JSON.stringify(data),
                async:false,
                success: function(res){
                	console.log(res);
                },
                error: function(res){
                   console.log(res);
                }
            });
		},
		deleteUser : function(data){
			$.ajax({
                url: app.context()+'/user/edit',
                contentType: 'application/json',
                dataType:'json',
                type: 'DELETE',
                data: JSON.stringify(data),
                async:false,
                success: function(res){
                	console.log(res);
                },
                error: function(res){
                   console.log(res);
                }
            });

		},
		editUser : function(data, callback){
			var self = this;

			$.ajax({
                url: app.context()+'/user/edit/',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(data),
                async:false,
                success: function(res){
                	console.log("res.userId: " + res.user.userId);
                	console.log('sucess');
                	callback.success(res);
                	
                },
                error: function(res){
                   console.log('error');
                }
            });
		},
		getProfileInfo : function(userId,callback){
			console.log("getting profile info");
			var geturl = app.context()+'/user/profile/'+userId;
			console.log("url: " + geturl);
			$.ajax({
                url: app.context()+'/user/profile/'+userId,
                type: 'GET',
                contentType: 'application/json',
                async:false,
                success: function(res){
                	console.log("sucess");
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
		},
		getRoles : function(callback){
			$.ajax({
                url: app.context()+'/user/roles/',
                type: 'GET',
                contentType: 'application/json',
                async:false,
                success: function(res){
                	console.log("sucess");
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
		},
		updatePassword : function (updateRequestData,callback){
			var postdata = updateRequestData;
			$.ajax({
                url: this.url()+'/updatePassword/',
                contentType: 'application/json',
                dataType:'json',
                type: 'PUT',
                data: JSON.stringify(postdata),
                success: function(res){
                	callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });

		},
        resetUserPassword : function(data, callback){
            console.log("reset user api, data: " + JSON.stringify(data));
                $.ajax({
                url: app.context() +'/user/resetPassword',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(data),
                success: function(res){
                   callback.success(res);
                    //console.log('sucess');
                    //callback.success(res);
                    
                },
                error: function(res){
                   console.log('error in resetting password');
                   callback.error(res);
                }
            });


        },
	});

	return userModel;

});