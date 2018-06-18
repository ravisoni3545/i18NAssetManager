define(["text!templates/investorTab.html", "models/investorProfileModel",
        "text!templates/propertyUnitLeaseInfo.html",
        "backbone","app"],
		function(investorAssetsTabPage, investorProfileModel,propertyUnitLeaseInfoPage,Backbone, app){

	var InvestorAssetsTabView = Backbone.View.extend( {
		initialize: function(){
		},

		el:"#investorAssetDetailsTab",
		self:this,
		model : new investorProfileModel(),
		investorId:{},
		events : {
			'click .unitDetailsButton' :"showUnitDetails"
		},
		render : function () {
			var thisPtr=this;
			this.template = _.template( investorAssetsTabPage );
			this.$el.html("");
			this.$el.html(this.template);
			var profileModel = new investorProfileModel();
			self.model = profileModel;
			self.model.set("investorId",thisPtr.investorId);
			this.getLeaseInfo(thisPtr.investorId);
			this.showDataTable();
			return this;
		},
		showDataTable : function() {
			var thisPtr=this;
			// ----------------------------DataTable
			// start-----------------------------------
			$('#investorTabTable').on( 'draw.dt', function () {
				$('.propNameTooltip').tooltip({
					animated: 'fade',
					placement: 'bottom'
				});
			});
			var oTable = $('#investorTabTable')
					.dataTable(
							{
								"bServerSide" : true,
								'bProcessing' : true,
								 //'bStateSave': true,
								"bFilter": false,
								//"scrollY" : "300px",
								"scrollX" : "100%",
								//"scrollCollapse" : true,
								//"paging" : false,
								"sAjaxSource" : app.context()
										+ '/investorProfile/getAssets/',
								"sAjaxData" : 'aaData',
								//"pagingType" : "simple",
								"oLanguage" : {
									"sLengthMenu" : "_MENU_ records",
									"sZeroRecords" : "No matching records found",
									"sInfo" : "Showing _START_ to _END_ of _TOTAL_ entries",
									"sInfoEmpty" : "No records available",
									"sInfoFiltered" : "(filtered from _MAX_ total entries)",
								},

								"aoColumns" : [
										{
											"mData" : "propertyAddress",
											"sTitle" : "PROPERTY"
										},
										{
											"mData" : "purchasePrice",
											"sTitle" : "PURCHASE PRICE"
										},
										{
											"mData" : "closingEndDate",
											"sTitle" : "DATE ACQUIRED"
										},
										{
											"mData" : "financingType",
											"sTitle" : "FINANCING TYPE"
										}, {
											"mData" : "assetManager",
											"sTitle" : "ASSET MANAGER"
										},{
											"mData" : "assetStatus",
											"sTitle" : "STATUS"
										}		
										],

								"aoColumnDefs" : [
										{
											"sWidth": "29%", 
											"aTargets" : [ 0 ],
											 "mRender": function (data, type, full) {
										          return '<div class="tooltip-maxwidth"><img src="'+full.photoLink+'" border="0" class="pull-left marg_right10 img1class" alt="Image"></img>'
										          +'<a href=#property/'+ full.propertyId 
										          +' class="darkcolor dottext propNameTooltip" style=margin-bottom:0px; data-toggle=tooltip title="'
										          + full.propertyAddress +'">'
										          + full.propertyAddress +
										          '</a>' +
										          '<span class="lightfontcolor">' +
										          ((full.propertyType)?(full.propertyType+', '):'')
										          +full.bedRooms+' Beds, '+full.bathRooms+' Baths, <span class="amountWithOutSymbol">'+full.totalSqft+'</span> Sqft.'
										          +((full.propertyDisplayId)?('<br>'+full.propertyDisplayId):'')  +
										          '</span></div>';
										         }
										},
										{
											"sWidth": "15%", 
											"aTargets" : [ 1 ],
											"mRender" : function(
													data, type,
													full) {
												if(full.purchasePrice){
													return '<span class="amount">'+ full.purchasePrice+ '</span>';
												}else{
													return '';
												}
											}
										},
										{ "sWidth": "12%", "aTargets": [ 2 ] },
										{ "sWidth": "13%", "aTargets": [ 3 ] },
										{ "sWidth": "15%", "aTargets": [ 4 ] },
										{
											"sWidth": "16%",
											"aTargets" : [ 5 ],
											"mRender" : function(
													data, type,
													full) {
												
												var assetStatus = (full.marketingStatus && full.assetStatus.toLowerCase().indexOf("marketing") >= 0)
												?(full.assetStatus+' - '+full.marketingStatus):((full.rehabStatus && full.assetStatus.toLowerCase().indexOf("rehab") >= 0)?(full.assetStatus+' - '
														+full.rehabStatus):full.assetStatus);
												
												var rehabData = (full.rehabStatus && full.assetStatus.toLowerCase().indexOf("rehab") >= 0)
																	?(full.rehabCompletionDate?('<br>Started on '+full.rehabStartDate+'<br>Completed  on '+full.rehabCompletionDate)
																			:(full.rehabStartDate?('<br>Started on '+full.rehabStartDate+'<br>Estimated to complete on '+full.rehabInvestorEstimatedCompletionDate)
																					:((!full.rehabEstimatedStartDate && !full.rehabInvestorEstimatedCompletionDate)
																						?((full.rehabFundsReceived=='No'?('<br><span style="color:#000000">Pending Rehab Funds</span>'):'')+
																								'<br>Estimated Duration: '+(full.estimatedRehabDuration?full.estimatedRehabDuration+' weeks':""))
																						:('<br>Estimated to started on: '+full.rehabEstimatedStartDate+'<br>Estimated to complete  on: '+full.rehabInvestorEstimatedCompletionDate))
																			  )
																	):'';
												
												return '<a href="#myProperties/'
														+ full.assetId	+ '">'+assetStatus+ '</a>'+ rehabData
														+((full.leaseExpirationDate)?('<br>Lease Exp:'+
																(full.leaseExpired?('<span style="color:#FF0000;">'+full.leaseExpirationDate+'</span>'):full.leaseExpirationDate)):'')
														+((full.rent)?('<br>Rent:<span class="amount">'+full.rent+'</span>'):'')
														+((thisPtr.propetyUnitLeaseDetails && _.findWhere(thisPtr.propetyUnitLeaseDetails,{assetId: full.assetId}))
																?('<br><a style="cursor:pointer;" class="btn btn-primary btn-xs'
																	+' accordion-toggle margin-bottom-5 unitDetailsButton"'
																	+' data-toggle="collapse" data-target=".leaseRow" data-showpopup=true data-assetid="' 
																	+full.assetId+'">UNIT DETAILS</a>'):'');
											}
										}

								],
								
							//----------------------------
							"fnDrawCallback": function () {
							  	$(".amount").formatCurrency({symbol:"$",roundToDecimalPlace:2});
								$(".amountWithOutSymbol").formatCurrency({symbol:"",roundToDecimalPlace:0});
							},
        				     "fnInitComplete": function() {
	    				    	thisPtr.savePageNum();
					    		$(".amount").formatCurrency({symbol:"$",roundToDecimalPlace:2});
								$(".amountWithOutSymbol").formatCurrency({symbol:"",roundToDecimalPlace:0});
								$('#investorTabTable thead tr th:nth-child(1)').removeClass("sorting_desc sorting_asc").addClass("sorting");
        			         },
        			       
								"fnServerData" : function(
										sSource, aoData,
										fnCallback, oSettings) {
									var paramMap = {};
									for (var i = 0; i < aoData.length; i++) {
										paramMap[aoData[i].name] = aoData[i].value;
									}
									var pageSize = oSettings._iDisplayLength;
									var start = paramMap.iDisplayStart;

									var pageNum = (start / pageSize);
									var sortCol = paramMap.iSortCol_0;
									var sortDir = paramMap.sSortDir_0;
									
									var sortName = paramMap['mDataProp_'
											+ sortCol];
									self.model.set("sortDir",
											sortDir);
									self.model.set("sortName",
											sortName);
									self.model.set("pageNum",
											pageNum);
									self.model.set("pageSize",
											pageSize);
									$.ajax({
												"dataType" : 'json',
												"contentType" : "application/json",
												"type" : "POST",
												"url" : sSource,
												"data" : JSON.stringify(self.model.attributes),
												"success" : function(
														res) {
													res.iTotalRecords = res.iTotalRecords;
													res.iTotalDisplayRecords = res.iTotalRecords;
													fnCallback(res);
												},
												"error" : function(res) {
													 console.log("Failed in investor asset tab View");
													 $('#errorMsg').show();
									                 $('#errorMsg > text').html("Error in fetching investor asset information.");
									                 App.scrollTo($('#errorMsg'), -200);
									                 $('#errorMsg').delay(2000).fadeOut(2000);
												}
											});
								}

							});
            $('select[name=investorTabTable_length]').addClass('form-control');
            $('#investorTabTable_wrapper .dataTables_scrollBody').css({"overflow":"visible","width":"100%"});
			$('#investorTabTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");
			$("#investorTabTable_wrapper .dataTables_scrollHead table").css("margin-top","0px");
			$("#investorTabTable_wrapper .dataTables_scrollBody table").css("margin-top","-1px");
			$(window).on('resize', function () {
				if($('#investorTabTable').dataTable() && $('#investorTabTable').dataTable().length){
					$('#investorTabTable').dataTable().fnAdjustColumnSizing();
				}
			});
		},
		savePageNum: function(){
			var self=this;
		       var pageNum=this.pageNumber;
		       if(pageNum  && self.previousUrl){
		    	   var pNum;
		    	   
		    	   pNum=parseInt(pageNum);
		    	   pNum++;
		    	   var tempNum=pNum;
		    	   
		    	   setTimeout(
		    			   function() 
		    			   {
		    				   $('.pagination').find('.active').removeClass('active');
		    				   //$('.dataTables_paginate ul').html(localStorage.getItem('dataTables_paginate'));
		    				   
		    				   /*if($('.pagination').find('a:contains('+pNum+')').length==0){
		    					   var count=0;
			    				   $( ".dataTables_paginate ul li a" ).each(function( index ) {
			    					   
			    					   if($( this ).text()!=""){
			    						   if(count>0){
			    						   console.log( index + ": " + $( this ).text(tempNum) );
			    						   tempNum++;
			    						   }
			    						   else{
				    						   var temp2=tempNum-1;
				    						   $( this ).text(temp2)
				    						   count++;
				    					   }
			    					   }
			    					  
			    					 });
			    				   //$('.pagination .prev').removeClass('disabled');
		    				   }*/
		    				   
		    				   $('.pagination').find('a:contains('+pNum+')').parent().addClass('active');
		    		    	   
		    		    	   if(self.pageStart ){
		    		    		   var pStart=parseInt(self.pageStart);
		    		    		   pStart++;
		    		    		   $('#investorTabTable_info').html('Showing '+ pStart +' to '+self.pageEnd+ ' of '+ self.totalRecords +' entries');
		    		    	   }
		    			   }, 500);
		    	  
		       }
		       return;
		},
		getLeaseInfo:function(investorId){
			var self = this;
			$.ajax({
				url: app.context()+'/investorProfile/getUnitLeaseInfo/'+this.investorId,
                contentType: 'application/json',
                async : false,
                dataType:'json',
                type: 'GET',
				success : function(res) {
					self.propetyUnitLeaseDetails = res;
				},
				error : function(res) {
					 console.log("Error fetching in investor's property unit lease details");
				}
			});
		},
		showUnitDetails:function(evt){
			var self = this;
			var currentAssetId = $(evt.target).data('assetid');
			var showpopup = $(evt.currentTarget).data("showpopup");
			var row = $(evt.currentTarget).closest("tr");
			var box = $(evt.currentTarget).closest("td");
			if(showpopup){
				self.hideAllHiddenRows();
				row.after(_.template(propertyUnitLeaseInfoPage)({propetyUnitLeaseDetails:self.propetyUnitLeaseDetails,currentAssetId : currentAssetId}));
//				self.isRowInsertedToDT = true;
				App.handleUniform();
				ComponentsPickers.init();
				$(".amount").formatCurrency({symbol:"$",roundToDecimalPlace:2});
				$(".amountWithOutSymbol").formatCurrency({symbol:"",roundToDecimalPlace:0});
				$(evt.currentTarget).data("showpopup",false);
			} else {
				$(evt.currentTarget).data("showpopup",true);
//				self.hideHiddenRows(row.next());
				row.next().remove();
			}
		},
		hideHiddenRows: function(row){
			var self = this;
//			self.isRowInsertedToDT = false;
//			$('.collapse.in').collapse('hide');
			setTimeout(function(){self.deleteHiddenRow(row)},200);
		},
		hideAllHiddenRows: function(){
			var self = this;
			var requiredRows = $(".collapse.in").closest("tr");
			// $('.collapse.in').collapse('hide');
			_.each(requiredRows,function(el){
				// self.deleteHiddenRow(el);
				$(el).prev().find(".unitDetailsButton").data("showpopup",true);
				self.hideHiddenRows(el);
			});
		},
		deleteHiddenRow: function(row){
			$(row).remove();
		}
	});
	return InvestorAssetsTabView;
});