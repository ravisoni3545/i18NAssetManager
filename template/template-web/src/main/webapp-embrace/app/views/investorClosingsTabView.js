define(["text!templates/investorClosingsTab.html", "models/investorProfileModel","backbone","app"],
		function(investorClosingsTabPage, investorProfileModel, Backbone, app){

	var InvestorClosingsTabView = Backbone.View.extend( {
		initialize: function(){
		},

		el:"#investorClosingDetailsTab",
		self:this,
		model : new investorProfileModel(),
		investorId:{},
		events : {
			'change input[name=investmentStatus]':'getClosingsByStatus'
		},
		render : function () {
			var thisPtr=this;
			this.template = _.template( investorClosingsTabPage );
			this.$el.html("");
			this.$el.html(this.template);
			var profileModel = new investorProfileModel();
			self.model = profileModel;
			self.model.set("investorId",thisPtr.investorId);
			self.model.set("investmentStatus",'Closing');//Initially we will show closings in progress
			this.showDataTable();
			$(".amount").formatCurrency({symbol:"$",roundToDecimalPlace:0});
			$(".amountWithOutSymbol").formatCurrency({symbol:"",roundToDecimalPlace:0});
			$('#investorClosingsTabTable thead tr th:nth-child(0)').removeClass("sorting_desc sorting_asc").addClass("sorting");
			return this;
		},
		getClosingsByStatus:function(evt){
			self.investmentStatus=$(evt.currentTarget).val();
			self.model.set("investmentStatus",self.investmentStatus);
			$("#investorClosingsTabTable").dataTable().fnDestroy();
			this.showDataTable();
		},
		showDataTable : function() {
			var thisPtr=this;
			// ----------------------------DataTable
			// start-----------------------------------
			$('#investorClosingsTabTable').on( 'draw.dt', function () {
				$('.propNameTooltip').tooltip({
					animated: 'fade',
					placement: 'bottom'
				});
			});
			var oTable = $('#investorClosingsTabTable')
					.dataTable(
							{
								"bServerSide" : true,
								'bProcessing' : true,
//								'bStateSave': true,
								"bFilter": false,
//								"scrollY" : "300px",
								"sScrollX" : "100%",
								"scrollCollapse" : true,
								//"paging" : false,
//								"bAutoWidth": false,
								"sAjaxSource" : app.context()
										+ '/investorProfile/getClosings/',
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
											"sTitle" : "PROPERTY","sWidth":"25%"
										},
										{
											"mData" : "purchasePrice",
											"sTitle" : "PURCHASE PRICE","sWidth":"12%"
										},
										{
											"mData" : "closingStartDate",
											"sTitle" : "CLOSING START DATE","sWidth":"11%"
										}, 
										{
											"mData" : "optionPeriodExpires",
											"sTitle" : "OPTION PERIOD EXPIRES","sWidth":"11%"
										},
										{
											"mData" : "finalEstimatedClosingDate",
											"sTitle" : "ESTIMATED CLOSING DATE","sWidth":"12%"
										},
										{
											"mData" : "closer",
											"sTitle" : "CLOSER","sWidth":"13%"
										},
										{
											"mData" : "closingStatus",
											"sTitle" : "STATUS","sWidth":"16%"
										}		
										],

								"aoColumnDefs" : [
										{
//											"sWidth": "25%",
											"aTargets" : [ 0 ],
											 "mRender": function (data, type, full) {
										          return '<div><img src="'+full.photoLink+'" border="0" class="pull-left marg_right10 img1class" alt="Image"></img>'
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
//											"sWidth": "11%",
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
//										{
//											"sWidth": "11%",
//											"aTargets" : [ 2 ]
//										},
//										{
//											"sWidth": "11%",
//											"aTargets" : [ 3 ]
//										},
										{
//											"sWidth": "11%",
											"aTargets" : [ 4 ],
											"mRender" : function(
													data, type,
													full) {
												if(full.closingEndDate){
													return full.closingEndDate;
												}else if(full.estimatedClosingDate){
													return '<span style="color: #0D638F;font-style: italic;">'+ full.estimatedClosingDate+ '</span>';
												}else{
													return '';
												}
											}
										},
//										{
//											"sWidth": "10%",
//											"aTargets" : [ 5 ]
//										},
										{
//											"sWidth": "21%",
											"aTargets" : [ 6 ],
											"mRender" : function(
													data, type,
													full) {
												return '<a href="#closing/'
														+ full.investmentId
														+ '">'
														+ full.closingStatus
														+ '</a>';
											}
										}

								],
								
							//----------------------------
							"fnDrawCallback": function () {
//								$("#investorClosingsTabTable_wrapper .dataTables_scrollHead table").css("margin-top","0px");
//								$("#investorClosingsTabTable_wrapper .dataTables_scrollBody table").css("margin-top","-3px");
								$(".amount").formatCurrency({symbol:"$",roundToDecimalPlace:0});
								$(".amountWithOutSymbol").formatCurrency({symbol:"",roundToDecimalPlace:0});
							},
        				     "fnInitComplete": function() {
        				    	thisPtr.savePageNum();
        				    	$('#investorClosingsTabTable').dataTable().fnAdjustColumnSizing();
								$(".amount").formatCurrency({symbol:"$",roundToDecimalPlace:0});
								$(".amountWithOutSymbol").formatCurrency({symbol:"",roundToDecimalPlace:0});
								$('#investorClosingsTabTable thead tr th:nth-child(1)').removeClass("sorting_desc sorting_asc").addClass("sorting");
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
													 console.log("Failed in investor closing tab View");
													 $('#errorMsg').show();
									                 $('#errorMsg > text').html("Error in fetching investor closings information.");
									                 App.scrollTo($('#errorMsg'), -200);
									                 $('#errorMsg').delay(2000).fadeOut(2000);
												}
											});
								}

							});
            $('select[name=investorClosingsTabTable_length]').addClass('form-control');
            $('#investorClosingsTabTable_wrapper .dataTables_scrollBody').css({"overflow":"visible","width":"100%"});
			$('#investorClosingsTabTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");
			$("#investorClosingsTabTable_wrapper .dataTables_scrollHead table").css("margin-top","0px");
			$("#investorClosingsTabTable_wrapper .dataTables_scrollBody table").css("margin-top","-3px");
			$(window).on('resize', function () {
				if($('#investorClosingsTabTable').dataTable() && $('#investorClosingsTabTable').dataTable().length){
					$('#investorClosingsTabTable').dataTable().fnAdjustColumnSizing();
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
		    		    		   $('#investorClosingsTabTable_info').html('Showing '+ pStart +' to '+self.pageEnd+ ' of '+ self.totalRecords +' entries');
		    		    	   }
		    			   }, 500);
		    	  
		       }
		       return;
		}
	});
	return InvestorClosingsTabView;
});