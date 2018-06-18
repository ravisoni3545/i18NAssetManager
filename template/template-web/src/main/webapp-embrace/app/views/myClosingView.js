define( ["backbone","app","models/myClosingModel",
         "collections/myClosingCollection","text!templates/myClosing.html","views/codesView","text!templates/closingResults.html","text!templates/usersDropdown.html" ,"components-dropdowns","components-pickers"],
		function(Backbone,app,myclosingModel,myClosingCollection,myClosingPage,codesView,closingResultsPage,usersDropdown){
	
	var MyClosingView = Backbone.View.extend( {
		initialize: function(options){
			this.navPermission = options.navPermission;
			//this.fetchClosingStatuses();
//			this.codesView = new codesView({codeGroup:'CLOS_STATUS'});
			this.closDurationView = new codesView({codeGroup:'CLOS_DURATN'});
			this.finCodesView = new codesView({codeGroup:'FIN_TYPE'});
			this.dealCodesView = new codesView({codeGroup:'DEAL_TYPE'});
			this.closingStatusCodesView = new codesView({codeGroup:'CLOS_STATUS'});
		},
		events:{
			"click #closingSearchSubmit":"fetchMyClosingSearch",
			'keyup #closingSearchForm input':'handleEnterKey'
		},
		el:"#maincontainer",
		self:this,
		model:myclosingModel,
		pageNumber:{},
		direction:{},
		columnIndex:{},
		render : function () {
			var self = this;
			if(this.$el.find('#closingSearchForm').length<1) {
				this.template = _.template(myClosingPage);
				this.$el.html("");
				self.$el.html(self.template({closingStatuses:self.closingStatuses}));
//				if(!this.closingStatuses){
//					this.fetchClosingStatuses();
//				}
				self.closingStatusCodesView.render({el:$('#closingStatusDiv'),codeParamName:"closingStatusIds",addBlankFirstOption:false,multiple:true});
				self.closDurationView.render({el:$('#closingDurationDiv'),codeParamName:"closingDuration",addBlankFirstOption:true});
				self.finCodesView.render({el:$('#financingTypeDiv'),codeParamName:"financingType",addBlankFirstOption:true});
				self.dealCodesView.render({el:$('#dealTypeDiv'),codeParamName:"dealType",addBlankFirstOption:true});
				this.fetchClosingUsers();
				this.fetchIlmUsers();
				this.fetchSolutionSpecialistUsers();
				ComponentsDropdowns.init();
		     	ComponentsPickers.init();
			}
			$('#searchResults').html("");
			
			//-------------------------------
			if (('localStorage' in window) && window['localStorage'] !== null) {
			    if ('previousUrl' in localStorage && window.location.hash) {
			       if(localStorage.getItem('previousUrl').indexOf('closing/')>-1){
			    	   localStorage.setItem('previousUrl', Backbone.history.fragment);
			    	   
			    	   self.pageNumber=localStorage.getItem('closingSearchPageNum');
					   self.direction= localStorage.getItem('closingSearchDirection');
					   self.columnIndex=localStorage.getItem('closingSearchColumnIndex');
			    	   
			    	   this.fetchMyClosing(false,app.closingSearchFormData);
			    	   this.savePageNum();
			       }else {
			    	   this.handleDefaultSearch();
				   }
			       
			    }else {
			    	   this.handleDefaultSearch();
				}
			    
			}else {
		    	   this.handleDefaultSearch();
			}
			//-------------------------------
	     	return this;
		},
		handleDefaultSearch:function(){
			var self = this;
			self.pageNumber=null;
			self.direction=null;
			self.columnIndex=null;
			if($.inArray('Closer', app.sessionModel.attributes.roles)>-1){
		    	$("#closer").val(app.sessionModel.attributes.userId);
		    	$("#currentClosings").prop("checked",true);
		    	self.fetchMyClosing(false,null);
			}
		},
		handleEnterKey:function(event) {
	    	 if(event.keyCode == 13){
	    		 this.fetchMyClosingSearch();
		     }
	    },
		fetchMyClosing:function(filter,closingFormData){
			
			jQuery.fn.dataTableExt.oSort['usdate-asc']  = function(a,b) {
				if (a && b){
				    var usDatea = a.split('-'); 
				    var usDateb = b.split('-'); 
	
				    var x = (usDatea[2] + usDatea[0] + usDatea[1]) * 1;
				    var y = (usDateb[2] + usDateb[0] + usDateb[1]) * 1;
	
				    return ((x < y) ? -1 : ((x > y) ?  1 : 0));
				}else if(a){
					return 1;
				}else{
					return  -1;
				}
			};

			jQuery.fn.dataTableExt.oSort['usdate-desc'] = function(a,b) {
				if (a && b){
				    var usDatea = a.split('-'); 
				    var usDateb = b.split('-'); 
	
				    var x = (usDatea[2] + usDatea[0] + usDatea[1]) * 1;
				    var y = (usDateb[2] + usDateb[0] + usDateb[1]) * 1;
	
				    return ((x < y) ? 1 : ((x > y) ?  -1 : 0));
				}else if(a){
					return -1;
				}else{
					return 1;
				}
			};
			
			var thisPtr=this;
//			this.render();
			var formData;
			
			if(filter) {
				this.userFilter=true;
//				$("#closer").val(app.sessionModel.attributes.userId);
				$("#currentClosings").prop("checked",true);
			} 
			else {
				this.userFilter=false;
			}
			
			if(!closingFormData){
				formData= $('#closingSearchForm').serializeArray();
				var closingStatusIds =  $('[name="closingStatusIds"]').val();
				$.map(formData, function(n, i){
					var value=n['value'];
					var name=n['name'];
					if(name.indexOf('closingStatusIds')>-1){
						n['value']=closingStatusIds;
					}
				});
				if (('localStorage' in window) && window['localStorage'] !== null) {
			        app.closingSearchFormData= formData;
			    }
			}
			else{
				formData=closingFormData;
				
				$.map(formData, function(n, i){
					var value=n['value'];
					var name=n['name'];
					$('#closingSearchForm').find('[name='+name+']').val(value);
					
					if(name.indexOf('currentClosings')>-1){
						if(value=="on"){
							$('[name='+name+']').prop('checked', true);
						}
					}
					else if(name.indexOf('currentMonthClosings')>-1){
						if(value=="on"){
							$('[name='+name+']').prop('checked', true);
						}
					}
					
				});
			}
				
			var searchModel= new myclosingModel();
				
			$.map(formData, function(n, i){
					var value=n['value'];
					var name=n['name'];
	
					searchModel.set(name,value);
			});
			searchModel.set('userFilter',this.userFilter);
			if(this.userFilter) {
					searchModel.set('currentClosings','on');
			}
			this.model = searchModel;
			
    		thisPtr.collection.fetchMyClosings(this.model.attributes,{
                success: function (res) {
                	thisPtr.collection.reset();
                	_(res).each(function(obj) {
                		thisPtr.collection.add(new myclosingModel(obj));
                	});
                	thisPtr.resultsTemplate = _.template(closingResultsPage);
        			var templateData=app.myClosingView.collection.toJSON();
        			$('#searchResults').html("");
        			$('#searchResults').html(thisPtr.resultsTemplate({templateData:templateData}));

        			$('#myClosingsTable').on( 'draw.dt', function () {
						$('.propNameTooltip').tooltip({
							animated: 'fade',
							placement: 'bottom'
						});
					});
        			var table =$('#myClosingsTable').dataTable({
        				  "sScrollX": "100%",
        				  "bPaginate":true,
        				  "bInfo":true,
        				  "bFilter":false,
        				  "bAutoWidth": false,
        				  "deferRender": true,
        			      "aoColumnDefs": [
        					               { "sWidth": "30%", "aTargets": [ 0 ], "bSortable": true },
        					               { "sWidth": "15%","aTargets": [ 1 ], "bSortable": true },
        					               { "sWidth": "11%","sType" : "usdate","aTargets": [ 2 ], "bSortable": true },
        					               { "sWidth": "11%","sType" : "usdate","aTargets": [ 3 ], "bSortable": true },
        					               { "sWidth": "12%","sType" : "usdate","aTargets": [ 4 ], "bSortable": true },
        					               { "sWidth": "20%","aTargets": [ 5 ], "bSortable": true }
        				               ],
        				               
        				   "fnDrawCallback": function () {
        							localStorage.setItem('closingSearchPageNum',this.fnPagingInfo().iPage);
        							localStorage.setItem('closingSearchDirection',$("#myClosingsTable").dataTable().fnSettings().aaSorting[0][1]);
        	        				localStorage.setItem('closingSearchColumnIndex',$("#myClosingsTable").dataTable().fnSettings().aaSorting[0][0]);
        				     },
        				     
//        				     "fnInitComplete": function() {
//        				    	 thisPtr.savePageNum();
//        			         }
        			});
        			
        			
        			
        			table.fnSort( [ [4,'desc']] );
        			$('#myClosingsTable thead tr th:nth-child(5)').removeClass("sorting_desc sorting_asc").addClass("sorting");
        			$('#myClosingsTable_wrapper .dataTables_scrollBody').css({"overflow":"visible","width":"100%"});
					$('#myClosingsTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");
					$("#myClosingsTable_wrapper .dataTables_scrollHead table").css("margin-top","0px");
					$("#myClosingsTable_wrapper .dataTables_scrollBody table").css("margin-top","-1px");
					$('select[name=myClosingsTable_length]').addClass('form-control marg_left5 marg_top5');
        			
					$(window).on('resize', function () {
						if($('#myClosingsTable').dataTable() && $('#myClosingsTable').dataTable().length){
							$('#myClosingsTable').dataTable().fnAdjustColumnSizing();
						}
					});

        			/*$('#myClosingsTable').dataTable().bind('sort', function (e, dt) {
        				localStorage.setItem('closingSearchDirection',dt.aaSorting[0][1]);
        				localStorage.setItem('closingSearchColumnIndex',dt.aaSorting[0][0]);
        			});*/
        			
        			ComponentsPickers.init();
        			ComponentsDropdowns.init();
                	//thisPtr.render();
        			
                },
                error   : function (res) {
                	//thisPtr.render();
                	console.log('error in fetching closings '+res);
                }
            });
    		return;
		},
		fetchMyClosingSearch: function() {
			this.fetchMyClosing(this.userFilter);
		},
	     fetchIlmUsers:function(){
	    	 var self = this;
	    	 var promise;
	    	 if(this.ilmUsers) {
	    		 var usersDropdownTemplate = _.template(usersDropdown);
 				 $('#ilmDropdown').html('');
 				 $('#ilmDropdown').html(usersDropdownTemplate({name:'ilm',id:'ilm',users:self.ilmUsers,addBlankFirstOption:true,investorName:null}));
 				 promise={};
	    	 } else {
				 promise = $.ajax({
						url: app.context()+'/user/ILM',
		                contentType: 'application/json',
		                async : true,
		                dataType:'json',
		                type: 'GET',
		                success: function(res){
		                	self.ilmUsers=res;
		                	var usersDropdownTemplate = _.template(usersDropdown);
		    				$('#ilmDropdown').html('');
		    				$('#ilmDropdown').html(usersDropdownTemplate({name:'ilm',id:'ilm',users:self.ilmUsers,addBlankFirstOption:true,investorName:null}));
		                },
		                error: function(res){
		                	console.log('Error in fetching ILM users');
		                }
						
					});
	    	 }
	    	 return promise;
		 },
		 fetchSolutionSpecialistUsers:function(){
	    	 var self = this;
	    	 var promise;
	    	 if(this.solutionSpecialistUsers) {
	    		 var usersDropdownTemplate = _.template(usersDropdown);
	    		 $('#ssDropdown').html('');
	    		 $('#ssDropdown').html(usersDropdownTemplate({name:'solutionSpecialist',id:'solutionSpecialist',users:self.solutionSpecialistUsers,addBlankFirstOption:true,investorName:null}));
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
		 fetchClosingUsers:function(){
	    	 var self = this;
	    	 var promise;
	    	 if(this.closingUsers) {
	    		 var usersDropdownTemplate = _.template(usersDropdown);
	    		 $('#closersDropdown').html('');
	    		 $('#closersDropdown').html(usersDropdownTemplate({name:'closer',id:'closer',users:self.closingUsers,addBlankFirstOption:true,investorName:null}));
	    		 promise={};
	    	 } else {
	    		 promise = $.ajax({
						url: app.context()+'/user/Closer',
		                contentType: 'application/json',
		                async : true,
		                dataType:'json',
		                type: 'GET',
		                success: function(res){
		                	self.closingUsers=res;
		                	var usersDropdownTemplate = _.template(usersDropdown);
		    				$('#closersDropdown').html('');
		    				$('#closersDropdown').html(usersDropdownTemplate({name:'closer',id:'closer',users:self.closingUsers,addBlankFirstOption:true,investorName:null}));
		                },
		                error: function(res){
		                	console.log('Error in fetching closing users');
		                }
						
					});
	    	 }
	    	 return promise;
		 },
		 
		 render2 : function (val,type,userId,status) {
			 	var self = this;
				if(this.$el.find('#closingSearchForm').length<1) {
					this.template = _.template(myClosingPage);
					this.$el.html("");
					//this.fetchClosingStatuses();
					this.$el.html(this.template({closingStatuses:self.closingStatuses}));
//					this.codesView.render({el:$('#closingStatus'),codeParamName:"closingStatusIds",addBlankFirstOption:true,multiSelect:true});
					
					this.closingStatusCodesView.render({el:$('#closingStatusDiv'),codeParamName:"closingStatusIds",addBlankFirstOption:false,multiple:true});
					this.closDurationView.render({el:$('#closingDurationDiv'),codeParamName:"closingDuration",addBlankFirstOption:true});
					this.finCodesView.render({el:$('#financingTypeDiv'),codeParamName:"financingType",addBlankFirstOption:true});
					this.dealCodesView.render({el:$('#dealTypeDiv'),codeParamName:"dealType",addBlankFirstOption:true});
					
					p1=this.closingStatusCodesView.promise;
					p2=this.closDurationView.promise;
					p3=this.finCodesView.promise;
					p4=this.dealCodesView.promise;
					p5=this.fetchClosingUsers();
					p6=this.fetchIlmUsers();
					p7=this.fetchSolutionSpecialistUsers();
					$.when(p1,p2,p3,p4,p5,p6,p7)
				        .done(function () {
				            console.log('all promises resolved');
				            if(type=="totalInvestment" && status=="Completed") {
								$('[name="closingStatusIds"] option').each(function() {
									  if($(this).text() == "Completed" || $(this).text() == "Closing Completed") {
									    $(this).attr('selected', 'selected');            
									  }                        
								});
							}else if(type=="totalRevenue"){
								if(status=="Completed"){
									$('[name="closingStatusIds"] option').each(function() {
										  if($(this).text() == "Completed" || $(this).text() == "Closing Completed") {
										    $(this).attr('selected', 'selected');            
										  }                        
									});
								}
							}
							
							if(type=="closingDuration"){
								var selectedVal=$("#closingDurationDiv").find('select').find("option:contains("+val+")").val();
								$("#closingDurationDiv").find('select').val(selectedVal);
							}
							else if(type=="financingType"){
								if(status=="Completed"){
									$('[name="closingStatusIds"] option').each(function() {
										  if($(this).text() == "Completed" || $(this).text() == "Closing Completed") {
										    $(this).attr('selected', 'selected');            
										  }                        
									});
								}
								$('[name="financingType"] option').each(function() {
									if($(this).text()==val){
										 $(this).attr('selected', 'selected'); 
									}
								});
							}
							else if(type=="dealType"){
								if(status=="Completed"){
									$('[name="closingStatusIds"] option').each(function() {
										  if($(this).text() == "Completed" || $(this).text() == "Closing Completed") {
										    $(this).attr('selected', 'selected');            
										  }                        
									});
								}
								var selectedVal=$("#dealTypeDiv").find('select').find("option:contains("+val+")").val();
								$("#dealTypeDiv").find('select').val(selectedVal);
							}
							else if(type=="closer"){
								if(status=="Completed"){
									$('[name="closingStatusIds"] option').each(function() {
										  if($(this).text() == "Completed" || $(this).text() == "Closing Completed") {
										    $(this).attr('selected', 'selected');            
										  }                        
									});
								}
								var selectedVal=$("#closersDropdown").find('select').find("option:contains("+val+")").val();
								$("#closersDropdown").find('select').val(selectedVal);
							}
							else if(type=="ilmProperties"){
								if(status=="Completed"){
									$('[name="closingStatusIds"] option').each(function() {
										  if($(this).text() == "Completed" || $(this).text() == "Closing Completed") {
										    $(this).attr('selected', 'selected');            
										  }                        
									});
								}
								var selectedVal=$("#ilmDropdown").find('select').find("option:contains("+val+")").val();
								$("#ilmDropdown").find('select').val(selectedVal);
							}
							else if(type=="solutionSpecialistProperties"){
								if(status=="Completed"){
									$('[name="closingStatusIds"] option').each(function() {
										  if($(this).text() == "Completed" || $(this).text() == "Closing Completed") {
										    $(this).attr('selected', 'selected');            
										  }                        
									});
								}
								var selectedVal=$("#ssDropdown").find('select').find("option:contains("+val+")").val();
								$("#ssDropdown").find('select').val(selectedVal);
							}
				            self.fetchMyClosing(false);
				        })
				        .fail(function () {
				            console.log('One of our promises failed');
				            self.fetchMyClosing(false);
				        });
					
//					var usersDropdownTemplate = _.template(usersDropdown);
//					$('#closersDropdown').html('');
//					$('#closersDropdown').html(usersDropdownTemplate({name:'closer',id:'closer',users:this.closingUsers,addBlankFirstOption:true,investorName:null}));
//					 
//					$('#ilmDropdown').html('');
//					$('#ilmDropdown').html(usersDropdownTemplate({name:'ilm',id:'ilm',users:this.ilmUsers,addBlankFirstOption:true,investorName:null}));
//					 
//					$('#ssDropdown').html('');
//					$('#ssDropdown').html(usersDropdownTemplate({name:'solutionSpecialist',id:'solutionSpecialist',users:this.solutionSpecialistUsers,addBlankFirstOption:true,investorName:null}));
					 
					ComponentsDropdowns.init();
			     	ComponentsPickers.init();
				}
				
				if(type=="closedProperties"){
					$('#currentClosings').prop('checked',true);
					
					$("#closersDropdown").find('select').val(userId);
					$("#ilmDropdown").find('select').val(userId);
					$("#ssDropdown").find('select').val(userId);
				}
				else if(type=="scheduled"){
					$('#currentClosings').prop('checked',true);
					$('#currentMonthClosings').prop('checked',true);
					
					$("#closersDropdown").find('select').val(userId);
					$("#ilmDropdown").find('select').val(userId);
					$("#ssDropdown").find('select').val(userId);
				}
				else if(type=="totalInvestment"){
					if(status=="Closing"){
						$('#currentClosings').prop('checked',true);
					}else if(status=="Completed"){
						$('[name="closingStatusIds"] option').each(function() {
							  if($(this).text() == "Completed" || $(this).text() == "Closing Completed") {
							    $(this).attr('selected', 'selected');            
							  }                        
						});
					}
					
					$("#closersDropdown").find('select').val(userId);
					$("#ilmDropdown").find('select').val(userId);
					$("#ssDropdown").find('select').val(userId);
				}else if(type=="totalRevenue"){
					if(status=="Closing"){
						$('#currentClosings').prop('checked',true);
					}else if(status=="Completed"){
						$('[name="closingStatusIds"] option').each(function() {
							  if($(this).text() == "Completed" || $(this).text() == "Closing Completed") {
							    $(this).attr('selected', 'selected');            
							  }                        
						});
					}
					
					$("#closersDropdown").find('select').val(userId);
					$("#ilmDropdown").find('select').val(userId);
					$("#ssDropdown").find('select').val(userId);
				}
				
				if(type=="closingDuration"){
					$('#currentClosings').prop('checked',true);
					var selectedVal=$("#closingDurationDiv").find('select').find("option:contains("+val+")").val();
					$("#closingDurationDiv").find('select').val(selectedVal);
					
					$("#closersDropdown").find('select').val(userId);
					$("#ilmDropdown").find('select').val(userId);
					$("#ssDropdown").find('select').val(userId);
				}
				else if(type=="financingType"){
					if(status=="Closing"){
						$('#currentClosings').prop('checked',true);
					}else if(status=="Completed"){
						$('[name="closingStatusIds"] option').each(function() {
							  if($(this).text() == "Completed" || $(this).text() == "Closing Completed") {
							    $(this).attr('selected', 'selected');            
							  }                        
						});
					}
					
					$('[name="financingType"] option').each(function() {
						if($(this).text()==val){
							 $(this).attr('selected', 'selected'); 
						}
					});
					
					$("#closersDropdown").find('select').val(userId);
					$("#ilmDropdown").find('select').val(userId);
					$("#ssDropdown").find('select').val(userId);
				}
				else if(type=="dealType"){
					if(status=="Closing"){
						$('#currentClosings').prop('checked',true);
					}else if(status=="Completed"){
						$('[name="closingStatusIds"] option').each(function() {
							  if($(this).text() == "Completed" || $(this).text() == "Closing Completed") {
							    $(this).attr('selected', 'selected');            
							  }                        
						});
					}
					
					var selectedVal=$("#dealTypeDiv").find('select').find("option:contains("+val+")").val();
					$("#dealTypeDiv").find('select').val(selectedVal);
					
					$("#closersDropdown").find('select').val(userId);
					$("#ilmDropdown").find('select').val(userId);
					$("#ssDropdown").find('select').val(userId);
				}
				else if(type=="closer"){
					if(status=="Closing"){
						$('#currentClosings').prop('checked',true);
					}else if(status=="Completed"){
						$('[name="closingStatusIds"] option').each(function() {
							  if($(this).text() == "Completed" || $(this).text() == "Closing Completed") {
							    $(this).attr('selected', 'selected');            
							  }                        
						});
					}
					
					var selectedVal=$("#closersDropdown").find('select').find("option:contains("+val+")").val();
					$("#closersDropdown").find('select').val(selectedVal);
				}
				else if(type=="ilmProperties"){
					if(status=="Closing"){
						$('#currentClosings').prop('checked',true);
					}else if(status=="Completed"){
						$('[name="closingStatusIds"] option').each(function() {
							  if($(this).text() == "Completed" || $(this).text() == "Closing Completed") {
							    $(this).attr('selected', 'selected');            
							  }                        
						});
					}
					
					var selectedVal=$("#ilmDropdown").find('select').find("option:contains("+val+")").val();
					$("#ilmDropdown").find('select').val(selectedVal);
				}
				else if(type=="solutionSpecialistProperties"){
					if(status=="Closing"){
						$('#currentClosings').prop('checked',true);
					}else if(status=="Completed"){
						$('[name="closingStatusIds"] option').each(function() {
							  if($(this).text() == "Completed" || $(this).text() == "Closing Completed") {
							    $(this).attr('selected', 'selected');            
							  }                        
						});
					}
					
					var selectedVal=$("#ssDropdown").find('select').find("option:contains("+val+")").val();
					$("#ssDropdown").find('select').val(selectedVal);
				}
				
				
				
				this.resultsTemplate = _.template(closingResultsPage);
				//this.fetchMyClosing(false);
//				var templateData=app.myClosingView.collection.toJSON();
//				$('#searchResults').html("");
//				$('#searchResults').html(this.resultsTemplate({templateData:templateData}));
//				var table =$('#myClosingsTable').dataTable({
//					  "bPaginate":true,
//					  "bInfo":true,
//					  "bFilter":false,
//					  "deferRender": true,
//				      "aoColumnDefs": [
//						               { "aTargets": [ 0 ], "bSortable": true },
//						               { "aTargets": [ 1 ], "bSortable": true },
//						               { "aTargets": [ 2 ], "bSortable": true },
//						               { "aTargets": [ 3 ], "bSortable": true },
//						               { "aTargets": [ 4 ], "bSortable": true }
//					               ]
//				});
//				table.fnSort( [ [3,'desc']] );
//				$('#myClosingsTable thead tr th:nth-child(4)').removeClass("sorting_desc sorting_asc").addClass("sorting");
//				ComponentsPickers.init();
//				ComponentsDropdowns.init();
		     	return this;
			},
			
			savePageNum: function(){
				var self=this;
			       var pageNum=this.pageNumber;
			       if(pageNum){
			    	   var pNum;
			    	   
			    	   pNum=parseInt(pageNum);
			    	   pNum++;
			    	  
			    	   setTimeout(
			    			   function() 
			    			   {
			    				   if(self.pageNumber && self.direction){
			    					   $('#myClosingsTable').dataTable().fnSort( [ [self.columnIndex,self.direction]] );
			    				   }
			    			   }, 500);
			    	   
			    	   setTimeout(
			    			   function() 
			    			   {
			    				   $('.pagination').find('a:contains('+pNum+')').click();
			    			   }, 500);
			    	   
			       }
			       return;
			},
			
			fetchClosingStatuses:function(){
				var self = this;
				var allcodesResponseObject = $.ajax({
						type : "GET",
						url : app.context()+ "/code/all/CLOS_STATUS",
						async : true
					});
				allcodesResponseObject.done(function(response) {
					self.closingStatuses=response;
					ComponentsDropdowns.init();
				});
				allcodesResponseObject.fail(function(response) {
					console.log("Error in retrieving codes "+response);
				});
			}
		
	});
	return MyClosingView;
});