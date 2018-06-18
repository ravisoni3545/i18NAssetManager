define([
"backbone",
"app",
"text!templates/propertyPreselectPixeetTab.html",
"views/pixeetModalView",
"models/propertyPreselectModel",
"models/propertyModel"

], function(Backbone,app,propertyPreselectPixeetTabTemplate, pixeetModalView, propertyPreselectModel, propertyModel){
    var propertyPreselectPixeetTabView = Backbone.View.extend({

        initialize: function(){
         },
         el:"#propertyPreselectPixeetTab",
         events          : {
        "click button[name=addLinkBtn]":"addLink",
        "click button[name=deleteSelectedBtn]":"deleteSelected",
        "click button[name=pixeetPreview]" : "showPixeetModal",
        "click button[name=deleteConfirm]": "deleteTour",
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

         
             this.propertyId = options.propertyId;
             this.template = _.template( propertyPreselectPixeetTabTemplate );
             this.$el.html("");
             theModel.getPreselectMedia('tour',{
                    success: function(res){
                        self.$el.html(self.template({theLinks:res}));
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
            app.propertyPreselectModel.updatePreselectMedia('tours', $('#pixeet_url').val(),{
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
            var id = $(evt.target).closest('button').attr('tour-id');
            console.log('id is: ' + id);
            this.tourToDelete = id;
            
        },
        deleteTour : function(){
            var self = this;
            app.propertyPreselectModel.deleteLink('tour', self.tourToDelete,{
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
            $('#deleteTourConfirmationModal').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();      

        },
        showPixeetModal : function(evt){
            console.log('pixeet modal rendering');
             var url = $(evt.target).closest('button').attr('url');
            console.log('url is: ' + url);
            console.log('this ' + $(evt.target).text());
            var link = {};
            link["url"] = url;
            if(!app.pixeetModalView)
                app.pixeetModalView = new pixeetModalView();
            app.pixeetModalView.setElement($("#pixeetModalDiv"));
            app.pixeetModalView.render(link);
            
            
        },
        
     });
     return propertyPreselectPixeetTabView;
});