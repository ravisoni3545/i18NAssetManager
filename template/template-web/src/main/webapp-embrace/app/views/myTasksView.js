define([ "backbone", "app", "text!templates/myTasks.html","models/myTasksModel","collections/myTasksCollection","components-dropdowns", "components-pickers"], 
	function(Backbone, app, myTasks,myTasksModel,myTasksCollection) {
	
		var MyTasksView = Backbone.View.extend({
		initialize : function() {

		},
		events : {
			'click #searchInvestor' : 'searchInvestors',
			
		},
		self : this,
		el : {},
		collection: new myTasksCollection(),
		tasksData:{},
		
		render:function(){
				var thisPtr=this;
				thisPtr.showTasks();
				//thisPtr.template= _.template( myTasks );
				thisPtr.$el.html("");
				var data=this.tasksData;
				if(data==null){
					data="";
				}
				thisPtr.$el.html(_.template( myTasks )({tasklist:data}));
				
				var table =$('#tasklistTable').dataTable({
					"bPaginate":true,
					
					"bFilter":false,
					"deferRender": true,
					"aaSorting":[]
					
				});
				$('select[name=tasklistTable_length]').addClass('form-control');
		},
		
		showTasks: function(){
			var thisPtr=this;
			thisPtr.collection.fetch({async:false,
				success: function (data) {
					console.log(data.toJSON());
					thisPtr.tasksData=data.toJSON()[0].singleTask;
				},
				error   : function () {
					console.log("fail");
					$('.alert-danger').show();
				}
			});
	}
			
	});
	return MyTasksView;
});