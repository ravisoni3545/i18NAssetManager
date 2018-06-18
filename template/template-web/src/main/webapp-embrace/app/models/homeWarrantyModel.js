define([ "backbone", "app" ], function(Backbone, app) {
	var homeWarrantyModel = Backbone.Model.extend({

		initialize: function () {

        },
        investmentId:"",
		defaults : {

		},
		url :function (){
			var gurl=app.context()+ "/homeWarranty/";
			return gurl;
		},
        fetchHomeWarrantyDetails: function(callback){
            var self = this;
            self.fetch({
                url: self.url() + self.investmentId,
                success: function(){
                    callback.success();
                },
                error: function(){
                    callback.error();
                }
            });
        },
        saveHomeWarranty: function(currentForm,callback){
            var self = this;
            currentForm.ajaxSubmit({
                url: self.url() + "editHomeWarranty/" + self.investmentId,
                success:function(res){
                    callback.success();
                },
                error:function(){
                    callback.error();
                }
            });
        }
	});
	return homeWarrantyModel;
});