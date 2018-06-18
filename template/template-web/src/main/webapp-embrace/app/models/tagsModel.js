define([ "backbone", "app" ], function(Backbone, app) {
    var tagsModel = Backbone.Model.extend({

        initialize: function () {

        },
        defaults : {
        },
        url :function (){
            var gurl=app.context()+ "/objectTag";
            return gurl;
        },
        getAvailableTags: function(object,objectId,callback){
            $.ajax({
                url: this.url()+'/tags/'+object+'/'+objectId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        } ,
        getObjectTags: function(object,objectId,callback){
              $.ajax({
                url: this.url()+'/'+object+'/'+objectId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        },
        addTag: function(data,callback){
            $.ajax({
                url: this.url()+'/',
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
        deleteTag: function(objectId,callback){
            $.ajax({
                url: this.url()+'/'+objectId,
                contentType: 'application/json',
                dataType:'json',
                type: 'DELETE',
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        },
        
    });

    return tagsModel;
});
