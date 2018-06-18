define([ "backbone", "app" ], function(Backbone, app) {
	var propertyPreselectModel = Backbone.Model.extend({

		initialize: function () {
			_.bindAll(this);
        },
		defaults : {
            "propertyId" : null,
            "huSelectId" : null	
        },

		
		url : function (){

			return app.context()+"/preSelectProperty/property/"+encodeURIComponent(this.get("propertyId"));
		},

        context : function(){

            return app.context()+"/preSelectProperty/photos/add";
        },
		updateModel: function (callback){

			var postdata = this.attributes;	
			postdata.dataStr = JSON.stringify(this.attributes.dataStr);
             //console.log("postdata bidrange model: " + postdata.dataStr);


			$.ajax({
                url: app.context()+'/preSelectProperty/property/edit',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: postdata.dataStr,
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
		},
		getLastEditHistory : function (callback){
            
			$.ajax({
                url: app.context()+'/preSelectProperty/lastEdit/'+this.get('huSelectId'),
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                success: function(res){
                    
                	console.log(res);
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
		},
        deletePreselect : function(callback){
            var data = {};
            data["propertyId"] = this.attributes.propertyId;
          
            $.ajax({
                url: app.context()+'/preSelectProperty/property/remove',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(data),
                success: function(res){
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        },
        getPreselectMedia : function(type,callback){
            
        $.ajax({
                url: app.context()+'/preSelectProperty/'+this.get('huSelectId')+'/'+type,
                contentType: 'application/json',
                dataType:'json',
                type: 'GET',
                async: false,
                success: function(res){
                    
                	console.log(res);
                	callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });
        
        },
        
        updatePreselectMedia: function(type, link, callback){
            console.log("preselect media update, propertyId: " + this.attributes.propertyId);
        var data = {};
        data["propertyId"] = this.attributes.propertyId;
        if(type === "videos")
        {
            data['videoUrls'] = [link];
        }
        else
        {
            data['tourUrls'] = [link];
        }
        
        $.ajax({
                url: app.context()+'/preSelectProperty/' + type + '/add',
                contentType: 'application/json',
                dataType:'json',
                type: 'POST',
                data: JSON.stringify(data),
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });

            
        },
        deleteLink: function(type, link, callback){
            console.log("deleteing link: type: "+ type + " link: " + link);
            var data = {};
            data["mediaType"] = type;
            data["deleteLinkIds"] = [link];
            console.log("data: " + JSON.stringify(data));
            $.ajax({
                url: app.context()+'/preSelectProperty/huSelectMedia/delete',
                contentType: 'application/json',
                dataType:'json',
                type: 'DELETE',
                data: JSON.stringify(data),
                success: function(res){
                    callback.success(res);
                },
                error: function(res){
                    callback.error(res);
                }
            });


        },
        uploadPhoto: function(datap){
          


        }
	});

	return propertyPreselectModel;

});