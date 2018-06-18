define(["backbone","app","text!templates/finalWalkThroughModal.html","text!templates/finalWalkThroughResponsesRow.html"],
	function(Backbone,app,finalWalkThroughModal,finalWalkThroughReponsesRow){
		var finalWalkThroughView=Backbone.View.extend({
			initialize: function(){
				
			},
			events : { 
				'click .saveInspectionResponseData': 'saveInspectionResponseData'
			},
			el:"#FINAL_WALK_THROUGH_RENDER_DIV",
			responseItems:[],
			callBackData:{},
			render : function (options) {
				var self = this;
				self.parentModel = options.parentModel;
				self.parentObject = options.parentObject;
				self.parentObjectId = options.parentObjectId;
				self.$el.html("");
				self.$el.html(_.template(finalWalkThroughModal));
		    },
		    populateResponseItems: function(res){
		    	var self = this;
		    	console.log(res);
		    	self.responseItems = res.responseItems;
		    	self.renderResponseItemsTable();
		    },
		    renderResponseItemsTable: function(){
		    	var self = this;
		    	var tableTemplate = _.template(finalWalkThroughReponsesRow)({responseItems:self.responseItems});
		    	self.$el.find("table tbody").html("");
		    	self.$el.find("table tbody").html(tableTemplate);
		    	App.handleUniform();
		    },
		    saveInspectionResponseData: function(evt){
		    	var self = this;
		    	var currentForm = $(evt.currentTarget).closest('tr').find('form.finalWalkThroughResponseForm');
		    	var responseId = currentForm.find('input[name=responseId]').val();
		    	var categoryName = $(evt.currentTarget).closest('tr').find('#categoryName').text();
		    	var responseText = $(evt.currentTarget).closest('tr').find('#responseText').text();
		    	var isCompletedElement = $(evt.currentTarget).closest('tr').find('input[name=isCompleted]:checked');
		    	var data = {};
//		    	data.object = self.parentObject;
		    	data.objectId = self.parentObjectId;
		    	data.categoryName = categoryName;
		    	data.responseText = responseText;
		    	data.isCompleted = isCompletedElement.val();
		    	
		    	var repairDocument = currentForm.find('input[name=repairPictures]');
		    	if(repairDocument && repairDocument.val() == "") {
					repairDocument.attr("disabled","disabled");
				}

		    	$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});
		    	self.parentModel.submitInspectionResponseData(currentForm,data,{
		    		success:function(res){
		    			console.log("Success: saveInspectionResponseData");
		    			if(res && res.responseDTO){
		    				var requiredItem = _.findWhere(self.responseItems, { responseId: responseId });
		    				if(requiredItem){
		    					_.extend(requiredItem, res.responseDTO);
		    				} else {
		    					if(!self.responseItems){self.responseItems=[];}
		    					self.responseItems.push(res.responseDTO);
		    				}
		    			}
		    			// self.renderResponseItemsTable();
		    			repairDocument.attr("disabled",false);
		    			$.unblockUI();
		    			self.$el.find(".alert-success").show();
						self.$el.find(".alert-success").delay(2000).fadeOut(4000);
		    		},
		    		error:function(res){
						console.log("Failed: saveInspectionResponseData");
						repairDocument.attr("disabled",false);
						$.unblockUI();
						self.$el.find(".alert-danger").show();
						self.$el.find(".alert-danger").delay(2000).fadeOut(4000);
		    		}
		    	})
		    },
		});
		return finalWalkThroughView;
});
