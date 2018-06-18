define([ "backbone", "app" ], function(Backbone, app) {
	var investorPreferencesModel = Backbone.Model.extend({

		initialize: function () {

        },
		investorId : null,
		url :function (){
			var gurl=app.context()+ "/investorProfile";
			return gurl;
		},
        fetchInvestorPreferences: function(callback){
            var self = this;
            self.fetch({
                url: self.url() + "/getInvestorPreference/" + self.investorId,
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error();
                }
            });
        },
		saveInvestorPreference: function(postdata,callback){
            var self = this;
            $.blockUI({
                baseZ: 999999,
                message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
            });
			$.ajax({
                url: this.url()+'/saveInvestorPreference',
                contentType: 'application/json',
                dataType:'json',
                data:JSON.stringify(postdata),
                type: 'POST',
                success: function(res){
                    $.unblockUI();
                    self.clear().set(res);
                	callback.success(res);
                },
                error: function(res){
                    $.unblockUI();
                    callback.error(res);
                }
            });
        }
	});
	return investorPreferencesModel;
});