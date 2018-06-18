define(["backbone","app","text!templates/assetMarketing.html","text!templates/assetMarketingData.html","views/codesView",
			"text!templates/usersDropdown.html",
			"jquery.slimscroll.min"],
		function(Backbone,app,assetMarketingPage,assetMarketingDataPage,codesView,
			usersDropdown){
	var assetMarketingView=Backbone.View.extend({
		initialize: function(options){
			this.marketingStatusView = new codesView({codeGroup:'MARK_STATUS'});
		},
		events : {
			"click #searchMarketingButton":"searchMarketingRecords",
			"keyup #marketing-search-form input":"handleEnterKey"
		},
		self:this,
		pageNumber:{},
		direction:{},
		columnIndex:{},
		el:"#maincontainer",
		render : function () {
			var thisPtr = this;
			if(this.$el.find('#marketing-search-form').length<1){
				thisPtr.template = _.template(assetMarketingPage);
				thisPtr.$el.html("");
				thisPtr.$el.html(thisPtr.template({app:app}));
				thisPtr.marketingStatusView.render({el:$('#leasingStatus'),codeParamName:"leasingStatusId",addBlankFirstOption:true});
				
				if(!thisPtr.leasingAgents){
					 thisPtr.fetchLeasingAgents();
				}
				if(!thisPtr.leasingCoordinators){
					 thisPtr.fetchLeasingCoordinators();
				}
				
				var usersDropdownTemplate = _.template(usersDropdown);
				
				$('#leasingAgentsDropdown').html('');
				$('#leasingAgentsDropdown').html(usersDropdownTemplate({name:'leasingAgent',id:'leasingAgent',users:thisPtr.leasingAgents,addBlankFirstOption:true,investorName:null}));
				$('#leasingCoordinatorsDropdown').html('');
				$('#leasingCoordinatorsDropdown').html(usersDropdownTemplate({name:'leasingCoordinator',id:'leasingCoordinator',users:thisPtr.leasingCoordinators,addBlankFirstOption:true,investorName:null}));
				
			}
			$("#assetMarketingData").html("");
			
			//logic for showing the same page in datatable that the user was last on
			if (('localStorage' in window) && (window['localStorage'] !== null) && app.marketingSearchFormData
					&& 'previousUrl' in localStorage && window.location.hash && (localStorage.getItem('previousUrl').indexOf('marketing/')>-1)){
			    
			    	   localStorage.setItem('previousUrl', Backbone.history.fragment);
			    	   thisPtr.pageNumber=localStorage.getItem('marketingSearchPageNum');
					   thisPtr.direction= localStorage.getItem('marketingSearchDirection');
					   thisPtr.columnIndex=localStorage.getItem('marketingSearchColumnIndex');
			    	   
			    	   thisPtr.setPreviousSearchValues();
			    	   thisPtr.searchMarketingRecords(true);
			    	   //$("#searchMarketingButton").trigger("click");
				       // thisPtr.savePageNum();
			}else{
			       thisPtr.pageNumber=null;
				   thisPtr.direction=null;
				   thisPtr.columnIndex=null;
				   thisPtr.setDefaultSearchValues();
			}
			
			return this;
		},
		setPreviousSearchValues: function(){
			$("#investorName").val(app.marketingSearchFormData.investorName);
         	$("#propertyAddress").val(app.marketingSearchFormData.propertyAddress);
         	$("#marketingType").val(app.marketingSearchFormData.leasingType);
         	$('[name="leasingStatusId"]').val(app.marketingSearchFormData.leasingStatus);
         	$("#leasingAgent").val(app.marketingSearchFormData.leasingAgent);
         	$("#leasingCoordinator").val(app.marketingSearchFormData.leasingCoordinator);
         	if(app.marketingSearchFormData.showCurrentOnly == "Y"){
         		$('input[name="currentLeasings"]').attr('checked', true);
         	}else{
				$('input[name="currentLeasings"]').attr('checked', false);
         	}
		},
		handleEnterKey:function(event) {
	    	 if(event.keyCode == 13){
	    	 	 var a={};
	    	 	 a.target = $("#searchMarketingButton")[0];
	    		 this.searchMarketingRecords(a);
		     }
	    },
	    setDefaultSearchValues: function(){
	    	var thisPtr = this;
	    	$('[name="leasingStatusId"]').val("");
	    	var autoSearchFlag = false;
	    	if($.inArray("Leasing Agent", app.sessionModel.attributes.roles) != -1){
	    		$("#leasingAgent").val(app.sessionModel.attributes.userId);
                autoSearchFlag = true;
	    	}
	    	if($.inArray("Leasing Coordinator", app.sessionModel.attributes.roles) != -1){
	    		$("#leasingCoordinator").val(app.sessionModel.attributes.userId);
                autoSearchFlag = true;
	    	}
	    	if(autoSearchFlag){
            	thisPtr.searchMarketingRecords(true);
            }
	    	/*
	    	$.ajax({
                url: 'assetMarketing/userDetails',
				dataType:'json',
                type: 'GET',
                async:true,
                success: function(res){
                	if(res.isLeasingAgent){
                		$("#leasingAgent").val(res.userId);
                		autoSearchFlag = true;
                	}
                	if(res.isLeasingCoordinator){
                		$("#leasingCoordinator").val(res.userId);
                		autoSearchFlag = true;
                	}
                	if(autoSearchFlag){
                		thisPtr.searchMarketingRecords(true);
                	}
                },
                error: function(res){
                   console.log("error while checking for user details");
                },
                complete: function(){
                }
            }); */
	    },
		reRender : function(thisPtr){
			thisPtr.getDashBoardData();
			_.defer(function () {
				thisPtr.addScrollBar();
				$(".amount").formatCurrency({roundToDecimalPlace: 0});
			});
		},
		getDashBoardData : function(){
			var thisPtr = this;
        	
			$.ajax({
                url: 'assetMarketing/assets',
				dataType:'json',
                type: 'GET',
                async:true,
                success: function(res){
                	self.marketingResponse =res;
                	thisPtr.showDashboardData();
               },
                error: function(res){
                   self.marketingResponse = null;
                   thisPtr.showDashboardFailure();
                },
                complete: function(){
    			  thisPtr.addScrollBar();
    			  $(".amount").formatCurrency({roundToDecimalPlace: 0});
                }
            });
			
			
		},
		
		showDashboardData:function(){
			var thisPtr = this;
            this.dashboardtemplate = _.template(assetMarketingDataPage);
	     	var dashboardEl = this.$el.find('#assetMarketingData');
	     	dashboardEl.html("");
			dashboardEl.html(this.dashboardtemplate({assetMarketingResponse:thisPtr.marketingResponse}));
			
			$('#myAssetMarketingTable').on( 'draw.dt', function () {
				$('.propNameTooltip').tooltip({
					animated: 'fade',
					placement: 'bottom'
				});
			});
			var table =$('#myAssetMarketingTable').dataTable({
        				  "bPaginate":true,
        				  "bInfo":true,
        				  "bFilter":false,
        				  "sScrollX": "100%",
        				  "deferRender": false,
        			      "aoColumnDefs": [
        					               { "sWidth": "23%", "aTargets": [ 0 ], "bSortable": true },
        					               { "sWidth": "10%", "aTargets": [ 1 ], "bSortable": true },
        					               { "sWidth": "12%", "aTargets": [ 2 ], "bSortable": true },
        					               { "sWidth": "11%", "aTargets": [ 3 ], "bSortable": true },
        					               { "sWidth": "11%", "aTargets": [ 4 ], "bSortable": true },
        					               { "sWidth": "11%", "aTargets": [ 5 ], "bSortable": true },
        					               { "sWidth": "11%", "aTargets": [ 6 ], "bSortable": true },
        					               { "sWidth": "11%", "aTargets": [ 7 ], "bSortable": true }
        				               ],
        				               
        				   "fnDrawCallback": function () {
        				   		localStorage.setItem('marketingSearchPageNum',this.fnPagingInfo().iPage);
        						localStorage.setItem('marketingSearchDirection',$("#myAssetMarketingTable").dataTable().fnSettings().aaSorting[0][1]);
        	        			localStorage.setItem('marketingSearchColumnIndex',$("#myAssetMarketingTable").dataTable().fnSettings().aaSorting[0][0]);
        					},
        				     
        				    "fnInitComplete": function() {
        				    }
        			});
        	table.fnSort( [ [4,'desc']] );
        	$('#myAssetMarketingTable_wrapper .dataTables_scrollBody').css({"overflow":"visible","width":"100%"});
			$('#myAssetMarketingTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");
			$("#myAssetMarketingTable_wrapper .dataTables_scrollHead table").css("margin-top","0px");
			$("#myAssetMarketingTable_wrapper .dataTables_scrollBody table").css("margin-top","-1px");
			$('select[name=myAssetMarketingTable_length]').addClass('form-control marg_left5 marg_top5');
			thisPtr.savePageNum();
			$(window).on('resize', function () {
				if($('#myAssetMarketingTable').dataTable() && $('#myAssetMarketingTable').dataTable().length){
					$('#myAssetMarketingTable').dataTable().fnAdjustColumnSizing();
				}
			});
		},
		showDashboardFailure : function(){
		   $('#marketingFailure').show();
		   App.scrollTo($('#marketingFailure'), -200);
		},
		addScrollBar : function(){
             $('.custom-scroll-dash').slimScroll({
                 height: '133px',
                 width: '100%',
                 alwaysVisible: true,
                 railColor: '#d09726',
                 railVisible: true
             });
             $('.custom-scroll-dash2').slimScroll({
                 height: '200px',
                 width: '100%',
                 alwaysVisible: true,
                 railColor: '#d09726',
                 railVisible: true
             });
         },
         
         fetchLeasingCoordinators:function(){
	    	 var self = this;
	    	 $.ajax({
			 		//use following url if filtered records are required
					//url: app.context()+'/assetMarketing/getInitialValues/Leasing Coordinator/Marketing',
					url: app.context()+'/user/Leasing Coordinator', 
	                contentType: 'application/json',
	                async : false,
	                dataType:'json',
	                type: 'GET',
	                success: function(res){
	                	self.leasingCoordinators=res;
	                },
	                error: function(res){
	                	console.log('Error in fetching closing users');
	                }
					
				});
		 },
		 
		 fetchLeasingAgents:function(){
	    	 var self = this;
			 $.ajax({
			 		//use following url if filtered records are required
					//url: app.context()+'/assetMarketing/getInitialValues/Leasing Agent/Marketing',
					url: app.context()+'/user/Leasing Agent',
	                contentType: 'application/json',
	                async : false,
	                dataType:'json',
	                type: 'GET',
	                success: function(res){
	                	self.leasingAgents=res;
	                },
	                error: function(res){
	                	console.log('Error in fetching closing users');
	                }
					
				});
		 },
         
         searchMarketingRecords: function(e){
         	var thisPtr = this;
         	if(e && e.target && (e.target.getAttribute("id") == "searchMarketingButton")){
         		thisPtr.pageNumber=null;
				thisPtr.direction=null;
				thisPtr.columnIndex=null;
				
			}
         	var postData = {};
         	postData.investorName = $("#investorName").val();
         	postData.propertyAddress = $("#propertyAddress").val();
         	postData.leasingType = $("#marketingType").val();
         	postData.leasingStatus = $('[name="leasingStatusId"]').val();
         	postData.leasingAgent = $("#leasingAgent").val();
         	postData.leasingCoordinator = $("#leasingCoordinator").val();
    		postData.pageNum = null;
			postData.pageSize = null;
			postData.sortDir = null;
			postData.sortName = null;
         	
         	if (('localStorage' in window) && window['localStorage'] !== null) {
			        app.marketingSearchFormData= postData;
			}

         	if($('input[name="currentLeasings"]:checked').length > 0){
         		postData.showCurrentOnly = "Y";
         	}else{
         		postData.showCurrentOnly = "N";
         	}
         	
             
             $.blockUI({
	     		baseZ: 999999,
	     		message: '<div><img src="assets/img/loading.gif" /> Just a moment...</div>'
		     });
			 $.ajax({
	                url: app.context()+'/assetMarketing/search',
	                contentType: 'application/json',
	                dataType:'json',
	                type: 'POST',
	                data: JSON.stringify(postData),
	                success: function(res){
	                	$("#assetMarketingData").html("");
	                	thisPtr.marketingResponse =res.aaData;
                		thisPtr.showDashboardData();
	                    $.unblockUI();
	                },
	                error: function(res){
	                    thisPtr.marketingResponse = null;
                   		thisPtr.showDashboardFailure();
	                    $.unblockUI();
	                }
	          });
             
         },
			
		savePageNum: function(){
		   var thisPtr=this;
	       var pageNum=thisPtr.pageNumber;
	       if(pageNum){
	    	   var pNum;
	    	   
	    	   pNum=parseInt(pageNum);
	    	   pNum++;
	    	  
	    	   setTimeout(
	    			   function() 
	    			   {
	    			   	   if(thisPtr.pageNumber && thisPtr.direction){
	    					   $('#myAssetMarketingTable').dataTable().fnSort( [ [thisPtr.columnIndex,thisPtr.direction]] );
	    				   }
	    			   }, 300);
	    	   
	    	   setTimeout(
	    			   function() 
	    			   {
	    			   	   $('.pagination').find('a:contains('+pNum+')').click();
	    			   }, 300);
	    	   
	       }
	       return;
		}

	});
	return assetMarketingView;
});