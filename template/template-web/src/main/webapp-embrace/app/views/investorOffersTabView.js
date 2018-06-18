define(["text!templates/investorTab.html", "models/investorProfileModel","backbone","app"],
		function(investorOffersTabPage, investorProfileModel, Backbone, app){

	var InvestorOffersTabView = Backbone.View.extend( {
		initialize: function(){
		},

		el:"#investorOfferDetailsTab",
		self:this,
		model : new investorProfileModel(),
		investorId:{},
		events : {},
		render : function () {
			var thisPtr=this;
			this.template = _.template( investorOffersTabPage );
			this.$el.html("");
			this.$el.html(this.template);
			var profileModel = new investorProfileModel();
			self.model = profileModel;
			console.log("2:"+thisPtr.investorId);
			self.model.set("investorId",thisPtr.investorId);
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
								"sScrollX" : "100%",
								//"scrollCollapse" : true,
								//"paging" : false,
								"sAjaxSource" : app.context()
										+ '/investorProfile/getOffers/',
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
											"mData" : "hil",
											"sTitle" : "HIL"
										},
										{
											"mData" : "ilmOrTkp",
											"sTitle" : "ILM/TKP"
										},
										{
											"mData" : "offerAmount",
											"sTitle" : "OFFER AMOUNT"
										}, {
											"mData" : "offerDate",
											"sTitle" : "OFFER DATE"
										},{
											"mData" : "offerEstimatedClosingDate",
											"sTitle" : "ESTIMATED CLOSING DATE"
										},{
											"mData" : "status",
											"sTitle" : "STATUS"
										}		
										],

								"aoColumnDefs" : [
										{
											"sWidth": "25%", 
											"aTargets": [0],
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
										{ "sWidth": "12%", "aTargets": [ 1 ] },
										{ "sWidth": "13%", "aTargets": [ 2 ] },
										{
											"sWidth": "12%",
											"aTargets" : [ 3 ],
											"mRender" : function(
													data, type,
													full) {
												if(full.offerAmount){
													return '<span class="amount">'+ full.offerAmount+ '</span>';
												}else{
													return '';
												}
											}
										},
										{ "sWidth": "11%", "aTargets": [ 4 ] },
										{ "sWidth": "12%", "aTargets": [ 5 ] },
										{
											"sWidth": "15%", 
											"aTargets" : [ 6 ],
											"mRender" : function(
													data, type,
													full) {
												return '<a href="#opportunity/'
														+ full.opportunityId
														+ '">'
														+ full.status
														+ '</a>';
											}
										}

								],
								
							//----------------------------
							"fnDrawCallback": function () {
							  	$(".amount").formatCurrency({symbol:"$",roundToDecimalPlace:0});
								$(".amountWithOutSymbol").formatCurrency({symbol:"",roundToDecimalPlace:0});
							},
        				     "fnInitComplete": function() {
	    				    	thisPtr.savePageNum();
					    		$(".amount").formatCurrency({symbol:"$",roundToDecimalPlace:0});
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
													 console.log("Failed in investor offer tab View");
													 $('#errorMsg').show();
									                 $('#errorMsg > text').html("Error in fetching investor offer information.");
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
		}
	});
	return InvestorOffersTabView;
});