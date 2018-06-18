define([ "backbone", "app" ], function(Backbone, app) {
	var InsuranceModel = Backbone.Model.extend({
		initialize : function() {

		},
		defaults : {

		},
		url : function() {
			var gurl = app.context() + "/closing";
			return gurl;
		},
		submitTaskData : function(form, callback) {
			form.attr("enctype","multipart/form-data");
			form.ajaxSubmit({
				url : this.url() + '/process',
				async : false,
				success : function(res) {
					callback.success({}, res);
				},
				error : function(res) {
					callback.error({}, res);
				}
			});
		}
	});

	return InsuranceModel;

})