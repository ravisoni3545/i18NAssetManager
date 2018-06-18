define([
"backbone",
"app",
"text!templates/propertyPreselectPhotosTab.html",

], function(Backbone,app,propertyPreselectPhotosTabTemplate){
    var propertyPreselectPhotosTabView = Backbone.View.extend({

        initialize: function(){
         },
         el:"#propertyPreselectPhotosTab",
         events          : {
        "click button[name=addFilesBtn]":"addFiles",
        "click button[name=startUploadBtn]":"startUpload",
        "click button[name=cancelUploadBtn]":"cancelUpload",
        "click button[name=deleteSelectedBtn]":"deleteSelectedFiles",
        "click button[name=deleteBtn]":"deleteIndividualLink",
        "click button[name=logButton]":"logFiles",
        "submit form[name=uploadForm]":"reRender",
        "click button[name=deleteConfirm]": "deletePhoto"
         },
         render : function (options) {
             var self = this;
            // $('#uploadForm').submit(function(){return false;});
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
             var other ={};
             other["propertyId"] = this.propertyId;
             other["apilink"] = app.context()+'preSelectProperty/photos/add';
             this.apilink = other["apilink"];
             this.template = _.template( propertyPreselectPhotosTabTemplate );
             this.$el.html("");
             theModel.getPreselectMedia('photo',{
                    success: function(res){
                        self.$el.html(self.template({thePhotos:res, otherInfo:other}));
                        $('#fileuploadbox').hide();

                    },
                    error: function(res){
                        console.log(res);
                        console.log("error in getting photos");
                    }
            });
            
         },
        addFiles : function(){
            var self = this;
            console.log('add files');
              // prepare Options Object 
            var options = { 
                target: '#response', 
                url:        this.apilink, 
                success:    function() { 
                    console.log('success in uploading photos');
                },
                error: function(){
                    console.log("error in uploading photos");
                } 
            };
             
            $('#uploadForm').ajaxForm(function(options) { 
                console.log("success");
                self.render({"propertyId":self.propertyId});
            }); 
            $('#fileuploadbox').show();
        },
        startUpload : function(){
            console.log('start upload');
             

            },
        cancelUpload : function(){
            console.log('cancel upload');
            $('#fileuploadbox').hide();
        },
        deleteSelectedFiles : function(){
            console.log('delete selected files');
        },
        deleteIndividualLink : function(evt){
            console.log("dil");
            var self = this;
            var photoid = $(evt.target).closest('button').attr('photo-id');
            console.log('delete individual: photoid: ' + photoid);
            this.photoToDelete = photoid;
           
        },
        deletePhoto: function()
        {
            var self = this;
             app.propertyPreselectModel.deleteLink('photo', self.photoToDelete,{
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
                        console.log("error in deleting photo");
                    }
            });    
            $('#deletePhotoConfirmationModal').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();  
        },
        reRender : function(){
            $('#preselectPhotos').click();
            
        }
        
     });
     return propertyPreselectPhotosTabView;
});