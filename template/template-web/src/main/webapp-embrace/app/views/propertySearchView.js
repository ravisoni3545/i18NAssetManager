define([
"backbone","app","text!templates/propertySearch.html",
"text!templates/propertySearchResults.html","text!templates/investorWishlistResults.html",
"models/propertySearchModel","models/investorModel","models/investorWishlistModel",
"views/propertySearchAddSelectedView","collections/propertySearchCollection","accounting","components-pickers"
], function(Backbone,app,propertySearchTpl,
	propertySearchResultsTpl,investorWishlistResultsTpl,
	propertySearchModel,investorModel,investorWishlistModel,
	propertySearchAddSelectedView,propertySearchCollection,accounting){
	var propertySearchView = Backbone.View.extend({

		initialize: function(){

		 },
		 el:"#maincontainer",
		 model:propertySearchModel,
		 searchBoxes: [],
		 nirLists:null,
		 huStatusList: null,
		 propTagsList: null,
		 selectedProp: [],
		 initBoxes: false,
		 events          : {
	         'click #searchProperty' : 'searchProperty',
	         'click #ETESearchProperty' : 'exportToExcelSearchProperty',
	         //'click .myaction'       : 'myAction',	
	         'click #investorRSearch' : 'investorSearch',
	         'click #addInvestor' : 'addInvestorRecommendedlist',
	         'keypress .srch' : 'keyHandle',
	         'keypress .isrch' : 'keyHandle1',
	         'click #preSelectOnly' : 'preSelectClicked',
	         'click table tbody tr' : 'propSelected',
	         'click #add_selected' : 'addSelected',
	         'click a[href=#wishlistmodal]' : 'clickLink',
	         'click a.toggle-vis' : 'toggleCol',
	         'click #resetDate':'resetDate'
	     },
	    render : function () {
	    	
            var self=this;
            self.fetchNirLists();
            self.fetchHuStatusList();
            self.fetchPropertyTagsList();
	    	this.template = _.template( propertySearchTpl );
	     	this.$el.html("");
	     	//console.log(self.nirLists);
	     	this.$el.html(this.template({domainLink:app.context(),nirLists:self.nirLists, huStatusList: self.huStatusList, propTagsList: self.propTagsList})); 
	     	ComponentsPickers.init();
	     	
	     	

	     	return this;
	    },
	    
	    
	    fetchNirLists:function(){
			var self=this;
			var allNIRResponseObject = $.ajax({
				type : "GET",
				url : app.context()+ "/property/search/allNIR",
				async : false
			});
			allNIRResponseObject.done(function(response) {
				self.nirLists=response;
			});
			allNIRResponseObject.fail(function(response) {
				console.log("Error in retrieving states "+response);
			});
		},
		
		fetchHuStatusList: function(){
			var self = this;
			$.ajax({
				type : "GET",
				url : app.context()+ "/property/search/allHuStatus",
				async : false,
				success: function(res){
					self.huStatusList=res;
				}, 
				error: function(res){
					console.log("Error in retrieving hu statuses "+res);
				}
			});
		},
		
		fetchPropertyTagsList: function(){
			var self = this;
			$.ajax({
				type : "GET",
				url : app.context()+ "/property/search/allPropertyTags",
				async : false,
				success: function(res){
					self.propTagsList=res;
				}, 
				error: function(res){
					console.log("Error in retrieving property tags list "+res);
				}
			});
		},
	    
	    postProcess : function(){
	    	var self = this;
	    	if(!this.initBoxes){
	    		$("input[type=checkbox]").each(function(){
	    			var pattern = /class[ABC]/;
	    			if(!pattern.test(this.name))
	    				self.searchBoxes.push(this.name);
	    		});
	    		this.initBoxes = true;
	    	}

			$("input#onInvestorPortalOnly").closest('label').hide();
			//-------------------------------
			if (('localStorage' in window) && window['localStorage'] !== null) {
			    if ('previousUrl' in localStorage && window.location.hash) {
			    	if(localStorage.getItem('previousUrl').indexOf('property/')>-1 )
			    	   this.searchProperty(null,app.propertySearchFormData);			       
			    }
			    
			    
			    //alert("In render:"+ self.pageNumber);
			}
			//-------------------------------
		},
		exportToExcelSearchProperty:function(){
			//Handle the case for post process. Back button click. Separately
			console.log("exportToExcelSearchProperty");
			var self = this;
			var searchModel= new propertySearchModel();
			var unindexed_array;
			var pclass = new Array();
			unindexed_array = $('#search_form').serializeArray();

			$.map(unindexed_array, function(n, i){
				var value=n['value'];
			    var name=n['name'];
  	    		var pattern = /class[ABC]/;
  	    		if(pattern.test(name))
  	    			pclass.push(value);
  	    		else
  	    			if(name != 'submit')
			    		searchModel.set(name,value);
			    	    	
			});
			searchModel.set('propertyClass',pclass.join(','));

			searchModel.set("sortDir","asc");
			searchModel.set("sortName","propertyid");
			searchModel.set("pageNum",0);
			// searchModel.set("pageSize",pageSize);
			/*searchModel.set("pageSize",100);*/

			/*GET*/
			var export_link = $("#ETEgetButton");
			export_link.attr("href","property/search/exportToExcelSearchProperty/" + 
														JSON.stringify(searchModel.attributes));
          	if(export_link.get(0).click){
          		export_link.get(0).click();
          	} else {
      			//Custom code for safari download
      			
	            var click_ev = document.createEvent("MouseEvents");
	            // initialize the event
	            click_ev.initEvent("click", true /* bubble */, true /* cancelable */);
	            // trigger the evevnt
	            export_link.get(0).dispatchEvent(click_ev);
          	}
		},
		searchProperty:function(evt,propertySearchFormData){
							    	
	    	var self = this;
			var searchModel= new propertySearchModel();
			var unindexed_array;
			var pclass = new Array();
			    	    	    	
			$('#searchResults').html(
					_.template(propertySearchResultsTpl)({
						templateData : null
					}));

            $('.hopNameTooltip').tooltip({
                animated: 'fade',
                placement: 'left'
            });

			if(!propertySearchFormData){
				unindexed_array = $('#search_form').serializeArray();
				if (('localStorage' in window) && window['localStorage'] !== null) {
			        app.propertySearchFormData= unindexed_array;
			    }
			}
			else{

				unindexed_array=app.propertySearchFormData;
				var isOnlyPreSelected = false;
				$.map(unindexed_array, function(n, i){
					var value=n['value'];
					var name=n['name'];
					var pattern = /class[ABC]/;
	
					if(name != 'submit')
						if(name == "financingType" || pattern.test(name)){
							$("input[name="+name+"]").parent().removeClass("active");
							$("input[value="+value+"]").parent().addClass("active");
						}
						else if(name == "propType" || name == "propSaleType"){		
							$("input[name="+name+"]").parent().removeClass("active");
							$("input[name="+name+"][value="+value+"]").parent().addClass("active");
						}
						else if($.inArray(value,this.searchBoxes)){
							if(name == 'preSelectOnly')
								$("input#onInvestorPortalOnly").closest('label').show();
							$("input[name="+name+"]").prop("checked",true);	
						}

						else
							$('#search_form').find('[name='+name+']').val(value);
										
				});
			}

			$.map(unindexed_array, function(n, i){
				var value=n['value'];
			    var name=n['name'];
  	    		var pattern = /class[ABC]/;
  	    		if(pattern.test(name))
  	    			pclass.push(value);
  	    		else
  	    			if(name != 'submit')
			    		searchModel.set(name,value);
			    	    	
			});
			searchModel.set('propertyClass',pclass.join(','));
			this.model=searchModel;
			this.showDataTable();
		},
		showResults:function(){
			var self = this;
			('<b>Toggle column</b>: <a class="toggle-vis" data-column="2">Address</a>').appendTo($("#toggleCol"));
			self.resultsTemplate = _.template(propertySearchResultsTpl);
			var templateData=app.propertySearchView.collection.toJSON();
			$('#searchResults').html("");
			$('#searchResults').html(this.resultsTemplate({templData:templateData}));
            $('.hopNameTooltip').tooltip({
                animated: 'fade',
                placement: 'bottom'
            });
			var table = $('#propertySearchTable').dataTable({

				"bPaginate": true,
				"bInfo": true,
				"bFilter": false,
				"deferRender": true,
				"aoColumnDefs": [
									{ "aTargets": [3], "bSortable": true},
									{ "aTargets": [4], "bSortable": true},
									{ "aTargets": [5], "bSortable": true},
									{ "aTargets": [6], "bSortable": true},
									{ "aTargets": [7], "bSortable": true},
								],
								
				"fnDrawCallback": function(oSettings) {
					console.log("DataTable has redrawn the table");
				}					
			});
			table.fnSort([ [3,'desc'] ]);
		},
		showDataTable : function() {
			$("#toggleCol").html('<div class="addtoggleposition marg_top5"><b>Toggle column</b>: <a class="toggle-vis" data-column="2">Address</a> -- <a class="toggle-vis" data-column="3">City</a> -- <a class="toggle-vis" data-column="4">State</a> -- <a class="toggle-vis" data-column="5">Zip</a> -- <a class="toggle-vis" data-column="6">Property Status</a> -- <a class="toggle-vis" data-column="13">Appreciation</a> -- <a class="toggle-vis" data-column="15">Property Source</a> -- <a class="toggle-vis" data-column="17">Tenanted</a></div>');
			var self = this;
			// ----------------------------DataTable
			// start-----------------------------------
			var oTable = $('#propertySearchResultsTable')
					.dataTable(
							{
								"bServerSide" : true,
								'bProcessing' : true,
								"bFilter": false,
								//"scrollY" : "300px",
								//"scrollX" : "100%",
								//"scrollCollapse" : true,
								//"paging" : false,
								"sAjaxSource" : app.context()
										+ '/property/search/',
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
											"mData" : "propertyid",
											"sTitle" : "Action"
										},
										{
											"mData" : "photothumb",
											"sTitle" : "Property"
										},
										{
											"mData" : "address",
											"sTitle" : "Address"
										},
										{
											"mData" : "city",
											"sTitle" : "City"
										}, {
											"mData" : "state",
											"sTitle" : "State"
										}, {
											"mData" : "zip",
											"sTitle" : "Zip"
										}, {
											"mData" : "prostatus",
											"sTitle" : "Property<br/>Status"
										}, {
											"mData" : "nir",
											"sTitle" : "NIR"
										}, {
											"mData" : "yearBuilt",
											"sTitle" : "Year Built"
										}, {
											"mData" : "askingPrice",
											"sTitle" : "Asking<br/>Price($)"
										}, {
											"mData" : "investment",
											"sTitle" : "Investment<br/>Amount($)"
										}, {
											"mData" : "propReturn",
											"sTitle" : "Yield(%)"
										}, {
											"mData" : "monthlyCashflow",
											"sTitle" : "Monthly<br/>Cash-flow($)"
										}, {
											"mData" : "appreciationRate",
											"sTitle" : "Appreciation(%)"
										}, {
											"mData" : "rehabEstimate",
											"sTitle" : "Rehab Cost($)"
										}, {
											//"mData" : "realtorCompanyname",
											"mData" : "propertySource",
											"sTitle" : "Property<br/>Source"
										}, {
											"mData" : "wmemcnt",
											"sTitle" : "Wishlist<br/>Count"
										},{
											"mData" : "tenantedProperty",
											"sTitle" : "Tenanted"
										},
										{
											"mData" : "sdira",
											"sTitle" : "SDIRA"
										},{
											"mData" : "propertyDisplayId",
											"sTitle" : "Display ID"
										  },
										  
										      {    
											       "mData" : "inventoryCreatedDate",
											       "sTitle" : "Date added<br/>to Inventory"
											  
											  
										      }],

								"aoColumnDefs" : [
										{
											"aTargets" : [ 0 ],
											"bSortable": false,
											"mRender" : function(
													data, type,
													full) {
												return '<div class="btn-group" style="text-align:left!important;">'
 								                      	+'<button data-toggle="dropdown" class="btn dropdown-toggle gear2button myaction" type="button"><i class="fa fa-gear"></i></button>'
			                       					  	+'<ul propertyid="'+full.propertyid+'" role="menu" class="dropdown-menu" style="margin-left:30px!important;margin-top:-20px!important; padding:5px; ">'
														+'<li><a href="#property/'+full.propertyid+'" class="btn btn-xs green textalignleft"><i class="fa fa-file-o"></i> View Property</a></li>'
													/*	+'<li><a href="#property/'+full.propertyid+'" class="btn btn-xs red textalignleft"><i class="fa fa-edit"></i> Edit Property</a></li>'
                      									+'<li><a  href="#deleteproperty" data-toggle="modal" title="Delete" class="btn default btn-xs black textalignleft"><i class="fa fa-trash-o"></i> Delete</a></li>' */
														+'<li><a href="#wishlistmodal" data-toggle="modal" class="btn btn-xs purple textalignleft"><i class="fa fa-plus"></i> Add to Recommended List</a></li>'
						  							//	+'<li><a href="#" class="btn btn-xs blue textalignleft"><i class="fa fa-envelope"></i> Email Property </a></li>'
                                                        +'<li><a href="#propertyPreselect/'+full.propertyid+'" class="btn btn-xs red textalignleft"><i class="fa fa-star"></i> Make Pre-select</a></li>'
                        								+'</ul></div>'
											}
										},
										{
											"aTargets" : [ 1 ],
											"bSortable": false,
											"mRender" : function(
													data, type,
													full) {
									
											  
												return  '<div class="pull-left preselectOverlay">'
														+'<a href="#property/'
														+ full.propertyid
														+ '"><img src="'
														+ full.photothumb
														+ '"></a>' 
										                + (full.huSelectReadyForInvestor !=null?'<div class="preselect-ico"><img src="assets/img/been.png"></div>':"")
										                + '</div>';
											}
										},
										{
											"aTargets" : [ 2 ],
											"bSortable": false,
											"mRender" : function(
													data, type,
													full) {
												//return '<div class="iconBlock">'+full.address+'<br /><div class="mapIcon single-family-size single-family-layer single-family-color single-family-asize"></div><div class="mapIcon single-family-size single-family-layer single-family single-family-asize"></div></div>';
												var typeStr = "";
												typeStr += (full.propType == "SFH")?'<div class="prop-type inline-block"><div class="realEstatetIcon prop-type-size sfh-icon"></div></div>':(full.propType == "MU")?'<div class="prop-type inline-block"><div class="realEstatetIcon prop-type-size mu-icon"></div></div>':"";
												typeStr += (full.propSaleType == "reo")?'<div class="prop-type-icon inline-block"><img src="'+app.context()+'/assets/img/reo-icon.png"></div></div>':(full.propSaleType == "std")?'<div class="prop-type-icon inline-block"><img src="'+app.context()+'/assets/img/std-icon.png"></div></div>':"";
												return '<div class="iconBlock">'+full.address+'<br />'+typeStr+'</div>';
											}
										},
										{
											"aTargets" : [ 9 ],
											"mRender" : function (
													data, type,
													full) {
												return accounting.formatMoney(full.askingPrice,"$",2);
											}
										},
										{
											"aTargets" : [ 10 ],
											"mRender" : function (
													data, type,
													full) {
												return '<span invAmt="'+Math.round(full.investment)+'">'+accounting.formatMoney(full.investment,"$",2)+'</span>';
											}
										},
										{
											"aTargets" : [ 11 ],
											"mRender" : function (
													data, type,
													full) {
												return accounting.formatNumber(full.propReturn,2)+'%';
											}
										},
										{
											"aTargets" : [ 12 ],
											"mRender" : function (
													data, type,
													full) {
												return accounting.formatMoney(full.monthlyCashflow,"$",2);
											}
										},
										{
											"aTargets" : [ 13 ],
											"mRender" : function (
													data, type,
													full) {
												return accounting.formatNumber(full.appreciationRate,2)+'%';
											}
										},
										{
											"aTargets" : [ 14 ],
											"mRender" : function (
													data, type,
													full) {
												return accounting.formatMoney(full.rehabEstimate,"$",2);
											}
										},
										{
											"aTargets" : [ 15 ],
											"mRender" : function (
													data, type,
													full) {
												//return (full.realtorCompanyname=='')?full.propertySource:full.realtorCompanyname;
												return (full.propertySource=='')?full.realtorCompanyname:full.propertySource;
											}
										},
										{
											"aTargets" : [ 17 ],
											"mRender" : function (
													data, type,
													full) {
												return (full.tenantedProperty)?"Y":"N";
											}
										},
										{
											"aTargets" : [ 19 ],
											"mRender" : function (
													data, type,
													full) {
												return '<a href="#property/'+full.propertyid+'">'+full.propertyDisplayId+'</a>';
											}

											

										}

								],
								//----------------------------
								"fnDrawCallback": function () {
									
        							localStorage.setItem('propertySearchPageNum',this.fnPagingInfo().iPage);
        							localStorage.setItem('propertySearchDirection',$("#propertySearchResultsTable").dataTable().fnSettings().aaSorting[0][1]);
        	        				localStorage.setItem('propertySearchColumnIndex',$("#propertySearchResultsTable").dataTable().fnSettings().aaSorting[0][0]);
        	        				localStorage.setItem('propertySearchPageSize',this.fnPagingInfo().iLength);
        	        				localStorage.setItem('propertySearchPageStart',this.fnPagingInfo().iStart);
        	        				localStorage.setItem('propertySearchPageEnd',this.fnPagingInfo().iEnd);
        	        				localStorage.setItem('propertySearchPageTotalRecords',this.fnPagingInfo().iTotal);
    
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
									var start = (paramMap.iDisplayStart>0)?paramMap.iDisplayStart:0;

									var pageNum = (start / pageSize);
									var sortCol = paramMap.iSortCol_0;
									var sortDir = paramMap.sSortDir_0;

									//-000000000000
					            	if (('localStorage' in window) && window['localStorage'] !== null) {
					      			    if ('previousUrl' in localStorage && window.location.hash) {
					      			    	 if(localStorage.getItem('previousUrl').indexOf('property/')>-1){
					      			    		self.previousUrl=localStorage.getItem('previousUrl');
					      			    		sortCol= localStorage.getItem('propertySearchColumnIndex');
					      			    		sortDir=localStorage.getItem('propertySearchDirection');
					      			    		pageNum=localStorage.getItem('propertySearchPageNum');
					      			    		pageSize=localStorage.getItem('propertySearchPageSize');
					      			    		self.pageNumber=pageNum;
					      			    		self.direction=sortDir;
					      			    		self.columnIndex=sortCol;
					      		
					      			    		self.pageStart=localStorage.getItem('propertySearchPageStart');
					      			    		self.pageEnd=localStorage.getItem('propertySearchPageEnd');
			        	        				self.totalRecords=localStorage.getItem('propertySearchPageTotalRecords');
					      			    		 
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
									$("#searchProperty").attr('disabled','disabled');
									$.ajax({
												"dataType" : 'json',
												"contentType" : "application/json",
												"type" : "POST",
												"url" : sSource,
												"data" : JSON.stringify(self.model.attributes),
												"success" : function(
														res) {
													res.iTotalDisplayRecords = res.iTotalRecords;
													fnCallback(res);
													$("#searchProperty").removeAttr('disabled');
												},
												"error" : function(res) {
													 console.log("Failed in investor search View");
													 $("#searchProperty").removeAttr('disabled');
													 $('#generalError').show();
									                 $('#generalError > text').html("Error in searching property information.");
									                 App.scrollTo($('#generalError'), -200);
									                 $('#generalError').delay(2000).fadeOut(2000);
									                 
												}
											});
									}

								});

                     $('select[name=propertySearchResultsTable_length]').addClass('form-control');
			/*$('#propertySearchResultsTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");*/
		},
		/*myAction: function(e){

			var currentTR = $(e.currentTarget).closest('tr');   

			$(".modal-body #address").html(currentTR.find("td").eq(2).text()+',<br>'+currentTR.find("td").eq(3).text()+', '+currentTR.find("td").eq(4).text()+', '+currentTR.find("td").eq(5).text());
			$("#investorRSearch").attr("propertyid",$(e.currentTarget).next().attr("propertyid"));
			$("#investorRSearch").attr("leveragedPerc",($.trim($('input[name=financingType]:checked').val()) == 'financed')?'20':'0');
			$("#investorRSearch").attr("investmentAmt",currentTR.find("td span").attr("invAmt"));
			$(e.target).parents("table").find("tr").removeClass('active');
		},*/
		investorSearch: function(){
			
			var forlname = $.trim($("#investor_fname").val());
			
			if(forlname == ''){
				$('#generalInvestorError').show();
				$('#generalInvestorError > text').html("Investor Name cannot be blank.");
				App.scrollTo($('#generalInvestorError'), -200);
				$('#generalInvestorError').delay(2000).fadeOut(2000);
			}
			else{

				if(!app.invWishlistModel){
		    		app.invWishlistModel = new investorWishlistModel();
		    	}
		    	app.invWishlistModel.set("fname",forlname);

				this.model=app.invWishlistModel;
				this.showInvestorDataTable();
	    	
			}

		},
		showInvestorDataTable : function() {
			var self = this;
			// ----------------------------DataTable
			// start-----------------------------------
			var oTable = $('#investorSearchResultsTable')
					.dataTable(
							{
								"bServerSide" : true,
								'bProcessing' : true,
								"bFilter": false,
								//"scrollY" : "300px",
								//"scrollX" : "100%",
								//"scrollCollapse" : true,
								//"paging" : false,
								"bDestroy" : true,
								"sAjaxSource" : app.context()
										+ '/investors/searchInvestorsRecommendedlist/',
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
											"mData" : "investorName",
											"sTitle" : "Investor Name"
										},
										{
											"mData" : "investorEmail",
											"sTitle" : "Email"
										},
										{
											"mData" : "wpropcnt",
											"sTitle" : "Properties in the List"
										}, {
											"mData" : "investorId",
											"sTitle" : "Select"
										}],

								"aoColumnDefs" : [

										{
											"aTargets" : [ 3 ],
											"bSortable": false,
											"mRender" : function(
													data, type,
													full) {
												return '<input type="checkbox" class="wprop" investorid="'+full.investorId+'">';
											}
										}

								],

								"fnServerData" : function(
										sSource, aoData,
										fnCallback, oSettings) {
									var paramMap = {};
									for (var i = 0; i < aoData.length; i++) {
										paramMap[aoData[i].name] = aoData[i].value;
									}
									var pageSize = oSettings._iDisplayLength;
									var start = (paramMap.iDisplayStart>0)?paramMap.iDisplayStart:0;

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
									$("#investorSearch").attr('disabled','disabled');
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
													$("#investorSearch").removeAttr('disabled');
												},
												"error" : function(res) {
													 console.log("Failed in investor search View");
													 $("#investorSearch").removeAttr('disabled');	
													 $('#generalInvestorError').show();
									                 $('#generalInvestorError > text').html("Error in searching investor information.");
									                 App.scrollTo($('#generalInvestorError'), -200);
									                 $('#generalInvestorError').delay(2000).fadeOut(2000);
									                 
												}
											});
								}

							});
			$('#investorSearchResultsTable_wrapper .table-scrollable').addClass("data-table-popup-overflow");
		},
		addInvestorRecommendedlist: function() {
			var checkedVals = $('.wprop:checkbox:checked').map(function(){
				return $(this).attr("investorid");
			}).get();
		
			if(checkedVals == null || jQuery.isEmptyObject(checkedVals)){	
				$('#generalInvestorError').show();
				$('#generalInvestorError > text').html("No investor has been selected. Please search and select an investor first.");
				App.scrollTo($('#generalInvestorError'), -200);
				$('#generalInvestorError').delay(2000).fadeOut(2000);
			}
			else{
				console.log(this.selectedProp);
				var addInvestorRecommendedlistData = {};
				addInvestorRecommendedlistData.propertyId = this.selectedProp.join(",");
				addInvestorRecommendedlistData.investorIds = checkedVals.join(",");
				addInvestorRecommendedlistData.leveragedPercent = $("#investorRSearch").attr("leveragedPerc");
				addInvestorRecommendedlistData.investmentAmount = $("#investorRSearch").attr("investmentAmt");
				addInvestorRecommendedlistData.userId = app.sessionModel.get("userId");

				if(!app.investorModel){
		    		app.investorModel = new investorModel();
		    	}
		    	app.investorModel.addInvestorRecommendedlist(addInvestorRecommendedlistData,{
					success:function(res){
						
						$('#generalInvestorError').show();
						if(res.statusCode == 200)
							$('#generalInvestorError').removeClass("alert-danger").addClass("alert-success");
						else
							$('#generalInvestorError').removeClass("alert-success").addClass("alert-danger");
						$('#generalInvestorError > text').html(res.message);
						App.scrollTo($('#generalInvestorError'), -200);
						$('#generalInvestorError').delay(2000).fadeOut(2000);
						
						console.log('Successful adding wishlist');
					},
					error:function(res){
						console.log('Error in fetching properties'+res);
					}
				});	
			}		
		},
		keyHandle : function(e){
			if(e.keyCode == 13){
				this.searchProperty();
			}
		},
		keyHandle1 : function(e){
			if(e.keyCode == 13){
				this.investorSearch();
			}
		},
		preSelectClicked : function(){
			$("input#onInvestorPortalOnly").closest('label').toggle();
			$("input#onInvestorPortalOnly").prop("checked",false);
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
		    		    		   $('#propertySearchResultsTable_info').html('Showing '+ pStart +' to '+self.pageEnd+ ' of '+ self.totalRecords +' entries');
		    		    	   }
		    			   }, 500);
		    	  
		       }
		       return;
		},
		propSelected: function(evt){

			if(evt.target.tagName=="TD"){
				this.selectedProp = [];
				var self = this;
				$(evt.target).parent().toggleClass('active');
				$("tr.active").each(function(){
					self.selectedProp.push($('td:first ul',this).attr('propertyid'));
					//console.log($(this).find("td:nth-child(3)").text());
				});
			}
			else if($(evt.target).hasClass("myaction") || $(evt.target).hasClass("fa-gear")){
				this.selectedProp = [];
				this.selectedProp.push($(evt.currentTarget).find("ul").attr("propertyid"));
			}

		},
		addSelected: function(){
			this.selectedProp = [];
			var self = this;
			$("#propertySearchResultsTable tr.active").each(function(){
				self.selectedProp.push($('td:first ul',this).attr('propertyid'));
				//console.log($(this).find("td:nth-child(3)").text());
			});

			if(!app.propertySearchView.propertySearchAddSelectedView){
				app.propertySearchView.propertySearchAddSelectedView = new propertySearchAddSelectedView();
			}
			app.propertySearchView.propertySearchAddSelectedView.render();
			/*if(!app.propertySearchAddSelectedView){
				app.propertySearchAddSelectedView = new propertySearchAddSelectedView();
			}
			app.propertySearchAddSelectedView.render();*/
			//$(".modal-body #address").html(currentTR.find("td").eq(2).text()+',<br>'+currentTR.find("td").eq(3).text()+', '+currentTR.find("td").eq(4).text()+', '+currentTR.find("td").eq(5).text());
			//$("#investorSearch").attr("propertyid",$(e.currentTarget).next().attr("propertyid"));
			//$("#investorSearch").attr("leveragedPerc",($.trim($('input[name=financingType]:checked').val()) == 'financed')?'20':'0');
			//$("#investorSearch").attr("investmentAmt",currentTR.find("td span").attr("invAmt"));

		},
		
		resetDate: function(){
		//	console.log("inside reset date");
			$("input[id$='inventoryDate']").val("");
			
			
		},
		
		clickLink : function (evt) {

			$('#investorWishlistSearchResults').html(
					_.template(investorWishlistResultsTpl)({
						templateData : null
			}));
			$('#investor_fname').val('');

			if(this.selectedProp.length === 0){
				alert("Please choose at least one property to add to the recommended list.");
				evt.stopPropagation();
			}
			else{

				if(!$(evt.target).parent().is("li")){
					if(this.selectedProp.length === 1){
						var currentTR = $("#propertySearchResultsTable tr.active");   

						$(".modal-body #address").html(currentTR.find("td").eq(2).text()+',<br>'+currentTR.find("td").eq(3).text()+', '+currentTR.find("td").eq(4).text()+', '+currentTR.find("td").eq(5).text());
						$("#investorRSearch").attr("propertyid",currentTR.find("ul").attr("propertyid"));
						$("#investorRSearch").attr("leveragedPerc",($.trim($('input[name=financingType]:checked').val()) == 'financed')?'20':'0');
						$("#investorRSearch").attr("investmentAmt",currentTR.find("td span").attr("invAmt"));
						$(evt.target).parents("table").find("tr").removeClass('active');
					}
					else
						$(".modal-body #address").html("Multiple Addresses.");
					

				}
				else{
					var currentTR = $(evt.currentTarget).closest('tr');   

					$(".modal-body #address").html(currentTR.find("td").eq(2).text()+',<br>'+currentTR.find("td").eq(3).text()+', '+currentTR.find("td").eq(4).text()+', '+currentTR.find("td").eq(5).text());
					$("#investorRSearch").attr("propertyid",currentTR.find("ul").attr("propertyid"));
					$("#investorRSearch").attr("leveragedPerc",($.trim($('input[name=financingType]:checked').val()) == 'financed')?'20':'0');
					$("#investorRSearch").attr("investmentAmt",currentTR.find("td span").attr("invAmt"));
					$(evt.target).parents("table").find("tr").removeClass('active');
				}
			}
		},
		toggleCol : function(evt) {
			evt.preventDefault();

			var oTable = $('#propertySearchResultsTable')
					.dataTable();
			console.log(oTable.fnSettings().aoColumns[$(evt.target).attr('data-column')]);
			var bVis = oTable.fnSettings().aoColumns[$(evt.target).attr('data-column')].bVisible;
			oTable.fnSetColumnVis($(evt.target).attr('data-column'),bVis?false:true);
		}

	 });
	 return propertySearchView;
});
