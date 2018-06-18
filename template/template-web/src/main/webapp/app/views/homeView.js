define(["text!templates/hello.html", "backbone","app","models/labelModel","collections/labels","text!templates/labels.html"],
		function(helloPage, Backbone,app,labelModel,labels,labelHtml){
	 var HomeView = Backbone.View.extend( {
		 initialize: function(){
		 },
		 el:"#maincontainer",
		 collection:new labels(),
		 self:this,
		 events          : {
			 "click a[href=#searchTags]":"showSearchPage"
	         
	     },
	     
	     render : function () {
	    	 this.template = _.template( helloPage );
	     	 this.$el.html("");
	     	 this.$el.html(this.template());
	     	 return this;
	     },
	     
	     showSearchPage : function(){
	    	 var thisPtr= this;
	    	 thisPtr.collection.labelValue=$("[name='labelValue']").val();
	    	 
	    	 thisPtr.collection.fetch({async:false,
					success: function (data) {
						
						thisPtr.models=data.toJSON();
						console.log(thisPtr.models);
					},
					error   : function () {
						console.log("fail");
					}
				});

				thisPtr.template = _.template( labelHtml );
				data=thisPtr.models;
				if(data==null){
					data="";
				}
				$('#renderSearchTable').html(this.template({labelModel:data}));
	     }
	 });
	 return HomeView;
});