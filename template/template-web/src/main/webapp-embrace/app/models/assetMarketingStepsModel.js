define([ "backbone", "app" ], function(Backbone, app) {
    var marketingStepsModel = Backbone.Model.extend({

        initialize: function () {

        },
        defaults : {
            //marketingId : null,
        },
        url :function (){
            var gurl=app.context()+ "/assetMarketing";
            return gurl;
        },
        getMarketingInfo: function(marketingId,callback){
            $.ajax({
                url: this.url()+'/assets/'+marketingId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        cancelMarketing: function(postdata,callback){
            $.ajax({
                url: this.url()+'/cancel',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                async: true,
                data: JSON.stringify(postdata),
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        completeMarketing: function(object,objectId,callback){
            $.ajax({
                url: this.url()+'/complete'+'/'+object+'/'+objectId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: true,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        submitTaskData: function(form,callback){
            form.attr("enctype","multipart/form-data");
            form.ajaxSubmit({
                url: this.url()+'/process',
                async:true,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        loadTaskData: function(taskKey,object,objectId,callback){
            $.ajax({
                url: this.url()+'/task/'+object+'/'+objectId+'/'+taskKey,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        loadEachTaskDocument: function(taskKey,object,objectId,subTask,callback){
            $.ajax({
                url: this.url()+'/task/documents/'+object+'/'+objectId+'/'+taskKey+'/'+subTask,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        loadEachTaskMessage: function(taskKey,object,objectId,callback) {
            $.ajax({
                url: app.context()+'/messages/task/'+object+'/'+objectId+'/'+taskKey,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        loadAllMessagesAndDocuments: function(object,objectId,callback) {
            $.ajax({
                url:this.url()+'/tasks/allDocumentsAndMessages/'+object+'/'+objectId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        loadTaskSubObjectDocuments: function(taskKey,object,objectId,subObject,subObjectId,callback){
            $.ajax({
                url: this.url()+'/task/subObjectDocuments/'+object+'/'+objectId+'/'+taskKey+'/'+subObject+'/'+subObjectId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        
        loadTaskSubObjectMessages : function(taskKey,object,objectId,subObject,subObjectId,callback){
            $.ajax({
                url: app.context()+'/messages/subObjectMessages/'+object+'/'+objectId+'/'+taskKey+'/'+subObject+'/'+subObjectId,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        },
        
    });

    return marketingStepsModel;
});
