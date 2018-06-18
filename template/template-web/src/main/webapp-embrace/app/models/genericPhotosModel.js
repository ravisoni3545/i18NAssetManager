define([ "backbone", "app" ], function(Backbone, app) {
	var genericPhotosModel = Backbone.Model.extend({

		initialize: function () {
            _.bindAll(this);
            console.log("object: " + this.object);
 			console.log("objectId: " + this.objectId);
        },

        url: function(){
        	return app.context() + '/photoUpload';
        },
		
		getFolders : function(callback){

			console.log("get folders of genericPhotosModel called");
			$.ajax({
                url: this.url() + '/' + this.object + '/' + this.objectId,
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

		uploadPhotos: function(callback, data){

			console.log("uploadPhotos/createFolder of genericPhotosModel called");
			  $.ajax({
                url: this.url()+'/addPhotos',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(data),
                success: function(res){          
                    callback.success();
                },
                error: function(res){
                    callback.error(res);
                }
            });
		},


	});

	return genericPhotosModel;

});