define([ "backbone", "app" ], function(Backbone, app) {
	var documentTooltipModel = Backbone.Model.extend({

		initialize: function () {

        },
		defaults : {
			//investmentId : null,
		},
		url :function (){
			/*var gurl=app.context()+ "/closing";
			return gurl;*/
		},
        /*loadEachTaskDocument: function(taskKey,object,objectId,subTask,callback){
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
        },*/
        loadTaskSubObjectDocuments: function(taskKey_2,taskKey_1,object,objectId,subObject,subObjectId,callback){
        	$.ajax({
                url: app.context()+'/document/fetchsubObjectDocuments/'+object+'/'+objectId+'/'+subObject+'/'+subObjectId+'/'+taskKey_1+'/'+taskKey_2,
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
        
        loadTaskSubObjectMessages : function(taskKey_2,taskKey_1,object,objectId,subObject,subObjectId,callback){
        	$.ajax({
                url: app.context()+'/messages/fetchsubObjectMessages/'+object+'/'+objectId+'/'+subObject+'/'+subObjectId+'/'+taskKey_1+'/'+taskKey_2,
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
        }
        
	});

	return documentTooltipModel;

});