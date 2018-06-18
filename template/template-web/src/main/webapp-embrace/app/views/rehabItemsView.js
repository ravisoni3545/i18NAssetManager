define(["backbone","app", "collections/rehabItemsCollection","collections/inspectionCategoryCollection","text!templates/rehabItems.html",
	"text!templates/editRehabItemPage.html","text!templates/editHUFee.html",
	"views/codesView","components-pickers"],
	function(Backbone,app,rehabItemsCollection,inspectionCategoryCollection,rehabItemsPage,editRehabItemPage,editHUFeePage,
		codesView){
		var RehabItemsView=Backbone.View.extend({
			initialize:function(options){
				this.repairPaidBy = new codesView({codeGroup:'REP_PAY_BY'});
				/*this.investmentId = options.investmentId;
				this.repairTypes = new codesView({codeGroup:'REP_TYPE'});
				this.repairStatus = new codesView({codeGroup:'REP_STATUS'});
				*/
			},
			events :{
				"click .showEditRehabItemModal":"showEditRehabItemModal",
				"click #saveRepairItemDetails":"saveRepairItemDetails",
				"change select[name=vendorId]":"renderVendorDetails",
				"change select[name=rehabCategoryId]":"renderCategoryDetails",
				"click .rehabItemRemoveBtn":"showDeleteRehabItemModal",
				"click #rehabItemRemoveConfirmBtn":"rehabItemDeleteYesBtn",
				"click #exTexcelRehabItems":"exportTable2excel",
				"click .showEditHUFeeModal":"showEditHUFeeModal",
				"click #saveHUFeeBtn":"saveHUFee"
			},
			el:"#rehabItemsTab",
			collection:new rehabItemsCollection(),
			categoryCollection: new inspectionCategoryCollection(),
			rehabVendors:[],
			rehabServices:[],
			rehabItemId:null,
			callBackData:{},
			huFeeEstimated:{},
			huFeeActual:{},
			huFeeTenPercentEstimated:{},
			huFeeTenPercentActual:{},
			render: function(){
				var self=this;
				// self.template=_.template(rehabItemsPage)({RehabRepairsData:self.collection.models});
				var rehabTabTemplate=_.template(rehabItemsPage)({RehabItemsData:self.collection.models,rehabId:self.collection.rehabId,
																	categoryList:self.categoryCollection.toJSON()});
				self.$el.html("");
				this.$el.html(rehabTabTemplate);

				var totalActualCost = 0;
				var totalEstimatedCost = 0;
				var huOverSiteFeeEstimated = 0;
				var huOverSiteFeeActual = 0;
				_.each(self.collection.toJSON(),function(currentModel){
					if(parseFloat(currentModel.estimatedCost)){
						totalEstimatedCost+=parseFloat(currentModel.estimatedCost);
					}
					if(parseFloat(currentModel.actualCost)){
						totalActualCost+=parseFloat(currentModel.actualCost);
					}
				});
				
				if(totalEstimatedCost>2500){
					$('.huFee').show();
					if(self.huFeeEstimated!=null){
						huOverSiteFeeEstimated=self.huFeeEstimated;
						$(".tenPercent").hide();
					}else{
						huOverSiteFeeEstimated = totalEstimatedCost/10;
						huFeeTenPercentEstimated = huOverSiteFeeEstimated;
						$(".tenPercent").show();
					}
					if(self.huFeeActual!=null){
						huOverSiteFeeActual=self.huFeeActual;
						$(".tenPercent").hide();
					}else{
						huOverSiteFeeActual = totalActualCost/10;
						huFeeTenPercentActual = huOverSiteFeeActual;
						$(".tenPercent").show();
					}
					self.$el.find("#huOverSiteFeeEstimated").html(huOverSiteFeeEstimated);
					self.$el.find("#huOverSiteFeeActual").html(huOverSiteFeeActual);
				}else{
					$('.huFee').hide();
				}
				
				self.$el.find("#totalEstimatedCost").html(totalEstimatedCost+huOverSiteFeeEstimated);
				self.$el.find("#totalActualCost").html(totalActualCost+huOverSiteFeeActual);
				
				/*self.rehabRepairTable = $('#rehabRepairTable').dataTable({
					"bFilter":true,
					"deferRender": true,
					"aoColumnDefs": [
					            	   {"aTargets": [ 5 ], "bSortable": false},
					            	   {"aTargets": [ 7 ], "bSortable": false}
					            	]
				});*/
	
				$('.hopNameTooltip').tooltip({
	                animated: 'fade',
	                placement: 'left'
	            });
				$(".amount").formatCurrency();
			},
			showEditRehabItemModal: function(evt){
				var self = this;
				var rehabItemId = $(evt.currentTarget).closest("tr").data("rehabitemid");
				self.rehabItemId = rehabItemId;
				var rehabItemModel;
				if(rehabItemId){
					rehabItemModel = self.collection.findWhere({rehabItemId: rehabItemId});
				}
				rehabItemModel = rehabItemModel || {};
				rehabItemData = rehabItemModel.attributes || {};
				var rehabEditTemplate = _.template(editRehabItemPage)({rehabItemData:rehabItemData,rehabVendors:self.rehabVendors,
					rehabServices:self.rehabServices, categoryList:self.categoryCollection.toJSON()});
				self.$el.find("#addEditRehabItemsId").html("");
				self.$el.find("#addEditRehabItemsId").html(rehabEditTemplate);
				var repairPaidByEl = self.$el.find('#editRehabItemModal #PaidTypeDD');
				self.repairPaidBy.callback = function() {
					repairPaidByEl.find('select[name=paidById]').val(rehabItemData.paidById);
				}
				self.repairPaidBy.render({el:repairPaidByEl,codeParamName:"paidById",addBlankFirstOption:true});
				repairPaidByEl.find('select[name=paidById]').val(rehabItemData.paidById);

				var currentForm = self.$el.find('#editRehabItemModal form');
				var requiredVendor = _.find(self.rehabVendors, function(e){ return e.orgId == rehabItemData.vendorId; }) || {};
				self.populateVendorDetails(requiredVendor,currentForm);
				self.RepairItemsFormValidation(currentForm);
				
				/*
				$("#repairTypeRehabCost").show();
				*/
	            $(".currency").formatCurrency();
				app.currencyFormatter("$");
				ComponentsPickers.init();
				self.$el.find("#editRehabItemModal").modal('show');
			},
			saveRepairItemDetails: function(evt){
				var self = this;
				var obj={};
	    	 	var form = self.$el.find("#editRehabItemModal form");
	    	 	if(form.validate().form()){
	    	 		var unindexed_array = form.serializeArray();
		    	    $.map(unindexed_array, function(n, i){
		    	    	var value=n['value'];
		    	    	var name=n['name'];
		    	    	obj[name]=value;
		    	    });
		    	    if(self.rehabItemId){
		    	    	obj["rehabItemId"] = self.rehabItemId;
		    	    }
		    	    
	    	   	 	self.collection.saveRepairItemDetails(obj,{
		    	    	success:function(){
		    	    		if(obj["newCategoryName"]){
		    	    			self.fetchCategoryCollection();
		    	    		}
		    	    		self.$el.find("#editRehabItemModal").modal('hide');
		    	    		$('body').removeClass('modal-open');
							$('.modal-backdrop').remove();
		    	    		self.render();
		    	    		if(obj["vendorName"]){
		    	    			self.fetchRehabVendorsAndServices();
		    	    		}
		    	    		self.trigger('RehabItemsSaved');
		    	    	},
		    	    	error:function(){
		    	    		/*var error1 = $('#formFailure');
			    	 		$("#textValue",error1).text("");
			     			$("#textValue",error1).text("Saving repair category details failed");
			     			error1.show();
				    		$('.modal').animate({ scrollTop: 0 }, 'slow');
				    		error1.delay(2000).fadeOut(2000);
		    	    		console.log("Saving repair category details failed");*/
		    	    	}
	    			});
	    	 	}
			},
			showDeleteRehabItemModal: function(evt){
				var self = this;
		    	var popup = self.$el.find("#deleteRehabItemModal");
		    	var rehabItemId = $(evt.currentTarget).closest('tr').data('rehabitemid');
		    	self.callBackData = {};

		    	var callBack = function(){
		    		// popup.modal("hide");
					$.blockUI({
						baseZ: 999999,
						message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
					});
					self.collection.deleteRehabItem(rehabItemId,{
						success: function(res){
							$.unblockUI();
			    			self.render();
						},
						error: function(res){
							$.unblockUI();
							console.log("failure");
						}
					});
				}
		    	self.callBackData = callBack;
		    	popup.modal("show");
			},
		 	rehabItemDeleteYesBtn:function(){
		    	var self = this;		
		    	self.callBackData();
		    	self.callBackData = {};
		    	self.$el.find("#deleteRehabItemModal").modal("hide");
		    	$('body').removeClass('modal-open');
				$('.modal-backdrop').remove(); 
		    },
			fetchRehabDatas: function(){
				var self = this;
				self.fetchCategoryCollection();
				
				self.collection.fetchRehabItems({
					async:false,
					success:function(huFeeEstimated,huFeeActual){
						self.huFeeEstimated = huFeeEstimated;
						self.huFeeActual = huFeeActual;
						self.render();
					},
					error:function(res){
						console.log("Error in fetching rehab repair data");
					}
				});
				
				self.fetchRehabVendorsAndServices();
			},
			fetchCategoryCollection: function(){
				var self = this;
				self.categoryCollection.fetch({
					async:false,
					success:function(){
					},
					error:function(){
						console.log("Error in fetching inspection Category");
					}
				});
			},
			fetchRehabVendorsAndServices: function(){
				var self = this;
				self.collection.fetchRehabVendorsAndServices({
					success:function(res){
						self.rehabVendors = res.rehabVendors;
						self.rehabServices = res.rehabServices;
					},
					error:function(res){
						console.log("Error in fetching rehab vendors data");
					}
				});
			},
			renderCategoryDetails: function(evt){
				var self = this;
				var form = $(evt.currentTarget).closest("form");
				var requiredCategoryId = $(evt.currentTarget).val();
				if(requiredCategoryId=="addNewCategory"){
					form.find(".input-disabled-category").removeAttr("disabled");
				} else {
					form.find("[name=newCategoryName]").val("");
					form.find(".input-disabled-category").attr("disabled","disabled");
				}
			},
			renderVendorDetails: function(evt){
				var self = this;
				var form = $(evt.currentTarget).closest("form");
				var requiredVendorId = $(evt.currentTarget).val();
				if(requiredVendorId=="addNewVendor"){
					self.populateVendorDetails({},form);
					form.find(".input-disabled-vendor").removeAttr("disabled");
					$("#addNewVendorDiv").show();
				} else {
					var requiredVendor = _.find(self.rehabVendors, function(e){ return e.orgId == requiredVendorId; }) || {};
					self.populateVendorDetails(requiredVendor,form);
					form.find(".input-disabled-vendor").attr("disabled","disabled");
					$("#addNewVendorDiv").hide();
				}
			},
			populateVendorDetails: function(requiredVendor,currentForm){
				var self = this;
				currentForm.find("[name=vendorName]").val(requiredVendor.orgName);
				currentForm.find("[name=vendorAddress]").val(requiredVendor.address1);
				currentForm.find("[name=vendorPhone]").val(requiredVendor.phone);
				currentForm.find("[name=vendorCity]").val(requiredVendor.city);
				currentForm.find("[name=vendorFax]").val(requiredVendor.fax);
				currentForm.find("[name=vendorState]").val(requiredVendor.state);
				currentForm.find("[name=vendorEmail]").val(requiredVendor.email);
				currentForm.find("[name=vendorZip]").val(requiredVendor.postalCode);
				currentForm.find("[name=vendorService]").val("");
				if(requiredVendor.licenseExpiry){
					currentForm.find("#vendorLicense").html("License: exp-" + requiredVendor.licenseExpiry);
				} else {
					currentForm.find("#vendorLicense").html("");
				}
			},
			RepairItemsFormValidation :function(currentForm){
				var form1 = currentForm;
				form1.validate({
				   	errorElement: 'span', //default input error message container
				    errorClass: 'help-block', // default input error message class
				    focusInvalid: false, // do not focus the last invalid input
				    ignore: "",
				    rules: {
				    	rehabCategoryId:{
				    		required:true
				    	},
				    	newCategoryName:{
				    		required:true
				    	},
				    	paidById:{
				    		required:true
				    	},
				    	workDescription:{
				    		required:true
				    	},
				    	vendorName:{
				    		required:true
				    	},
				    	vendorPhone:{
				    		required:true
				    	},
				    	vendorEmail:{
				    		required:true
				    	},
				    	vendorService:{
				    		required:true
				    	},
				    	inspectionPage:{
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
			},
			//below codes not used for now
			rePopulateRowDataAfterSaving: function(requiredRow,result){
				if(result.rehabCategory) requiredRow.find("#rehabCategoryCol").text(result.rehabCategory);
				if(result.paidBy) requiredRow.find("#paidByCol").text(result.paidBy);
				if(result.estimatedCost) {
					requiredRow.find("#estimatedCostCol").text(result.estimatedCost);
				} else {
					requiredRow.find("#estimatedCostCol").text("");
				}
				if(result.estStartDate) requiredRow.find("#estStartDateCol").text(result.estStartDate);
				if(result.estCompletionDate) requiredRow.find("#estCompletionDateCol").text(result.estCompletionDate);
				if(result.actualCost) {
					requiredRow.find("#actualCostCol").text(result.actualCost);
				} else {
					requiredRow.find("#actualCostCol").text("");
				}
				if(result.actualCompletionDate) requiredRow.find("#actualCompletionDateCol").text(result.actualCompletionDate);
				
				var totalEstCost = 0,
				totalActCost = 0;
				_.each($(".estCostAdd"),function(costEl){
					totalEstCost += (!parseInt($(costEl).next().val()))? 0 : parseInt($(costEl).next().val());
				});
				_.each($(".actCostAdd"),function(costEl){
					totalActCost += (!parseInt($(costEl).next().val()))? 0 : parseInt($(costEl).next().val());
				});
				$("#totalEstCost").text(totalEstCost);
				$("#totalActualCost").text(totalActCost);
				$(".amount").formatCurrency();
			},
			deleteRehabData: function(){
				var self = this;
				if(self.deleteObj.key == "Rehab"){
					self.collection.deleteRepairDetails(self.deleteObj.id,{
						success:function(res){
							if(res.statusCode == "200"){
								var Pos = self.rehabRepairTable.fnGetPosition(self.deleteObj.row[0]);
								self.rehabRepairTable.fnDeleteRow(Pos);
								var model = self.collection.findWhere({rehabId: self.deleteObj.id});
								self.collection.remove(model);
							} else {
								console.log("Deleting rehab failed");
							}
						},
						error:function(res){
							console.log("Deleting rehab failed");
						}
					});
				} 
				else if(self.deleteObj.key == "RehabItem"){
					if(self.deleteObj.id){
						self.collection.deleteCategoryDetails(self.deleteObj.id,{
							success:function(res){
								if(res.statusCode == "200"){
									$(self.deleteObj.row).next().remove();
									$(self.deleteObj.row).remove();
								} else {
									console.log("Deleting rehab Item failed");
								}
							},
							error:function(res){
								console.log("Deleting rehab Item failed");
							}
						});
					} else {
						$(self.deleteObj.row).next().remove();
						$(self.deleteObj.row).remove();
					}
				}

				$("#deleteRehabModal").modal("hide");
			},
			exportTable2excel: function() {
				var self = this;
				self.$el.find("#rehabRepairTable").tableExport({
		            formats: ["xlsx"],
		            fileName: "RehabItems_"+self.collection.propertyName+"_"+moment(new Date($.now())).format('YYYYMMDDHHmmss'),//do not include extension
		            context:app.context()
		        });
			},
			showEditHUFeeModal: function() {
				var self = this;
				var editHUFeeTemplate=_.template(editHUFeePage);
				self.$el.find("#editHUFeeDiv").empty();
				self.$el.find("#editHUFeeDiv").html(editHUFeeTemplate({huFeeEstimated:self.huFeeEstimated,huFeeActual:self.huFeeActual}));
				if(self.huFeeEstimated==null){
					$("#huFeeEstimatedEditText").val(huFeeTenPercentEstimated);
				}
				if(self.huFeeActual==null){
					$("#huFeeActualEditText").val(huFeeTenPercentActual);
				}
				app.currencyFormatter("$","currencyInsurance");
				$(".currencyInsurance").formatCurrency({symbol:"$",roundToDecimalPlace:2});
				$("#editHUFeeModal").modal("show");
			},
			saveHUFee: function() {
				$("#editHUFeeModal").modal("hide");
				var self=this;
				var obj={};
				obj.huFeeEstimated = $("input[name=huFeeEstimated]").val();
				obj.huFeeActual = $("input[name=huFeeActual]").val();
				obj.rehabId = self.collection.rehabId;
				
				$.blockUI({
					baseZ: 999999,
					message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
				});
				$.ajax({
					url: app.context()+'/rehab/saveHUFee',
					contentType: 'application/json',
					dataType:'json',
					data:JSON.stringify(obj),
					type: 'POST',
					async: true,
					success: function(res){
						$.unblockUI();
						setTimeout(function(){$('.modal-backdrop').remove()},500)
			            $('.modal-backdrop').fadeOut(400);
						self.huFeeEstimated=res.huFeeEstimated;
						self.huFeeActual=res.huFeeActual;
						self.render();
						self.trigger('RehabItemsSaved');
					},
					error: function(res){
						$.unblockUI();
						setTimeout(function(){$('.modal-backdrop').remove()},500)
			            $('.modal-backdrop').fadeOut(400);
					}
				});
			}
			
		});
		return RehabItemsView;
});
