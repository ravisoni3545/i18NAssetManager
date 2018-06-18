define(["text!templates/propertyPreselectDetailsTab.html", 
        "backbone",
        "app",
        "views/lastEditPreselectModalView",
        "SecurityUtil", 
        "models/propertyPreselectModel",
        "models/propertyModel",
        "accounting",
       ],
		function(propertyPreselectDetailsTab, Backbone, app, lastEditPreselectModalView, securityUtil, propertyPreselectModel, propertyModel, accounting){

	var propertyPreselectDetailsTabView = Backbone.View.extend({
		initialize: function(){
            var preselectPropertyDetailEdit=["preselectPropertyDetailEdit"];
            this.viewpermissions = {
'preselectPropertyDetailEdit':securityUtil.isAuthorised(preselectPropertyDetailEdit, app.sessionModel.attributes.permissions)			                        
			 };

		},

		el:"#propertyPreselectDetailsTab",
		self:this,
		propertyId:"",
		events : {
	        "click .editBtn":"editBtn",
	        "click button[name=cancelBtn]": "cancelGeneral",
	        "focusout input": "contentChanged",
	        "keyup input" : "upChanged",
	        "click button[name=saveBtn]": "saveGeneral",
	        "click a[href='lastEditModal']" : "showLastEditModal",
            "click .deleteBtn":"deletePreselect",
            "click input[name=showInv]": "changed",
            "click input[name=clr]": "clearBtn"
	    },
		render : function (options) {
            this.changed = true;
            var self = this;
            if(!app.propertyPreselectModel){
	    		app.propertyPreselectModel = new propertyPreselectModel();
	    	}
            if(!app.propertyModel){
                app.propertyModel = new propertyModel();   
            }
            this.propertyId = options.propertyId;
            this.parentView = options.parentView;
            app.propertyPreselectModel.set({"propertyId":this.propertyId});
            app.propertyPreselectModel.fetch({async:false});
            app.propertyModel.set({"propertyId":this.propertyId});
            app.propertyModel.fetch({async:false});
            
            var dataFinal = app.propertyModel.toJSON();
           $.extend(dataFinal,app.propertyPreselectModel.toJSON());
            
            if(dataFinal.huselect != null){
                console.log("select id: " + dataFinal.huselect.selectId);
                this.huSelectId = dataFinal.huselect.selectId;
                app.propertyPreselectModel.set({"huSelectId" : this.huSelectId})
            }
            
          
			this.template = _.template( propertyPreselectDetailsTab );
			this.$el.html("");
			this.$el.html(this.template({theData:dataFinal,viewpermissions:this.viewpermissions, accounting:accounting}));
           	$('#ilmcomment').hide();
           	$('.preselect-popovers').popover({
	            trigger:'hover',
	            'placement': 'top'
		    });

			return this;
		},
         editBtn : function(evt){
         	CKEDITOR.replace( 'editorOverview2' );
         	$('#cke_ilmcomment2').hide();
                                //CKEDITOR.config.readOnly = true;
             this.model = new propertyPreselectModel;
	    	this.model.set({propertyId:this.propertyId,dataStr:{}});

	    	$(evt.target).parents('.portlet').find("td.idata").each(function(key,row){

	    	 		var val = $(this).text();
	    	 		if($(this).hasClass("price"))
	    	 			$(this).replaceWith("<input type='text' class='"+((val.indexOf(".")==-1)?"currency":"currency2")+"' id='"+$(this).attr('id')+"' value='"+val.replace("$","").replace(/,/g,"")+"'>");
					else	
		    	 		$(this).replaceWith("<input type='text' id='"+$(this).attr('id')+"' value='"+val+"'>");
			    	$(".currency").formatCurrency({roundToDecimalPlace: 0});	
			    	$(".currency2").formatCurrency();	
	
	    	});

	    	$(evt.target).closest('.actions').replaceWith('<div class="actions"><button type="button" name="saveBtn" class="btn blue btn-sm"><i class="fa fa-check"></i>Save</button><button type="button" name="cancelBtn" style="color:black;" class="btn btn-sm">Cancel</button></div>');
	    	
             if($('#readyInv').is(':checked')){
             $('#checkbox').replaceWith('<span id="checkbox"><input class="checkbox"  name="showInv" id="readyInv" checked type="checkbox"></span>');
             }
             else{
                  $('#checkbox').replaceWith('<span id="checkbox"><input class="checkbox" name="showInv" id="readyInv" type="checkbox"></span>');
             }
        this.$el.find("button.editBtn").prop('disabled', true);
              //CKEDITOR.instances.ilmcomment.setReadOnly(false);
                 
	    },
	    cancelGeneral : function(evt) {
	    	this.render({"propertyId":this.propertyId});	
	    	evt.preventDefault();
	    },
	    contentChanged : function(evt) {

	    	var oldValue = evt.target.defaultValue.replace("$","").replace(/,/g,"");
	    	var fieldName = $(evt.target).attr('id');
	    	var newValue = $(evt.target).val().replace("$","").replace(/,/g,"");
	    	if(oldValue!=newValue){
                this.changed = true;
	    	}
	    	
	    	$(".currency2").formatCurrency();

	    },
        changed : function(){
            //console.log("checkbox clicked");
          this.changed = true;  
        },
	    upChanged : function(evt) {	
	    	if(evt.keyCode != 8 && evt.keyCode!=46)
		    	$(".currency").formatCurrency({roundToDecimalPlace: 0});
	    },
	    saveGeneral : function(evt) {
	    	$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
	    	var self = this;
	    	if(this.changed === false)
	    		console.log("There are no new changes");
	    	else{
                var data = {};
                data["propertyId"] = this.propertyId;
                data["readyInv"] = ($('#readyInv').is(':checked')?"1":"0");
                data["ilmcomment"] = CKEDITOR.instances.ilmcomment.getData();
                
    
                this.model.set("dataStr", data);
	    		this.model.updateModel({
	    			success: function(res){
	    				if(res.statusCode == "200"){
	    					console.log("success here");
	    					self.parentView.render({"propertyId":self.propertyId,async:false});
	    					$.unblockUI();
	    				}
	    				else{
	    					console.log(res);	
	    					console.log("failed to update");
	    					$.unblockUI();

	    				}
	    			},
	    			error: function(res){
	    				console.log(res);
	    				console.log("error in saving the object");
	    				$.unblockUI();

	    			}
	    		});
	    	}
	    	evt.preventDefault();		
	    },
         showLastEditModal : function(evt){             
	    	if(!app.lastEditPreselectModalView)
	    		app.lastEditPreselectModalView = new lastEditPreselectModalView();
	    	app.lastEditPreselectModalView.setElement($("#lastEditModalDiv"));
	    	$(evt.target).parents('portlet-body').css("border","soild red 1px");
			
	    	app.lastEditPreselectModalView.render(app.propertyPreselectModel);	
	    	evt.preventDefault();		
	    },
        deletePreselect : function(){
            var self=this;
            $.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
            app.propertyPreselectModel.deletePreselect({
	    			success: function(res){
	    				if(res.statusCode == "200"){
	    					console.log("success");
	    					self.parentView.render({"propertyId":self.propertyId,async:false});
							$.unblockUI();
						}
	    				else{
	    					console.log(res);	
	    					console.log("failed to update");
	    					$.unblockUI();
	    				}
	    			},
	    			error: function(res){
	    				console.log(res);
	    				console.log("error in removing from preselect");
	    				$.unblockUI();
	    			}
	    		});
        },
        clearBtn : function(){
            
            $(".editBtn").click();
            CKEDITOR.instances.ilmcomment.setData("");
                        CKEDITOR.instances.ilmcomment2.setData("");

            $('#checkbox').replaceWith('<span id="checkbox"><input class="checkbox" name="showInv" id="readyInv" type="checkbox"></span>');
            
            
        }
	});
	return propertyPreselectDetailsTabView;
});