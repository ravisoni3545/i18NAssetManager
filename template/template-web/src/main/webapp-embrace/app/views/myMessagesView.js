define(["text!templates/myMessages.html","backbone","app"],
		function(myMessagesPage,Backbone,app){
	
		var MyMessagesView = Backbone.View.extend( {
			initialize: function(){
		
			},
			 el:"#maincontainer",
			events:{
			"click #sendBtn":"sendMessage"
			},
		
			render:function(){
				this.$el.html("");
				this.$el.html(_.template(myMessagesPage));
			},
			
			sendMessage :function(){
			
				var sendData=$("#sendMessage").val();
				app.websocketClient.sendName(sendData);
				
			}
			
		});
		return MyMessagesView;

	});