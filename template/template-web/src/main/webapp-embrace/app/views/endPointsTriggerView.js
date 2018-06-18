define(["backbone",
	"app",
	"text!templates/endPointsTrigger.html"
	],
	function(Backbone, app, endPointsTriggerPage){
	
		var endPointsTriggerView = Backbone.View.extend({
			initialize: function(){
				console.log("endPointsTriggerView initialize");
			},
			initializeData : function() {
				
			},
			events          : {
				'click button[name="refreshCache"]'  : "refreshCache",
				'click button[name="refreshDocusignTemplates"]'  : "refreshDocusignTemplates",
				'click button[name="clearMemcached"]'  : "clearMemcached"
			},
			el:"#mainContainer",
			render : function(){
				var self = this;
				this.template = _.template( endPointsTriggerPage );
				this.$el.html("");
				var arrayData=['','CodeList','DocusignTemplate','Role','Service','State','TaskPopup','UserRole','Workflow'];
				this.$el.html(this.template({refreshCachelist:arrayData}));
				this.initializeData();
				return this;
			},
			refreshCache : function(evt) {
				var self=this;
				var type=$(evt.currentTarget).data("object")+' ';
				var urlappend='';
				if(type.trim()!=''){
					urlappend='/'+type;
				}
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Refreshing '+type+'Cache... </div>'
				});
				$.ajax({
	                url: app.context()+'/cache/refresh'+urlappend,
	                type: 'GET',
	                success: function(res){
	                	$.unblockUI();
	                	$('#successMessage').show();
	    				$('#successMessage > text').html('');
	    				$('#successMessage > text').html('Successfully Refreshed '+type+'Cache');
	    				$('#successMessage').delay(2000).fadeOut(3000);
	                },
	                error: function(res){
	                	$.unblockUI();
	                	console.log('failed to Refresh '+type+'Cache');
	                	$('#errorMsg').show();
	    				$('#errorMsg > text').html('');
	    				$('#errorMsg > text').html('Failed to Refresh '+type+'Cache');
	    				$('#errorMsg').delay(2000).fadeOut(3000);
	                }
	            });
			},
			refreshDocusignTemplates : function(evt) {
				var self=this;
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Refreshing Docusign Templates... </div>'
				});
				$.ajax({
	                url: app.context()+'/docusign/refreshtemplates',
	                type: 'GET',
	                success: function(res){
	                	$.unblockUI();
	                	$('#successMessage').show();
	    				$('#successMessage > text').html('');
	    				$('#successMessage > text').html('Successfully Refreshed Docusign Templates');
	    				$('#successMessage').delay(2000).fadeOut(3000);
	                },
	                error: function(res){
	                	$.unblockUI();
	                	console.log('failed to Refresh Docusign Templates');
	                	$('#errorMsg').show();
	    				$('#errorMsg > text').html('');
	    				$('#errorMsg > text').html('Failed to Refresh Docusign Templates');
	    				$('#errorMsg').delay(2000).fadeOut(3000);
	                }
	            });
			},
			clearMemcached : function(evt) {
				var self=this;
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Clearing Memcached... </div>'
				});
				$.ajax({
	                url: app.context()+'/cache/clearmemcached',
	                type: 'GET',
	                success: function(res){
	                	$.unblockUI();
	                	$('#successMessage').show();
	    				$('#successMessage > text').html('');
	    				$('#successMessage > text').html('Successfully Cleared Memcached');
	    				$('#successMessage').delay(2000).fadeOut(3000);
	                },
	                error: function(res){
	                	$.unblockUI();
	                	console.log('Failed to Clear Memcached');
	                	$('#errorMsg').show();
	    				$('#errorMsg > text').html('');
	    				$('#errorMsg > text').html('Failed to Clear Memcached');
	    				$('#errorMsg').delay(2000).fadeOut(3000);
	                }
	            });
			}
		});
		
		return endPointsTriggerView;
});