define([
"backbone",
"app",
"text!templates/propertyPreselectVideosTab.html",
"views/vimeoModalView",
"models/propertyPreselectModel",
"models/propertyModel"

], function(Backbone,app,propertyPreselectVideosTabTemplate, vimeoModalView, propertyModel){
    var propertyPreselectVideosTabView = Backbone.View.extend({

        initialize: function(){
         },
         el:"#propertyPreselectVideosTab",
         events          : {
        "click button[name=addLinkBtn]":"addLink",
        "click button[name=deleteSelectedBtn]":"deleteSelected",
        "click button[name=vimeoPreview]":"showPreviewModal",
        "click button[name=deleteConfirm]": "deleteVideo"
         },
         render : function (options) {
            var self = this;
             
            if(!app.propertyPreselectModel){
                app.propertyPreselectModel = new propertyPreselectModel();
            }
            if(!app.propertyModel){
                app.propertyModel = new propertyModel();   
            }
            this.propertyId = options.propertyId;
            console.log("propertyid from options: " + options.propertyId);
            app.propertyPreselectModel.set({"propertyId":this.propertyId});
            app.propertyPreselectModel.fetch({async:false});
            app.propertyModel.set({"propertyId":this.propertyId});
            app.propertyModel.fetch({async:false});
            
            
            if(app.propertyModel.toJSON.huselect != null){
                console.log("select id: " + dataFinal.huselect.selectId);
                this.huSelectId = app.propertyModel.toJSON.huselect.selectId;
                app.propertyPreselectModel.set({"huSelectId" : this.huSelectId})
            }
             var theModel = app.propertyPreselectModel;

         
             this.template = _.template( propertyPreselectVideosTabTemplate );
             this.$el.html("");
             theModel.getPreselectMedia('video',{
                    success: function(res){
                        self.$el.html(self.template({theVideos:res}));
                    },
                    error: function(res){
                        console.log(res);
                        console.log("error in getting preselectMedia");
                    }
            });
             return this;
         },
        addLink : function(){
            var self = this;
            console.log('add link videos');
            if(!app.propertyPreselectModel){
                app.propertyPreselectModel = new propertyPreselectModel();
            }
            app.propertyPreselectModel.updatePreselectMedia('videos', $('#video_url').val(),{
                    success: function(res){
                        if(res.statusCode == "200"){
                            console.log("success");
                            self.render({"propertyId":self.propertyId});
                        }
                        else{
                            console.log(res);   
                            console.log("failed to update");
                        }
                    },
                    error: function(res){
                        console.log(res);
                        console.log("error in adding link");
                    }
                });

        },
        deleteSelected : function(evt){
             var self = this;
            console.log('delete selected files');
            var id = $(evt.target).closest('button').attr('video-id');
            console.log('id is: ' + id);
            if(!app.propertyPreselectModel){
                app.propertyPreselectModel = new propertyPreselectModel();
            }
            this.videoToDelete = id;
            

        },
        deleteVideo : function(){
            var self=this;
            app.propertyPreselectModel.deleteLink('video', self.videoToDelete,{
                    success: function(res){
                        if(res.statusCode == "200"){
                            console.log("success");
                            self.render({"propertyId":self.propertyId});
                        }
                        else{
                            console.log(res);   
                            console.log("failed to update");
                        }
                    },
                    error: function(res){
                        console.log(res);
                        console.log("error in deleting link");
                    }
            });      

            $('#deleteVideoConfirmationModal').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        },
        showPreviewModal : function(evt){
            console.log('previewButtonClicked');
            var url = $(evt.target).closest('button').attr('url');
            console.log('url is: ' + url);
            console.log('this ' + $(evt.target).text());
            var url2 = url.substring(url.lastIndexOf('/')+1, url.length);
            console.log("end of url: " + url2);
            var link = {};
            link["url"] = url2;
            if(!app.vimeoModalView)
                app.vimeoModalView = new vimeoModalView();
            app.vimeoModalView.setElement($("#vimeoModalDiv"));
            app.vimeoModalView.render(link);
            
        }
        
     });
     return propertyPreselectVideosTabView;
});