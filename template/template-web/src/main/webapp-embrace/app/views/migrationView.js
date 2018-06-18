define(["backbone","app","text!templates/migration.html"],
		function(Backbone,app,migrationPage){
	var migrationView=Backbone.View.extend({
		initialize: function(){

		},
		events : {
		},
		self:this,
		el:"#maincontainer",
		render : function (taskKey) {
			var thisPtr = this;
			thisPtr.template = _.template(migrationPage);
			thisPtr.$el.html("");

			this.$el.html(this.template());
			if(taskKey) {
				this.startClosingMigrationForTask(taskKey);
			} else {
				this.startClosingMigration();
			}
			return this;
		},

		startClosingMigrationForTask : function(taskKey){
			$('#progress').html('Started migation for all closings for task '+taskKey.taskKey+'. This may take few minutes..');
			$.ajax({
                url: app.context()+ "/closing/migrate/allForTask/"+taskKey.taskKey,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: true,
                success: function(res){
                	$('#progress').append("<br>Successfully migrated all closings. Inserted task "+taskKey.taskKey);
                },
                error: function(res){
                	$('#progress').append("<br>Error in migrating closings for task "+taskKey.taskKey);
                }
            });	
		},
		
		startClosingMigration : function(){
			$('#progress').html('Started migation for all closings. This may take few minutes..');
			$.ajax({
                url: app.context()+ "/closing/migrate/all",
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: true,
                success: function(res){
                	$('#progress').append("<br>Successfully migrated all closings.");
                },
                error: function(res){
                	$('#progress').append("<br>Error in migrating closings.");
                }
            });
		}
	});
	return migrationView;
});