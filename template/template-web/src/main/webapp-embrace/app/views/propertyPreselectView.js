define([
"backbone",
"app",
"text!templates/propertyPreselect.html",
"views/propertyPreselectDetailsTabView",
"views/propertyPreselectPhotosTabView",
"views/propertyPreselectVideosTabView",
"views/propertyPreselectPixeetTabView",
"models/propertyModel",
"models/listingModel",
"accounting","models/propertyPreselectModel"
], function(Backbone,app,propertyPreselectTemplate, propertyPreselectDetailsTabView, propertyPreselectPhotosTabView,
 propertyPreselectVideosTabView, propertyPreselectPixeetTabView, propertyModel, listingModel, accounting,propertyPreselectModel){
	var propertyPreselectView = Backbone.View.extend({

		initialize: function(){
		 },
		 el:"#maincontainer",
		 events          : {
        "click #preselectDetails":"showPreselectDetailsTab",
        "click #preselectPhotos":"showPreselectPhotosTab",
        "click #preselectVideos":"showPreselectVideosTab",
        "click #preselectPixeet":"showPreselectPixeetTab",
        "click .ippropertypage" :"showippropertypage"
	     },
	     render : function (options) {
             var self = this;
             if(!app.propertyModel){
	    		app.propertyModel = new propertyModel();
	    	}
	    	this.propertyId = options.propertyId;
	    	app.propertyModel.set({"propertyId":this.propertyId});
		    app.propertyModel.fetch({async:false});
	     	if(!app.listingModel){
	     		app.listingModel = new listingModel();
	     	}
	     	app.listingModel.set({propertyId:options.propertyId,urlParam:"byProperty"});
	     	app.listingModel.fetch({async:false});

	     	if(!app.propertyPreselectModel){
	    		app.propertyPreselectModel = new propertyPreselectModel();
	    	}
	    	 app.propertyPreselectModel.set({"propertyId":this.propertyId});
            app.propertyPreselectModel.fetch({async:false});
            var isHUselect = false;
            if(app.propertyPreselectModel.toJSON().huselect !== null)
            	isHUselect = true;
             
            app.propertyModel.getHUSelectProperty({
	    			success: function(res){
	     				self.huSelect = res.huselect;
	    			},
	    			error: function(res){
	    				console.log("error in getting the huSelect");
	    			}
	    	});
             
             //console.log('render preselect');
             //console.log("options pid: " + options.propertyId);
	         this.propertyId = options.propertyId;
             //console.log("propertyId: " + this.propertyId);
	    	 this.template = _.template( propertyPreselectTemplate );
	     	 this.$el.html("");
	     	 this.$el.html(this.template({theProperty:app.propertyModel.toJSON(),theListing:app.listingModel.toJSON(), accounting: accounting, theHUSelect:this.huSelect, isHUselect:isHUselect}));
	     	 
             this.showPreselectDetailsTab();
	    	
	     	 return this;
	     },
        removeActiveTab:function(){
			$("li[name=preselectInfoNav].active").removeClass("active");
			$('div[name=preselectInfoTab].active').empty().removeClass("active");
		},
        showPreselectDetailsTab : function(){
        	var self=this;
            self.removeActiveTab();
             $("#preselectDetails").addClass('active');
            if(!this.propertyPreselectDetailsTabView){
                this.propertyPreselectDetailsTabView = new propertyPreselectDetailsTabView();     
            }
 this.propertyPreselectDetailsTabView.setElement($('#preselectDetailsTab')).render({parentView:self, propertyId:this.propertyId});
    
               
                $("#preselectDetailsTab").addClass('active');
        },
        showPreselectPhotosTab : function(){
            this.removeActiveTab();
             if(!this.propertyPreselectPhotosTabView){
                this.propertyPreselectPhotosTabView = new propertyPreselectPhotosTabView();
            }
            this.propertyPreselectPhotosTabView.setElement($('#preselectPhotosTab')).render({parentView:this, propertyId:this.propertyId});
            $('#preselectPhotos').addClass('active');
            $('#preselectPhotosTab').addClass('active');
            return this;
        },
        showPreselectVideosTab : function(){
            this.removeActiveTab();
           // console.log('videospreselect');
            if(!this.propertyPreselectVideosTabView){
             this.propertyPreselectVideosTabView = new propertyPreselectVideosTabView();   
            }
            
            this.propertyPreselectVideosTabView.setElement($("#preselectVideosTab")).render({parentView:this, propertyId:this.propertyId});
            
             $('#preselectVideos').addClass('active');
            $('#preselectVideosTab').addClass('active');
            return this;
        },
        showPreselectPixeetTab : function(){
           // console.log('pixeetpreselect');
            this.removeActiveTab();
            
            if(!this.propertyPreselectPixeetTabView){
             this.propertyPreselectPixeetTabView = new propertyPreselectPixeetTabView();   
            }
            
            this.propertyPreselectPixeetTabView.setElement($('#preselectPixeetTab')).render({parentView:this,propertyId:this.propertyId});
            
             $('#preselectPixeet').addClass('active');
            $('#preselectPixeetTab').addClass('active');
            return this;
        },
        showippropertypage: function(evt){
			var propertyId = $(evt.currentTarget).data("objectid");
			$.blockUI({
				baseZ: 999999,
				message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
			});
			var prePropIPPropertyPopup = window.open("","_blank");
			$.ajax({
				url: app.context()+'/property/getipproperty/'+propertyId,
				type: 'GET',
				success: function(res){
					$.unblockUI();
					prePropIPPropertyPopup.location = res;
				},
				error: function(res){
					$.unblockUI();
					console.log('failed to get Investor Portal Link:'+res);
				}
			});
		}
	    
	 });
	 return propertyPreselectView;
});