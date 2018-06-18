define(['backbone','app'],function(Backbone, app){

var rolePermissionModel = Backbone.Model.extend({

	url:function(){
		return app.context() + '/rolePermission/';
	},

	getPermissions: function(roleId,callback){
		console.log('getting permissions');
		$.ajax({
                url: this.url()+ roleId,
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

	addPermissions: function(data,callback){
		console.log('addPermissions');
		$.ajax({
                url: this.url(),
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(data),
                async:false,
                success: function(res){
                	console.log(res);
                	callback.success(res);
                },
                error: function(res){
                    console.log(res);
                    callback.success(res);
                }
            });

	},
	deletePermissions: function(data, callback){
		console.log('deletePermissions');
		$.ajax({
                url: this.url(),
                contentType: 'application/json',
                dataType:'json',
                type: 'DELETE',
                data: JSON.stringify(data),
                async:false,
                success: function(res){
                	console.log(res);
                	callback.success(res);
                },
                error: function(res){
                    console.log(res);
                    callback.success(res);
                }
            });
	}

	});
	return rolePermissionModel;
});