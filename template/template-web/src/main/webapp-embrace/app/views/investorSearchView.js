define([ "backbone", "app", "text!templates/investors.html","text!templates/investorSearchResults.html","models/tagsModel","text!templates/tagsDropdown.html", "models/investorsSearchModel","views/investorProfileView","text!templates/investorSearchUsersDropdown.html","components-dropdowns", "components-pickers"], 
	function(Backbone, app, investorSearchPage,investorSearchResults, tagsModel, tagsDropdown, investorsSearchModel,investorProfileView,usersDropdown) {
	
		var InvestorsView = Backbone.View.extend({
		initialize : function() {

		},
		events : {
			'click #searchInvestor' : 'searchInvestors',
			'click .single-alphabet' : 'searchInvestorsForEachAlphabets',
			"click a[href='#investorProfile/:investorId']":"ShowInvestorProfilePage",
			"click a[href=#deleteInvestor]":"showDeleteInvestorModal",
		    "click #deleteInvestorConfirmationButton":"deleteInvestor",
		    "click #resetPassword":"resetPassword",
		    'keyup #search_investor_form input':'handleEnterKey'
		},
		self : this,
		el : {},
		model : new investorsSearchModel(),
		investorIdToBeDeleted:{},
		deletebuttonTarget:{},
		render:function(){
			if($.inArray('InvestorView', app.sessionModel.attributes.permissions)!=-1 || $.inArray('InvestorManagement', app.sessionModel.attributes.permissions)!=-1){
				var thisPtr=this;
				thisPtr.template= _.template( investorSearchPage );

				thisPtr.$el.html(thisPtr.template);
				    	console.log("here");
				if(!this.tagsModel){
					this.tagsModel = new tagsModel();
				}
				//object id can be a random non uuid so that all tags are fetched
				console.log('fetching tags');
				this.tagsModel.getAvailableTags(203,'45328',{
					success: function(res){	
						console.log("success in fetchingt tags for asset search");
						self.investorTagsList = res.tags;
					},
					error: function(res){
						console.log("error in fetching tags for asset search");
					}
				});
				//console.log("self.tagsList: " + JSON.stringify(self.assetTagsList));
		    	var tagsDropdownTemplate = _.template(tagsDropdown);
		    	$('#investorSearchTagDropdown').html('');
		    	$('#investorSearchTagDropdown').html(tagsDropdownTemplate({tagsList:self.investorTagsList}));

		    	this.fetchSolutionSpecialistUsers2();
				ComponentsDropdowns.init();
		     	ComponentsPickers.init();

				//-------------------------------
				if (('localStorage' in window) && window['localStorage'] !== null) {
				    if ('previousUrl' in localStorage && window.location.hash) {
				       if(localStorage.getItem('previousUrl').indexOf('investorProfile/')>-1){
				    	   //localStorage.setItem('previousUrl', Backbone.history.fragment);
				    	   	var searchByAlphabet=localStorage.getItem('searchByAlphabet');
				    	   	var searchByCriteria=localStorage.getItem('searchByCriteria');
				    	   	var searchByAll=localStorage.getItem('searchByAll');
				    	   
				    	   if(searchByCriteria.indexOf('true')!=-1){
				    		   this.searchInvestors(null,app.investorSearchFormData);
				    	   }
				    	   else if(searchByAlphabet.indexOf('true')!=-1){
				    		   var currentInvestor=localStorage.getItem('currentInvestor');
				    		   var fname=localStorage.getItem('fname');
				    		   
				    		   this.searchInvestorsForEachAlphabets(event,currentInvestor,fname);
				    	   }
				    	   else if(searchByAll.indexOf('true')!=-1){
				    		   this.showAllInvestors();
				    	   }
				    	   return;
				       }
				       
				    }
				}
				//-------------------------------
				//thisPtr.showAllInvestors();		

			}
		},
		handleEnterKey:function(event) {
	    	 if(event.keyCode == 13){
	    		 this.searchInvestors();
		     }
	    },
	    showAllInvestors : function() {
	    	localStorage.setItem('searchByAlphabet','false');
	    	localStorage.setItem('searchByCriteria','false');
	    	localStorage.setItem('searchByAll','true');
	    	
	    	$('#investorSearchResults').html(
					_.template(investorSearchResults)({
						templateData : null
					}));
			var self = this;
			var searchModel = new investorsSearchModel();
			this.model = searchModel;
			this.showDataTable();
		},
		searchInvestors : function(evt,investorSearchFormData) {
			this.clearAlert();
			
			localStorage.setItem('searchByAlphabet','false');
	    	localStorage.setItem('searchByCriteria','true');
	    	localStorage.setItem('searchByAll','false');
			
	    	$('#investorSearchResults').html(
					_.template(investorSearchResults)({
						templateData : null
					}));

			var self = this;
			var searchModel = new investorsSearchModel();
			var unindexed_array;
			
			if(!investorSearchFormData){
				unindexed_array = $('#search_investor_form').serializeArray();
				app.investorSearchFormData=unindexed_array;
			}
			else{
				unindexed_array=investorSearchFormData;
				
				$.map(unindexed_array, function(n, i){
					var value=n['value'];
					var name=n['name'];
					
					$('#search_investor_form').find('[name='+name+']').val(value);
					
					if(name.indexOf('currentInvestor')>-1){
						$('[name='+name+']').prop('checked', true);
					}
					
				});
				
			}
			
			$.map(unindexed_array, function(n, i) {
				//maps to investor.tblmemberleadowner
				//tbl embrace userid in table is innaccurate so using name instead
				
				var value = n['value'];
				var name = n['name'];

				searchModel.set(name, value);

			});

			this.model = searchModel;
			this.showDataTable();
		},
		searchInvestorsForEachAlphabets : function(event,currentInvestor,fname) {
			//alert("here");
			$('#investorSearchResults').html("");
			//$('#investorSearchResultsTable').dataTable().fnDraw();
			
			localStorage.setItem('searchByAlphabet','true');
	    	localStorage.setItem('searchByCriteria','false');
	    	localStorage.setItem('searchByAll','false');
			
			$('.alert-success').hide();
			$('.alert-danger').hide();
			$('#investorSearchResults').html(
					_.template(investorSearchResults)({
						templateData : null
					}));

			var self = this;
			var searchModel = new investorsSearchModel();
			
			if(!currentInvestor){
				var value = $(event.currentTarget).data('value');
				searchModel.set('fname', value);
	
				var checked = $('#currentInvestor').is(':checked');
				searchModel.set('currentInvestor', checked);
				localStorage.setItem('currentInvestor',checked);
				localStorage.setItem('fname',value);
			}
			else{
				searchModel.set('fname', fname);
				searchModel.set('currentInvestor', currentInvestor);
				if(currentInvestor.indexOf('true')>-1){
					$('[name=currentInvestor]').prop('checked', currentInvestor);
				}
			}

			this.model = searchModel;
			this.showDataTable();

		},
		showDataTable : function() {
			var self = this;
			// ----------------------------DataTable
			// start-----------------------------------
			var oTable = $('#investorSearchResultsTable')
					.dataTable(
							{
								"bServerSide" : true,
								'bProcessing' : true,
								 //'bStateSave': true,
								"bFilter": false,
								//"scrollY" : "300px",
								//"scrollX" : "100%",
								//"scrollCollapse" : true,
								//"paging" : false,
								"sAjaxSource" : app.context()
										+ '/investors/search/',
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
											"mData" : "investorId",
											"sTitle" : "Action"
										},
										{
											"mData" : "investorName",
											"sTitle" : "Investor Name"
										},
										{
											"mData" : "solutionSpecialist",
											"sTitle" : "Solution Specialist"
										},
										{
											"mData" : "createdDate",
											"sTitle" : "Created Date"
										}, {
											"mData" : "active",
											"sTitle" : "Active"
										} ],

								"aoColumnDefs" : [
										{
											"aTargets" : [ 0 ],
											"bSortable": false,
											"mRender" : function(
													data, type,
													full) {
												return '<div class="btn-group" style="text-align: left !important;">'
														+ '<button data-toggle="dropdown" class="btn dropdown-toggle gear2button" type="button"><i class="fa fa-gear"></i></button>'
														+ '<ul role="menu" class="dropdown-menu" style="margin-left: 30px !important; margin-top: -20px !important; padding: 5px;">'
														+ '<li><a id="resetPassword" data-id="'
														+ full.emailAddress
														+ '" class="btn default btn-xs textalignleft"><i class="fa fa-ellipsis-h"></i>Reset Password </a></li>'
														+ '<li><a href="#investorProfile/'
														+ full.investorId
														+ '" class="btn btn-xs green textalignleft"><i class="fa fa-file-o"></i> View Member </a></li>'
														+ '<li><a href="#deleteInvestor" data-toggle="modal" data-id="'
														+ full.investorId
														+ '" title="Delete" class="btn default btn-xs red textalignleft"><i class="fa fa-trash-o"></i> Delete Member</a></li>'
														+ '</ul></div>'
											}
										},
										{
											"aTargets" : [ 1 ],
											"mRender" : function(
													data, type,
													full) {
												return '<a href="#investorProfile/'
														+ full.investorId
														+ '">'
														// + full.investorName
														+ _.template('<%- investorName %>')({investorName:full.investorName })
														+ '</a>';
											}
										}

								],
								
								//----------------------------
								"fnDrawCallback": function () {
									
        							localStorage.setItem('investorSearchPageNum',this.fnPagingInfo().iPage);
        							localStorage.setItem('investorSearchDirection',$("#investorSearchResultsTable").dataTable().fnSettings().aaSorting[0][1]);
        	        				localStorage.setItem('investorSearchColumnIndex',$("#investorSearchResultsTable").dataTable().fnSettings().aaSorting[0][0]);
        	        				localStorage.setItem('investorSearchPageSize',this.fnPagingInfo().iLength);
        	        				localStorage.setItem('investorSearchPageStart',this.fnPagingInfo().iStart);
        	        				localStorage.setItem('investorSearchPageEnd',this.fnPagingInfo().iEnd);
        	        				localStorage.setItem('investorSearchPageTotalRecords',this.fnPagingInfo().iTotal);
        	        				//localStorage.setItem('dataTables_paginate',$('.dataTables_paginate ul').html());
        	        				
        	        				//console.log($("#searchResultTable").dataTable().fnSettings().aaSorting);
									/*alert(this.fnPagingInfo().iPage);
									alert("In draw Call back:"+$('#searchResultTable').dataTable().fnSettings().aaSorting[0][1]);
									alert("In draw Call back:"+$('#searchResultTable').dataTable().fnSettings().aaSorting[0][0]);*/
									
									
        				     },
        				     "fnInitComplete": function() {
        				    	 self.savePageNum();
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
									
									//-000000000000
					            	  if (('localStorage' in window) && window['localStorage'] !== null) {
					      			    if ('previousUrl' in localStorage && window.location.hash) {
					      			    	 if(localStorage.getItem('previousUrl').indexOf('investorProfile/')>-1){
					      			    		 self.previousUrl=localStorage.getItem('previousUrl');
					      			    		 sortCol= localStorage.getItem('investorSearchColumnIndex');
					      			    		 sortDir=localStorage.getItem('investorSearchDirection');
					      			    		 pageNum=localStorage.getItem('investorSearchPageNum');
					      			    		 pageSize=localStorage.getItem('investorSearchPageSize');
					      			    		 self.pageNumber=pageNum;
					      			    		 self.direction=sortDir;
					      			    		 self.columnIndex=sortCol;
					      			    		 
					      			    		 //
					      			    		self.pageStart=localStorage.getItem('investorSearchPageStart');
					      			    		self.pageEnd=localStorage.getItem('investorSearchPageEnd');
			        	        				self.totalRecords=localStorage.getItem('investorSearchPageTotalRecords');
					      			    		 //
					      			    		localStorage.setItem('previousUrl', Backbone.history.fragment);
					      			    	 }
					      			    	 else{
					      			    		self.previousUrl=null;
					      			    	 }
					      			    }
					            	  }
					            	  //-000000000000
									
									
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
													 console.log("Failed in investor search View");
													 $('#generalError').show();
									                 $('#generalError > text').html("Error in searching investor information.");
									                 App.scrollTo($('#generalError'), -200);
									                 $('#generalError').delay(2000).fadeOut(2000);
												}
											});
								}

							});
            $('select[name=investorSearchResultsTable_length]').addClass('form-control');
			$('#investorSearchResultsTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");
		},
		ShowInvestorProfilePage: function (investorId) {
			var id = investorId;
			console.log("ShowInvestorProfilePage :: id = " + id);
			if(!app.investorProfileView){
	    		 app.investorProfileView = new investorProfileView();
			}
			
	    	app.investorProfileView.setElement($('#maincontainer')).render({investmentId:id});
		},
		showDeleteInvestorModal:function(event){
			deletebuttonTarget = event.currentTarget;
			this.investorIdToBeDeleted=$(event.currentTarget).data('id');
			console.log("showDeleteInvestorModal :: id = " + this.investorIdToBeDeleted);
			$('#formInvestordelete').modal("show");
		},
		deleteInvestor:function(event){
			var self=this;
		    var target_row = $(deletebuttonTarget).closest("tr").get(0); // this line did the trick
		    var oTable=$('#investorSearchResultsTable').dataTable();
		    var aPos = oTable.fnGetPosition(target_row); 

			 $.ajax({
	                url: app.context()+'investors/deleteInvestor/'+this.investorIdToBeDeleted,
	                contentType: 'application/json',
	                dataType:'text',
	                type: 'DELETE',
	                success: function(res){
	                	console.log("deleteInvestor :: res is"+res);
	                	if($.parseJSON(res).statusCode=="1"){ 
		                	$("#formInvestordelete").modal('hide');
		                	$('#formInvestordelete').on('hidden.bs.modal',function() {
								 oTable.fnDeleteRow(aPos);
							});
	                	}else{
	 	                   $("#formInvestordelete").modal('hide');
	 	                   $('#deleteActiveInvestorError').show();
	 	                   App.scrollTo($('#deleteActiveInvestorError'), -200);
	 	                   $('#deleteActiveInvestorError').delay(2000).fadeOut(2000);
	                	}
	                },
	                error: function(res){
	                   $("#formInvestordelete").modal('hide');
	                   $('#deleteInvestorError').show();
	                   App.scrollTo($('#deleteInvestorError'), -200);
	                   $('#deleteInvestorError').delay(2000).fadeOut(2000);
	                }
	            });
		},
		resetPassword:function(event){
			var emailId=$(event.currentTarget).data('id');
			var postData =emailId.trim();
			$.ajax({
                url: app.context()+'investors/resetPassword',
                contentType: 'application/json',
                type: 'POST',
                data: postData,
                success: function(res){
                	if(res.statusCode=="1"){ 
	                	$('#resetPasswordSuccess').show();
	     	            $('#resetPasswordSuccess > text').html("Email with new password has been sent.");
	     	            App.scrollTo($('#resetPasswordSuccess'), -200);
	     	            $('#resetPasswordSuccess').delay(2000).fadeOut(2000);
                	}else{
                        $('#resetPasswordError').show();
                        $('#resetPasswordError > text').html("Error in sending password reset email.");
                        App.scrollTo($('#resetPasswordError'), -200);
                        $('#resetPasswordError').delay(2000).fadeOut(2000);
                	}
                },
                error: function(res){
                    $('#resetPasswordError').show();
                    $('#resetPasswordError > text').html("Error in sending password reset email.");
                    App.scrollTo($('#resetPasswordError'), -200);
                    $('#resetPasswordError').delay(2000).fadeOut(2000);
                }
                
            });
		},
		clearAlert : function() {
			$('.alert-success').hide();
			$('.alert-danger').hide();
		},

		fetchSolutionSpecialistUsers2:function(){
	    	 var self = this;
	    	 var promise;
	    	 if(this.solutionSpecialistUsers) {
	    		 var usersDropdownTemplate = _.template(usersDropdown);
	    		 $('#ssDropdown').html('');
	    		 $('#ssDropdown').html(usersDropdownTemplate({name:'solutionSpecialist',id:'solutionSpecialist',users:self.solutionSpecialistUsers,addBlankFirstOption:true}));
	    		 ComponentsDropdowns.init();
	    		 promise={};
	    	 } else {
	    		 promise = $.ajax({
						url: app.context()+'/user/Solution Specialist',
		                contentType: 'application/json',
		                async : true,
		                dataType:'json',
		                type: 'GET',
		                success: function(res){
		                	self.solutionSpecialistUsers=res;
		                	var usersDropdownTemplate = _.template(usersDropdown);
		    				$('#ssDropdown').html('');
		    				$('#ssDropdown').html(usersDropdownTemplate({name:'solutionSpecialist',id:'solutionSpecialist',users:self.solutionSpecialistUsers,addBlankFirstOption:true,investorName:null}));
		    				ComponentsDropdowns.init();
		                },
		                error: function(res){
		                	console.log('Error in fetching solution specialist users');
		                }
						
					});
	    	 }
	    	 return promise;
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
		    		    		   $('#investorSearchResultsTable_info').html('Showing '+ pStart +' to '+self.pageEnd+ ' of '+ self.totalRecords +' entries');
		    		    	   }
		    			   }, 500);
		    	  
		       }
		       return;
		}
			
	});
	return InvestorsView;
});