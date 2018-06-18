define(["backbone","app","text!templates/rehabEstimatorTab.html","views/rehabEstimatorView"],
	function(Backbone,app,rehabEstTabPage, rehabEstimatorView){
	
	var RehabEstimatorTabView = Backbone.View.extend({
		initialize: function(options){
			var thisPtr=this;
		},
		events:{
			"click #startRehabEstimationBtn":"showRehabEstimation",
			"click #edit-rehab-estimate":"editRehabEstimation"
		},
		el:"#rehabEstimatorTab",
		keyValPairObj : {
			"room" : "Room",
			"replace" : "Replace",
			"clean" : "Clean",
			"fix" : "Fix",
			"touchup" : "Touch up", 
			"repaint" : "Repaint",
			"likenew" : "Like New",
			"acceptable" : "Acceptable",
			"present" : "Present",
			"absent" : "Absent",
			"yes" : "Yes",
			"no" : "No",
			"service" : "Service"
			
		},
		propertyId: null,
		huSelect: null,
		initialRehab : null,
		initEstimate : null,
		totalRehabEstimate : null,
		pricelogicDetails: null,
		createdByUserName: null,
		lastEditedDate: null,
		render:function () {
			var thisPtr=this;
			this.template = _.template( rehabEstTabPage );
	     	this.$el.html("");
	     	this.initRehabCall();
	     	this.$el.html(this.template({initialRehab : thisPtr.initialRehab , prevRehab : thisPtr.initEstimate , RehabStatus : thisPtr.inspectionStatus , RehabEditUserName : thisPtr.createdByUserName , RehabEditdnt : thisPtr.lastEditedDate}));
	     	thisPtr.checkForPermission();
	     	if(thisPtr.initEstimate)
	     		thisPtr.addItemizedRehab(thisPtr.initEstimate);
	     	$('.amount_1').formatCurrency({roundToDecimalPlace:2});
		},
		initRehabCall:function(){
			var thisPtr = this;
			$.ajax({
				url: app.context()+ '/rehabEstimator/fetchAllRehabEstimatDetails?propertyId='+ app.propertyModel.toJSON().propertyId + '&&inspectionType=Rehab Estimator&&startRehab=N',
				type: 'GET',
				async: false,
				success: function(res){
					thisPtr.initialRehab = res.initialRehabAmount;
					thisPtr.initEstimate = res.headCategoryResponse;
					thisPtr.totalRehabEstimate = res.totalInspectionRehabCost;
					thisPtr.pricelogicDetails = res.pricelogicDetails;
					thisPtr.inspectionStatus = res.inspectionStatus;
					thisPtr.eligibleUsers = res.hilUserIds;
					thisPtr.editUserId = res.createdByUser;
					thisPtr.createdByUserName = res.createdByUserName;
					thisPtr.lastEditedDate = res.lastEditedDate;
				},
				error: function(res){
					console.log("Error Case:::" + res);
				}
			});
		},
		checkForPermission: function(){
			var thisPtr = this;
			if($.inArray("PropertyRehabEdit",app.sessionModel.attributes.permissions) != -1){
				if(thisPtr.initEstimate){
					if(thisPtr.checkEligibilityforEditRehab()){
						$(".rehab-with-permission").css("display","inline");
					}
					else{
						$(".rehab-with-permission").css("display","none");
					}
				}
				else{
					if(thisPtr.checkEligibilityforInitRehab()){
						$(".rehab-with-permission").css("display","block");
					}
					else{
						$(".rehab-with-permission").css("display","none");
					}
				} 
			}
			else{
					$(".rehab-with-permission").css("display","none");
			}
		},
		showRehabEstimation: function(){
			var thisPtr=this;
			$(".page-container").addClass("page-sidebar-closed");
			if(!app.propertyDetailView.rehabEstTabView.rehabEstimatorView){
				app.propertyDetailView.rehabEstTabView.rehabEstimatorView=new rehabEstimatorView();
			}
			app.propertyDetailView.rehabEstTabView.rehabEstimatorView.propertyId = thisPtr.propertyId;
			app.propertyDetailView.rehabEstTabView.rehabEstimatorView.huSelect = thisPtr.huSelect;
			app.propertyDetailView.rehabEstTabView.rehabEstimatorView.setElement($('.page-content')).render();
		},
		checkPropertyAdmin: function(){
			var isAdmin=app.sessionModel.attributes.roles.indexOf("Property Admin");
			if(isAdmin!=-1)
				return true;
			return false;
		},
		checkEligibilityforInitRehab: function(){
			return true;
			// uncomment following lines if HIL based rehab estimator to be checked
			// var thisPtr = this;
			// var userId = app.sessionModel.attributes.userId;
			// if($.inArray(userId,thisPtr.eligibleUsers) != -1 || thisPtr.checkPropertyAdmin())
			// 	return true;
			// return false;
		},
		checkEligibilityforEditRehab: function(){
			var thisPtr = this;
			var userId = app.sessionModel.attributes.userId;
			if(thisPtr.editUserId == userId)
				return true;
			return false;
		},
		getFormattedKey : function(input){
			if(input != null)
				return (this.keyValPairObj[input] ? this.keyValPairObj[input] : input);
			return "";
		},
		addItemizedRehab : function(catData){
			var thisPtr = this;
			for(var i = 0 ; i < catData.length ; i++) 
			{
				var id = catData[i].categoryId;
				var headCatPanel =  '<div class="panel panel-default clearfix" id = "panel-headCat-' + id + '">';
				var headCatPanelHeading = '<div class="panel-heading clearfix" style="border:1px solid #ddd; font-size:14px;" id = "panel-headCat-heading-' + id + '" data-toggle="collapse" data-parent="#populate-Categories" href="#collapse' + id + '">';
				headCatPanelHeading += '<div class = "col-md-6 row" style = "text-align : left;color : #fff;" id = "panel-headCat-title-' + id + '"><i class="fa fa-plus-circle marg_right5" style = "color: rgb(130, 141, 155);vertical-align:-1px;"></i><a style = "color : rgb(130, 141, 155);">' + catData[i].categoryName + '</a></div>';
				headCatPanelHeading += '<div class = "col-md-6 amount_1 row pull-right" style = "text-align : right; color: rgb(130, 141, 155);"id = "panel-headCat-title-val-' + id + '">  ' + (catData[i].rehabCost ? catData[i].rehabCost : "00") + '</div>';
				headCatPanelHeading += '</div>';
				var headCollapsePanel = '<div id="collapse' + id + '" class="panel-collapse collapse"><div class="panel-body" style="padding:10px;" id = collapse-subdiv' + id +'" >';
				var categoriesData = '';
				for(var j = 0;j < catData[i].categories.length ; j++)
				{
					var catId = catData[i].categories[j];
					if(catId.rehabCost == null)
						continue;
					
					var cathead = '';
					if(catId.data!=null && catId.data.rehabNotRequired != undefined && catId.data.rehabNotRequired == "Y")
					{
						cathead += '<div class = "col-md-12" style = "margin:2px;padding:2px; font-size:15px;" > <div class="clearfix alert alert-info margin-bottom-10"><span class="col-md-6 textcolorblue font14" style = "text-align : left;">'+ catId.categoryName + '</span> <span class="col-md-6 amount_1 textcolorblue font14" style = "text-align : right;">Rehab Not Required</span></div>';
					}
					else if( catId.items!= null)
					{	
						cathead += '<div class = "col-md-12" style = "margin:2px;padding:2px;" > <div style="border:1px solid #828d9b; padding:5px;font-size:17px;" class="clearfix margin-bottom-10 bold"><span class="col-md-6" style = "text-align : left;">'+ catId.categoryName + '</span> <span class="col-md-6 amount_1" style = "text-align : right;">  '+ (catId.rehabCost ? catId.rehabCost : "00" )+ '</span></div>';
						for(var k = 0; k < catId.items.length; k++ )
					    {
							var itemId = catId.items[k];
							
							var itemData = '';
							
							if((itemId.itemTemplateId == "T1" || itemId.itemTemplateId == "T2") && ( itemId.data != null && itemId.data.noOfRooms!= undefined && itemId.data.noOfRooms!=0))
							{
								    itemData += '<div class=" clearfix"><div class = "col-md-12" style = "float : left;text-align :left;margin:2px;padding:8px; font-size:18px;" id = "carpet/tiles">'+ itemId.categoryName + '</div>';
									for(var t = 0;t<itemId.data.noOfRooms;t++)
									{	
										var roomsData = '<div class = "col-md-12" style = "margin:2px;padding:2px" >';
										roomsData += '<div class="col-md-5 row"><span class="col-md-5 text-center" style = "background-color: #eee;padding: 5px 1px;text-align: center;">' + thisPtr.getFormattedKey("room") +(t+1)+'</span>'
										roomsData += '<span class="col-md-7 marg_top5 text-left" style="font-size:14px;">'+ thisPtr.getFormattedKey(itemId.data.rooms[t].action) + '</span></div>';
										roomsData += '<div class="col-md-5 row"><span class="col-md-5 text-center" style = "background-color: #eee;padding: 5px 1px;text-align: center;">Room Size</span><span class="col-md-7 marg_top5 text-left"  style="font-size:14px;">' + (itemId.data.rooms[t].size ? itemId.data.rooms[t].size : 0) + ' Sq. ft. </span></div>';
										roomsData += '<span class="col-md-2 amount_1 textcolorblue pull-right text-right" > ' + itemId.data.rooms[t].cost + '</span>';
										itemData += roomsData + '</div>';
									}
							}
							else if(itemId.itemTemplateId == "T4" && itemId.categoryId == "12")
							{
								itemData += '<div class="clearfix"><div class = "col-md-12" style = "float : left;text-align :left;margin:2px;padding:8px; font-size:18px;" id = "kitchen counter/Roof/Paint/sidings">'+ itemId.categoryName + '</div>';
								var roomsData = '<div class = "col-md-12" style = "margin:2px;padding:2px" ><span class="col-md-2" style = "background-color: #eee;padding: 5px 1px;text-align: center;">'+ thisPtr.getFormattedKey(itemId.data.action) + '</span>';
								roomsData += '<div class = "col-md-5 row"><span class="pull-left marg_top5" style = "padding-left : 18px;" >Size : </span><span class="col-md-5 marg_top5">'+ (itemId.data.size ? itemId.data.size : 0) + ' Sq.ft.</span></div>';
								roomsData += '<span class="col-md-3 amount_1 textcolorblue marg_top5 pull-right" style = "text-align : right;"> '+itemId.data.cost + '</span>';
								itemData += roomsData + '</div></div>';
							}
							else if(itemId.itemTemplateId == "T4")
							{
								itemData += '<div class="margin-bottom-20 clearfix"><div class = "col-md-12" style = "float : left;text-align :left;margin:2px;padding:8px; font-size:18px;" id = "kitchen counter/Roof/Paint/sidings">'+ itemId.categoryName + '</div>';
								var roomsData = '<div class = "col-md-8" style = "margin:2px;padding:2px" ><span class="col-md-3" style = "background-color: #eee;padding: 5px 1px;text-align: center;">'+ thisPtr.getFormattedKey(itemId.data.action) + '</span>';
								roomsData += '<span class="col-md-5 amount_1 textcolorblue marg_top5"> '+itemId.data.cost + '</span>';
								itemData += roomsData + '</div></div>';
							}
							else if(itemId.itemTemplateId == "T5")
							{
								itemData += '<div class="margin-bottom-20 clearfix"><div class = "col-md-12" style = "float : left;text-align :left;margin:2px;padding:8px; font-size:18px;" id = "Cabinets">'+ itemId.categoryName + '</div>';
								var roomsData = '<div class = "col-md-12" style = "margin:2px;padding:2px"><span class="col-md-2" style = "background-color: #eee;padding: 5px 1px;text-align: center;">Length : </span><span class="col-md-3" style = "padding: 5px 10px;">' + (itemId.data.size ? itemId.data.size : 0) + ' ft.</span>';
								roomsData += '<span class="col-md-6 amount_1 textcolorblue pull-right" style = "text-align: right;"> ' + itemId.data.cost + '</span>';
								itemData += roomsData + '</div></div>';
							}
							else if(itemId.itemTemplateId == "T6" || itemId.itemTemplateId == "T11")
							{
								//t6 = shower/tub
								itemData += '<div class="margin-bottom-20 clearfix"><div class = "col-md-12" style = "float : left;text-align :left;margin:2px;padding:8px; font-size:18px;" >'+ itemId.categoryName + '</div>';
								var roomsData = '<div class = "col-md-12" style= "margin:2px;padding:2px" >';
								if(itemId.itemTemplateId == "T6"){
									roomsData += '<span class="col-md-2" style = "background-color: #eee;padding: 5px 1px;text-align: center;">' + thisPtr.getFormattedKey(itemId.data.action) + '</span>';
									roomsData += '<span class="pull-left marg_top5" style = "padding-left : 23px">No. of Items : </span> <span class="col-md-2 marg_top5"> ' + itemId.data.size + '</span>';
								}
								else{
									roomsData += '<span class="col-md-2" style = "background-color: #eee;padding: 5px 1px;text-align: center;">No. of Items : </span> <span class="col-md-2 marg_top5" > ' + itemId.data.size + '</span>';
								}
								roomsData += '<span class="col-md-4 amount_1 textcolorblue row pull-right" style = "text-align: right; margin-right : 1px"> ' + itemId.data.cost + '</span>';
								itemData += roomsData + '</div></div>';								
							}
							else if(itemId.itemTemplateId == "T7")
							{			
								itemData += '<div class="margin-bottom-20 clearfix"><div class = "col-md-12" style = "float : left;text-align :left;margin:2px;padding:8px; font-size:18px;" id = "Plumbing/other" >'+ itemId.categoryName + '</div>';
								var roomsData = '<div class = "col-md-12 rehab-media-comments" style = "margin:2px;padding:2px"><div class="media col-md-8"><div class="pull-left marg_top5"><a href="#"> <img width="43" class="message" style="border-radius: 50% !important;" src="assets/img/avatar_comments_small.jpg"></a></div><div style="background-color: rgb(255, 255, 255); left: 71px; z-index: 900; width: 16px; height: 16px; top: 16px; position: absolute; border-radius: 50px ! important; border: 3px solid rgb(225, 248, 254);"></div><div class="media-body" style="background-color: #e1f8fe; padding:10px 16px;"><p>' + (itemId.comments ? itemId.comments : "No Comments")+ '</p></div></div>';
								roomsData += '<span class="col-md-4 amount_1 textcolorblue text-right" style = "text-align: right;"> ' + (itemId.rehabCost ? itemId.rehabCost : 0)  + '</span>';
								itemData += roomsData + '</div></div>';
							}
							else if(itemId.itemTemplateId == "T8")
							{
								if(itemId.data.option == "present")
								{
									itemData += '<div class="clearfix"><table class="table"><tr><td class = "col-md-3 bold">'+ itemId.categoryName + '</td>';
									itemData += '<td class = "col-md-3">'+ thisPtr.getFormattedKey(itemId.data.option) + '</td>';
									var roomsData = '<td class = "col-md-3">' + thisPtr.getFormattedKey(itemId.data.action) + '</td>';
									roomsData += '<td class = "amount_1 textcolorblue col-md-3"  style = "text-align:right"> ' + itemId.data.cost + '</td></tr></table></div>';
								}
								else if(itemId.data.option == "absent")
								{
									itemData += '<div class="clearfix"><table class="table"><tr><td class = "col-md-3 bold">'+ itemId.categoryName + '</td>';
									var roomsData = '<td class = "col-md-3">' + thisPtr.getFormattedKey(itemId.data.option) + '</td>';
									roomsData += '<td class = "col-md-3">' + "" + '</td>';
									roomsData += '<td class = "amount_1 textcolorblue col-md-3" style = "text-align:right"> ' + itemId.data.cost + '</td></tr></table></div>';
								}
								itemData += roomsData;
							}
							else if(itemId.itemTemplateId == "T12")
							{
								itemData += '<div class="margin-bottom-20 clearfix"><div class = "col-md-12" style = "float : left;text-align :left;margin:2px;padding:8px; font-size:18px;" id = "cleaning">'+ itemId.categoryName + '</div>';
								var roomsData = '<div class = "col-md-12" style = "margin:2px;padding:2px">';	
								roomsData += '<span class="col-md-2 text-center" style = "background-color: #eee;padding: 5px 1px;">Required : </span><span class="col-md-3 marg_top5">' + thisPtr.getFormattedKey(itemId.data.option) + '</span>';
								roomsData += '<span class="col-md-7 amount_1 textcolorblue text-right" style = "text-align : right">  ' + itemId.data.cost + '</span>';
								itemData += roomsData + '</div></div>';
							}
							else if(itemId.itemTemplateId == "T13")
							{
								itemData += '<div class="margin-bottom-20 clearfix"><div class = "col-md-12" style = "float : left;text-align :left;margin:2px;padding:8px; font-size:18px;" id = "Locks">'+ itemId.categoryName + '</div>';
								var roomsData = '<div class = "col-md-12" style = "margin:2px;padding:2px">';	
								roomsData += '<span class="col-md-2 text-center" style = "background-color: #eee;padding: 5px 1px;">Required : </span><span class="col-md-2 marg_top5" >' + thisPtr.getFormattedKey(itemId.data.option) + '</span>';
								roomsData += '<span class="col-md-2 text-center" style = "background-color: #eee;padding: 5px 1px;"> No of Items: </span><span class="col-md-1 marg_top5" >' + (itemId.data.size ? itemId.data.size : 0) + '</span>';
								roomsData += '<span class="col-md-5	 amount_1 textcolorblue test-right" style = "text-align : right">  ' + itemId.data.cost + '</span>';
								itemData += roomsData + '</div></div>';
							}
							cathead += itemData;
					    }	
						if(catId.categoryId == "2")  // Appliances
						{
							cathead += '<div class="margin-bottom-20 clearfix"><div class = "col-md-12 bold marg_top10" style = "float : left;text-align :left;margin:2px;padding:8px; font-size:17px;"><span class="col-md-8 row pull-left" style = "text-align : left"> Appliances are matching in style?</span>';
							var resp = "no";
							if(catId.data != null && catId.data.matchingStyle != null)
								var resp = thisPtr.getFormattedKey(catId.data.matchingStyle);
							cathead += '<span class="col-md-4 pull-right" style = "text-align : right"> '+ resp + '</span></div>';
							cathead += '<div class = "col-md-12 rehab-media-comments" style = "margin:2px;padding:2px"><div class="media col-md-8"><div class="pull-left marg_top5"><a href="#"> <img width="43" class="message" style="border-radius: 50% !important;" src="assets/img/avatar_comments_small.jpg"></a></div><div style="background-color: rgb(255, 255, 255); left: 71px; z-index: 900; width: 16px; height: 16px; top: 16px; position: absolute; border-radius: 50px ! important; border: 3px solid rgb(225, 248, 254);"></div><div class="media-body" style="background-color: #e1f8fe; padding:10px 16px;"><p>' + (catId.data.matchingStyleComment ? catId.data.matchingStyleComment : "No Comments") +'</div></div></div>';
						}
						if(catId.categoryId == "9")		// miscellaneous
						{
							if(catId.data!= null && catId.data.misc!= null && catId.data.noOfMisc!= null)
							{
								for(var k = 0 ; k< catId.data.noOfMisc; k++)
								{
									var obj = catId.data.misc[k];
									var miscHeadData = '<div class="clearfix"><div class = "col-md-12" style = "float : left;text-align :left;margin:2px;padding:8px; font-size:18px;" id = "misc-title-' + k + '">Miscellaneous '+ (k+1) + '</div>';
									var miscAdd = '<div class = "col-md-12 rehab-media-comments" style = "margin:2px;padding:2px"><div class="media col-md-8"><div class="pull-left marg_top5"><a href="#"> <img width="43" class="message" style="border-radius: 50% !important;" src="assets/img/avatar_comments_small.jpg"></a></div><div style="background-color: rgb(255, 255, 255); left: 71px; z-index: 900; width: 16px; height: 16px; top: 16px; position: absolute; border-radius: 50px ! important; border: 3px solid rgb(225, 248, 254);"></div><div class="media-body" style="background-color: #e1f8fe; padding:10px 16px;"><p>' + (obj.comment? obj.comment: "No Comments") + '</div></div>';
									miscAdd += '<span class="col-md-4 amount_1 textcolorblue pull-right" style = "text-align : right"> ' + obj.cost + '</span>';
									cathead += miscHeadData + miscAdd + '</div></div>';
								}
							}
						}
					}	
					else
					{
						if(catId.categoryTemplateId != null && catId.categoryTemplateId == "T7")
						{
							cathead += '<div class = "col-md-12" style = "margin:2px;padding:2px;" > <div style="border:1px solid #828d9b; padding:5px;font-size:17px;" class="clearfix margin-bottom-10 bold"><span class="col-md-6" style = "text-align : left;" id = "Garage/Landscaping">'+ catId.categoryName + '</span><span class="col-md-6 amount_1" style="text-align : right;">'+ (catId.rehabCost ? catId.rehabCost : "00" ) +'</span></div>';
							cathead += '<div class = "col-md-12 rehab-media-comments" style = "margin:2px;padding:2px"><div class="media col-md-8"><div class="pull-left marg_top5"><a href="#"> <img width="43" class="message" style="border-radius: 50% !important;" src="assets/img/avatar_comments_small.jpg"></a></div><div style="background-color: rgb(255, 255, 255); left: 71px; z-index: 900; width: 16px; height: 16px; top: 16px; position: absolute; border-radius: 50px ! important; border: 3px solid rgb(225, 248, 254);"></div><div class="media-body" style="background-color: #e1f8fe; padding:10px 16px;"><p>' + (catId.comments ? catId.comments : "No Comments") + '</div></div><div class="col-md-4" style="text-align: right;"><span class="textcolorblue amount_1" style = "padding: 5px 1px;text-align: center;font-size : 14px;">' + (catId.rehabCost ? catId.rehabCost : 0) + '</span></div></div>';
							//cathead += '</div>';
						}
						else if(catId.categoryTemplateId != null && catId.categoryTemplateId == "T3" && catId.data!=null)
						{
							cathead += '<div class = "col-md-12" style = "margin:2px;padding:2px;" > <div style="border:1px solid #828d9b; padding:5px;padding:5px; font-size:17px;" class="clearfix margin-bottom-10 bold"><span class="col-md-6" style = "text-align : left;" id = "wallpaint">'+ catId.categoryName + '</span> <span class="col-md-6 amount_1" style = "text-align : right;">  '+ (catId.rehabCost ? catId.rehabCost : "00" )+ '</span></div>';
							cathead += '<div class = "col-md-12" style = "margin:2px;padding:2px"><span class="col-md-2" style = "background-color: #eee;padding: 5px 1px;text-align: center;font-size:14px;">' + thisPtr.getFormattedKey(catId.data.action) + '</span>';
							cathead += '<span class="col-md-3 marg_top5" style = "font-size:14px;">' + (catId.data.size ? catId.data.size : 0)  + ' Sq. ft.</span>';
							cathead += '<span class="col-md-4 amount_1 textcolorblue pull-right text-right" style = "font-size:14px;"> ' + catId.data.cost + '</span>';
							cathead += '</div></div>';
						}
						else if(catId.categoryTemplateId != null && catId.categoryTemplateId == "T10" && catId.data!=null)
						{
							cathead += '<div class = "col-md-12" style = "margin:2px;padding:2px;" > <div style="border:1px solid #828d9b;font-size:17px; padding:5px;" class="clearfix margin-bottom-10 bold"><span class="col-md-6" style = "text-align : left;" id = "HVAC">'+ catId.categoryName + '</span> <span class="col-md-6 amount_1" style = "text-align : right;"> '+ (catId.rehabCost ? catId.rehabCost : "00" )+ '</span></div>';
							if(catId.data.action != null && catId.data.cost != null)
							{
								cathead += '<div class = "col-md-12" style = "margin:2px;padding:2px"><span class="col-md-6" style = "text-align : left">' + thisPtr.getFormattedKey(catId.data.action) + '</span>';
								cathead += '<span class="col-md-6 amount_1 textcolorblue" style = "text-align : right"> ' + catId.data.cost + '</span>';
								cathead += '</div>';
							}
							cathead += '';
						}
						else if(catId.categoryTemplateId != null && catId.categoryTemplateId == "T15" && catId.data!=null)
						{
							if(catId.data != null && catId.data.questions != null && catId.data.questions.length > 0)
								cathead += '<div class = "col-md-12" style = "margin:2px;padding:2px;" > <div style="border:1px solid #828d9b; padding:5px; font-size:17px;" class="clearfix margin-bottom-10 bold"><span class="col-md-6" style = "text-align : left;" id = "Neighbourhood">'+ catId.categoryName+ '</span></div>';
							for(var t = 0 ; t < catId.data.questions.length; t++)
							{
								cathead += '<div class = "clearfix" style ="margin: 2px;padding-bottom: 10px; border-bottom: 1px dashed #828d9b;margin-bottom: 14px;"><div class = "col-md-12" style = "margin:2px;padding:2px;"><span class="col-md-10 bold" style = "text-align : left;display: inline-flex;"> ' + catId.data.questions[t].question + '</span>';
								cathead += '<span class="col-md-2 text-right pull-right">' + thisPtr.getFormattedKey(catId.data.questions[t].option) + '</span></div>';
								if(catId.data.questions[t].comments ) 
									cathead += '<div class = "col-md-12 rehab-media-comments" style = "margin:2px;padding:2px"><div class="media col-md-8"><div class="pull-left marg_top5"><a href="#"> <img width="43" class="message" style="border-radius: 50% !important;" src="assets/img/avatar_comments_small.jpg"></a></div><div style="background-color: rgb(255, 255, 255); left: 71px; z-index: 900; width: 16px; height: 16px; top: 16px; position: absolute; border-radius: 50px ! important; border: 3px solid rgb(225, 248, 254);"></div><div class="media-body" style="background-color: #e1f8fe; padding:10px 16px;"><p>'+ catId.data.questions[t].comments + '</div></div></div>';
							    cathead += '</div>';
									
							}
							cathead += '</div>';
						}
						
						else
						{
							cathead += '<div class = "col-md-12" style = "margin:2px;padding:2px;" > <div style="border:1px solid #828d9b; padding:5px; font-size:17px;" class="clearfix margin-bottom-10 bold"><span class="col-md-6" style = "text-align : left;">'+ catId.categoryName + '</span> <span class="col-md-6 amount_1" style = "text-align : right;color:#fff;"> '+ (catId.rehabCost ? catId.rehabCost : "00" )+ '</span></div>';
							cathead += '<div style = "float : right;text-align :left;margin:2px;padding:2px" id = "cat-title-val-' + catId.categoryId + '">  ' + catId.rehabCost + '</div>';
							cathead += '<div class = "col-md-12" style = "margin:2px;padding:2px"><span class="col-md-4" style = "text-align : left">' + thisPtr.getFormattedKey(catId.action) + '</span>';
							cathead += '<span class="col-md-4" style = "text-align : center">' + catId.size + ' Sq. ft.</span>';
							cathead += '<span class="col-md-4 amount_1 textcolorblue" style = "text-align : right"> ' + catId.cost + '</span>';
							cathead += '</div></div>';
						}
						
					}
					cathead += '</div>';
					categoriesData += cathead;
				}
				headCollapsePanel += categoriesData + '</div>';
				headCatPanel += headCatPanelHeading + '</div>';
				headCatPanel += headCollapsePanel;
				
				$('#populate-Categories').append(headCatPanel);
				
			}

			var HUOversightFeeVal= 0;
			var totalAfterHUOversightFee = 0;

			if(thisPtr.totalRehabEstimate){
				totalAfterHUOversightFee = thisPtr.totalRehabEstimate;
				HUOversightFeeVal = (thisPtr.totalRehabEstimate ? thisPtr.totalRehabEstimate : 0);
				HUOversightFeeVal = ((HUOversightFeeVal*10)/110).toFixed(2);
			} else {
				//calculate the total rehab by adding for all categories + total
				categoriesTotal = 0; 
				for(hCount = 0; hCount < thisPtr.initEstimate.length; hCount++){ 
					categoriesTotal = categoriesTotal + (parseFloat(thisPtr.initEstimate[hCount].rehabCost)? parseFloat(thisPtr.initEstimate[hCount].rehabCost) : 0); 
				} 
				HUOversightFeeVal = parseFloat((categoriesTotal*0.1).toFixed(2));  //10% of total amount
				totalAfterHUOversightFee = categoriesTotal + HUOversightFeeVal;
			}
			

			var HUOversightFee  = '<div style = "margin : 2px;padding:8px 2px;background-color : #bbb; color : #FFF;" class = "col-md-12"><span class="col-md-6" style = "text-align : left">HU Oversight Fee(10%)</span><span class="col-md-6 amount_1" style = "text-align : right">  ' + (HUOversightFeeVal? HUOversightFeeVal : 0) + '</span></div>'
			$('#populate-Categories').append(HUOversightFee);
			var totalRehabCost = '<div class = "col-md-12" style = "margin:2px;padding:8px 2px; background-color : #828d9b !important ;color : #FFF;"><span class="col-md-6" style = "text-align : left">Total Rehab Cost</span><span class="col-md-6 amount_1" style = "text-align : right">  ' + (totalAfterHUOversightFee? totalAfterHUOversightFee : 0) + '</span></div>'
			$('#populate-Categories').append(totalRehabCost);
			$('.panel-default').on('click' , function(event){
				if(event.originalEvent.detail > 1)
					return;
				var t = $(this).find("i");
				$(t).toggleClass("fa-minus-circle").toggleClass("fa-plus-circle");
				if($(t).css('color') == 'rgb(130, 141, 155)'){
					$(t).css('color','rgb(66, 139, 202)');
				}
				else	$(t).css('color','rgb(130, 141, 155)');
				t = $(this).find("a");
				if($(t).css('color') == 'rgb(130, 141, 155)'){
					$(t).css('color','rgb(66, 139, 202)');
				}
				else	$(t).css('color','rgb(130, 141, 155)');
				t = $(this).find(".amount_1");
				if($(t).css('color') == 'rgb(130, 141, 155)'){
					$(t).css('color','rgb(66, 139, 202)');
				}
				else	$(t).css('color','rgb(130, 141, 155)');
			});
		},

		editRehabEstimation: function(){
			var thisPtr=this;
			if(thisPtr.inspectionStatus == "Completed"){
				var postData = {};
				postData.propertyId = thisPtr.propertyId;
				postData.inspectionType = "Rehab Estimator";
				postData.startRehab="N";
				$.ajax({
	                url: 'rehabEstimator/editRehabEstimator',
					dataType:'json',
					contentType: 'application/json',
					data: JSON.stringify(postData),
	                type: 'POST',
	                async:false,
	                success: function(res){
	                	thisPtr.showEditRehabEstimate();
	                },
	                error: function(res){
	                	console.log("Error while copying data and creating a new inspection.");
	                }
	            });
			} else {
				thisPtr.showEditRehabEstimate();
			}
		},

		showEditRehabEstimate: function(){
			var thisPtr=this;
			$(".page-container").addClass("page-sidebar-closed");
			if(!app.propertyDetailView.rehabEstTabView.rehabEstimatorView){
				app.propertyDetailView.rehabEstTabView.rehabEstimatorView=new rehabEstimatorView();
			}
			app.propertyDetailView.rehabEstTabView.rehabEstimatorView.propertyId = thisPtr.propertyId;
			app.propertyDetailView.rehabEstTabView.rehabEstimatorView.huSelect = thisPtr.huSelect;
			app.propertyDetailView.rehabEstTabView.rehabEstimatorView.myStructure = thisPtr.initEstimate;
			app.propertyDetailView.rehabEstTabView.rehabEstimatorView.pricingModel = thisPtr.pricelogicDetails;
			app.propertyDetailView.rehabEstTabView.rehabEstimatorView.setElement($('.page-content')).render();
		}
	});
	
	return RehabEstimatorTabView;

});	