define(["text!templates/header.html","text!templates/messageNotifications.html","text!templates/msgNotificationstemplate.html","app","backbone","sock","stomp","notify"],function(headerPage,messagesNotifications,msgNotificationstemplate,app, Backbone,notify){
	
	var MessagesNotificationsView = Backbone.View.extend( {
		initialize: function(){
			 app.websocketClient = {};
			 app.websocketClient.stompClient=null;
			 this.connect();
//			 this.fetchUserMessageNotifications();
		},
		events :{
                  "click .MsgNotfy":"fetchUserMessageNotifications"


		},
		el:"body",
		render : function (msg) {
	    	
	    	
			 this.fetchUserMessageNotifications();
			
	    },
	    
		fetchUserMessageNotificationCount :function(){
                
              var notificationcount=0;
                 $.ajax({
                	type : "GET",
                	url  : app.context()+"/notifications/messageNotificationCount/"+app.sessionModel.get("userId"),
                	async:false,
                	success:function(res)
                	{
                		

                		//console.log(res);
                		notificationcount=res;
                		//if(res>0){
                		//$("#msgNotificationCount").html(res);
                		//$(".MsgNotfy").show();
                	},
                	
                	error: function(){

                		console.log('fail to retrieve the notification count');
                	}		
                 
                    });
                return notificationcount;


		},
		fetchUserMessageNotifications :function(){
			//console.log("inside fetchusernot");
			 var self = this;
        // create a view for message page and populate the response in the id of this view
            $.ajax({
                      type:"GET",
                      url:app.context()+"/notifications/messageNotifications/"+app.sessionModel.get("userId"),
                      async:false,
                      success:function(res){
                    	//console.log(res);
                    	
             	    	self.MsgNotificationsTemplate = _.template(msgNotificationstemplate);
             	    	
             	    	  var headerEl = self.$el.find('#msgnotification');
             	     	 headerEl.html("");
             	     	 headerEl.html(self.MsgNotificationsTemplate({messageNotificationData:res}));
             	     	//$('#msgnotification').show();
             	     $("#msgNotificationCount").html("");


                      },
                      error:function(){

                      	console.log('error in retrieving messages notifications');
                      }
                


            });

		}, 
		
		connect:function() {
			var self = this;
			var msg={};
	         var socket = new SockJS("embrace2/com.homeunion");
	         app.websocketClient.stompClient = Stomp.over(socket);            
	         app.websocketClient.stompClient.connect({}, function(frame) {
	            // setConnected(true);
	        	 //Ajax call to get the list of unread msg for notification display
	            // console.log('Connected: ' + frame);
	            
	         
	             app.websocketClient.stompClient.subscribe('/user/topic/greetings', function(greeting){
	            	 if(app.headerView){
	            		// console.log(greeting);
	            		 //app.headerView.showNotification(greeting);
	            		 msg=JSON.parse(greeting.body);
	            		 app.headerView.showNotification(1);
	            		 if(msg.messageText){
	             		$.notify(msg.messageText,{
	             			  	className:'success',
	             				clickToHide: true,
	             				autoHide: true,
	             				autoHideDelay: 8000,
	             				arrowShow: true,
	             				arrowSize: 5,
	             				breakNewLines: true,
	             				elementPosition: "bottom",
	             				globalPosition: "bottom right",
	             				style: "bootstrap",
	             				showAnimation: "slideDown",
	             				showDuration: 2000,
	             				hideAnimation: "slideUp",
	             				hideDuration: 4000,
	             				gap: 5
	             			});
	            		 }
	             		
	            		 
	            	 }
	             });
	         });
	     },
	     
		/*   showNotification:function (message) {
			   console.log("Inside Show Notification");
	          var response = document.getElementById('response');
	          var p = document.createElement('p');
	          p.style.wordWrap = 'break-word';
	          p.appendChild(document.createTextNode(message));
	          response.appendChild(p);
			   
			//   var newres=$("#msgNotificationCount").val()+res;
       		$("#msgNotificationCount").html(1);
       		$(".MsgNotfy").show();
	      },*/
	     
	    disconnect:function() {
	         if (app.websocketClient.stompClient != null) {
	        	 app.websocketClient.stompClient.disconnect();
	        	 
	         }
	        // setConnected(false);
	         console.log("Disconnected");
	     }
	     
	     
	   /*  app.websocketClient.sendName = function(sendData) {
	         var name = document.getElementById('name').value;
	    	 console.log(sendData);
	         app.websocketClient.stompClient.send("/app/com.homeunion", {}, JSON.stringify({ 'name': sendData }));
	     }*/
	     
	     
	});
	return MessagesNotificationsView;
});