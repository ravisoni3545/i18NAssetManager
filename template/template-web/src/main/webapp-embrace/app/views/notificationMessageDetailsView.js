define(["text!templates/messageNotificationDetails.html","app","backbone"],
		function(msgNotificationsDetailstemplate,app, Backbone){
	
	var NotificationsMessageDetailsView = Backbone.View.extend( {
		initialize: function(){
			
			// this.render();
		},
		events :{

		},
		el:"#maincontainer",
		render : function () {
	    	
	    	
			this.fetchUserMessageNotifications();
			
	    },
	    
	
		fetchUserMessageNotifications :function(){
			console.log("inside fetchusernot");
			 var self = this;
        // create a view for message page and populate the response in the id of this view
            $.ajax({
                      type:"GET",
                      url:app.context()+"/notifications/messageNotificationsDetails/"+app.sessionModel.get("userId"),
                      async:false,
                      success:function(res){
                    	
                    	//self.$el.html('CHeck');
	             	    	self.MsgNotificationsDetailsTemplate = _.template(msgNotificationsDetailstemplate);
	             	    	
	             	    	self.$el.html("");
	             	    	self.$el.html(self.MsgNotificationsDetailsTemplate({messageNotificationDetailsData:res}));
             	    	
		             	   	var table =$('#notificationTable').dataTable({
		    					"bPaginate":true,
		    					
		    					"bFilter":false,
		    					"deferRender": true,
		    					"aaSorting":[]
		    					
		    				});
             	    	
             	   /* 	 // var headerEl = self.$el.find('#msgnotificationDetails');
             	     	 headerEl.html("");
             	     	 headerEl.html(self.MsgNotificationsDetailsTemplate({messageNotificationDetailsData:res}));
             	     	$('#msgnotificationDetails').show();*/


                      },
                      error:function(){

                      	console.log('error in retrieving messages notifications');
                      }
                


            });

		}, 
		

	     
		
	
	     
	     
	});
	return NotificationsMessageDetailsView;
});