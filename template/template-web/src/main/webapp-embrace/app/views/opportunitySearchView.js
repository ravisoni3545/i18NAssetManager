define([ "backbone", "app", "text!templates/opportunity-search.html",
         "views/codesView","text!templates/usersDropdown.html","text!templates/assetResults.html","models/opportunitySearchModel",
         "components-dropdowns", "components-pickers"], 
         function(Backbone, app, opportunitySearchPage,codesView,usersDropdown,resultsPage,oppSearchModel) {

	var OpportunitySearchView = Backbone.View.extend({
		initialize : function() {
			this.oppStatusCodesView = new codesView({codeGroup:'OPP_STATUS'});
		},
		events : {
			//'click #searchInvestor' : 'searchInvestors',
			'click #searchOpportunityButton':'searchOpportunities',
			"click .sorting":'setSortingFlag',
			"click .sorting_desc":'setSortingFlag',
			"click .sorting_asc":'setSortingFlag',
		    'keyup #search-form input':'handleEnterKey'
		},
		el:"#maincontainer",

		render:function(){
			var thisPtr=this;
			thisPtr.$el.html("");
			thisPtr.$el.html(_.template( opportunitySearchPage )());
			this.oppStatusCodesView.render({el:$('#opportunityStatus'),codeParamName:"opportunityStatusId",addBlankFirstOption:true});

			thisPtr.fetchIlmUsers();
			thisPtr.fetchSolutionSpecialistUsers();

			var usersDropdownTemplate = _.template(usersDropdown);
			$('#ilmDropdown').html('');
			$('#ilmDropdown').html(usersDropdownTemplate({name:'ilmUserId',id:'ilmUserId',users:thisPtr.ilmUsers,addBlankFirstOption:true,investorName:null}));

			var usersDropdownTemplate = _.template(usersDropdown);
			$('#ssDropdown').html('');
			$('#ssDropdown').html(usersDropdownTemplate({name:'ssUserId',id:'ssUserId',users:thisPtr.solutionSpecialistUsers,addBlankFirstOption:true,investorName:null}));
			
			if(app.opportunitySearchView.filterResultByUser==true){
				if($.inArray('Solution Specialist', app.sessionModel.attributes.roles)>-1){
					$("#ssUserId").val(app.sessionModel.attributes.userId);
				}
				
				if($.inArray('ILM', app.sessionModel.attributes.roles)>-1){
					$("#ilmUserId").val(app.sessionModel.attributes.userId);
				}
				app.opportunitySearchView.filterResultByUser=false;
				
			}
			//-------------------------------
			if (('localStorage' in window) && window['localStorage'] !== null) {
			    if ('previousUrl' in localStorage && window.location.hash) {
			       if(localStorage.getItem('previousUrl').indexOf('opportunity/')>-1){
			    	   //localStorage.setItem('previousUrl', Backbone.history.fragment);
			    	  
			    	   this.searchOpportunities(null,app.opportunitySearchFormData);
			       }
			       else if($.inArray('Solution Specialist', app.sessionModel.attributes.roles)>-1 ||
								$.inArray('ILM', app.sessionModel.attributes.roles)>-1){
							this.searchOpportunities(null,null);
			       }
			       
			    }else if($.inArray('Solution Specialist', app.sessionModel.attributes.roles)>-1 ||
							$.inArray('ILM', app.sessionModel.attributes.roles)>-1){
						this.searchOpportunities(null,null);
			    }
			    
			    //alert("In render:"+ self.pageNumber);
			}else if($.inArray('Solution Specialist', app.sessionModel.attributes.roles)>-1 ||
						$.inArray('ILM', app.sessionModel.attributes.roles)>-1){
					this.searchOpportunities(null,null);
		    }
			//-------------------------------

		},

		searchOpportunities : function(evt,opportunitySearchFormData){
			$('#renderOpportunitySearchResult').html(_.template( resultsPage )({templateData:null}));
			
			
			var self=this;
			var formData;
			var searchModel= new oppSearchModel();
			var checkFlag="false";
			//
			if(!opportunitySearchFormData){
								
				formData= $('#search-form').serializeArray();
				if (('localStorage' in window) && window['localStorage'] !== null) {
			        app.opportunitySearchFormData= formData;
			    }
				
			}
			else{
				formData=app.opportunitySearchFormData;
				
				$.map(formData, function(n, i){
					var value=n['value'];
					var name=n['name'];
					$('#search-form').find('[name='+name+']').val(value);
										
				});
			}

			$.map(formData, function(n, i){
				var value=n['value'];
				var name=n['name'];
			
				searchModel.set(name,value);

			});

			this.model=searchModel;
			//----------------------------DataTable start-----------------------------------
			var oTable=$('#searchResultTable').dataTable({
				"bServerSide": true,
				"bFilter": false,
				'bProcessing': true,
				//"scrollY": "300px",
		        //"scrollX": "100%",
		        //"scrollCollapse": true,
		        //"paging": false,
				"sAjaxSource": app.context()+ '/opportunity/search/',
				"sAjaxData" : 'aaData',
				//"pagingType": "simple",
				
				"aoColumns": [{"mData": "investorName","sTitle": "Investor"},
							  {"mData": "ssName","sTitle": "Solutions Manager"},
						//	  {"mData": "ilmZones","sTitle":"Investment Zones"},
//				              { "mData": "leadCreationDate","sTitle": "Lead Creation Date" },
				              { "mData": "dateCreated","sTitle": "Date Created"},
//				              { "mData": "dateClosed","sTitle": "Date Closed"},
				              { "mData": "opportunityStatus","sTitle": "Opportunity Status"},
				              { "mData": "opportunityId","sTitle": "View Details"}
				              ],
				 
				"aoColumnDefs": [{
									"bSortable": false,
									"aTargets": [4],
									"mRender": function (data, type, full) {
										return '<a href="#opportunity/'+full.opportunityId+'">View Details</a>';
									}
								},
				                {
									"aTargets": [3],
									"mRender": function (data, type, full) {
										return full.opportunityStatus;
									}
								},
								{
									"aTargets": [0],
									"mRender": function (data, type, full) {
										return '<a title="View Investor Profile" href="#investorProfile/'+full.investorId+'"><img alt="Investor Image" src="assets/img/user1.png" width="18" height="13"></a>'
										+ full.investorName;
									}
								}
								
								],
			//----------------------------
								"fnDrawCallback": function () {
									
        							localStorage.setItem('opportunitySearchPageNum',this.fnPagingInfo().iPage);
        							localStorage.setItem('opportunitySearchDirection',$("#searchResultTable").dataTable().fnSettings().aaSorting[0][1]);
        	        				localStorage.setItem('opportunitySearchColumnIndex',$("#searchResultTable").dataTable().fnSettings().aaSorting[0][0]);
        	        				localStorage.setItem('opportunitySearchPageSize',this.fnPagingInfo().iLength);
        	        				localStorage.setItem('opportunitySearchPageStart',this.fnPagingInfo().iStart);
        	        				localStorage.setItem('opportunitySearchPageEnd',this.fnPagingInfo().iEnd);
        	        				localStorage.setItem('opportunitySearchPageTotalRecords',this.fnPagingInfo().iTotal);
        	        				
        	        				//console.log($("#searchResultTable").dataTable().fnSettings().aaSorting);
									/*alert(this.fnPagingInfo().iPage);
									alert("In draw Call back:"+$('#searchResultTable').dataTable().fnSettings().aaSorting[0][1]);
									alert("In draw Call back:"+$('#searchResultTable').dataTable().fnSettings().aaSorting[0][0]);
									*/
									
									
        				     },
        				     "fnInitComplete": function() {
        				    	 self.savePageNum();
        			         },
			//----------------------------
				
			  
		      "fnServerData": function(sSource, aoData, fnCallback, oSettings) {
				            	  var paramMap = {};
				            	  for ( var i = 0; i < aoData.length; i++) {
				            		  paramMap[aoData[i].name] = aoData[i].value;
				            	  }
				            	  //var pageSize = paramMap.iDisplayLength;
				            	  var pageSize = oSettings._iDisplayLength;
				            	  var start = paramMap.iDisplayStart;
				            	 				            	  
				            	  var pageNum = (start / pageSize);
				            	    			            	      
				            	  /*if(self.sortingClicked===true){
				            		  if(self.currentPageNum>0){
				            			  pageNum=self.currentPageNum;
				            		  }
				            	  }
				            	  else{
				            		  self.currentPageNum=pageNum;
					              }*/
				            	  self.sortingClicked=false;
  				            	  var sortCol = paramMap.iSortCol_0;
				            	  var sortDir = paramMap.sSortDir_0;
				            	  
				            	//-000000000000
				            	  if (('localStorage' in window) && window['localStorage'] !== null) {
				      			    if ('previousUrl' in localStorage && window.location.hash) {
				      			    	 if(localStorage.getItem('previousUrl').indexOf('opportunity/')>-1 || localStorage.getItem('previousUrl').indexOf('investorProfile/')>-1){
				      			    		 self.previousUrl=localStorage.getItem('previousUrl');
				      			    		 sortCol= localStorage.getItem('opportunitySearchColumnIndex');
				      			    		 sortDir=localStorage.getItem('opportunitySearchDirection');
				      			    		 pageNum=localStorage.getItem('opportunitySearchPageNum');
				      			    		 pageSize=localStorage.getItem('opportunitySearchPageSize');
				      			    		 self.pageNumber=pageNum;
				      			    		 self.direction=sortDir;
				      			    		 self.columnIndex=sortCol;
				      			    		 
				      			    		
				      			    		 self.pageStart=localStorage.getItem('opportunitySearchPageStart');
				      			    		 self.pageEnd=localStorage.getItem('opportunitySearchPageEnd');
		        	        				 self.totalRecords=localStorage.getItem('opportunitySearchPageTotalRecords');
				      			    		
				      			    		 localStorage.setItem('previousUrl', Backbone.history.fragment);
				      			    	 }
				      			    	else{
				      			    		self.previousUrl=null;
				      			    	 }
				      			    }
				            	  }
				            	  //-000000000000
				            	  
				            	  
				            	  var sortName = paramMap['mDataProp_' + sortCol];
				            	  
				            	  self.model.set("sortDir",sortDir);
				            	  self.model.set("sortName",sortName);
				            	  self.model.set("pageNum",pageNum);
				            	  self.model.set("pageSize",pageSize);
				            	  $.ajax({
				            		  "dataType": 'json',
				            		  "contentType": "application/json",
				            		  "type": "POST",
				            		  "url": sSource,
				            		  "data": JSON.stringify(self.model.attributes),
				            		  "success": function(res){
				            			  res.iTotalRecords = res.iTotalRecords;
				            			  res.iTotalDisplayRecords = res.iTotalRecords;
				            			  
				            			  //paramMap.iDisplayStart=
				            			  fnCallback(res);
				            		  },
				            		  "error": function(res){
				            			  console.log("error");
				            		  }
				            	  });
				              }
			});
			//--------------------------DataTable end-------------------------------------
		$('select[name=searchResultTable_length]').addClass('form-control');
			$('#searchResultTable_wrapper .dataTable').addClass("tablegreen");
		},

		fetchIlmUsers:function(){
			var self=this;
			$.ajax({
				url: app.context()+'/user/ILM',
				contentType: 'application/json',
				async : false,
				dataType:'json',
				type: 'GET',
				success: function(res){
					self.ilmUsers=res;
				},
				error: function(res){
					console.log('Error in fetching ILM users');
				}

			});
		},
		fetchSolutionSpecialistUsers:function(){
			var self=this;
			$.ajax({
				url: app.context()+'/user/Solution Specialist',
				contentType: 'application/json',
				async : false,
				dataType:'json',
				type: 'GET',
				success: function(res){
					self.solutionSpecialistUsers=res;
				},
				error: function(res){
					console.log('Error in fetching solution specialist users');
				}

			});
		},
		
		setSortingFlag : function(){
			this.sortingClicked=true;
		},
		
		savePageNum: function(){
			var self=this;
		       var pageNum=this.pageNumber;
		       if(pageNum && self.previousUrl){
		    	   var pNum;
		    	   
		    	   pNum=parseInt(pageNum);
		    	   pNum++;
		    	   
		    	   setTimeout(
		    			   function() 
		    			   {
		    				   $('.pagination').find('.active').removeClass('active');
		    		    	   $('.pagination').find('a:contains('+pNum+')').parent().addClass('active');
		    		    	   if(self.pageStart){
		    		    		   var pStart=parseInt(self.pageStart);
		    		    		   pStart++;
		    		    		   $('#searchResultTable_info').html('Showing '+ pStart +' to '+self.pageEnd+ ' of '+ self.totalRecords +' entries');
		    		    	   }
		    			   }, 1000);
		    	  
		    	  
		       }
		       return;
		},
		handleEnterKey:function(event) {
	    	 if(event.keyCode == 13){
	    		 this.searchOpportunities(null,null);
		     }
	    }

	});
	return OpportunitySearchView;
});