define(["backbone","app","text!templates/addPropertyUnitModal.html","text!templates/addPropertyUnitTable.html",
	"text!templates/addPropertyUnitRow.html",
	"collections/propertyUnitCollection","models/propertyUnitModel","views/codesView","views/stateCodesView","accounting",
	"components-dropdowns","components-pickers"],
	function(Backbone,app,addUnitModal,addUnitTable,addUnitRow,propertyUnitCollection,propertyUnitModel,
		codesView,stateCodesView,accounting){
		var addPropertyUnitView=Backbone.View.extend({
			initialize: function(){
				this.statusCodesView = new codesView({codeGroup:'ASSET_STATUS'});
				this.stateCodesView=new stateCodesView();
			},
			events : { 
				"click .addOrEditNewItem":"addOrEditNewItem",
				"click .savePropertyUnit":"savePropertyUnit",
				"click .cancelPropertyUnit":"cancelToggleBtnClick",
				"click .propertyUnitRemove":"removePropertyUnit",
				"click #yesNoConfirmBtn":"yesNoConfirmBtnClick"
			},
			el:"#addUnitsRenderDiv",
			propertyUnitCollection:new propertyUnitCollection(),
			callBackData:{},
			propertyDetails:{},
			currentModelId:"",
			render : function () {
				var self = this;
				var modalTemplate = _.template(addUnitModal)();
				self.$el.html("");
				self.$el.html(modalTemplate);
				self.renderTable();
				
				// this.applyPermissions();
				self.$el.find("#addUnitsModal").modal('show');
		    },
		    renderTable: function(){
		    	var self = this;
		    	var tableTemplate = _.template(addUnitTable)({propertyUnits:self.propertyUnitCollection.models,accounting:accounting});
		    	self.$el.find("#tableDiv").html("");
		    	self.$el.find("#tableDiv").html(tableTemplate);
		    },
		    addOrEditNewItem:function(evt){
		    	console.log("addOrEditNewItem");
		    	var self = this;
		    	var currentTarget = $(evt.currentTarget);
				var newRowTemplate = _.template(addUnitRow);
				// var targetRow = currentTarget.data("target");
				self.currentModelId = currentTarget.data("modelid");
				var model;
				var currentForm;

				if(self.currentModelId){
					if(currentTarget.data("show")){
						self.hideAllHiddenRows();
						var targetRow = currentTarget.data("target").split(".")[1];
						model = self.propertyUnitCollection.findWhere({unitId: self.currentModelId});
						currentTarget.closest("tr")
							.after(newRowTemplate({row:targetRow,singleData:model.attributes}));
						currentForm = currentTarget.closest("tr").next().find("form");
					} else {
						self.hideHiddenRows(currentTarget.closest("tr").next());
					}
				} else {
					if(currentTarget.data("show")){
						self.hideAllHiddenRows("thead");
						var firstRow = currentTarget.closest("table").find("tbody tr:first");
						if(firstRow && firstRow.length){
							currentTarget.closest("table").find("tbody tr:first")
								.before(newRowTemplate({row:"unitRow0",singleData:self.propertyDetails}));
						} else {
							currentTarget.closest("table").find("tbody").html(newRowTemplate({row:"unitRow0",singleData:self.propertyDetails}));
						}
						currentForm = currentTarget.closest("table").find("tbody tr:first form");
					} else {
						self.hideHiddenRows(currentTarget.closest("table").find("tbody tr:first"));
					}
				}

				if(currentTarget.data("show")){
					currentTarget.data("show",false);
					this.statusCodesView.callback=function() {
						currentTarget.closest("table").find(".unitStatus select[name=unitStatusId]").val(model ? model.attributes.unitStatusId : "");
					}
					self.statusCodesView.render({el:currentTarget.closest("table").find(".unitStatus"),codeParamName:"unitStatusId",addBlankFirstOption:"true"});
					self.stateCodesView.render({el:currentTarget.closest("table").find('.state')});
					currentTarget.closest("table").find(".unitStatus select[name=unitStatusId]").val(model ? model.attributes.unitStatusId : "");
					currentTarget.closest("table").find(".state select[name=state]").val(model ? model.attributes.state : self.propertyDetails.state);
				} else {
					currentTarget.data("show",true);
				}
				if(currentForm){
					self.saveNewUnitFormValidation(currentForm);
				}
				$(".currency").formatCurrency({symbol:""});
				app.currencyFormatter();
		    },
		    savePropertyUnit:function(evt){
		    	var self = this;
		    	var currentForm = $(evt.currentTarget).closest("form");
		    	var unindexed_array = currentForm.serializeArray();

				if(currentForm.validate().form()){
					var postData = {};
					$.map(unindexed_array, function(n, i){
						var value=n['value'];
						var name=n['name'];
						postData[name]=value;
					});
					postData.investmentId = self.propertyUnitCollection.investmentId;
					postData.assetId = self.propertyUnitCollection.assetId;
					postData.unitId = self.currentModelId;

					$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
			    	self.propertyUnitCollection.savePropertyUnit(postData,{
			    		success:function(){
			    			$.unblockUI();
			    			self.renderTable();
			    			self.checkIfAllPropertyUnitsAreMarketed(self.propertyUnitCollection.investmentId);
			    		},
			    		error:function(res){
			    			$.unblockUI();
			    			if(res.responseText && JSON.parse(res.responseText).statusCode == "500"){
			    				self.$el.find(".alert-danger #textValue").html("Same Property Unit Name not allowed.");
			    			} else {
			    				self.$el.find(".alert-danger #textValue").html("Error in saving data.");
			    			}
			    			self.$el.find(".alert-danger").show();
							self.$el.find(".alert-danger").delay(4000).fadeOut(4000);
							self.$el.find('.modal').animate({ scrollTop: 0 }, 'slow');
			    		}
			    	})
				}
		    },
		    
		    checkIfAllPropertyUnitsAreMarketed: function(investmentId) {
		    	var thisPtr=this; 
		    	$.ajax({
		     		url: app.context()+'/propertyUnits/fetchForMarketing/'+investmentId,
		     		contentType: 'application/json',
		     		dataType:'json',
		     		type: 'GET',
		     		async: false,
		     		success: function(res){
		     			if(res.propertyUnits.length == 0)
		     				$("a[href='assetsInitiateMarketing']").addClass("disabled");
						else
							$("a[href='assetsInitiateMarketing']").removeClass("disabled");
					},
					error: function(res){
						console.log("Fectching property units data failed");
					}
				});
		    },
		    
		    removePropertyUnit:function(evt){
		    	var self=this;
				var popup = self.$el.find("#propertyUnitYesNoModal");
				var unitId = $(evt.currentTarget).closest("td").find(".addOrEditNewItem").data("modelid");
				self.callBackData = {};

				var callBack = function(){
					$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
					self.propertyUnitCollection.deletePropertyUnit(unitId,{
			    		success:function(){
			    			$.unblockUI();
			    			self.renderTable();
			    		},
			    		error:function(){
			    			$.unblockUI();
			    			self.$el.find(".alert-danger #textValue").html("Error in deleting data. Property Unit is already used.");
			    			self.$el.find(".alert-danger").show();
							self.$el.find(".alert-danger").delay(2000).fadeOut(2000);
							self.$el.find('.modal').animate({ scrollTop: 0 }, 'slow');
			    		}
			    	});
				}

				self.callBackData = callBack;
				popup.modal("show");
		    },
		    yesNoConfirmBtnClick:function(){
				var self = this;		    	
		    	self.callBackData();
		    	self.callBackData = {};
		    	self.$el.find("#propertyUnitYesNoModal").modal("hide");
		    },
		    fetchProperyUnits:function(){
		    	var self = this;
		    	self.propertyUnitCollection.fetch({
		    		success:function(data){
		    			self.propertyDetails = data.propertyDetails;
		    			self.render();
		    		},
		    		error:function(){
		    			console.log("fetch Error");
		    		}
		    	});
		    },
		    cancelToggleBtnClick: function(evt){
				var self = this;
				self.$el.find("#addUnitsModal thead .addOrEditNewItem").data("show",true);
				var row = $(evt.currentTarget).closest("tr");
				var previousRow = row.prev();
				var targetAction = previousRow.find(".addOrEditNewItem");
				targetAction.data("show",true);
				this.hideHiddenRows(row);
			},
			hideHiddenRows: function(row){
				var self = this;
				$('.collapse.in').collapse('hide');
				setTimeout(function(){self.deleteHiddenRow(row)},500);
			},
			hideAllHiddenRows: function(args){
				var self = this;
				var requiredRows = $(".collapse.in").closest("tr");
				if(args != "thead"){
					self.$el.find("#addUnitsModal thead .addOrEditNewItem").data("show",true);
				}
				_.each(requiredRows,function(el){
					$(el).prev().find(".addOrEditNewItem").data("show",true);
					self.hideHiddenRows(el);
				});
			},
			deleteHiddenRow: function(row){
				$(row).remove();
			},
			saveNewUnitFormValidation :function(currentForm){
				var form1 = currentForm;
				form1.validate({
					errorElement: 'span', //default input error message container
					errorClass: 'help-block', // default input error message class
					focusInvalid: false, // do not focus the last invalid input
					ignore: "",
					rules: {
						unitName:{
							required:true
						},
						bedrooms:{
							number:true
						},
						bathrooms:{
							number:true
						},
						totalSqft:{
							number:true
						}
					},
					invalidHandler: function (event, validator) { // display error alert on form submit

					},
					highlight: function (element) { // hightlight error inputs
						$(element).closest('.form-group').addClass('has-error'); // set error class to the control group
					},
					unhighlight: function (element) { // revert the change done by hightlight
						$(element).closest('.form-group').removeClass('has-error'); // set error class to the control group
					},
					success: function (label) {
						label
						.closest('.form-group').removeClass('has-error'); // set success class to the control group
					}
				});
			}
		});
		return addPropertyUnitView;
});
