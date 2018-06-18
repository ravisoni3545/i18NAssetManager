define([ "backbone", "app" ], function(Backbone, app) {
    var currentRemarksModel = Backbone.Model.extend({

        initialize: function () {
          
        },
        defaults : {
            //investmentId : null,
        },
        url :function (){
            //var gurl=app.context()+ "/closing";
            //return gurl;
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
        
        submitRemarks :function(postdata,callback){
        	
        	$.ajax({
                url: app.context()+'/messages/createRemarks',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                async: false,
                data: JSON.stringify(postdata),
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        	
        }
        
        
    });

    return currentRemarksModel;
});
        