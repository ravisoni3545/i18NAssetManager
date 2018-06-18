define(["backbone","app","text!templates/rehabEstimator.html","models/propertyModel"],
	function(Backbone,app,rehabEstPage,propertyModel){
	
	var RehabEstimatorView = Backbone.View.extend({
		initialize: function(options){
			var thisPtr=this;
		},
		events:{
			"click #gotoPropertyDtls":"showPropertyDtlsPage",
			"click #head-Cancel":"showLeaveEstimatePopup",
			"click .cancel-rehab-btn":"showLeaveEstimatePopup",
			"click .rehab-head-category":"showHeadCategoryDiv",
			"click .rehab-counter-minus":"removeLastTemplateRowAndRecalculate",
			"click .rehab-counter-plus":"addTemplateRowAndRecalculate",
			"keyup .update-rehab-cost":"updateCategoryAndHeadCategoryCost",
			"mouseleave .update-rehab-cost":"updateCategoryAndHeadCategoryCost2",
			// "click .previous-head-category":"showPreviousHeadCategory",
			"click .goto-head-category":"showNextHeadCategory",
			"click .present-toggle-btn":"showTemplateForPresent",
			"click .absent-toggle-btn":"removeTemplateForAbsent",
			"click .yes-toggle-btn":"showTemplateForYes",
			"click .no-toggle-btn":"removeTemplateForNo",
			"click #add-another-miscellaneous-item":"addMiscRow",
			"click .yes-q-toggle-btn":"addCommentsSection",
			"click .no-q-toggle-btn":"removeCommentsSection",
			"click .rehab-not-required":"checkForRehabNotRequiredFlag",
			"click #btnBacktoEdit":"goBacktoPrevCategory",	
			"click #btnSubmitToNextSummary":"submitandShowCompleteTab",
			"keyup .text-field-size":"calculateWithSize",
			"click .radio-action":"calculateWithAction",
			"keyup .item-counter-field":"calculateWithCounter",
			"click .item-toggle-action":"calculateWithToggle",
			"click #remove-miscellaneous-item":"removeMiscRow",
			"click #goto-summary-page":"gotoSummaryPage"
			
		},
		propertyId: null,
		huSelect: null,
		propertyDetails : {
								"propertyImg" : null,
								"propertyaddress" : null,
								"propertyOtherInfo" : null,
								"propertyNIR" : null,
								"propertyPreSel" : null
		},
		myStructure: null,
		pricingModel: null,
		formStructureObj:{}, 
		formLevelObj:{},
		miscCount: 0,
		headArray: {},
		editMode: false,
		currentHeadCategory: null,
		templateFields: {"T1":["item-action", "item-size", "item-cost"],"T2":["item-action", "item-size", "item-cost"]},
		
		render:function () {
			var thisPtr=this;
			if(thisPtr.myStructure && thisPtr.pricingModel){
				thisPtr.editMode = true;
			} else {
				thisPtr.fetchRehabStructure();
			}
			thisPtr.populatePropDtlsModel();
			var dataForTemplate = thisPtr.getTemplateDataForSidebar();
			this.template = _.template( rehabEstPage );
	     	this.$el.html("");
	     	this.$el.html(this.template({dataObj: dataForTemplate}));
	     	thisPtr.createMainSection(thisPtr.myStructure);
	     	// thisPtr.createSideBar(thisPtr.propertyDetails, thisPtr.myStructure);
	     	//$('.page-content').css("padding-top", "6px").css("padding-left", "0px").css("padding-right", "0px").css("margin-left", "1px !important");
	     	$('.page-content').attr("style", "padding-top: 0; padding-left: 0px; padding-right: 0px; margin-left: 0px !important;");
	     	$("#sideNavigation").css("display", "none");
	     	$("#header").css("display", "none");
	     	$(".footer").css("display", "none");
	     	// $("#head-category-navigation").css("padding-top","20px");
	     	//$(".page-container.page-sidebar-closed").css("margin-top", "0");
	     	$('.rehab_amt').formatCurrency({roundToDecimalPlace:2});
	     	$("head").append('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>');
		},

		getTemplateDataForSidebar: function(){
			var thisPtr = this;
			var dataObj = {};
			var propModel = app.propertyModel.toJSON();

			dataObj.sidebarImg = propModel.mediumLink;
			dataObj.preSelect = (thisPtr.huSelect? "Yes":"No");
			dataObj.address = propModel.propertyFullAddress;
			dataObj.otherInfo = propModel.otherInfo;
			dataObj.propertyYearBuilt = propModel.propertyInfo.yearBuilt;
			dataObj.nir = (propModel.propertyInfo.nir? propModel.propertyInfo.nir: "");
			dataObj.myStructure = thisPtr.myStructure;
			dataObj.initialRehab = app.propertyDetailView.rehabEstTabView.initialRehab;
			if(thisPtr.editMode){
				var tCost = 0;
				for(var i = 0; i < thisPtr.myStructure.length  ; i++){
					var lId = thisPtr.myStructure[i];
	                tCost += parseFloat((lId.rehabCost ? lId.rehabCost : 0));
	            }
	            dataObj.huOversightFee = (tCost/10);
	            dataObj.total = (tCost + dataObj.huOversightFee);

			} else {
				dataObj.huOversightFee = 0;
				dataObj.total = 0;
			}
			return dataObj;
		},

		populatePropDtlsModel: function(){
			var thisPtr = this;
			if(app.propertyModel)
			{
				thisPtr.propertyDetails = {
					"propertyId" : app.propertyModel.toJSON().propertyId,
					"propertyImg" : app.propertyModel.toJSON().mediumLink,
					"propertyaddress" : app.propertyModel.toJSON().propertyFullAddress,
					"propertyOtherInfo" : app.propertyModel.toJSON().otherInfo,
					"propertyYearBuilt" : app.propertyModel.toJSON().propertyInfo.yearBuilt,
					"propertyNIR" : app.propertyModel.toJSON().propertyInfo.nir,
					"propertyPreSel" : (thisPtr.huSelect? thisPtr.huSelect: null)
				}
				
			}
		},

		showPropertyDtlsPage: function(){
			var thisPtr=this;
			if(thisPtr.currentHeadCategory == "summary"){
				location.reload();
			} else {
				var newPostData = thisPtr.getPostData(thisPtr.currentHeadCategory);
				thisPtr.saveHeadCategoryData(newPostData, "exit", thisPtr.currentHeadCategory);
			}
		},

		showLeaveEstimatePopup : function(){
			var modal = '<div class="modal fade" id="test_modal" style = "background-color: white;width : 414px; height : 175px; margin : auto ; padding : auto	"><div class="modal-body font16"><strong><p class="marg_top20"><i class="fa fa-exclamation-triangle font-red-haze fa-lg font20 marg_right10"></i>Do you want to cancel your rehab estimate ?</p></strong></div><div class="modal-footer col-md-12"><a class="btnYes btn bg-blue col-md-5 col-md-offset-1">Yes</a> <a class="btnCancel col-md-5 btn btn-default">No</a>';
			modal += '</div></div>';
			$("#modalPopup").html('');
			$("#modalPopup").append(modal);
			$("#modalPopup").show();
			$("#test_modal").modal('show');
			$(".modal-footer > .btnYes").click(
					function(){
						$.ajax({
						url: app.context()+ '/rehabEstimator/CancelRehabEstimator',
						headers: { 
					        'Accept': 'application/json',
					        'Content-Type': 'application/json' 
					    },
						type: 'POST',
						data: JSON.stringify({
							  "propertId": app.propertyModel.toJSON().propertyId,
							  "inspectionType": "Rehab Estimator"
						  }),
						  success: function(res){
							  console.log("success : " + JSON.stringify(res));
							  location.reload();
						  },
						  error: function(res){
							  console.log("error : " + JSON.stringify(res));
							  thisPtr.showSaveError();
						  },
						  dataType: "json"
						});
					}
					);
			$(".modal-footer > .btnCancel").click(
					function(){
						$("#modalPopup").hide();
						$("#test_modal").modal('hide');
					}
					);
		},

		fetchRehabStructure: function(){
			var thisPtr = this;
			console.log("huSelect:" + thisPtr.huSelect);
			$.ajax({
				url: app.context()+ '/rehabEstimator/fetchAllRehabEstimatDetails?propertyId='+ app.propertyModel.toJSON().propertyId +'&&inspectionType=Rehab Estimator&&startRehab=Y',
				type: 'GET',
				async: false,
				success: function(res){
					thisPtr.myStructure = res.headCategoryResponse;
					thisPtr.pricingModel = res.pricelogicDetails;
				},
				error: function(res){
					console.log("Error:::" + res);
					$("#rehabDisplayError").show();
				}
			});
		},

		// createSideBar : function(obj , obj1){
		// 	var img = '<div class="row no-margin-row" style="text-align: center;"><img style="margin-bottom:12px; display: inline-block !important; width: 100%;" src="' + obj.propertyImg + '" class="img-responsive" /></div>';
		// 	var address = '<div><span><strong class="font-dark marg_top10 font16">' + obj.propertyaddress + '</strong></span></div>';
		// 	var otherInfo = '<div class="marg_top8"><span><strong class="font14">' + obj.propertyOtherInfo + '</strong></span></div>';
		// 	otherInfo = otherInfo + '<div><span><strong class="font14">*Built: ' + obj.propertyYearBuilt + '</strong></span></div>';
		// 	var propertyNIR = '<div><span><strong  class="font14"> NIR Rating: ' + (obj.propertyNIR ? obj.propertyNIR : "-") + '</strong></span></div>';
		// 	var preSelect = '<div><span><strong  class="font14"> Pre-Select: ' + (obj.propertyPreSel ? "Yes" : "No") + '</strong></span></div>';
		// 	var separator = '<hr style="margin-top: 5px; margin-bottom: 5px;">';
		// 	var initial_estimate = app.propertyDetailView.rehabEstTabView.initialRehab;

		// 	var initialrehabEstimate = 	'<div class="font-blue-color font15">Initial Est. Rehab: <span class="font-blue-color font15 rehab_amt">' + (initial_estimate ? initial_estimate : "0") + '</span> </div>';
		// 	var detailedRehabEstimate = '<strong class="font15"> Detail Rehab Estimate </strong>';
		// 	$('#rehab-sidebar-prop-dtls').append(img).append(address).append(otherInfo).append(propertyNIR).append(preSelect).append('<hr style="margin-top: 5px; margin-bottom: 5px;">');
		// 	$('#initRehab').html(initialrehabEstimate)
		// 	$('#DetailedRehab').html(detailedRehabEstimate);
		// 	var tCost = 0;
		// 	for(var i = 0 ; i < obj1.length ; i++) 
		// 	{
		// 		var item = '<div style="margin-bottom: 5px;"><span id = "sidebar-head-cat-' + obj1[i].categoryId + '" > ';
		// 		item = item + obj1[i].categoryName;
		// 		item = item + '</span>';
		// 		item += '<span class="side-head-cat-total rehab_amt pull-right" id="sidebar-head-cat-val-' + obj1[i].categoryId + '">' + (obj1[i].rehabCost ? obj1[i].rehabCost : "0") + '</span></div>';
		// 		tCost += parseFloat((obj1[i].rehabCost ? obj1[i].rehabCost : 0));
		// 		$('#rehab-sidebar-summary').append(item);
		// 	}
		// 	var oversightDiv = '<div ><span> Oversight Fee </span>';
		// 	oversightDiv = oversightDiv + '<span class="rehab_amt pull-right" id="huOversightFee">0</span>';
		// 	$('#rehab-sidebar-summary').append(oversightDiv); 
		// 	$('#rehab-sidebar-summary').append('<hr style="margin-top: 5px; margin-bottom: 5px;">');
		// 	var totalCost = '<div><strong><span class = "col-md-5" style = "text-align:left; padding: 0;"> TOTAL </span><span id="all-categories-total" class = "col-md-7 rehab_amt" style = "text-align: right; padding: 0;">'+ (tCost ? tCost : "0")+ '</span></strong></div>';
		// 	$('#rehab-sidebar-summary-total').append(totalCost).append('<hr>');		
		// },

		createMainSection: function(headCategories){
			var thisPtr = this;
			var i;
			var j;
			var k;

			if(!headCategories || (headCategories.length == 0)){
				return;
			}
			
			headArray = {};
			var rehabNotRequiredArr = [];

			for(i=0; i<headCategories.length; i++){
				//for each super category create a navigation item + super category div

				var headCategoryId = headCategories[i].categoryId;
				var headCategoryName = headCategories[i].categoryName;
				var headCategoryCost = headCategories[i].rehabCost;

				//thisPtr.pricingModel.headCategoryId = headCategoryCost;
				thisPtr.createHeadCategoryNavAndDiv(headCategoryId, headCategoryName, (i+1));

				thisPtr.formStructureObj["H"+ headCategoryId] = headCategories[i].formStructureId;
				thisPtr.formLevelObj["H"+ headCategoryId] = headCategories[i].displayLevel;
				
				var categoryArray = {};

				for(j=0; j<headCategories[i].categories.length; j++){
					//for each category create a separate div inside head category div

					var categoryId = headCategories[i].categories[j].categoryId;
					var categoryName = headCategories[i].categories[j].categoryName;
					var categoryCost = headCategories[i].categories[j].rehabCost;
					var rehabFlagClicked = false;
					if(headCategories[i].categories[j].showRehabReqd && headCategories[i].categories[j].data && headCategories[i].categories[j].data.rehabNotRequired && headCategories[i].categories[j].data.rehabNotRequired == "Y"){
						rehabFlagClicked = true;
					}

					thisPtr.formStructureObj["H"+ headCategoryId + '-C' + categoryId] = headCategories[i].categories[j].formStructureId;
					thisPtr.formLevelObj["H"+ headCategoryId + '-C' + categoryId] = headCategories[i].categories[j].displayLevel;

					//categoryArray.push(categoryId);

					var categoryDiv = 	'<div class="row  no-margin-row  category-div-complete panel">' +
											'<div class="row  no-margin-row marg-top-20 rhb-title" id="category-div-' + categoryId + '" data-head-category-id="'+ headCategoryId +'"></div>' +
											'<div class="row  no-margin-row portlet-body clearfix" style="padding-top: 20px !important; padding-bottom: 20px !important;" id="category-div-' + categoryId + '-body" data-head-category-id="'+ headCategoryId +'"></div>' +
											'<div class="row  no-margin-row portlet-body clearfix" style="padding-bottom: 20px !important;" id="category-div-' + categoryId + '-misc" data-head-category-id="'+ headCategoryId +'"></div>' +
										'</div>';
					$("#head-category-div-"+ headCategoryId).append(categoryDiv);
					$("#category-div-"+categoryId).append(thisPtr.getCategoryTitleAndRehabRow(categoryId, categoryName, categoryCost, headCategories[i].categories[j].showRehabReqd, headCategoryId));
					
					//PLEASE DO NOT REMOVE FOLLOWING FOR FIXING SONAR ISSUES!!!
					//if rehab not required div present then display the value for checkbox accordingly
					//to be done in phase 2
					//if(data.headCategories[i].categories[j].showRehabNotReqd == 'Y' && data.headCategories[i].categories[j].data.rehabNotReqd == 'Y'){
					//	$('#category-div-' + data.headCategories[i].categories[j].categoryId + '-rehab').attr('checked', true);
					//}

					var itemsArray = [];

					if(headCategories[i].categories[j].items){
						//item level template handling

						for(k=0; k<headCategories[i].categories[j].items.length; k++){
							//loop through category items if present and append to category div
							var item = headCategories[i].categories[j].items[k];
							var itemId = item.categoryId;
							var itemName = item.categoryName;
							var templateId = item.itemTemplateId;

							thisPtr.formStructureObj["H"+ headCategoryId + "-C" + categoryId + "-I" + itemId] = headCategories[i].categories[j].items[k].formStructureId;
							thisPtr.formLevelObj["H"+ headCategoryId + "-C" + categoryId + "-I" + itemId] = headCategories[i].categories[j].items[k].displayLevel;

							itemsArray.push(itemId);

							if(templateId == "T1" || templateId == "T2"){
								var categoryItemDiv = 	'<div class="my-item-div margin-bottom-25" id="cat-item-div-'+ itemId +'" data-item-id="'+ itemId +'" data-category-id="' + categoryId + '" data-head-category-id="' + headCategoryId + '"></div>';
								$("#category-div-" + categoryId + "-body").append(categoryItemDiv);
								$("#cat-item-div-"+ itemId).append(thisPtr.getItemTitleRowWithCounter(itemName, itemId, templateId, categoryId, headCategoryId, true));
								if(thisPtr.editMode && item.data && item.data.noOfRooms && item.data.noOfRooms > 0 ){
									for(room = 0; room < item.data.rooms.length; room++){
										thisPtr.addFlooringRow((room + 1), templateId, itemId, categoryId, headCategoryId, item.data.rooms[room]);
									}
									$("#cat-item-"+ itemId +"-counter").val(item.data.noOfRooms);
								} else {
									thisPtr.addFlooringRow(1, templateId, itemId, categoryId, headCategoryId);
									if(!thisPtr.editMode){
										thisPtr.updateCatAndHeadCost(categoryId , headCategoryId);
									}
								}
							} else if(templateId == "T4" || templateId == "T5"){
								var categoryItemDiv = 	'<div class="my-item-div margin-bottom-25" id="cat-item-div-'+ itemId +'" data-item-id="'+ itemId +'" data-category-id="' + categoryId + '" data-head-category-id="' + headCategoryId + '"></div>';
								$("#category-div-" + categoryId + "-body").append(categoryItemDiv);
								$("#cat-item-div-"+ itemId).append(thisPtr.getSimpleTitleText(itemName));
								if(templateId == "T4" && itemId == 12){
									if(thisPtr.editMode && item.data){
										$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT4("col-md-7", itemId, categoryId, headCategoryId, item.data, null, true));	
									} else {
										$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT4("col-md-7", itemId, categoryId, headCategoryId, thisPtr.createDummyDataT4(), null, true));
									}
								} else if(templateId == "T4"){
									if(thisPtr.editMode && item.data){
										$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT4("col-md-9", itemId, categoryId, headCategoryId, item.data, null, false));	
									} else {
										$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT4("col-md-9", itemId, categoryId, headCategoryId, thisPtr.createDummyDataT4(), null, false));
									}
								} else if(templateId == "T5"){
									if(thisPtr.editMode && item.data){
										$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT5(itemId, categoryId, headCategoryId, item.data));
									} else {
										$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT5(itemId, categoryId, headCategoryId, thisPtr.createDummyDataT5()));
									}
									
								}
								
							} else if(templateId == "T6" || templateId == "T7"){
								var categoryItemDiv = 	'<div class="my-item-div margin-bottom-25" id="cat-item-div-'+ itemId +'" data-item-id="'+ itemId +'" data-category-id="' + categoryId + '" data-head-category-id="' + headCategoryId + '"></div>';
								$("#category-div-" + categoryId + "-body").append(categoryItemDiv);
								$("#cat-item-div-"+ itemId).append(thisPtr.getSimpleTitleText(itemName));
								if(templateId == "T6"){
									if(thisPtr.editMode && item.data){
										$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT6(itemId, categoryId, headCategoryId, item.data));
									} else {
										$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT6(itemId, categoryId, headCategoryId, thisPtr.createDummyDataT6()));
									}
								} else if(templateId == "T7"){
									$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT7(itemId, categoryId, headCategoryId, item.comments, item.rehabCost));
								}
								
							} else if(templateId == "T8"){
								var categoryItemDiv = 	'<div class="row my-item-div no-margin-row " id="cat-item-div-'+ itemId +'" data-item-id="'+ itemId +'" data-category-id="' + categoryId + '" data-head-category-id="' + headCategoryId + '"></div>';
								$("#category-div-" + categoryId + "-body").append(categoryItemDiv);
								if(thisPtr.editMode && item.data){
									$("#cat-item-div-"+ itemId).append(thisPtr.getItemTitleRowWithPresentAbsent(itemName, itemId, templateId, categoryId, headCategoryId, item.data));
									var newObj = {};
									if(item.data.action){
										newObj.action = item.data.action;
									} else {
										newObj.action = "likenew";
									}
									if(!(item.data.option == "absent")){
										$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT4("col-md-9", itemId, categoryId, headCategoryId, item.data, "Y"));	
									}
								} else {
									$("#cat-item-div-"+ itemId).append(thisPtr.getItemTitleRowWithPresentAbsent(itemName, itemId, templateId, categoryId, headCategoryId, {option:"present",action:"likenew",cost:0}));
									$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT4("col-md-9", itemId, categoryId, headCategoryId, thisPtr.createDummyDataT4(), "Y"));	
								}
								
							} else if(templateId == "T11"){
								var categoryItemDiv = 	'<div class="my-item-div margin-bottom-25" id="cat-item-div-'+ itemId +'" data-item-id="'+ itemId +'" data-category-id="' + categoryId + '" data-head-category-id="' + headCategoryId + '"></div>';
								$("#category-div-" + categoryId + "-body").append(categoryItemDiv);
								if(thisPtr.editMode && item.data){
									$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT11(itemId, itemName, categoryId, headCategoryId, item.data));
								} else {
									$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT11(itemId, itemName, categoryId, headCategoryId, {size: 0, cost: 0}));
								}
							} 
							// else if(headCategories[i].categories[j].categoryId == 31){
							// 	var categoryItemDiv = 	'<div class="row my-item-div no-margin-row " id="cat-item-div-'+ itemId +'" data-item-id="'+ itemId +'" data-category-id="' + categoryId + '" data-head-category-id="' + headCategoryId + '"></div>';
							// 	$("#category-div-" + categoryId + "-body").append(categoryItemDiv);
							// 	$("#cat-item-div-"+ itemId).append(thisPtr.getSimpleTitleText(itemName));
							// 	if(templateId == "T4"){
							// 		$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT4("col-md-8", itemId, categoryId, headCategoryId, thisPtr.createDummyDataT4()));
							// 	}
							// } 
							else if(templateId == "T12"){
								var categoryItemDiv = 	'<div class="my-item-div margin-bottom-25" id="cat-item-div-'+ itemId +'" data-item-id="'+ itemId +'" data-category-id="' + categoryId + '" data-head-category-id="' + headCategoryId + '"></div>';
								$("#category-div-" + categoryId + "-body").append(categoryItemDiv);
								if(thisPtr.editMode && item.data){
									$("#cat-item-div-"+ itemId).append(thisPtr.getItemTitleRowWithYesNo(itemName, itemId, null, categoryId, headCategoryId, item.data));
								} else {
									$("#cat-item-div-"+ itemId).append(thisPtr.getItemTitleRowWithYesNo(itemName, itemId, null, categoryId, headCategoryId, {option:"no", cost:0}));
								}
							} else if(templateId == "T13"){
								var categoryItemDiv = 	'<div class="my-item-div margin-bottom-25" id="cat-item-div-'+ itemId +'" data-item-id="'+ itemId +'" data-category-id="' + categoryId + '" data-head-category-id="' + headCategoryId + '"></div>';
								$("#category-div-" + categoryId + "-body").append(categoryItemDiv);
								if(thisPtr.editMode && item.data){
									$("#cat-item-div-"+ itemId).append(thisPtr.getItemTitleRowWithYesNo(itemName, itemId, null, categoryId, headCategoryId, item.data));
									if(item.data.option == "yes"){
										$("#cat-item-div-"+ itemId).append(thisPtr.getSmallCounter("No. of locks required", itemId, categoryId, headCategoryId, item.data));	
									}
								} else {
									$("#cat-item-div-"+ itemId).append(thisPtr.getItemTitleRowWithYesNo(itemName, itemId, null, categoryId, headCategoryId, {option:"no", cost:0}));
								}
							}
						}
					} else {
						//category level template handling
						if(headCategories[i].categories[j].categoryTemplateId == "T3"){
							if(thisPtr.editMode && headCategories[i].categories[j].rehabCost > 0){
								thisPtr.createTemplateT3(categoryId, headCategories[i].categories[j].data, null, headCategoryId);
							} else {
								thisPtr.createTemplateT3(categoryId, thisPtr.createDummyDataT3(categoryId), null, headCategoryId);	
								if(!thisPtr.editMode){
									thisPtr.updateCatAndHeadCost(categoryId ,headCategoryId );
								}
							}
						} else if(headCategories[i].categories[j].categoryTemplateId == "T10"){
							if(thisPtr.editMode && headCategories[i].categories[j].data){
								thisPtr.createTemplateT10(categoryId, headCategoryId, headCategories[i].categories[j].data);
							} else {
								thisPtr.createTemplateT10(categoryId, headCategoryId, {action:"likenew", cost: 0});
							}
						} else if(headCategories[i].categories[j].categoryTemplateId == "T7"){
							$("#category-div-"+categoryId+"-body").append(thisPtr.createTemplateT7(null, categoryId, headCategoryId, headCategories[i].categories[j].comments, headCategories[i].categories[j].rehabCost));
						}					
					}

					categoryArray[categoryId] = itemsArray;

					thisPtr.addMiscellaneousItems(categoryId, headCategoryId, headCategories[i].categories[j].data);

					if(rehabFlagClicked){
						rehabNotRequiredArr.push(categoryId);
					}
					
				}

				thisPtr.addBackAndNextButtons(i);
				thisPtr.headArray[headCategoryId] = categoryArray;

			}

			if(rehabNotRequiredArr.length > 0){
				for(i=0; i<rehabNotRequiredArr.length; i++){
					$("#category-div-"+ rehabNotRequiredArr[i] +"-rehab").trigger("click");
				}
			}

			$(".update-rehab-cost").formatCurrency({roundToDecimalPlace:2, symbol:""});	
			$(".rehab_amt").formatCurrency({roundToDecimalPlace:2});

			//hide all head category divs and display only the first head category div by default
			thisPtr.showHeadDivById(headCategories[0].categoryId);
		},

		createHeadCategoryNavAndDiv: function(headCategoryId, headCategoryName, indexNo){
			var thisPtr = this;
			var navItem;
			if(indexNo == 1 || indexNo == 2 ||indexNo == 5){
				navItem = thisPtr.getHeadCategoryNavigationDiv("col-md-2", headCategoryId, headCategoryName, indexNo);	
			} else {
				navItem = thisPtr.getHeadCategoryNavigationDiv("col-md-3", headCategoryId, headCategoryName, indexNo);	
			}
			
			$("#head-category-navigation").append(navItem);
			var navItemDiv = '<div class="rehab-category-div" id="head-category-div-'+ headCategoryId +'" data-head-cat-id="' + 
								headCategoryId + '"></div>';
			$("#head-category-div-container").append(navItemDiv);
		},

		getHeadCategoryNavigationDiv: function(classes, headCategoryId, headCategoryName, indexNo){
			return 	'<div class="rehab-head-category upper-head-category mt-step-col  ' + (classes? classes:"") + '" style="display:inline-block !important;" data-head-cat-id="' + headCategoryId + '" id="upper-head-category-'+ headCategoryId +'">' + 
						'<div class="col-md-3 head-category-number mt-step-number bg-white">' + indexNo + '</div>' +
						'<div class="head-category-name mt-step-title font-grey-cascade">' + headCategoryName + '</div>' +
					'</div>';
		},

		getCategoryTitleAndRehabRow:function(categoryId, categoryName, categoryCost, showRehabNotReqdRow, headCategoryId){
			var thisPtr = this;
			var categoryHeaderSection = thisPtr.createCategoryTitle(categoryName, categoryId, categoryCost);
			if(showRehabNotReqdRow){
				categoryHeaderSection = categoryHeaderSection + 
											thisPtr.addRehabNotRequiredRow(categoryId, categoryName, headCategoryId);
			}
			return categoryHeaderSection;
		},

		createCategoryTitle: function(categoryName, categoryId, rehabCost){
			var catTitle = 	'<div class="font16 rehab-category-title-row portlet-title clearfix">' +
								'<div class="caption">' + categoryName + '</div>';
			if(categoryId != 40){
				if(!rehabCost){
					catTitle = catTitle + '<div class="pull-right category-title-side-cost rehab_amt" id="category-div-' + categoryId + '-cost">' + 0 + '</div>';
				} else {
					catTitle = catTitle + '<div class="pull-right category-title-side-cost rehab_amt" id="category-div-' + categoryId + '-cost">' + rehabCost + '</div>';
				}
			}
								
			catTitle = catTitle + '</div>';
			return catTitle;
		},

		addRehabNotRequiredRow: function(categoryId, categoryName, headCategoryId){
			return '<div class="alert alert-info notrequired clearfix">' +
						'<span class="input-group-addon pull-left marg_right10" data-category-id="'+ categoryId +'">' +
                         	'<input id="category-div-' + categoryId + '-rehab" class="checkbox-custom rehab-not-required" type="checkbox"  data-category-id="'+ categoryId +'" data-head-category-id="'+ headCategoryId +'">' +
                            '<label for="category-div-' + categoryId + '-rehab" class="checkbox-custom-label marg_top5 alert-blue">Rehab not required</label>' +
                        '</span>' +
						'<p class="marg_left20 pull-right marg_top15 marg_right10 display-hide" style="text-align: right;" id="rehab-not-required-text-' + categoryId + '">' + categoryName + ' is in good condition </p>' +
					'</div>';
		},

		showHeadCategoryDiv: function(evt){
			var thisPtr = this;
			var newPostData = thisPtr.getPostData(thisPtr.currentHeadCategory);
			var headCategoryIdToDisplay = $(evt.currentTarget).data("head-cat-id");
			thisPtr.saveHeadCategoryData(newPostData, headCategoryIdToDisplay, thisPtr.currentHeadCategory);

			if((headCategoryIdToDisplay + "").toUpperCase() == "SUMMARY")
            {
				thisPtr.showSecondLastrehabSummary();
				return;
            }
		},

		showHeadDivById: function(divId){
			var thisPtr = this;
			$(".rehab-category-div").hide();
			$("#head-category-div-"+divId).show();
			$(".upper-head-category").find(".head-category-number").removeClass("active");
			$("#upper-head-category-"+divId).find(".head-category-number").addClass("active");
			thisPtr.currentHeadCategory = divId;
		},

		getItemTitleRowWithCounter: function(itemName, itemId, templateId, categoryId, headCategoryId, makeCounterFieldReadOnly){
			var thisPtr = this;
			var tmpTitle = 	'<div class="col-md-12 clearfix">' +
								'<div class="item-title-name font16 font-dark">' + itemName + '</div>' +
							'</div>' +
							'<div class="col-md-12 item-title-side-text margin-bottom-20" style="text-align: right;"> <p class="margin-bottom-5 marg_top10 font15 pull-left marg_right15 grey-color"> No of Rooms: </p>' +
								'<div class="pull-left marg_left5 col-md-3 plusminusToggle">' + thisPtr.addCounterDiv(itemId, templateId, 1, categoryId, headCategoryId, makeCounterFieldReadOnly) + '</div>' +
							'</div><br>';
			return tmpTitle;
		},

		getItemTitleRowWithPresentAbsent: function(itemName, itemId, templateId, categoryId, headCategoryId, data){
			var thisPtr = this;
			var tmpTitle = 	'<div class="row  no-margin-row item-ac">' +
								'<div class="col-md-5 item-title-name font16 col-md-12 ">' + itemName + '</div>' +
								'<div class="col-md-5 toggleCl text-right">' + 
									'<div class="form-group">' +
	                                    '<div class="btn-group marg_left10" data-toggle="buttons">' +
	                                        '<label class="present-toggle-btn item-toggle-action btn btn-default leftradius ' + ((data.option == "present")? "active":"") + '" data-item-id="' + itemId + '" data-template-id="' + templateId + '" data-head-category-id="'+ headCategoryId +'" data-category-id="'+ categoryId +'">' +
	                                        '<input class="toggle" name="action" id="style1" value="present" type="radio"> Present </label>' +
	                                        '<label class="absent-toggle-btn item-toggle-action btn btn-default rightradius ' + ((data.option == "absent")? "active":"") + '" data-item-id="' + itemId + '" data-template-id="' + templateId + '" data-head-category-id="'+ headCategoryId +'" data-category-id="'+ categoryId +'">' +
	                                        '<input class="toggle" name="action" id="style2" value="absent" type="radio"> Absent </label>' +
	                                    '</div>' +
	                                '</div>' +
								'</div>' +
								thisPtr.getCostDiv(data.cost, itemId, categoryId, headCategoryId) + 
							'</div>';
			return tmpTitle; 
		},

		getItemTitleRowWithYesNo: function(itemName, itemId, templateId, categoryId, headCategoryId, data){
			var thisPtr = this;
			var tmpTitle = 	'<div class="row  no-margin-row ">' +
								'<div class="col-md-5 item-title-name font16">' + itemName + '</div>' +
								'<div class="col-md-5 text-right">' + 
									'<div class="form-group item-option">' +
										'<label class="col-md-7 control-label6 texalignright"> Required ? </label>' +
	                                    '<div class="btn-group marg_left10" data-toggle="buttons">' +
	                                        '<label class="yes-toggle-btn item-toggle-action btn btn-default leftradius ' + ((data.option == "yes")? "active":"") + '" data-item-id="' + itemId + '" data-head-category-id="'+ headCategoryId +'" data-category-id="'+ categoryId +'">' +
	                                        '<input class="toggle" name="action" id="style1" value="yes" type="radio"> Yes </label>' +
	                                        '<label class="no-toggle-btn item-toggle-action btn btn-default rightradius ' + ((data.option == "no")? "active":"") + '" data-item-id="' + itemId + '" data-head-category-id="'+ headCategoryId +'" data-category-id="'+ categoryId +'">' +
	                                        '<input class="toggle" name="action" id="style2" value="no" type="radio"> No </label>' +
	                                    '</div>' +
	                                '</div>' +
								'</div>' +
								thisPtr.getCostDiv(data.cost, itemId, categoryId, headCategoryId) + 
							'</div>';
			return tmpTitle; 	
		},

		addCounterDiv: function(itemId, templateId, count, categoryId, headCategoryId, makeCounterFieldReadOnly){
			var counterDiv ='<div class="input-group">';
			counterDiv = counterDiv + 
								'<span class="input-group-addon rehab-counter-minus leftradius " data-item-id="'+ itemId +'" data-template-id="'+ templateId +'" data-category-id="' + categoryId + '" data-head-category-id="' + headCategoryId + '"><i class="fa fa-minus"></i></span>' +
	  							'<input style="text-align: center;" class="form-control item-counter-field" type="text" id="cat-item-'+ itemId +'-counter" value="' + (count? count: 0) + '"  data-item-id="'+ itemId +'" data-template-id="'+ templateId +'" data-category-id="' + categoryId + '" data-head-category-id="' + headCategoryId + '" '+ (makeCounterFieldReadOnly? 'readonly="true"': "") +'>' +
	  							'<span class="input-group-addon rehab-counter-plus rightradius " data-item-id="'+ itemId +'" data-template-id="'+ templateId +'" data-category-id="' + categoryId + '" data-head-category-id="' + headCategoryId + '"><i class="fa fa-plus"></i></span>';
			counterDiv = counterDiv + 
						 	'</div>';
			return counterDiv;
		},

		addFlooringRow: function(roomNo, templateId, itemId, categoryId, headCategoryId, roomData){
			var thisPtr = this;
			var propSize = app.propertyModel.toJSON().propertyDetails.totalSqft;
			if(!roomData){
				roomData = thisPtr.createDummyDataT1T2();
				if(itemId == "4" && !thisPtr.editMode){
					roomData.size = propSize;
					roomData.cost = this.getPriceCatActSize(itemId, roomData.action, roomData.size);
				}
			}
			thisPtr.createFlooringRow(templateId, itemId, "Room "+ roomNo, roomData, categoryId, headCategoryId);
		},

		createDummyDataT1T2: function(){
			var roomData = {};
			roomData.action = "replace";
			roomData.size = 0;
			roomData.cost = 0;
			return roomData;
		},

		updateCategoryAndHeadCategoryCost: function(evt){
			var thisPtr = this;
			var categoryId = $(evt.currentTarget).data("category-id");
			var headCategoryId = $(evt.currentTarget).data("head-category-id");
			thisPtr.updateCategoryCost(categoryId);
			thisPtr.updateHeadCategoryCost(headCategoryId);
			thisPtr.updateTotalCost(true);
		},

		updateCategoryAndHeadCategoryCost2: function(evt){
			var thisPtr = this;
			var categoryId = $(evt.currentTarget).data("category-id");
			var headCategoryId = $(evt.currentTarget).data("head-category-id");
			thisPtr.updateCategoryCost(categoryId);
			thisPtr.updateHeadCategoryCost(headCategoryId);
			thisPtr.updateTotalCost();
		},

		updateCategoryCost: function(categoryId){
			var categorySum = 0;
			var arr = $(".update-rehab-cost[data-category-id='" + categoryId + "']");
			for(i=0; i < arr.length; i++){
				var cost = parseFloat($(arr[i]).val().replace("$","").replace(",",""));
				categorySum = categorySum + (cost? cost: 0);
			}
			console.log("catId:"+ categoryId + " sum:" + categorySum);
			$("#category-div-"+ categoryId +"-cost").text(categorySum);
		},

		updateHeadCategoryCost: function(headCategoryId){
			var headCategorySum = 0;
			var arr = $(".update-rehab-cost[data-head-category-id='" + headCategoryId + "']");
			for(i=0; i < arr.length; i++){
				var cost = parseFloat($(arr[i]).val().replace("$","").replace(",",""));
				headCategorySum = headCategorySum + (cost? cost: 0);
			}
			console.log("headcatId:"+ headCategoryId + " sum:" + headCategorySum);
			$("#sidebar-head-cat-val-"+ headCategoryId).text(headCategorySum);
		},

		updateTotalCost: function(doNotUpdateCost){
			var thisPtr = this;
			var a = $(".side-head-cat-total");
			var sum = 0;
			for(i=0; i<a.length; i++){
				var cost = parseFloat($(a[i]).text().replace("$","").replace(",",""));
				sum = sum + (cost? cost: 0);
			}
			var oversightFee = 0.1 * sum;
			$("#huOversightFee").text(oversightFee);
			var includingOversightFee = sum + oversightFee;
			$("#all-categories-total").text(includingOversightFee);
			if(!doNotUpdateCost){
				$(".update-rehab-cost").formatCurrency({roundToDecimalPlace:2, symbol:""});	
			}
			$(".rehab_amt").formatCurrency({roundToDecimalPlace:2});
		},

		removeLastTemplateRowAndRecalculate: function(evt){
			var thisPtr = this;
			var itemId = $(evt.currentTarget).data("item-id");
			var categoryId = $(evt.currentTarget).data("category-id");
			var headCategoryId = $(evt.currentTarget).data("head-category-id");
			var templateId = $(evt.currentTarget).data("template-id");
			var itemIdCounter;
			try{
				itemIdCounter = parseInt($("#cat-item-"+ itemId +"-counter").val());
			}catch(err){
				itemIdCounter = 0;
			}
			if(itemIdCounter > 0){
				itemIdCounter = itemIdCounter - 1;
				$("#cat-item-"+ itemId +"-counter").val(itemIdCounter);
				thisPtr.removeLastRowFromDiv("#cat-item-div-"+itemId, ".cat-item-"+itemId+"-body");
				thisPtr.updateCategoryCost(categoryId);
				thisPtr.updateHeadCategoryCost(headCategoryId);
				thisPtr.updateTotalCost();
			} else {
				$("#cat-item-"+ itemId +"-counter").val("0");
			}
			if($.inArray(itemId, [15,16,27,28,39]) != -1){
				//counter dependent pricing
				var row = $("#cat-item-div-"+itemId);
				var action = $(row).find("[name=itemAction-"+ itemId +"]:checked").val();
				if(!action){
					action = "replace";
				}
				var size = itemIdCounter;
				var calcCost = thisPtr.getPriceCatActSize(itemId, action, size);
				$(row).find("[name=item-cost]").val(calcCost);
			}
			thisPtr.updateCatAndHeadCost(categoryId, headCategoryId);
		},

		removeTemplateForAbsent: function(evt){
			var thisPtr = this;
			var itemId = $(evt.currentTarget).data("item-id");
			var categoryId = $(evt.currentTarget).data("category-id");
			var headCategoryId = $(evt.currentTarget).data("head-category-id");
			thisPtr.removeLastRowFromDiv("#cat-item-div-"+itemId, ".single-row-template");
			thisPtr.updateCategoryCost(categoryId);
			thisPtr.updateHeadCategoryCost(headCategoryId);
			thisPtr.updateTotalCost();
		},

		removeTemplateForNo: function(evt){
			var thisPtr = this;
			var itemId = $(evt.currentTarget).data("item-id");
			thisPtr.removeLastRowFromDiv("#cat-item-div-"+itemId, ".single-row-template");
		},

		removeCommentsSection: function(evt){
			var thisPtr = this;
			var templateId = $(evt.currentTarget).data("template-id");

			if(templateId){
				if(templateId == "T7" && $(evt.currentTarget).closest(".single-row-template").find(".comment-box-row").length == 1){
					$(evt.currentTarget).closest(".single-row-template").find(".comment-box-row").remove();
				}
			}
		},

		addTemplateRowAndRecalculate: function(evt){
			var thisPtr = this;
			var itemId = $(evt.currentTarget).data("item-id");
			var templateId = $(evt.currentTarget).data("template-id");
			var categoryId = $(evt.currentTarget).data("category-id");
			var headCategoryId = $(evt.currentTarget).data("head-category-id");
			var propSize = app.propertyModel.toJSON().propertyDetails.totalSqft;
			var itemIdCounter;
			try{
				itemIdCounter = parseInt($("#cat-item-"+ itemId +"-counter").val());
			}catch(err){
				itemIdCounter = 0;
			}
			if(itemIdCounter >= 0){
				itemIdCounter = itemIdCounter + 1;
				$("#cat-item-"+ itemId +"-counter").val(itemIdCounter);
				var roomData = thisPtr.createDummyDataT1T2(itemId);
				if(itemId == "4"){
					roomData.size = propSize;
					roomData.cost = this.getPriceCatActSize(itemId, roomData.action, roomData.size);
				}
				thisPtr.createFlooringRow(templateId, itemId, "Room "+itemIdCounter, roomData, categoryId, headCategoryId);
			} 
			//else {
			//	$("#cat-item-"+ itemId +"-counter").val("1");
			//}
			if($.inArray(itemId, [15,16,27,28,39]) != -1){
				//counter dependent pricing
				var row = $("#cat-item-div-"+itemId);
				var action = $(row).find("[name=itemAction-"+ itemId +"]:checked").val();
				if(!action){
					action = "replace";
				}
				var size = itemIdCounter;
				var calcCost = thisPtr.getPriceCatActSize(itemId, action, size);
				$(row).find("[name=item-cost]").val(calcCost);
			}
			thisPtr.updateCatAndHeadCost(categoryId, headCategoryId);
		},

		showTemplateForPresent: function(evt){
			var thisPtr = this;
			var itemId = $(evt.currentTarget).data("item-id");
			var templateId = $(evt.currentTarget).data("template-id");
			var categoryId = $(evt.currentTarget).data("category-id");
			var headCategoryId = $(evt.currentTarget).data("head-category-id");
			if($("#cat-item-div-"+itemId + " .single-row-template").length == 0){
				$("#cat-item-div-"+ itemId).append(thisPtr.createTemplateT4("col-md-8", itemId, categoryId, headCategoryId, thisPtr.createDummyDataT4(), "Y"));	
			}
		},

		showTemplateForYes: function(evt){
			var thisPtr = this;
			var itemId = $(evt.currentTarget).data("item-id");
			var categoryId = $(evt.currentTarget).data("category-id");
			var headCategoryId = $(evt.currentTarget).data("head-category-id");
			if(itemId == 39){
				if($("#cat-item-div-"+itemId + " .single-row-template").length == 0){
					$("#cat-item-div-"+ itemId).append(thisPtr.getSmallCounter("No. of locks required", itemId, categoryId, headCategoryId, {size: 0, cost: 0}));	
				}
			}
		},

		addCommentsSection: function(evt){
			var thisPtr = this;
			var templateId = $(evt.currentTarget).data("template-id");

			if(templateId){
				if(templateId == "T7"){
					if($(evt.currentTarget).closest(".single-row-template").find(".comment-box-row").length == 0){
						$(evt.currentTarget).closest(".single-row-template").append(thisPtr.displayOnlyCommentsInRow());
					}
					
				}
			}
		},

		getSmallCounter: function(text, itemId, categoryId, headCategoryId, obj){
			var thisPtr = this;
			var row = 	'<div class="row  no-margin-row  single-row-template">' +
							'<div class="col-md-3 col-md-offset-2" style="line-height: 2em;">' +
								text + 
							'</div>' + 
							'<div class="col-md-4">' +
								thisPtr.addCounterDiv(itemId, null, obj.size, categoryId, headCategoryId) + 
							'</div>' +
						'</div>';
			return row;				
		},

		getCostDiv: function(cost, itemId, categoryId, headCategoryId){
			// return  '<div class="col-md-3">'+
			// 			'<div class="form-group">'+
   //                          '<label class="col-md-6 control-label6 texalignright"> Cost ($): </label>'+
   //                          '<div class="col-md-6">'+
   //                              '<input name="item-cost" value="'+ (cost? cost: 0) +'" class="form-control update-rehab-cost" type="text" data-item-id="' + itemId + '" data-category-id="'+ categoryId +'" data-head-category-id="'+ headCategoryId +'">'+
   //                          '</div>'+
   //                      '</div>'+
			// 		'</div>';
			return '<div class="col-md-2 pull-right left-price">'+
						'<div class="input-group">'+
						  	'<span class="input-group-addon">$</span>'+
						  	'<input name="item-cost" type="text" value="'+ (cost? cost: 0) +'" class="form-control update-rehab-cost" aria-label="Amount (to the nearest dollar)" placeholder="Cost" data-item-id="' + itemId + '" data-category-id="'+ categoryId +'" data-head-category-id="'+ headCategoryId +'">'+
						'</div>'+
					'</div>';
		},

		createFlooringRow: function(templateId, itemId, roomName, roomData, categoryId, headCategoryId){
			var thisPtr = this;
			var divToAppendTo = "cat-item-div-"+itemId;
			var myRow;
			if(templateId == "T1"){
				myRow = '<div class="clearfix flooring-row-template cat-item-'+ itemId +'-body">' +
							'<div class="col-md-5">'+ 
								'<div class="item-action">' +
                                    '<label class="col-md-4 control-label6 texalignright marg_top10 font16">'+ roomName +'</label>' +
                                    '<div class="btn-group marg_left10" data-toggle="buttons">' +
                                        '<label class="btn btn-default item-toggle-action leftradius ' + ((roomData.action == "clean")? "active":"") + '" data-item-id="' + itemId + '" data-category-id="'+ categoryId +'" data-head-category-id="'+ headCategoryId +'">' +
                                        '<input class="toggle" name="action" id="style1" value="clean" type="radio"> Clean </label>' +
                                        '<label class="btn btn-default item-toggle-action rightradius ' + ((roomData.action == "replace")? "active":"") + '" data-item-id="' + itemId + '" data-category-id="'+ categoryId +'" data-head-category-id="'+ headCategoryId +'">' +
                                        '<input class="toggle" name="action" id="style2" value="replace" type="radio"> Replace </label>' +
                                    '</div>' +
                                '</div>' +
							'</div>' +
							thisPtr.getSizeDivWithLabel("col-md-4", roomData.size, "item-size", "Room Size", itemId, categoryId, headCategoryId) +
                            thisPtr.getCostDiv(roomData.cost, itemId, categoryId, headCategoryId) +
						'</div>';
			} else if(templateId == "T2"){
				myRow = '<div class="clearfix flooring-row-template cat-item-'+ itemId +'-body">' +
							'<div class="col-md-5">'+ 
								'<div class="item-action">' +
                                    '<label class="col-md-4 control-label6 texalignright marg_top10 font16">'+ roomName +'</label>' +
                                    '<div class="btn-group marg_left10" data-toggle="buttons">' +
                                        '<label class="btn btn-default item-toggle-action leftradius ' + ((roomData.action == "fix")? "active":"") + '" data-item-id="' + itemId + '" data-category-id="'+ categoryId +'" data-head-category-id="'+ headCategoryId +'">' +
                                        '<input class="toggle" name="action" id="style1" value="fix" type="radio"> Fix </label>' +
                                        '<label class="btn btn-default item-toggle-action rightradius ' + ((roomData.action == "replace")? "active":"") + '" data-item-id="' + itemId + '" data-category-id="'+ categoryId +'" data-head-category-id="'+ headCategoryId +'">' +
                                        '<input class="toggle" name="action" id="style2" value="replace" type="radio"> Replace </label>' +
                                    '</div>' +
                                '</div>' +
							'</div>' +
							thisPtr.getSizeDivWithLabel("col-md-4", roomData.size, "item-size", "Room Size", itemId, categoryId, headCategoryId) +
							thisPtr.getCostDiv(roomData.cost, itemId, categoryId, headCategoryId) +
						'</div>';
			}
			$("#"+divToAppendTo).append(myRow);
		},

		getSizeDiv: function(classes, value, name, itemId, categoryId, headCategoryId, placeholderText){
			return 	'<div class="'+ (classes? classes: "") +'">'+
                        '<input name="'+ (name? name: "") +'" value="'+ (value? value: "") +'" class="form-control text-field-size" type="text" data-item-id="'+ itemId +'" data-category-id="'+ categoryId +'" data-head-category-id="' + headCategoryId + '" placeholder="'+ (placeholderText? placeholderText: "Sq.ft.") +'">'+
                    '</div>';
		},

		getSizeDivWithLabel: function(classes, value, name, labelText, itemId, categoryId, headCategoryId, placeholderText){
			return 	'<div class="'+ (classes? classes: "") +'">'+
						'<div class="input-group">' +
  							'<span class="input-group-addon">' + (labelText? labelText: "Size") + '</span>' +
		                	'<input name="'+ (name? name: "") +'" value="'+ (value? value: "") +'" class="form-control text-field-size" type="text" data-item-id="'+ itemId +'" data-category-id="'+ categoryId +'" data-head-category-id="' + headCategoryId + '" placeholder="'+ (placeholderText? placeholderText: "Sq.ft.") +'">'+
                    	'</div>' +
                    '</div>';
		},

		removeLastRowFromDiv: function(fromDiv, rowClass){
			$(fromDiv+" "+rowClass+":last").remove();
		},

		createDummyDataT3: function(catId){
			var thisPtr = this;
			var propSize = app.propertyModel.toJSON().propertyDetails.totalSqft;
			var wallPaint = {};
			wallPaint.action = "repaint";
			wallPaint.size = 0;
			if(!thisPtr.editMode){
				wallPaint.size = propSize;
				wallPaint.cost = thisPtr.getPriceCatActSize(catId, wallPaint.action, wallPaint.size);
			}	
			return wallPaint;
		},

		createTemplateT3: function(categoryId, t3Data, itemId, headCategoryId){
			var thisPtr = this;
			var divToAppendTo = "category-div-"+categoryId+"-body";
			myRow = '<div class="col-md-4">'+ 
						'<div class="form-group item-action">' +
                            '<div class="btn-group marg_left10" data-toggle="buttons">' +
                                '<label class="btn btn-default item-toggle-action leftradius ' + ((t3Data.action == "touchup")? "active":"") + '" data-item-id="' + itemId + '" data-category-id="'+ categoryId +'" data-head-category-id="'+ headCategoryId +'">' +
                                '<input class="toggle" name="actionType" id="style1" value="touchup" type="radio"> Touch up </label>' +
                                '<label class="btn btn-default item-toggle-action rightradius ' + ((t3Data.action == "repaint")? "active":"") + '" data-item-id="' + itemId + '" data-category-id="'+ categoryId +'" data-head-category-id="'+ headCategoryId +'">' +
                                '<input class="toggle" name="actionType" id="style2" value="repaint" type="radio"> Re-paint </label>' +
                            '</div>' +
                        '</div>' +
					'</div>' +
					thisPtr.getSizeDivWithLabel("col-md-4", t3Data.size, "item-size", "Room Size", itemId, categoryId, headCategoryId) +
					'<div class="col-md-1">&nbsp;</div>'+
					thisPtr.getCostDiv(t3Data.cost, itemId, categoryId, headCategoryId) +
                    '</div>' ;	
			$("#"+divToAppendTo).append(myRow);
		},

		addBackAndNextButtons: function(currentHeadCategoryIndex){
			var thisPtr = this;
			var prevHeadCategoryIndex = currentHeadCategoryIndex - 1;
			var nextHeadCategoryIndex = currentHeadCategoryIndex + 1;
			var noOfHeadCategories = thisPtr.myStructure.length;

			var navigationButtonsRow = '<div class="row  no-margin-row back-next-bottom" style="padding-bottom:33px;">' + 
											'<div class="col-md-3">';

			if(thisPtr.myStructure[prevHeadCategoryIndex]){
				navigationButtonsRow = navigationButtonsRow + '<button class="btn bg-blue goto-head-category" data-head-cat-id="' + thisPtr.myStructure[prevHeadCategoryIndex].categoryId + '" data-head-category-id="'+ thisPtr.myStructure[currentHeadCategoryIndex].categoryId +'" style="width: 100%;"> Previous </button>';
			} else {
				navigationButtonsRow = navigationButtonsRow + '&nbsp;';
			}
			navigationButtonsRow = navigationButtonsRow + '</div>';


			navigationButtonsRow = navigationButtonsRow + '<div class="col-md-3" style="text-align: right;">';

			navigationButtonsRow = navigationButtonsRow + 	'<button style="width: 100%;" class="btn bg-default cancel-rehab-btn" style="margin-right: 50px;color: white;"> Cancel </button>';
			navigationButtonsRow = navigationButtonsRow + '</div>';



			navigationButtonsRow = navigationButtonsRow + '<div class="col-md-3">' +
															'<button  style="width: 100%;" class="btn btn-info goto-head-category"  data-head-cat-id="summary"  data-head-category-id="'+ thisPtr.myStructure[currentHeadCategoryIndex].categoryId +'"> Go to Summary </button>' +
														'</div>';	
		navigationButtonsRow = navigationButtonsRow + '<div class="col-md-3" style="text-align: right;">';
			
			if(thisPtr.myStructure[nextHeadCategoryIndex]){
				navigationButtonsRow = navigationButtonsRow + '<button style="width: 100%;" class="btn bg-blue  blue goto-head-category"  data-head-cat-id="' + thisPtr.myStructure[nextHeadCategoryIndex].categoryId + '" data-head-category-id="'+ thisPtr.myStructure[currentHeadCategoryIndex].categoryId +'"> Next </button>';
			} else {
				navigationButtonsRow = navigationButtonsRow + '<button style="width: 100%;" class="btn bg-default goto-head-category"  data-head-cat-id="summary"  data-head-category-id="'+ thisPtr.myStructure[currentHeadCategoryIndex].categoryId +'"> Next </button>';
			}
			navigationButtonsRow = navigationButtonsRow + '</div>';




			navigationButtonsRow = navigationButtonsRow + '</div>';

			$("#head-category-div-" + thisPtr.myStructure[currentHeadCategoryIndex].categoryId).append(navigationButtonsRow);
		},

		getSimpleTitleText: function(itemName){
			return '<div class="item-title-name margin-bottom-10 font16 col-md-12">'+ itemName + '</div>';
		},

		createTemplateT4: function(classes, itemId, categoryId, headCategoryId, obj, hideCost, addSizeField){
			var thisPtr = this;
			var t4Row = '<div class="margin-bottom-20 clearfix single-row-template">';
			
			if(addSizeField){
				t4Row = t4Row +	'<div class="' + (classes? classes: "") +'" style="line-height: 2em;">';
				t4Row = t4Row +		thisPtr.getRadioButtons([	{classes:"col-md-3", value:"likenew", label:"Like New"},
																{classes:"col-md-4", value:"acceptable", label:"Acceptable"},
																{classes:"col-md-2", value:"fix", label:"Fix"},
																{classes:"col-md-3", value:"replace", label:"Replace"}
															], obj.action, itemId, categoryId, headCategoryId);	
				t4Row = t4Row + '</div>';
				t4Row = t4Row +	thisPtr.getSizeDiv("col-md-2", obj.size, "item-size", itemId, categoryId, headCategoryId);
			} else{
				t4Row = t4Row +	'<div class="'+ classes +'" style="line-height: 2em;">';
				t4Row = t4Row +		thisPtr.getRadioButtons([	{classes:"col-md-3", value:"likenew", label:"Like New"},
																{classes:"col-md-3", value:"acceptable", label:"Acceptable"},
																{classes:"col-md-3", value:"fix", label:"Fix"},
																{classes:"col-md-3", value:"replace", label:"Replace"}
															], obj.action, itemId, categoryId, headCategoryId);	
				t4Row = t4Row + '</div>';
			}
			if(!hideCost){
				t4Row = t4Row +	thisPtr.getCostDiv(obj.cost, itemId, categoryId, headCategoryId);	
			}
			t4Row = t4Row + 
						'</div>';
			return t4Row;
		},

		getRadioButtons: function(arr, defaultOption, itemId, categoryId, headCategoryId, ignoreColumnSize){
			var radioRows = "";

			for(r=0; r<arr.length; r++){
				radioRows = radioRows + '<input id="radio-H'+ headCategoryId +'C'+ categoryId + (itemId? ('I'+ itemId): "") +'-'+ r +'" class="radio-custom radio-action" name="itemAction-'+ (itemId? itemId: categoryId) +'" type="radio" value="'+ arr[r].value +'" ' + (defaultOption == arr[r].value ? 'checked="checked"': "" ) + '   data-item-id="'+ itemId +'" data-category-id="'+ categoryId +'" data-head-category-id="' + headCategoryId + '">'+
                                     	'<label for="radio-H'+ headCategoryId +'C'+ categoryId + (itemId? ('I'+ itemId): "") +'-'+ r +'" class="radio-custom-label">'+ arr[r].label +'</label>';
                //radioRows = radioRows + "&nbsp;&nbsp;";                     	
			}

			return radioRows;
		},

		createDummyDataT4: function(){
			var obj = {};
			obj.action = "likenew";
			obj.cost = 0;
			obj.size = 0;
			return obj;
		},

		createTemplateT5: function(itemId, categoryId, headCategoryId, obj){
			var thisPtr = this;
			var t4Row = '<div class="row  no-margin-row ">';
			t4Row = t4Row +	'<div class="col-md-9">';
			t4Row = t4Row +		'<div class="form-group">'+
		                            '<label class="pull-left marg_right15 control-label6"> Cabinet to be replaced/Fixed Length: </label>'+
		                            thisPtr.getSizeDiv("pull-left col-md-3", obj.size, "item-size", itemId, categoryId, headCategoryId, "ft.") +
		                        '</div>';
			t4Row = t4Row + '</div>';
			t4Row = t4Row +	thisPtr.getCostDiv(obj.cost, itemId, categoryId, headCategoryId);
			t4Row = t4Row + 
						'</div>';
			return t4Row;
		},

		createDummyDataT5: function(){
			var obj = {};
			obj.size = 0;
			obj.cost = 0;
			return obj;
		},

		createTemplateT6: function(itemId, categoryId, headCategoryId, obj){
			var thisPtr = this;
			var t4Row = '<div class="row  no-margin-row ">';
			t4Row = t4Row +	'<div class="col-md-9" style="line-height: 2em;">';
			t4Row = t4Row +		thisPtr.getRadioButtons([	{classes:"col-md-3", value:"likenew", label:"Like New"},
															{classes:"col-md-3", value:"acceptable", label:"Acceptable"},
															{classes:"col-md-3", value:"fix", label:"Fix"},
															{classes:"col-md-3", value:"replace", label:"Replace"}
														], obj.action, itemId, categoryId, headCategoryId) +
								'<br>' +
								'<div class="row no-margin-row" id="itemCount-'+ itemId +'" style="' + ((thisPtr.editMode && (obj.action=="fix" || obj.action=="replace"))? "": "display:none;") + ' margin-top: 15px !important;">'+
									'<div class="col-md-5 marg_top5 font14" style="line-height: 2em;"> No. of items to be Replaced/Fixed: </div>' + 
									'<div class="col-md-4">' +
										thisPtr.addCounterDiv(itemId, null, obj.size, categoryId, headCategoryId) + /*thisPtr.simpleCounter(itemId, obj.count) +*/
									'</div>' +
								'</div>';
			t4Row = t4Row + '</div>';
			t4Row = t4Row + '<div class="col-md-1"> &nbsp; </div>';
			t4Row = t4Row +	thisPtr.getCostDiv(obj.cost, itemId, categoryId, headCategoryId);
			t4Row = t4Row + 
						'</div>';
			return t4Row;
		},

		createDummyDataT6 : function(){
			var obj = {};
			obj.action = "likenew";
			obj.count = 0;
			obj.cost = 0;
			return obj;
		},

		createTemplateT7: function(itemId, categoryId, headCategoryId, comments, cost){
			var thisPtr = this;
			var t4Row = '<div class="clearfix template-t7 margin-bottom-25">';
			t4Row = t4Row +	'<div class="col-md-8">';
			t4Row = t4Row +		'<div class="form-group">'+
	                                '<label class="pull-left control-label6"> Comment: </label>'+
	                                '<div class="col-md-10">'+
	                                    '<textarea name="item-comment" class="form-control" placeholder="Add a comment">'+ (comments? comments: "")+'</textarea>'+
	                                '</div>'+
	                            '</div>';
			t4Row = t4Row + '</div>';
			t4Row = t4Row + '<div class="col-md-1"> &nbsp; </div>';
			t4Row = t4Row +	thisPtr.getCostDiv(cost, itemId, categoryId, headCategoryId);
			t4Row = t4Row + 
						'</div>';
			return t4Row;
		},

		createTemplateT10: function(categoryId, headCategoryId, obj){
			var thisPtr = this;
			var divToAppendTo = "category-div-"+categoryId + "-body";
			myRow = '<div class="row  no-margin-row ">' +
						'<div class="col-md-9" style="line-height: 2em;">'+ 
							thisPtr.getRadioButtons([	{classes:"col-md-3", value:"likenew", label:"Like New"},
														{classes:"col-md-3", value:"acceptable", label:"Acceptable"},
														{classes:"col-md-2", value:"fix", label:"Fix"},
														{classes:"col-md-2", value:"replace", label:"Replace"},
														{classes:"col-md-2", value:"service", label:"Service"}
													], obj.action, null, categoryId, headCategoryId, true) +
						'</div>'+
						thisPtr.getCostDiv(obj.cost, null, categoryId, headCategoryId) +	
					'</div>'
			$("#"+divToAppendTo).append(myRow);
		},

		createTemplateT11: function(itemId, itemName, categoryId, headCategoryId, obj){
			var thisPtr = this;
			var itemRow = 	'<div class="row  no-margin-row  single-row-template">' +
								'<div class="col-md-2 marg_top5 pull-left item-title-name font16">' + itemName + '</div>' +
								'<div class="col-md-3 plusminusToggle">' + thisPtr.addCounterDiv(itemId, null, obj.size, categoryId, headCategoryId) + '</div>' +
								'<div class="col-md-1">&nbsp;</div>' +
								thisPtr.getCostDiv(obj.cost, null, categoryId, headCategoryId) +	
							'</div>';
			return itemRow; 
		},

		addMiscellaneousItems: function(categoryId, headCategoryId, obj){
			var thisPtr = this;
			var miscCnt;
			if(categoryId == 9){
				$("#category-div-"+categoryId+"-misc").append('<div class="row  no-margin-row " id="category-div-' + categoryId + '-misc-body"></div>');
				if(thisPtr.editMode && obj && obj.noOfMisc && (obj.noOfMisc > 0)){
					for(miscCnt=0; miscCnt<obj.misc.length; miscCnt++){
						$("#category-div-"+categoryId+"-misc-body").append(thisPtr.createMiscRow(categoryId, headCategoryId, obj.misc[miscCnt].comment, obj.misc[miscCnt].cost));
					}
					if(obj.noOfMisc == 1){
						$("#category-div-"+categoryId+"-misc-body").append(thisPtr.createMiscRow(categoryId, headCategoryId, "", 0));
					}
				} else {
					$("#category-div-"+categoryId+"-misc-body").append(thisPtr.createMiscRow(categoryId, headCategoryId, "", 0));
					$("#category-div-"+categoryId+"-misc-body").append(thisPtr.createMiscRow(categoryId, headCategoryId, "", 0));
				}
				$("#category-div-"+categoryId+"-misc").append(	'<div class="col-md-12  marg_top20" style="text-align: center;">'+
						'<div class=" pull-right alert alert-danger marg_left20" style="padding: 10px !important;" data-category-id="'+ categoryId +'" data-head-category-id="'+ headCategoryId +'" id="remove-miscellaneous-item"><i class="fa fa-minus-circle font-red-haze"></i> Remove Miscellaneous </div>' +
						'<div class=" pull-right alert alert-success " style="padding: 10px !important;" data-category-id="'+ categoryId +'" data-head-category-id="'+ headCategoryId +'" id="add-another-miscellaneous-item"><i class="fa fa-plus-circle font-green"></i> Add Miscellaneous </div>' +
																	
																'</div>');
				//$("#category-div-"+categoryId+"-misc").append('<div class="row  no-margin-row " style="text-align: center;"><div class="col-md-8 col-md-offset-2" style="background-color: #ccc; color: black; margin-top: 20px !important; margin-bottom: 10px !important; padding: 5px !important;" data-category-id="'+ categoryId +'" data-head-category-id="'+ headCategoryId +'" id="remove-miscellaneous-item"><i class="fa fa-minus-circle"></i> Remove Miscellaneous </div></div>');
			} else if(categoryId == 2){
				if(thisPtr.editMode && obj && (obj.matchingStyle == "no")){
					$("#category-div-"+categoryId+"-misc").append(thisPtr.getYesNoQuestion("Appliances are matching in style?", categoryId, headCategoryId, "Y", "no", null, "no"));
					$("#category-div-"+categoryId+"-misc").find(".single-row-template").append(thisPtr.displayOnlyCommentsInRow(obj.matchingStyleComment));
				} else {
					$("#category-div-"+categoryId+"-misc").append(thisPtr.getYesNoQuestion("Appliances are matching in style?", categoryId, headCategoryId, "Y", "yes", null, "no"));
				}
			} else if(categoryId == 40){
				if(thisPtr.editMode && obj && obj.questions){
					for(miscCnt=0; miscCnt<obj.questions.length; miscCnt++){
						if(obj.questions[miscCnt].question == "Does the subject property conform to the neighborhood?"){
							$("#category-div-"+categoryId+"-misc").append(thisPtr.getYesNoQuestion(obj.questions[miscCnt].question, categoryId, headCategoryId, "Y", obj.questions[miscCnt].option, obj.questions[miscCnt].comments, "no"));
						} else {
							$("#category-div-"+categoryId+"-misc").append(thisPtr.getYesNoQuestion(obj.questions[miscCnt].question, categoryId, headCategoryId, "Y", obj.questions[miscCnt].option, obj.questions[miscCnt].comments));
						}
						if(obj.questions[miscCnt].comments){
							$("#category-div-"+categoryId+"-misc").find(".single-row-template:last").append(thisPtr.displayOnlyCommentsInRow(obj.questions[miscCnt].comments));
						}
					}
				} else {
					$("#category-div-"+categoryId+"-misc").append(thisPtr.getYesNoQuestion("Are there any location issues?", categoryId, headCategoryId, "Y", "no", null));
					$("#category-div-"+categoryId+"-misc").append(thisPtr.getYesNoQuestion("Do you see rent signs in neighbourhood?", categoryId, headCategoryId, "Y", "no", null));
					$("#category-div-"+categoryId+"-misc").append(thisPtr.getYesNoQuestion("Does the subject property conform to the neighborhood?", categoryId, headCategoryId, "Y", "yes", null, "no"));
				}
			}
			
		},

		createMiscRow: function(categoryId, headCategoryId, comments, cost){
			var thisPtr = this;
			var row = '<div class="misc-complete-div">' +
						'<div class="row  no-margin-row " style="margin-top: 15px !important;"><div class="col-md-6 font16 semi-bold margin-bottom-15 miscellaneous-title"> Miscellaneous ' + (++thisPtr.miscCount) + '</div></div>';
			row = row + thisPtr.createTemplateT7(null, categoryId, headCategoryId, comments, cost);
			row = row + '</div>';
			return row;
		},

		addMiscRow: function(evt){
			var thisPtr = this;
			var categoryId = $(evt.currentTarget).data("category-id");
			var headCategoryId = $(evt.currentTarget).data("head-category-id");
			$("#category-div-"+categoryId+"-misc-body").append(thisPtr.createMiscRow(categoryId, headCategoryId, "", 0));
		},

		removeMiscRow: function(evt){
			var thisPtr = this;
			var categoryId = $(evt.currentTarget).data("category-id");
			var headCategoryId = $(evt.currentTarget).data("head-category-id");
			$("#category-div-"+ categoryId +"-misc-body").find(".misc-complete-div:last").remove();
			if(thisPtr.miscCount > 0){
				--thisPtr.miscCount;	
			}
			thisPtr.updateCatAndHeadCost(categoryId, headCategoryId);
		},

		getYesNoQuestion: function(text, categoryId, headCategoryId, openComments, option, comments, openCommentsOn){
			var thisPtr = this;
			var row = '<div class="row  no-margin-row  single-row-template item-action">' +
						'<div class="col-md-8 question-text font15">' + text + '</div>' +
						'<div class="col-md-4 text-right">' + 
							'<div class="form-group">' +
								'<div class="btn-group marg_left10" data-toggle="buttons">';
									if(!openCommentsOn){
										row = row + '<label class="yes-q-toggle-btn btn btn-default item-toggle-action leftradius ' + ((option == "yes")? "active":"") + '" data-head-category-id="'+ headCategoryId +'" data-category-id="'+ categoryId +'" '+ (openComments == "Y" ? 'data-template-id="T7"': "") +'>' +
				                                    '<input class="toggle" name="action" id="style1" value="yes" type="radio"> Yes </label>' +
				                                    '<label class="no-q-toggle-btn btn btn-default item-toggle-action rightradius ' + ((option == "no")? "active":"") + '" data-head-category-id="'+ headCategoryId +'" data-category-id="'+ categoryId +'"  '+ (openComments == "Y" ? 'data-template-id="T7"': "") +'>' +
				                                    '<input class="toggle" name="action" id="style2" value="no" type="radio"> No </label>';	
									} else {
										row = row + '<label class="no-q-toggle-btn btn btn-default item-toggle-action leftradius ' + ((option == "yes")? "active":"") + '" data-head-category-id="'+ headCategoryId +'" data-category-id="'+ categoryId +'" '+ (openComments == "Y" ? 'data-template-id="T7"': "") +'>' +
				                                    '<input class="toggle" name="action" id="style1" value="yes" type="radio"> Yes </label>' +
				                                    '<label class="yes-q-toggle-btn btn btn-default item-toggle-action rightradius ' + ((option == "no")? "active":"") + '" data-head-category-id="'+ headCategoryId +'" data-category-id="'+ categoryId +'"  '+ (openComments == "Y" ? 'data-template-id="T7"': "") +'>' +
				                                    '<input class="toggle" name="action" id="style2" value="no" type="radio"> No </label>';	
									}
                                    
            row = row +         '</div>' +
                            '</div>' +
						'</div>' +
					  '</div>';
			return row;
		},

		displayOnlyCommentsInRow: function(comments){
			var thisPtr = this;
			var row = '<div class="row  no-margin-row  comment-box-row" style="margin-bottom: 20px !important;">' +
						'<div class="form-group col-md-8">'+
                            '<label class="pull-left control-label6"> Comment: </label>'+
                            '<div class="col-md-10">'+
                                '<textarea name="item-comment" class="form-control" placeholder="Enter comment">'+ (comments? comments:"") + '</textarea>' +
                            '</div>'+
                        '</div>' +
                      '</div>';
            return row;
		},

		checkForRehabNotRequiredFlag: function(evt){
			var thisPtr = this;
			var k;
			var categoryId = $(evt.currentTarget).data("category-id");
			var headCategoryId = $(evt.currentTarget).data("head-category-id");
			if($(evt.currentTarget).prop("checked")){
				$("#category-div-"+categoryId+"-body").css("pointer-events","none");
				//make all values as 0 under this category and recalculate total for headcategory
				var arr = $("#category-div-"+categoryId+"-body").find("[name=item-size]");
				for(k=0; k<arr.length; k++){
					$(arr[k]).val("");
				}
				arr = $("#category-div-"+categoryId+"-body").find("[name=item-cost]");
				for(k=0; k<arr.length; k++){
					$(arr[k]).val("");
				}
				arr = $("#category-div-"+categoryId+"-body").find("[name=item-comment]");
				for(k=0; k<arr.length; k++){
					$(arr[k]).val("");
				}
				arr = $("#category-div-"+ categoryId +"-body").find(".radio-action")
				for(k=0; k<arr.length; k++){
					if($(arr[k]).val() == "likenew"){
						$(arr[k]).prop("checked","checked")
					}
				}
				if(categoryId == 14 || categoryId == 1){
					for(k=0; k<thisPtr.headArray[headCategoryId][categoryId].length; k++){
						var itemId = thisPtr.headArray[headCategoryId][categoryId][k];
						$("#cat-item-"+itemId+"-counter").val("0");
					}
				}


				thisPtr.updateCatAndHeadCost(categoryId, headCategoryId);
				$("#category-div-"+categoryId+"-body").addClass("disable-rehab-category");
				$("#category-div-"+categoryId+"-misc").addClass("disable-rehab-category");
				$("#rehab-not-required-text-"+categoryId).show();
			} else {
				$("#category-div-"+categoryId+"-body").css("pointer-events","");
				$("#category-div-"+categoryId+"-body").removeClass("disable-rehab-category");
				$("#category-div-"+categoryId+"-misc").removeClass("disable-rehab-category");
				$("#rehab-not-required-text-"+categoryId).hide();
			}

		},

		showNextHeadCategory: function(evt){
			var thisPtr = this;
			var headCategoryId = $(evt.currentTarget).data("head-category-id");
			var headCategoryIdToDisplay = $(evt.currentTarget).data("head-cat-id");

			var newPostData = thisPtr.getPostData(headCategoryId);
			
			thisPtr.saveHeadCategoryData(newPostData, headCategoryIdToDisplay, headCategoryId);

			if((headCategoryIdToDisplay + "").toUpperCase() == "SUMMARY")
            {
				thisPtr.showSecondLastrehabSummary();
				return;
            }
			
		},

		getPostData: function(headCategoryId){
			var thisPtr = this;

			var postData = [];

			//create head category save object
			var headObj = thisPtr.getPostDataStructure();
			headObj.categoryId = headCategoryId;
			headObj.rehabCost = thisPtr.getCost(parseFloat($("#sidebar-head-cat-val-"+headCategoryId).text().replace("$", "").replace(",","")));
			headObj.formStructureId = thisPtr.formStructureObj["H"+headCategoryId];
			headObj.displayLevel = thisPtr.formLevelObj["H"+headCategoryId];

			postData.push(headObj);  //saving head category object

			_.each(_.keys(thisPtr.headArray[headCategoryId]), function(categoryId){
				console.log("categoryid=" + categoryId);

				//create category object for saving
				var catObj = thisPtr.getPostDataStructure();
				catObj.categoryId = categoryId;
				catObj.rehabCost = thisPtr.getCost(parseFloat($('#category-div-' + categoryId + '-cost').text().replace("$", "").replace(",","")));
				catObj.formStructureId = thisPtr.formStructureObj["H"+headCategoryId+"-C"+categoryId];
				catObj.displayLevel = thisPtr.formLevelObj["H"+headCategoryId+"-C"+categoryId];

				if($('#category-div-' + categoryId + '-rehab').length){
					if($('#category-div-' + categoryId + '-rehab').prop("checked")){
						catObj.data.rehabNotRequired = "Y";		
					} else {
						catObj.data.rehabNotRequired = "N";
					}
				}

				if(thisPtr.headArray[headCategoryId][categoryId].length > 0){
					for(i=0; i<thisPtr.headArray[headCategoryId][categoryId].length; i++){
						var itemId = thisPtr.headArray[headCategoryId][categoryId][i];
						console.log("itemid=" + itemId);

						//create item object for saving
						var itemObj = thisPtr.getPostDataStructure();
						itemObj.categoryId = itemId;
						itemObj.formStructureId = thisPtr.formStructureObj["H"+headCategoryId+"-C"+categoryId+"-I"+itemId];
						itemObj.displayLevel = thisPtr.formLevelObj["H"+headCategoryId+"-C"+categoryId+"-I"+itemId];

						if(categoryId == 6){
							var a = $("#cat-item-div-" + itemId + " .update-rehab-cost");

							//var itemCost = 0;
							itemObj.rehabCost = 0;

							var jsonObj = {};
							jsonObj.noOfRooms = 0;
							jsonObj.rooms = [];

							var b = $(".cat-item-"+ itemId +"-body");
							for(j=0; j<b.length; j++){
								//console.log($(b[i]).find(".active").find("input").val());
  								var roomObj = {};
  								roomObj.action = $(b[j]).find(".active").find("input").val();
  								roomObj.size = $(b[j]).find("[name=item-size]").val();
  								roomObj.cost = thisPtr.getCost(parseFloat($(b[j]).find("[name=item-cost]").val().replace("$","").replace(",","")));
  								if(roomObj.cost > 0){
  									jsonObj.rooms.push(roomObj);
  									jsonObj.noOfRooms = jsonObj.noOfRooms + 1;
  									itemObj.rehabCost = itemObj.rehabCost + roomObj.cost;
  								}
  							}

  							//itemObj.rehabCost = itemCost;
  							itemObj.data = jsonObj;
						} else if(itemId == 12 || itemId == 34 || itemId == 3 || itemId == 36){
							itemObj.data.action = $("[name=itemAction-"+ itemId +"]:checked").val();
							itemObj.data.cost = thisPtr.getCost($("#cat-item-div-"+itemId).find("[name=item-cost]").val().replace("$","").replace(",",""));
							if(itemId == 12){
								itemObj.data.size = $("#cat-item-div-"+itemId).find("[name=item-size]").val();
							}
							itemObj.rehabCost = itemObj.data.cost;
						} else if(itemId == 13){
							itemObj.data.size = $("#cat-item-div-" + itemId).find("[name=item-size]").val();
							itemObj.data.cost = thisPtr.getCost($("#cat-item-div-"+itemId).find("[name=item-cost]").val().replace("$","").replace(",",""));
							itemObj.rehabCost = itemObj.data.cost;
						} else if(itemId == 15 || itemId == 16){
							itemObj.data.size = $('#cat-item-'+ itemId +'-counter').val();
							itemObj.data.cost = thisPtr.getCost($("#cat-item-div-"+itemId).find("[name=item-cost]").val().replace("$","").replace(",",""));
							itemObj.data.action = $("[name=itemAction-"+ itemId +"]:checked").val();
							itemObj.rehabCost = itemObj.data.cost;
						} else if(itemId == 17 || itemId == 29){
							//template T7
							itemObj.comments = $("#cat-item-div-"+itemId).find("[name=item-comment]").val();
							itemObj.rehabCost = thisPtr.getCost($("#cat-item-div-"+itemId).find("[name=item-cost]").val().replace("$","").replace(",",""));
						} else if(categoryId == 2 || itemId == 37 || itemId == 38){
							itemObj.data.option = $("#cat-item-div-"+itemId).find(".active").find("input").val();
							itemObj.rehabCost = thisPtr.getCost($("#cat-item-div-"+itemId).find("[name=item-cost]").val().replace("$","").replace(",",""));
							itemObj.data.cost = itemObj.rehabCost;
							if(itemObj.data.option == "present"){
								itemObj.data.action = $("[name=itemAction-"+ itemId +"]:checked").val();
							}
						} else if(itemId == 27 || itemId == 28){
							itemObj.data.size = $('#cat-item-'+ itemId +'-counter').val();
							itemObj.rehabCost = thisPtr.getCost($("#cat-item-div-"+itemId).find("[name=item-cost]").val().replace("$","").replace(",",""));
							itemObj.data.cost = itemObj.rehabCost;
						} else if(itemId == 39){
							itemObj.data.option = $("#cat-item-div-"+itemId).find(".active").find("input").val();
							itemObj.rehabCost = thisPtr.getCost($("#cat-item-div-"+itemId).find("[name=item-cost]").val().replace("$","").replace(",",""));
							itemObj.data.size = $('#cat-item-'+ itemId +'-counter').val(); 
							itemObj.data.cost = itemObj.rehabCost;
						}

						postData.push(itemObj);

					}	
				} else {
					console.log("categoryLevelTemplate=" + categoryId);
					//get template level data and add to JSONDATA
					if(categoryId == 10){
						catObj.data.action = $("#category-div-" + categoryId + "-body").find(".active").find("input").val();
						catObj.data.size = $("#category-div-" + categoryId + "-body").find("[name=item-size]").val();
						catObj.data.cost = thisPtr.getCost($("#category-div-" + categoryId + "-body").find("[name=item-cost]").val().replace("$","").replace(",",""));
						catObj.rehabCost = catObj.data.cost;
					} else if(categoryId == 20){
						catObj.data.action = $("[name=itemAction-"+ categoryId +"]:checked").val();
						catObj.data.cost = thisPtr.getCost($("#category-div-" + categoryId + "-body").find("[name=item-cost]").val().replace("$","").replace(",",""));
						catObj.rehabCost = catObj.data.cost;
					} else if(categoryId == 32 || categoryId == 33){
						catObj.comments = $("#category-div-"+categoryId+"-body").find("[name=item-comment]").val();
						catObj.rehabCost = thisPtr.getCost($("#category-div-"+categoryId+"-body").find("[name=item-cost]").val().replace("$","").replace(",",""));
					} else if(categoryId == 40){
						var e = $("#category-div-"+ categoryId +"-misc").find(".single-row-template");
						var qs = [];
						for(k=0; k<e.length; k++){
							var o = {};
							o.question = $(e[k]).find(".question-text").text();
							o.option = $(e[k]).find(".active").find("input").val();
							//if(o.option == "yes"){
							o.comments = $(e[k]).find("[name=item-comment]").val();
							// } else {
							// 	o.comments = null;
							// }
							qs.push(o);
						}
						catObj.data.questions = qs;
					}

				}

				//handle questions in categories
				if(categoryId == 2){
					catObj.data.matchingStyle = $("#category-div-"+ categoryId +"-misc").find(".active").find("input").val();
					catObj.data.matchingStyleComment = $("#category-div-"+ categoryId +"-misc").find("[name=item-comment]").val();
				} else if(categoryId == 9){
					catObj.data.noOfMisc = 0;
					catObj.data.misc = [];
					var y = $("#category-div-"+ categoryId +"-misc-body .template-t7");
					for(z=0; z<y.length; z++){
						var temp = {};
						temp.comment = $(y[z]).find("[name=item-comment]").val();
						temp.cost = thisPtr.getCost($(y[z]).find("[name=item-cost]").val().replace("$","").replace(",",""));
						if(temp.cost > 0 || categoryId == 9){
							catObj.data.noOfMisc = catObj.data.noOfMisc + 1;
							catObj.data.misc.push(temp);	
						}
					}
				}

				postData.push(catObj);				

			});

			return postData;
		},

		showSubmitError: function(){
			var thisPtr = this;
			$("#categorySubmitError").show();
		    App.scrollTo($("#categorySubmitError"), -200);
		},

		getCost: function(cost){
			return parseFloat(cost)? parseFloat(cost): 0;
		},

		saveHeadCategoryData: function(data, headCategoryIdToDisplay, headCategoryId){
			var thisPtr = this;
			var finalData = {};
			finalData.categories = data;
			finalData.propertyId = thisPtr.propertyId;
			finalData.inspectionType = "Rehab Estimator";
			
			$.ajax({
                url: 'rehabEstimator/saveRehabEstmByCategoryId',
				dataType:'json',
				contentType: 'application/json',
				data: JSON.stringify(finalData),
                type: 'POST',
                async:false,
                success: function(res){
                	//setTimeout(function(){$('.modal-backdrop').remove()},500)
		            //$('.modal-backdrop').fadeOut(400);
		                	
                	if(res.statusCode == "200") {
                		if(headCategoryIdToDisplay == "exit"){
                			location.reload();
                		} else {
                			thisPtr.showHeadDivById(headCategoryIdToDisplay);
                		}
                    } else {
                		thisPtr.showCategorySaveError(headCategoryId);
                	}
                },
                error: function(res){
                	//setTimeout(function(){$('.modal-backdrop').remove()},500)
		            //$('.modal-backdrop').fadeOut(400);
                	thisPtr.showCategorySaveError(headCategoryId);
                }
            });
			
		},

		showCategorySaveError: function(headCategoryId){
			var thisPtr = this;
			$("#categorySaveError").show();
		    App.scrollTo($("#categorySaveError"), -200);
		},

		getPostDataStructure: function(){
			return {"categoryId":null, "rehabCost": 0, "comments":null, "formStructureId": null, "data": {}, "displayLevel": null};
		},

		showSecondLastrehabSummary: function(){
			$("#rehab-estimate-form").hide();
			$(".rehab-sidebar").attr("style","display: none !important;");
			$(".page-content1").hide();
			$("#rehab-estimate-form-summary").show();
			var thisPtr = this;
			thisPtr.createSecondLastrehabSummary(thisPtr.propertyDetails, thisPtr.myStructure);
		},

		createSecondLastrehabSummary : function(obj , obj1){
			$("#summary-dtls-section").html('');
			var thisPtr = this;
			var rehabSum = '<div class = "row no-margin-row">';
            var tCost = 0;
            rehabSum += '<div class = "col-md-4" > <img style="margin-bottom:12px;" src="' + obj.propertyImg + '" class="pull-left marg_right35 img-responsive" style = "float:none"></div>';
            rehabSum += '<div class = "col-md-8" ><div><span>' + obj.propertyaddress + '</span></div>';
            rehabSum += '<div><span>' + obj.propertyOtherInfo + '  Built ' + obj.propertyYearBuilt + '</span></div>';
            rehabSum += '<div><span> NIR Rating : ' + (obj.propertyNIR ? obj.propertyNIR : "") + '</span></div></div>';
            rehabSum += '</div><hr>';
            var initRehab = parseInt((app.propertyDetailView.rehabEstTabView.initialRehab!=null && app.propertyDetailView.rehabEstTabView.initialRehab!= "null") ? app.propertyDetailView.rehabEstTabView.initialRehab : 0);
            rehabSum += '<div class="row no-margin-row"><span  class = "col-md-6" style = "text-align : left; margin-bottom: 15px !important;"> Initial Estimated Rehab : </span><span class = "col-md-6 rehab_amt" style = "text-align : right"> ' + initRehab + '</span></div>';
            rehabSum += '<div class="row no-margin-row"> <table class="table" style="border: 1px solid;border-color: #AFB0B0;"> <tbody>';
            for(var i = 0; i < obj1.length  ; i++){
                var headId = obj1[i].categoryId;
                var lcost = parseFloat($("#sidebar-head-cat-val-"+headId).text().replace("$","").replace(",",""));
                tCost += lcost;
                rehabSum  += '<tr><td><a data-head-category-id="' + headId + '" style="cursor: pointer;">';
               	rehabSum  += $("#sidebar-head-cat-"+headId).text();
                
                rehabSum += '</a></td><td class = "rehab_amt" style="text-align: right;">  ' + (lcost ? lcost : "0") + '</td></tr>';
            }
            var huOSFee = parseFloat($("#huOversightFee").text().replace("$","").replace(",",""));
            tCost = tCost + (huOSFee? huOSFee: 0);
            rehabSum += '<tr><td>HU Oversight Fee</td><td class = "rehab_amt" style="text-align: right;">' + (huOSFee ? huOSFee : "0") + '</td></tr>';
            rehabSum += '<tr style = "background-color : #3a4656;color : #FFFFFF"><td>TOTAL</td><td class = "rehab_amt" style="text-align: right;">' + (tCost ? tCost : "0") + '</td></tr>';
            rehabSum += '</tbody></table></div>';
            rehabSum += '<div class = "row no-margin-row"> <div class = "col-md-4"></div> <button id = "btnSubmitToNextSummary" class = "col-md-4 btn bg-blue marg_top20"> Submit </button><div class = "col-md-4"></div>';
            this.finalRehabAmount = (tCost ? tCost : "0");
            $("#summary-dtls-section").append(rehabSum);
            for(var i = 0; i < obj1.length  ; i++){
            	var divId = obj1[i].categoryId;
            	function assignVal()
            	{
            		$('a[data-head-category-id = ' + divId + ']').click(function(){ 
            			var divId = $(this).attr('data-head-category-id');
            			thisPtr.navigateTo(divId)});
            	}
            	assignVal();
            }

            $('.rehab_amt').formatCurrency({roundToDecimalPlace:2});
            $('.page-content').attr("style", "padding-top: 0; padding-left: 0px; padding-right: 0px; margin-left: 0px !important;");
            setTimeout(function () {
               $('.page-content').attr("style", "padding-top: 0; padding-left: 0px; padding-right: 0px; margin-left: 0px !important;");
            }, 150);
	     	$("#sideNavigation").css("display", "none");
	     	// $(".header.navbar.navbar-fixed-top").css("display", "none");
	     	$(".footer").css("display", "none");
		},
		navigateTo : function(divId)
		{
			$("#rehab-estimate-form-summary").hide();
			$("#categorySubmitError").hide();
			$("#rehab-estimate-form").show();
			$(".rehab-sidebar").attr("style","display: block;");
			$(".page-content1").show();
			this.showHeadDivById(divId);
		},

		submitandShowCompleteTab : function(){
			var thisPtr = this;
			var postData = {};
			postData.propertyId = thisPtr.propertyId;
			postData.inspectionType = "Rehab Estimator";
			postData.totalRehabCost = thisPtr.finalRehabAmount;
			$.ajax({
				  type: 'POST',
				  url: 'rehabEstimator/submitRehabEstimatorDetails',
				  data: JSON.stringify(postData),
				  dataType:'json',
				  contentType: 'application/json',
				  async:false,
				  success: function(res){
					  console.log("success : " + JSON.stringify(res));
					  thisPtr.showRehabTabInProperty(true);
					  location.reload();
				  },
				  error: function(res){
					  console.log("error : " + JSON.stringify(res));
					  thisPtr.showSubmitError();
				  }
				});
		},

		getPriceCatActSize : function(catId , action , size){
			var obj = this.pricingModel;
			var toReturn = null;
			var action = action.toUpperCase();
			for(var i=0;i<obj.length;i++)
			{
				if(catId == obj[i].categoryId)
				{
					if(action == obj[i].options.toUpperCase())
					{
						if(($.inArray(obj[i].units.toUpperCase(), ["SY", "SF", "LF"]) != -1) || ($.inArray(catId, [15,16,27,28,39]) != -1)){
							toReturn = size * obj[i].price;
							break;
						} else {
							toReturn = obj[i].price;
							break;
						}
					}
				}
			}
			if(!toReturn){
				return "";
			} else {
				return toReturn;	
			}
		},

		navigateToRehabComplete : function(){
			
		},

		calculateWithSize: function(evt){
			var thisPtr = this;
			var elem = $(evt.currentTarget);
			var itemId = $(elem).data("item-id");
			var categoryId = $(elem).data("category-id");
			var headCategoryId = $(elem).data("head-category-id");
			if(categoryId == 6){
				var row = $(evt.currentTarget).closest(".cat-item-"+ itemId +"-body");
				var action = $(row).find(".active").find("input").val();
				var size = $(elem).val();
				var calcCost = thisPtr.getPriceCatActSize(itemId, action, size);
				$(row).find("[name=item-cost]").val(calcCost);
			} else if(itemId){
				var row = $(evt.currentTarget).closest("#cat-item-div-"+itemId);
				var action = $(row).find(".active").find("input").val();
				if(itemId == 12){
					action = $(row).find("[name=itemAction-"+ itemId +"]:checked").val();
				}
				var size = $(elem).val();
				if(itemId == 13){
					action = "replace";
				}
				var calcCost = thisPtr.getPriceCatActSize(itemId, action, size);
				$(row).find("[name=item-cost]").val(calcCost);
			} else {
				var row = $(evt.currentTarget).closest("#category-div-"+ categoryId +"-body");
				var action = $(row).find(".active").find("input").val();
				var size = $(elem).val();
				var calcCost = thisPtr.getPriceCatActSize(categoryId, action, size);
				$(row).find("[name=item-cost]").val(calcCost);
			}
			thisPtr.updateCatAndHeadCost(categoryId, headCategoryId);
		},

		updateCatAndHeadCost: function(categoryId, headCategoryId){
			var thisPtr = this;
			thisPtr.updateCategoryCost(categoryId);
			thisPtr.updateHeadCategoryCost(headCategoryId);
			thisPtr.updateTotalCost();	
		},

		calculateWithAction: function(evt){
			var thisPtr = this;
			var elem = $(evt.currentTarget);
			var itemId = $(elem).data("item-id");
			var categoryId = $(elem).data("category-id");
			var headCategoryId = $(elem).data("head-category-id");
			if(itemId){
				var row = $("#cat-item-div-"+itemId);
				var action = $(row).find("[name=itemAction-"+ itemId +"]:checked").val();
				if(action == "likenew" || action == "acceptable"){
					thisPtr.resetSizeAndCost($("#cat-item-"+ itemId +"-counter"), $(row).find("[name=item-cost]"), categoryId, headCategoryId);
				}
				var size = $("#cat-item-"+ itemId +"-counter").val();
				if(itemId == 12){
					size = $(row).find("[name=item-size]").val();
				}
				var option = $(row).find(".active").find("input").val();
				size = size? size: 0;
				if(option == "absent"){
					action = "absent";
				}
				var calcCost = thisPtr.getPriceCatActSize(itemId, action, size);
				$(row).find("[name=item-cost]").val(calcCost);
				if(itemId == 15 || itemId == 16){
					if(action == "fix" || action=="replace"){
						$("#itemCount-"+itemId).css("display", "block");
					} else {
						$("#itemCount-"+itemId).css("display", "none");
					}
				}
			} else{
				var row = $(evt.currentTarget).closest("#category-div-"+ categoryId +"-body");
				var action = $(row).find("[name=itemAction-"+ categoryId +"]:checked").val();
				var size = $("#cat-item-"+ categoryId +"-counter").val();
				size = size? size: 0;
				var calcCost = thisPtr.getPriceCatActSize(categoryId, action, size);
				$(row).find("[name=item-cost]").val(calcCost);
			}
			thisPtr.updateCatAndHeadCost(categoryId, headCategoryId);
		},

		resetSizeAndCost: function(sizeElem, costElem, categoryId, headCategoryId){
			var thisPtr = this;
			$(sizeElem).val("0");
			$(costElem).val("0");
			thisPtr.updateCatAndHeadCost(categoryId, headCategoryId);
		},

		calculateWithCounter: function(evt){
			var thisPtr = this;
			var elem = $(evt.currentTarget);
			var itemId = $(elem).data("item-id");
			var categoryId = $(elem).data("category-id");
			var headCategoryId = $(elem).data("head-category-id");
			
			if($.inArray(itemId, [15,16,27,28,39]) != -1){
				var row = $("#cat-item-div-"+itemId);
				var size = $("#cat-item-"+ itemId +"-counter").val();
				size = size? size: 0;
				var action = $(row).find("[name=itemAction-"+ itemId +"]:checked").val();
				if(itemId == 27 || itemId == 28 || itemId == 39){
					action = "replace";
				}
				var calcCost = thisPtr.getPriceCatActSize(itemId, action, size);
				$(row).find("[name=item-cost]").val(calcCost);

			}
			
			thisPtr.updateCatAndHeadCost(categoryId, headCategoryId);
		},

		calculateWithToggle: function(evt){
			var thisPtr = this;
			var elem = $(evt.currentTarget);
			var itemId = $(elem).data("item-id");
			var categoryId = $(elem).data("category-id");
			var headCategoryId = $(elem).data("head-category-id");
			
			if(categoryId == 6){
				var row = $(elem).closest(".cat-item-"+ itemId +"-body");
				var action = $(elem).find("input").val()
				var size = $(row).find("[name=item-size]").val();
				size = size? size: 0;
				var calcCost = thisPtr.getPriceCatActSize(itemId, action, size);
				$(row).find("[name=item-cost]").val(calcCost);
			} else if(categoryId == 10){
				var row = $(elem).closest("#category-div-"+ categoryId +"-body");
				var action = $(elem).find("input").val()
				var size = $(row).find("[name=item-size]").val();
				size = size? size: 0;
				var calcCost = thisPtr.getPriceCatActSize(categoryId, action, size);
				$(row).find("[name=item-cost]").val(calcCost);
			} else if(categoryId == 2){
				var row = $("#cat-item-div-"+itemId);
				var option = $(elem).find("input").val();
				var action;
				if(option == "present"){
					action = $(row).find("[name=itemAction-"+ itemId +"]:checked").val();
				} else{
					action = "absent";
				}
				var size = $("#cat-item-"+ itemId +"-counter").val();
				size = size? size: 0;
				var calcCost = thisPtr.getPriceCatActSize(itemId, action, size);
				$(row).find("[name=item-cost]").val(calcCost);
			} else if(categoryId == 9){
				var row = $("#cat-item-div-"+itemId);
				var action = $(elem).find("input").val();
				var size = $("#cat-item-"+ itemId +"-counter").val();
				size = size? size: 0;
				var calcCost = thisPtr.getPriceCatActSize(itemId, action, size);
				$(row).find("[name=item-cost]").val(calcCost);
			}
			thisPtr.updateCatAndHeadCost(categoryId, headCategoryId);
		},

		showRehabTabInProperty: function(gotoRehabTab){
			var thisPtr = this;
			if(gotoRehabTab){
				localStorage.setItem("showRehab" + app.propertyModel.toJSON().propertyId, 1);
			}
		}


	});
	
	return RehabEstimatorView;

});