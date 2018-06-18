define( ["backbone","app","models/rehabModel",
         "collections/rehabCollection","text!templates/rehabSearch.html","views/codesView","text!templates/rehabResults.html","text!templates/usersDropdown.html","components-dropdowns","components-pickers"],
		function(Backbone,app,rehabModel,rehabCollection,rehabSearchPage,codesView,rehabResultsPage,usersDropdown){
	
	var RehabSearchView = Backbone.View.extend( {
		initialize: function(options){
			this.codesView = new codesView({codeGroup:'REP_STATUS'});
		},
		events:{
			"click #rehabSearchSubmit":"fetchRehabSearch",
			'keyup #rehabSearchForm input':'handleEnterKey'
		},
		el:"#maincontainer",
		model:rehabModel,
		pageNumber:{},
		direction:{},
		columnIndex:{},
		render : function () {
			var self=this;
			if(this.$el.find('#rehabSearchForm').length<1) {
				this.template = _.template(rehabSearchPage);
				this.$el.html("");
				this.$el.html(this.template());
				this.codesView.render({el:$('#rehabStatus'),codeParamName:"statusId",addBlankFirstOption:true});
				
				if(!this.rehabCoordinators){
					 this.fetchRehabCoordinators();
				}
				
				var usersDropdownTemplate = _.template(usersDropdown);
				$('#rehabCoordinatorsDropdown').html('');
				$('#rehabCoordinatorsDropdown').html(usersDropdownTemplate({name:'rehabCoordinator',id:'rehabCoordinator',users:this.rehabCoordinators,addBlankFirstOption:true,investorName:null}));
				
			}
			$('#searchResults').html("");
			
			//-------------------------------
			if (('localStorage' in window) && window['localStorage'] !== null) {
			    if ('previousUrl' in localStorage && window.location.hash) {
			       if(localStorage.getItem('previousUrl').indexOf('closing/')>-1 || 
			    		   localStorage.getItem('previousUrl').indexOf('rehab/')>-1){
			    	   localStorage.setItem('previousUrl', Backbone.history.fragment);
			    	   
			    	   self.pageNumber=localStorage.getItem('rehabSearchPageNum');
					   self.direction= localStorage.getItem('rehabSearchDirection');
					   self.columnIndex=localStorage.getItem('rehabSearchColumnIndex');
			    	   
			    	   this.searchRehabs(app.rehabSearchFormData);
			    	   self.savePageNum();
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
			if($.inArray('Rehab Coordinator', app.sessionModel.attributes.roles)>-1){
		    	$("#rehabCoordinator").val(app.sessionModel.attributes.userId);
		    	$('#currentRehabs').prop('checked', true);
		    	this.searchRehabs(null);
			}
		},
		handleEnterKey:function(event) {
	    	 if(event.keyCode == 13){
	    		 this.fetchRehabSearch();
		     }
	    },
	    fetchRehabSearch: function() {
			this.searchRehabs(null);
		},
		searchRehabs:function(rehabFormData){
			

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
			var formData;
			
			if(!rehabFormData){
				formData= $('#rehabSearchForm').serializeArray();
				if (('localStorage' in window) && window['localStorage'] !== null) {
			        app.rehabSearchFormData= formData;
			    }
			}
			else{
				formData=rehabFormData;
				
				$.map(formData, function(n, i){
					var value=n['value'];
					var name=n['name'];
					$('#rehabSearchForm').find('[name='+name+']').val(value);
					
					if(name.indexOf('currentRehabs')>-1){
						if(value=="on"){
							$('[name='+name+']').prop('checked', true);
						}
					}
					
				});
			}
				
			var searchModel= new rehabModel();
				
			$.map(formData, function(n, i){
					var value=n['value'];
					var name=n['name'];
	
					searchModel.set(name,value);
			});
			
			this.model = searchModel;
			
    		thisPtr.collection.fetchRehabs(this.model.attributes,{
                success: function (res) {
                	thisPtr.collection.reset();
                	_(res).each(function(obj) {
                		thisPtr.collection.add(new rehabModel(obj));
                	});
                	thisPtr.resultsTemplate = _.template(rehabResultsPage);
        			var templateData=app.rehabSearchView.collection.toJSON();
        			$('#searchResults').html("");
        			$('#searchResults').html(thisPtr.resultsTemplate({templateData:templateData}));

        			$('#rehabsTable').on( 'draw.dt', function () {
						$('.propNameTooltip').tooltip({
							animated: 'fade',
							placement: 'bottom'
						});
					});

        			var table =$('#rehabsTable').dataTable({
        				  "bPaginate":true,
        				  "bInfo":true,
        				  "bFilter":true,
        				  //"deferRender": true,
        				  "sScrollX": "100%",
        				  "bAutoWidth": false,
        			      "aoColumnDefs": [
        					               { "sWidth": "25%", "aTargets": [ 0 ], "bSortable": true },
        					               { "sWidth": "12%", "aTargets": [ 1 ], "bSortable": true },
        					               { "sWidth": "12%", "aTargets": [ 2 ], "bSortable": true },
        					               { "sType" : "usdate","sWidth": "9%", "aTargets": [ 3 ], "bSortable": true },
        					               { "sType" : "usdate","sWidth": "10%", "aTargets": [ 4 ], "bSortable": true },
        					               { "sType" : "usdate","sWidth": "10%", "aTargets": [ 5 ], "bSortable": true },
        					               { "sWidth": "12%", "aTargets": [ 6 ], "bSortable": true },
        					               { "sWidth": "10%", "aTargets": [ 7 ], "bSortable": true }
        				               ],
        				               
        				   "fnDrawCallback": function () {
        							localStorage.setItem('rehabSearchPageNum',this.fnPagingInfo().iPage);
        							localStorage.setItem('rehabSearchDirection',$("#rehabsTable").dataTable().fnSettings().aaSorting[0][1]);
        	        				localStorage.setItem('rehabSearchColumnIndex',$("#rehabsTable").dataTable().fnSettings().aaSorting[0][0]);
        				     },
        				     
//        				     "fnInitComplete": function() {
//        				    	 thisPtr.savePageNum();
//        			         }
        			});
        			
        			
        			table.fnSort( [ [5,'desc']] );
        			$('#rehabsTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");
					$('#rehabsTable_wrapper .dataTables_scrollBody').css({"overflow":"visible","width":"100%"});
        			$('#rehabsTable_wrapper .dataTables_scrollHead thead tr th:nth-child(6)').removeClass("sorting_desc sorting_asc").addClass("sorting");
					$("#rehabsTable_wrapper .dataTables_scrollHead table").css("margin-top","0px");
					$("#rehabsTable_wrapper .dataTables_scrollBody table").css("margin-top","-1px");
					$('select[name=rehabsTable_length]').addClass('form-control');

					/*$('.propNameTooltip').tooltip({
						animated: 'fade',
						placement: 'bottom'
					});*/

					$(window).on('resize', function () {
						if($('#rehabsTable').dataTable() && $('#rehabsTable').dataTable().length){
							$('#rehabsTable').dataTable().fnAdjustColumnSizing();
						}
					});

        			ComponentsPickers.init();
        			ComponentsDropdowns.init();
                },
                error   : function (res) {
					$('#alertRehabSearchFailure > text').html("Error in fetching rehabs.");
			        App.scrollTo($('#alertRehabSearchFailure'), -200);
			        $('#alertRehabSearchFailure').show();
			        $('#alertRehabSearchFailure').delay(2000).fadeOut(2000);
                }
            });
    		return;
		},
		fetchRehabCoordinators:function(){
	    	 var self = this;
			 $.ajax({
					url: app.context()+'/user/Rehab Coordinator',
	                contentType: 'application/json',
	                async : false,
	                dataType:'json',
	                type: 'GET',
	                success: function(res){
	                	self.rehabCoordinators=res;
	                },
	                error: function(res){
	                	$('#alertRehabSearchFailure > text').html("Error in fetching Rehab Coordinators");
				        App.scrollTo($('#alertRehabSearchFailure'), -200);
				        $('#alertRehabSearchFailure').show();
				        $('#alertRehabSearchFailure').delay(2000).fadeOut(2000);
	                }
					
				});
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
		    					   $('#rehabsTable').dataTable().fnSort( [ [self.columnIndex,self.direction]] );
		    				   }
		    			   }, 500);
		    	   
		    	   setTimeout(
		    			   function() 
		    			   {
		    				   $('.pagination').find('a:contains('+pNum+')').click();
		    			   }, 500);
		    	   
		       }
		       return;
		}
		
	});
	return RehabSearchView;
});