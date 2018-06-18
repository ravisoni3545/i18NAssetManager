define( ["backbone","app","models/myAssetsModel",
         "collections/myAssetsCollection","text!templates/myAssets.html","views/myPropertyView","text!templates/assetResults.html",
         "views/codesView", "text!templates/usersDropdown.html","text!templates/hilDropdown.html","jquery.dataTables","models/tagsModel", "text!templates/tagsDropdown.html"],
		function(Backbone,app,myAssetsModel,myAssetsCollection,myAssetsPage,myPropertyView,assetResults,codesView,
				usersDropdown,hilDropdown,ftbs,tagsModel,tagsDropdown){
	
	var MyAssetsView = Backbone.View.extend( {
		initialize: function(options){
			this.codesView = new codesView({codeGroup:'ASSET_STATUS'});
		},
		events:{
			//"click [name='showProperty']":'showMyPropertyPage'
			"click #searchAssets":'showAssetResults',
			"click .sorting":'setSortingFlag',
			"click .sorting_desc":'setSortingFlag',
			"click .sorting_asc":'setSortingFlag',
		    'keyup #search_form input':'handleEnterKey'
		},
		el:"#maincontainer",
		model:myAssetsModel,
		pageNumber:{},
		direction:{},
		columnIndex:{},
		
		render : function () {
			var self=this;

			if(app.myAssetsView.showRender2==true){
				console.log('render 2 val: ' + app.myAssetsView.val + ' / type: ' + app.myAssetsView.type);
				this.render2(app.myAssetsView.val,app.myAssetsView.type,null,null,null);
				return;
			}
			
			this.template = _.template(myAssetsPage);
			data=app.myAssetsView.collection.models;
			var templateData=app.myAssetsView.collection.toJSON();
			console.log("here");
			if(!this.tagsModel){
				this.tagsModel = new tagsModel();
			}
			//object id can be a random non uuid so that all tags are fetched
			console.log('fetching tags');
			this.tagsModel.getAvailableTags(96,'45328',{
				success: function(res){	
					console.log("success in fetchingt tags for asset search");
					self.assetTagsList = res.tags;
				},
				error: function(res){
					console.log("error in fetching tags for asset search");
				}
			});
			//console.log("self.tagsList: " + JSON.stringify(self.assetTagsList));
			this.$el.html("");
	     	this.$el.html(this.template({templateData:templateData}));
	     	this.codesView.render({el:$('#status'),codeParamName:"propertyStatus",addBlankFirstOption:true});
	     	
	     	if(!this.assetManagers) {
	    		 this.fetchAssetManagerUsers();
	    	 }
	     	if(!this.hilGroups) {
	    		 this.fetchHilGroups();
	    	 }
	     	var usersDropdownTemplate = _.template(usersDropdown);
	     	$('#assetManagerDropdown').html('');
	    	$('#assetManagerDropdown').html(usersDropdownTemplate({name:'assetManagerId',id:'assetManagerId',users:this.assetManagers,addBlankFirstOption:true,investorName:null}));
	    	var hilDropdownTemplate = _.template(hilDropdown);
	     	$('#hilDropdown').html('');
	    	$('#hilDropdown').html(hilDropdownTemplate({name:'hil',id:'hil',values:this.hilGroups,addBlankFirstOption:true}));
	    	var tagsDropdownTemplate = _.template(tagsDropdown);
	    	$('#assetTag').html('');
	    	$('#assetTag').html(tagsDropdownTemplate({tagsList:self.assetTagsList}));
	     	
	    	//-------------------------------
			if (('localStorage' in window) && window['localStorage'] !== null) {
			    if ('previousUrl' in localStorage && window.location.hash) {
			       if(localStorage.getItem('previousUrl').indexOf('myProperties/')>-1){
			    	   //localStorage.setItem('previousUrl', Backbone.history.fragment);
			    	   if(typeof app.assetSearchFormData !== "undefined" && !jQuery.isEmptyObject(app.assetSearchFormData)){
			    		   this.showAssetResults(null,app.assetSearchFormData);
			    	   }
			       }else {
//			    	   this.handleDefaultSearch();
				   }
			       
			    }else {
//			    	   this.handleDefaultSearch();
				}
			    
			}else {
//		    	   this.handleDefaultSearch();
			}
			//-------------------------------
			
			$(".amountWithOutSymbol").formatCurrency({symbol:"",roundToDecimalPlace:0});
	     	return this;
		},
//		handleDefaultSearch:function(){
//			var self = this;
//			self.pageNumber=null;
//			self.direction=null;
//			self.columnIndex=null;
//			if($.inArray('Asset Manager', app.sessionModel.attributes.roles)>-1){
//		    	$("#assetManagerId").val(app.sessionModel.attributes.userId);
//		    	$('#isManaged').prop('checked', true);
//		    	this.showAssetResults(null,null);
//			}
//		},
		fetchAssetManagerUsers:function(){
			 var self = this;
			 $.ajax({
					url: app.context()+'/user/Asset Manager',
					contentType: 'application/json',
					async : false,
					type: 'GET',
					success: function(res){
						self.assetManagers=res
						console.log(res);
					},
					error: function(res){
					}
			 });
		 },
		 fetchHilGroups:function(){
				var self=this;
				$.ajax({
					url: app.context()+'/hilGroup/getHilGroups',
					contentType: 'application/json',
					async : false,
					dataType:'json',
					type: 'GET',
					success: function(res){
						self.hilGroups=res;
					},
					error: function(res){
						console.log('Error in fetching Hil groups');
					}
	
				});
		},
		handleEnterKey:function(event) {
	    	 if(event.keyCode == 13){
	    		 this.showAssetResults();
		     }
	    },
		fetchMyAssets:function(){
			var thisPtr=this;
			//console.log(thisPtr.collection);
			//console.log(thisPtr.model);
        		thisPtr.collection.fetch({
                success: function (res) {
                	//console.log(res);
                	thisPtr.render();
                },
                error   : function () {
                }
            });
		},
		showMyPropertyPage:function(evt){
			var assetIdClicked = $(evt.currentTarget).attr('assetId');
			//alert(assetIdClicked);
			var propertyModel=this.collection.findWhere({assetId: assetIdClicked});
			//console.log(propertyModel);
			 if(!app.mypropertyView){
	    		 app.mypropertyView=new myPropertyView();
				}
			 app.mypropertyView.propertyModel=propertyModel;
	    	app.mypropertyView.render();
	    	 return this;
		},
		
		showAssetResults: function(evt,assetSearchFormData){
			$('#renderAssetResult').html(_.template( assetResults )({templateData:null}));
			
			
			var self=this;
			var formData;
			var searchModel= new myAssetsModel();
			var checkFlag="false";
			var expiringLeasesFlag="false";
			//
			if(!assetSearchFormData){
				formData= $('#search_form').serializeArray();
				console.log('form data: ' + JSON.stringify(formData));
				if (('localStorage' in window) && window['localStorage'] !== null) {
			        app.assetSearchFormData= formData;
			    }
			    //console.log('fd6: ' + JSON.stringify(formData[7]) + " rd7: " + JSON.stringify(formData[8]));
				//hardcoded values??
				if(formData && ((formData[7] && formData[7].name == "isManaged") || (formData[6] && formData[6].name == "isManaged"))){
					checkFlag="true";
				}
				if(formData && 
						((formData[7] && formData[7].name == "expiringLeases")||(formData[8] && formData[8].name == "expiringLeases"))){
					expiringLeasesFlag="true";
				}
			}
			else{
				formData=app.assetSearchFormData;
				
				$.map(formData, function(n, i){
					var value=n['value'];
					var name=n['name'];
					$('#search_form').find('[name='+name+']').val(value);
					if(name.indexOf('isManaged')>-1){
						checkFlag="true";
						
					}
					
					if(name.indexOf('expiringLeases')>-1){
						expiringLeasesFlag="true";
						
					}
					
				});
			}
			//
			if(checkFlag=="false"){
				$('[name=isManaged]').prop('checked', false);
			}
			if(expiringLeasesFlag=="false"){
				$('[name=expiringLeases]').prop('checked', false);
			}else{
				$('[name=expiringLeases]').prop('checked', true);
			}
			//var unindexed_array = $('#search_form').serializeArray();
			$.map(formData, function(n, i){
				var value=n['value'];
				var name=n['name'];
			
				searchModel.set(name,value);

			});

			this.model=searchModel;
			$('#searchResultTable').on( 'draw.dt', function () {
				$('.propNameTooltip').tooltip({
					animated: 'fade',
					placement: 'bottom'
				});
			});
			//----------------------------DataTable start-----------------------------------
			var oTable=$('#searchResultTable').dataTable({
				"bServerSide": true,
				"bFilter": false,
				'bProcessing': true,
				//"scrollY": "300px",
		        "sScrollX": "100%",
		        "scrollCollapse": true,
		        //"paging": false,
				"sAjaxSource": app.context()+ '/myAssets/search/',
				"sAjaxData" : 'aaData',
				//"pagingType": "simple",
				
				"aoColumns": [{"mData": "propertyFullAddress","sTitle": "Property","sWidth":"30%"},
							  {"mData": "assetType","sTitle": "Asset Type","sWidth":"15%"},
							  {"mData": "investorName","sTitle":"Name of Investor","sWidth":"18%"},
				              { "mData": "propertyManager","sTitle": "Property Manager","sWidth":"18%" },
				              { "mData": "assetStatus","sTitle": "Status","sWidth":"19%"}
				              ],
				 
				"aoColumnDefs": [{
									"aTargets": [0],
									"mRender": function (data, type, full) {
										return '<div><img src="'+full.imageLink+'" border="0" class="pull-left marg_right5 img1class" alt="Image"></img>'
										+'<a href=#property/'+ full.propertyId 
										+' class="darkcolor dottext propNameTooltip" style=margin-bottom:0px; data-toggle=tooltip title="'
										+ full.propertyFullAddress +'">'
										+ full.propertyFullAddress +
										'</a>' +
										'<span class="lightfontcolor">' +
										((full.propertyType)?(full.propertyType+', '):'') +
										((full.bedRooms)?(full.bedRooms+' Beds, '):'') +
										((full.bathRooms)?(full.bathRooms+' Baths, '):'') +
										((full.totalSqft)?('<span class="amountWithOutSymbol">'+full.totalSqft+'</span> Sqft.'):'') +
										((full.propertyDisplayId)?('<br>'+full.propertyDisplayId):'')  +
										'</span></div>';
									}
								},
								{
									"aTargets": [4],
									"mRender": function (data, type, full) {
										return '<a href="#myProperties/'+full.assetId+'" assetId="'+full.assetId+'" name="showProperty">'
										+ full.assetStatus +
										'</a>';
									}
								}
								
								],
			//----------------------------
								"fnDrawCallback": function () {
									
        							localStorage.setItem('assetSearchPageNum',this.fnPagingInfo().iPage);
        							localStorage.setItem('assetSearchDirection',$("#searchResultTable").dataTable().fnSettings().aaSorting[0][1]);
        	        				localStorage.setItem('assetSearchColumnIndex',$("#searchResultTable").dataTable().fnSettings().aaSorting[0][0]);
        	        				localStorage.setItem('assetSearchPageSize',this.fnPagingInfo().iLength);
        	        				localStorage.setItem('assetSearchPageStart',this.fnPagingInfo().iStart);
        	        				localStorage.setItem('assetSearchPageEnd',this.fnPagingInfo().iEnd);
        	        				localStorage.setItem('assetSearchPageTotalRecords',this.fnPagingInfo().iTotal);
        	        				
        	        				$(".amountWithOutSymbol").formatCurrency({symbol:"",roundToDecimalPlace:0});
        	        				
        	        				//console.log($("#searchResultTable").dataTable().fnSettings().aaSorting);
									/*alert(this.fnPagingInfo().iPage);
									alert("In draw Call back:"+$('#searchResultTable').dataTable().fnSettings().aaSorting[0][1]);
									alert("In draw Call back:"+$('#searchResultTable').dataTable().fnSettings().aaSorting[0][0]);*/
									
									
        				     },
        				     "fnInitComplete": function() {
        				    	 self.savePageNum();
        				    	 $(".amountWithOutSymbol").formatCurrency({symbol:"",roundToDecimalPlace:0});
        			         },
			//----------------------------
				
			  
		      "fnServerData": function(sSource, aoData, fnCallback, oSettings) {
				            	  var paramMap = {};
				            	  for ( var i = 0; i < aoData.length; i++) {
				            		  paramMap[aoData[i].name] = aoData[i].value;
				            	  }
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
				      			    	 if(localStorage.getItem('previousUrl').indexOf('myProperties/')>-1){
				      			    		 self.previousUrl=localStorage.getItem('previousUrl');
				      			    		 sortCol= localStorage.getItem('assetSearchColumnIndex');
				      			    		 sortDir=localStorage.getItem('assetSearchDirection');
				      			    		 pageNum=localStorage.getItem('assetSearchPageNum');
				      			    		 pageSize=localStorage.getItem('assetSearchPageSize');
				      			    		 self.pageNumber=pageNum;
				      			    		 self.direction=sortDir;
				      			    		 self.columnIndex=sortCol;
				      			    		 
				      			    		 //
				      			    		self.pageStart=localStorage.getItem('assetSearchPageStart');
				      			    		self.pageEnd=localStorage.getItem('assetSearchPageEnd');
		        	        				self.totalRecords=localStorage.getItem('assetSearchPageTotalRecords');
				      			    		 //
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
			$(window).on('resize', function () {
				if($('#searchResultTable').dataTable() && $('#searchResultTable').dataTable().length){
					$('#searchResultTable').dataTable().fnAdjustColumnSizing();
				}
				//oTable.fnAdjustColumnSizing();
			});
			$('#searchResultTable_wrapper .dataTable').addClass("tablegreen");
            $('select[name=searchResultTable_length]').addClass('form-control');
            $('#searchResultTable_wrapper .dataTables_scrollBody').css({"overflow":"visible","width":"100%"});
			$('#searchResultTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");
			$("#searchResultTable_wrapper .dataTables_scrollHead table").css("margin-top","0px");
			$("#searchResultTable_wrapper .dataTables_scrollBody table").css("margin-top","-1px");
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
		render2:function(val,type,assetManagerId,propertyManager,hil){
			var self=this;
			if(this.$el.find('#search_form').length<1) {
				this.template = _.template(myAssetsPage);
				data=app.myAssetsView.collection.models;
				var templateData=app.myAssetsView.collection.toJSON();
				//console.log(templateData);
				if(!this.tagsModel){
					this.tagsModel = new tagsModel();
				}
				//object id can be a random non uuid so that all tags are fetched
				console.log('fetching tags');
				this.tagsModel.getAvailableTags(96,'4532',{
					success: function(res){	
						console.log("success in fetchingt tags for asset search render 2");
						self.assetTagsList = res.tags;
					},
					error: function(res){
						console.log("error in fetching tags for asset search render 2");
					}
				});
				this.$el.html("");
		     	this.$el.html(this.template({templateData:templateData}));
		     	this.codesView.callback=function() {
		     		if(type=="status"){
						//console.log('setting status');
						$("#status").find('select').val(val);
					}
		     		self.showAssetResults();
		     	}
		     	this.codesView.render({el:$('#status'),codeParamName:"propertyStatus",addBlankFirstOption:true});
		     	if(!this.assetManagers) {
		    		 this.fetchAssetManagerUsers();
		    	 }
		     	if(!this.hilGroups) {
		    		 this.fetchHilGroups();
		    	 }
		     	var usersDropdownTemplate = _.template(usersDropdown);
		     	$('#assetManagerDropdown').html('');
		    	$('#assetManagerDropdown').html(usersDropdownTemplate({name:'assetManagerId',id:'assetManagerId',users:this.assetManagers,addBlankFirstOption:true,investorName:null}));
		    	var hilDropdownTemplate = _.template(hilDropdown);
		     	$('#hilDropdown').html('');
		    	$('#hilDropdown').html(hilDropdownTemplate({name:'hil',id:'hil',values:this.hilGroups,addBlankFirstOption:true}));
		    	var tagsDropdownTemplate = _.template(tagsDropdown);
		    	$('#assetTag').html('');
		    	$('#assetTag').html(tagsDropdownTemplate({tagsList:self.assetTagsList}));
			}


			//console.log('setting isManaged: ' +JSON.stringify($('#isManaged')) + " " + $('#isManaged').html() );
			$('#isManaged').prop('checked',true);//All assets on dashboard are managed
			//console.log('setting expired lease');
			$('#expiringLeases').prop('checked',false);
			
			if(type=="expiringLeases"){
			//	console.log('setting expired lease');
				$('#expiringLeases').prop('checked',true);
			}			
			if(type=="propertyManager"){
			//	console.log('setting property manager');
//				$("#propertyManagerName").val(val);
				$('input[name="propertyManagerName"]').val(val);
			}
			else if(type=="status"){
				//console.log('setting status');
				$("#status").find('select').val(val);
			}
			else if(type=="assetManager"){
				//console.log('setting assetManager');
				$("#assetManagerDropdown").find('select').val(val);
			}
			else if(type=="hil"){
				//console.log('setting hil');

				var values = val.split(" ");
				var hilValue = values[0];
				var selectedVal=$("#hilDropdown").find('select').find("option:contains("+hilValue+")").val();
				$("#hilDropdown").find('select').val(selectedVal);
			}else if(type=="investorName"){
				//console.log('setting investorName');

				$('input[name="investorName"]').val(val);
			}
			this.showAssetResults();
			app.myAssetsView.showRender2=false;
			
		}
		
	});
	return MyAssetsView;
});