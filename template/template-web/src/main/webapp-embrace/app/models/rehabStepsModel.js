define([ "models/closingStepsModel","backbone", "app" ], function(closingStepsModel,Backbone, app) {
    var rehabStepsModel = closingStepsModel.extend({

        initialize: function () {

        },
        defaults : {
            //investmentId : null,
        },
        rehabUrl :function (){
            var gurl=app.context()+ "/rehabSteps";
            return gurl;
        },
        submitRehabTaskData: function(form,callback){
            form.attr("enctype","multipart/form-data");
            form.ajaxSubmit({
                url: this.rehabUrl()+'/process',
                async:true,
                success: function(res){
                    callback.success({},res);
                },
                error: function(res){
                    callback.error({},res);
                }
            });
        }
    });

    return rehabStepsModel;
});
