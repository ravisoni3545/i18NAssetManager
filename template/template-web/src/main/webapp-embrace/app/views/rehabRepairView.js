define(["backbone","app", "collections/rehabRepairCollection","collections/propertyUnitCollection","text!templates/rehabRepair.html",
	"text!templates/editRehabRepair.html","text!templates/editRehabRepairAddRow.html","text!templates/propertyUnitDropdown.html",
	"views/codesView","collections/inspectionCategoryCollection","components-dropdowns","components-pickers"],
	function(Backbone,app,rehabRepairCollection,propertyUnitCollection,rehabrepairsPage,editRehabRepairPage,editAddRowPage,propertyUnitDropdown,
		codesView,inspectionCategoryCollection){
		var RehabrepairsView=Backbone.View.extend({
			initialize:function(){
				this.repairTypes = new codesView({codeGroup:'REP_TYPE'});
				this.repairStatus = new codesView({codeGroup:'REP_STATUS'});
				this.repairPaidBy = new codesView({codeGroup:'REP_PAY_BY'});
			},
			events :{
				"click #showAddRehabRepairModal":"showAddRehabRepairModal",
				"click .showEditRehabRepairModal":"showEditRehabRepairModal",
				"click #addNewRepairItem":"addNewRowRepairItemOnBtnClick",
				"click #saveRepairDetails":"saveRepairDetails",
				"click .saveCategoryDetails":"saveCategoryDetails",
				"change select[name=repairTypeId]":"ShowRehabCost",
				"click .edit-repair-category":"showEditRow",
				"click .cancelCategoryDetails":"hideEditRow",
				'hidden.bs.modal #edit-repair': 'reFetchCollection',
				"click .rehabRemoveBtn": "showRemoveRehabConfirmPopup",
				"click .rehabItemRemoveBtn": "showRemoveItemRehabConfirmPopup",
				"click #rehabRemoveConfirmBtn": "deleteRehabData"
			},
			el:"#rehabrepairTab",
			collection:new rehabRepairCollection(),
			categoryCollection: new inspectionCategoryCollection(),
			rowCount:0,
			deleteObj:{},
			rehabRepairTable:{},
			investmentId:"",
			quotedRehabCost:"",
			render: function(){
				var self=this;
				self.template=_.template(rehabrepairsPage)({RehabRepairsData:self.collection.models});
				self.$el.html("");
				this.$el.html(this.template);
				self.rehabRepairTable = $('#rehabRepairTable').dataTable({
					"bFilter":true,
					//"deferRender": true,
					"aoColumnDefs": [
					            	   {"aTargets": [ 5 ], "bSortable": false},
					            	   {"aTargets": [ 7 ], "bSortable": false}
					            	]
				});
                $('select[name=rehabRepairTable_length]').addClass('form-control');
                $('#rehabRepairTable_filter input').css('border','1px solid #e5e5e5');
                $('#rehabRepairTable_filter label').after('<div class="addbtnposition pull-right margin-bottom-10 marg_right15"><a style="cursor:pointer;" data-toggle="modal" id="showAddRehabRepairModal" class="btn green"><i title="Add New Rehab/Repair" data-toggle="tooltip" class="fa fa-plus hopNameTooltip"></i> </a></div>');

                $(".amount").formatCurrency();
                $('.hopNameTooltip').tooltip({
                    animated: 'fade',
                    placement: 'left'
                });
			},
			showAddRehabRepairModal: function(){
				var self = this;
				self.rowCount = 0;			
				var rehabTemplate = _.template(editRehabRepairPage)({singleData:{},quotedRehabCost:self.quotedRehabCost});
				$("#addEditRehabRepairsId").html("");
				$("#addEditRehabRepairsId").html(rehabTemplate);
				self.loadAddPropertyUnits(self.$el.find("#edit-repair-form"));
				self.repairTypes.render({el:$('#RepairTypeDD'),codeParamName:"repairTypeId"});
				$("#repairTypeRehabCost").show();
				self.repairStatus.render({el:$('#RepairStatusDD'),codeParamName:"repairStatusId"});
				
				self.RepairFormValidation($("#edit-repair-form"));
				$(".amount").formatCurrency();
				app.currencyFormatter("$","currencyInsurance");
				ComponentsPickers.init();
				$("#edit-repair .collapse.in").removeClass("in");
	            $("#edit-repair").modal('show');
				
			},
			showEditRehabRepairModal: function(evt,args){
				var self = this;
				self.rowCount = 0;
				var rehabId = $(evt.currentTarget).closest("tr").data("rehabid") || $(evt.currentTarget).data("rehabid");
				var model = self.collection.findWhere({rehabId: rehabId}) || {};
				var modelAttributes = model.attributes || {};
				var rehabTemplate = _.template(editRehabRepairPage)({singleData:modelAttributes,quotedRehabCost:self.quotedRehabCost});
				$("#addEditRehabRepairsId").html("");
				$("#addEditRehabRepairsId").html(rehabTemplate);
				self.loadAddPropertyUnits(self.$el.find("#edit-repair-form"),modelAttributes.propertyUnitId);
				
				self.repairTypes.callback = function() {
					$("#edit-repair #RepairTypeDD select[name=repairTypeId]").val(modelAttributes.typeId);
					if(args == "INITIAL_REHAB_CLOSING"){
						$("#edit-repair #RepairTypeDD select[name=repairTypeId]").val(337);
						$("#edit-repair #RepairTypeDD select[name=repairTypeId]").addClass("disable-field");
					}
					if(modelAttributes.typeId == 337 || args == "INITIAL_REHAB_CLOSING"){
						$("#repairTypeRehabCost").show();
					}
				}
				self.repairTypes.render({el:$('#RepairTypeDD'),codeParamName:"repairTypeId"});
				$("#edit-repair #RepairTypeDD select[name=repairTypeId]").val(modelAttributes.typeId);
				if(args == "INITIAL_REHAB_CLOSING"){
					$("#edit-repair #RepairTypeDD select[name=repairTypeId]").val(337);
				}
				if(modelAttributes.typeId == 337 || args == "INITIAL_REHAB_CLOSING"){
					$("#repairTypeRehabCost").show();
				}
				
				self.repairStatus.callback = function() {
					$("#edit-repair #RepairStatusDD select[name=repairStatusId]").val(modelAttributes.statusId);
				}
				self.repairStatus.render({el:$('#RepairStatusDD'),codeParamName:"repairStatusId"});
				$("#edit-repair #RepairStatusDD select[name=repairStatusId]").val(modelAttributes.statusId);
				
				_.each(modelAttributes.categoryObj, function(repairItem){
					self.addNewRowRepairItem(repairItem);
				});

				self.RepairFormValidation($("#edit-repair-form"));
				$(".amount").formatCurrency();
				app.currencyFormatter("$","currencyInsurance");
				ComponentsPickers.init();
				$("#edit-repair .collapse.in").removeClass("in");
				if(args == "INITIAL_REHAB_CLOSING"){
					$("#edit-repair #RepairTypeDD select[name=repairTypeId]").addClass("disable-field");
				}
	            $("#edit-repair").modal('show');
			},
			addNewRowRepairItemOnBtnClick: function(evt){
				var self = this;
				$("#edit-repair .collapse.in").closest("tr").prev().find(".edit-repair-category").data("shown",false);
				$("#edit-repair .collapse.in").removeClass("in");

				self.addNewRowRepairItem({},evt);
				app.currencyFormatter("$","currencyInsurance");
			},
			addNewRowRepairItem: function(categoryData,evt){
				var self = this;
				var newRowTemplate = _.template(editAddRowPage);

				if(!evt){
					$("#edit-repair").find("table tbody tr:last")
						.before(newRowTemplate({rowCount:self.rowCount,singleData:categoryData,dataShown:false,
							categoryList:self.categoryCollection.toJSON()}));
					var codesViewEl = $("#edit-repair").find("table #repairEditRow" + self.rowCount + " .RepairPaidByDD");
				} else {
					$(evt.currentTarget).closest("table").find("tbody tr:last")
						.before(newRowTemplate({rowCount:self.rowCount,singleData:{},dataShown:true,
							categoryList:self.categoryCollection.toJSON()}));
					var codesViewEl = $(evt.currentTarget).closest("table").find("#repairEditRow" + self.rowCount + " .RepairPaidByDD");
				}
				
				self.repairPaidBy.callback = function() {
					codesViewEl.find("select[name=paidBy]").val(categoryData.paidById);
				}
				self.repairPaidBy.render({el:codesViewEl,codeParamName:"paidBy",addBlankFirstOption:"true"});
				codesViewEl.find("select[name=paidBy]").val(categoryData.paidById);
				ComponentsPickers.init();
				self.rowCount++;
			},
			fetchRehabDatas: function(args){
				
				var self = this;
				self.fetchRehabDatasArgs = args;

				self.collection.fetchRehabQuotedAmount({
					success:function(res){
						console.log(res);
						self.quotedRehabCost = parseFloat(res);
					},
					error:function(res){
						console.log("Error in fetching rehab quoted estimate");
					}
				});

				self.collection.fetch({
					async:false,
					success:function(res){
						if(args != "INITIAL_REHAB_CLOSING"){
							self.render();
						}
					},
					error:function(res){
						console.log("Error in fetching rehab repair data");
					}
				});
				self.fetchCategoryCollection();
			},
			saveRepairDetails: function(evt){
				var self=this;
	    	 	var obj={};
	    	 	var form = $(evt.currentTarget).closest("form");
	    	 	var rehabId = form.data("rehabid");
	    	 	// self.RepairFormValidation(form);
	    	 	if(form.validate().form()){
	    	 		var unindexed_array = form.serializeArray();
		    	    $.map(unindexed_array, function(n, i){
		    	    	var value=n['value'];
		    	    	var name=n['name'];
		    	    	obj[name]=value;
		    	    });
		    	    obj["rehabId"] = rehabId;

		    	    self.collection.saveRepairDetails(obj,{
		    	    	success:function(res){
		    	    		form.data("rehabid",JSON.parse(res).rehabId);
				    		$("#edit-repair").find(".alert-success").show();
							$("#edit-repair").find(".alert-success").delay(2000).fadeOut(2000);
							$('.modal').animate({ scrollTop: 0 }, 'slow');
							self.trigger('RehabSavedSuccessfully',JSON.parse(res).rehabId);
		    	    	},
		    	    	error:function(res){
		    	    		var error1 = $('#formFailure');
			    	 		$("#textValue",error1).text("");
			     			$("#textValue",error1).text("Saving repair details failed");
			     			error1.show();
				    		$('.modal').animate({ scrollTop: 0 }, 'slow');
				    		error1.delay(2000).fadeOut(2000);
		    	    		console.log("Saving repair details failed");
		    	    	}
		    		});
	    	 	}
			},
			saveCategoryDetails: function(evt){
				var self = this;
				var obj={};
	    	 	var form = $(evt.currentTarget).closest("form");
	    	 	self.repairCatagoryFormValidation(form);
	    	 	if(form.validate().form()){
	    	 		var rehabId = $("#edit-repair-form").data("rehabid");
		    	 	var rehabItemId = form.data("rehabitemid");

		    	 	if(rehabId){
		    	 		var unindexed_array = form.serializeArray();
			    	    $.map(unindexed_array, function(n, i){
			    	    	var value=n['value'];
			    	    	var name=n['name'];
			    	    	obj[name]=value;
			    	    });
			    	    obj["rehabId"] = rehabId;
			    	    obj["rehabItemId"] = rehabItemId;
			    	    
		    	   	 	self.collection.saveCategoryDetails(obj,{
			    	    	success:function(res){
			    	    		form.data("rehabitemid",JSON.parse(res).rehabItemId);
			    	    		var requiredRow = $(form).closest("tr").prev();
			    	    		self.rePopulateRowDataAfterSaving(requiredRow,JSON.parse(res));
			    	    		self.hideEditRow(evt);
			    	    	},
			    	    	error:function(res){
			    	    		var error1 = $('#formFailure');
				    	 		$("#textValue",error1).text("");
				     			$("#textValue",error1).text("Saving repair category details failed");
				     			error1.show();
					    		$('.modal').animate({ scrollTop: 0 }, 'slow');
					    		error1.delay(2000).fadeOut(2000);
			    	    		console.log("Saving repair category details failed");
			    	    	}
		    			});
		    	 	} else {
		    	 		var error1 = $('#formFailure');
		    	 		$("#textValue",error1).text("");
		     			$("#textValue",error1).text("Please save Repair Details Header part");
		     			error1.show();
			    		$('.modal').animate({ scrollTop: 0 }, 'slow');
			    		error1.delay(2000).fadeOut(2000);
		    	 		console.log("saveCategoryDetails failed. Please save repair details header part");
		    	 	}
	    	 	}
			},
			rePopulateRowDataAfterSaving: function(requiredRow,result){
				var self = this;
				if(result.rehabCategory) {
					var rehabCategoryName = "";
					_.each(self.categoryCollection.toJSON(),function(categoryObj){
			            if(categoryObj.categoryId==result.rehabCategory){
			                rehabCategoryName = categoryObj.categoryName;
			            }
			        });
					requiredRow.find("#rehabCategoryCol").text(rehabCategoryName);
				};
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
			showEditRow: function(evt){
				if(!$(evt.currentTarget).data("shown")){
					/*_.each($("#edit-repair .collapse.in"),function(rowItem){
						$(rowItem).data("shown",false);
					});*/
					$("#edit-repair .collapse.in").closest("tr").prev().find(".edit-repair-category").data("shown",false);
					$("#edit-repair .collapse.in").removeClass("in");
					$($(evt.currentTarget).data("target")).addClass("in");
					$(evt.currentTarget).data("shown",true);
				} else {
					$($(evt.currentTarget).data("target")).removeClass("in");
					$(evt.currentTarget).data("shown",false);
				}
			},
			hideEditRow: function(evt){
				$("#edit-repair .collapse.in").closest("tr").prev().find(".edit-repair-category").data("shown",false);
				/*_.each($("#edit-repair .collapse.in"),function(rowItem){
					$(rowItem).data("shown",false);
				});*/
				$("#edit-repair .collapse.in").removeClass("in");
			},
			ShowRehabCost: function(evt){
				if($("select[name=repairTypeId] option:selected").val() == 337){
					$("#repairTypeRehabCost").show();
				} else {
					$("#repairTypeRehabCost").hide();
				}
			},
			reFetchCollection: function(evt){
				var self = this;
				this.fetchRehabDatas(self.fetchRehabDatasArgs);
			},
			showRemoveRehabConfirmPopup: function(evt){
				var self = this;
				self.deleteObj.key = "Rehab";
				self.deleteObj.id = $(evt.currentTarget).closest("tr").data("rehabid");
				self.deleteObj.row = $(evt.currentTarget).closest("tr");
				$("#deleteRehabModal").modal("show");
			},
			showRemoveItemRehabConfirmPopup: function(evt){
				var self = this;
				self.deleteObj.key = "RehabItem";
				self.deleteObj.id = $(evt.currentTarget).data("rehabitemid");
				self.deleteObj.row = $(evt.currentTarget).closest("tr");
				$("#deleteRehabModal").modal("show");
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
			loadAddPropertyUnits: function(modalObject,unitId) {
	    	 	var self = this;
	    	 	unitId = unitId || "";
				if(!self.propertyUnitCollection){
					self.propertyUnitCollection = new propertyUnitCollection();
				}
				self.propertyUnitCollection.investmentId = self.investmentId;
				
				self.propertyUnitCollection.fetch({
		    		success:function(data){
		    			self.propertyUnits = data.propertyUnits;
	    				modalObject.find('#unitDropdown').html(_.template( propertyUnitDropdown )({units:self.propertyUnits,fieldName:"propertyUnitId"}));
	    				modalObject.find('#unitDropdown select[name=propertyUnitId]').val(unitId);
		    		},
		    		error:function(){
		    			console.log("fetch Error");
		    		}
		    	});
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
			RepairFormValidation :function(currentForm){
				var form1 = currentForm;
				form1.validate({
				   	errorElement: 'span', //default input error message container
				    errorClass: 'help-block', // default input error message class
				    focusInvalid: false, // do not focus the last invalid input
				    ignore: "",
				    rules: {
				    	shortDescription:{
				    		required:true
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
			repairCatagoryFormValidation :function(currentForm){
				var form1 = currentForm;
				form1.validate({
				   	errorElement: 'span', //default input error message container
				    errorClass: 'help-block', // default input error message class
				    focusInvalid: false, // do not focus the last invalid input
				    ignore: "",
				    rules: {
				    	rehabCategory:{
				    		required:true
				    	},
				    	paidBy:{
				    		required:true
				    	},
				    	estimatedCost:{
				    		dollarsscents:true
				    	},
				    	actualCost:{
				    		dollarsscents:true
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

		return RehabrepairsView;
});
